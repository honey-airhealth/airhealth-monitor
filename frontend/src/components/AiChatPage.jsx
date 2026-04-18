import React from "react";
import { Bot, Brain, Headphones, HeartPulse, MessageCircle, Send, ShieldAlert, Wind } from "lucide-react";

import { resolveApiBaseUrl } from "../api/base";
import DashboardHero from "./DashboardHero.jsx";

const API_BASE = resolveApiBaseUrl();

const quickQuestions = [
  "PM2.5 is very high, but I need to go outside. What should I do?",
  "I have a cough after PM2.5 exposure. What basic care helps?",
  "I get headaches on high-pollution days. What should I watch for?",
  "When should I use a mask or an air purifier?",
];

const focusItems = [
  { icon: Wind, label: "PM2.5 high", text: "Reduce exposure and manage indoor air." },
  { icon: HeartPulse, label: "Cough", text: "Basic care, throat irritation, and warning signs." },
  { icon: Brain, label: "Headache", text: "Triggers, hydration, rest, and urgent symptoms." },
  { icon: ShieldAlert, label: "First care", text: "Practical guidance, not a medical diagnosis." },
];

const initialMessages = [
  {
    role: "assistant",
    content:
      "Hi, I am AirHealth AI. Ask me about PM2.5, cough, headache, throat irritation, or first-care steps during poor air-quality days.",
  },
];

const formatAiError = (message) => {
  if (!message) return "AirHealth AI is not available right now.";
  const lower = message.toLowerCase();
  if (lower.includes("quota") || lower.includes("rate") || lower.includes("429")) {
    return "Gemini quota is not available for this project right now. Check AI Studio quota/billing, or try again later.";
  }
  if (lower.includes("gemini_api_key")) {
    return "GEMINI_API_KEY is missing in the backend environment.";
  }
  return "AirHealth AI could not complete the request. Please try again.";
};

export default function AiChatPage() {
  const [messages, setMessages] = React.useState(initialMessages);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = async (messageText = input) => {
    const clean = messageText.trim();
    if (!clean || sending) return;

    const nextMessages = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/v1/integration/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          history: messages.filter((_, index) => index > 0).slice(-8),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(formatAiError(payload.detail || `API ${response.status}`));
      }

      setMessages([...nextMessages, { role: "assistant", content: payload.answer }]);
    } catch (err) {
      const friendlyError = err.message || "Unable to reach AirHealth AI";
      setError(friendlyError);
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: friendlyError,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_14%_10%,rgba(45,212,191,0.20),transparent_24%),radial-gradient(circle_at_86%_8%,rgba(59,130,246,0.18),transparent_24%),linear-gradient(180deg,#eaf8fb_0%,#f5fbff_42%,#eef6f9_100%)] text-slate-950">
      <div className="mx-auto max-w-[1320px] px-4 py-3 sm:px-6 lg:px-6">
        <DashboardHero
          current="ai"
          icon={Bot}
          title="AirHealth AI"
          subtitle="Chat about PM2.5, cough, headache, and first-care steps for poor air days."
          badge="Gemini chat"
          path="/ai"
          compact
        />

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(260px,0.35fr)_minmax(0,1fr)]">
          <aside className="grid content-start gap-3">
            <div className="rounded-[1.35rem] border border-white/70 bg-white/86 p-4 shadow-[0_18px_46px_rgba(15,23,42,0.07)] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-[0.9rem] bg-slate-950 text-white">
                  <MessageCircle className="size-4.5" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-sky-600">Ask about</div>
                  <h1 className="mt-0.5 text-xl font-black tracking-[-0.05em] text-slate-950">Air health help</h1>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-5 font-medium text-slate-600">
                Use this chat for high-pollution days, cough, headache, throat irritation, and practical first-care steps.
              </p>
            </div>

            <div className="grid gap-3">
              {focusItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[1.1rem] border border-slate-100 bg-white/82 p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-[0.85rem] bg-cyan-50 text-cyan-700">
                        <Icon className="size-4.5" />
                      </div>
                      <div>
                        <div className="text-sm font-black tracking-[-0.02em] text-slate-900">{item.label}</div>
                        <div className="mt-0.5 text-xs leading-4 font-medium text-slate-500">{item.text}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="overflow-hidden rounded-[1.5rem] border border-white/75 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.09)] backdrop-blur-sm">
            <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(236,253,245,0.92))] px-5 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                    <Headphones className="size-3.5" />
                    AI chat
                  </div>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.055em] text-slate-950">Ask about air and symptoms</h2>
                  <p className="mt-1.5 max-w-2xl text-[13px] leading-5 font-medium text-slate-600">
                    Ask about PM2.5 exposure, reducing dust intake, cough, headache, and basic care. Answers are not medical diagnoses.
                  </p>
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                  Gemini ready
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    disabled={sending}
                    className="rounded-full border border-sky-100 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div ref={scrollRef} className="h-[clamp(420px,52vh,620px)] overflow-y-auto bg-slate-50/55 px-5 py-5 sm:px-7">
              <div className="grid gap-4">
                {messages.map((message, index) => {
                  const fromUser = message.role === "user";
                  return (
                    <div key={`${message.role}-${index}`} className={`flex items-start gap-3 ${fromUser ? "justify-end" : "justify-start"}`}>
                      {!fromUser ? (
                        <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm ring-4 ring-white">
                          <Bot className="size-4.5" />
                        </div>
                      ) : null}
                      <div
                        className={`max-w-[calc(94%-48px)] rounded-[1.1rem] px-4 py-3 text-[13px] leading-5 shadow-sm ${
                          fromUser
                            ? "bg-slate-950 text-white"
                            : "border border-slate-100 bg-white text-slate-700"
                        }`}
                      >
                        <div className={`mb-1 text-[10px] font-black uppercase tracking-[0.22em] ${fromUser ? "text-cyan-100" : "text-cyan-700"}`}>
                          {fromUser ? "You" : "AirHealth AI"}
                        </div>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      {fromUser ? (
                        <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-[10px] font-black tracking-[0.08em] text-cyan-700 shadow-sm ring-4 ring-white">
                          ME
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                {sending ? (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm ring-4 ring-white">
                      <Bot className="size-4.5" />
                    </div>
                    <div className="rounded-[1.1rem] border border-slate-100 bg-white px-4 py-3 text-[13px] font-semibold text-slate-500 shadow-sm">
                      AirHealth AI is thinking...
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {error ? (
              <div className="border-t border-rose-100 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white px-5 py-4 sm:px-7">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask, for example: PM2.5 is high and I started coughing. What should I do?"
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-[15px] font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  aria-label="Send message"
                >
                  <Send className="size-5" />
                </button>
              </div>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
