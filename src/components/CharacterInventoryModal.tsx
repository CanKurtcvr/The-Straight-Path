import React, { useState } from 'react';
import {
  X,
  Award,
  Shield,
  Compass,
  Sparkles,
  BookOpen,
  Dumbbell,
  Video,
  Feather,
  CheckCircle2,
  Lock,
  ChevronRight,
  ArrowUpCircle,
  Zap,
  Flame,
  Shirt,
  Footprints,
  Sliders,
} from 'lucide-react';
import { CharacterState, QuestStatus, HabitIsland, GearItem, GearSlot, RarityTier, getTierColor } from '../types';
import { HABIT_ISLANDS } from '../data/worldData';

interface CharacterInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterState;
  quests: QuestStatus[];
  onUpdateTitle: (title: string) => void;
  onUpdateArchetype: (archetype: CharacterState['archetype']) => void;
  onUpgradeGear: (gearId: string) => void;
}

export const CharacterInventoryModal: React.FC<CharacterInventoryModalProps> = ({
  isOpen,
  onClose,
  character,
  quests,
  onUpdateTitle,
  onUpdateArchetype,
  onUpgradeGear,
}) => {
  const [activeTab, setActiveTab] = useState<'armory' | 'profile' | 'mastery'>('armory');
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const equipmentSlots: { slot: GearSlot; label: string; icon: any }[] = [
    { slot: 'head', label: 'Headgear', icon: Compass },
    { slot: 'chest', label: 'Vestment / Garb', icon: Shirt },
    { slot: 'weapon', label: 'Relic Instrument', icon: BookOpen },
    { slot: 'accessory', label: 'Talisman', icon: Feather },
    { slot: 'feet', label: 'Footwear', icon: Footprints },
  ];

  // Calculate character total gear power / stats
  const totalStats = {
    Serenity: 0,
    Vitality: 0,
    Wisdom: 0,
    Focus: 0,
    Creativity: 0,
  };

  character.gearInventory.forEach((gear) => {
    if (gear.unlocked) {
      totalStats[gear.statBonus.statName] += gear.statBonus.amount;
    }
  });

  const getCorrespondingQuest = (islandId: string) => {
    return quests.find((q) => q.questId === islandId);
  };

  const handleTriggerUpgrade = (gear: GearItem) => {
    onUpgradeGear(gear.id);
    const nextStage = gear.stages[gear.level];
    if (nextStage) {
      setUpgradeSuccess(`Ascended ${gear.name} to ${nextStage.tier} Tier (${nextStage.name})!`);
      setTimeout(() => setUpgradeSuccess(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#101316] border border-[#27303c] rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#15191e] border-b border-[#21272f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1c2229] text-[#c5a059] border border-[#c5a059]/40">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title font-bold text-lg text-[#f5efe3]">
                  Character Codex & Equipment Armory
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 text-[10px] font-mono font-bold">
                  Lv. {character.level}
                </span>
              </div>
              <p className="text-xs text-[#87909a]">
                Equip gear earned from continuous discipline, upgrade to Legendary, and inspect character stats.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7c8691] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 bg-[#101316] border-b border-[#1f252d]">
          {[
            { id: 'armory', label: 'Equipped Gear & Armory', icon: Shield },
            { id: 'profile', label: 'Identity & Titles', icon: Award },
            { id: 'mastery', label: 'Realm Masteries', icon: Compass },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'border-[#c5a059] text-[#f5efe3]'
                  : 'border-transparent text-[#7d8691] hover:text-[#cfc8bb]'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Upgrade Fanfare banner */}
        {upgradeSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center gap-3 text-amber-200 text-xs font-semibold animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            <span>{upgradeSuccess}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: ARMORY & GEAR */}
          {activeTab === 'armory' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Character Doll & Stat Overview */}
              <div className="lg:col-span-5 space-y-4">
                {/* Character Visual Avatar Frame */}
                <div className="p-6 rounded-2xl bg-[#14181d] border border-[#242c36] flex flex-col items-center text-center relative overflow-hidden">
                  <div className="w-24 h-24 rounded-2xl bg-[#1c222a] border-2 border-[#c5a059]/60 flex items-center justify-center text-[#c5a059] shadow-[0_0_30px_rgba(197,160,89,0.25)] relative mb-3">
                    <Compass className="w-12 h-12" />
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-[#09140f] font-mono text-[10px] font-bold">
                      Online
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#f5efe3]">{character.name}</h3>
                  <p className="text-xs text-[#c5a059] font-medium mb-1">
                    {character.activeTitle}
                  </p>
                  <p className="text-[11px] text-[#7d8894]">Archetype: {character.archetype}</p>

                  {/* Stat Summary Pills */}
                  <div className="w-full mt-5 pt-4 border-t border-[#222933] grid grid-cols-2 gap-2 text-left">
                    <div className="p-2 rounded-xl bg-[#0e1114] border border-white/5">
                      <span className="text-[10px] text-[#7d8894] block">Serenity</span>
                      <span className="text-xs font-bold text-sky-400">+{totalStats.Serenity}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0e1114] border border-white/5">
                      <span className="text-[10px] text-[#7d8894] block">Vitality</span>
                      <span className="text-xs font-bold text-emerald-400">+{totalStats.Vitality}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0e1114] border border-white/5">
                      <span className="text-[10px] text-[#7d8894] block">Wisdom</span>
                      <span className="text-xs font-bold text-blue-400">+{totalStats.Wisdom}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0e1114] border border-white/5">
                      <span className="text-[10px] text-[#7d8894] block">Creativity</span>
                      <span className="text-xs font-bold text-purple-400">+{totalStats.Creativity}</span>
                    </div>
                  </div>
                </div>

                {/* How to Upgrade Explainer */}
                <div className="p-4 rounded-xl bg-[#141920] border border-[#202732] text-xs text-[#9aa4b0] space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-[#f5efe3]">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>How Gear Upgrades Work</span>
                  </div>
                  <p className="text-[11px] text-[#7d8894] leading-relaxed">
                    1. <strong className="text-white">Default Gear</strong>: Unlocked on your very first task completion in each habit realm.
                  </p>
                  <p className="text-[11px] text-[#7d8894] leading-relaxed">
                    2. <strong className="text-sky-300">Rare Tier</strong>: Attained at 7+ streak days.
                  </p>
                  <p className="text-[11px] text-[#7d8894] leading-relaxed">
                    3. <strong className="text-purple-300">Epic Tier</strong>: Attained at 30+ streak days.
                  </p>
                  <p className="text-[11px] text-[#7d8894] leading-relaxed">
                    4. <strong className="text-amber-300">Legendary Tier</strong>: Mastered at 90+ continuous streak days.
                  </p>
                </div>
              </div>

              {/* Right Column: Gear Slots List */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e98a5]">
                    Equipped Gear Slots (5/5)
                  </h4>
                  <span className="text-[11px] text-[#c5a059]">Tap piece to inspect / upgrade</span>
                </div>

                {equipmentSlots.map(({ slot, label }) => {
                  const gear = character.gearInventory.find((g) => g.slot === slot);
                  if (!gear) return null;

                  const quest = getCorrespondingQuest(gear.islandOrigin);
                  const currentStreak = quest?.currentStreak ?? 0;
                  const tierColors = getTierColor(gear.tier);

                  const nextStage = gear.stages[gear.level];
                  const canUpgrade = gear.level < 4 && currentStreak >= gear.streakRequirementForNext;
                  const isMaxTier = gear.level >= 4;

                  return (
                    <div
                      key={gear.id}
                      onClick={() => setSelectedGear(gear)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        tierColors.border
                      } ${tierColors.bg} hover:border-[#c5a059]/60`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border ${tierColors.border} ${tierColors.glow} bg-black/40`}
                          >
                            <span style={{ color: gear.visualColor }}>✦</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7e8996]">
                                [{label}]
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierColors.border} ${tierColors.text}`}
                              >
                                {gear.tier} (Lv. {gear.level})
                              </span>
                            </div>

                            <h5 className="font-bold text-sm text-[#f5efe3] mt-0.5">{gear.name}</h5>
                            <p className="text-xs text-[#9aa3ae] line-clamp-1 mt-0.5">{gear.description}</p>
                          </div>
                        </div>

                        {/* Stat bonus chip */}
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-[#c5a059]">
                            +{gear.statBonus.amount} {gear.statBonus.statName}
                          </span>
                        </div>
                      </div>

                      {/* Upgrade Progress Bar */}
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[10px] text-[#7d8894] mb-1">
                            <span>Continuous Effort: {currentStreak} days</span>
                            <span>
                              {isMaxTier
                                ? 'MAX TIER (Legendary)'
                                : `Target for ${nextStage?.tier}: ${gear.streakRequirementForNext} days`}
                            </span>
                          </div>
                          <div className="w-full bg-[#0a0d10] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: isMaxTier
                                  ? '100%'
                                  : `${Math.min(100, (currentStreak / gear.streakRequirementForNext) * 100)}%`,
                                backgroundColor: gear.visualColor,
                              }}
                            />
                          </div>
                        </div>

                        {/* Upgrade Action Button */}
                        {canUpgrade && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTriggerUpgrade(gear);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0e1114] text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-colors cursor-pointer shrink-0"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            <span>Upgrade</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & TITLES */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Level & XP Progression */}
              <div className="p-5 rounded-2xl bg-[#14181d] border border-[#242c36] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#f5efe3]">Ascension Level {character.level}</h4>
                    <p className="text-xs text-[#7d8894]">Earned from completing daily habits in each island.</p>
                  </div>
                  <span className="font-mono text-xs text-[#c5a059] font-bold">
                    {character.xp} / {character.nextLevelXp} XP
                  </span>
                </div>
                <div className="w-full bg-[#0a0d10] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (character.xp / character.nextLevelXp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Archetype Customization */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e98a5]">
                  Select Your Archetype
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(['Wayfarer', 'Seeker', 'Philosopher', 'Creator', 'Ascetic'] as const).map((arch) => (
                    <button
                      key={arch}
                      onClick={() => onUpdateArchetype(arch)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        character.archetype === arch
                          ? 'bg-[#c5a059]/15 border-[#c5a059] text-[#f5efe3]'
                          : 'bg-[#14181d] border-[#222933] text-[#7d8894] hover:text-[#d1c8bb]'
                      }`}
                    >
                      <span className="font-bold text-xs block">{arch}</span>
                      <span className="text-[10px] text-[#636e7b]">Discipline Path</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Unlocked Titles */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e98a5]">
                  Unlocked Titles ({character.unlockedTitles.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {character.unlockedTitles.map((title) => (
                    <button
                      key={title}
                      onClick={() => onUpdateTitle(title)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        character.activeTitle === title
                          ? 'bg-[#c5a059]/15 border-[#c5a059] text-[#f5efe3]'
                          : 'bg-[#14181d] border-[#222933] text-[#7d8894] hover:text-[#cfc8bb]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{title}</span>
                      {character.activeTitle === title && (
                        <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REALM MASTERIES */}
          {activeTab === 'mastery' && (
            <div className="space-y-4">
              <p className="text-xs text-[#87909a]">
                Habit disciplines across the archipelago. Consistency here fuels your gear upgrades and ascension rank.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HABIT_ISLANDS.filter((i) => i.id !== 'nexus').map((island) => {
                  const quest = quests.find((q) => q.questId === island.questId);
                  const streak = quest?.currentStreak ?? 0;
                  const tierColors = getTierColor(quest?.tier ?? 'Common');

                  return (
                    <div
                      key={island.id}
                      className="p-4 rounded-2xl bg-[#14181d] border border-[#242c36] space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest block"
                            style={{ color: island.accentHex }}
                          >
                            {island.conceptTitle}
                          </span>
                          <h4 className="font-bold text-sm text-[#f5efe3] mt-0.5">{island.name}</h4>
                          <p className="text-xs text-[#7d8894] mt-0.5">{island.description}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0c0e11] border border-white/5 flex items-center justify-between">
                        <span className="text-xs text-[#87909a]">Current Discipline Streak</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${tierColors.border} ${tierColors.text}`}
                          >
                            {streak} Days
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
