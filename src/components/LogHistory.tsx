import React, { useState } from 'react';
import { Terminal, Calendar, Award, Filter, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { AscensionLog } from '../types';
import { AscensionLogCard } from './AscensionLogCard';

interface LogHistoryProps {
  logs: AscensionLog[];
}

export const LogHistory: React.FC<LogHistoryProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'perfect' | 'friction'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(logs[0]?.id || null);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'perfect') return log.score === 100;
    if (filter === 'friction') return log.score < 100;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Archive Top Header */}
      <div className="rounded-2xl bg-[#121619] border border-[#232930] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-widest block mb-1">
              HISTORICAL RECORD OF TAZKIYAH
            </span>
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#f5efe3]">
              Ascension Log Archive
            </h2>
            <p className="text-xs sm:text-sm text-[#8f887b] mt-0.5">
              Official records of daily quest execution, mathematical scores, and spiritual reflections.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#171c21] p-1 rounded-xl border border-[#262c33] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#222932] text-[#f5efe3] border border-[#303844]'
                  : 'text-[#818991] hover:text-[#ded8cc]'
              }`}
            >
              All Logs ({logs.length})
            </button>
            <button
              onClick={() => setFilter('perfect')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'perfect'
                  ? 'bg-[#222932] text-[#f5efe3] border border-[#303844]'
                  : 'text-[#818991] hover:text-[#ded8cc]'
              }`}
            >
              100% Sincere Days
            </button>
            <button
              onClick={() => setFilter('friction')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'friction'
                  ? 'bg-[#222932] text-[#f5efe3] border border-[#303844]'
                  : 'text-[#818991] hover:text-[#ded8cc]'
              }`}
            >
              Friction & Renewal Days
            </button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-[#222830] bg-[#101316] text-[#7a828b] text-xs">
            No logs match the selected filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="rounded-xl border border-[#242b33] bg-[#111417] overflow-hidden"
              >
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#15191d] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#181d22] border border-[#262c33] flex items-center justify-center font-serif-title font-bold text-sm text-[#f5efe3]">
                      D{log.dayNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#f5efe3]">
                          DAY {log.dayNumber} ASCENSION
                        </span>
                        <span className="text-[11px] text-[#6d757d] font-mono">
                          • {log.date}
                        </span>
                      </div>
                      <p className="text-xs text-[#8c8577] mt-0.5 line-clamp-1 italic">
                        "{log.reflection}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#c5a059]">
                        {log.completionCount}/5 Quests
                      </div>
                      <div className="text-[10px] text-[#717a82] font-mono">
                        Score: {log.score}%
                      </div>
                    </div>

                    <div className="text-[#656e77]">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-[#1e2329] bg-[#0d0f11]">
                    <AscensionLogCard log={log} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
