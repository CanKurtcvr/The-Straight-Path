import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Compass,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  MapPin,
  Navigation,
  Sparkles,
  Award,
  BookOpen,
  Dumbbell,
  Video,
  Feather,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Footprints,
} from 'lucide-react';
import {
  HabitIsland,
  WorldArea,
  CharacterState,
  TimeOfDay,
  IslandId,
  QuestStatus,
} from '../types';
import {
  HABIT_ISLANDS,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from '../data/worldData';

interface OpenWorldMapProps {
  character: CharacterState;
  quests: QuestStatus[];
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (time: TimeOfDay) => void;
  onEnterArea: (area: WorldArea, island: HabitIsland) => void;
  onUpdateCharacterPos: (x: number, y: number, currentIsland: IslandId) => void;
}

export const OpenWorldMap: React.FC<OpenWorldMapProps> = ({
  character,
  quests,
  timeOfDay,
  onTimeOfDayChange,
  onEnterArea,
  onUpdateCharacterPos,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport dimensions
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);

  // Player position state in local animation loop
  const playerPosRef = useRef({ x: character.x, y: character.y });
  const targetPosRef = useRef<{ x: number; y: number } | null>(null);
  const facingRightRef = useRef(true);
  const isMovingRef = useRef(false);
  const walkFrameRef = useRef(0);
  const particlesRef = useRef<{ x: number; y: number; alpha: number; radius: number }[]>([]);

  // Keyboard keys pressed
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Active interactive proximity area
  const [nearbyArea, setNearbyArea] = useState<{
    area: WorldArea;
    island: HabitIsland;
    dist: number;
  } | null>(null);

  // Click target marker animation
  const [clickMarker, setClickMarker] = useState<{ x: number; y: number; time: number } | null>(
    null
  );

  // Current Island detected
  const [currentIslandName, setCurrentIslandName] = useState<string>("The Wayfarer's Nexus");

  // ResizeObserver for canvas container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setViewportSize({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      keysPressedRef.current[e.key.toLowerCase()] = true;

      // 'E' or Space to interact with nearby area
      if ((e.key.toLowerCase() === 'e' || e.key === ' ') && nearbyArea) {
        e.preventDefault();
        onEnterArea(nearbyArea.area, nearbyArea.island);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyArea, onEnterArea]);

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let waveOffset = 0;

    const gameLoop = () => {
      waveOffset += 0.03;
      walkFrameRef.current += 0.15;

      const keys = keysPressedRef.current;
      const speed = character.speed || 4.5;
      let dx = 0;
      let dy = 0;

      if (keys['w'] || keys['arrowup']) dy -= speed;
      if (keys['s'] || keys['arrowdown']) dy += speed;
      if (keys['a'] || keys['arrowleft']) dx -= speed;
      if (keys['d'] || keys['arrowright']) dx += speed;

      // Handle keyboard movement
      if (dx !== 0 || dy !== 0) {
        targetPosRef.current = null; // override click target
        if (dx !== 0) facingRightRef.current = dx > 0;
        isMovingRef.current = true;

        // Diagonal normalization
        if (dx !== 0 && dy !== 0) {
          dx *= 0.707;
          dy *= 0.707;
        }

        playerPosRef.current.x = Math.max(80, Math.min(WORLD_WIDTH - 80, playerPosRef.current.x + dx));
        playerPosRef.current.y = Math.max(80, Math.min(WORLD_HEIGHT - 80, playerPosRef.current.y + dy));

        // Add dust particles
        if (Math.random() < 0.3) {
          particlesRef.current.push({
            x: playerPosRef.current.x + (Math.random() * 8 - 4),
            y: playerPosRef.current.y + 12,
            alpha: 0.6,
            radius: Math.random() * 3 + 1,
          });
        }
      } else if (targetPosRef.current) {
        // Handle click target movement
        const diffX = targetPosRef.current.x - playerPosRef.current.x;
        const diffY = targetPosRef.current.y - playerPosRef.current.y;
        const dist = Math.hypot(diffX, diffY);

        if (dist > 5) {
          isMovingRef.current = true;
          const moveStep = Math.min(dist, speed);
          const moveX = (diffX / dist) * moveStep;
          const moveY = (diffY / dist) * moveStep;

          facingRightRef.current = moveX > 0;
          playerPosRef.current.x += moveX;
          playerPosRef.current.y += moveY;

          if (Math.random() < 0.3) {
            particlesRef.current.push({
              x: playerPosRef.current.x + (Math.random() * 8 - 4),
              y: playerPosRef.current.y + 12,
              alpha: 0.6,
              radius: Math.random() * 3 + 1,
            });
          }
        } else {
          isMovingRef.current = false;
          targetPosRef.current = null;
        }
      } else {
        isMovingRef.current = false;
      }

      // Detect which island character is currently on
      let detectedIsland: HabitIsland = HABIT_ISLANDS[0];
      let minIslandDist = Infinity;
      for (const isl of HABIT_ISLANDS) {
        const d = Math.hypot(playerPosRef.current.x - isl.x, playerPosRef.current.y - isl.y);
        if (d < isl.radius + 50 && d < minIslandDist) {
          minIslandDist = d;
          detectedIsland = isl;
        }
      }
      if (detectedIsland && detectedIsland.name !== currentIslandName) {
        setCurrentIslandName(detectedIsland.name);
        onUpdateCharacterPos(playerPosRef.current.x, playerPosRef.current.y, detectedIsland.id);
      }

      // Detect proximity to nearest area landmark
      let closestArea: { area: WorldArea; island: HabitIsland; dist: number } | null = null;
      let minDist = 75; // proximity trigger distance in px

      for (const isl of HABIT_ISLANDS) {
        for (const area of isl.areas) {
          const d = Math.hypot(playerPosRef.current.x - area.x, playerPosRef.current.y - area.y);
          if (d < minDist) {
            minDist = d;
            closestArea = { area, island: isl, dist: d };
          }
        }
      }
      setNearbyArea(closestArea);

      // --- RENDERING CANVAS ---
      canvas.width = viewportSize.width;
      canvas.height = viewportSize.height;

      // Calculate camera position centered on player
      const cameraX = Math.max(
        0,
        Math.min(WORLD_WIDTH - viewportSize.width / zoom, playerPosRef.current.x - viewportSize.width / (2 * zoom))
      );
      const cameraY = Math.max(
        0,
        Math.min(WORLD_HEIGHT - viewportSize.height / zoom, playerPosRef.current.y - viewportSize.height / (2 * zoom))
      );

      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.translate(-cameraX, -cameraY);

      // 1. Draw Ocean Base based on Time of Day
      let oceanColor1 = '#09131a';
      let oceanColor2 = '#0d1c26';
      let waveColor = 'rgba(56, 189, 248, 0.08)';

      if (timeOfDay === 'dawn') {
        oceanColor1 = '#13121d';
        oceanColor2 = '#1c1a28';
        waveColor = 'rgba(251, 146, 60, 0.1)';
      } else if (timeOfDay === 'zenith') {
        oceanColor1 = '#0a1a24';
        oceanColor2 = '#102837';
        waveColor = 'rgba(14, 165, 233, 0.12)';
      } else if (timeOfDay === 'golden') {
        oceanColor1 = '#1a1410';
        oceanColor2 = '#291d12';
        waveColor = 'rgba(245, 158, 11, 0.12)';
      } else if (timeOfDay === 'twilight') {
        oceanColor1 = '#160d19';
        oceanColor2 = '#231228';
        waveColor = 'rgba(217, 70, 239, 0.1)';
      } else if (timeOfDay === 'night') {
        oceanColor1 = '#05080b';
        oceanColor2 = '#0a0e14';
        waveColor = 'rgba(99, 102, 241, 0.07)';
      }

      // Draw ocean gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      oceanGrad.addColorStop(0, oceanColor1);
      oceanGrad.addColorStop(1, oceanColor2);
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // Draw subtle wave ripples across the open sea
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 1.5;
      for (let y = 100; y < WORLD_HEIGHT; y += 120) {
        ctx.beginPath();
        for (let x = 0; x < WORLD_WIDTH; x += 40) {
          const waveY = y + Math.sin((x * 0.015) + waveOffset) * 6;
          if (x === 0) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }

      // 2. Draw Celestial Bridges connecting Nexus to the 5 Islands
      const nexus = HABIT_ISLANDS[0];
      for (let i = 1; i < HABIT_ISLANDS.length; i++) {
        const island = HABIT_ISLANDS[i];
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(nexus.x, nexus.y);
        ctx.lineTo(island.x, island.y);
        ctx.lineWidth = 14;
        ctx.strokeStyle = 'rgba(27, 33, 40, 0.7)';
        ctx.stroke();

        // Glowing center line
        ctx.lineWidth = 3;
        ctx.strokeStyle = island.accentHex + '55';
        ctx.setLineDash([12, 8]);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw Habit Islands
      for (const isl of HABIT_ISLANDS) {
        ctx.save();

        // Ambient outer glow of island
        const glowGrad = ctx.createRadialGradient(isl.x, isl.y, isl.radius * 0.4, isl.x, isl.y, isl.radius * 1.3);
        glowGrad.addColorStop(0, isl.accentHex + '33');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(isl.x, isl.y, isl.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Sandy shoreline ring
        ctx.beginPath();
        ctx.arc(isl.x, isl.y, isl.radius + 12, 0, Math.PI * 2);
        ctx.fillStyle = '#262017';
        ctx.fill();

        // Main Island Terrain Body
        const islandGrad = ctx.createRadialGradient(isl.x, isl.y - isl.radius * 0.3, 10, isl.x, isl.y, isl.radius);
        islandGrad.addColorStop(0, isl.bgHex);
        islandGrad.addColorStop(1, '#13181d');
        ctx.fillStyle = islandGrad;
        ctx.beginPath();
        ctx.arc(isl.x, isl.y, isl.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner island decorative ring
        ctx.lineWidth = 2;
        ctx.strokeStyle = isl.accentHex + '40';
        ctx.beginPath();
        ctx.arc(isl.x, isl.y, isl.radius * 0.85, 0, Math.PI * 2);
        ctx.stroke();

        // Island Nameplate Banner in center
        ctx.fillStyle = '#f5efe3';
        ctx.font = 'bold 15px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText(isl.name, isl.x, isl.y - isl.radius * 0.55);

        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = isl.accentHex;
        ctx.fillText(isl.conceptTitle, isl.x, isl.y - isl.radius * 0.55 + 18);

        // Island Habit Quest Status Pill
        if (isl.questId) {
          const q = quests.find((quest) => quest.questId === isl.questId);
          if (q) {
            ctx.fillStyle = q.completed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 36, 44, 0.8)';
            ctx.strokeStyle = q.completed ? '#10b981' : '#35414f';
            ctx.lineWidth = 1;
            const pillW = 110;
            const pillH = 22;
            const pillX = isl.x - pillW / 2;
            const pillY = isl.y - isl.radius * 0.55 + 26;

            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillW, pillH, 11);
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = q.completed ? '#34d399' : '#8c959f';
            ctx.fillText(`${q.currentStreak}d Streak (${q.tier})`, isl.x, pillY + 14);
          }
        }

        ctx.restore();
      }

      // 4. Draw Area Landmarks & Shrines on Islands
      for (const isl of HABIT_ISLANDS) {
        for (const area of isl.areas) {
          ctx.save();

          const isNearby = nearbyArea?.area.id === area.id;

          // Landmark Pulsing Glow
          const pulse = Math.sin(waveOffset * 2 + area.x) * 4;
          ctx.beginPath();
          ctx.arc(area.x, area.y, 20 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = isNearby ? isl.accentHex + '55' : isl.accentHex + '22';
          ctx.fill();

          // Landmark Pedestal Ring
          ctx.beginPath();
          ctx.arc(area.x, area.y, 16, 0, Math.PI * 2);
          ctx.fillStyle = '#11161b';
          ctx.strokeStyle = isNearby ? '#ffffff' : isl.accentHex;
          ctx.lineWidth = isNearby ? 2.5 : 1.5;
          ctx.fill();
          ctx.stroke();

          // Inner Landmark Glyph / Center dot
          ctx.beginPath();
          ctx.arc(area.x, area.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = isNearby ? '#ffffff' : isl.accentHex;
          ctx.fill();

          // Landmark Label Text
          ctx.font = isNearby ? 'bold 12px Plus Jakarta Sans, sans-serif' : '11px Plus Jakarta Sans, sans-serif';
          ctx.fillStyle = isNearby ? '#ffffff' : '#cfc8ba';
          ctx.textAlign = 'center';
          ctx.fillText(area.name, area.x, area.y + 32);

          // Subtitle
          ctx.font = '9px monospace';
          ctx.fillStyle = isNearby ? isl.accentHex : '#7b838c';
          ctx.fillText(area.subtitle, area.x, area.y + 44);

          ctx.restore();
        }
      }

      // 5. Draw Target Click Marker if active
      if (targetPosRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(targetPosRef.current.x, targetPosRef.current.y, 12 + Math.sin(waveOffset * 4) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(targetPosRef.current.x, targetPosRef.current.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#c5a059';
        ctx.fill();
        ctx.restore();
      }

      // 6. Draw Dust / Walking Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.alpha -= 0.02;
        p.radius *= 0.98;
        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.fillStyle = `rgba(197, 160, 89, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Draw Player Character Avatar
      const px = playerPosRef.current.x;
      const py = playerPosRef.current.y;
      const facing = facingRightRef.current;
      const isMoving = isMovingRef.current;
      const walkBob = isMoving ? Math.sin(walkFrameRef.current * 2) * 2.5 : 0;

      ctx.save();
      ctx.translate(px, py + walkBob);

      // Character Shadow
      ctx.beginPath();
      ctx.ellipse(0, 14, 12, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();

      // Spiritual Aura Glow around character
      const auraGrad = ctx.createRadialGradient(0, -6, 4, 0, -6, 26);
      auraGrad.addColorStop(0, 'rgba(197, 160, 89, 0.4)');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, -6, 26, 0, Math.PI * 2);
      ctx.fill();

      // Cloaked Body
      ctx.fillStyle = '#1c232a';
      ctx.strokeStyle = '#c5a059';
      ctx.lineWidth = 1.5;

      // Cloak silhouette
      ctx.beginPath();
      ctx.moveTo(-10, 12);
      ctx.lineTo(-7, -10);
      ctx.quadraticCurveTo(0, -18, 7, -10);
      ctx.lineTo(10, 12);
      ctx.quadraticCurveTo(0, 14, -10, 12);
      ctx.fill();
      ctx.stroke();

      // Character Head / Hood
      ctx.beginPath();
      ctx.arc(0, -12, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#262f38';
      ctx.fill();
      ctx.stroke();

      // Golden Scarf / Brooch
      ctx.fillStyle = '#c5a059';
      ctx.beginPath();
      ctx.arc(facing ? 2 : -2, -8, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Astrolabe / Lantern Staff in hand
      const staffX = facing ? 11 : -11;
      ctx.strokeStyle = '#c5a059';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(staffX, 14);
      ctx.lineTo(staffX, -16);
      ctx.stroke();

      // Glowing Lantern / Astrolabe Head
      ctx.beginPath();
      ctx.arc(staffX, -16, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      // Nameplate & Level Floating above character head
      ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = '#f5efe3';
      ctx.textAlign = 'center';
      ctx.fillText(`${character.name}`, 0, -28);

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#c5a059';
      ctx.fillText(`Lv. ${character.level} • ${character.activeTitle}`, 0, -40);

      ctx.restore();

      ctx.restore(); // Restore camera scale & translation

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [viewportSize, zoom, character, timeOfDay, quests, nearbyArea, onEnterArea, onUpdateCharacterPos, currentIslandName]);

  // Click on Canvas to Move or Interact
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickScreenX = e.clientX - rect.left;
    const clickScreenY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const cameraX = Math.max(
      0,
      Math.min(WORLD_WIDTH - viewportSize.width / zoom, playerPosRef.current.x - viewportSize.width / (2 * zoom))
    );
    const cameraY = Math.max(
      0,
      Math.min(WORLD_HEIGHT - viewportSize.height / zoom, playerPosRef.current.y - viewportSize.height / (2 * zoom))
    );

    const worldX = clickScreenX / zoom + cameraX;
    const worldY = clickScreenY / zoom + cameraY;

    // Check if clicked directly on an Area Landmark
    for (const isl of HABIT_ISLANDS) {
      for (const area of isl.areas) {
        const d = Math.hypot(worldX - area.x, worldY - area.y);
        if (d < 35) {
          // Direct click on area! Teleport close & enter
          targetPosRef.current = { x: area.x, y: area.y + 15 };
          onEnterArea(area, isl);
          return;
        }
      }
    }

    // Set walking destination
    targetPosRef.current = { x: worldX, y: worldY };
    setClickMarker({ x: worldX, y: worldY, time: Date.now() });
  };

  // Fast Travel to Island
  const handleFastTravel = (targetIsland: HabitIsland) => {
    playerPosRef.current = { x: targetIsland.x, y: targetIsland.y + 40 };
    targetPosRef.current = null;
    onUpdateCharacterPos(targetIsland.x, targetIsland.y + 40, targetIsland.id);
  };

  return (
    <div className="space-y-4">
      {/* Top World HUD Bar */}
      <div className="rounded-2xl bg-[#111417] border border-[#222932] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Location & Character Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#181d22] border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] flex-shrink-0">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-title font-bold text-sm sm:text-base text-[#f5efe3]">
                {currentIslandName}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1c2229] text-[#c5a059] border border-[#c5a059]/30">
                Open World
              </span>
            </div>
            <p className="text-xs text-[#8e877a]">
              WASD / Arrow Keys or Click to traverse the archipelago. Enter landmarks to fulfill daily habits.
            </p>
          </div>
        </div>

        {/* Right: Time of Day & Fast Travel Bar */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
          {/* Time of Day Selector */}
          <div className="flex items-center gap-1 bg-[#161a1e] p-1 rounded-xl border border-[#262c34] text-xs">
            {[
              { id: 'dawn', name: 'Dawn', icon: Sunrise },
              { id: 'zenith', name: 'Zenith (Midday)', icon: Sun },
              { id: 'golden', name: 'Golden Hour', icon: Sun },
              { id: 'twilight', name: 'Twilight (Sunset)', icon: Sunset },
              { id: 'night', name: 'Night (Starlight)', icon: Moon },
            ].map((t) => {
              const IconComp = t.icon;
              const isActive = timeOfDay === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onTimeOfDayChange(t.id as TimeOfDay)}
                  title={t.name}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#222933] text-[#c5a059] border border-[#c5a059]/40'
                      : 'text-[#727a83] hover:text-[#ded8cc]'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#161a1e] p-1 rounded-xl border border-[#262c34]">
            <button
              onClick={() => setZoom((prev) => Math.min(1.4, prev + 0.1))}
              className="p-1.5 rounded text-[#7b838c] hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((prev) => Math.max(0.7, prev - 0.1))}
              className="p-1.5 rounded text-[#7b838c] hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas World Viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[620px] rounded-2xl border border-[#242c35] overflow-hidden bg-[#080d11] shadow-[0_10px_40px_rgba(0,0,0,0.6)] select-none"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Floating Proximity Interaction Prompt */}
        {nearbyArea && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#12161a]/90 backdrop-blur-md border border-[#c5a059]/60 rounded-2xl px-5 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.7)] flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="p-2 rounded-xl bg-[#1c2229] text-[#c5a059] border border-[#c5a059]/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#c5a059]">
                  {nearbyArea.island.name}
                </span>
                <span className="text-[10px] text-[#7d8691]">Press [E] or Tap</span>
              </div>
              <h4 className="font-serif-title font-bold text-sm text-[#f5efe3]">
                {nearbyArea.area.name}
              </h4>
            </div>

            <button
              onClick={() => onEnterArea(nearbyArea.area, nearbyArea.island)}
              className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d6b066] text-[#0c0e10] font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_2px_10px_rgba(197,160,89,0.3)] cursor-pointer"
            >
              <span>{nearbyArea.area.actionPrompt}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Fast Travel Dock (Quick Island Teleport) in Top-Left */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-[#0f1215]/85 backdrop-blur-md p-2 rounded-xl border border-[#21272f] max-w-xs">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#79828d] px-1">
            Fast Travel Waypoints
          </span>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {HABIT_ISLANDS.map((isl) => (
              <button
                key={isl.id}
                onClick={() => handleFastTravel(isl)}
                className={`px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer truncate ${
                  currentIslandName === isl.name
                    ? 'bg-[#1e252d] text-[#c5a059] font-bold border border-[#c5a059]/40'
                    : 'text-[#968f82] hover:bg-[#181d22] hover:text-[#ded8cc]'
                }`}
              >
                ✦ {isl.name.split(' ')[0]} {isl.name.split(' ')[1] || ''}
              </button>
            ))}
          </div>
        </div>

        {/* Mini-Map in Bottom-Right Corner */}
        <div className="absolute bottom-4 right-4 w-44 h-36 bg-[#0c1013]/90 backdrop-blur-md rounded-xl border border-[#242b34] overflow-hidden p-2 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-[9px] font-mono text-[#7b838c] uppercase tracking-wider">
            <span>Archipelago Radar</span>
            <span className="text-[#c5a059]">2200x1700</span>
          </div>

          {/* Mini-Map Surface */}
          <div className="relative w-full h-24 bg-[#070b0e] rounded border border-[#1a2128]">
            {HABIT_ISLANDS.map((isl) => {
              const miniX = (isl.x / WORLD_WIDTH) * 100;
              const miniY = (isl.y / WORLD_HEIGHT) * 100;
              return (
                <div
                  key={isl.id}
                  onClick={() => handleFastTravel(isl)}
                  title={isl.name}
                  className="absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
                  style={{
                    left: `${miniX}%`,
                    top: `${miniY}%`,
                    backgroundColor: isl.accentHex + '66',
                    border: `1px solid ${isl.accentHex}`,
                  }}
                />
              );
            })}

            {/* Player Blip */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 border border-white -translate-x-1/2 -translate-y-1/2 animate-ping"
              style={{
                left: `${(playerPosRef.current.x / WORLD_WIDTH) * 100}%`,
                top: `${(playerPosRef.current.y / WORLD_HEIGHT) * 100}%`,
              }}
            />
            <div
              className="absolute w-2 h-2 rounded-full bg-amber-300 border border-white -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(playerPosRef.current.x / WORLD_WIDTH) * 100}%`,
                top: `${(playerPosRef.current.y / WORLD_HEIGHT) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Keyboard Controls Legend in Bottom-Left */}
        <div className="absolute bottom-4 left-4 bg-[#0d1013]/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#1f262e] text-[10px] font-mono text-[#7a838d] hidden sm:flex items-center gap-3">
          <span>[WASD / Arrows] Move</span>
          <span>•</span>
          <span>[Click] Walk to Point</span>
          <span>•</span>
          <span>[E / Space] Enter Area</span>
        </div>
      </div>
    </div>
  );
};
