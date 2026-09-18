import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Power, Radio, Sparkles } from 'lucide-react';
import { AssistantState, AtmosphereTheme } from '../types';
import { ATMOSPHERE_THEMES } from './AtmosphereBackground';
import { AudioStreamer } from '../services/AudioStreamer';
import { AudioRecorder } from '../services/AudioRecorder';

interface OrbVisualizerProps {
  state: AssistantState;
  theme: AtmosphereTheme;
  audioStreamer: AudioStreamer;
  audioRecorder: AudioRecorder;
  isMuted: boolean;
  onTogglePower: () => void;
  onInterrupt: () => void;
}

export const OrbVisualizer: React.FC<OrbVisualizerProps> = ({
  state,
  theme,
  audioStreamer,
  audioRecorder,
  isMuted,
  onTogglePower,
  onInterrupt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentTheme = ATMOSPHERE_THEMES[theme] || ATMOSPHERE_THEMES['cyber-rose'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotation = 0;
    let pulsePhase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.32;

      ctx.clearRect(0, 0, width, height);

      rotation += 0.01;
      pulsePhase += 0.03;

      let energy = 0;
      let frequencyData: Uint8Array = new Uint8Array(0);

      if (state === 'speaking') {
        frequencyData = audioStreamer.getFrequencyData();
        energy = audioStreamer.getAverageVolume();
      } else if (state === 'listening' && !isMuted) {
        energy = audioRecorder.getInputVolume();
        frequencyData = audioRecorder.getWaveformData();
      } else if (state === 'connecting') {
        energy = 0.4 + Math.sin(pulsePhase * 3) * 0.2;
      } else {
        // idle/disconnected gentle breathing
        energy = 0.1 + Math.sin(pulsePhase) * 0.05;
      }

      // 1. Draw outer reactive halo
      const haloRadius = baseRadius + energy * 45;
      const haloGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.8,
        centerX,
        centerY,
        haloRadius + 40
      );
      haloGrad.addColorStop(0, currentTheme.glow);
      haloGrad.addColorStop(0.7, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, haloRadius + 40, 0, Math.PI * 2);
      ctx.fill();

      // 2. If speaking, draw radial frequency rays
      if (state === 'speaking' && frequencyData.length > 0) {
        const numRays = 48;
        const step = (Math.PI * 2) / numRays;
        ctx.lineWidth = 2.5;

        for (let i = 0; i < numRays; i++) {
          const angle = i * step + rotation;
          const dataIndex = Math.floor((i / numRays) * (frequencyData.length / 2));
          const val = frequencyData[dataIndex] || 0;
          const rayLength = 6 + (val / 255) * 45;

          const x1 = centerX + Math.cos(angle) * (baseRadius + 2);
          const y1 = centerY + Math.sin(angle) * (baseRadius + 2);
          const x2 = centerX + Math.cos(angle) * (baseRadius + 2 + rayLength);
          const y2 = centerY + Math.sin(angle) * (baseRadius + 2 + rayLength);

          const alpha = 0.3 + (val / 255) * 0.7;
          ctx.strokeStyle = currentTheme.accent;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }

      // 3. If listening, draw responsive ripples based on user's voice
      if (state === 'listening') {
        const numRipples = 3;
        for (let r = 0; r < numRipples; r++) {
          const rippleOffset = (pulsePhase * 20 + r * 25) % 50;
          const rippleRadius = baseRadius + 5 + rippleOffset + energy * 30;
          const rippleAlpha = Math.max(0, 0.4 - rippleOffset / 60);

          ctx.strokeStyle = currentTheme.primary;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = rippleAlpha;
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }

      // 4. Draw energetic orbiting arcs
      const orbitArcs = [
        { radius: baseRadius + 14, speed: 1, length: 1.2, width: 2 },
        { radius: baseRadius + 22, speed: -1.4, length: 0.8, width: 1.5 },
      ];

      orbitArcs.forEach((arc) => {
        const start = rotation * arc.speed;
        const end = start + Math.PI * arc.length;
        ctx.strokeStyle = currentTheme.accent;
        ctx.lineWidth = arc.width;
        ctx.globalAlpha = state === 'disconnected' ? 0.2 : 0.6 + energy * 0.4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, arc.radius, start, end);
        ctx.stroke();
      });
      ctx.globalAlpha = 1.0;

      // 5. Draw inner sphere core gradient
      const coreRadius = baseRadius - 4;
      const coreGrad = ctx.createRadialGradient(
        centerX - coreRadius * 0.3,
        centerY - coreRadius * 0.3,
        coreRadius * 0.1,
        centerX,
        centerY,
        coreRadius
      );

      if (state === 'speaking') {
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, currentTheme.accent);
        coreGrad.addColorStop(0.7, currentTheme.primary);
        coreGrad.addColorStop(1, '#090b14');
      } else if (state === 'listening') {
        coreGrad.addColorStop(0, currentTheme.accent);
        coreGrad.addColorStop(0.4, currentTheme.primary);
        coreGrad.addColorStop(0.85, '#0a0d18');
        coreGrad.addColorStop(1, '#05070d');
      } else if (state === 'connecting') {
        coreGrad.addColorStop(0, '#fef08a');
        coreGrad.addColorStop(0.4, currentTheme.primary);
        coreGrad.addColorStop(1, '#080a12');
      } else {
        // disconnected
        coreGrad.addColorStop(0, '#334155');
        coreGrad.addColorStop(0.5, '#1e293b');
        coreGrad.addColorStop(1, '#090d16');
      }

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core border glow
      ctx.strokeStyle = currentTheme.primary;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = state === 'disconnected' ? 0.3 : 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [state, theme, audioStreamer, audioRecorder, isMuted, currentTheme]);

  const handleOrbClick = () => {
    if (state === 'disconnected') {
      onTogglePower();
    } else if (state === 'speaking') {
      // User tapped while Roxy is speaking: quick interrupt!
      onInterrupt();
    } else if (state === 'listening') {
      // If listening, tapping can interrupt or disconnect if long press
      // Let's toggle power or handle smoothly
      onTogglePower();
    } else {
      onTogglePower();
    }
  };

  return (
    <div id="orb-visualizer-container" className="relative flex flex-col items-center justify-center my-auto">
      {/* Outer interactive touch target wrapper */}
      <div className="relative group cursor-pointer" onClick={handleOrbClick}>
        {/* Canvas for real-time Web Audio API render */}
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] transition-transform duration-300 group-hover:scale-105 active:scale-95"
        />

        {/* Central interactive icon button overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center backdrop-blur-md transition-all duration-300 shadow-2xl border ${
              state === 'speaking'
                ? 'bg-black/50 border-white/40 scale-105'
                : state === 'listening'
                ? 'bg-black/40 border-cyan-400/50'
                : state === 'connecting'
                ? 'bg-black/40 border-amber-400/50 animate-pulse'
                : 'bg-black/60 border-white/10'
            }`}
            style={{
              boxShadow:
                state === 'speaking'
                  ? `0 0 35px ${currentTheme.primary}`
                  : state === 'listening'
                  ? `0 0 25px ${currentTheme.glow}`
                  : 'none',
            }}
          >
            {state === 'disconnected' && (
              <Power className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 transition-transform group-hover:scale-110" />
            )}
            {state === 'connecting' && (
              <Radio className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 animate-spin" />
            )}
            {state === 'listening' && (
              isMuted ? (
                <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-pulse" />
              ) : (
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 animate-pulse" />
              )
            )}
            {state === 'speaking' && (
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-bounce" />
            )}
          </div>
        </div>
      </div>

      {/* State label & user interaction cues */}
      <div className="mt-6 flex flex-col items-center text-center select-none">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              state === 'speaking'
                ? 'bg-rose-400 animate-ping'
                : state === 'listening'
                ? 'bg-cyan-400 animate-pulse'
                : state === 'connecting'
                ? 'bg-amber-400 animate-ping'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-xs tracking-wider uppercase font-semibold text-slate-300 font-mono">
            {state === 'disconnected' && 'Tap Orb to Wake Roxy'}
            {state === 'connecting' && 'Connecting to Roxy...'}
            {state === 'listening' && (isMuted ? 'Microphone Muted' : 'Roxy is listening...')}
            {state === 'speaking' && 'Roxy is speaking (Tap to interrupt)'}
          </span>
        </div>

        {/* Dynamic subtext */}
        <p className="text-sm text-slate-400/80 mt-1 max-w-xs font-light">
          {state === 'disconnected' && 'Real-time, audio-to-audio conversation with zero delay.'}
          {state === 'connecting' && 'Initializing 16kHz stream & 24kHz neural voice...'}
          {state === 'listening' && (isMuted ? 'Unmute microphone below to speak.' : 'Speak casually — Roxy replies instantly in full voice.')}
          {state === 'speaking' && 'Tap anywhere on the orb or button to cut in anytime.'}
        </p>
      </div>
    </div>
  );
};
