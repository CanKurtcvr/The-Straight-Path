import React from 'react';
import {
  Compass,
  BookOpen,
  Dumbbell,
  Video,
  Feather,
  CheckCircle2,
  Circle,
  Flame,
  Shield,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { QuestDefinition, QuestStatus, RarityTier, getTierColor } from '../types';

interface QuestCardProps {
  definition: QuestDefinition;
  status: QuestStatus;
  onToggle: (questId: string) => void;
  onAdjustStreak: (questId: string, delta: number) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  definition,
  status,
  onToggle,
  onAdjustStreak,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-5 h-5 text-[#c5a059]" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-emerald-400" />;
      case 'Dumbbell':
        return <Dumbbell className="w-5 h-5 text-orange-400" />;
      case 'Video':
        return <Video className="w-5 h-5 text-indigo-400" />;
      case 'Feather':
        return <Feather className="w-5 h-5 text-amber-300" />;
      default:
        return <Compass className="w-5 h-5 text-[#c5a059]" />;
    }
  };

  const tierColors = getTierColor(status.tier);

  // Calculate next tier progress
  let nextTierName: RarityTier | 'Mastery' = 'Rare';
  let targetStreak = 7;
  let currentTierBase = 0;

  if (status.currentStreak >= 90) {
    nextTierName = 'Mastery';
    targetStreak = 90;
    currentTierBase = 90;
  } else if (status.currentStreak >= 30) {
    nextTierName = 'Legendary';
    targetStreak = 90;
    currentTierBase = 30;
  } else if (status.currentStreak >= 7) {
    nextTierName = 'Epic';
    targetStreak = 30;
    currentTierBase = 7;
  } else {
    nextTierName = 'Rare';
    targetStreak = 7;
    currentTierBase = 0;
  }

  const progressPercent =
    status.currentStreak >= 90
      ? 100
      : Math.min(
          100,
          Math.round(
            ((status.currentStreak - currentTierBase) /
              (targetStreak - currentTierBase)) *
              100
          )
        );

  const daysNeeded = Math.max(0, targetStreak - status.currentStreak);

  return (
    <div
      id={`quest-card-${status.questId}`}
      className={`relative rounded-xl border transition-all duration-200 p-5 ${
        status.completed
          ? 'bg-[#14181c] border-[#323c46] shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
          : 'bg-[#101316] border-[#1f2429] opacity-90'
      }`}
    >
      {/* Top row: Icon, Name, Arabic badge, Checkbox */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-[#1a2026] border border-[#27303a] flex-shrink-0 mt-0.5">
            {getIcon(definition.iconName)}
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="font-serif-title font-bold text-sm sm:text-base text-[#f5efe3]">
                {definition.name}
              </h3>
              <span className="font-arabic text-xs text-[#c5a059] px-2 py-0.5 rounded bg-[#1c1810] border border-[#c5a059]/20">
                {definition.arabicConcept}
              </span>
            </div>
            <p className="text-xs text-[#8c8577] mt-0.5 font-medium">
              {definition.subTitle}
            </p>
          </div>
        </div>

        {/* Completion Toggle Button */}
        <button
          id={`toggle-quest-${status.questId}`}
          onClick={() => onToggle(status.questId)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            status.completed
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : 'bg-[#181d22] border-[#29323b] text-[#7d868f] hover:text-[#b0bac4] hover:border-[#384450]'
          }`}
        >
          {status.completed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Completed</span>
            </>
          ) : (
            <>
              <Circle className="w-4 h-4 text-[#606a74]" />
              <span>Mark Today</span>
            </>
          )}
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-[#a39c8f] mt-3 leading-relaxed">
        {definition.description}
      </p>

      {/* Temporal Window Badge */}
      {definition.temporalWindow && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#7a7469]">
          <Clock className="w-3 h-3 text-[#c5a059]" />
          <span>Optimal Window: {definition.temporalWindow}</span>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-[#1d2227] my-3.5" />

      {/* Bottom Row: Streak counter, Rarity Tier, Progression */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Streak Counter with manual calibrators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#171c21] px-2.5 py-1 rounded-md border border-[#262f38]">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span className="text-xs font-bold text-[#f5efe3]">
              {status.currentStreak}
            </span>
            <span className="text-[11px] text-[#7a838d]">days</span>
          </div>

          {/* Quick manual adjust buttons (+ / -) for streak maintenance */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => onAdjustStreak(status.questId, -1)}
              title="Decrease streak by 1"
              className="w-5 h-5 rounded bg-[#161a1e] hover:bg-[#20272e] text-[#727a83] hover:text-white border border-[#262c33] flex items-center justify-center cursor-pointer transition-colors"
            >
              -
            </button>
            <button
              onClick={() => onAdjustStreak(status.questId, 1)}
              title="Increase streak by 1"
              className="w-5 h-5 rounded bg-[#161a1e] hover:bg-[#20272e] text-[#727a83] hover:text-white border border-[#262c33] flex items-center justify-center cursor-pointer transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Rarity Tier Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide uppercase ${tierColors.bg} ${tierColors.border} ${tierColors.text} ${tierColors.glow}`}
          >
            <Shield className="w-3 h-3" />
            <span>{status.tier} Tier</span>
          </div>

          <span className="text-[11px] text-[#6d757d]">
            {status.tier === 'Legendary'
              ? 'Crown of Istiqomah'
              : `${daysNeeded}d to ${nextTierName}`}
          </span>
        </div>
      </div>

      {/* Progress Bar towards next rarity tier */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-[#666f78] mb-1 font-mono">
          <span>{status.tier}</span>
          <span>
            {status.tier === 'Legendary'
              ? '90+ Days Unlocked'
              : `${status.currentStreak}/${targetStreak} Days to ${nextTierName}`}
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#171c21] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status.tier === 'Legendary'
                ? 'bg-amber-400'
                : status.tier === 'Epic'
                ? 'bg-purple-400'
                : status.tier === 'Rare'
                ? 'bg-sky-400'
                : 'bg-zinc-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
