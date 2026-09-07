import React from 'react';
import { Compass, Moon, ShieldCheck, Flame, BookOpen, Clock, Map, User, Award } from 'lucide-react';
import { QuestStatus, CharacterState } from '../types';

interface HeaderProps {
  dayNumber: number;
  quests: QuestStatus[];
  character: CharacterState;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCheckin: () => void;
  onOpenCharacterCodex: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dayNumber,
  quests,
  character,
  activeTab,
  onTabChange,
  onOpenCheckin,
  onOpenCharacterCodex,
}) => {
  const completedCount = quests.filter((q) => q.completed).length;
  const scorePercent = Math.round((completedCount / 5) * 100);

  // Highest rarity tier achieved among quests
  const hasLegendary = quests.some((q) => q.tier === 'Legendary');
  const hasEpic = quests.some((q) => q.tier === 'Epic');
  const hasRare = quests.some((q) => q.tier === 'Rare');
  const dominantTier = hasLegendary ? 'Legendary' : hasEpic ? 'Epic' : hasRare ? 'Rare' : 'Common';

  return (
    <header className="border-b border-[#22272b] bg-[#0c0e10]/95 backdrop-blur sticky top-0 z-40">
      {/* Top spiritual anchor banner */}
      <div className="bg-[#14181c] border-b border-[#1f2429] px-4 py-1.5 text-xs text-[#a09a8e] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
          <span className="font-medium text-[#dcd7cc]">DAILY ANCHOR:</span>
          <span className="italic text-[#9d978b]">
            “The routine bends to inner presence, reflection, and sincere craft.”
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-[#c5a059] font-medium flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse"></span>
            Dawn • Midday • Golden Hour • Twilight • Starlight
          </span>
          <span className="text-[#656e75]">|</span>
          <span className="text-[#888f95]">Inner Peace & Reflection Protocol</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1c2227] to-[#111417] border border-[#c5a059]/40 flex items-center justify-center shadow-[0_0_15px_rgba(197,160,89,0.15)] flex-shrink-0">
            <Compass className="w-6 h-6 text-[#c5a059]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif-title text-lg sm:text-xl font-bold tracking-wide text-[#f4efe4]">
                STRAIGHT PATH
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#1c2227] text-[#c5a059] border border-[#c5a059]/30">
                Ascension Guide
              </span>
            </div>
            <p className="text-xs text-[#8f887b] font-light">
              Open World Habit Archipelago • Spiritual Purification • Faceless Storytelling
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Character Avatar */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Character Codex Button */}
          <button
            onClick={onOpenCharacterCodex}
            className="bg-[#14181c] hover:bg-[#1a2127] border border-[#2e3742] hover:border-[#c5a059]/50 rounded-xl px-3 py-1.5 flex items-center gap-2.5 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#1f262e] border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#f4efe4] group-hover:text-[#c5a059] transition-colors">
                  {character.name}
                </span>
                <span className="font-mono text-[10px] text-[#c5a059] font-bold">
                  Lv. {character.level}
                </span>
              </div>
              <span className="text-[10px] text-[#7d8692] truncate max-w-[120px]">
                {character.activeTitle}
              </span>
            </div>
          </button>

          {/* Day Counter */}
          <div className="bg-[#14181c] border border-[#262c33] rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#798086]">Day</span>
            <span className="font-serif-title text-base font-bold text-[#f4efe4]">
              {dayNumber}
            </span>
          </div>

          {/* Daily Quest Score */}
          <div className="bg-[#14181c] border border-[#262c33] rounded-xl px-3 py-1.5 flex items-center gap-2.5">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#798086]">
                Habits
              </span>
              <span className="text-xs font-semibold text-[#c5a059]">
                {completedCount}/5 Done
              </span>
            </div>
            <span className="font-serif-title text-base font-bold text-[#e5ded0]">
              {scorePercent}%
            </span>
          </div>

          {/* Highest Tier Badge */}
          <div className="bg-[#14181c] border border-[#262c33] rounded-xl px-3 py-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#798086]">Tier</span>
              <span className="text-xs font-semibold text-[#e5ded0] capitalize">
                {dominantTier}
              </span>
            </div>
          </div>

          {/* Quick Check-In Button */}
          <button
            id="header-daily-checkin-btn"
            onClick={onOpenCheckin}
            className="bg-[#c5a059] hover:bg-[#d6b066] text-[#0e1111] font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-[0_2px_10px_rgba(197,160,89,0.25)] flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-[#0e1111]" />
            <span>Daily Check-in</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center space-x-1 sm:space-x-2 border-t border-[#1a1f24] pt-1.5 pb-2 overflow-x-auto no-scrollbar">
          <button
            id="tab-world-btn"
            onClick={() => onTabChange('world')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'world'
                ? 'bg-[#1e242a] text-[#c5a059] border border-[#c5a059]/40 shadow-sm font-bold'
                : 'text-[#858d94] hover:text-[#d1cbc0] hover:bg-[#15191d]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Open World Archipelago</span>
          </button>

          <button
            id="tab-quests-btn"
            onClick={() => onTabChange('quests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'quests'
                ? 'bg-[#1e242a] text-[#f4efe4] border border-[#303842]'
                : 'text-[#858d94] hover:text-[#d1cbc0] hover:bg-[#15191d]'
            }`}
          >
            5 Daily Pillars & Log
          </button>
          <button
            id="tab-faceless-btn"
            onClick={() => onTabChange('faceless')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'faceless'
                ? 'bg-[#1e242a] text-[#f4efe4] border border-[#303842]'
                : 'text-[#858d94] hover:text-[#d1cbc0] hover:bg-[#15191d]'
            }`}
          >
            Faceless Content Studio
          </button>
          <button
            id="tab-schedule-btn"
            onClick={() => onTabChange('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-[#1e242a] text-[#f4efe4] border border-[#303842]'
                : 'text-[#858d94] hover:text-[#d1cbc0] hover:bg-[#15191d]'
            }`}
          >
            Temporal Daily Anchors
          </button>
          <button
            id="tab-guide-btn"
            onClick={() => onTabChange('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-[#1e242a] text-[#f4efe4] border border-[#303842]'
                : 'text-[#858d94] hover:text-[#d1cbc0] hover:bg-[#15191d]'
            }`}
          >
            Ascension Guide Consultation
          </button>
          <button
            id="tab-history-btn"
            onClick={() => onTabChange('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#1e242a] text-[#f4efe4] border border-[#303842]'
                : 'text-[#858d94] hover:text-[#d1cbc0] hover:bg-[#15191d]'
            }`}
          >
            Ascension Log Archive
          </button>
        </nav>
      </div>
    </header>
  );
};

