import React, { useState } from 'react';
import { Copy, Check, Terminal, Sparkles, BookOpen, Share2 } from 'lucide-react';
import { AscensionLog } from '../types';

interface AscensionLogCardProps {
  log: AscensionLog;
  onCopy?: () => void;
}

export const AscensionLogCard: React.FC<AscensionLogCardProps> = ({ log }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(log.formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[#2b333c] bg-[#111417] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
      {/* Header bar */}
      <div className="bg-[#171c21] border-b border-[#242b32] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#c5a059]" />
          <span className="font-mono text-xs font-semibold text-[#f5efe3] tracking-wide">
            ASCENSION_LOG_DAY_{log.dayNumber}.txt
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#798088] font-mono">{log.date}</span>
          <button
            id={`copy-log-${log.id}`}
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-[#20272f] hover:bg-[#2c3540] text-[#c5a059] border border-[#c5a059]/30 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw Log</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Code / Monospace Output Block */}
      <div className="p-4 sm:p-5 font-mono text-xs sm:text-sm text-[#d4cfc5] leading-relaxed whitespace-pre-wrap bg-[#0d0f11] select-all border-b border-[#1b2025]">
        {log.formattedOutput}
      </div>

      {/* High-level summary visual strip */}
      <div className="px-4 py-3 bg-[#13171a] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#7d868e]">Completion:</span>
            <span className="font-semibold text-[#f5efe3]">
              {log.completionCount}/5 Quests ({log.score}%)
            </span>
          </div>
          <div className="h-3 w-px bg-[#262c33]" />
          <div className="flex items-center gap-1 text-[#c5a059]">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="italic font-sans text-xs">1% Better Renewal</span>
          </div>
        </div>

        {log.rawInput && (
          <div className="text-[11px] text-[#636c75] truncate max-w-xs font-mono">
            Input: "{log.rawInput}"
          </div>
        )}
      </div>
    </div>
  );
};
