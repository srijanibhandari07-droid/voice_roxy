import {
  AssistantState,
  CelebrationEvent,
  LiveServerMessage,
  RealTimeWishEvent,
  SpecialOccasion,
  ToolCallEvent,
  VoiceOption,
} from '../types';
import { AudioRecorder } from './AudioRecorder';
import { AudioStreamer } from './AudioStreamer';

export interface LiveSessionCallbacks {
  onStateChange: (state: AssistantState) => void;
  onError: (errorMsg: string) => void;
  onToolCall: (toolEvent: ToolCallEvent) => void;
  onCelebration?: (celebration: CelebrationEvent) => void;
  onRememberOccasion?: (occasion: SpecialOccasion) => void;
  onWish?: (wish: RealTimeWishEvent) => void;
  onStatusMessage?: (msg: string) => void;
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private audioStreamer: AudioStreamer;
  private audioRecorder: AudioRecorder;
  private callbacks: LiveSessionCallbacks;
  private currentState: AssistantState = 'disconnected';
  private selectedVoice: VoiceOption = 'Aoede';
  private selectedLanguage: string = 'auto';
  private storedOccasions: SpecialOccasion[] = [];
  private userName: string = 'Srijani';
  private reconnectAttempts = 0;
  private isIntentionalDisconnect = false;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;

    // Create AudioStreamer with speaking status feedback
    this.audioStreamer = new AudioStreamer((isSpeaking) => {
      if (this.currentState === 'disconnected' || this.currentState === 'connecting') return;
      if (isSpeaking) {
        this.updateState('speaking');
      } else {
        this.updateState('listening');
      }
    });

    // Create AudioRecorder with audio streaming callback
    this.audioRecorder = new AudioRecorder((base64Pcm16) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'audio',
            data: base64Pcm16,
          })
        );
      }
    });
  }

  public getStreamer(): AudioStreamer {
    return this.audioStreamer;
  }

  public getRecorder(): AudioRecorder {
    return this.audioRecorder;
  }

  public getState(): AssistantState {
    return this.currentState;
  }

  public setVoice(voice: VoiceOption): void {
    this.selectedVoice = voice;
  }

  public getVoice(): VoiceOption {
    return this.selectedVoice;
  }

  public setLanguage(langCode: string): void {
    this.selectedLanguage = langCode;
  }

  public getLanguage(): string {
    return this.selectedLanguage;
  }

  public setOccasions(occasions: SpecialOccasion[]): void {
    this.storedOccasions = occasions;
  }

  public setUserName(name: string): void {
    if (name.trim()) {
      this.userName = name.trim();
    }
  }

  public getUserName(): string {
    return this.userName;
  }

  private updateState(newState: AssistantState): void {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.callbacks.onStateChange(newState);
    }
  }

  public async connect(): Promise<void> {
    if (this.currentState === 'connecting' || this.currentState === 'listening' || this.currentState === 'speaking') {
      return;
    }

    this.isIntentionalDisconnect = false;
    this.updateState('connecting');

    try {
      // 1. Initialize playback context
      await this.audioStreamer.init();

      // 2. Request mic permission and start recording
      await this.audioRecorder.start();

      // 3. Establish WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live`;
      console.log('[LiveSession] Connecting to WebSocket:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[LiveSession] WebSocket open. Sending start request with real-time context...');
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        let userTimeFormatted = '';
        try {
          userTimeFormatted = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: userTz,
          }).format(new Date());
        } catch {
          userTimeFormatted = new Date().toLocaleString();
        }

        this.ws?.send(
          JSON.stringify({
            type: 'start',
            voice: this.selectedVoice,
            language: this.selectedLanguage,
            occasions: this.storedOccasions,
            userName: this.userName,
            clientTimeZone: userTz,
            clientTimeFormatted: userTimeFormatted,
            clientTime: new Date().toISOString(),
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: LiveServerMessage = JSON.parse(event.data);

          switch (msg.type) {
            case 'status':
              if (msg.state === 'listening') {
                this.updateState('listening');
                this.callbacks.onStatusMessage?.(msg.message || 'Roxy is active and listening');
              } else if (msg.state === 'connecting') {
                this.updateState('connecting');
                this.callbacks.onStatusMessage?.(msg.message || 'Connecting to Roxy...');
              } else if (msg.state === 'disconnected') {
                this.disconnect();
              }
              break;

            case 'audio':
              if (msg.data) {
                this.audioStreamer.addChunk(msg.data);
              }
              break;

            case 'interrupted':
              console.log('[LiveSession] Model interrupted. Stopping current audio playback.');
              this.audioStreamer.interrupt();
              this.updateState('listening');
              break;

            case 'turnComplete':
              // Model turn complete
              break;

            case 'wish':
              if (msg.message) {
                this.callbacks.onWish?.({
                  id: msg.id || String(Date.now()),
                  wishType: msg.wishType || 'wish',
                  message: msg.message,
                  timestamp: Date.now(),
                });
              }
              break;

            case 'toolCall':
              if (msg.name && msg.id) {
                const toolEvent: ToolCallEvent = {
                  id: msg.id,
                  name: msg.name,
                  args: msg.args || {},
                  timestamp: Date.now(),
                  completed: true,
                };
                this.callbacks.onToolCall(toolEvent);
                this.handleBrowserAction(toolEvent);
              }
              break;

            case 'error':
              console.error('[LiveSession] Server error:', msg.message);
              this.callbacks.onError(msg.message || 'Gemini Live encountered an error');
              this.disconnect();
              break;
          }
        } catch (err) {
          console.error('[LiveSession] Error parsing message:', err);
        }
      };

      this.ws.onerror = (event) => {
        console.error('[LiveSession] WebSocket error:', event);
        this.callbacks.onError('Connection error to voice server');
        this.disconnect();
      };

      this.ws.onclose = () => {
        console.log('[LiveSession] WebSocket closed');
        if (!this.isIntentionalDisconnect) {
          this.disconnect();
        }
      };
    } catch (err: any) {
      console.error('[LiveSession] Connect failed:', err);
      this.callbacks.onError(err?.message || 'Could not access microphone or connect to voice session');
      this.disconnect();
    }
  }

  private handleBrowserAction(toolEvent: ToolCallEvent): void {
    if (toolEvent.name === 'openWebsite' && toolEvent.args?.url) {
      const targetUrl = toolEvent.args.url.trim();
      try {
        const fullUrl = targetUrl.startsWith('http://') || targetUrl.startsWith('https://')
          ? targetUrl
          : `https://${targetUrl}`;

        // Instant direct execution then and there without waiting for permission:
        const win = window.open(fullUrl, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          // Fallback DOM anchor click for pop-up bypass
          const link = document.createElement('a');
          link.href = fullUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (e) {
        console.error('[LiveSession] Could not auto-open url immediately:', e);
      }
    } else if (toolEvent.name === 'celebrateSuccess') {
      const celebration: CelebrationEvent = {
        id: toolEvent.id,
        title: toolEvent.args?.title || 'Special Celebration!',
        message: toolEvent.args?.cheerMessage || 'Woohoo! Celebrating your big moment!',
        type: toolEvent.args?.occasionType || 'achievement',
        timestamp: Date.now(),
      };
      this.callbacks.onCelebration?.(celebration);
    } else if (toolEvent.name === 'rememberSpecialOccasion') {
      const newOccasion: SpecialOccasion = {
        id: toolEvent.id || String(Date.now()),
        title: toolEvent.args?.title || 'Special Day',
        date: toolEvent.args?.date || 'Upcoming',
        type: toolEvent.args?.occasionType || 'milestone',
        notes: toolEvent.args?.notes || '',
        createdAt: Date.now(),
      };
      this.callbacks.onRememberOccasion?.(newOccasion);
    } else if (toolEvent.name === 'wishUser') {
      const wish: RealTimeWishEvent = {
        id: toolEvent.id,
        wishType: toolEvent.args?.wishType || 'wish',
        message: toolEvent.args?.message || 'Wishing you the absolute best!',
        timestamp: Date.now(),
      };
      this.callbacks.onWish?.(wish);
    }
  }

  public requestGreeting(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'requestGreeting',
          userName: this.userName,
        })
      );
    }
  }

  public requestWish(wishType: string = 'good_luck'): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'requestWish',
          wishType,
          userName: this.userName,
        })
      );
    }
  }

  public interruptCurrentAudio(): void {
    this.audioStreamer.interrupt();
    this.updateState('listening');
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'interrupt' }));
    }
  }

  public toggleMute(): boolean {
    return this.audioRecorder.toggleMute();
  }

  public isMuted(): boolean {
    return this.audioRecorder.getIsMuted();
  }

  public disconnect(): void {
    this.isIntentionalDisconnect = true;
    this.audioStreamer.interrupt();
    this.audioRecorder.stop();

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'stop' }));
          this.ws.close();
        } catch {
          // ignore
        }
      }
      this.ws = null;
    }

    this.updateState('disconnected');
  }
}

