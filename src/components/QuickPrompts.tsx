import React from 'react';
import { MessageSquareQuote, Sparkles } from 'lucide-react';
import { AssistantState } from '../types';

interface QuickPromptsProps {
  state: AssistantState;
}

const SAMPLE_PROMPTS = [
  '“Roxy, greet me and tell me what time it is!”',
  '“Wish me luck for my interview today!”',
  '“Give me your sassiest morning wish!”',
  '“Open YouTube right now!”',
  '“Remember my birthday is October 14th!”',
  '“Celebrate! I just launched my app!”',
  '“Check the latest breaking news for today!”',
  '“Switch to Spanish or speak in Hindi!”',
  '“Open Spotify for me!”',
  '“Tell me your most confident sassy comeback.”',
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ state }) => {
  return (
    <div id="quick-prompts" className="w-full max-w-xl mx-auto px-4 my-2 z-10 select-none">
      <div className="flex items-center justify-between px-1 mb-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
        <div className="flex items-center gap-1.5">
          <MessageSquareQuote className="w-3.5 h-3.5 text-pink-400" />
          <span>Real-time voice starters (Say aloud to Roxy)</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-pink-300/80 font-medium lowercase">
          <Sparkles className="w-3 h-3 text-pink-400" />
          <span>greets & wishes automatically</span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {SAMPLE_PROMPTS.map((prompt, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-zinc-900/60 backdrop-blur-md border border-white/10 text-xs text-zinc-300 hover:text-white hover:border-pink-500/30 transition-all font-normal shadow-sm"
          >
            {prompt}
          </div>
        ))}
      </div>
    </div>
  );
};
