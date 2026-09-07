import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily / safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Robust Gemini execution helper with automatic model fallback & retry
// Handles 503 UNAVAILABLE (high demand spikes), 429, and transient timeouts
async function generateGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  const candidateModels = [
    params.primaryModel || "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || err);
      console.warn(`[Gemini] Model ${model} encountered issue (${errMsg.slice(0, 140)}). Trying fallback model...`);
      // Brief 150ms backoff before attempting next candidate
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  throw lastError;
}

const SYSTEM_GUIDE_INSTRUCTION = `You are the Ascension Guide—a grounded, disciplined, and thoughtful AI mentor for universal personal mastery and faceless storytelling.

Core Philosophy:
- Sincerity Over Spectacle: Counter shallow internet vanity. Real self-discipline is quiet stewardship of the mind, body, and craft—not an aesthetic performance for strangers.
- The Five Habit Islands of Personal Mastery:
  1. Sanctuary of the Soul: Restoring inner peace through mindfulness meditation, 4-7-8 breathwork, quiet contemplation, or gratitude.
  2. Chamber of Deep Reflection: Evening audit of wins and frictions, releasing burdens into the hearth, resetting fresh without self-blame.
  3. Citadel of Vitality: Honoring physical health through movement (calisthenics, strength, running), hydration, and whole-food nourishment.
  4. Archive of Wisdom: 30 minutes of undisturbed focus reading, philosophical inquiry, and deep study.
  5. Atelier of Creation: Faceless visual storytelling, writing with intention, producing value without chasing algorithmic applause.
- Inner Peace & Clean Renewal: Reject guilt spirals and anxious self-reproach. A broken streak is merely an invitation to begin again with quiet presence.

Tone & Voice:
- Grounded, warm, articulate, quiet, and steadfast.
- Free from religious dogma or guilt, accessible, empowering, and meaningful to people of all backgrounds and beliefs.
- Strictly ban internet hyperbole ("Let's crush it!"), hollow gym clichés, and conversational fluff.`;

// Rarity tier helper
function getTier(streak: number): 'Common' | 'Rare' | 'Epic' | 'Legendary' {
  if (streak >= 90) return 'Legendary';
  if (streak >= 30) return 'Epic';
  if (streak >= 7) return 'Rare';
  return 'Common';
}

const QUEST_NAMES: Record<string, string> = {
  spirituality: "Sanctuary of the Soul (Mindfulness & Meditation)",
  reflection: "Chamber of Reflection (Self-Audit & Renewal)",
  vitality: "Citadel of Vitality (Physical Health & Energy)",
  wisdom: "Archive of Wisdom (Deep Focus & Study)",
  creation: "Atelier of Creation (Faceless Storytelling)",
  // Aliases for backward compatibility
  salah: "Sanctuary of the Soul (Mindfulness & Meditation)",
  alchemist: "Chamber of Reflection (Self-Audit & Renewal)",
  athlete: "Citadel of Vitality (Physical Health & Energy)",
  scholar: "Archive of Wisdom (Deep Focus & Study)",
  creator: "Atelier of Creation (Faceless Storytelling)",
};

// API: Health
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: Parse Daily Check-in & Generate Ascension Log
app.post("/api/ascension/parse-log", async (req: Request, res: Response) => {
  try {
    const { text, currentStreaks = {}, dayNumber: explicitDay } = req.body;
    const rawText = String(text || "").trim();

    const previousStreaks: Record<string, number> = {
      spirituality: Number(currentStreaks.spirituality ?? currentStreaks.salah) || 0,
      reflection: Number(currentStreaks.reflection ?? currentStreaks.alchemist) || 0,
      vitality: Number(currentStreaks.vitality ?? currentStreaks.athlete) || 0,
      wisdom: Number(currentStreaks.wisdom ?? currentStreaks.scholar) || 0,
      creation: Number(currentStreaks.creation ?? currentStreaks.creator) || 0,
    };

    let day = Number(explicitDay) || 1;
    const dayMatch = rawText.match(/day\s*(\d+)/i);
    if (dayMatch && dayMatch[1]) {
      day = parseInt(dayMatch[1], 10);
    }

    let parsedCompletions: Record<string, boolean> = {
      spirituality: false,
      reflection: false,
      vitality: false,
      wisdom: false,
      creation: false,
    };
    let reflection = "";

    const ai = getGeminiClient();

    if (ai) {
      try {
        const parsePrompt = `The user submitted this daily check-in text:
"${rawText}"

Determine whether each of the 5 Universal Disciplines was Completed (true) or Missed (false):
1. spirituality: Sanctuary of the Soul (meditation, prayer, breathwork, stillness, or spiritual devotion)
2. reflection: Chamber of Reflection (journaling, evening review, letting go of guilt, self-audit)
3. vitality: Citadel of Vitality (workout, calisthenics, gym, run, mobility, hydration, clean nutrition)
4. wisdom: Archive of Wisdom (reading, study, philosophy, deep undistracted focus)
5. creation: Atelier of Creation (writing, faceless video, b-roll, content craft, recording)

Also extract the day number if mentioned, or default to ${day}.
Provide a grounded, calm 1% reflection (2-3 sentences) evaluating their day. If disciplines were missed, provide encouraging, guilt-free perspective to resume tomorrow with clarity. If successful, encourage quiet humility and steady consistency.`;

        const geminiRes = await generateGeminiWithFallback(ai, {
          contents: parsePrompt,
          config: {
            systemInstruction: SYSTEM_GUIDE_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                spirituality: { type: Type.BOOLEAN },
                reflection: { type: Type.BOOLEAN },
                vitality: { type: Type.BOOLEAN },
                wisdom: { type: Type.BOOLEAN },
                creation: { type: Type.BOOLEAN },
                guideReflection: { type: Type.STRING },
              },
              required: ["day", "spirituality", "reflection", "vitality", "wisdom", "creation", "guideReflection"],
            },
          },
        });

        const jsonParsed = JSON.parse(geminiRes.text || "{}");
        if (jsonParsed.day) day = jsonParsed.day;
        parsedCompletions.spirituality = Boolean(jsonParsed.spirituality);
        parsedCompletions.reflection = Boolean(jsonParsed.reflection);
        parsedCompletions.vitality = Boolean(jsonParsed.vitality);
        parsedCompletions.wisdom = Boolean(jsonParsed.wisdom);
        parsedCompletions.creation = Boolean(jsonParsed.creation);
        if (jsonParsed.guideReflection) reflection = jsonParsed.guideReflection;
      } catch (err) {
        console.error("Gemini parse error, falling back to heuristic parsing:", err);
      }
    }

    // Heuristic fallback if reflection is empty
    if (!reflection) {
      const lower = rawText.toLowerCase();
      const hasMissedSpirit = /missed.*(spirit|meditat|mindful|breath|stillness|soul)/i.test(lower);
      const hasMissedReflect = /missed.*(reflect|journal|audit|hearth)/i.test(lower);
      const hasMissedVitality = /missed.*(vitality|workout|gym|exercise|run|health)/i.test(lower);
      const hasMissedWisdom = /missed.*(wisdom|study|read|focus|book)/i.test(lower);
      const hasMissedCreation = /missed.*(creat|video|script|b-roll|story)/i.test(lower);

      if (/(meditat|mindful|breath|stillness|soul|spirit)/i.test(lower) && !hasMissedSpirit) parsedCompletions.spirituality = true;
      if (/(reflect|journal|audit|hearth|accounting)/i.test(lower) && !hasMissedReflect) parsedCompletions.reflection = true;
      if (/(workout|gym|training|run|exercise|vitality|body)/i.test(lower) && !hasMissedVitality) parsedCompletions.vitality = true;
      if (/(study|read|book|wisdom|focus|scholar)/i.test(lower) && !hasMissedWisdom) parsedCompletions.wisdom = true;
      if (/(creat|video|script|edit|b-roll|story)/i.test(lower) && !hasMissedCreation) parsedCompletions.creation = true;

      const completedCount = Object.values(parsedCompletions).filter(Boolean).length;
      if (completedCount === 5) {
        reflection = "All five realms aligned in harmony today. Receive this quiet victory with humility, and guard tomorrow's first morning hour with steady resolve.";
      } else if (completedCount >= 3) {
        reflection = "The core disciplines held firm. For the friction points today, do not dwell in self-criticism. Release the burden into the hearth tonight and begin anew tomorrow.";
      } else {
        reflection = "A day of high friction. Remember that streaks measure consistency, not your character. Rest your mind tonight and rebuild your morning stillness at dawn.";
      }
    }

    const questList = ['spirituality', 'reflection', 'vitality', 'wisdom', 'creation'] as const;
    const questsStatus = questList.map((id) => {
      const isCompleted = parsedCompletions[id];
      const prevStreak = previousStreaks[id] || 0;
      const newStreak = isCompleted ? prevStreak + 1 : 0;
      const tier = getTier(newStreak);

      return {
        questId: id,
        questName: QUEST_NAMES[id],
        completed: isCompleted,
        currentStreak: newStreak,
        tier,
        previousStreak: prevStreak,
      };
    });

    const completionCount = questsStatus.filter((q) => q.completed).length;
    const score = Math.round((completionCount / 5) * 100);

    const questLines = questsStatus
      .map(
        (q) =>
          `- ${q.questName}: ${q.completed ? "Completed" : "Missed"} | Current Streak: ${q.currentStreak} day${q.currentStreak === 1 ? "" : "s"} | Tier: ${q.tier}`
      )
      .join("\n");

    const formattedOutput = `=== ASCENSION LOG: DAY ${day} ===\nScore: ${score}% | Completion: ${completionCount}/5 Disciplines\n\n[Table or List of Quests]:\n${questLines}\n\n[1% Better Reflection]:\n${reflection}`;

    res.json({
      dayNumber: day,
      score,
      completionCount,
      quests: questsStatus,
      reflection,
      formattedOutput,
      rawInput: rawText,
    });
  } catch (error: any) {
    console.error("Error in parse-log:", error);
    res.status(500).json({ error: error.message || "Failed to parse ascension log" });
  }
});

// API: Generate Faceless Content Script with Production Table
app.post("/api/ascension/generate-script", async (req: Request, res: Response) => {
  try {
    const { topic, customNotes, targetVibe } = req.body;
    const userTopic = topic || "The quiet discipline of waking early and trading digital noise for analog stillness";

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        id: `script-${Date.now()}`,
        title: "The Analog Silence Protocol",
        concept: userTopic,
        duration: "34s",
        visualHook: "I deleted three addictive apps and bought a blank notebook. My brain finally stopped racing.",
        body: "For two years, I thought waking up was about productivity hacks and dopamine tracking. Then I realized: stillness isn't an achievement you broadcast. It's a sanctuary you protect before the world awakens.",
        spiritualAnchor: "Your day does not belong to notifications. Anchor your morning in stillness, breathwork, or meditation.",
        resolution: "Start with 10 minutes of silence tomorrow. Notice what changes.",
        cinematographyNotes: [
          "Low-key exposure with subtle window backlight",
          "Warm indoor color temperature (3200K)",
          "Slow cinematic pacing (18-24fps cadence), strictly zero face reveals",
          "Creamy highlights, soft bloom/diffusion, fine 35mm analog grain",
        ],
        bRollChecklist: [
          "Steam rising from kettle in dawn shadow",
          "Overhead macro shot of opening linen-bound journal",
          "Top-down smooth glide over simple meditation cushion",
          "Close-up of vintage fountain pen touching textured paper",
        ],
        scenes: [
          {
            timestamp: "0:00 - 0:03",
            visualAction: "Close-up of phone screen glowing in darkness, finger tapping 'Delete App', immediate cut to stillness.",
            audioScript: "I deleted three addictive apps and bought a blank notebook. My brain finally stopped racing.",
            onScreenText: "Why modern productivity failed me.",
          },
          {
            timestamp: "0:04 - 0:12",
            visualAction: "Slow overhead track of steam swirling from herbal tea beside a closed physical book.",
            audioScript: "We fill every silence with feeds and progress charts, terrified of being alone with our thoughts.",
            onScreenText: "Noise vs. Stillness",
          },
          {
            timestamp: "0:13 - 0:25",
            visualAction: "Raking morning light catching the weave of clean cedar flooring; slow unrolling of cushion.",
            audioScript: "True discipline isn't an aesthetic performance for the internet. It is the quiet stewardship of your soul.",
            onScreenText: "Inner Stewardship",
          },
          {
            timestamp: "0:26 - 0:35",
            visualAction: "Hands opening a weathered volume of timeless philosophy in natural sidelight; zero face visible.",
            audioScript: "Anchor your day before the world demands your attention. When you own your morning, the noise dissolves.",
            onScreenText: "Anchor your day in stillness.",
          },
          {
            timestamp: "0:36 - 0:40",
            visualAction: "Fountain pen gently capped and placed atop the journal; quiet fade to black.",
            audioScript: "Start with 10 minutes of silence tomorrow.",
            onScreenText: "Begin tomorrow.",
          },
        ],
      });
    }

    const scriptPrompt = `Generate a faceless vertical video script for YouTube Shorts / TikTok based on this concept:
"${userTopic}"
${customNotes ? `Additional creator notes: ${customNotes}` : ""}
${targetVibe ? `Target aesthetic: ${targetVibe}` : ""}

Adhere strictly to the Faceless Content Creation Framework:
1. Duration: 25–45 seconds.
2. Visual Hook (0–3s): Problem of modern hyper-stimulation + Immediate contrast with analog stillness.
3. Body (4–25s): 2–3 rapid, reflective narrative lines paired with kinetic B-roll descriptions.
4. Spiritual Anchor (26–35s): Connect discipline back to inner peace, quiet stewardship of the soul, or timeless wisdom.
5. Resolution / Micro-CTA (36–40s): Gentle prompt for quiet reflection rather than engagement farming.
6. Cinematography: Low-key exposure, natural warm indoor lighting, slow cinematic pacing, strictly zero face reveals.
   B-Roll: Steam rising from tea back-lit by dawn light, opening a linen journal, physical books, analog pens.
7. Return JSON matching schema.`;

    let parsed: any = null;
    try {
      const geminiRes = await generateGeminiWithFallback(ai, {
        contents: scriptPrompt,
        config: {
          systemInstruction: SYSTEM_GUIDE_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              duration: { type: Type.STRING },
              visualHook: { type: Type.STRING },
              body: { type: Type.STRING },
              spiritualAnchor: { type: Type.STRING },
              resolution: { type: Type.STRING },
              cinematographyNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              bRollChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timestamp: { type: Type.STRING },
                    visualAction: { type: Type.STRING },
                    audioScript: { type: Type.STRING },
                    onScreenText: { type: Type.STRING },
                  },
                  required: ["timestamp", "visualAction", "audioScript", "onScreenText"],
                },
              },
            },
            required: [
              "title",
              "duration",
              "visualHook",
              "body",
              "spiritualAnchor",
              "resolution",
              "cinematographyNotes",
              "bRollChecklist",
              "scenes",
            ],
          },
        },
      });

      parsed = JSON.parse(geminiRes.text || "{}");
    } catch (genErr) {
      console.warn("Gemini generation failed, using structured template fallback:", genErr);
    }

    res.json({
      id: `script-${Date.now()}`,
      concept: userTopic,
      ...parsed,
    });
  } catch (error: any) {
    console.error("Error in generate-script:", error);
    res.status(500).json({ error: error.message || "Failed to generate script" });
  }
});

// API: Direct Consultation with the Ascension Guide
app.post("/api/ascension/consult", async (req: Request, res: Response) => {
  try {
    const { message, currentStreaks = {} } = req.body;
    const userMessage = String(message || "").trim();

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();
    let reply = "";

    if (ai) {
      try {
        const streakSummary = `Current user streaks: Soul Restoration ${currentStreaks.spirituality || 0}d, Reflection ${currentStreaks.reflection || 0}d, Vitality ${currentStreaks.vitality || 0}d, Wisdom ${currentStreaks.wisdom || 0}d, Creation ${currentStreaks.creation || 0}d.`;

        const chatContext = `You are the Ascension Guide for universal personal mastery.
${streakSummary}

Address the seeker with grounded, calm, articulate, and disciplined wisdom.
Do not use hype or buzzwords. Speak with philosophical depth, emotional stillness, and practical clarity.`;

        const response = await generateGeminiWithFallback(ai, {
          contents: [
            {
              role: "user",
              parts: [{ text: `${chatContext}\n\nUser asks: ${userMessage}` }],
            },
          ],
          config: {
            systemInstruction: SYSTEM_GUIDE_INSTRUCTION,
          },
        });

        reply = response.text || "";
      } catch (geminiErr) {
        console.warn("Gemini consult error, using philosophical fallback:", geminiErr);
      }
    }

    if (!reply) {
      if (/broken|streak|missed|guilt|shame/i.test(userMessage)) {
        reply = "Hear this clearly: a broken streak is an event in time, never a verdict on your worth. When guilt spirals attack you, recognize them as friction designed to keep you paralyzed. Visit the Chamber of Reflection, place that self-reproach into the hearth, and begin anew with quiet resolve. The journey is walked one breath at a time.";
      } else if (/faceless|content|video|aesthetic|tiktok|shorts/i.test(userMessage)) {
        reply = "Regarding your craft: the moment you create solely for algorithmic applause, your work loses its soul. Hide your face not as an aesthetic gimmick, but as a deliberate shield against ego. Focus on tactile realities—the sound of ink on linen, the steam in early morning light, the words that actually matter. Produce quietly; let the truth carry the weight.";
      } else {
        reply = "Remember your daily anchors: stillness, physical vitality, deep study, and evening reflection. In every friction you face, quiet the noise of modern comparison and ask: does this nourish my vessel and mind, or does it merely feed vanity? Re-center your intention tonight and welcome tomorrow with peace.";
      }
    }

    res.json({ reply });
  } catch (error: any) {
    console.error("Error in consult:", error);
    res.status(500).json({ error: error.message || "Failed to consult guide" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ascension Guide server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
