/**
 * AudioStreamer handles queuing and gapless playback of 24kHz PCM audio received
 * from Gemini Live API, with real-time AnalyserNode visualization and instant interruption handling.
 */
export class AudioStreamer {
  private audioCtx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private nextStartTime = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private isPlaying = false;
  private onSpeakingChange?: (isSpeaking: boolean) => void;
  private checkInterval: any = null;

  constructor(onSpeakingChange?: (isSpeaking: boolean) => void) {
    this.onSpeakingChange = onSpeakingChange;
  }

  public async init(): Promise<void> {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 24000 });
      
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 1.0;

      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  public addChunk(base64Data: string): void {
    if (!base64Data) return;
    if (!this.audioCtx) {
      this.init();
    }
    if (!this.audioCtx || !this.gainNode) return;

    try {
      // Decode base64 to binary
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 16-bit PCM little-endian to Float32
      const dataView = new DataView(bytes.buffer);
      const numSamples = Math.floor(len / 2);
      const float32Samples = new Float32Array(numSamples);

      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32Samples[i] = int16 / 32768.0;
      }

      // Create AudioBuffer at 24000 Hz
      const audioBuffer = this.audioCtx.createBuffer(1, numSamples, 24000);
      audioBuffer.getChannelData(0).set(float32Samples);

      const sourceNode = this.audioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(this.gainNode);

      const currentTime = this.audioCtx.currentTime;
      // Schedule gapless
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      sourceNode.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.add(sourceNode);

      if (!this.isPlaying) {
        this.isPlaying = true;
        this.onSpeakingChange?.(true);
      }

      sourceNode.onended = () => {
        this.activeSources.delete(sourceNode);
        if (this.activeSources.size === 0 && this.audioCtx) {
          if (this.audioCtx.currentTime >= this.nextStartTime - 0.05) {
            this.isPlaying = false;
            this.onSpeakingChange?.(false);
          }
        }
      };

      // Periodic safety check to transition out of speaking state when queue drains
      if (!this.checkInterval) {
        this.checkInterval = setInterval(() => {
          if (this.isPlaying && this.activeSources.size === 0 && this.audioCtx) {
            if (this.audioCtx.currentTime >= this.nextStartTime - 0.02) {
              this.isPlaying = false;
              this.onSpeakingChange?.(false);
              clearInterval(this.checkInterval);
              this.checkInterval = null;
            }
          }
        }, 100);
      }
    } catch (err) {
      console.error('[AudioStreamer] Error processing audio chunk:', err);
    }
  }

  public interrupt(): void {
    // Stop all active/scheduled playback immediately
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source might already have ended
      }
    }
    this.activeSources.clear();

    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    } else {
      this.nextStartTime = 0;
    }

    if (this.isPlaying) {
      this.isPlaying = false;
      this.onSpeakingChange?.(false);
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyserNode.fftSize);
    this.analyserNode.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  public getAverageVolume(): number {
    if (!this.isPlaying || !this.analyserNode) return 0;
    const data = this.getFrequencyData();
    if (data.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return (sum / data.length) / 255;
  }

  public setVolume(volume: number): void {
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioCtx.currentTime);
    }
  }

  public close(): void {
    this.interrupt();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch (e) {
        console.error('[AudioStreamer] Error closing AudioContext:', e);
      }
    }
    this.audioCtx = null;
    this.analyserNode = null;
    this.gainNode = null;
  }
}
