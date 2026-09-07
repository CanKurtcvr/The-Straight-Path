import { AscensionLog, FacelessScript, SpiritualTimeAnchor, QuestStatus } from '../types';

export const INITIAL_QUEST_STATUSES: QuestStatus[] = [
  {
    questId: 'spirituality',
    questName: 'Sanctuary of the Soul (Mindfulness & Meditation)',
    completed: true,
    currentStreak: 14,
    tier: 'Rare',
    previousStreak: 13,
  },
  {
    questId: 'reflection',
    questName: 'Chamber of Reflection (Self-Audit & Renewal)',
    completed: true,
    currentStreak: 28,
    tier: 'Rare',
    previousStreak: 27,
  },
  {
    questId: 'vitality',
    questName: 'Citadel of Vitality (Physical Stewardship)',
    completed: true,
    currentStreak: 21,
    tier: 'Rare',
    previousStreak: 20,
  },
  {
    questId: 'wisdom',
    questName: 'Archive of Wisdom (Deep Focus & Study)',
    completed: false,
    currentStreak: 0,
    tier: 'Common',
    previousStreak: 8,
  },
  {
    questId: 'creation',
    questName: 'Atelier of Creation (Faceless Storytelling)',
    completed: false,
    currentStreak: 0,
    tier: 'Common',
    previousStreak: 4,
  },
];

export const INITIAL_LOGS: AscensionLog[] = [
  {
    id: 'log-14',
    dayNumber: 14,
    date: 'Today',
    score: 60,
    completionCount: 3,
    quests: INITIAL_QUEST_STATUSES,
    formattedOutput: `=== ASCENSION LOG: DAY 14 ===
Score: 60% | Completion: 3/5 Quests

[Table or List of Quests]:
- Sanctuary of the Soul: Completed | Current Streak: 14 days | Tier: Rare
- Chamber of Reflection: Completed | Current Streak: 28 days | Tier: Rare
- Citadel of Vitality: Completed | Current Streak: 21 days | Tier: Rare
- Archive of Wisdom: Missed | Current Streak: 0 days | Tier: Common
- Atelier of Creation: Missed | Current Streak: 0 days | Tier: Common

[1% Better Reflection]:
Two disciplines dissolved under friction today, yet the inner anchor of meditation and reflection held. Do not pull yourself into guilt spirals over a broken streak number; streaks are merely measurements, not the measure of your worth. Release the burden into the hearth tonight, and let your first act of tomorrow be 30 minutes of deep undistracted reading before checking any screens.`,
    reflection: 'Two disciplines dissolved under friction today, yet the inner anchor of meditation and reflection held. Do not pull yourself into guilt spirals over a broken streak number; streaks are merely measurements, not the measure of your worth. Release the burden into the hearth tonight, and let your first act of tomorrow be 30 minutes of deep undistracted reading before checking any screens.',
    rawInput: 'Day 14: Completed Meditation, Workout, Reflection. Missed Study and Creation',
  },
  {
    id: 'log-13',
    dayNumber: 13,
    date: 'Yesterday',
    score: 100,
    completionCount: 5,
    quests: [
      { questId: 'spirituality', questName: 'Sanctuary of the Soul', completed: true, currentStreak: 13, tier: 'Rare' },
      { questId: 'reflection', questName: 'Chamber of Reflection', completed: true, currentStreak: 27, tier: 'Rare' },
      { questId: 'vitality', questName: 'Citadel of Vitality', completed: true, currentStreak: 20, tier: 'Rare' },
      { questId: 'wisdom', questName: 'Archive of Wisdom', completed: true, currentStreak: 8, tier: 'Rare' },
      { questId: 'creation', questName: 'Atelier of Creation', completed: true, currentStreak: 4, tier: 'Common' },
    ],
    formattedOutput: `=== ASCENSION LOG: DAY 13 ===
Score: 100% | Completion: 5/5 Quests

[Table or List of Quests]:
- Sanctuary of the Soul: Completed | Current Streak: 13 days | Tier: Rare
- Chamber of Reflection: Completed | Current Streak: 27 days | Tier: Rare
- Citadel of Vitality: Completed | Current Streak: 20 days | Tier: Rare
- Archive of Wisdom: Completed | Current Streak: 8 days | Tier: Rare
- Atelier of Creation: Completed | Current Streak: 4 days | Tier: Common

[1% Better Reflection]:
All five realms completed in harmony. Receive this day with genuine presence and quiet satisfaction. True mastery means living these disciplines as an act of inner service without needing validation from the world.`,
    reflection: 'All five realms completed in harmony. Receive this day with genuine presence and quiet satisfaction. True mastery means living these disciplines as an act of inner service without needing validation from the world.',
  }
];

export const PRESET_SCRIPTS: FacelessScript[] = [
  {
    id: 'script-1',
    title: 'The Analog Silence Protocol',
    concept: 'Deleting distracting social apps and replacing digital hyper-stimulation with an analog notebook and morning stillness.',
    duration: '34s',
    visualHook: 'I deleted three addictive apps and bought a blank paper notebook. My brain finally stopped racing.',
    body: 'For two years, I treated self-improvement like an online performance. Micro-tracking every calorie, filming every gym set, chasing aesthetic applause. But genuine discipline is silent stewardship.',
    spiritualAnchor: 'Your day does not belong to notifications. Your morning belongs to quiet presence, breathwork, or meditation.',
    resolution: 'Start with 10 minutes of silence tomorrow. Notice what changes.',
    cinematographyNotes: [
      'Low-key exposure with natural warm window lighting',
      'Zero face reveals: focus on hands, textures, ink flow, and linen fabric',
      'Pacing: deliberate 2-second cuts, soft bloom diffusion',
      'Analog grading: deep warm shadows (3200K), soft highlight roll-off',
    ],
    bRollChecklist: [
      'Overhead macro shot of ink touching 120gsm paper',
      'Steam drifting across a dark oak surface from brass kettle',
      'Smooth glide over folded linen cushion in dawn twilight',
      'Fountain pen placed down with deliberate quietude',
    ],
    scenes: [
      {
        timestamp: '0:00 - 0:03',
        visualAction: 'Extreme close-up of phone screen in low light; thumb lingering over social app icon before pressing Delete.',
        audioScript: 'I deleted three addictive apps and bought a blank notebook. My brain finally stopped racing.',
        onScreenText: 'The noise ended here.',
      },
      {
        timestamp: '0:04 - 0:14',
        visualAction: 'Slow overhead tracking shot of hand uncapping a brass fountain pen beside a cup of black tea.',
        audioScript: 'For two years, I thought self-discipline was an aesthetic for the internet. Recording every rep, performing for strangers.',
        onScreenText: 'Discipline vs. Performance',
      },
      {
        timestamp: '0:15 - 0:25',
        visualAction: 'Low-angle raking shot of early morning light hitting clean cedar flooring; slow unrolling of meditation cushion.',
        audioScript: 'Then I realized: the soul doesn’t heal through vanity. It restores through quiet stewardship and presence.',
        onScreenText: 'Inner Restoration',
      },
      {
        timestamp: '0:26 - 0:35',
        visualAction: 'Gentle side profile of hands opening a weathered book of timeless philosophy, dust motes dancing in sunlight.',
        audioScript: 'Start your morning with stillness. Anchor your mind before the world demands your attention.',
        onScreenText: 'Anchor your day with stillness.',
      },
      {
        timestamp: '0:36 - 0:40',
        visualAction: 'Notebook gently closed with ribbon bookmark; camera pulls back into serene dimness.',
        audioScript: 'Start with 10 minutes of silence tomorrow.',
        onScreenText: 'Begin tomorrow.',
      },
    ],
    createdAt: '2026-09-07',
  },
];

export const DAILY_TIME_ANCHORS: SpiritualTimeAnchor[] = [
  {
    id: 'dawn',
    name: 'Dawn (First Light)',
    time: '05:30 AM',
    windowDescription: 'The quiet hour before digital notifications awake',
    spiritualTheme: 'Stillness, Mindful Breathing & Sacred Intention',
    scheduledRoutine: 'Unplugged contemplation, 10 minutes of meditation, hydration, and affirming your core purpose.',
    focusSymbol: '✦',
  },
  {
    id: 'midday',
    name: 'Midday (Sun Zenith)',
    time: '12:30 PM',
    windowDescription: 'Midday pause to recharge physical vitality',
    spiritualTheme: 'Physical Stewardship & Clean Nutrition',
    scheduledRoutine: 'Step away from all screens. Nourish the body with whole foods, drink clean water, and take a 15-minute outdoor walk.',
    focusSymbol: '☼',
  },
  {
    id: 'afternoon',
    name: 'Golden Hour (Deep Focus)',
    time: '04:30 PM',
    windowDescription: 'Late afternoon mental clarity block',
    spiritualTheme: 'Wisdom, Philosophy & 30m Deep Reading',
    scheduledRoutine: '30 minutes of undisturbed study of timeless philosophy, taking handwritten margin notes.',
    focusSymbol: '◈',
  },
  {
    id: 'sunset',
    name: 'Twilight (Sunset Rest)',
    time: '07:30 PM',
    windowDescription: 'Transitioning from public labor to personal craft',
    spiritualTheme: 'Faceless Storytelling & Creative Discipline',
    scheduledRoutine: 'Write one sincere script or outline visual B-roll without ego or vanity.',
    focusSymbol: '☽',
  },
  {
    id: 'night',
    name: 'Starlight (Evening Calm)',
    time: '09:45 PM',
    windowDescription: 'Night audit & releasing all burdens into the hearth',
    spiritualTheme: 'Chamber of Deep Reflection & Restful Sleep',
    scheduledRoutine: 'Evening self-audit of wins and frictions. Release all self-reproach into the hearth and prepare for tranquil sleep.',
    focusSymbol: '✧',
  },
];

export const TIME_ANCHORS = DAILY_TIME_ANCHORS;
export const PRAYER_ANCHORS = DAILY_TIME_ANCHORS;

