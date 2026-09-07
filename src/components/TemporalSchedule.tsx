import React, { useState } from 'react';
import {
  Clock,
  Compass,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Shield,
  Sparkles,
  BookOpen,
  Dumbbell,
  Video,
  Feather,
  CheckCircle2,
} from 'lucide-react';
import { DAILY_TIME_ANCHORS } from '../data/defaultData';
import { SpiritualTimeAnchor } from '../types';

export const TemporalSchedule: React.FC = () => {
  const [anchors] = useState<SpiritualTimeAnchor[]>(DAILY_TIME_ANCHORS);
  const [activeAnchorId, setActiveAnchorId] = useState<string>('dawn');

  const getAnchorIcon = (id: string) => {
    switch (id) {
      case 'dawn':
        return <Sunrise className="w-5 h-5 text-amber-400" />;
      case 'midday':
        return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'afternoon':
        return <Sun className="w-5 h-5 text-orange-400" />;
      case 'sunset':
        return <Sunset className="w-5 h-5 text-rose-400" />;
      case 'night':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      default:
        return <Clock className="w-5 h-5 text-[#c5a059]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Manifesto Banner */}
      <div className="rounded-2xl bg-[#121619] border border-[#232930] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-widest block mb-1">
              PHILOSOPHY OF TIME & INTENTIONAL LIVING
            </span>
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#f5efe3]">
              The 5 Temporal Daily Anchors
            </h2>
            <p className="text-xs sm:text-sm text-[#958e82] max-w-2xl mt-1 leading-relaxed">
              We do not organize our lives around arbitrary clock panic or endless digital reactivity. 
              The schedule bends to presence, physical vitality, philosophical study, and evening reflection. When the daily anchors stand firm, inner quietude replaces anxious comparison.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181d22] border border-[#273038] text-xs text-[#cfc7ba] max-w-xs">
            <span className="text-[#c5a059] font-bold block mb-1">
              Core Principle:
            </span>
            <p className="text-[11px] leading-relaxed italic text-[#a39c8f]">
              “Sincerity over spectacle. Self-discipline is not a performance for internet validation; it is an act of inner stewardship and quiet mastery.”
            </p>
          </div>
        </div>
      </div>

      {/* The 5 Temporal Windows mapped to daily productivity blocks */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {anchors.map((anchor) => {
          const isActive = activeAnchorId === anchor.id;
          return (
            <div
              key={anchor.id}
              onClick={() => setActiveAnchorId(anchor.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-[#181d22] border-[#c5a059]/60 shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                  : 'bg-[#111417] border-[#1e242a] hover:border-[#2b333c]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-[#1e242a] border border-[#2a333c]">
                    {getAnchorIcon(anchor.id)}
                  </div>
                  <span className="font-mono text-xs text-[#c5a059]">{anchor.focusSymbol || '✦'}</span>
                </div>

                <h3 className="font-serif-title font-bold text-sm text-[#f5efe3]">
                  {anchor.name}
                </h3>
                <div className="font-mono text-xs font-semibold text-[#c5a059] mt-0.5">
                  {anchor.time}
                </div>
                <p className="text-[11px] text-[#78818a] mt-1 line-clamp-2">
                  {anchor.windowDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1e2329] text-[11px]">
                <span className="text-[10px] text-[#636c75] uppercase font-mono block">Anchor Focus:</span>
                <span className="text-[#ded8cc] font-medium block truncate mt-0.5">
                  {anchor.spiritualTheme.split('&')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Selected Anchor View */}
      {(() => {
        const selected = anchors.find((a) => a.id === activeAnchorId) || anchors[0];
        return (
          <div className="rounded-xl border border-[#273038] bg-[#121619] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#20272e]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#1b2127] border border-[#2a333d]">
                  {getAnchorIcon(selected.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif-title font-bold text-lg text-[#f5efe3]">
                      {selected.name} Window
                    </h3>
                    <span className="font-mono text-sm text-[#c5a059]">{selected.focusSymbol || '✦'}</span>
                  </div>
                  <p className="text-xs text-[#8c8578] font-mono">
                    Window: {selected.windowDescription} • Scheduled Time: {selected.time}
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-lg bg-[#181d22] border border-[#28313a] text-xs text-[#c5a059] font-semibold">
                Theme: {selected.spiritualTheme}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              {/* Daily Block Routine */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#798088] font-semibold block">
                  Routine Alignment (How the routine bends to {selected.name}):
                </span>
                <div className="p-4 rounded-xl bg-[#0e1012] border border-[#20262c] text-xs text-[#cfc7ba] leading-relaxed">
                  {selected.scheduledRoutine}
                </div>
              </div>

              {/* Psychological Transition & Inner Peace Calibrator */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#798088] font-semibold block">
                  Inner Peace Calibrator (Quiet Presence):
                </span>
                <div className="p-4 rounded-xl bg-[#0e1012] border border-[#20262c] text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#f5efe3] font-semibold">Overcoming Comparison:</span>
                      <p className="text-[#8c8577] mt-0.5">
                        Do not measure your worth by viral algorithmic vanity. Measure by whether you stood in presence at {selected.name}.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-2 border-t border-[#1a1f24]">
                    <Sparkles className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#f5efe3] font-semibold">Renewal Over Despair:</span>
                      <p className="text-[#8c8577] mt-0.5">
                        If prior hours slipped into distraction, let {selected.name} be your moment of immediate return. No guilt spirals; just pure renewal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
