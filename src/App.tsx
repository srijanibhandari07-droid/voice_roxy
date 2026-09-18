import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AssistantState,
  AtmosphereTheme,
  CelebrationEvent,
  RealTimeWishEvent,
  SpecialOccasion,
  ToolCallEvent,
  VoiceOption,
} from './types';
import { LiveSession } from './services/LiveSession';
import { AtmosphereBackground } from './components/AtmosphereBackground';
import { PersonaBadge } from './components/PersonaBadge';
import { OrbVisualizer } from './components/OrbVisualizer';
import { WaveformBar } from './components/WaveformBar';
import { Controls } from './components/Controls';
import { QuickPrompts } from './components/QuickPrompts';
import { ToolToast } from './components/ToolToast';
import { PersonaModal } from './components/PersonaModal';
import { CelebrationOverlay, triggerCelebrationConfetti } from './components/CelebrationOverlay';
import { RealTimeWishBanner } from './components/RealTimeWishBanner';
import { SpecialOccasionsModal } from './components/SpecialOccasionsModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

const INITIAL_OCCASIONS: SpecialOccasion[] = [
  {
    id: 'occ-1',
    title: "Srijani's Special Day",
    date: 'October 14th',
    type: 'birthday',
    notes: 'Favorite celebration day!',
    createdAt: Date.now() - 1000000,
  },
  {
    id: 'occ-2',
    title: 'Milestone Victory Day',
    date: 'Every Success Day',
    type: 'milestone',
    notes: 'Pop confetti whenever a big victory or goal is reached!',
    createdAt: Date.now() - 500000,
  },
];

export default function App() {
  const [state, setState] = useState<AssistantState>('disconnected');
  const [theme, setTheme] = useState<AtmosphereTheme>('cyber-rose');
  const [voice, setVoice] = useState<VoiceOption>('Aoede');
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('roxy_user_name') || 'Srijani';
  });
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('roxy_language_preference') || 'auto';
  });
  const [occasions, setOccasions] = useState<SpecialOccasion[]>(() => {
    try {
      const saved = localStorage.getItem('roxy_special_occasions_v1');
      return saved ? JSON.parse(saved) : INITIAL_OCCASIONS;
    } catch {
      return INITIAL_OCCASIONS;
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolCallEvent | null>(null);
  const [activeCelebration, setActiveCelebration] = useState<CelebrationEvent | null>(null);
  const [activeWish, setActiveWish] = useState<RealTimeWishEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isOccasionsOpen, setIsOccasionsOpen] = useState(false);

  // Maintain stable LiveSession instance across renders
  const sessionRef = useRef<LiveSession | null>(null);

  // Sync occasions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('roxy_special_occasions_v1', JSON.stringify(occasions));
      sessionRef.current?.setOccasions(occasions);
    } catch (e) {
      console.error('Failed to save occasions:', e);
    }
  }, [occasions]);

  // Sync language to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('roxy_language_preference', language);
      sessionRef.current?.setLanguage(language);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  }, [language]);

  // Sync userName to session
  useEffect(() => {
    sessionRef.current?.setUserName(userName);
  }, [userName]);

  const handleToolCall = useCallback((toolEvent: ToolCallEvent) => {
    setActiveTool(toolEvent);

    // Auto-apply atmosphere mood if tool requested
    if (toolEvent.name === 'setAtmosphereMood' && toolEvent.args?.mood) {
      const moodVal = toolEvent.args.mood.toLowerCase();
      if (
        moodVal === 'cyber-rose' ||
        moodVal === 'electric-violet' ||
        moodVal === 'neon-cyan' ||
        moodVal === 'midnight-gold' ||
        moodVal === 'emerald-matrix'
      ) {
        setTheme(moodVal as AtmosphereTheme);
      }
    }

    // Auto-dismiss tool toast after 7s
    setTimeout(() => {
      setActiveTool((current) => (current?.id === toolEvent.id ? null : current));
    }, 7000);
  }, []);

  const handleCelebration = useCallback((celebration: CelebrationEvent) => {
    setActiveCelebration(celebration);
  }, []);

  const handleWish = useCallback((wish: RealTimeWishEvent) => {
    setActiveWish(wish);
  }, []);

  const handleRememberOccasion = useCallback((newOccasion: SpecialOccasion) => {
    setOccasions((prev) => {
      // Avoid exact duplicates
      const exists = prev.some(
        (o) => o.title.toLowerCase() === newOccasion.title.toLowerCase()
      );
      if (exists) return prev;
      return [newOccasion, ...prev];
    });
  }, []);

  useEffect(() => {
    const session = new LiveSession({
      onStateChange: (newState) => {
        setState(newState);
        if (newState !== 'error') {
          setErrorMessage(null);
        }
      },
      onError: (err) => {
        setErrorMessage(err);
      },
      onToolCall: handleToolCall,
      onCelebration: handleCelebration,
      onRememberOccasion: handleRememberOccasion,
      onWish: handleWish,
    });

    session.setVoice(voice);
    session.setLanguage(language);
    session.setOccasions(occasions);
    session.setUserName(userName);

    sessionRef.current = session;

    return () => {
      session.disconnect();
    };
  }, [handleToolCall, handleCelebration, handleRememberOccasion, handleWish]);

  const handleTogglePower = () => {
    const session = sessionRef.current;
    if (!session) return;

    if (state === 'disconnected') {
      setErrorMessage(null);
      session.setVoice(voice);
      session.setLanguage(language);
      session.setOccasions(occasions);
      session.setUserName(userName);
      session.connect();
    } else {
      session.disconnect();
    }
  };

  const handleToggleMute = () => {
    const session = sessionRef.current;
    if (!session) return;
    const muted = session.toggleMute();
    setIsMuted(muted);
  };

  const handleInterrupt = () => {
    const session = sessionRef.current;
    if (!session) return;
    session.interruptCurrentAudio();
  };

  const handleRequestGreeting = useCallback(() => {
    sessionRef.current?.requestGreeting();
  }, []);

  const handleRequestWish = useCallback((wishType: string = 'good_luck') => {
    sessionRef.current?.requestWish(wishType);
  }, []);

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    try {
      localStorage.setItem('roxy_user_name', newName);
    } catch {}
    sessionRef.current?.setUserName(newName);
  };

  const handleChangeVoice = (newVoice: VoiceOption) => {
    setVoice(newVoice);
    const session = sessionRef.current;
    if (session) {
      session.setVoice(newVoice);
      // If currently connected, reconnect with new voice
      if (state === 'listening' || state === 'speaking') {
        session.disconnect();
        setTimeout(() => {
          session.setVoice(newVoice);
          session.connect();
        }, 300);
      }
    }
  };

  const handleChangeLanguage = (newLang: string) => {
    setLanguage(newLang);
    const session = sessionRef.current;
    if (session) {
      session.setLanguage(newLang);
      // If currently connected, reconnect smoothly to set new language
      if (state === 'listening' || state === 'speaking') {
        session.disconnect();
        setTimeout(() => {
          session.setLanguage(newLang);
          session.connect();
        }, 350);
      }
    }
  };

  const handleAddOccasion = (data: Omit<SpecialOccasion, 'id' | 'createdAt'>) => {
    const newOccasion: SpecialOccasion = {
      id: `occ-${Date.now()}`,
      createdAt: Date.now(),
      ...data,
    };
    setOccasions((prev) => [newOccasion, ...prev]);
  };

  const handleDeleteOccasion = (id: string) => {
    setOccasions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleTriggerManualCelebrate = (occasion: SpecialOccasion) => {
    triggerCelebrationConfetti();
    setActiveCelebration({
      id: `manual-${Date.now()}`,
      title: `Celebrating ${occasion.title}!`,
      message: `Roxy is raising a glass to you! Let's celebrate this wonderful moment!`,
      type: occasion.type,
      timestamp: Date.now(),
    });
  };

  const streamer = sessionRef.current?.getStreamer();
  const recorder = sessionRef.current?.getRecorder();

  return (
    <div
      id="app-root"
      className="relative flex flex-col justify-between w-full h-screen min-h-screen overflow-hidden text-zinc-100 bg-[#06070a] font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Dynamic Futuristic Atmospheric Backdrop */}
      <AtmosphereBackground
        theme={theme}
        isSpeaking={state === 'speaking'}
        isListening={state === 'listening'}
      />

      {/* Top Header & Persona Badge */}
      <PersonaBadge
        state={state}
        theme={theme}
        userName={userName}
        onUpdateUserName={handleUpdateUserName}
        onOpenInfo={() => setIsInfoOpen(true)}
        onRequestGreeting={handleRequestGreeting}
        onRequestWish={handleRequestWish}
      />

      {/* Error / Alert banner if mic denied or connection dropped */}
      {errorMessage && (
        <div
          id="error-banner"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-rose-950/90 backdrop-blur-md border border-rose-500/40 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 text-rose-200 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleTogglePower}
            className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Central Visualizer Section */}
      <main id="main-stage" className="flex-1 flex flex-col items-center justify-center relative z-10 my-auto px-4">
        {streamer && recorder && (
          <OrbVisualizer
            state={state}
            theme={theme}
            audioStreamer={streamer}
            audioRecorder={recorder}
            isMuted={isMuted}
            onTogglePower={handleTogglePower}
            onInterrupt={handleInterrupt}
          />
        )}

        {/* Real-time Waveform Spectrum Bar */}
        <div className="mt-4">
          {streamer && recorder && (
            <WaveformBar
              state={state}
              theme={theme}
              audioStreamer={streamer}
              audioRecorder={recorder}
              isMuted={isMuted}
            />
          )}
        </div>
      </main>

      {/* Spoken Prompts Inspiration (visible when idle or listening) */}
      <QuickPrompts state={state} />

      {/* Bottom Controls Bar */}
      <Controls
        state={state}
        isMuted={isMuted}
        theme={theme}
        voice={voice}
        language={language}
        onTogglePower={handleTogglePower}
        onToggleMute={handleToggleMute}
        onInterrupt={handleInterrupt}
        onChangeTheme={(t) => setTheme(t)}
        onChangeVoice={handleChangeVoice}
        onChangeLanguage={handleChangeLanguage}
        onOpenOccasions={() => setIsOccasionsOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
      />

      {/* Instant Action Tool Execution Toast */}
      <ToolToast toolEvent={activeTool} onClose={() => setActiveTool(null)} />

      {/* Celebration Confetti & Banner Overlay */}
      <CelebrationOverlay
        celebration={activeCelebration}
        onDismiss={() => setActiveCelebration(null)}
      />

      {/* Real-time Personalized Wish Banner Overlay */}
      <RealTimeWishBanner
        wish={activeWish}
        onDismiss={() => setActiveWish(null)}
      />

      {/* Special Occasions & Celebrations Memory Modal */}
      <SpecialOccasionsModal
        isOpen={isOccasionsOpen}
        onClose={() => setIsOccasionsOpen(false)}
        occasions={occasions}
        onAddOccasion={handleAddOccasion}
        onDeleteOccasion={handleDeleteOccasion}
        onTriggerCelebrate={handleTriggerManualCelebrate}
      />

      {/* Persona & Tech Specs Modal */}
      <PersonaModal
        isOpen={isInfoOpen}
        theme={theme}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
}
