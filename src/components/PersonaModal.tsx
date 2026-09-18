import React from 'react';
import { X, Sparkles, Zap, Cpu, MessageCircleHeart, Globe2 } from 'lucide-react';
import { AtmosphereTheme } from '../types';
import { ATMOSPHERE_THEMES } from './AtmosphereBackground';

interface PersonaModalProps {
  isOpen: boolean;
  theme: AtmosphereTheme;
  onClose: () => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({ isOpen, theme, onClose }) => {
  if (!isOpen) return null;
  const currentTheme = ATMOSPHERE_THEMES[theme] || ATMOSPHERE_THEMES['cyber-rose'];

  return (
    <div
      id="persona-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="persona-modal"
        className="relative w-full max-w-lg bg-slate-900/95 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: currentTheme.glow }}
        />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: currentTheme.primary }}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Meet Roxy</h2>
              <p className="text-xs text-slate-400 font-mono">Gemini Live Voice AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4 text-sm text-slate-300">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3.5">
            <MessageCircleHeart className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">Sassy & Confident Persona</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Roxy is young, quick-witted, and playful with a slightly teasing tone like a close best friend. She delivers snappy one-liners, clever sarcasm, and warm banter without robotic formality.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3.5">
            <Zap className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">Zero Text • Audio-to-Audio Only</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Powered strictly by the Gemini Live API (<code className="text-cyan-300">gemini-3.1-flash-live-preview</code>). Microphones stream 16kHz PCM audio and the model streams back 24kHz natural speech via Web Audio API.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3.5">
            <Globe2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">Instant Function Calling</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Roxy executes real browser actions on the fly via Live tool calling — ask her to open websites like YouTube, Wikipedia, or Twitter/X and she will launch them instantly.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3.5">
            <Cpu className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">Interruption Handling</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Cut in at any moment. Start talking or tap the central orb while Roxy is speaking, and she will immediately stop and listen to your new turn.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: currentTheme.primary }}
          >
            Got it, let's talk!
          </button>
        </div>
      </div>
    </div>
  );
};
