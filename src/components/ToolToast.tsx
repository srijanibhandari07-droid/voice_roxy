import React from 'react';
import { ExternalLink, Palette, CheckCircle2, X, PartyPopper, BookmarkCheck, Zap } from 'lucide-react';
import { ToolCallEvent } from '../types';

interface ToolToastProps {
  toolEvent: ToolCallEvent | null;
  onClose: () => void;
}

export const ToolToast: React.FC<ToolToastProps> = ({ toolEvent, onClose }) => {
  if (!toolEvent) return null;

  const isWebsite = toolEvent.name === 'openWebsite';
  const isAtmosphere = toolEvent.name === 'setAtmosphereMood';
  const isCelebration = toolEvent.name === 'celebrateSuccess';
  const isMemory = toolEvent.name === 'rememberSpecialOccasion';

  return (
    <div
      id="tool-call-toast"
      className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md bg-zinc-950/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-pink-400">
            {isWebsite && <Zap className="w-5 h-5 text-cyan-400" />}
            {isAtmosphere && <Palette className="w-5 h-5 text-purple-400" />}
            {isCelebration && <PartyPopper className="w-5 h-5 text-amber-400" />}
            {isMemory && <BookmarkCheck className="w-5 h-5 text-emerald-400" />}
            {!isWebsite && !isAtmosphere && !isCelebration && !isMemory && (
              <ExternalLink className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-400 font-mono">
                {isWebsite ? 'Opened Then & There' : 'Action Executed'}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-white">
              {isWebsite && `Opened ${toolEvent.args?.label || toolEvent.args?.url} directly`}
              {isAtmosphere && `Atmosphere adjusted to ${toolEvent.args?.mood}`}
              {isCelebration && `Celebrated ${toolEvent.args?.title || 'Victory'}`}
              {isMemory && `Saved "${toolEvent.args?.title}" on ${toolEvent.args?.date} to memory`}
              {!isWebsite && !isAtmosphere && !isCelebration && !isMemory && `Executed ${toolEvent.name}`}
            </p>
          </div>
        </div>

        <button
          id="dismiss-toast-btn"
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isWebsite && toolEvent.args?.url && (
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-400 truncate max-w-[210px]">
            {toolEvent.args.url}
          </span>
          <a
            href={
              toolEvent.args.url.startsWith('http')
                ? toolEvent.args.url
                : `https://${toolEvent.args.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 px-3 py-1.5 rounded-xl border border-cyan-500/30 transition-colors flex-shrink-0"
          >
            Switch Tab
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      )}
    </div>
  );
};
