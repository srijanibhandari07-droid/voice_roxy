import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Sun, Moon, Zap, Trophy, X, Star } from 'lucide-react';
import { RealTimeWishEvent } from '../types';
import confetti from 'canvas-confetti';

interface RealTimeWishBannerProps {
  wish: RealTimeWishEvent | null;
  onDismiss: () => void;
}

export const RealTimeWishBanner: React.FC<RealTimeWishBannerProps> = ({
  wish,
  onDismiss,
}) => {
  useEffect(() => {
    if (wish) {
      // Trigger subtle golden/pink sparkles confetti
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.2 },
          zIndex: 9999,
          colors: ['#f43f5e', '#ec4899', '#fbbf24', '#a855f7', '#38bdf8'],
        });
      } catch (e) {
        // ignore
      }

      const timer = setTimeout(() => {
        onDismiss();
      }, 8500);
      return () => clearTimeout(timer);
    }
  }, [wish, onDismiss]);

  const getWishIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('morning') || t.includes('sun')) return <Sun className="w-5 h-5 text-amber-400" />;
    if (t.includes('night') || t.includes('evening') || t.includes('sleep')) return <Moon className="w-5 h-5 text-indigo-400" />;
    if (t.includes('luck') || t.includes('interview') || t.includes('exam')) return <Zap className="w-5 h-5 text-cyan-400" />;
    if (t.includes('birthday') || t.includes('anniversary')) return <Heart className="w-5 h-5 text-rose-400" />;
    if (t.includes('success') || t.includes('achievement')) return <Trophy className="w-5 h-5 text-yellow-400" />;
    return <Sparkles className="w-5 h-5 text-pink-400" />;
  };

  return (
    <AnimatePresence>
      {wish && (
        <motion.div
          id="real-time-wish-banner"
          initial={{ opacity: 0, y: -40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg select-none"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-950/95 via-purple-950/90 to-pink-950/95 backdrop-blur-2xl border border-pink-500/40 p-4 sm:p-5 shadow-[0_0_50px_rgba(244,63,94,0.35)]">
            {/* Glowing ambient background glow */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-pink-500/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20 shadow-inner flex items-center justify-center shrink-0">
                  {getWishIcon(wish.wishType)}
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-300 border border-pink-500/40 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-pink-400 text-pink-400" />
                      Roxy's Real-Time Wish
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {new Date(wish.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-white leading-snug tracking-wide">
                    "{wish.message}"
                  </p>

                  <p className="text-[11px] text-pink-300/80 font-medium">
                    Spoken aloud live via Gemini Voice with personalized charm ✨
                  </p>
                </div>
              </div>

              <button
                onClick={onDismiss}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                title="Dismiss"
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
