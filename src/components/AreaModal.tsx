import React, { useState, useEffect } from 'react';
import {
  X,
  Compass,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  BookOpen,
  Dumbbell,
  Video,
  Feather,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Send,
  Camera,
  Shield,
  HeartHandshake,
  Heart,
  Droplets,
  Apple,
  Wind,
  Smile,
  ArrowRight,
  Shirt,
  Footprints,
} from 'lucide-react';
import { WorldArea, HabitIsland, CharacterState, QuestStatus, GearSlot, getTierColor } from '../types';
import { FacelessStudio } from './FacelessStudio';
import { LocationPictureView } from './LocationPictureView';

interface AreaModalProps {
  area: WorldArea | null;
  island: HabitIsland | null;
  character: CharacterState;
  quests: QuestStatus[];
  onClose: () => void;
  onCompleteHabit: (questId: string, xpEarned: number, rewardSlot?: GearSlot) => void;
  onOpenCheckinParser: () => void;
  onFastTravel: (targetIslandId: string) => void;
}

export const AreaModal: React.FC<AreaModalProps> = ({
  area,
  island,
  character,
  quests,
  onClose,
  onCompleteHabit,
  onOpenCheckinParser,
  onFastTravel,
}) => {
  // Spiritual Restoration options
  const [spiritMode, setSpiritMode] = useState<'meditation' | 'reflection' | 'breathwork' | 'gratitude'>('meditation');
  const [meditationTimerSeconds, setMeditationTimerSeconds] = useState(10 * 60);
  const [isMeditationTimerRunning, setIsMeditationTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');
  const [gratitudeNotes, setGratitudeNotes] = useState('');
  const [reflectionIntention, setReflectionIntention] = useState('Cultivating inner peace, gratitude, and steadfast resolve for the day.');

  // Reflection Chamber options
  const [reflectionWins, setReflectionWins] = useState('');
  const [reflectionFriction, setReflectionFriction] = useState('');
  const [reflectionAdjustment, setReflectionAdjustment] = useState('');
  const [burnBurdenText, setBurnBurdenText] = useState('');
  const [hasReleasedBurden, setHasReleasedBurden] = useState(false);

  // Study Timer state (for Wisdom)
  const [studyTimeSeconds, setStudyTimeSeconds] = useState(30 * 60);
  const [isStudyTimerRunning, setIsStudyTimerRunning] = useState(false);
  const [studyNotes, setStudyNotes] = useState('');
  const [bookTitle, setBookTitle] = useState('Meditations by Marcus Aurelius / Deep Work');

  // Workout state (for Vitality)
  const [workoutType, setWorkoutType] = useState('Calisthenics & Functional Movement');
  const [workoutDuration, setWorkoutDuration] = useState('45 min');
  const [workoutIntensity, setWorkoutIntensity] = useState('High');
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [cleanMealsRating, setCleanMealsRating] = useState('Optimal (Whole Foods)');

  // Success Banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Meditation timer effect
  useEffect(() => {
    let interval: any;
    if (isMeditationTimerRunning && meditationTimerSeconds > 0) {
      interval = setInterval(() => {
        setMeditationTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeditationTimerRunning, meditationTimerSeconds]);

  // Breathing loop effect
  useEffect(() => {
    let breathInterval: any;
    if (spiritMode === 'breathwork') {
      let step = 0;
      breathInterval = setInterval(() => {
        step = (step + 1) % 3;
        if (step === 0) setBreathPhase('Inhale (4s)');
        else if (step === 1) setBreathPhase('Hold (7s)');
        else setBreathPhase('Exhale (8s)');
      }, 4500);
    }
    return () => clearInterval(breathInterval);
  }, [spiritMode]);

  // Study timer effect
  useEffect(() => {
    let interval: any;
    if (isStudyTimerRunning && studyTimeSeconds > 0) {
      interval = setInterval(() => {
        setStudyTimeSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudyTimerRunning, studyTimeSeconds]);

  if (!area || !island) return null;

  const currentQuest = island.questId ? quests.find((q) => q.questId === island.questId) : null;
  const targetGear = character.gearInventory.find((g) => g.islandOrigin === island.id);

  const handleActionComplete = (questId: string, xp: number, msg: string, slot?: GearSlot) => {
    onCompleteHabit(questId, xp, slot || area.rewardGearSlot);
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4500);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#101316] border border-[#27303c] rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-[#15191e] border-b border-[#21272f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: island.accentHex }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title font-bold text-base text-[#f5efe3]">{area.name}</h2>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold"
                  style={{
                    borderColor: `${island.accentHex}40`,
                    color: island.accentHex,
                    backgroundColor: `${island.accentHex}15`,
                  }}
                >
                  {island.conceptTitle}
                </span>
              </div>
              <p className="text-xs text-[#87909a]">{area.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7c8691] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="bg-emerald-950/70 border-b border-emerald-500/40 p-3 px-6 flex items-center gap-3 text-emerald-200 text-xs font-semibold animate-in slide-in-from-top duration-300 shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* 1. VISUAL PICTURE OF THE VISITED LOCATION */}
          <LocationPictureView area={area} island={island} />

          {/* 2. GEAR REWARD STATUS CARD */}
          {targetGear && (
            <div className="p-3.5 rounded-xl bg-[#14181d] border border-[#242c36] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border bg-black/40"
                  style={{ borderColor: targetGear.visualColor, color: targetGear.visualColor }}
                >
                  ✦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#f5efe3]">{targetGear.name}</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
                      style={{
                        color: targetGear.visualColor,
                        borderColor: `${targetGear.visualColor}50`,
                        backgroundColor: `${targetGear.visualColor}15`,
                      }}
                    >
                      {targetGear.tier} (Lv. {targetGear.level})
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7d8894]">
                    Earned gear for {island.conceptTitle}. Upgrades into Legendary with continuous effort.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-[#c5a059] block font-mono">
                  Streak: {currentQuest?.currentStreak ?? 0} Days
                </span>
                <span className="text-[10px] text-[#6d7783]">
                  {targetGear.level >= 4 ? 'Maxed (Legendary)' : `Next Tier: ${targetGear.streakRequirementForNext}d`}
                </span>
              </div>
            </div>
          )}

          {/* 3. INTERACTIVE HABIT HUBS BY DISCIPLINE */}

          {/* SPIRITUALITY: SANCTUARY OF THE SOUL */}
          {(area.questActionType === 'soul_restoration' || area.questActionType === 'salah_anchor') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#f5efe3] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>Spiritual Restoration & Inner Peace</span>
                </h3>
                <span className="text-xs text-[#7d8894]">Choose your contemplative ritual</span>
              </div>

              {/* Ritual Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'meditation', label: 'Mindfulness', icon: Sunrise },
                  { id: 'reflection', label: 'Contemplation', icon: Heart },
                  { id: 'breathwork', label: 'Breathwork', icon: Wind },
                  { id: 'gratitude', label: 'Gratitude', icon: Smile },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSpiritMode(mode.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      spiritMode === mode.id
                        ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                        : 'bg-[#14181d] border-[#222933] text-[#7d8894] hover:text-[#d1c8bb]'
                    }`}
                  >
                    <mode.icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{mode.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab 1: Mindfulness Meditation */}
              {spiritMode === 'meditation' && (
                <div className="p-5 rounded-2xl bg-[#0c141d] border border-sky-500/30 text-center space-y-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-sky-400">
                    Mindfulness Meditation Timer
                  </span>
                  <div className="font-mono text-4xl sm:text-5xl font-bold text-sky-100 tracking-wider">
                    {formatTimer(meditationTimerSeconds)}
                  </div>
                  <p className="text-xs text-[#8796a5] max-w-md mx-auto">
                    Focus on the natural sensation of breathing. When thoughts wander, gently return attention without judgment.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsMeditationTimerRunning(!isMeditationTimerRunning)}
                      className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#091522] text-xs font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                    >
                      {isMeditationTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isMeditationTimerRunning ? 'Pause Stillness' : 'Begin Meditation'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMeditationTimerRunning(false);
                        setMeditationTimerSeconds(10 * 60);
                      }}
                      className="p-2 rounded-xl bg-[#131d28] border border-sky-500/30 text-sky-300 hover:text-white cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Mindful Contemplation */}
              {spiritMode === 'reflection' && (
                <div className="p-5 rounded-2xl bg-[#0c141d] border border-sky-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-sky-200">Mindful Contemplation & Daily Intention</h4>
                  <p className="text-xs text-[#8796a5]">
                    Dedicate a moment of quiet personal stillness, affirming your core principles, seeking mental clarity, and cultivating steady resolve.
                  </p>
                  <textarea
                    value={reflectionIntention}
                    onChange={(e) => setReflectionIntention(e.target.value)}
                    rows={3}
                    placeholder="Enter your personal intention, affirmation, or quiet thought..."
                    className="w-full bg-[#121b25] border border-sky-500/30 rounded-xl p-3 text-xs text-[#f5efe3] focus:outline-none focus:border-sky-400 resize-none"
                  />
                </div>
              )}

              {/* Tab 3: Breathwork */}
              {spiritMode === 'breathwork' && (
                <div className="p-6 rounded-2xl bg-[#0c141d] border border-sky-500/30 text-center space-y-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-sky-400">
                    4-7-8 Diaphragmatic Regulation
                  </span>
                  <div className="w-24 h-24 mx-auto rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-sky-100 font-bold text-sm animate-pulse shadow-[0_0_25px_rgba(56,189,248,0.3)]">
                    {breathPhase}
                  </div>
                  <p className="text-xs text-[#8796a5]">
                    Inhale through the nose for 4s, hold gently for 7s, and exhale slowly through mouth for 8s to soothe the vagus nerve.
                  </p>
                </div>
              )}

              {/* Tab 4: Gratitude */}
              {spiritMode === 'gratitude' && (
                <div className="p-5 rounded-2xl bg-[#0c141d] border border-sky-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-sky-200">Three Blessings of Gratitude</h4>
                  <p className="text-xs text-[#8796a5]">
                    List 3 simple gifts today (clean water, quiet breath, health, loved ones) to anchor abundance.
                  </p>
                  <textarea
                    value={gratitudeNotes}
                    onChange={(e) => setGratitudeNotes(e.target.value)}
                    rows={3}
                    placeholder="1. The clarity of the morning light...&#10;2. A body capable of movement...&#10;3. Freedom to build a life of purpose..."
                    className="w-full bg-[#121b25] border border-sky-500/30 rounded-xl p-3 text-xs text-[#f5efe3] focus:outline-none focus:border-sky-400 resize-none"
                  />
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() =>
                  handleActionComplete(
                    'spirituality',
                    50,
                    '✦ Inner sanctuary restored: +50 XP and spiritual streak updated! Headgear upgraded.'
                  )
                }
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#091522] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Soul Restoration Ritual (+50 XP)</span>
              </button>
            </div>
          )}

          {/* REFLECTION: CHAMBER OF DEEP REFLECTION */}
          {(area.questActionType === 'reflection_chamber' || area.questActionType === 'alchemist_accounting') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#f5efe3] flex items-center gap-2">
                  <Feather className="w-4 h-4 text-rose-400" />
                  <span>The Chamber of Deep Reflection</span>
                </h3>
                <span className="text-xs text-[#7d8894]">Evening Audit & Mindful Renewal</span>
              </div>

              {/* Three Reflection Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#190d14] border border-rose-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-rose-300 block">1. Meaningful Wins</span>
                  <p className="text-[10px] text-[#8e858a]">Where did you stay disciplined or show kindness?</p>
                  <textarea
                    value={reflectionWins}
                    onChange={(e) => setReflectionWins(e.target.value)}
                    rows={3}
                    placeholder="Woke up early, finished writing script..."
                    className="w-full bg-[#12080e] border border-rose-500/20 rounded-lg p-2 text-xs text-[#f5efe3] focus:outline-none focus:border-rose-400 resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#190d14] border border-rose-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-rose-300 block">2. Internal Friction</span>
                  <p className="text-[10px] text-[#8e858a]">Where did you lose focus or feel reactive?</p>
                  <textarea
                    value={reflectionFriction}
                    onChange={(e) => setReflectionFriction(e.target.value)}
                    rows={3}
                    placeholder="Fell for doomscrolling for 20m before lunch..."
                    className="w-full bg-[#12080e] border border-rose-500/20 rounded-lg p-2 text-xs text-[#f5efe3] focus:outline-none focus:border-rose-400 resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#190d14] border border-rose-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-rose-300 block">3. Tomorrow's Rule</span>
                  <p className="text-[10px] text-[#8e858a]">One clear adjustment for tomorrow.</p>
                  <textarea
                    value={reflectionAdjustment}
                    onChange={(e) => setReflectionAdjustment(e.target.value)}
                    rows={3}
                    placeholder="Keep phone in another room until 10am..."
                    className="w-full bg-[#12080e] border border-rose-500/20 rounded-lg p-2 text-xs text-[#f5efe3] focus:outline-none focus:border-rose-400 resize-none"
                  />
                </div>
              </div>

              {/* The Hearth of Letting Go */}
              <div className="p-4 rounded-xl bg-[#160b11] border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>The Hearth of Release (Drop All Guilt)</span>
                  </span>
                  {hasReleasedBurden && (
                    <span className="text-[10px] font-bold text-emerald-400">Burden Released ✦ Clean Slate</span>
                  )}
                </div>
                <p className="text-xs text-[#8e858a]">
                  Type any regret or self-criticism here. Then release it into the hearth. Tomorrow is an unwritten page.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={burnBurdenText}
                    onChange={(e) => setBurnBurdenText(e.target.value)}
                    placeholder="e.g. Feeling behind on my goals..."
                    className="flex-1 bg-[#10070c] border border-rose-500/20 rounded-lg px-3 py-2 text-xs text-[#f5efe3] focus:outline-none focus:border-rose-400"
                  />
                  <button
                    onClick={() => {
                      if (burnBurdenText.trim()) {
                        setBurnBurdenText('');
                        setHasReleasedBurden(true);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold cursor-pointer transition-all"
                  >
                    Release into Hearth
                  </button>
                </div>
              </div>

              <button
                onClick={() =>
                  handleActionComplete(
                    'reflection',
                    50,
                    '✦ Evening self-accounting sealed: +50 XP! Mind cleared, Talisman of Truth empowered.'
                  )
                }
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-[#1f0710] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Evening Reflection & Renewal (+50 XP)</span>
              </button>
            </div>
          )}

          {/* VITALITY: CITADEL OF PHYSICAL HEALTH */}
          {(area.questActionType === 'vitality_training' || area.questActionType === 'athlete_workout') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#f5efe3] flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  <span>Physical Stewardship & Energy</span>
                </h3>
                <span className="text-xs text-[#7d8894]">Honoring the Physical Vessel</span>
              </div>

              {/* Workout Type and Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#091a13] border border-emerald-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-300">Movement Modality</span>
                  <select
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value)}
                    className="w-full bg-[#05110c] border border-emerald-500/30 rounded-lg p-2 text-xs text-[#f5efe3] focus:outline-none focus:border-emerald-400"
                  >
                    <option>Calisthenics & Functional Movement</option>
                    <option>Weighted Strength Training</option>
                    <option>Trail Running / Zone 2 Cardio</option>
                    <option>Mobility & Deep Stretching</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-[#091a13] border border-emerald-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-300">Duration & Intensity</span>
                  <div className="flex gap-2">
                    <select
                      value={workoutDuration}
                      onChange={(e) => setWorkoutDuration(e.target.value)}
                      className="w-1/2 bg-[#05110c] border border-emerald-500/30 rounded-lg p-2 text-xs text-[#f5efe3] focus:outline-none"
                    >
                      <option>30 min</option>
                      <option>45 min</option>
                      <option>60 min</option>
                      <option>90 min</option>
                    </select>
                    <select
                      value={workoutIntensity}
                      onChange={(e) => setWorkoutIntensity(e.target.value)}
                      className="w-1/2 bg-[#05110c] border border-emerald-500/30 rounded-lg p-2 text-xs text-[#f5efe3] focus:outline-none"
                    >
                      <option>Moderate</option>
                      <option>High</option>
                      <option>Maximum</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#091a13] border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" />
                      <span>Hydration ({waterGlasses}/8)</span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
                        className="px-1.5 py-0.5 rounded bg-black/40 text-xs font-bold text-white hover:bg-black/60"
                      >
                        -
                      </button>
                      <button
                        onClick={() => setWaterGlasses((prev) => Math.min(12, prev + 1))}
                        className="px-1.5 py-0.5 rounded bg-black/40 text-xs font-bold text-white hover:bg-black/60"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-[#05110c] h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-sky-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#7d9487] block">
                    {waterGlasses >= 8 ? 'Optimal hydration goal met!' : `${8 - waterGlasses} glasses to target.`}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  handleActionComplete(
                    'vitality',
                    50,
                    '✦ Physical training logged: +50 XP! Resilient Vessel Tunic fortified with endurance.'
                  )
                }
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#071b12] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Log Physical Health Discipline (+50 XP)</span>
              </button>
            </div>
          )}

          {/* WISDOM: ARCHIVE OF WISDOM */}
          {(area.questActionType === 'wisdom_study' || area.questActionType === 'scholar_study') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#f5efe3] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>30-Minute Focus Reading & Philosophy</span>
                </h3>
                <span className="text-xs text-[#7d8894]">Deep Intellectual Growth</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#081524] border border-blue-500/30 text-center space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
                  Undistracted Reading Clock
                </span>
                <div className="font-mono text-4xl sm:text-5xl font-bold text-blue-100 tracking-wider">
                  {formatTimer(studyTimeSeconds)}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsStudyTimerRunning(!isStudyTimerRunning)}
                    className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-[#04101c] text-xs font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                  >
                    {isStudyTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isStudyTimerRunning ? 'Pause Focus' : 'Start 30m Focus Timer'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsStudyTimerRunning(false);
                      setStudyTimeSeconds(30 * 60);
                    }}
                    className="p-2 rounded-xl bg-[#0e2136] border border-blue-500/30 text-blue-300 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Study Notes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#8ca0b5]">Active Text & Key Epiphany:</label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full bg-[#06121d] border border-blue-500/30 rounded-xl px-3 py-2 text-xs text-[#f5efe3] focus:outline-none"
                  placeholder="Text or topic title..."
                />
                <textarea
                  value={studyNotes}
                  onChange={(e) => setStudyNotes(e.target.value)}
                  rows={3}
                  placeholder="Record an insight, quote, or mental model that changed how you view reality today..."
                  className="w-full bg-[#06121d] border border-blue-500/30 rounded-xl p-3 text-xs text-[#f5efe3] focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={() =>
                  handleActionComplete(
                    'wisdom',
                    50,
                    '✦ Deep study completed: +50 XP! Scholar Stylus charged with intellectual insight.'
                  )
                }
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-[#04101c] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Deep Study Block (+50 XP)</span>
              </button>
            </div>
          )}

          {/* CREATION: ATELIER OF CREATION */}
          {(area.questActionType === 'creative_studio' || area.questActionType === 'creator_studio') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#f5efe3] flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-400" />
                  <span>Faceless Storytelling Studio</span>
                </h3>
                <span className="text-xs text-[#7d8894]">Crafting Without Vanity</span>
              </div>

              {/* Embedded Faceless Storyboard Studio */}
              <div className="rounded-2xl border border-purple-500/30 bg-[#12081d] p-4">
                <FacelessStudio />
              </div>

              <button
                onClick={() =>
                  handleActionComplete(
                    'creation',
                    50,
                    '✦ Creative discipline logged: +50 XP! Wayfarer Boots attuned for silent storytelling.'
                  )
                }
                className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-[#150424] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Log Creative Storytelling Output (+50 XP)</span>
              </button>
            </div>
          )}

          {/* NEXUS HUB: CROSSROADS & FAST TRAVEL */}
          {area.questActionType === 'nexus_hub' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#f5efe3] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>The Crossroads of Travel & Purpose</span>
                </h3>
                <span className="text-xs text-[#7d8894]">Archipelago Fast-Travel</span>
              </div>

              <p className="text-xs text-[#87909a] leading-relaxed">
                The Astral Compass aligns your trajectory with sincere personal mastery. Board an ethereal skiff to fast travel directly to any discipline island.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'spirituality', name: 'Sanctuary of the Soul', desc: 'Meditation, Breathwork & Stillness', color: '#38bdf8' },
                  { id: 'reflection', name: 'Chamber of Reflection', desc: 'Evening Audit & Letting Go', color: '#f43f5e' },
                  { id: 'vitality', name: 'Citadel of Vitality', desc: 'Physical Health & Nutrition', color: '#10b981' },
                  { id: 'wisdom', name: 'Archive of Wisdom', desc: '30m Focus Reading & Philosophy', color: '#0ea5e9' },
                  { id: 'creation', name: 'Atelier of Creation', desc: 'Faceless Script & Visual Craft', color: '#a855f7' },
                ].map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      onFastTravel(dest.id);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-[#242c36] bg-[#14181d] hover:bg-[#1a2128] hover:border-[#c5a059] flex items-center justify-between text-left transition-all cursor-pointer group"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#f5efe3] group-hover:text-[#c5a059] block">
                        {dest.name}
                      </span>
                      <span className="text-[11px] text-[#7d8894]">{dest.desc}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#7d8894] group-hover:text-[#c5a059] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
