import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  CheckSquare,
  AlertCircle,
  Clock,
  Compass,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { AscensionLog, QuestStatus } from '../types';

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  quests: QuestStatus[];
  onLogGenerated: (newLog: AscensionLog, updatedQuests: QuestStatus[]) => void;
}

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  quests,
  onLogGenerated,
}) => {
  const [inputText, setInputText] = useState(
    `Day ${dayNumber}: Completed Meditation, Workout, Journaling. Missed Study and Creation`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentStreaks = quests.reduce((acc, q) => {
    acc[q.questId] = q.currentStreak;
    return acc;
  }, {} as Record<string, number>);

  const handlePresetSelect = (preset: string) => {
    setInputText(preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ascension/parse-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          currentStreaks,
          dayNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to parse log: ${response.statusText}`);
      }

      const data = await response.json();

      const newLog: AscensionLog = {
        id: `log-${Date.now()}`,
        dayNumber: data.dayNumber || dayNumber,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        score: data.score,
        completionCount: data.completionCount,
        quests: data.quests,
        formattedOutput: data.formattedOutput,
        reflection: data.reflection,
        rawInput: inputText,
      };

      onLogGenerated(newLog, data.quests);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error parsing check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121619] border border-[#27303a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#171c21] border-b border-[#222830] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#20272f] text-[#c5a059] border border-[#c5a059]/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title font-bold text-base text-[#f5efe3]">
                Daily Check-In & State Parser
              </h2>
              <p className="text-xs text-[#828b94]">
                Process input into the official Ascension Log format with mathematical streak tracking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#656e77] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#798086] font-semibold block mb-2">
              Quick Input Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    `Day ${dayNumber}: All 5 Quests completed with Focus (Meditation, Study, Workout, Creator, Journaling)`
                  )
                }
                className="text-xs px-2.5 py-1 rounded bg-[#1b2026] hover:bg-[#232a32] text-[#d6cfc2] border border-[#2b333c] transition-colors cursor-pointer text-left"
              >
                ✦ 5/5 Perfect Day (All Complete)
              </button>
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    `Day ${dayNumber}: Completed Meditation, Workout, Journaling. Missed Study and Creation`
                  )
                }
                className="text-xs px-2.5 py-1 rounded bg-[#1b2026] hover:bg-[#232a32] text-[#d6cfc2] border border-[#2b333c] transition-colors cursor-pointer text-left"
              >
                ✦ Standard Friction Day (Meditation + Workout + Journal)
              </button>
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    `Day ${dayNumber}: High fatigue. Completed Meditation and Study. Missed Workout, Creation, and Journaling`
                  )
                }
                className="text-xs px-2.5 py-1 rounded bg-[#1b2026] hover:bg-[#232a32] text-[#d6cfc2] border border-[#2b333c] transition-colors cursor-pointer text-left"
              >
                ✦ Reset Day (Mindfulness Anchor Held)
              </button>
            </div>
          </div>

          {/* Natural Language Input */}
          <div>
            <label className="text-xs font-semibold text-[#ded8cc] block mb-2">
              Daily Check-in Text (Natural Language or Shorthand):
            </label>
            <textarea
              id="checkin-input-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              placeholder="e.g. Day 14: Completed Meditation, Workout, Journaling. Missed Study and Creation"
              className="w-full rounded-xl bg-[#0c0e10] border border-[#29323c] p-3.5 text-xs sm:text-sm text-[#f5efe3] focus:outline-none focus:border-[#c5a059] font-mono leading-relaxed"
            />
            <p className="text-[11px] text-[#717b84] mt-1.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#c5a059]" />
              The engine will parse completions for all 5 Quests, increment/reset streaks, compute score, and generate the 1% Better Spiritual Reflection.
            </p>
          </div>

          {/* Current State Summary */}
          <div className="bg-[#161a1e] rounded-xl p-3.5 border border-[#232930] text-xs">
            <span className="text-[11px] uppercase tracking-wider text-[#808992] font-semibold block mb-2">
              Previous Streaks Carried In:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              {quests.map((q) => (
                <div key={q.questId} className="bg-[#1c2227] p-2 rounded-lg border border-[#28313a]">
                  <div className="text-[10px] text-[#7b838b] truncate">{q.questName.split('(')[0]}</div>
                  <div className="font-mono font-bold text-sm text-[#f5efe3] mt-0.5">{q.currentStreak}d</div>
                  <div className="text-[9px] uppercase tracking-wider text-[#c5a059]">{q.tier}</div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#868f98] hover:text-[#e5ded0] hover:bg-[#1a2026] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-checkin-btn"
              disabled={loading || !inputText.trim()}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#c5a059] hover:bg-[#d6b066] text-[#0c0e10] flex items-center gap-2 transition-all shadow-[0_2px_12px_rgba(197,160,89,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0c0e10]" />
                  <span>Parsing & Reflecting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#0c0e10]" />
                  <span>Execute Ascension Log</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
