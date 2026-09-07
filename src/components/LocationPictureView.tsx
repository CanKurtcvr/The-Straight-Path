import React from 'react';
import { LocationPicture, WorldArea, HabitIsland } from '../types';
import { Sparkles, MapPin, Eye, Compass, Sun, Moon } from 'lucide-react';

interface LocationPictureViewProps {
  area: WorldArea;
  island: HabitIsland;
}

export const LocationPictureView: React.FC<LocationPictureViewProps> = ({ area, island }) => {
  const pic = area.locationPicture;

  // Render thematic architectural background based on island and area
  const renderThematicArt = () => {
    switch (island.id) {
      case 'spirituality':
      case 'salah':
        return (
          <svg viewBox="0 0 600 220" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="sky-spirit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0b233a" />
                <stop offset="50%" stopColor="#1a3b5c" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="water-spirit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="100%" stopColor="#06121f" />
              </linearGradient>
              <filter id="glow-sun">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Sky */}
            <rect width="600" height="220" fill="url(#sky-spirit)" />
            {/* Mountain Silhouettes */}
            <path d="M0,130 Q120,70 240,110 T480,90 L600,120 L600,220 L0,220 Z" fill="#091b2c" opacity="0.7" />
            <path d="M0,145 Q150,105 300,135 T600,130 L600,220 L0,220 Z" fill="#0d243a" opacity="0.9" />
            {/* Rising Morning Sun */}
            <circle cx="300" cy="95" r="28" fill="#fef08a" filter="url(#glow-sun)" opacity="0.85" />
            <circle cx="300" cy="95" r="50" fill="#fde047" opacity="0.15" />
            {/* Water Plane */}
            <rect y="150" width="600" height="70" fill="url(#water-spirit)" />
            {/* Sun Reflection on Water */}
            <ellipse cx="300" cy="170" rx="35" ry="4" fill="#fef08a" opacity="0.6" />
            <ellipse cx="300" cy="182" rx="45" ry="3" fill="#fef08a" opacity="0.4" />
            <ellipse cx="300" cy="195" rx="55" ry="2" fill="#fef08a" opacity="0.25" />
            {/* Zen Pavilion Silhouette */}
            <path d="M220,150 L380,150 L360,115 L240,115 Z" fill="#07131e" />
            {/* Pavilion Roof Curve */}
            <path d="M210,115 Q300,105 390,115 Q300,90 210,115 Z" fill="#040b12" />
            <path d="M245,100 Q300,92 355,100 Q300,82 245,100 Z" fill="#040b12" />
            {/* Pillars */}
            <line x1="240" y1="115" x2="240" y2="150" stroke="#040b12" strokeWidth="4" />
            <line x1="275" y1="115" x2="275" y2="150" stroke="#040b12" strokeWidth="3" />
            <line x1="325" y1="115" x2="325" y2="150" stroke="#040b12" strokeWidth="3" />
            <line x1="360" y1="115" x2="360" y2="150" stroke="#040b12" strokeWidth="4" />
            {/* Soft Mist particles */}
            <ellipse cx="140" cy="148" rx="80" ry="10" fill="#ffffff" opacity="0.1" />
            <ellipse cx="460" cy="152" rx="90" ry="12" fill="#ffffff" opacity="0.08" />
          </svg>
        );

      case 'reflection':
      case 'alchemist':
        return (
          <svg viewBox="0 0 600 220" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="bg-reflection" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#19060c" />
                <stop offset="60%" stopColor="#2b0d18" />
                <stop offset="100%" stopColor="#4c1024" />
              </linearGradient>
              <linearGradient id="torch-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="600" height="220" fill="url(#bg-reflection)" />
            {/* Obsidian Arches */}
            <path d="M50,0 L50,220 L90,220 L90,60 Q150,20 210,60 L210,220 L250,220 L250,0 Z" fill="#0f0407" />
            <path d="M350,0 L350,220 L390,220 L390,60 Q450,20 510,60 L510,220 L550,220 L550,0 Z" fill="#0f0407" />
            {/* Central Reflecting Mirror Panel */}
            <rect x="230" y="30" width="140" height="150" rx="8" fill="#14060a" stroke="#f43f5e" strokeWidth="2" strokeOpacity="0.5" />
            {/* Candle/Hearth Flame */}
            <ellipse cx="300" cy="180" rx="40" ry="8" fill="#000000" opacity="0.6" />
            <polygon points="300,135 292,165 308,165" fill="#f43f5e" opacity="0.9" />
            <circle cx="300" cy="150" r="18" fill="#f43f5e" opacity="0.35" />
            <circle cx="300" cy="150" r="6" fill="#fef08a" />
            {/* Floating embers */}
            <circle cx="280" cy="110" r="1.5" fill="#f43f5e" opacity="0.7" />
            <circle cx="320" cy="95" r="2" fill="#fb7185" opacity="0.8" />
            <circle cx="295" cy="80" r="1" fill="#fef08a" opacity="0.9" />
          </svg>
        );

      case 'vitality':
      case 'athlete':
        return (
          <svg viewBox="0 0 600 220" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="bg-vitality" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#082319" />
                <stop offset="60%" stopColor="#0f3b2c" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <rect width="600" height="220" fill="url(#bg-vitality)" />
            {/* Mountain Ridges */}
            <polygon points="0,220 70,80 180,170 300,60 420,160 520,70 600,140 600,220" fill="#05150e" />
            <polygon points="120,220 220,110 320,170 440,95 560,180 600,220" fill="#082016" opacity="0.9" />
            {/* Training Rig / Pullup Timber Beam */}
            <rect x="250" y="100" width="8" height="110" fill="#1b4332" />
            <rect x="342" y="100" width="8" height="110" fill="#1b4332" />
            <rect x="240" y="96" width="120" height="7" rx="3" fill="#2d6a4f" />
            {/* Gymnastics Rings hanging */}
            <line x1="280" y1="103" x2="280" y2="135" stroke="#40916c" strokeWidth="1.5" />
            <circle cx="280" cy="142" r="7" fill="none" stroke="#52b788" strokeWidth="2.5" />
            <line x1="320" y1="103" x2="320" y2="135" stroke="#40916c" strokeWidth="1.5" />
            <circle cx="320" cy="142" r="7" fill="none" stroke="#52b788" strokeWidth="2.5" />
            {/* Emerald Sunlight burst */}
            <circle cx="300" cy="60" r="40" fill="#34d399" opacity="0.15" />
          </svg>
        );

      case 'wisdom':
      case 'scholar':
        return (
          <svg viewBox="0 0 600 220" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="bg-wisdom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#04121e" />
                <stop offset="60%" stopColor="#08233a" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <rect width="600" height="220" fill="url(#bg-wisdom)" />
            {/* Gothic Window Ribs */}
            <path d="M200,220 L200,90 Q300,10 400,90 L400,220 Z" fill="#061826" stroke="#0ea5e9" strokeWidth="2" strokeOpacity="0.4" />
            <line x1="300" y1="10" x2="300" y2="220" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.3" />
            <line x1="200" y1="120" x2="400" y2="120" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.3" />
            {/* Bookcases */}
            <rect x="30" y="40" width="120" height="170" fill="#030d15" stroke="#1d4ed8" strokeWidth="1" strokeOpacity="0.3" />
            <line x1="30" y1="80" x2="150" y2="80" stroke="#1e40af" strokeWidth="2" />
            <line x1="30" y1="125" x2="150" y2="125" stroke="#1e40af" strokeWidth="2" />
            <line x1="30" y1="170" x2="150" y2="170" stroke="#1e40af" strokeWidth="2" />
            <rect x="450" y="40" width="120" height="170" fill="#030d15" stroke="#1d4ed8" strokeWidth="1" strokeOpacity="0.3" />
            <line x1="450" y1="80" x2="570" y2="80" stroke="#1e40af" strokeWidth="2" />
            <line x1="450" y1="125" x2="570" y2="125" stroke="#1e40af" strokeWidth="2" />
            {/* Reading desk & open tome */}
            <rect x="230" y="165" width="140" height="12" rx="3" fill="#172554" />
            <polygon points="275,160 300,154 325,160 300,165" fill="#93c5fd" />
            {/* Banker Lamp Glow */}
            <ellipse cx="300" cy="154" rx="35" ry="15" fill="#38bdf8" opacity="0.3" />
          </svg>
        );

      case 'creation':
      case 'creator':
        return (
          <svg viewBox="0 0 600 220" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="bg-creation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14061e" />
                <stop offset="60%" stopColor="#250d38" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <rect width="600" height="220" fill="url(#bg-creation)" />
            {/* Studio Lights Cone */}
            <polygon points="120,20 80,220 220,220" fill="#c084fc" opacity="0.12" />
            <polygon points="480,20 380,220 520,220" fill="#e879f9" opacity="0.12" />
            {/* Tripod & Camera Silhouette */}
            <rect x="270" y="100" width="60" height="35" rx="5" fill="#0a0210" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.6" />
            <circle cx="300" cy="117" r="10" fill="#1e082f" stroke="#c084fc" strokeWidth="2" />
            <line x1="300" y1="135" x2="260" y2="215" stroke="#0a0210" strokeWidth="3" />
            <line x1="300" y1="135" x2="300" y2="215" stroke="#0a0210" strokeWidth="3" />
            <line x1="300" y1="135" x2="340" y2="215" stroke="#0a0210" strokeWidth="3" />
            {/* Soundboard waveforms / Timeline */}
            <line x1="200" y1="180" x2="400" y2="180" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 2" />
            <line x1="220" y1="190" x2="380" y2="190" stroke="#ec4899" strokeWidth="1" strokeDasharray="8 4" />
          </svg>
        );

      default:
        // Nexus
        return (
          <svg viewBox="0 0 600 220" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="bg-nexus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16100a" />
                <stop offset="60%" stopColor="#2c1f11" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <rect width="600" height="220" fill="url(#bg-nexus)" />
            {/* Celestial Astrolabe Rings */}
            <circle cx="300" cy="110" r="70" fill="none" stroke="#d97706" strokeWidth="2" strokeOpacity="0.6" />
            <circle cx="300" cy="110" r="50" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 3" />
            <circle cx="300" cy="110" r="30" fill="none" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="300" cy="110" r="5" fill="#fef08a" />
            {/* Sundial Needle */}
            <line x1="300" y1="110" x2="340" y2="60" stroke="#fde68a" strokeWidth="2.5" />
          </svg>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-[#27303c] overflow-hidden bg-[#0c0f12] shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative group">
      {/* Visual Canvas Artwork View */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden">
        {renderThematicArt()}

        {/* Ambient Top & Bottom Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101316] via-transparent to-black/40 pointer-events-none" />

        {/* Top Location Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-[#0c0e11]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] font-semibold text-[#f5efe3]">
            <MapPin className="w-3.5 h-3.5" style={{ color: island.accentHex }} />
            <span>{area.name}</span>
          </div>

          <div
            className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-widest font-bold border backdrop-blur-md"
            style={{
              backgroundColor: `${island.accentHex}20`,
              borderColor: `${island.accentHex}60`,
              color: island.accentHex,
            }}
          >
            {pic.visualTag}
          </div>
        </div>

        {/* Bottom Location Caption Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xs text-[#d5cfc2] bg-[#0c0e11]/85 backdrop-blur-md p-2.5 rounded-xl border border-white/10 leading-relaxed">
            <span className="font-semibold block text-[11px] mb-0.5" style={{ color: island.accentHex }}>
              ✦ {pic.theme}
            </span>
            {pic.scenicDescription}
          </p>
        </div>
      </div>
    </div>
  );
};
