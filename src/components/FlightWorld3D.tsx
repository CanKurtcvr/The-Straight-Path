import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import {
  Compass,
  Wind,
  Volume2,
  VolumeX,
  Eye,
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2,
  Shield,
  HelpCircle,
  X,
  Crosshair,
  Layers,
  MapPin,
  Focus,
  Feather,
  MessageSquare,
  MessageCircle,
  Send,
  Loader2,
  BookOpen,
  Flame,
  Bot,
  User,
} from 'lucide-react';
import { HabitIsland, CharacterState, QuestStatus, TimeOfDay, WorldArea, GearSlot } from '../types';
import { HABIT_ISLANDS } from '../data/worldData';
import { soundSynth } from '../audio/soundSynthesizer';
import { CharacterGearPanel } from './CharacterGearPanel';

interface FlightWorld3DProps {
  character: CharacterState;
  quests: QuestStatus[];
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (time: TimeOfDay) => void;
  onEnterArea: (area: WorldArea, island: HabitIsland) => void;
  onAwardXP?: (amount: number) => void;
  onOpenGuideTab?: () => void;
  onOpenArmoryModal?: () => void;
  onAscendGear?: (slot: GearSlot) => void;
}

// 3D coordinate mapping for islands
interface Island3DConfig {
  island: HabitIsland;
  pos: THREE.Vector3;
  radius: number;
  color: number;
  accentColor: number;
  beaconColor: number;
  height: number;
}

// Talkable NPC on the Islands
export interface IslandNPC {
  id: string;
  name: string;
  title: string;
  islandId: string;
  islandName: string;
  role: string;
  themeColor: string;
  accentHex: string;
  avatarIcon: 'Compass' | 'Sparkles' | 'Flame' | 'Shield' | 'BookOpen' | 'Feather';
  greeting: string;
  suggestedQuestions: string[];
  localPos: { x: number; y: number; z: number };
}

export const ISLAND_NPCS: IslandNPC[] = [
  {
    id: 'npc-elyon',
    name: 'Sage Elyon',
    title: 'Grand Arbiter of the Crossroads',
    islandId: 'nexus',
    islandName: "The Wayfarer's Nexus",
    role: 'Keeper of Equilibrium & Universal Mastery',
    themeColor: 'amber',
    accentHex: '#f59e0b',
    avatarIcon: 'Compass',
    greeting: 'Welcome, noble wayfarer. Here at the celestial crossroads, all five paths of ascension converge. Balance is not accidental—it is the quiet, intentional calibration of every hour. Which realm of your life feels in need of steady calibration today?',
    suggestedQuestions: [
      'How do I maintain consistency across all 5 habits without burning out?',
      'What is the highest virtue of a faceless creator?',
      'Teach me the principle of quiet stewardship of the soul.',
    ],
    localPos: { x: 14, y: 6.0, z: -16 },
  },
  {
    id: 'npc-zahra',
    name: 'Sister Zahra',
    title: 'Guardian of Stillness & Morning Light',
    islandId: 'spirituality',
    islandName: 'Sanctuary of the Soul',
    role: 'Mentor of Sincere Prayer & Mindfulness',
    themeColor: 'cyan',
    accentHex: '#38bdf8',
    avatarIcon: 'Sparkles',
    greeting: 'Peace be upon your heart, seeker. The Sanctuary of the Soul was built for those who know that before we face the noise of the world, we must anchor our own heart in pre-dawn stillness. What brings you to this altar today?',
    suggestedQuestions: [
      'How can I wake up consistently for morning meditation or prayer without friction?',
      'How do I quiet persistent internal anxiety during deep breathwork?',
      'What should I do when my heart feels dry and uninspired?',
    ],
    localPos: { x: 18, y: 6.0, z: 14 },
  },
  {
    id: 'npc-tariq',
    name: 'Hermit Tariq',
    title: 'Warden of the Hearth of Release',
    islandId: 'reflection',
    islandName: 'Chamber of Reflection',
    role: 'Guide to Honest Self-Audit & Guilt-Free Renewal',
    themeColor: 'rose',
    accentHex: '#f43f5e',
    avatarIcon: 'Flame',
    greeting: 'Welcome to the Chamber. Here, there are no judges—only the warmth of the fire. If you stumbled, missed a daily pillar, or feel burdened by self-blame, lay it down here into the hearth. What friction is troubling you?',
    suggestedQuestions: [
      'I broke my meditation streak today and feel paralyzed by guilt. How do I reset?',
      'How do I conduct an honest evening self-audit without falling into self-loathing?',
      'What is the difference between healthy remorse and destructive shame?',
    ],
    localPos: { x: -16, y: 6.0, z: 15 },
  },
  {
    id: 'npc-rayan',
    name: 'Captain Rayan',
    title: 'Paragon of Physical Discipline',
    islandId: 'vitality',
    islandName: 'Citadel of Vitality',
    role: 'Champion of Physical Health & Unbreakable Vigor',
    themeColor: 'emerald',
    accentHex: '#10b981',
    avatarIcon: 'Shield',
    greeting: 'Stand tall, wayfarer! The physical vessel is the sacred temple through which all spiritual and creative energy flows. When you conquer physical inertia, mental clarity follows naturally. What training challenge do you face?',
    suggestedQuestions: [
      'How can I stay disciplined with calisthenics or workouts on low-energy days?',
      'How do I balance intense physical training with demanding deep-work study blocks?',
      'What daily physical habits yield the highest energy returns?',
    ],
    localPos: { x: 18, y: 6.0, z: -14 },
  },
  {
    id: 'npc-idris',
    name: 'Archivist Idris',
    title: 'Master of the Deep Scriptorium',
    islandId: 'wisdom',
    islandName: 'Archive of Wisdom',
    role: 'Philosopher of 30-Minute Undisturbed Focus',
    themeColor: 'blue',
    accentHex: '#60a5fa',
    avatarIcon: 'BookOpen',
    greeting: 'Greetings, seeker of timeless truths. In a culture designed to fragment your mind with infinite notifications, reading an analog book for 30 undisturbed minutes is an act of supreme courage. What knowledge do you seek?',
    suggestedQuestions: [
      'How do I silence the urge to check my phone during 30 minutes of deep reading?',
      'What timeless philosophical or spiritual books should a disciplined wayfarer read first?',
      'How do I take actionable notes from what I read each day?',
    ],
    localPos: { x: -18, y: 6.0, z: 14 },
  },
  {
    id: 'npc-layla',
    name: 'Artisan Layla',
    title: 'Architect of Faceless Storytelling',
    islandId: 'creation',
    islandName: 'Atelier of Creation',
    role: 'Creative Director of Egoless Storytelling',
    themeColor: 'purple',
    accentHex: '#c084fc',
    avatarIcon: 'Feather',
    greeting: 'Welcome to the Atelier. When you hide your face in your art, you make the work about the idea, the truth, and the beauty—not your ego. Let your craft speak with purity. What creative piece are you shaping?',
    suggestedQuestions: [
      'How do I make faceless videos connect deeply with viewers without showing my face?',
      'How do I ensure my storytelling doesn’t slip into another vanity aesthetic?',
      'What are the best visual storytelling motifs for contemplative videos?',
    ],
    localPos: { x: 16, y: 6.0, z: -16 },
  },
];

// Helper: Canvas Texture Billboard Sprite for NPC Nametags
function createNPCLabelSprite(name: string, title: string, colorHex: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Draw stylish glassmorphic pill background
    ctx.fillStyle = 'rgba(10, 15, 22, 0.88)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(16, 20, 480, 120, 24) : ctx.rect(16, 20, 480, 120);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = colorHex;
    ctx.stroke();

    // Name text
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(name, 256, 70);

    // Title / "[T] Talk" text
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = colorHex;
    ctx.fillText(`💬 [T] ${title}`, 256, 110);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(7.5, 2.3, 1.0);
  sprite.position.set(0, 4.8, 0);
  return sprite;
}

// Helper: Create 3D Stylized Character Model for Island NPCs
function createNPCEntity(npc: IslandNPC): {
  group: THREE.Group;
  beaconRune: THREE.Mesh;
  relicMesh: THREE.Mesh;
  halo: THREE.Mesh;
} {
  const npcGroup = new THREE.Group();
  npcGroup.name = `npc-${npc.id}`;

  const themeHex = parseInt(npc.accentHex.replace('#', '0x'), 16);

  // 1. Sacred Stone Pedestal
  const basePedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.7, 0.3, 24),
    new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    })
  );
  basePedestal.position.y = 0.15;
  basePedestal.receiveShadow = true;
  npcGroup.add(basePedestal);

  // Glowing inner circular rune
  const runeCircle = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.1, 0.05, 24),
    new THREE.MeshStandardMaterial({
      color: themeHex,
      emissive: themeHex,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.75,
    })
  );
  runeCircle.position.y = 0.32;
  npcGroup.add(runeCircle);

  // 2. Robed Character Figure
  const robeMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.7,
    metalness: 0.1,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: themeHex,
    roughness: 0.4,
    metalness: 0.25,
    emissive: themeHex,
    emissiveIntensity: 0.2,
  });

  // Lower Robe / Cassock
  const robeMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.95, 1.8, 16),
    robeMat
  );
  robeMesh.position.y = 1.2;
  robeMesh.castShadow = true;
  npcGroup.add(robeMesh);

  // Decorative sash / Stole
  const sashMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 1.4, 0.15),
    accentMat
  );
  sashMesh.position.set(0, 1.35, 0.48);
  npcGroup.add(sashMesh);

  // Shoulder Mantle
  const mantleMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.92, 1.0, 16),
    accentMat
  );
  mantleMesh.position.y = 2.1;
  mantleMesh.castShadow = true;
  npcGroup.add(mantleMesh);

  // Hooded Head
  const hoodMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.44, 16, 16),
    robeMat
  );
  hoodMesh.position.y = 2.45;
  hoodMesh.castShadow = true;
  npcGroup.add(hoodMesh);

  // Inner Serene Face Glow
  const innerFace = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
    })
  );
  innerFace.position.set(0, 2.42, 0.2);
  npcGroup.add(innerFace);

  // 3. Unique Floating Sacred Relic
  let relicMesh: THREE.Mesh;
  if (npc.id === 'npc-zahra') {
    // Lotus Rosary
    relicMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.08, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.7 })
    );
  } else if (npc.id === 'npc-tariq') {
    // Hearth Ember
    relicMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.38, 1),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 0.9 })
    );
  } else if (npc.id === 'npc-rayan') {
    // Vitality Crest
    relicMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.65, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.6 })
    );
  } else if (npc.id === 'npc-idris') {
    // Scriptorium Book
    relicMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x60a5fa, emissiveIntensity: 0.6 })
    );
  } else if (npc.id === 'npc-layla') {
    // Prism of Creativity
    relicMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42, 0),
      new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xc084fc, emissiveIntensity: 0.8 })
    );
  } else {
    // Astrolabe for Sage Elyon
    relicMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.45, 0.06, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
    );
  }
  relicMesh.position.set(1.2, 1.7, 0.3);
  npcGroup.add(relicMesh);

  // 4. Overhead Halo
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.035, 8, 24),
    new THREE.MeshBasicMaterial({ color: themeHex, transparent: true, opacity: 0.85 })
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.set(0, 3.1, 0);
  npcGroup.add(halo);

  // 5. Overhead Rotating Dialogue Beacon Rune
  const beaconRune = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.45, 0),
    new THREE.MeshBasicMaterial({ color: themeHex })
  );
  beaconRune.position.set(0, 3.8, 0);
  npcGroup.add(beaconRune);

  // Overhead Canvas Billboard Sprite
  const nametagSprite = createNPCLabelSprite(npc.name, npc.title, npc.accentHex);
  npcGroup.add(nametagSprite);

  return { group: npcGroup, beaconRune, relicMesh, halo };
}

export const FlightWorld3D: React.FC<FlightWorld3DProps> = ({
  character,
  quests,
  timeOfDay,
  onTimeOfDayChange,
  onEnterArea,
  onAwardXP,
  onOpenGuideTab,
  onOpenArmoryModal,
  onAscendGear,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // UI States
  const [speedKnots, setSpeedKnots] = useState(0);
  const [altitudeMeters, setAltitudeMeters] = useState(120);
  const [currentIsland, setCurrentIsland] = useState<HabitIsland | null>(null);
  const [nearSanctuary, setNearSanctuary] = useState<WorldArea | null>(null);
  const [nearSanctuaryIsland, setNearSanctuaryIsland] = useState<HabitIsland | null>(null);
  const [collectedEssence, setCollectedEssence] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraMode, setCameraMode] = useState<'chase' | 'cinematic' | 'firstPerson'>('chase');
  const [flightState, setFlightState] = useState<'SOARING' | 'GLIDING' | 'DIVING' | 'BOOSTING' | 'PERCHED'>('SOARING');
  const [isDofEnabled, setIsDofEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [headingDegrees, setHeadingDegrees] = useState(0);

  // Character & Gear Panel States (Land Transformation Feature)
  const [isGearPanelOpen, setIsGearPanelOpen] = useState(false);
  const [isGroundedUI, setIsGroundedUI] = useState(false);
  const [transformToast, setTransformToast] = useState<string | null>(null);
  const transformToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerTransformToast = useCallback((msg: string) => {
    setTransformToast(msg);
    if (transformToastTimeoutRef.current) clearTimeout(transformToastTimeoutRef.current);
    transformToastTimeoutRef.current = setTimeout(() => {
      setTransformToast(null);
    }, 4500);
  }, []);

  const triggerTransformToastRef = useRef(triggerTransformToast);
  triggerTransformToastRef.current = triggerTransformToast;

  // NPC Interaction and Chat States
  const [nearNPC, setNearNPC] = useState<IslandNPC | null>(null);
  const [chatNPC, setChatNPC] = useState<IslandNPC | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Record<string, { id: string; sender: 'npc' | 'user'; content: string; timestamp: string }[]>
  >({});
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Interaction Refs for loop access
  const nearSanctuaryRef = useRef<WorldArea | null>(null);
  const nearSanctuaryIslandRef = useRef<HabitIsland | null>(null);
  nearSanctuaryRef.current = nearSanctuary;
  nearSanctuaryIslandRef.current = nearSanctuaryIsland;

  const nearNPCRef = useRef<IslandNPC | null>(null);
  nearNPCRef.current = nearNPC;

  const isChatOpenRef = useRef(false);
  isChatOpenRef.current = isChatOpen;

  const isDofEnabledRef = useRef(isDofEnabled);
  isDofEnabledRef.current = isDofEnabled;

  const wasGroundedRef = useRef(false);

  // Open Chat with specific NPC
  const handleOpenNPCChat = useCallback((npc: IslandNPC) => {
    setChatNPC(npc);
    setIsChatOpen(true);
    soundSynth.playItemObtain();

    // Initialize greeting if empty
    setChatMessages((prev) => {
      if (prev[npc.id] && prev[npc.id].length > 0) return prev;
      return {
        ...prev,
        [npc.id]: [
          {
            id: `init-${npc.id}`,
            sender: 'npc',
            content: npc.greeting,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
    });
  }, []);

  // Send message to NPC through Ascension consultation endpoint
  const handleSendChatMessage = useCallback(
    async (textToSend: string) => {
      const text = textToSend || chatInput;
      if (!text.trim() || !chatNPC || chatLoading) return;

      const currentNPC = chatNPC;
      const userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user' as const,
        content: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => ({
        ...prev,
        [currentNPC.id]: [...(prev[currentNPC.id] || []), userMsg],
      }));
      setChatInput('');
      setChatLoading(true);
      soundSynth.playItemObtain();

      try {
        const streakObj = quests.reduce((acc, q) => {
          acc[q.questId] = q.currentStreak;
          return acc;
        }, {} as Record<string, number>);

        const res = await fetch('/api/ascension/consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `${text.trim()} (Persona instruction: You are speaking as ${currentNPC.name}, "${currentNPC.title}" at ${currentNPC.islandName}. Your role is ${currentNPC.role}. Provide grounded, poetic, and actionable spiritual guidance for their daily habits, remaining fully in character.)`,
            currentStreaks: streakObj,
          }),
        });

        if (!res.ok) {
          throw new Error('Consultation request failed');
        }

        const data = await res.json();
        const replyText = data.reply || currentNPC.greeting;

        const npcReply = {
          id: `npc-${Date.now()}`,
          sender: 'npc' as const,
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setChatMessages((prev) => ({
          ...prev,
          [currentNPC.id]: [...(prev[currentNPC.id] || []), npcReply],
        }));
        soundSynth.playLevelUp();
      } catch (err) {
        console.error('NPC Chat error:', err);
        const fallbackReply = {
          id: `npc-${Date.now()}`,
          sender: 'npc' as const,
          content: `Quiet your heart, wayfarer. Here at ${currentNPC.islandName}, true ascension is forged not through grand declarations, but through the quiet, unbreakable consistency of the daily hour. Keep faith with your morning and evening disciplines.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => ({
          ...prev,
          [currentNPC.id]: [...(prev[currentNPC.id] || []), fallbackReply],
        }));
      } finally {
        setChatLoading(false);
      }
    },
    [chatInput, chatNPC, chatLoading, quests]
  );

  // Flight physics state
  const physicsRef = useRef({
    pos: new THREE.Vector3(0, 120, 150),
    vel: new THREE.Vector3(0, 0, -15),
    speed: 16,
    maxSpeed: 48,
    minSpeed: 4,
    boostMultiplier: 1.0,
    pitch: 0,
    yaw: 0,
    roll: 0,
    isGrounded: false,
    flappingWingPhase: 0,
    wingFlapSpeed: 6.0,
    isGliding: true,
    keys: {
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      Space: false,
      ShiftLeft: false,
      ShiftRight: false,
      KeyE: false,
      KeyF: false,
    },
    mouseDrag: false,
    prevMouse: { x: 0, y: 0 },
    orbitOffset: new THREE.Vector2(0, 0),
  });

  // Handle Land & Enter Area
  const handleEnterNearestSanctuary = useCallback(() => {
    if (nearSanctuaryRef.current && nearSanctuaryIslandRef.current) {
      soundSynth.playChime(660);
      onEnterArea(nearSanctuaryRef.current, nearSanctuaryIslandRef.current);
    }
  }, [onEnterArea]);

  // Fast autopilot soar to selected island
  const handleFastSoarToIsland = (targetIsland: HabitIsland) => {
    soundSynth.playSpeedBoost();
    const config = islandConfigs.find((c) => c.island.id === targetIsland.id);
    if (!config) return;

    // Reposition bird 75 units in front of island at high altitude with heading towards it
    const approachDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
    const targetPos = config.pos.clone().add(approachDir.multiplyScalar(config.radius + 60));
    targetPos.y = config.pos.y + 45;

    physicsRef.current.pos.copy(targetPos);
    physicsRef.current.vel.set(0, 0, 0);
    physicsRef.current.isGrounded = false;
    setFlightState('SOARING');

    // Look at island center
    const toIsland = config.pos.clone().sub(targetPos).normalize();
    physicsRef.current.yaw = Math.atan2(toIsland.x, toIsland.z) + Math.PI;
    physicsRef.current.pitch = -0.15;
    physicsRef.current.speed = 24;
  };

  // Convert HABIT_ISLANDS to 3D Space Coordinates
  const islandConfigs: Island3DConfig[] = React.useMemo(() => {
    return HABIT_ISLANDS.map((island) => {
      const x = (island.x - 1100) * 0.45;
      const z = (island.y - 850) * 0.45;

      let y = 35;
      let col = 0x38bdf8;
      let acc = 0x60a5fa;
      let beacon = 0x38bdf8;

      switch (island.id) {
        case 'nexus':
          y = 30;
          col = 0xf59e0b;
          acc = 0xd97706;
          beacon = 0xfbbf24;
          break;
        case 'spirituality':
          y = 55;
          col = 0x38bdf8;
          acc = 0x0284c7;
          beacon = 0x38bdf8;
          break;
        case 'reflection':
          y = 45;
          col = 0xf43f5e;
          acc = 0xbe123c;
          beacon = 0xfb7185;
          break;
        case 'vitality':
          y = 40;
          col = 0x10b981;
          acc = 0x059669;
          beacon = 0x34d399;
          break;
        case 'wisdom':
          y = 65;
          col = 0x3b82f6;
          acc = 0x1d4ed8;
          beacon = 0x60a5fa;
          break;
        case 'creation':
          y = 50;
          col = 0xa855f7;
          acc = 0x7e22ce;
          beacon = 0xc084fc;
          break;
      }

      return {
        island,
        pos: new THREE.Vector3(x, y, z),
        radius: island.radius * 0.4,
        color: col,
        accentColor: acc,
        beaconColor: beacon,
        height: y,
      };
    });
  }, []);

  // Time of Day Palette Presets for Skybox and Environment
  const timeOfDayPalettes = React.useMemo(() => {
    return {
      dawn: {
        skyTop: new THREE.Color(0x1c2b48),
        skyHorizon: new THREE.Color(0xe07a5f),
        skyBottom: new THREE.Color(0x3d2645),
        sunPos: new THREE.Vector3(500, 320, -700).normalize(),
        sunColor: new THREE.Color(0xffd166),
        sunAuraColor: 0xf43f5e,
        ambientColor: new THREE.Color(0xfde2e4),
        ambientIntensity: 0.95,
        dirColor: new THREE.Color(0xffe8d6),
        dirIntensity: 1.8,
        fogColor: new THREE.Color(0x1e202f),
        cloudSeaColor: 0x241e30,
      },
      midday: {
        skyTop: new THREE.Color(0x0ea5e9),
        skyHorizon: new THREE.Color(0xbae6fd),
        skyBottom: new THREE.Color(0x38bdf8),
        sunPos: new THREE.Vector3(200, 900, -300).normalize(),
        sunColor: new THREE.Color(0xffffff),
        sunAuraColor: 0xfef08a,
        ambientColor: new THREE.Color(0xe0f2fe),
        ambientIntensity: 1.1,
        dirColor: new THREE.Color(0xfffbeb),
        dirIntensity: 2.2,
        fogColor: new THREE.Color(0x7dd3fc),
        cloudSeaColor: 0x1e3a5f,
      },
      golden_hour: {
        skyTop: new THREE.Color(0x312e81),
        skyHorizon: new THREE.Color(0xf59e0b),
        skyBottom: new THREE.Color(0x7c2d12),
        sunPos: new THREE.Vector3(450, 260, -750).normalize(),
        sunColor: new THREE.Color(0xfde047),
        sunAuraColor: 0xd97706,
        ambientColor: new THREE.Color(0xfef3c7),
        ambientIntensity: 0.9,
        dirColor: new THREE.Color(0xfbbf24),
        dirIntensity: 2.0,
        fogColor: new THREE.Color(0x2d1f30),
        cloudSeaColor: 0x361f2b,
      },
      twilight: {
        skyTop: new THREE.Color(0x0f172a),
        skyHorizon: new THREE.Color(0xa855f7),
        skyBottom: new THREE.Color(0x3b0764),
        sunPos: new THREE.Vector3(450, 150, -850).normalize(),
        sunColor: new THREE.Color(0xf43f5e),
        sunAuraColor: 0x9333ea,
        ambientColor: new THREE.Color(0xc084fc),
        ambientIntensity: 0.7,
        dirColor: new THREE.Color(0xd946ef),
        dirIntensity: 1.4,
        fogColor: new THREE.Color(0x181028),
        cloudSeaColor: 0x1f1430,
      },
      starlight: {
        skyTop: new THREE.Color(0x030712),
        skyHorizon: new THREE.Color(0x1e1b4b),
        skyBottom: new THREE.Color(0x0f172a),
        sunPos: new THREE.Vector3(300, 600, -700).normalize(),
        sunColor: new THREE.Color(0xe0e7ff),
        sunAuraColor: 0x6366f1,
        ambientColor: new THREE.Color(0x818cf8),
        ambientIntensity: 0.6,
        dirColor: new THREE.Color(0xc7d2fe),
        dirIntensity: 1.2,
        fogColor: new THREE.Color(0x080c16),
        cloudSeaColor: 0x0d131f,
      },
    };
  }, []);

  // Shared refs for dynamic time-of-day updates
  const envRefs = useRef<{
    skyMat?: THREE.ShaderMaterial;
    sunGroup?: THREE.Group;
    sunMeshMat?: THREE.MeshBasicMaterial;
    sunAuraMat?: THREE.MeshBasicMaterial;
    dirLight?: THREE.DirectionalLight;
    ambientLight?: THREE.AmbientLight;
    cloudSeaMat?: THREE.MeshStandardMaterial;
    scene?: THREE.Scene;
  }>({});

  // Main Three.js Setup & Animation Loop
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    soundSynth.init();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    envRefs.current.scene = scene;
    const curPalette = timeOfDayPalettes[timeOfDay] || timeOfDayPalettes.dawn;
    scene.fog = new THREE.FogExp2(curPalette.fogColor.getHex(), 0.0016);

    const camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.5,
      3500
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Beautiful Skybox & Celestial Dome
    const skyGeo = new THREE.SphereGeometry(2400, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: curPalette.skyTop.clone() },
        bottomColor: { value: curPalette.skyBottom.clone() },
        horizonColor: { value: curPalette.skyHorizon.clone() },
        sunPosition: { value: curPalette.sunPos.clone() },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonColor;
        uniform vec3 sunPosition;
        uniform float time;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = dir.y;

          // Atmospheric gradient blending
          vec3 sky = mix(horizonColor, topColor, max(h, 0.0));
          if (h < 0.0) {
            sky = mix(horizonColor, bottomColor, clamp(-h * 2.2, 0.0, 1.0));
          }

          // Subtle celestial shimmer / cosmic haze
          float shimmer = sin(dir.x * 20.0 + time * 0.2) * cos(dir.z * 20.0 + time * 0.15) * 0.03;
          sky += vec3(shimmer * 0.5, shimmer * 0.7, shimmer);

          // Luminous sun flare & coronal atmosphere
          float sunDot = max(dot(dir, sunPosition), 0.0);
          vec3 sunCore = vec3(1.0, 0.95, 0.8) * pow(sunDot, 180.0) * 2.4;
          vec3 sunHalo = vec3(1.0, 0.8, 0.5) * pow(sunDot, 18.0) * 0.75;
          vec3 sunGlow = horizonColor * pow(sunDot, 4.0) * 0.45;

          gl_FragColor = vec4(sky + sunCore + sunHalo + sunGlow, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
    envRefs.current.skyMat = skyMat;
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // Stars Field (3800 twinkling starlight points)
    const starCount = 3800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2100 + Math.random() * 200;
      const sinPhi = Math.sin(phi);
      starPositions[i * 3] = r * sinPhi * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 40;
      starPositions[i * 3 + 2] = r * sinPhi * Math.sin(theta);

      const isGold = Math.random() > 0.82;
      const isCyan = !isGold && Math.random() > 0.75;
      starColors[i * 3] = isGold ? 1.0 : isCyan ? 0.7 : 0.92;
      starColors[i * 3 + 1] = isGold ? 0.88 : isCyan ? 0.9 : 0.96;
      starColors[i * 3 + 2] = isGold ? 0.4 : 1.0;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 3.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Sun disc mesh with radiant coronal lens aura
    const sunGroup = new THREE.Group();
    envRefs.current.sunGroup = sunGroup;
    const sunMeshMat = new THREE.MeshBasicMaterial({ color: curPalette.sunColor });
    envRefs.current.sunMeshMat = sunMeshMat;
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(42, 16, 16), sunMeshMat);
    sunGroup.add(sunMesh);

    const sunAuraMat = new THREE.MeshBasicMaterial({
      color: curPalette.sunAuraColor,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
    });
    envRefs.current.sunAuraMat = sunAuraMat;
    const sunAura = new THREE.Mesh(new THREE.RingGeometry(42, 180, 36), sunAuraMat);
    sunGroup.add(sunAura);
    sunGroup.position.copy(curPalette.sunPos).multiplyScalar(1000);
    sunAura.lookAt(0, 0, 0);
    scene.add(sunGroup);

    // 3. Shimmering Ocean of Clouds beneath islands
    const cloudSeaGeo = new THREE.PlaneGeometry(3800, 3800, 64, 64);
    const cloudSeaMat = new THREE.MeshStandardMaterial({
      color: curPalette.cloudSeaColor,
      roughness: 0.35,
      metalness: 0.2,
      emissive: 0x0c1420,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88,
    });
    envRefs.current.cloudSeaMat = cloudSeaMat;
    const cloudSea = new THREE.Mesh(cloudSeaGeo, cloudSeaMat);
    cloudSea.rotation.x = -Math.PI / 2;
    cloudSea.position.y = -60;
    scene.add(cloudSea);

    // Floating fluffy cloud clusters
    const cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xe2eaf4,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0.48,
    });
    for (let c = 0; c < 32; c++) {
      const puffCluster = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 5);
      for (let p = 0; p < numPuffs; p++) {
        const radius = 24 + Math.random() * 38;
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 70,
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 70
        );
        puffCluster.add(puff);
      }
      puffCluster.position.set(
        (Math.random() - 0.5) * 1800,
        -15 + Math.random() * 50,
        (Math.random() - 0.5) * 1800
      );
      cloudGroup.add(puffCluster);
    }
    scene.add(cloudGroup);

    // Ambient floating celestial feathers / dust motes in sky
    const moteCount = 180;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePos[i * 3] = (Math.random() - 0.5) * 200;
      motePos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      motePos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.2,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const motePoints = new THREE.Points(moteGeo, moteMat);
    scene.add(motePoints);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(curPalette.ambientColor, curPalette.ambientIntensity);
    envRefs.current.ambientLight = ambientLight;
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(curPalette.dirColor, curPalette.dirIntensity);
    dirLight.position.copy(curPalette.sunPos).multiplyScalar(1000);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 100;
    dirLight.shadow.camera.far = 2500;
    const shadowD = 800;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    envRefs.current.dirLight = dirLight;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1f1a26, 0.65);
    scene.add(hemiLight);

    // 5. Construct 3D Floating Habit Islands
    const islandMeshes: THREE.Group[] = [];
    const islandBeaconRays: THREE.Mesh[] = [];

    islandConfigs.forEach((cfg) => {
      const islandRoot = new THREE.Group();
      islandRoot.position.copy(cfg.pos);

      // Main plateau top
      const topGeo = new THREE.CylinderGeometry(cfg.radius, cfg.radius * 0.85, 12, 32);
      const topMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.65,
        metalness: 0.15,
        flatShading: true,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.receiveShadow = true;
      islandRoot.add(topMesh);

      // Rugged bottom floating stalactite
      const botGeo = new THREE.ConeGeometry(cfg.radius * 0.85, cfg.radius * 1.4, 24);
      const botMat = new THREE.MeshStandardMaterial({
        color: 0x1e242b,
        roughness: 0.95,
        flatShading: true,
      });
      const botMesh = new THREE.Mesh(botGeo, botMat);
      botMesh.rotation.x = Math.PI;
      botMesh.position.y = -cfg.radius * 0.7;
      botMesh.castShadow = true;
      islandRoot.add(botMesh);

      // Outer glowing sanctuary boundary ring
      const ringGeo = new THREE.TorusGeometry(cfg.radius * 1.08, 1.2, 12, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cfg.beaconColor,
        transparent: true,
        opacity: 0.45,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 2;
      islandRoot.add(ringMesh);

      // Landmark / Monument structure in center
      const landmarkGroup = new THREE.Group();
      landmarkGroup.position.y = 6;

      if (cfg.island.id === 'spirituality') {
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({
            color: 0xbae6fd,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.85,
          })
        );
        landmarkGroup.add(dome);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const spire = new THREE.Mesh(
            new THREE.ConeGeometry(2.5, 28, 6),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 })
          );
          spire.position.set(Math.cos(angle) * 26, 14, Math.sin(angle) * 26);
          landmarkGroup.add(spire);
        }
      } else if (cfg.island.id === 'reflection') {
        const arch = new THREE.Mesh(
          new THREE.TorusGeometry(20, 3, 12, 32, Math.PI),
          new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 })
        );
        arch.position.y = 10;
        landmarkGroup.add(arch);
        const hearth = new THREE.Mesh(
          new THREE.CylinderGeometry(8, 10, 4, 16),
          new THREE.MeshStandardMaterial({ color: 0x27272a })
        );
        hearth.position.y = 2;
        landmarkGroup.add(hearth);
        const fire = new THREE.Mesh(
          new THREE.OctahedronGeometry(6, 2),
          new THREE.MeshBasicMaterial({ color: 0xf43f5e })
        );
        fire.position.y = 8;
        landmarkGroup.add(fire);
      } else if (cfg.island.id === 'vitality') {
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(4, 7, 30, 8),
          new THREE.MeshStandardMaterial({ color: 0x45220c })
        );
        trunk.position.y = 15;
        landmarkGroup.add(trunk);
        const foliage = new THREE.Mesh(
          new THREE.DodecahedronGeometry(22, 1),
          new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.8 })
        );
        foliage.position.y = 36;
        landmarkGroup.add(foliage);
      } else if (cfg.island.id === 'wisdom') {
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(18, 22, 12, 16),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })
        );
        base.position.y = 6;
        landmarkGroup.add(base);
        const astrolabe = new THREE.Mesh(
          new THREE.TorusGeometry(16, 1.2, 12, 36),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 })
        );
        astrolabe.position.y = 22;
        astrolabe.name = 'astrolabeRing';
        landmarkGroup.add(astrolabe);
      } else if (cfg.island.id === 'creation') {
        const prism = new THREE.Mesh(
          new THREE.OctahedronGeometry(14, 0),
          new THREE.MeshStandardMaterial({
            color: 0xc084fc,
            metalness: 0.6,
            roughness: 0.1,
            transparent: true,
            opacity: 0.9,
          })
        );
        prism.position.y = 20;
        landmarkGroup.add(prism);
      } else {
        const sundialPillar = new THREE.Mesh(
          new THREE.ConeGeometry(8, 30, 8),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 })
        );
        sundialPillar.position.y = 15;
        landmarkGroup.add(sundialPillar);
      }

      islandRoot.add(landmarkGroup);

      // Sky Beacon (Vertical Pillar of Light)
      const beaconGeo = new THREE.CylinderGeometry(1.5, 4, 400, 16, 1, true);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: cfg.beaconColor,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 200;
      islandRoot.add(beacon);
      islandBeaconRays.push(beacon);

      scene.add(islandRoot);
      islandMeshes.push(islandRoot);
    });

    // 5.5. POPULATE TALKABLE SPIRITUAL NPCS ON THE ISLANDS
    const npcEntities: {
      npc: IslandNPC;
      group: THREE.Group;
      beaconRune: THREE.Mesh;
      relicMesh: THREE.Mesh;
      halo: THREE.Mesh;
      worldPos: THREE.Vector3;
    }[] = [];

    ISLAND_NPCS.forEach((npc) => {
      const islandCfg = islandConfigs.find((c) => c.island.id === npc.islandId);
      if (!islandCfg) return;

      const entity = createNPCEntity(npc);
      const worldX = islandCfg.pos.x + npc.localPos.x;
      const worldY = islandCfg.pos.y + npc.localPos.y;
      const worldZ = islandCfg.pos.z + npc.localPos.z;

      entity.group.position.set(worldX, worldY, worldZ);
      // Face towards approaching fliers
      entity.group.lookAt(islandCfg.pos.x, worldY, islandCfg.pos.z);
      entity.group.rotation.y += Math.PI; // Face outwards toward visitor
      scene.add(entity.group);

      npcEntities.push({
        npc,
        group: entity.group,
        beaconRune: entity.beaconRune,
        relicMesh: entity.relicMesh,
        halo: entity.halo,
        worldPos: new THREE.Vector3(worldX, worldY, worldZ),
      });
    });

    // 6. Floating Starlight Essence Rings in Sky
    const essenceRings: { mesh: THREE.Mesh; pos: THREE.Vector3; collected: boolean }[] = [];
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      side: THREE.DoubleSide,
    });
    for (let r = 0; r < 20; r++) {
      const angle = (r / 20) * Math.PI * 2;
      const radius = 180 + (r % 3) * 110;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 60 + Math.sin(r * 2) * 35;

      const ring = new THREE.Mesh(new THREE.TorusGeometry(8, 0.9, 12, 32), ringMat.clone());
      ring.position.set(x, y, z);
      ring.lookAt(0, y, 0);
      scene.add(ring);
      essenceRings.push({ mesh: ring, pos: ring.position, collected: false });
    }

    // 7. BUILD THE MAJESTIC SPIRITUAL WHITE BIRD
    const birdRoot = new THREE.Group();
    const birdBody = new THREE.Group();
    birdRoot.add(birdBody);

    // Materials for White Bird
    const whiteFeatherMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.08,
      emissive: 0xffffff,
      emissiveIntensity: 0.08,
    });

    const softWingTipMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdf4,
      roughness: 0.2,
      metalness: 0.12,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });

    const amberGoldBeakMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.5,
    });

    const darkEyeMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.1,
      metalness: 0.9,
    });

    const talonGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4,
      metalness: 0.6,
    });

    // Main Torso / Aerodynamic Breast & Body
    const torsoGeo = new THREE.SphereGeometry(1.0, 24, 18);
    const torso = new THREE.Mesh(torsoGeo, whiteFeatherMat);
    torso.scale.set(0.85, 0.72, 1.85);
    torso.position.set(0, 0, 0);
    torso.castShadow = true;
    birdBody.add(torso);

    // Rounded Upper Breast (Keel)
    const breastGeo = new THREE.SphereGeometry(0.75, 16, 16);
    const breast = new THREE.Mesh(breastGeo, whiteFeatherMat);
    breast.scale.set(0.8, 0.85, 0.95);
    breast.position.set(0, -0.1, 0.55);
    breast.castShadow = true;
    birdBody.add(breast);

    // Inner Glowing Soul Crystal / Heart of Light
    const heartGeo = new THREE.OctahedronGeometry(0.32, 1);
    const heartMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.85,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.set(0, 0, 0.2);
    birdBody.add(heartMesh);

    // Avian Neck & Sleek Head
    const neckGeo = new THREE.CylinderGeometry(0.38, 0.55, 0.85, 16);
    const neck = new THREE.Mesh(neckGeo, whiteFeatherMat);
    neck.position.set(0, 0.45, 0.85);
    neck.rotation.x = 0.55;
    birdBody.add(neck);

    const headGeo = new THREE.SphereGeometry(0.48, 18, 16);
    const head = new THREE.Mesh(headGeo, whiteFeatherMat);
    head.scale.set(0.78, 0.88, 1.05);
    head.position.set(0, 0.82, 1.18);
    head.castShadow = true;
    birdBody.add(head);

    // Elegant Curved Golden Beak
    const beakGeo = new THREE.ConeGeometry(0.18, 0.72, 10);
    const beak = new THREE.Mesh(beakGeo, amberGoldBeakMat);
    beak.position.set(0, 0.72, 1.74);
    beak.rotation.x = Math.PI / 2 - 0.15;
    beak.castShadow = true;
    birdBody.add(beak);

    // Keen Avian Eyes (Left & Right)
    const eyeGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const leftEye = new THREE.Mesh(eyeGeo, darkEyeMat);
    leftEye.position.set(0.32, 0.88, 1.28);
    birdBody.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, darkEyeMat);
    rightEye.position.set(-0.32, 0.88, 1.28);
    birdBody.add(rightEye);

    // Flowing Feathery Crown Crest
    const crestGroup = new THREE.Group();
    crestGroup.position.set(0, 1.05, 1.0);
    for (let c = 0; c < 4; c++) {
      const plumeGeo = new THREE.ConeGeometry(0.08, 0.65 + c * 0.15, 6);
      const plume = new THREE.Mesh(plumeGeo, softWingTipMat);
      plume.position.set(0, 0.15 + c * 0.05, -c * 0.18);
      plume.rotation.x = -0.55 - c * 0.18;
      crestGroup.add(plume);
    }
    birdBody.add(crestGroup);

    // Celestial Golden Halo hovering over the bird's crown
    const haloGeo = new THREE.TorusGeometry(0.7, 0.038, 8, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.9,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 1.55, 1.1);
    birdBody.add(halo);

    // ARTICULATED FEATHERED WINGS (Left & Right)
    // Structure: Shoulder -> MidWing -> Primaries & Secondaries
    const createBirdWing = (isLeft: boolean) => {
      const wingRoot = new THREE.Group();
      const mult = isLeft ? 1 : -1;

      // Shoulder / Humerus
      const shoulderJoint = new THREE.Group();
      wingRoot.add(shoulderJoint);

      const shoulderBone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.32, 1.8, 10),
        whiteFeatherMat
      );
      shoulderBone.position.set(mult * 0.9, 0, 0);
      shoulderBone.rotation.z = mult * 1.57;
      shoulderJoint.add(shoulderBone);

      // Mid Wing / Forearm Joint
      const midWingJoint = new THREE.Group();
      midWingJoint.position.set(mult * 1.8, 0, 0);
      shoulderJoint.add(midWingJoint);

      const forearmBone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.24, 2.2, 10),
        whiteFeatherMat
      );
      forearmBone.position.set(mult * 1.1, 0, 0);
      forearmBone.rotation.z = mult * 1.57;
      midWingJoint.add(forearmBone);

      // Primary Flight Feathers (Long sculpted outer feathers)
      const primaryFeathersGroup = new THREE.Group();
      midWingJoint.add(primaryFeathersGroup);

      const numPrimaries = 7;
      for (let i = 0; i < numPrimaries; i++) {
        const length = 2.6 - i * 0.25;
        const width = 0.38;
        const feather = new THREE.Mesh(
          new THREE.BoxGeometry(width, length, 0.05),
          softWingTipMat
        );
        feather.position.set(
          mult * (1.2 + i * 0.45),
          -length * 0.45,
          -0.2 - i * 0.12
        );
        feather.rotation.z = mult * (0.35 + i * 0.08);
        feather.rotation.y = mult * (-0.15 - i * 0.05);
        feather.rotation.x = -0.15;
        feather.castShadow = true;
        primaryFeathersGroup.add(feather);
      }

      // Secondary Flight Feathers (Inner trailing edge)
      const numSecondaries = 6;
      for (let j = 0; j < numSecondaries; j++) {
        const sLength = 1.8 - j * 0.15;
        const sWidth = 0.35;
        const sFeather = new THREE.Mesh(
          new THREE.BoxGeometry(sWidth, sLength, 0.05),
          whiteFeatherMat
        );
        sFeather.position.set(
          mult * (0.3 + j * 0.3),
          -sLength * 0.45,
          -0.45 - j * 0.06
        );
        sFeather.rotation.z = mult * 0.2;
        sFeather.rotation.x = -0.22;
        shoulderJoint.add(sFeather);
      }

      return {
        wingRoot,
        shoulderJoint,
        midWingJoint,
        primaryFeathersGroup,
      };
    };

    const leftWing = createBirdWing(true);
    leftWing.wingRoot.position.set(0.65, 0.2, 0.2);
    birdBody.add(leftWing.wingRoot);

    const rightWing = createBirdWing(false);
    rightWing.wingRoot.position.set(-0.65, 0.2, 0.2);
    birdBody.add(rightWing.wingRoot);

    // Graceful Tiered Fan Tail Feathers
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.1, -1.5);
    const numTailFeathers = 7;
    for (let t = 0; t < numTailFeathers; t++) {
      const spread = (t - 3) * 0.16; // -0.48 to +0.48
      const centerDist = Math.abs(t - 3);
      const length = 2.4 - centerDist * 0.25;
      const tFeather = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, length, 0.04),
        whiteFeatherMat
      );
      tFeather.position.set(spread * 1.4, -0.05, -length * 0.48);
      tFeather.rotation.y = spread * 0.45;
      tFeather.rotation.x = -0.15;
      tFeather.castShadow = true;
      tailGroup.add(tFeather);
    }
    birdBody.add(tailGroup);

    // Tucked Flight Talons / Ground Perching Feet
    const feetGroup = new THREE.Group();
    feetGroup.position.set(0, -0.55, -0.3);
    const leftFoot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.6, 6),
      talonGoldMat
    );
    leftFoot.position.set(0.3, 0, 0);
    leftFoot.rotation.x = 0.5;
    feetGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.6, 6),
      talonGoldMat
    );
    rightFoot.position.set(-0.3, 0, 0);
    rightFoot.rotation.x = 0.5;
    feetGroup.add(rightFoot);
    birdBody.add(feetGroup);

    // ==========================================
    // 7B. GROUNDED HUMANOID CHARACTER MODEL
    // Transforms from bird when player touches land!
    // Visible gear: Head Cowl/Circlet, Chest Armor, Equipped Weapon in Hand, Sacred Amulet, Traveler Boots
    // ==========================================
    const humanoidBody = new THREE.Group();
    humanoidBody.position.set(0, 0, 0);
    humanoidBody.visible = false; // Initially airborne
    birdRoot.add(humanoidBody);

    // Gear visual styling from character.equipment
    const eq = character.equipment || {
      head: null,
      chest: null,
      weapon: null,
      accessory: null,
      feet: null,
    };
    const headColor = eq.head?.visualColor ? parseInt(eq.head.visualColor.replace('#', '0x')) : 0x38bdf8;
    const chestColor = eq.chest?.visualColor ? parseInt(eq.chest.visualColor.replace('#', '0x')) : 0x10b981;
    const weaponColor = eq.weapon?.visualColor ? parseInt(eq.weapon.visualColor.replace('#', '0x')) : 0xc084fc;
    const accessoryColor = eq.accessory?.visualColor ? parseInt(eq.accessory.visualColor.replace('#', '0x')) : 0xf43f5e;
    const feetColor = eq.feet?.visualColor ? parseInt(eq.feet.visualColor.replace('#', '0x')) : 0x475569;

    const charSkinMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.45,
      metalness: 0.1,
      emissive: 0xfde047,
      emissiveIntensity: 0.12,
    });

    const charChestMat = new THREE.MeshStandardMaterial({
      color: chestColor,
      roughness: 0.35,
      metalness: 0.4,
      emissive: chestColor,
      emissiveIntensity: 0.22,
    });

    const charHeadGearMat = new THREE.MeshStandardMaterial({
      color: headColor,
      roughness: 0.3,
      metalness: 0.5,
      emissive: headColor,
      emissiveIntensity: 0.28,
    });

    const charWeaponMat = new THREE.MeshStandardMaterial({
      color: weaponColor,
      roughness: 0.2,
      metalness: 0.85,
      emissive: weaponColor,
      emissiveIntensity: 0.65,
    });

    const charAccessoryMat = new THREE.MeshStandardMaterial({
      color: accessoryColor,
      roughness: 0.15,
      metalness: 0.9,
      emissive: accessoryColor,
      emissiveIntensity: 0.8,
    });

    const charBootsMat = new THREE.MeshStandardMaterial({
      color: feetColor,
      roughness: 0.6,
      metalness: 0.25,
    });

    const charGoldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.85,
    });

    // 1. Torso & Discipline Vestment
    const charTorsoGroup = new THREE.Group();
    charTorsoGroup.position.set(0, 1.8, 0);
    humanoidBody.add(charTorsoGroup);

    const charTorsoMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.42, 1.45, 16),
      charChestMat
    );
    charTorsoMesh.castShadow = true;
    charTorsoGroup.add(charTorsoMesh);

    // Golden Belt Sash & Discipline Buckle
    const charBelt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.22, 16),
      charGoldAccentMat
    );
    charBelt.position.set(0, -0.6, 0);
    charTorsoGroup.add(charBelt);

    const charBuckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.24, 0.12),
      charGoldAccentMat
    );
    charBuckle.position.set(0, -0.6, 0.48);
    charTorsoGroup.add(charBuckle);

    // Flowing Wayfarer Cloak
    const charCloak = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 1.85, 0.08),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.85,
        side: THREE.DoubleSide,
      })
    );
    charCloak.position.set(0, -0.4, -0.46);
    charTorsoGroup.add(charCloak);

    // 2. Head & Cowl / Circlet
    const charHeadGroup = new THREE.Group();
    charHeadGroup.position.set(0, 1.0, 0);
    charTorsoGroup.add(charHeadGroup);

    const charHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 16, 16),
      charSkinMat
    );
    charHead.castShadow = true;
    charHeadGroup.add(charHead);

    // Head Gear: Cowl / Hood
    const charCowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.75),
      charHeadGearMat
    );
    charCowl.position.set(0, 0.06, 0);
    charHeadGroup.add(charCowl);

    // Head Jewel / Circlet crest
    const charHeadCrest = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      charGoldAccentMat
    );
    charHeadCrest.position.set(0, 0.35, 0.4);
    charHeadGroup.add(charHeadCrest);

    // Floating Sacred Halo / Starlight Ring above head
    const charHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.03, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.88 })
    );
    charHalo.rotation.x = Math.PI / 2;
    charHalo.position.set(0, 0.7, 0);
    charHeadGroup.add(charHalo);

    // 3. Neck & Sacred Accessory Relic
    const charAmulet = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.16, 0),
      charAccessoryMat
    );
    charAmulet.position.set(0, 0.28, 0.5);
    charTorsoGroup.add(charAmulet);

    // 4. Arms & Equipped Weapon
    // Left Arm (Balanced posture)
    const charLeftArmGroup = new THREE.Group();
    charLeftArmGroup.position.set(0.68, 0.45, 0);
    charTorsoGroup.add(charLeftArmGroup);

    const charLeftPauldron = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      charChestMat
    );
    charLeftArmGroup.add(charLeftPauldron);

    const charLeftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 1.1, 10),
      charSkinMat
    );
    charLeftArm.position.set(0, -0.55, 0);
    charLeftArmGroup.add(charLeftArm);

    // Right Arm (Holding weapon)
    const charRightArmGroup = new THREE.Group();
    charRightArmGroup.position.set(-0.68, 0.45, 0);
    charTorsoGroup.add(charRightArmGroup);

    const charRightPauldron = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      charChestMat
    );
    charRightArmGroup.add(charRightPauldron);

    const charRightArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 1.1, 10),
      charSkinMat
    );
    charRightArm.position.set(0, -0.55, 0);
    charRightArmGroup.add(charRightArm);

    // Equipped Weapon in Right Hand (Scribe Stylus / Sacred Spear)
    const charWeaponGroup = new THREE.Group();
    charWeaponGroup.position.set(0, -1.0, 0.35);
    charWeaponGroup.rotation.x = 0.35;
    charRightArmGroup.add(charWeaponGroup);

    const charStaff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8),
      charGoldAccentMat
    );
    charWeaponGroup.add(charStaff);

    const charWeaponTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.8, 8),
      charWeaponMat
    );
    charWeaponTip.position.set(0, 1.3, 0);
    charWeaponGroup.add(charWeaponTip);

    // 5. Legs & Traveler Boots
    // Left Leg
    const charLeftLegGroup = new THREE.Group();
    charLeftLegGroup.position.set(0.28, -0.7, 0);
    charTorsoGroup.add(charLeftLegGroup);

    const charLeftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.12, 1.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    charLeftLeg.position.set(0, -0.5, 0);
    charLeftLegGroup.add(charLeftLeg);

    const charLeftBoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.35, 0.5),
      charBootsMat
    );
    charLeftBoot.position.set(0, -1.05, 0.1);
    charLeftLegGroup.add(charLeftBoot);

    // Right Leg
    const charRightLegGroup = new THREE.Group();
    charRightLegGroup.position.set(-0.28, -0.7, 0);
    charTorsoGroup.add(charRightLegGroup);

    const charRightLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.12, 1.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    charRightLeg.position.set(0, -0.5, 0);
    charRightLegGroup.add(charRightLeg);

    const charRightBoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.35, 0.5),
      charBootsMat
    );
    charRightBoot.position.set(0, -1.05, 0.1);
    charRightLegGroup.add(charRightBoot);

    // 6. Ground Sacred Lotus Aura (Rotates under feet)
    const charGroundAura = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 2.2, 32),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      })
    );
    charGroundAura.rotation.x = Math.PI / 2;
    charGroundAura.position.set(0, -1.8, 0);
    humanoidBody.add(charGroundAura);

    // 7. Transformation Ring Shockwave FX
    const transformAuraMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.3, 5.0, 36),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      })
    );
    transformAuraMesh.rotation.x = Math.PI / 2;
    transformAuraMesh.position.set(0, -1.0, 0);
    birdRoot.add(transformAuraMesh);

    let walkPhase = 0;
    let idlePhase = 0;
    let transformAnimTime = 0;

    scene.add(birdRoot);

    // Dual Wingtip Starlight Ribbon Particle Trails
    const trailCount = 90;
    const createTrailSystem = (color: number) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(trailCount * 3);
      for (let i = 0; i < trailCount * 3; i++) pos[i] = 0;
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color,
        size: 3.5,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      return { geo, points, headIdx: 0 };
    };

    const leftTrail = createTrailSystem(0x7dd3fc);
    const rightTrail = createTrailSystem(0xfde047);

    // 8. DEPTH OF FIELD POST-PROCESSING (EffectComposer + BokehPass)
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bokehPass = new BokehPass(scene, camera, {
      focus: 14.0,
      aperture: 0.00014,
      maxblur: 0.016,
    });
    composer.addPass(bokehPass);

    // 9. Key Listeners for Flight Controls
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in NPC Chat, don't trigger flight controls
      if (isChatOpenRef.current) {
        if (e.code === 'Escape') {
          setIsChatOpen(false);
          e.preventDefault();
        }
        return;
      }

      const keys = physicsRef.current.keys;
      if (e.code in keys) {
        keys[e.code as keyof typeof keys] = true;
      }
      if (e.code === 'KeyT') {
        if (nearNPCRef.current) {
          handleOpenNPCChat(nearNPCRef.current);
          e.preventDefault();
        }
      }
      if (e.code === 'KeyE') {
        handleEnterNearestSanctuary();
      }
      if (e.code === 'KeyC') {
        setCameraMode((prev) => (prev === 'chase' ? 'cinematic' : prev === 'cinematic' ? 'firstPerson' : 'chase'));
      }
      if (e.code === 'KeyM') {
        const muted = soundSynth.toggleMute();
        setIsMuted(muted);
      }
      if (e.code === 'KeyG') {
        setIsGearPanelOpen((prev) => !prev);
        e.preventDefault();
      }
      if (e.code === 'KeyF') {
        // Toggle land/flight
        physicsRef.current.isGrounded = !physicsRef.current.isGrounded;
        if (!physicsRef.current.isGrounded) {
          physicsRef.current.pos.y += 10;
          physicsRef.current.speed = 18;
          soundSynth.playWingWhoosh();
          transformAnimTime = 0.9;
          setIsGroundedUI(false);
          triggerTransformToastRef.current('Ascended to Flight — Transformed to Celestial Bird');
        } else {
          physicsRef.current.vel.set(0, 0, 0);
          soundSynth.playChime(660);
          soundSynth.playItemObtain();
          transformAnimTime = 0.9;
          setIsGroundedUI(true);
          setIsGearPanelOpen(true);
          triggerTransformToastRef.current('Touched Island Sanctuary — Spiritual Form & Gear Manifested!');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = physicsRef.current.keys;
      if (e.code in keys) {
        keys[e.code as keyof typeof keys] = false;
      }
    };

    // Canvas click: raycast to talkable NPCs
    const handleCanvasClick = (e: MouseEvent) => {
      if (isChatOpenRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      for (const item of npcEntities) {
        const hits = raycaster.intersectObjects(item.group.children, true);
        if (hits.length > 0 && hits[0].distance < 85) {
          handleOpenNPCChat(item.npc);
          return;
        }
      }
    };

    // Mouse drag for 360 camera orbit
    const handleMouseDown = (e: MouseEvent) => {
      physicsRef.current.mouseDrag = true;
      physicsRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!physicsRef.current.mouseDrag) return;
      const dx = e.clientX - physicsRef.current.prevMouse.x;
      const dy = e.clientY - physicsRef.current.prevMouse.y;
      physicsRef.current.prevMouse = { x: e.clientX, y: e.clientY };

      physicsRef.current.orbitOffset.x -= dx * 0.005;
      physicsRef.current.orbitOffset.y = Math.max(
        -0.85,
        Math.min(0.85, physicsRef.current.orbitOffset.y + dy * 0.005)
      );
    };

    const handleMouseUp = () => {
      physicsRef.current.mouseDrag = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          composer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    // 11. CAMERA PHYSICS & SWAY ANIMATION STATE
    const camPhysics = {
      pos: new THREE.Vector3(0, 125, 170),
      lookAt: new THREE.Vector3(0, 120, 150),
      roll: 0,
      baseDist: 14.5,
      baseHeight: 4.2,
      swayTime: 0,
    };

    // 12. REAL TIME ANIMATION & FLIGHT LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let tickCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      tickCount++;

      const p = physicsRef.current;
      const keys = p.keys;

      // Update Skybox shader time
      if (envRefs.current.skyMat) {
        envRefs.current.skyMat.uniforms.time.value = elapsed;
      }

      // --- Flight State & Flight Controls ---
      const isBoosting = keys.Space;
      const isDiving = keys.ShiftLeft || keys.ShiftRight;

      if (p.isGrounded) {
        setFlightState('PERCHED');
        p.isGliding = false;

        // Ground walking physics
        let moveX = 0;
        let moveZ = 0;
        if (keys.KeyW) moveZ -= 1;
        if (keys.KeyS) moveZ += 1;
        if (keys.KeyA) moveX -= 1;
        if (keys.KeyD) moveX += 1;

        if (moveX !== 0 || moveZ !== 0) {
          const walkDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
          walkDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw);
          p.pos.add(walkDir.multiplyScalar(12 * delta));
        }

        // Takeoff with space
        if (keys.Space) {
          p.isGrounded = false;
          p.vel.set(0, 14, 0);
          p.speed = 18;
          soundSynth.playSpeedBoost();
          soundSynth.playWingWhoosh();
          transformAnimTime = 0.9;
          setIsGroundedUI(false);
          triggerTransformToastRef.current('Ascended to Flight — Transformed to Celestial Bird');
        }

        p.pitch = THREE.MathUtils.lerp(p.pitch, 0, 0.1);
        p.roll = THREE.MathUtils.lerp(p.roll, 0, 0.1);
      } else {
        // Airborne Aerodynamics
        if (isBoosting) {
          setFlightState('BOOSTING');
          p.boostMultiplier = THREE.MathUtils.lerp(p.boostMultiplier, 1.85, 0.1);
          p.isGliding = false;
        } else if (isDiving || p.pitch < -0.3) {
          setFlightState('DIVING');
          p.boostMultiplier = THREE.MathUtils.lerp(p.boostMultiplier, 1.5, 0.08);
          p.isGliding = false;
        } else if (Math.abs(p.pitch) < 0.15 && !keys.KeyW && !keys.KeyS) {
          setFlightState('GLIDING');
          p.boostMultiplier = THREE.MathUtils.lerp(p.boostMultiplier, 1.0, 0.08);
          p.isGliding = true;
        } else {
          setFlightState('SOARING');
          p.boostMultiplier = THREE.MathUtils.lerp(p.boostMultiplier, 1.0, 0.08);
          p.isGliding = false;
        }

        // Pitch input (W = dive, S = climb)
        const pitchTarget = keys.KeyW ? -0.58 : keys.KeyS ? 0.62 : isDiving ? -0.45 : 0.0;
        p.pitch = THREE.MathUtils.lerp(p.pitch, pitchTarget, 0.08);

        // Yaw & Roll banking input (A = bank left, D = bank right)
        let turnRate = 0;
        let rollTarget = 0;
        if (keys.KeyA) {
          turnRate = 1.4;
          rollTarget = -0.75; // bank left
        } else if (keys.KeyD) {
          turnRate = -1.4;
          rollTarget = 0.75; // bank right
        }
        p.yaw += turnRate * delta;
        p.roll = THREE.MathUtils.lerp(p.roll, rollTarget, 0.12);

        // Calculate Forward Airspeed & Thrust
        let targetSpeed = 16 * p.boostMultiplier;
        if (p.pitch < 0) {
          targetSpeed += Math.abs(p.pitch) * 24; // gravity dive boost
        } else if (p.pitch > 0) {
          targetSpeed -= p.pitch * 11; // climb cost
        }
        p.speed = THREE.MathUtils.lerp(p.speed, Math.max(p.minSpeed, targetSpeed), 0.06);

        // Forward flight vector from Pitch and Yaw
        const forward = new THREE.Vector3(
          Math.sin(p.yaw) * Math.cos(p.pitch),
          Math.sin(p.pitch),
          Math.cos(p.yaw) * Math.cos(p.pitch)
        ).normalize();

        // Lift counteracting gravity
        const lift = new THREE.Vector3(0, (p.speed / 20) * 9.8 - 9.8, 0);
        if (isBoosting) {
          lift.y += 20;
        }

        p.vel.copy(forward.multiplyScalar(p.speed));
        p.vel.add(lift.multiplyScalar(delta));
        p.pos.add(p.vel.clone().multiplyScalar(delta));

        // Wing flapping speed & phase: dynamic and continuous flapping
        p.wingFlapSpeed = isBoosting
          ? 15.5
          : isDiving
          ? 7.5
          : Math.max(5.5, 4.2 + (p.speed / p.maxSpeed) * 6.5);
        p.flappingWingPhase += p.wingFlapSpeed * delta;

        // Sound update
        soundSynth.setFlightSpeed(p.speed / p.maxSpeed);

        // Cloud ocean boundary floor
        if (p.pos.y < -20) {
          p.pos.y = -20;
          p.vel.y = Math.max(0, p.vel.y);
          p.pitch = 0.35;
        }
      }

      // --- ANIMATE VISUAL AVATAR (AIRBORNE BIRD VS GROUNDED WAYFARER WITH VISIBLE GEAR) ---
      birdRoot.position.copy(p.pos);

      // Synchronize grounded state with UI and trigger transformation if needed
      if (p.isGrounded && !wasGroundedRef.current) {
        wasGroundedRef.current = true;
        setIsGroundedUI(true);
        setIsGearPanelOpen(true);
        transformAnimTime = 0.9;
      } else if (!p.isGrounded && wasGroundedRef.current) {
        wasGroundedRef.current = false;
        setIsGroundedUI(false);
        transformAnimTime = 0.9;
      }

      // Update Transformation Shockwave Visual Effect
      if (transformAnimTime > 0) {
        transformAnimTime -= delta * 1.6;
        const progress = 1 - Math.max(0, transformAnimTime / 0.9);
        transformAuraMesh.visible = true;
        (transformAuraMesh.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.9;
        const s = 1 + progress * 2.8;
        transformAuraMesh.scale.set(s, s, s);
      } else {
        transformAuraMesh.visible = false;
      }

      // Switch 3D Appearance: Airborne Celestial Bird vs Grounded Character with Visible Gear
      if (p.isGrounded) {
        birdBody.visible = false;
        humanoidBody.visible = true;

        // Ground Humanoid Pose & Walking Dynamics
        humanoidBody.rotation.set(0, p.yaw, 0);

        const isWalking = (keys.KeyW || keys.KeyS || keys.KeyA || keys.KeyD);
        if (isWalking) {
          walkPhase += delta * 8.5;
          const legSwing = Math.sin(walkPhase) * 0.65;
          charLeftLegGroup.rotation.x = legSwing;
          charRightLegGroup.rotation.x = -legSwing;
          charLeftArmGroup.rotation.x = -legSwing * 0.55;
          charRightArmGroup.rotation.x = legSwing * 0.35;
          charCloak.rotation.x = 0.25 + Math.abs(Math.sin(walkPhase * 2)) * 0.15;
          charTorsoGroup.position.y = 1.8 + Math.abs(Math.sin(walkPhase * 2)) * 0.08;
        } else {
          idlePhase += delta * 2.2;
          const idleBreath = Math.sin(idlePhase) * 0.04;
          charTorsoGroup.position.y = 1.8 + idleBreath;
          charLeftLegGroup.rotation.x = 0;
          charRightLegGroup.rotation.x = 0;
          charLeftArmGroup.rotation.x = Math.sin(idlePhase) * 0.08;
          charRightArmGroup.rotation.x = 0.15 + Math.sin(idlePhase * 1.2) * 0.06;
          charCloak.rotation.x = 0.05 + Math.sin(idlePhase * 1.5) * 0.04;
        }

        // Floating Sacred Halo & Ground Lotus Aura animation
        charHalo.rotation.z = elapsed * 1.5;
        charGroundAura.rotation.z = -elapsed * 0.8;
        charGroundAura.scale.set(
          1 + Math.sin(elapsed * 3) * 0.06,
          1 + Math.sin(elapsed * 3) * 0.06,
          1
        );
        (charGroundAura.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(elapsed * 4) * 0.2;
      } else {
        birdBody.visible = true;
        humanoidBody.visible = false;

        // Bird naturally points forward along +Z in local space: -p.pitch tilts beak down/up, p.yaw steers heading, p.roll banks
        birdBody.rotation.set(-p.pitch, p.yaw, p.roll, 'YXZ');

        const flapSin = Math.sin(p.flappingWingPhase);
        const flapCos = Math.cos(p.flappingWingPhase);

        // Heart of light breathing pulse
        const pulse = Math.sin(elapsed * 4) * 0.2 + 0.9;
        heartMesh.scale.set(pulse, pulse, pulse);

        // Crown halo rotation & shine
        halo.rotation.z = elapsed * 1.6;

        // Breast & keel aerodynamic breathing heave
        breast.position.y = -0.1 + flapSin * 0.035;

        // Head & neck subtle aerodynamic bob in sync with wing thrust
        head.position.y = 0.82 + flapSin * 0.045;
        head.position.z = 1.18 + flapCos * 0.035;
        neck.position.y = 0.45 + flapSin * 0.025;

        // Crest plumage fluttering in wind
        crestGroup.children.forEach((plume, idx) => {
          plume.rotation.x = -0.55 - idx * 0.18 + Math.sin(elapsed * 12 + idx) * 0.08 + (p.speed / 50) * 0.2;
        });

        // Tail Fan Animation: rudders on bank/yaw, spreads on climb, narrows on dive, undulates with flap
        const tailFanSpread = isDiving ? 0.6 : p.pitch > 0.2 ? 1.4 : 1.0;
        tailGroup.scale.x = THREE.MathUtils.lerp(tailGroup.scale.x, tailFanSpread, 0.1);
        tailGroup.rotation.y = THREE.MathUtils.lerp(tailGroup.rotation.y, (keys.KeyA ? 0.3 : keys.KeyD ? -0.3 : 0), 0.12);
        tailGroup.rotation.x = THREE.MathUtils.lerp(tailGroup.rotation.x, -p.pitch * 0.4 + flapSin * 0.12, 0.1);

        // Perching Feet Animation: tucked back in flight, extended down on ground
        const footAngle = p.isGrounded ? 0.2 : 0.85;
        leftFoot.rotation.x = THREE.MathUtils.lerp(leftFoot.rotation.x, footAngle, 0.1);
        rightFoot.rotation.x = THREE.MathUtils.lerp(rightFoot.rotation.x, footAngle, 0.1);

        // Dynamic Wing Aerodynamic Articulation: CONTINUOUS FLAPPING AS IT FLIES
        if (isDiving) {
          // High-speed falcon dive: swept-back wings with rapid micro-fluttering
          const diveFlutter = Math.sin(p.flappingWingPhase * 1.5) * 0.08;
          leftWing.shoulderJoint.rotation.set(0.4 + diveFlutter * 0.2, 0.95, -0.2 + diveFlutter);
          leftWing.midWingJoint.rotation.set(0, 0.3, -0.6);
          rightWing.shoulderJoint.rotation.set(0.4 + diveFlutter * 0.2, -0.95, 0.2 - diveFlutter);
          rightWing.midWingJoint.rotation.set(0, -0.3, 0.6);
        } else {
          // Dynamic flapping animations as it flies across all soaring / cruising / boosting states
          const flapAmp = isBoosting ? 0.82 : 0.65;
          const shoulderAngle = flapSin * flapAmp;
          const elbowFlex = Math.sin(p.flappingWingPhase - 0.45) * (isBoosting ? 0.45 : 0.35);
          const wingPitchTwist = -flapCos * 0.22; // Aerodynamic angle of attack twist

          leftWing.shoulderJoint.rotation.set(wingPitchTwist, 0.08, shoulderAngle);
          leftWing.midWingJoint.rotation.set(0, 0, elbowFlex);
          leftWing.primaryFeathersGroup.rotation.z = Math.sin(p.flappingWingPhase - 0.7) * 0.24;

          rightWing.shoulderJoint.rotation.set(wingPitchTwist, -0.08, -shoulderAngle);
          rightWing.midWingJoint.rotation.set(0, 0, -elbowFlex);
          rightWing.primaryFeathersGroup.rotation.z = -Math.sin(p.flappingWingPhase - 0.7) * 0.24;
        }
      }

      // Starlight Ribbon Trails from Wingtips
      const leftTipWorld = new THREE.Vector3(4.2, 0, -0.6)
        .applyEuler(birdBody.rotation)
        .add(p.pos);
      const rightTipWorld = new THREE.Vector3(-4.2, 0, -0.6)
        .applyEuler(birdBody.rotation)
        .add(p.pos);

      const lPosArr = leftTrail.geo.attributes.position.array as Float32Array;
      lPosArr[leftTrail.headIdx * 3] = leftTipWorld.x;
      lPosArr[leftTrail.headIdx * 3 + 1] = leftTipWorld.y;
      lPosArr[leftTrail.headIdx * 3 + 2] = leftTipWorld.z;
      leftTrail.headIdx = (leftTrail.headIdx + 1) % trailCount;
      leftTrail.geo.attributes.position.needsUpdate = true;

      const rPosArr = rightTrail.geo.attributes.position.array as Float32Array;
      rPosArr[rightTrail.headIdx * 3] = rightTipWorld.x;
      rPosArr[rightTrail.headIdx * 3 + 1] = rightTipWorld.y;
      rPosArr[rightTrail.headIdx * 3 + 2] = rightTipWorld.z;
      rightTrail.headIdx = (rightTrail.headIdx + 1) % trailCount;
      rightTrail.geo.attributes.position.needsUpdate = true;

      // Celestial motes gentle drift
      const motesArr = moteGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < moteCount; i++) {
        motesArr[i * 3 + 1] -= delta * 3.0;
        if (motesArr[i * 3 + 1] < p.pos.y - 40) {
          motesArr[i * 3 + 1] = p.pos.y + 40;
        }
      }
      moteGeo.attributes.position.needsUpdate = true;

      // Rotate island astrolabes & beacons
      scene.traverse((obj) => {
        if (obj.name === 'astrolabeRing') {
          obj.rotation.y += 0.01;
          obj.rotation.x += 0.005;
        }
      });
      islandBeaconRays.forEach((ray, i) => {
        (ray.material as THREE.MeshBasicMaterial).opacity =
          0.25 + Math.sin(elapsed * 2 + i) * 0.15;
      });

      // Essence Rings Collection Check
      essenceRings.forEach((ring) => {
        if (!ring.collected && ring.pos.distanceTo(p.pos) < 14) {
          ring.collected = true;
          ring.mesh.visible = false;
          soundSynth.playChime(784);
          soundSynth.playSpeedBoost();
          p.speed = Math.min(p.maxSpeed, p.speed + 12);
          setCollectedEssence((prev) => prev + 1);
          if (onAwardXP) onAwardXP(25);
        }
      });

      // Island Landing & Sanctuary Proximity Check
      let activeIsland: HabitIsland | null = null;
      let activeSanctuary: WorldArea | null = null;

      islandConfigs.forEach((cfg) => {
        const distXZ = new THREE.Vector2(p.pos.x - cfg.pos.x, p.pos.z - cfg.pos.z).length();
        if (distXZ < cfg.radius * 1.4) {
          activeIsland = cfg.island;

          const plateauHeight = cfg.height + 6;
          if (distXZ < cfg.radius && Math.abs(p.pos.y - plateauHeight) < 8 && !keys.Space) {
            if (!p.isGrounded && p.vel.y <= 0) {
              p.isGrounded = true;
              p.pos.y = plateauHeight;
              p.vel.set(0, 0, 0);
              soundSynth.playChime(660);
              soundSynth.playItemObtain();
              transformAnimTime = 0.9;
              setIsGroundedUI(true);
              setIsGearPanelOpen(true);
              triggerTransformToastRef.current(`Landed at ${cfg.island.name} — Transformed to Wayfarer & Visible Gear Manifested!`);
            }
          }

          if (distXZ < cfg.radius * 0.6) {
            activeSanctuary = cfg.island.areas[0] || null;
          }
        }
      });

      // Island Talkable NPC Animation & Proximity Detection
      let closestNPC: IslandNPC | null = null;
      let minNpcDist = 999999;

      npcEntities.forEach((entity, idx) => {
        // Subtle spiritual floating & breathing
        entity.group.position.y = entity.worldPos.y + Math.sin(elapsed * 2.2 + idx) * 0.12;

        // Relic spinning and vertical hover
        entity.relicMesh.rotation.y += delta * 1.5;
        entity.relicMesh.position.y = 1.7 + Math.sin(elapsed * 3.0 + idx) * 0.14;

        // Beacon Rune rotation and slight tilt
        entity.beaconRune.rotation.y += delta * 2.2;
        entity.beaconRune.rotation.x = Math.sin(elapsed * 1.8 + idx) * 0.18;
        entity.halo.rotation.z = elapsed * 1.4;

        // Distance check to player bird
        const dist = p.pos.distanceTo(entity.worldPos);
        if (dist < minNpcDist) {
          minNpcDist = dist;
          if (dist < 36) {
            closestNPC = entity.npc;
          }
        }
      });

      setNearNPC(closestNPC);
      nearNPCRef.current = closestNPC;

      setCurrentIsland(activeIsland);
      setNearSanctuary(activeSanctuary);
      setNearSanctuaryIsland(activeSanctuary ? activeIsland : null);

      // --- SMOOTH THIRD-PERSON CAMERA WITH SUBTLE SWAY ANIMATIONS ---
      const baseDistance = cameraMode === 'cinematic' ? 32 : cameraMode === 'firstPerson' ? 3.0 : 14.5;
      const baseHeight = cameraMode === 'cinematic' ? 9.5 : cameraMode === 'firstPerson' ? 1.2 : 4.2;

      // Speed-dependent camera distance (pulls back at high speed)
      const speedOffset = (p.speed / p.maxSpeed) * 3.8;
      const totalCamDist = baseDistance + speedOffset;

      // Subtle Sway Animations:
      // 1. Atmospheric thermal air turbulence sway (Lissajous figure-8)
      camPhysics.swayTime += delta * 1.35;
      const tSway = camPhysics.swayTime;
      const airSpeedFactor = 0.5 + (p.speed / 35) * 0.5;
      const airSwayX = (Math.sin(tSway * 0.75) * 0.38 + Math.sin(tSway * 1.85) * 0.14) * airSpeedFactor;
      const airSwayY = (Math.cos(tSway * 0.6) * 0.28 + Math.sin(tSway * 1.4) * 0.12) * airSpeedFactor;

      // 2. Wingbeat lift micro-pulse (sync with wing downstroke)
      const wingbeatPulse = !p.isGrounded && !p.isGliding
        ? Math.sin(p.flappingWingPhase) * (isBoosting ? 0.26 : 0.14)
        : 0;

      // 3. Dynamic banking sway (camera rolls and drifts laterally into curves)
      const bankDriftX = -Math.sin(p.roll) * 1.1;

      // Camera base yaw & pitch including mouse orbit offset
      const camYaw = p.yaw + p.orbitOffset.x;
      const camPitch = p.pitch * 0.45 + p.orbitOffset.y;

      const targetCamPos = new THREE.Vector3(
        p.pos.x - Math.sin(camYaw) * Math.cos(camPitch) * totalCamDist + airSwayX + bankDriftX,
        p.pos.y + baseHeight + Math.sin(camPitch) * totalCamDist * 0.5 + airSwayY + wingbeatPulse,
        p.pos.z - Math.cos(camYaw) * Math.cos(camPitch) * totalCamDist
      );

      // Frame-rate independent exponential damping for ultra-smooth follow
      const posDamp = 1.0 - Math.exp(-7.5 * delta);
      camPhysics.pos.lerp(targetCamPos, posDamp);
      camera.position.copy(camPhysics.pos);

      // Dynamic Banking Roll on Camera (smooth lag into the turn)
      const targetRoll = p.roll * 0.32;
      camPhysics.roll = THREE.MathUtils.lerp(camPhysics.roll, targetRoll, 0.08);
      camera.up.set(Math.sin(-camPhysics.roll), Math.cos(camPhysics.roll), 0);

      // Look-ahead target (anticipates flight direction slightly)
      const lookAheadDistance = cameraMode === 'firstPerson' ? 8 : 4.0;
      const forwardDir = new THREE.Vector3(
        Math.sin(p.yaw),
        Math.sin(p.pitch) * 0.6,
        Math.cos(p.yaw)
      ).normalize();

      const targetLookAt = p.pos.clone()
        .add(new THREE.Vector3(0, 1.2, 0))
        .add(forwardDir.multiplyScalar(lookAheadDistance));

      const lookDamp = 1.0 - Math.exp(-9.5 * delta);
      camPhysics.lookAt.lerp(targetLookAt, lookDamp);
      camera.lookAt(camPhysics.lookAt);

      // Dynamic FOV based on speed (whoosh zoom effect)
      const targetFOV = 62 + (p.speed / p.maxSpeed) * 16;
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.06);
      camera.updateProjectionMatrix();

      // --- DYNAMIC DEPTH OF FIELD CONTINUOUS FOCUS TRACKING ---
      if (isDofEnabledRef.current && bokehPass) {
        // Dynamically lock focus distance to the exact distance between camera and the white bird
        const distToBird = camera.position.distanceTo(p.pos);
        bokehPass.uniforms['focus'].value = distToBird;
        bokehPass.enabled = true;
      } else if (bokehPass) {
        bokehPass.enabled = false;
      }

      // Update HUD stats once every 4 frames
      if (tickCount % 4 === 0) {
        setSpeedKnots(Math.round(p.speed * 1.8));
        setAltitudeMeters(Math.round(Math.max(0, p.pos.y * 3.2)));
        const deg = Math.round(((-p.yaw * 180) / Math.PI) % 360);
        setHeadingDegrees(deg < 0 ? deg + 360 : deg);
      }

      // Render with post-processing depth of field if enabled
      if (isDofEnabledRef.current) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [islandConfigs, cameraMode, handleEnterNearestSanctuary, onAwardXP, timeOfDayPalettes]);

  // Adjust Sky Colors when TimeOfDay changes
  useEffect(() => {
    const palette = timeOfDayPalettes[timeOfDay];
    if (!palette || !envRefs.current.skyMat) return;

    const skyMat = envRefs.current.skyMat;
    skyMat.uniforms.topColor.value.copy(palette.skyTop);
    skyMat.uniforms.bottomColor.value.copy(palette.skyBottom);
    skyMat.uniforms.horizonColor.value.copy(palette.skyHorizon);
    skyMat.uniforms.sunPosition.value.copy(palette.sunPos);

    if (envRefs.current.sunGroup) {
      envRefs.current.sunGroup.position.copy(palette.sunPos).multiplyScalar(1000);
    }
    if (envRefs.current.sunMeshMat) {
      envRefs.current.sunMeshMat.color.copy(palette.sunColor);
    }
    if (envRefs.current.sunAuraMat) {
      envRefs.current.sunAuraMat.color.setHex(palette.sunAuraColor);
    }
    if (envRefs.current.dirLight) {
      envRefs.current.dirLight.color.copy(palette.dirColor);
      envRefs.current.dirLight.intensity = palette.dirIntensity;
      envRefs.current.dirLight.position.copy(palette.sunPos).multiplyScalar(1000);
    }
    if (envRefs.current.ambientLight) {
      envRefs.current.ambientLight.color.copy(palette.ambientColor);
      envRefs.current.ambientLight.intensity = palette.ambientIntensity;
    }
    if (envRefs.current.cloudSeaMat) {
      envRefs.current.cloudSeaMat.color.setHex(palette.cloudSeaColor);
    }
    if (envRefs.current.scene && envRefs.current.scene.fog) {
      (envRefs.current.scene.fog as THREE.FogExp2).color.copy(palette.fogColor);
    }
  }, [timeOfDay, timeOfDayPalettes]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl border border-[#262e36] bg-[#090d12] select-none shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[640px] sm:h-[720px]'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* --- HUD TOP HEADER BAR --- */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {/* Left: Heading Compass & Current Island Banner */}
        <div className="flex items-center gap-3">
          <div className="pointer-events-auto px-3.5 py-2 rounded-xl bg-[#11161d]/85 backdrop-blur-md border border-[#27323f] flex items-center gap-2.5 text-xs text-[#f5efe3] shadow-lg">
            <Compass className="w-4 h-4 text-[#c5a059]" />
            <span className="font-mono font-bold text-[#c5a059]">{headingDegrees}°</span>
            <span className="text-[#64748b]">|</span>
            <div className="flex items-center gap-1.5 font-semibold truncate max-w-[200px]">
              <Feather className="w-3.5 h-3.5 text-sky-400" />
              <span>{currentIsland ? currentIsland.name : 'Open Skies • White Bird Soaring'}</span>
            </div>
          </div>

          {/* Starlight Essence Collected */}
          <div className="pointer-events-auto px-3 py-2 rounded-xl bg-[#11161d]/85 backdrop-blur-md border border-[#27323f] flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{collectedEssence} Essences</span>
          </div>
        </div>

        {/* Right: Quick Controls & Camera Modes */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Time of Day Switcher */}
          <div className="hidden sm:flex items-center bg-[#11161d]/85 backdrop-blur-md border border-[#27323f] rounded-xl p-1 text-[11px]">
            {(['dawn', 'midday', 'golden_hour', 'twilight', 'starlight'] as TimeOfDay[]).map((tod) => (
              <button
                key={tod}
                onClick={() => onTimeOfDayChange(tod)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  timeOfDay === tod
                    ? 'bg-[#c5a059] text-[#0c0e10] font-bold shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
              >
                {tod.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Depth of Field (DOF Bokeh) Toggle */}
          <button
            onClick={() => setIsDofEnabled(!isDofEnabled)}
            className={`p-2.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-lg flex items-center gap-1.5 text-xs ${
              isDofEnabled
                ? 'bg-[#1b2738]/90 border-sky-500/50 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                : 'bg-[#11161d]/85 border-[#27323f] text-[#94a3b8] hover:text-[#f5efe3]'
            }`}
            title="Toggle Cinematic Depth of Field Bokeh"
          >
            <Focus className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline text-[11px] font-semibold">DOF {isDofEnabled ? 'On' : 'Off'}</span>
          </button>

          {/* Camera View Switcher */}
          <button
            onClick={() =>
              setCameraMode((prev) =>
                prev === 'chase' ? 'cinematic' : prev === 'cinematic' ? 'firstPerson' : 'chase'
              )
            }
            className="p-2.5 rounded-xl bg-[#11161d]/85 backdrop-blur-md border border-[#27323f] text-[#cbd5e1] hover:text-[#f5efe3] hover:border-[#38bdf8] transition-all cursor-pointer shadow-lg flex items-center gap-1.5 text-xs"
            title="Switch 3rd Person View (Press C)"
          >
            <Eye className="w-4 h-4 text-[#38bdf8]" />
            <span className="capitalize hidden md:inline">{cameraMode}</span>
          </button>

          {/* Character & Gear Panel Toggle */}
          <button
            onClick={() => setIsGearPanelOpen(!isGearPanelOpen)}
            className={`px-3 py-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-lg flex items-center gap-2 text-xs font-semibold ${
              isGearPanelOpen
                ? 'bg-amber-400 text-[#0c0e10] border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : isGroundedUI
                ? 'bg-amber-950/80 border-amber-500/80 text-amber-200 animate-pulse'
                : 'bg-[#11161d]/85 border-[#27323f] text-[#cbd5e1] hover:text-[#f5efe3] hover:border-amber-400/50'
            }`}
            title="Character Gear & Stats (Press G)"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Gear [G]</span>
            {isGroundedUI && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/30 text-amber-300 font-mono">
                Landed
              </span>
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              const muted = soundSynth.toggleMute();
              setIsMuted(muted);
            }}
            className="p-2.5 rounded-xl bg-[#11161d]/85 backdrop-blur-md border border-[#27323f] text-[#cbd5e1] hover:text-[#f5efe3] transition-all cursor-pointer shadow-lg"
            title="Toggle Flight Sound (Press M)"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Help Controls Modal */}
          <button
            onClick={() => setShowHelp(true)}
            className="p-2.5 rounded-xl bg-[#11161d]/85 backdrop-blur-md border border-[#27323f] text-[#cbd5e1] hover:text-[#f5efe3] transition-all cursor-pointer shadow-lg"
            title="Controls & Flight Physics Guide"
          >
            <HelpCircle className="w-4 h-4 text-[#c5a059]" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-[#11161d]/85 backdrop-blur-md border border-[#27323f] text-[#cbd5e1] hover:text-[#f5efe3] transition-all cursor-pointer shadow-lg"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* --- TRANSFORMATION TOAST BANNER --- */}
      {transformToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="px-5 py-2.5 rounded-2xl bg-[#0c1015]/95 backdrop-blur-xl border border-amber-400/60 shadow-[0_0_35px_rgba(245,158,11,0.4)] flex items-center gap-3 text-xs sm:text-sm text-[#f8fafc]">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            <span className="font-semibold">{transformToast}</span>
          </div>
        </div>
      )}

      {/* --- HUD BOTTOM FLIGHT INSTRUMENTS --- */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none z-10">
        {/* Flight Speedometer & Altitude Gauges */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Speedometer */}
          <div className="px-4 py-3 rounded-2xl bg-[#0f141a]/90 backdrop-blur-md border border-[#232b36] shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1b232e] text-[#38bdf8]">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold block">
                Airspeed
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl font-bold text-[#f8fafc]">{speedKnots}</span>
                <span className="text-[10px] text-[#94a3b8] font-mono">knots</span>
              </div>
            </div>
          </div>

          {/* Altitude Meter */}
          <div className="px-4 py-3 rounded-2xl bg-[#0f141a]/90 backdrop-blur-md border border-[#232b36] shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1b232e] text-[#f59e0b]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold block">
                Altitude
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl font-bold text-[#f8fafc]">{altitudeMeters}</span>
                <span className="text-[10px] text-[#94a3b8] font-mono">m</span>
              </div>
            </div>
          </div>

          {/* Flight State Indicator */}
          <div className="hidden sm:flex px-3.5 py-2.5 rounded-xl bg-[#0f141a]/90 backdrop-blur-md border border-[#232b36] items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${isGroundedUI ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
            <span className="font-mono text-[#cbd5e1] font-semibold">
              {isGroundedUI ? 'GROUNDED • WAYFARER' : flightState}
            </span>
          </div>

          {/* Quick Takeoff button when grounded */}
          {isGroundedUI && (
            <button
              onClick={() => {
                physicsRef.current.isGrounded = false;
                physicsRef.current.pos.y += 12;
                physicsRef.current.speed = 20;
                soundSynth.playWingWhoosh();
                setIsGroundedUI(false);
                triggerTransformToast('Ascended to Flight — Transformed to Celestial Bird');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all cursor-pointer border border-sky-300/40"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Take Flight [Space]</span>
            </button>
          )}
        </div>

        {/* Center Prompt: Land & Enter Sanctuary OR Speak with Island NPC */}
        {nearNPC ? (
          <div className="pointer-events-auto flex flex-col items-center gap-2 animate-bounce">
            <button
              onClick={() => handleOpenNPCChat(nearNPC)}
              className="px-6 py-3.5 rounded-2xl text-[#0c0e10] font-bold text-sm shadow-[0_0_35px_rgba(245,158,11,0.6)] flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer border border-amber-200/60"
              style={{
                background: `linear-gradient(135deg, ${nearNPC.accentHex}, #fef08a)`,
              }}
            >
              <MessageSquare className="w-4 h-4 text-[#0c0e10]" />
              <span>[T] Speak with {nearNPC.name}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-amber-100 bg-black/75 px-3 py-1 rounded-full backdrop-blur-sm border border-amber-400/40">
              Press T or Click to consult {nearNPC.title}
            </span>
          </div>
        ) : nearSanctuary ? (
          <div className="pointer-events-auto flex flex-col items-center gap-2 animate-bounce">
            <button
              onClick={handleEnterNearestSanctuary}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#e2bb6f] hover:from-[#d8b268] hover:to-[#ebd089] text-[#0c0e10] font-bold text-sm shadow-[0_0_30px_rgba(197,160,89,0.6)] flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer border border-amber-200/50"
            >
              <MapPin className="w-4 h-4 text-[#0c0e10]" />
              <span>[E] Land & Enter {nearSanctuary.name}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-amber-200 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-amber-500/30">
              Press E or Click to open Habit Sanctuary
            </span>
          </div>
        ) : null}

        {/* Right: Autopilot Fast Travel Drawer */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="px-3.5 py-2.5 rounded-2xl bg-[#0f141a]/90 backdrop-blur-md border border-[#232b36] text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold block mb-1.5">
              Fly Directly To Island:
            </span>
            <div className="flex flex-wrap justify-end gap-1.5 max-w-[280px]">
              {HABIT_ISLANDS.map((island) => (
                <button
                  key={island.id}
                  onClick={() => handleFastSoarToIsland(island)}
                  className="px-2.5 py-1 rounded-lg bg-[#1a212b] hover:bg-[#25303d] border border-[#2d3a49] text-[11px] text-[#f1f5f9] transition-all cursor-pointer flex items-center gap-1"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: island.accentHex }}
                  />
                  <span>{island.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Crosshair for flight orientation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <Crosshair className="w-6 h-6 text-[#f8fafc]" />
      </div>

      {/* --- TALKABLE ISLAND NPC CHAT WINDOW MODAL --- */}
      {isChatOpen && chatNPC && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div
            className="bg-[#10151c]/95 border border-[#273444] rounded-3xl max-w-xl w-full flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden transition-all animate-in fade-in duration-200"
            style={{
              boxShadow: `0 0 45px ${chatNPC.accentHex}33`,
            }}
          >
            {/* NPC Header */}
            <div
              className="px-6 py-4 border-b border-[#232f3e] flex items-center justify-between"
              style={{
                background: `linear-gradient(90deg, ${chatNPC.accentHex}1a, rgba(16,21,28,0.95))`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md border border-white/20"
                  style={{ backgroundColor: `${chatNPC.accentHex}33` }}
                >
                  {chatNPC.avatarEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif-title text-base font-bold text-[#f5efe3]">
                      {chatNPC.name}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border border-white/10"
                      style={{
                        backgroundColor: `${chatNPC.accentHex}25`,
                        color: chatNPC.accentHex,
                      }}
                    >
                      {chatNPC.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8] flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#c5a059]" />
                    <span>{chatNPC.islandName} Sanctuary Spirit</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenGuideTab && (
                  <button
                    onClick={() => {
                      setIsChatOpen(false);
                      onOpenGuideTab();
                    }}
                    className="p-2 rounded-xl bg-[#1a232f] hover:bg-[#253243] text-[#94a3b8] hover:text-[#f8fafc] text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-[#2e3e52]"
                    title="Open Full Scriptorium Guide"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span className="hidden sm:inline">Scriptorium</span>
                  </button>
                )}
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 rounded-xl text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1f2937] transition-all cursor-pointer"
                  title="Close Dialogue (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Message Scroll Log */}
            <div className="p-5 flex-1 min-h-[260px] max-h-[380px] overflow-y-auto space-y-3.5 text-sm">
              {(chatMessages[chatNPC.id] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-[#c5a059] text-[#0c0e10] font-bold'
                        : 'bg-[#1e293b] text-[#f1f5f9]'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : chatNPC.avatarEmoji}
                  </div>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#c5a059] text-[#0c0e10] rounded-tr-none font-medium'
                        : 'bg-[#18212c] text-[#e2e8f0] border border-[#273444] rounded-tl-none'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span
                      className={`text-[10px] block text-right mt-1.5 ${
                        msg.sender === 'user' ? 'text-[#0c0e10]/70' : 'text-[#64748b]'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-[#94a3b8] italic">
                  <div className="w-7 h-7 rounded-lg bg-[#1e293b] flex items-center justify-center text-xs">
                    {chatNPC.avatarEmoji}
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-[#18212c] border border-[#273444] flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
                    <span>{chatNPC.name} is communing with the celestial ether...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Dialogue Suggestion Chips */}
            {chatNPC.suggestedQuestions && chatNPC.suggestedQuestions.length > 0 && (
              <div className="px-5 py-2.5 bg-[#0d1217]/70 border-t border-[#1e2733] flex flex-wrap gap-1.5">
                <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold w-full block mb-0.5">
                  Inquire of the Spirit:
                </span>
                {chatNPC.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChatMessage(q)}
                    disabled={chatLoading}
                    className="px-2.5 py-1 rounded-lg bg-[#19222c] hover:bg-[#253243] text-[11px] text-[#cbd5e1] hover:text-[#f8fafc] border border-[#2c3a4d] transition-all cursor-pointer truncate max-w-full text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 bg-[#0d1217] border-t border-[#232f3e] flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendChatMessage();
                  }
                }}
                placeholder={`Ask ${chatNPC.name} for spiritual habit guidance...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#161d26] border border-[#283546] text-xs sm:text-sm text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#c5a059] transition-all"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={!chatInput.trim() || chatLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#e2bb6f] hover:from-[#d8b268] hover:to-[#ebd089] text-[#0c0e10] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTROLS MODAL --- */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12171e] border border-[#27323f] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-sm text-[#e2e8f0]">
            <div className="flex items-center justify-between border-b border-[#232c37] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#c5a059]" />
                <h3 className="font-serif-title text-lg font-bold text-[#f5efe3]">
                  Spiritual White Bird Flight Guide
                </h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#18202a] border border-[#263342] space-y-1">
                <span className="text-[#c5a059] font-bold block">W / S Keys</span>
                <p className="text-[#94a3b8]">Pitch dive down / climb up into celestial skies</p>
              </div>
              <div className="p-3 rounded-xl bg-[#18202a] border border-[#263342] space-y-1">
                <span className="text-[#c5a059] font-bold block">A / D Keys</span>
                <p className="text-[#94a3b8]">Bank left / bank right into aerodynamic curves</p>
              </div>
              <div className="p-3 rounded-xl bg-[#18202a] border border-[#263342] space-y-1">
                <span className="text-[#c5a059] font-bold block">Spacebar</span>
                <p className="text-[#94a3b8]">Wing flap thrust / boost climb / takeoff</p>
              </div>
              <div className="p-3 rounded-xl bg-[#18202a] border border-[#263342] space-y-1">
                <span className="text-[#c5a059] font-bold block">Shift Key</span>
                <p className="text-[#94a3b8]">High-speed falcon dive with tucked wings</p>
              </div>
              <div className="p-3 rounded-xl bg-[#18202a] border border-[#263342] space-y-1">
                <span className="text-[#c5a059] font-bold block">T Key / Click</span>
                <p className="text-[#94a3b8]">Speak with Island NPCs & open chat window</p>
              </div>
              <div className="p-3 rounded-xl bg-[#18202a] border border-[#263342] space-y-1">
                <span className="text-[#c5a059] font-bold block">G Key</span>
                <p className="text-[#94a3b8]">Inspect Character Stats & Equipped Gear</p>
              </div>
              <div className="p-3 rounded-xl bg-[#18202a] border border-[#263342] space-y-1">
                <span className="text-[#c5a059] font-bold block">F Key</span>
                <p className="text-[#94a3b8]">Toggle Land Transformation / Celestial Flight</p>
              </div>
              <div className="p-3 rounded-xl bg-[#18202a] border border-[#263342] space-y-1">
                <span className="text-[#c5a059] font-bold block">E Key</span>
                <p className="text-[#94a3b8]">Land & Enter Island Sanctuary rituals</p>
              </div>
              <div className="p-3 rounded-xl bg-[#18202a] border border-[#263342] space-y-1">
                <span className="text-[#c5a059] font-bold block">C Key</span>
                <p className="text-[#94a3b8]">Toggle 3rd Person / Cinematic / 1st Person</p>
              </div>
              <div className="p-3 rounded-xl bg-[#18202a] border border-[#263342] space-y-1">
                <span className="text-[#c5a059] font-bold block">Mouse Drag</span>
                <p className="text-[#94a3b8]">Smooth 360° orbit around the white bird</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161d26] border border-[#2a3747] text-xs text-[#cbd5e1] leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Focus className="w-3.5 h-3.5" />
                <span>Land Transformation & Visible Gear:</span>
              </div>
              <p>
                When you touch down on any island or press F, your avatar instantaneously transforms from the celestial white bird into the Spiritual Wayfarer with all 5 gear pieces visible, opening your Character Gear Panel automatically! Press Space or the Take Flight button anytime to soar back into the heavens.
              </p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d8b268] text-[#0c0e10] font-bold text-xs cursor-pointer transition-all"
            >
              Resume Flight
            </button>
          </div>
        </div>
      )}

      {/* --- CHARACTER & GEAR INSPECTION PANEL --- */}
      {/* Manifests when player touches land or toggles with G / button */}
      <CharacterGearPanel
        character={character}
        quests={quests}
        isOpen={isGearPanelOpen}
        onClose={() => setIsGearPanelOpen(false)}
        isGrounded={isGroundedUI}
        currentIsland={currentIsland}
        onOpenFullArmory={onOpenArmoryModal}
        onTakeFlight={() => {
          physicsRef.current.isGrounded = false;
          physicsRef.current.pos.y += 12;
          physicsRef.current.speed = 20;
          soundSynth.playWingWhoosh();
          setIsGroundedUI(false);
          setIsGearPanelOpen(false);
          triggerTransformToast('Ascended to Flight — Transformed to Celestial Bird');
        }}
        onAscendGear={onAscendGear}
      />
    </div>
  );
};
