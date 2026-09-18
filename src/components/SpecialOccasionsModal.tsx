import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PartyPopper,
  X,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Trophy,
  Heart,
  Flame,
} from 'lucide-react';
import { SpecialOccasion } from '../types';

interface SpecialOccasionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasions: SpecialOccasion[];
  onAddOccasion: (occasion: Omit<SpecialOccasion, 'id' | 'createdAt'>) => void;
  onDeleteOccasion: (id: string) => void;
  onTriggerCelebrate: (occasion: SpecialOccasion) => void;
}

export const SpecialOccasionsModal: React.FC<SpecialOccasionsModalProps> = ({
  isOpen,
  onClose,
  occasions,
  onAddOccasion,
  onDeleteOccasion,
  onTriggerCelebrate,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<SpecialOccasion['type']>('birthday');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;
    onAddOccasion({
      title: title.trim(),
      date: date.trim(),
      type,
      notes: notes.trim() || undefined,
    });
    setTitle('');
    setDate('');
    setNotes('');
    setIsAdding(false);
  };

  const getOccasionIcon = (category: string) => {
    switch (category) {
      case 'birthday':
        return <PartyPopper className="w-4 h-4 text-pink-400" />;
      case 'anniversary':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'promotion':
      case 'victory':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'milestone':
        return <Flame className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="special-occasions-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            id="special-occasions-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-zinc-950/95 border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Ambient gradients */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                  <PartyPopper className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Special Occasions & Memory
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Roxy remembers these dates and celebrates them with fireworks
                  </p>
                </div>
              </div>
              <button
                id="close-occasions-modal-btn"
                onClick={onClose}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close occasions modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {occasions.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                  <Sparkles className="w-8 h-8 text-pink-400/60 mx-auto mb-2" />
                  <p className="text-sm font-medium text-zinc-300">No special occasions remembered yet</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Tell Roxy: "Remember my birthday is Oct 14th" or add one below!
                  </p>
                </div>
              ) : (
                occasions.map((occ) => (
                  <div
                    key={occ.id}
                    className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/70 border border-white/10 hover:border-pink-500/40 transition-all shadow-md"
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 mt-0.5">
                        {getOccasionIcon(occ.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                            {occ.title}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 capitalize">
                            {occ.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                          <Calendar className="w-3.5 h-3.5 text-pink-400" />
                          <span>{occ.date}</span>
                        </div>
                        {occ.notes && (
                          <p className="text-xs text-zinc-400/80 mt-1 italic line-clamp-1">
                            {occ.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onTriggerCelebrate(occ)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500 hover:to-purple-600 text-pink-200 hover:text-white border border-pink-500/30 hover:border-transparent transition-all flex items-center gap-1 shadow-sm"
                        title="Celebrate now!"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Celebrate</span>
                      </button>

                      <button
                        onClick={() => onDeleteOccasion(occ.id)}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete occasion"
                        aria-label="Delete occasion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Add form */}
              {isAdding ? (
                <form
                  onSubmit={handleSubmit}
                  className="p-4 rounded-2xl bg-zinc-900/90 border border-pink-500/40 space-y-3 mt-4"
                >
                  <div className="text-xs font-semibold text-pink-400 uppercase tracking-wider">
                    Add New Occasion or Milestone
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Title / Person
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Srijani's Birthday"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Date or Timing
                      </label>
                      <input
                        type="text"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="e.g. October 14th / Tomorrow"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Category
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-white/15 text-white focus:outline-none focus:border-pink-500"
                      >
                        <option value="birthday">Birthday</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="promotion">Promotion / Career</option>
                        <option value="milestone">Milestone / Goal</option>
                        <option value="holiday">Special Holiday</option>
                        <option value="custom">Other Success Day</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Favorite cake, big goal achieved"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20 hover:opacity-90"
                    >
                      Save to Memory
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  id="add-occasion-toggle-btn"
                  onClick={() => setIsAdding(true)}
                  className="w-full py-2.5 rounded-2xl border border-dashed border-white/20 hover:border-pink-500/60 bg-white/[0.02] hover:bg-white/[0.05] text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-pink-400" />
                  <span>Add Special Occasion</span>
                </button>
              )}
            </div>

            {/* Footer tip */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Roxy celebrates successes & anniversaries automatically during voice chat
              </span>
              <button
                onClick={onClose}
                className="text-xs font-medium text-pink-400 hover:text-pink-300"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
