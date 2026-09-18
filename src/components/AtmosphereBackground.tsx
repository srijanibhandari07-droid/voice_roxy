import React from 'react';
import { AtmosphereTheme } from '../types';

interface AtmosphereBackgroundProps {
  theme: AtmosphereTheme;
  isSpeaking: boolean;
  isListening: boolean;
}

export const ATMOSPHERE_THEMES: Record<
  AtmosphereTheme,
  {
    name: string;
    primary: string;
    glow: string;
    accent: string;
    radialFrom: string;
    radialVia: string;
  }
> = {
  'cyber-rose': {
    name: 'Cyber Rose',
    primary: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.25)',
    accent: '#fb7185',
    radialFrom: 'rgba(244, 63, 94, 0.15)',
    radialVia: 'rgba(225, 29, 72, 0.05)',
  },
  'electric-violet': {
    name: 'Electric Violet',
    primary: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.25)',
    accent: '#c084fc',
    radialFrom: 'rgba(168, 85, 247, 0.16)',
    radialVia: 'rgba(126, 34, 206, 0.06)',
  },
  'neon-cyan': {
    name: 'Neon Cyan',
    primary: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.25)',
    accent: '#22d3ee',
    radialFrom: 'rgba(6, 182, 212, 0.15)',
    radialVia: 'rgba(8, 145, 178, 0.05)',
  },
  'midnight-gold': {
    name: 'Midnight Gold',
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    accent: '#fbbf24',
    radialFrom: 'rgba(245, 158, 11, 0.15)',
    radialVia: 'rgba(180, 83, 9, 0.05)',
  },
  'emerald-matrix': {
    name: 'Emerald Matrix',
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.25)',
    accent: '#34d399',
    radialFrom: 'rgba(16, 185, 129, 0.15)',
    radialVia: 'rgba(5, 150, 105, 0.05)',
  },
};

export const AtmosphereBackground: React.FC<AtmosphereBackgroundProps> = ({
  theme,
  isSpeaking,
  isListening,
}) => {
  const currentTheme = ATMOSPHERE_THEMES[theme] || ATMOSPHERE_THEMES['cyber-rose'];

  return (
    <div
      id="atmosphere-background"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none transition-colors duration-1000 z-0 bg-[#06070a]"
    >
      {/* Dynamic ambient radial gradients */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] rounded-full blur-[140px] opacity-60 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${currentTheme.radialFrom} 0%, ${currentTheme.radialVia} 50%, transparent 80%)`,
          transform: `translate(-50%, 0) scale(${isSpeaking ? 1.15 : isListening ? 1.05 : 1})`,
        }}
      />

      {/* Secondary bottom core glow */}
      <div
        className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[90vw] h-[60vh] rounded-full blur-[120px] opacity-40 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${currentTheme.radialFrom} 0%, transparent 70%)`,
        }}
      />

      {/* Center reactive voice aura */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full blur-[90px] transition-all duration-700"
        style={{
          background: currentTheme.glow,
          opacity: isSpeaking ? 0.7 : isListening ? 0.45 : 0.18,
          transform: `translate(-50%, -50%) scale(${isSpeaking ? 1.3 : isListening ? 1.1 : 0.9})`,
        }}
      />

      {/* Subtle futuristic micro-grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};
