import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OpenWorldMap } from './components/OpenWorldMap';
import { FlightWorld3D } from './components/FlightWorld3D';
import { AreaModal } from './components/AreaModal';
import { CharacterInventoryModal } from './components/CharacterInventoryModal';
import { QuestCard } from './components/QuestCard';
import { AscensionLogCard } from './components/AscensionLogCard';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { FacelessStudio } from './components/FacelessStudio';
import { TemporalSchedule } from './components/TemporalSchedule';
import { GuideConsultant } from './components/GuideConsultant';
import { LogHistory } from './components/LogHistory';
import {
  QUEST_DEFINITIONS,
  QuestStatus,
  AscensionLog,
  calculateTier,
  WorldArea,
  HabitIsland,
  CharacterState,
  TimeOfDay,
  IslandId,
  GearSlot,
  GearItem,
} from './types';
import { INITIAL_QUEST_STATUSES, INITIAL_LOGS } from './data/defaultData';
import { INITIAL_CHARACTER_STATE, HABIT_ISLANDS } from './data/worldData';
import {
  Flame,
  Clock,
  Sparkles,
  BookOpen,
  Compass,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Map,
  Award,
  Wind,
  Layers,
  Globe,
} from 'lucide-react';

export default function App() {
  // Load Quests with migration
  const [quests, setQuests] = useState<QuestStatus[]>(() => {
    const saved = localStorage.getItem('straight_path_quests');
    if (saved) {
      try {
        const parsed: QuestStatus[] = JSON.parse(saved);
        // Check if old islamic IDs were present, migrate to universal IDs
        const hasLegacy = parsed.some((q) => q.questId === 'salah');
        if (!hasLegacy && parsed.length === 5) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse quests from localStorage', e);
      }
    }
    return INITIAL_QUEST_STATUSES;
  });

  // Load Character with gear inventory guarantee
  const [character, setCharacter] = useState<CharacterState>(() => {
    const saved = localStorage.getItem('straight_path_character');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CHARACTER_STATE,
          ...parsed,
          equipment: parsed.equipment || INITIAL_CHARACTER_STATE.equipment,
          gearInventory: parsed.gearInventory || INITIAL_CHARACTER_STATE.gearInventory,
        };
      } catch (e) {
        console.error('Failed to parse character from localStorage', e);
      }
    }
    return INITIAL_CHARACTER_STATE;
  });

  // Load Logs
  const [logs, setLogs] = useState<AscensionLog[]>(() => {
    const saved = localStorage.getItem('straight_path_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse logs from localStorage', e);
      }
    }
    return INITIAL_LOGS;
  });

  const [dayNumber, setDayNumber] = useState<number>(() => {
    const saved = localStorage.getItem('straight_path_day');
    if (saved) return Number(saved) || 14;
    return 14;
  });

  // Active view tab - default to open world RPG!
  const [activeTab, setActiveTab] = useState<string>('world');
  const [worldViewMode, setWorldViewMode] = useState<'3d_flight' | '2d_map'>('3d_flight');

  // Modals state
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isCodexModalOpen, setIsCodexModalOpen] = useState(false);

  // Area Modal state
  const [selectedArea, setSelectedArea] = useState<WorldArea | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<HabitIsland | null>(null);

  // Time of Day state
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('zenith');

  // Level Up Toast
  const [levelUpToast, setLevelUpToast] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('straight_path_quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('straight_path_character', JSON.stringify(character));
  }, [character]);

  useEffect(() => {
    localStorage.setItem('straight_path_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('straight_path_day', dayNumber.toString());
  }, [dayNumber]);

  // Award XP and calculate potential Level Up
  const awardXP = (xpGain: number) => {
    setCharacter((prev) => {
      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;
      let unlockedTitles = [...prev.unlockedTitles];
      let leveledUp = false;

      while (newXp >= newNextXp) {
        newXp -= newNextXp;
        newLevel += 1;
        newNextXp = Math.round(newNextXp * 1.35);
        leveledUp = true;

        if (newLevel === 4 && !unlockedTitles.includes('Guardian of the Dawn')) {
          unlockedTitles.push('Guardian of the Dawn');
        }
        if (newLevel === 5 && !unlockedTitles.includes('Master of Sincere Discipline')) {
          unlockedTitles.push('Master of Sincere Discipline');
        }
      }

      if (leveledUp) {
        setLevelUpToast(`Level Up! You have attained Ascension Level ${newLevel}!`);
        setTimeout(() => setLevelUpToast(null), 4500);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: newNextXp,
        unlockedTitles,
      };
    });
  };

  // Toggle Quest completion directly
  const handleToggleQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.questId === questId) {
          const nextCompleted = !q.completed;
          let newStreak = q.currentStreak;
          if (nextCompleted) {
            newStreak = (q.previousStreak ?? q.currentStreak) + 1;
            awardXP(50);
          } else {
            newStreak = 0;
          }
          return {
            ...q,
            completed: nextCompleted,
            currentStreak: newStreak,
            tier: calculateTier(newStreak),
          };
        }
        return q;
      })
    );
  };

  // Adjust streak manually
  const handleAdjustStreak = (questId: string, delta: number) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.questId === questId) {
          const newStreak = Math.max(0, q.currentStreak + delta);
          return {
            ...q,
            currentStreak: newStreak,
            tier: calculateTier(newStreak),
          };
        }
        return q;
      })
    );
  };

  // Habit completion from Area Modal in Open World with Gear Unlock & Upgrade Check
  const handleCompleteHabitFromArea = (questId: string, xpEarned: number, rewardSlot?: GearSlot) => {
    awardXP(xpEarned);

    setQuests((prev) =>
      prev.map((q) => {
        if (q.questId === questId) {
          const newStreak = q.completed ? q.currentStreak : q.currentStreak + 1;
          return {
            ...q,
            completed: true,
            currentStreak: newStreak,
            tier: calculateTier(newStreak),
          };
        }
        return q;
      })
    );

    // Gear reward logic:
    // "for the first completion you get a default gearpiece and it can be upgraded by continuous effort into more rare pieces which eventually turn legendary"
    setCharacter((prev) => {
      let updatedInventory = [...prev.gearInventory];
      let updatedEquipment = { ...prev.equipment };

      // Find matching gear item for this island/quest
      const gearIndex = updatedInventory.findIndex(
        (g) => g.islandOrigin === questId || (rewardSlot && g.slot === rewardSlot)
      );

      if (gearIndex !== -1) {
        let gear = { ...updatedInventory[gearIndex] };

        // First completion unlock!
        if (!gear.unlocked) {
          gear.unlocked = true;
          updatedEquipment[gear.slot] = gear;
          updatedInventory[gearIndex] = gear;

          setLevelUpToast(`✦ NEW GEAR UNLOCKED: ${gear.name} equipped in your Armory!`);
          setTimeout(() => setLevelUpToast(null), 5000);
        } else {
          // Check if eligible for upgrade based on streak
          const targetQuest = quests.find((q) => q.questId === questId);
          const currentStreak = (targetQuest?.currentStreak ?? 0) + 1;
          if (gear.level < 4 && currentStreak >= gear.streakRequirementForNext) {
            setLevelUpToast(`✦ GEAR READY TO ASCEND: ${gear.name} can be upgraded in your Armory!`);
            setTimeout(() => setLevelUpToast(null), 5000);
          }
        }
      }

      return {
        ...prev,
        gearInventory: updatedInventory,
        equipment: updatedEquipment,
      };
    });
  };

  // Gear Upgrade Handler: Progresses Common -> Rare -> Epic -> Legendary
  const handleUpgradeGear = (gearId: string) => {
    setCharacter((prev) => {
      const gear = prev.gearInventory.find((g) => g.id === gearId);
      if (!gear || gear.level >= 4) return prev;

      const newLevel = gear.level + 1;
      const nextStage = gear.stages[newLevel - 1];
      if (!nextStage) return prev;

      // Next streak requirement: Rare -> 30d for Epic, Epic -> 90d for Legendary
      const nextReq = newLevel === 2 ? 30 : newLevel === 3 ? 90 : 999;

      const upgradedGear: GearItem = {
        ...gear,
        level: newLevel,
        tier: nextStage.tier,
        name: nextStage.name,
        description: nextStage.lore,
        statBonus: {
          ...gear.statBonus,
          amount: nextStage.statBoost,
        },
        streakRequirementForNext: nextReq,
      };

      const updatedInventory = prev.gearInventory.map((g) => (g.id === gearId ? upgradedGear : g));
      const updatedEquipment = {
        ...prev.equipment,
        [upgradedGear.slot]: upgradedGear,
      };

      setLevelUpToast(`✦ GEAR ASCENDED: ${upgradedGear.name} is now ${upgradedGear.tier}!`);
      setTimeout(() => setLevelUpToast(null), 5000);

      return {
        ...prev,
        gearInventory: updatedInventory,
        equipment: updatedEquipment,
      };
    });
  };

  // Update character position on open world
  const handleUpdateCharacterPos = (x: number, y: number, currentIsland: IslandId) => {
    setCharacter((prev) => ({
      ...prev,
      x,
      y,
      currentIsland,
      travelHistory: prev.travelHistory.includes(currentIsland)
        ? prev.travelHistory
        : [...prev.travelHistory, currentIsland],
    }));
  };

  // Enter Area Landmark
  const handleEnterArea = (area: WorldArea, island: HabitIsland) => {
    setSelectedArea(area);
    setSelectedIsland(island);
  };

  // Fast Travel trigger
  const handleFastTravelToIsland = (islandId: string) => {
    const targetIsland = HABIT_ISLANDS.find((isl) => isl.id === islandId);
    if (targetIsland) {
      handleUpdateCharacterPos(targetIsland.x, targetIsland.y + 40, targetIsland.id);
    }
  };

  // Handle log generated from natural language check-in
  const handleLogGenerated = (newLog: AscensionLog, updatedQuests: QuestStatus[]) => {
    setQuests(updatedQuests);
    setLogs([newLog, ...logs]);
    setDayNumber((prev) => Math.max(prev, newLog.dayNumber + 1));
    awardXP(100);
  };

  const latestLog = logs[0] || INITIAL_LOGS[0];
  const completedQuestsCount = quests.filter((q) => q.completed).length;
  const dailyScore = Math.round((completedQuestsCount / 5) * 100);

  return (
    <div className="min-h-screen bg-[#0a0c0e] text-[#e3ded4] font-sans-body selection:bg-[#c5a059]/20 selection:text-[#f7edd2]">
      {/* Sticky Top Header */}
      <Header
        dayNumber={dayNumber}
        quests={quests}
        character={character}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCheckin={() => setIsCheckinModalOpen(true)}
        onOpenCharacterCodex={() => setIsCodexModalOpen(true)}
      />

      {/* Level Up Banner Toast */}
      {levelUpToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#161a1e] border-2 border-[#c5a059] px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(197,160,89,0.4)] flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <Award className="w-6 h-6 text-[#c5a059] animate-bounce" />
          <div>
            <span className="font-serif-title font-bold text-sm text-[#f5efe3] block">
              {levelUpToast}
            </span>
            <span className="text-[10px] text-[#c5a059] font-mono">
              New Ascension title & discipline capacity unlocked!
            </span>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Tab 0: Open World Habit RPG Archipelago */}
        {activeTab === 'world' && (
          <div className="space-y-6">
            {/* World Context Header */}
            <div className="rounded-2xl bg-[#111417] border border-[#212730] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#c5a059] font-mono uppercase tracking-widest mb-1">
                  <Globe className="w-4 h-4 text-[#38bdf8]" />
                  <span>The Habit Archipelago • 3D Open World</span>
                </div>
                <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#f5efe3]">
                  {worldViewMode === '3d_flight' ? '3D Spiritual Flight Exploration' : 'Archipelago Tactical Chart'}
                </h2>
                <p className="text-xs sm:text-sm text-[#8c8577] mt-1 max-w-2xl leading-relaxed">
                  {worldViewMode === '3d_flight'
                    ? 'Third-person spiritual flight simulation. Soar as a majestic white bird across celestial skies, bank through the clouds with dynamic depth-of-field blur, collect starlight essence, and land at sacred island sanctuaries.'
                    : 'Tactical overview of the 5 Habit Islands. Use your keyboard [WASD / Arrows] or click to traverse pathways and visit sacred shrines, scriptoriums, and studios.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
                {/* View Mode Switcher */}
                <div className="flex items-center bg-[#0d1013] border border-[#232b36] rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setWorldViewMode('3d_flight')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      worldViewMode === '3d_flight'
                        ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white font-bold shadow-md'
                        : 'text-[#94a3b8] hover:text-[#f8fafc]'
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5" />
                    <span>3D Flight</span>
                  </button>
                  <button
                    onClick={() => setWorldViewMode('2d_map')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      worldViewMode === '2d_map'
                        ? 'bg-[#c5a059] text-[#0c0e10] font-bold shadow-md'
                        : 'text-[#94a3b8] hover:text-[#f8fafc]'
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>2D Chart</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsCodexModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#181d22] hover:bg-[#20272e] border border-[#c5a059]/40 text-xs font-semibold text-[#c5a059] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Codex</span>
                </button>

                <button
                  onClick={() => setIsCheckinModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d6b066] text-[#0c0e10] text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_2px_10px_rgba(197,160,89,0.3)] cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-[#0c0e10]" />
                  <span>Check-in</span>
                </button>
              </div>
            </div>

            {/* Interactive World View */}
            {worldViewMode === '3d_flight' ? (
              <FlightWorld3D
                character={character}
                quests={quests}
                timeOfDay={timeOfDay}
                onTimeOfDayChange={setTimeOfDay}
                onEnterArea={handleEnterArea}
                onAwardXP={awardXP}
                onOpenGuideTab={() => setActiveTab('guide')}
                onOpenArmoryModal={() => setIsCodexModalOpen(true)}
                onAscendGear={(slot) => {
                  const item = character.equipment[slot];
                  if (item) handleUpgradeGear(item.id);
                }}
              />
            ) : (
              <OpenWorldMap
                character={character}
                quests={quests}
                timeOfDay={timeOfDay}
                onTimeOfDayChange={setTimeOfDay}
                onEnterArea={handleEnterArea}
                onUpdateCharacterPos={handleUpdateCharacterPos}
              />
            )}
          </div>
        )}

        {/* Tab 1: 5 Daily Quests & Current Ascension Log */}
        {activeTab === 'quests' && (
          <div className="space-y-8">
            {/* Top Philosophy Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#121619] to-[#0e1113] border border-[#222830] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#c5a059] font-mono uppercase tracking-widest mb-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>The 5 Daily Quests • Mathematical Habit Engine</span>
                  </div>
                  <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#f5efe3]">
                    The Daily Ascension Engine
                  </h2>
                  <p className="text-xs sm:text-sm text-[#928b7e] max-w-2xl mt-1 leading-relaxed">
                    Sincerity over spectacle. Anchor your daily rhythms around presence, stillness, physical vitality, reflection, and quiet mastery.
                    Complete daily disciplines to unlock and upgrade equipment from Common (0–6d) ➔ Rare (7–29d) ➔ Epic (30–89d) ➔ Legendary (90+d).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Score Indicator */}
                  <div className="p-3.5 rounded-xl bg-[#161a1e] border border-[#262e36] text-center min-w-[120px]">
                    <span className="text-[10px] uppercase tracking-wider text-[#798088] font-semibold block">
                      Daily Completion
                    </span>
                    <span className="font-serif-title text-2xl font-bold text-[#c5a059] block mt-0.5">
                      {dailyScore}%
                    </span>
                    <span className="text-[11px] text-[#7d868f]">
                      {completedQuestsCount}/5 Quests Done
                    </span>
                  </div>

                  {/* Execute Check-in CTA */}
                  <button
                    onClick={() => setIsCheckinModalOpen(true)}
                    className="p-3.5 rounded-xl bg-[#c5a059] hover:bg-[#d6b066] text-[#0c0e10] font-bold text-xs flex flex-col justify-center items-center gap-1 transition-all shadow-[0_4px_16px_rgba(197,160,89,0.3)] active:scale-95 cursor-pointer min-w-[140px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-[#0c0e10]" />
                      <span className="text-sm">Submit Check-In</span>
                    </div>
                    <span className="text-[10px] opacity-80 font-normal">
                      Natural Language Parser
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* The 5 Quest Cards Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-title text-sm sm:text-base font-bold text-[#f5efe3] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#c5a059]" />
                  <span>The 5 Daily Pillars of Ascension</span>
                </h3>
                <span className="text-xs text-[#798088]">
                  Click "Mark Today" or use "+ / -" to calibrate streaks
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {QUEST_DEFINITIONS.map((def) => {
                  const status =
                    quests.find((q) => q.questId === def.id) || {
                      questId: def.id,
                      questName: def.name,
                      completed: false,
                      currentStreak: 0,
                      tier: 'Common',
                    };
                  return (
                    <QuestCard
                      key={def.id}
                      definition={def}
                      status={status}
                      onToggle={handleToggleQuest}
                      onAdjustStreak={handleAdjustStreak}
                    />
                  );
                })}
              </div>
            </div>

            {/* Current Active Ascension Log Card */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-title text-sm sm:text-base font-bold text-[#f5efe3] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c5a059]" />
                    <span>Latest Executed Ascension Log (Day {latestLog.dayNumber})</span>
                  </h3>
                  <p className="text-xs text-[#7a8189]">
                    Structured output formatted strictly per the Ascension Guide specification with 1% Better Spiritual Reflection.
                  </p>
                </div>

                <button
                  onClick={() => setIsCheckinModalOpen(true)}
                  className="text-xs text-[#c5a059] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>New Daily Check-In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <AscensionLogCard log={latestLog} />
            </div>
          </div>
        )}

        {/* Tab 2: Faceless Content Studio */}
        {activeTab === 'faceless' && <FacelessStudio />}

        {/* Tab 3: Temporal Anchors (Daily Disciplines) */}
        {activeTab === 'schedule' && <TemporalSchedule />}

        {/* Tab 4: Ascension Guide Consultation */}
        {activeTab === 'guide' && (
          <GuideConsultant quests={quests} dayNumber={dayNumber} />
        )}

        {/* Tab 5: Ascension Log Archive */}
        {activeTab === 'history' && <LogHistory logs={logs} />}
      </main>

      {/* Area Landmark Modal (When player enters an area on any island) */}
      <AreaModal
        area={selectedArea}
        island={selectedIsland}
        character={character}
        quests={quests}
        onClose={() => {
          setSelectedArea(null);
          setSelectedIsland(null);
        }}
        onCompleteHabit={handleCompleteHabitFromArea}
        onOpenCheckinParser={() => setIsCheckinModalOpen(true)}
        onFastTravel={handleFastTravelToIsland}
      />

      {/* Character Inventory & Codex Modal */}
      <CharacterInventoryModal
        isOpen={isCodexModalOpen}
        onClose={() => setIsCodexModalOpen(false)}
        character={character}
        quests={quests}
        onUpgradeGear={handleUpgradeGear}
        onUpdateTitle={(newTitle) =>
          setCharacter((prev) => ({ ...prev, activeTitle: newTitle }))
        }
        onUpdateArchetype={(archetype) =>
          setCharacter((prev) => ({ ...prev, archetype }))
        }
      />

      {/* Daily Check-In Modal */}
      <DailyCheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        dayNumber={dayNumber}
        quests={quests}
        onLogGenerated={handleLogGenerated}
      />
    </div>
  );
}

