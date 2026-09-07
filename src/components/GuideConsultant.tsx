import React, { useState } from 'react';
import {
  Compass,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  Shield,
  HelpCircle,
  Flame,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { GuideMessage, QuestStatus } from '../types';

interface GuideConsultantProps {
  quests: QuestStatus[];
  dayNumber: number;
}

export const GuideConsultant: React.FC<GuideConsultantProps> = ({
  quests,
  dayNumber,
}) => {
  const [messages, setMessages] = useState<GuideMessage[]>([
    {
      id: 'msg-1',
      sender: 'guide',
      content: `Welcome, wayfarer. I am your Ascension Guide across the Habit Archipelago. 

We measure our days not by arbitrary hustle or vanity metrics, but by quiet stewardship of the soul, physical vitality, philosophical wisdom, and intentional storytelling. Whether you are struggling with broken streaks, seeking to let go of self-blame in the Chamber of Reflection, or calibrating faceless storytelling without ego, speak plainly. How does your inner state feel today?`,
      timestamp: 'Dawn',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'I broke my meditation streak today and feel paralyzed by guilt. How do I reset?',
    'How do I ensure my faceless storytelling doesn’t turn into another vanity aesthetic?',
    'How can I balance intense physical vitality training with 30m deep study blocks?',
    'How do I use the Chamber of Reflection to release anxiety and regret?',
  ];

  const handleSendMessage = async (userText: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: GuideMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const streakObj = quests.reduce((acc, q) => {
        acc[q.questId] = q.currentStreak;
        return acc;
      }, {} as Record<string, number>);

      const res = await fetch('/api/ascension/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          currentStreaks: streakObj,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to consult Ascension Guide');
      }

      const data = await res.json();
      const guideReply: GuideMessage = {
        id: `guide-${Date.now()}`,
        sender: 'guide',
        content: data.reply || 'Quiet your heart. True discipline is rooted in quiet stillness and deliberate action.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, guideReply]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: GuideMessage = {
        id: `err-${Date.now()}`,
        sender: 'guide',
        content:
          'When friction arises, do not despair. Self-renewal is instantaneous. Take three deep breaths, step away from screens, clear your space, and begin anew with quiet resolve.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-[#121619] border border-[#242b32] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#1c2227] border border-[#c5a059]/40 flex items-center justify-center flex-shrink-0">
              <Compass className="w-6 h-6 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-xl font-bold text-[#f5efe3]">
                  The Ascension Guide
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#1c2227] text-[#c5a059] border border-[#c5a059]/30">
                  Brotherly Counsel
                </span>
              </div>
              <p className="text-xs text-[#8f887c] mt-0.5">
                Spiritual grounding, habit architecture, and faceless storytelling philosophy.
              </p>
            </div>
          </div>

          <div className="text-xs text-[#9d9688] bg-[#171c21] p-3 rounded-xl border border-[#242b33] max-w-sm">
            <span className="text-[#c5a059] font-semibold block mb-0.5">Communication Rule:</span>
            <span>Quiet, articulate, brotherly wisdom. Zero gym-bro clichés, zero vanity hype.</span>
          </div>
        </div>
      </div>

      {/* Suggested Inquiries */}
      <div className="rounded-xl border border-[#222830] bg-[#101316] p-4">
        <span className="text-[11px] uppercase tracking-wider text-[#798088] font-semibold block mb-2">
          Consultation Starting Points:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="text-left text-xs p-2.5 rounded-lg bg-[#161a1e] hover:bg-[#1f262e] text-[#cfc8bb] border border-[#252c34] hover:border-[#c5a059]/40 transition-colors cursor-pointer flex items-start gap-2"
            >
              <span className="text-[#c5a059] font-bold">›</span>
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="rounded-xl border border-[#242b32] bg-[#0f1214] overflow-hidden flex flex-col h-[520px]">
        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isGuide = msg.sender === 'guide';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isGuide ? 'justify-start' : 'justify-end'}`}
              >
                {isGuide && (
                  <div className="w-8 h-8 rounded-lg bg-[#1a2027] border border-[#c5a059]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Compass className="w-4 h-4 text-[#c5a059]" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isGuide
                      ? 'bg-[#15191d] border border-[#252c34] text-[#ddd7cc]'
                      : 'bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#f5efe3]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[#6d757d] mb-1 font-mono">
                    <span>{isGuide ? 'ASCENSION GUIDE' : 'ANONYMOUS CREATOR'}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                </div>

                {!isGuide && (
                  <div className="w-8 h-8 rounded-lg bg-[#20272f] border border-[#303842] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-[#ded8cc]" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1a2027] border border-[#c5a059]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Compass className="w-4 h-4 text-[#c5a059] animate-pulse" />
              </div>
              <div className="bg-[#15191d] border border-[#252c34] rounded-xl p-3 text-xs text-[#9d9688] flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
                <span>Contemplating with spiritual rigor...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-3 bg-[#13171a] border-t border-[#1f252c] flex items-center gap-2"
        >
          <input
            id="guide-consult-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the Ascension Guide about habit friction, self-renewal, or faceless storytelling..."
            className="flex-1 bg-[#0c0e10] border border-[#262d35] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#f5efe3] focus:outline-none focus:border-[#c5a059]"
          />
          <button
            type="submit"
            id="guide-consult-send-btn"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d6b066] text-[#0c0e10] font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0c0e10]" />
            ) : (
              <Send className="w-4 h-4 text-[#0c0e10]" />
            )}
            <span className="hidden sm:inline">Inquire</span>
          </button>
        </form>
      </div>
    </div>
  );
};
