import React, { useState, useEffect } from 'react';
import { Sparkles, Radio, Zap, Clock, Heart, Wand2 } from 'lucide-react';
import { AssistantState, AtmosphereTheme } from '../types';
import { ATMOSPHERE_THEMES } from './AtmosphereBackground';

interface PersonaBadgeProps {
  state: AssistantState;
  theme: AtmosphereTheme;
  userName: string;
  onUpdateUserName: (name: string) => void;
  onOpenInfo: () => void;
  onRequestGreeting: () => void;
  onRequestWish: (wishType?: string) => void;
}

export const PersonaBadge: React.FC<PersonaBadgeProps> = ({
  state,
  theme,
  userName,
  onUpdateUserName,
  onOpenInfo,
  onRequestGreeting,
  onRequestWish,
}) => {
  const currentTheme = ATMOSPHERE_THEMES[theme] || ATMOSPHERE_THEMES['cyber-rose'];

  // Real-time ticking clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateFormatted = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const isConnected = state === 'listening' || state === 'speaking';

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header id="persona-header" className="w-full max-w-2xl mx-auto px-3 sm:px-4 pt-3 sm:pt-5 z-20 select-none">
      <div className="flex flex-col gap-2.5">
        {/* Main top row */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Identity & User Name */}
          <div className="flex items-center gap-2.5">
            <div
              onClick={onOpenInfo}
              className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.primary}, #0f172a)`,
                boxShadow: `0 0 15px ${currentTheme.glow}`,
              }}
              title="Click to view Roxy's persona & capabilities"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white font-['Outfit']">
                  ROXY
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                  Live Voice
                </span>

                {/* Personalized User Name Tag */}
                {isEditingName ? (
                  <div className="flex items-center gap-1 ml-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      onBlur={handleSaveName}
                      autoFocus
                      className="text-xs bg-zinc-900 border border-pink-500/50 rounded px-1.5 py-0.5 text-pink-200 outline-none w-20"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTempName(userName);
                      setIsEditingName(true);
                    }}
                    className="text-[11px] font-medium text-pink-300/90 hover:text-pink-200 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-full border border-white/10 transition-colors flex items-center gap-1"
                    title="Click to edit your name so Roxy greets you personally"
                  >
                    <span>for {userName}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                <span>Witty • Sassy • Real-Time Voice</span>
              </div>
            </div>
          </div>

          {/* Real-time Clock & Live State */}
          <div className="flex items-center gap-2">
            {/* Live Ticking Real-Time Clock */}
            <div
              id="live-clock-badge"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/70 border border-white/10 text-[11px] font-mono text-zinc-300 backdrop-blur-md shadow-sm"
              title="Real-time synchronized clock with Gemini Live"
            >
              <Clock className="w-3 h-3 text-cyan-400 animate-spin-slow" />
              <span>{dateFormatted}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-cyan-300 font-semibold">{timeFormatted}</span>
            </div>

            {/* Connection / Speaking state pill */}
            <div
              id="live-connection-badge"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-xs font-semibold font-mono backdrop-blur-md transition-all ${
                state === 'speaking'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : state === 'listening'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : state === 'connecting'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-900/60 text-zinc-400 border-white/10'
              }`}
            >
              <Radio
                className={`w-3 h-3 ${
                  state === 'speaking' || state === 'listening' ? 'animate-pulse' : ''
                }`}
              />
              <span className="capitalize">{state}</span>
            </div>
          </div>
        </div>

        {/* Real-Time Greeting & Wish Action Bar */}
        <div className="flex items-center justify-between bg-zinc-950/50 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-1.5 text-xs text-zinc-300 shadow-sm gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-medium hidden xs:inline">Real-time sync:</span>
            <span className="text-cyan-300 font-semibold">{timeFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Greet Me button */}
            <button
              id="quick-greet-btn"
              onClick={onRequestGreeting}
              disabled={!isConnected}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all active:scale-95 ${
                isConnected
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 border border-pink-500/30 hover:bg-pink-500/30'
                  : 'bg-white/5 text-zinc-500 border border-white/5 cursor-not-allowed'
              }`}
              title={isConnected ? 'Tell Roxy to greet you live!' : 'Wake Roxy first to get real-time greetings'}
            >
              <Wand2 className="w-3 h-3 text-pink-400" />
              <span>Greet Me</span>
            </button>

            {/* Wish Me button */}
            <button
              id="quick-wish-btn"
              onClick={() => onRequestWish('good_luck')}
              disabled={!isConnected}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all active:scale-95 ${
                isConnected
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-white/5 text-zinc-500 border border-white/5 cursor-not-allowed'
              }`}
              title={isConnected ? 'Tell Roxy to give you a sassy real-time wish!' : 'Wake Roxy first to get real-time wishes'}
            >
              <Heart className="w-3 h-3 text-rose-400" />
              <span>Wish Me!</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
