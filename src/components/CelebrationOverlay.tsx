import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { PartyPopper, Sparkles, Trophy, X, Flame } from 'lucide-react';
import { CelebrationEvent } from '../types';

interface CelebrationOverlayProps {
  celebration: CelebrationEvent | null;
  onDismiss: () => void;
}

export const triggerCelebrationConfetti = () => {
  // Fire multi-stage celebratory fireworks
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Cannons from both corners and center
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#ec4899', '#a855f7', '#3b82f6', '#fbbf24'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#f59e0b', '#ec4899', '#6366f1'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    shapes: ['star'],
    colors: ['#ffd700', '#ff69b4', '#00ffff'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#e11d48', '#9333ea', '#22d3ee'],
  });

  // Secondary side bursts
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.65 },
      zIndex: 9999,
      colors: ['#ec4899', '#fbbf24', '#a855f7'],
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.65 },
      zIndex: 9999,
      colors: ['#3b82f6', '#10b981', '#f43f5e'],
    });
  }, 250);
};

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  celebration,
  onDismiss,
}) => {
  useEffect(() => {
    if (celebration) {
      triggerCelebrationConfetti();

      // Play soft celebratory chime using Web Audio API
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
            gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + index * 0.1);
            osc.stop(ctx.currentTime + index * 0.1 + 0.7);
          });
        }
      } catch (e) {
        // AudioContext may be restricted before user gesture
      }

      // Auto dismiss banner after 7 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [celebration, onDismiss]);

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          id="celebration-overlay"
          initial={{ opacity: 0, scale: 0.85, y: -40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl border border-pink-500/40 bg-zinc-950/90 backdrop-blur-xl p-5 shadow-2xl shadow-pink-500/20">
            {/* Ambient glowing radial effect */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-pink-500/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-500/25 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                {celebration.type === 'birthday' ? (
                  <PartyPopper className="w-6 h-6 animate-bounce" />
                ) : celebration.type === 'victory' || celebration.type === 'promotion' ? (
                  <Trophy className="w-6 h-6 text-yellow-300" />
                ) : (
                  <Sparkles className="w-6 h-6 text-cyan-200" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    <Flame className="w-3 h-3 text-pink-400" />
                    Celebration!
                  </span>
                  <span className="text-xs text-zinc-400">Roxy is hyped for you!</span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight truncate">
                  {celebration.title}
                </h3>

                <p className="mt-1 text-sm text-pink-200/90 leading-relaxed font-medium">
                  "{celebration.message}"
                </p>
              </div>

              <button
                id="close-celebration-button"
                onClick={onDismiss}
                className="flex-shrink-0 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Dismiss celebration"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
