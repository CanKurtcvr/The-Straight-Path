import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Film,
  Camera,
  Layers,
  Clock,
  Send,
  Loader2,
  Table as TableIcon,
  BookOpen,
  EyeOff,
  Sun,
  Flame,
} from 'lucide-react';
import { FacelessScript, ProductionScene } from '../types';
import { PRESET_SCRIPTS } from '../data/defaultData';

export const FacelessStudio: React.FC = () => {
  const [scripts, setScripts] = useState<FacelessScript[]>(PRESET_SCRIPTS);
  const [selectedScript, setSelectedScript] = useState<FacelessScript>(PRESET_SCRIPTS[0]);
  const [topicInput, setTopicInput] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Teleprompter / Rehearsal playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Rehearsal timer effect
  React.useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev + 1;
          // Approximate scene switching based on duration
          const totalScenes = selectedScript.scenes.length;
          if (totalScenes > 0) {
            const sceneIdx = Math.min(
              totalScenes - 1,
              Math.floor((next / 38) * totalScenes)
            );
            setActiveSceneIndex(sceneIdx);
          }
          if (next >= 40) {
            setIsPlaying(false);
            return 40;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedScript.scenes.length]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ascension/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput,
          customNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate faceless script');
      }

      const newScript: FacelessScript = await response.json();
      setScripts([newScript, ...scripts]);
      setSelectedScript(newScript);
      setTopicInput('');
      setCustomNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyProductionTableMarkdown = () => {
    const header = '| Timestamp | Visual Action (B-Roll) | Audio / Voiceover Script | On-Screen Text |\n|---|---|---|---|\n';
    const rows = selectedScript.scenes
      .map(
        (s) =>
          `| ${s.timestamp} | ${s.visualAction} | ${s.audioScript} | ${s.onScreenText} |`
      )
      .join('\n');
    navigator.clipboard.writeText(header + rows);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  const copyFullScriptText = () => {
    const text = `TITLE: ${selectedScript.title} (${selectedScript.duration})
CONCEPT: ${selectedScript.concept}

[VISUAL HOOK (0-3s)]:
${selectedScript.visualHook}

[BODY (4-25s)]:
${selectedScript.body}

[SPIRITUAL ANCHOR (26-35s)]:
${selectedScript.spiritualAnchor}

[RESOLUTION / MICRO-CTA (36-40s)]:
${selectedScript.resolution}

=== ACTIONABLE PRODUCTION TABLE ===
${selectedScript.scenes
  .map(
    (s, i) =>
      `[Scene ${i + 1}] ${s.timestamp}\nVisual: ${s.visualAction}\nAudio: "${s.audioScript}"\nText: [${s.onScreenText}]\n`
  )
  .join('\n')}

CINEMATOGRAPHY & GRADING:
${selectedScript.cinematographyNotes.map((n) => `• ${n}`).join('\n')}

B-ROLL CHECKLIST:
${selectedScript.bRollChecklist.map((b) => `[ ] ${b}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#14181c] to-[#101316] border border-[#222830] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#c5a059] text-xs font-semibold uppercase tracking-wider mb-1">
              <Film className="w-4 h-4" />
              <span>Faceless Storytelling Engine</span>
            </div>
            <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#f5efe3]">
              The Anonymous Creator Workshop
            </h2>
            <p className="text-xs sm:text-sm text-[#928c80] max-w-2xl mt-1">
              Crafting high-retention 25–45s vertical narratives with atmospheric B-roll, zero face reveals, and spiritual anchors connecting discipline to Tazkiyah.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-[#1a2027] border border-[#2b3540] text-xs text-[#dcd7cc] flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[#c5a059]" />
              <span>Strict Zero Face Reveals</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#1a2027] border border-[#2b3540] text-xs text-[#dcd7cc] flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>25–45s Retention Cadence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Script Generator Input Form */}
      <div className="rounded-xl border border-[#262e37] bg-[#121619] p-5">
        <h3 className="font-serif-title font-bold text-sm text-[#f5efe3] mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#c5a059]" />
          <span>Generate New Retention Script & Production Table</span>
        </h3>

        {/* Suggested Quick Concepts */}
        <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
          <span className="text-[11px] text-[#788088] py-0.5">Quick Concepts:</span>
          {[
            'The 5:00 AM Silent Awakening',
            'Why I Deleted All Social Media Before Dawn',
            'The Day Bends to Deep Focus',
            'The Silent Linen Notebook Protocol',
            'Treating the Mind and Body with Stewardship',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setTopicInput(prompt)}
              className="text-[11px] px-2 py-0.5 rounded bg-[#181d22] hover:bg-[#222931] text-[#c9c2b4] border border-[#262f38] transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[#ded8cc] block mb-1">
                Core Narrative Theme / Concept:
              </label>
              <input
                id="script-topic-input"
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Waking up in darkness while the city sleeps, anchoring my morning to meditation and stillness"
                className="w-full rounded-lg bg-[#0c0e10] border border-[#29323c] px-3.5 py-2 text-xs sm:text-sm text-[#f5efe3] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#ded8cc] block mb-1">
                Visual or Grading Notes (Optional):
              </label>
              <input
                id="script-notes-input"
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Steam rising from tea, wooden desk, brass pen"
                className="w-full rounded-lg bg-[#0c0e10] border border-[#29323c] px-3.5 py-2 text-xs sm:text-sm text-[#f5efe3] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              id="generate-script-btn"
              disabled={loading || !topicInput.trim()}
              className="px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d6b066] text-[#0c0e10] font-bold text-xs flex items-center gap-2 transition-all shadow-[0_2px_10px_rgba(197,160,89,0.25)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0c0e10]" />
                  <span>Synthesizing Cinematics & Table...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#0c0e10]" />
                  <span>Generate Faceless Video Script</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Script Selector Tabs if multiple */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] uppercase tracking-wider text-[#798086] font-semibold flex-shrink-0">
          Script Archive:
        </span>
        {scripts.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedScript(s);
              setIsPlaying(false);
              setTimerSeconds(0);
              setActiveSceneIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              selectedScript.id === s.id
                ? 'bg-[#1f262e] text-[#f4efe4] border border-[#c5a059]/40 shadow-sm'
                : 'bg-[#13171a] text-[#868f97] hover:text-[#d3ccc0] border border-[#20272e]'
            }`}
          >
            <span>{s.title}</span>
            <span className="text-[10px] text-[#c5a059] font-mono font-bold">
              {s.duration}
            </span>
          </button>
        ))}
      </div>

      {/* Main Selected Script Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Retention Breakdown & Actionable Production Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Script Overview Card */}
          <div className="rounded-xl border border-[#27303a] bg-[#111417] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f252b] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#c5a059]">
                  VERTICAL RETENTION SCRIPT
                </span>
                <h3 className="font-serif-title font-bold text-lg text-[#f5efe3]">
                  {selectedScript.title}
                </h3>
                <p className="text-xs text-[#8d8577] mt-0.5">{selectedScript.concept}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyFullScriptText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191f25] hover:bg-[#222931] text-[#c5a059] border border-[#c5a059]/30 text-xs font-semibold cursor-pointer transition-colors"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Script</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Script 4-Phase Narrative Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 text-xs">
              {/* Hook */}
              <div className="p-3.5 rounded-lg bg-[#161a1e] border border-[#222830]">
                <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 mb-1">
                  <span>1. VISUAL HOOK (0–3s)</span>
                  <span className="text-[10px] text-[#717a82]">Friction & Contrast</span>
                </div>
                <p className="text-[#dcd7cc] italic leading-relaxed">
                  "{selectedScript.visualHook}"
                </p>
              </div>

              {/* Body */}
              <div className="p-3.5 rounded-lg bg-[#161a1e] border border-[#222830]">
                <div className="flex items-center justify-between text-[11px] font-semibold text-sky-400 mb-1">
                  <span>2. BODY (4–25s)</span>
                  <span className="text-[10px] text-[#717a82]">2-3 Narrative Lines</span>
                </div>
                <p className="text-[#dcd7cc] leading-relaxed">
                  {selectedScript.body}
                </p>
              </div>

              {/* Spiritual Anchor */}
              <div className="p-3.5 rounded-lg bg-[#161a1e] border border-[#222830]">
                <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400 mb-1">
                  <span>3. SPIRITUAL ANCHOR (26–35s)</span>
                  <span className="text-[10px] text-[#717a82]">Connect to Creator</span>
                </div>
                <p className="text-[#dcd7cc] leading-relaxed">
                  {selectedScript.spiritualAnchor}
                </p>
              </div>

              {/* Resolution */}
              <div className="p-3.5 rounded-lg bg-[#161a1e] border border-[#222830]">
                <div className="flex items-center justify-between text-[11px] font-semibold text-purple-400 mb-1">
                  <span>4. RESOLUTION / CTA (36–40s)</span>
                  <span className="text-[10px] text-[#717a82]">Quiet Prompt</span>
                </div>
                <p className="text-[#dcd7cc] italic leading-relaxed">
                  "{selectedScript.resolution}"
                </p>
              </div>
            </div>
          </div>

          {/* Action-Oriented Production Table */}
          <div className="rounded-xl border border-[#27303a] bg-[#111417] overflow-hidden">
            <div className="bg-[#171c21] border-b border-[#222830] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-[#c5a059]" />
                <h4 className="font-serif-title font-bold text-xs sm:text-sm text-[#f5efe3]">
                  Action-Oriented Production Table
                </h4>
              </div>

              <button
                onClick={copyProductionTableMarkdown}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-[#20272f] hover:bg-[#2c3540] text-[#c5a059] border border-[#c5a059]/30 transition-all cursor-pointer"
              >
                {copiedTable ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Markdown</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Table (MD)</span>
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#14181c] border-b border-[#20262d] text-[#818991] uppercase tracking-wider text-[10px] font-mono">
                    <th className="py-2.5 px-3 w-28">Timestamp</th>
                    <th className="py-2.5 px-4">Visual Action (B-Roll)</th>
                    <th className="py-2.5 px-4">Audio / Voiceover Script</th>
                    <th className="py-2.5 px-4 w-36">On-Screen Text</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2026]">
                  {selectedScript.scenes.map((scene, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-[#15191d] transition-colors ${
                        isPlaying && activeSceneIndex === idx ? 'bg-[#1b222a] border-l-2 border-[#c5a059]' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-[11px] font-semibold text-[#c5a059] align-top whitespace-nowrap">
                        {scene.timestamp}
                      </td>
                      <td className="py-3 px-4 text-[#cfc8bc] align-top leading-relaxed">
                        {scene.visualAction}
                      </td>
                      <td className="py-3 px-4 text-[#f0eae0] font-serif align-top leading-relaxed italic">
                        "{scene.audioScript}"
                      </td>
                      <td className="py-3 px-4 text-amber-300/90 font-mono text-[11px] align-top">
                        <span className="bg-[#1a1e22] px-1.5 py-0.5 rounded border border-[#2b333c]">
                          {scene.onScreenText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Cinematography & Teleprompter Rehearsal */}
        <div className="space-y-6">
          {/* Teleprompter / Rehearsal Practice Player */}
          <div className="rounded-xl border border-[#2a333c] bg-[#121619] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1f252d]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#c5a059]" />
                <span className="font-serif-title font-bold text-xs sm:text-sm text-[#f5efe3]">
                  Rehearsal Timer
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#c5a059]">
                00:{timerSeconds.toString().padStart(2, '0')} / 00:38
              </span>
            </div>

            {/* Active Teleprompter Box */}
            <div className="p-4 rounded-xl bg-[#0b0d0e] border border-[#232930] min-h-[140px] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#79838d] uppercase tracking-wider block mb-1">
                  Active Scene {activeSceneIndex + 1} of {selectedScript.scenes.length}
                </span>
                <p className="font-serif text-sm sm:text-base text-[#f5efe3] leading-relaxed italic">
                  "{selectedScript.scenes[activeSceneIndex]?.audioScript || ''}"
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1b2025] text-[11px] text-[#868f98]">
                <span className="text-[#c5a059] font-medium">B-Roll Action:</span>{' '}
                {selectedScript.scenes[activeSceneIndex]?.visualAction || ''}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2 mt-3.5">
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-[#c5a059] hover:bg-[#d6b066] text-[#0c0e10]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Pacing</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Voiceover Run ({selectedScript.duration})</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setTimerSeconds(0);
                  setActiveSceneIndex(0);
                }}
                title="Reset timer"
                className="p-2 rounded-lg bg-[#181d22] hover:bg-[#222931] text-[#89939e] border border-[#29323c] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Direction & Cinematography Guide */}
          <div className="rounded-xl border border-[#27303a] bg-[#111417] p-5">
            <h4 className="font-serif-title font-bold text-xs sm:text-sm text-[#f5efe3] mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#c5a059]" />
              <span>Cinematography & Polish Guide</span>
            </h4>

            <div className="space-y-2.5 text-xs text-[#a49d91]">
              {selectedScript.cinematographyNotes.map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mt-1.5 flex-shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#1d232a]">
              <span className="text-[11px] font-semibold text-[#ded8cc] uppercase tracking-wider block mb-2">
                Atmospheric B-Roll Checklist:
              </span>
              <div className="space-y-1.5 text-xs text-[#8c959f]">
                {selectedScript.bRollChecklist.map((item, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-[#2f3741] bg-[#161a1e] text-[#c5a059] focus:ring-0"
                    />
                    <span className="text-[#cfc8bc]">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
