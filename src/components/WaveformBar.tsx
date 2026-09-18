import React, { useEffect, useState } from 'react';
import { AssistantState, AtmosphereTheme } from '../types';
import { ATMOSPHERE_THEMES } from './AtmosphereBackground';
import { AudioStreamer } from '../services/AudioStreamer';
import { AudioRecorder } from '../services/AudioRecorder';

interface WaveformBarProps {
  state: AssistantState;
  theme: AtmosphereTheme;
  audioStreamer: AudioStreamer;
  audioRecorder: AudioRecorder;
  isMuted: boolean;
}

export const WaveformBar: React.FC<WaveformBarProps> = ({
  state,
  theme,
  audioStreamer,
  audioRecorder,
  isMuted,
}) => {
  const currentTheme = ATMOSPHERE_THEMES[theme] || ATMOSPHERE_THEMES['cyber-rose'];
  const [bars, setBars] = useState<number[]>(new Array(24).fill(10));

  useEffect(() => {
    let animId: number;

    const updateBars = () => {
      const barCount = 24;
      const newBars: number[] = [];

      if (state === 'speaking') {
        const freq = audioStreamer.getFrequencyData();
        const step = Math.floor(freq.length / (barCount * 2));
        for (let i = 0; i < barCount; i++) {
          const val = freq[i * step] || 0;
          // Normalized height in percentage (min 15%, max 100%)
          const height = Math.max(15, Math.min(100, (val / 255) * 100));
          newBars.push(height);
        }
      } else if (state === 'listening' && !isMuted) {
        const volume = audioRecorder.getInputVolume();
        for (let i = 0; i < barCount; i++) {
          // Centered curve pattern with user volume
          const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
          const factor = 1 - distFromCenter * 0.6;
          const randomJitter = Math.random() * 15;
          const height = Math.max(12, Math.min(95, volume * 100 * factor + randomJitter));
          newBars.push(height);
        }
      } else if (state === 'connecting') {
        const now = Date.now() / 150;
        for (let i = 0; i < barCount; i++) {
          const wave = (Math.sin(now + i * 0.4) + 1) * 25 + 15;
          newBars.push(wave);
        }
      } else {
        // idle
        for (let i = 0; i < barCount; i++) {
          newBars.push(10);
        }
      }

      setBars(newBars);
      animId = requestAnimationFrame(updateBars);
    };

    animId = requestAnimationFrame(updateBars);
    return () => cancelAnimationFrame(animId);
  }, [state, audioStreamer, audioRecorder, isMuted]);

  return (
    <div
      id="waveform-container"
      className="flex items-center justify-center gap-1 sm:gap-1.5 h-10 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 shadow-inner"
    >
      {bars.map((height, idx) => (
        <div
          key={idx}
          className="w-1 sm:w-1.5 rounded-full transition-all duration-75"
          style={{
            height: `${height}%`,
            backgroundColor:
              state === 'speaking'
                ? currentTheme.accent
                : state === 'listening'
                ? currentTheme.primary
                : state === 'connecting'
                ? '#f59e0b'
                : '#475569',
            opacity: state === 'disconnected' ? 0.3 : 0.85,
            boxShadow:
              state === 'speaking' || (state === 'listening' && !isMuted)
                ? `0 0 6px ${currentTheme.glow}`
                : 'none',
          }}
        />
      ))}
    </div>
  );
};
