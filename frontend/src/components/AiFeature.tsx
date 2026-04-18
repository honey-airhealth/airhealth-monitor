import { ArrowRight, Bot, HeartPulse, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

const aiPrompts = [
  'PM2.5 is high today. What should I do?',
  'Can I exercise outside?',
  'My throat feels irritated.',
] as const;

const aiHighlights = [
  {
    Icon: HeartPulse,
    label: 'First-care guidance',
    text: 'Practical steps for cough, headache, throat irritation, and poor-air days.',
  },
  {
    Icon: ShieldCheck,
    label: 'Live context',
    text: 'Uses the latest air snapshot when the backend and Gemini key are available.',
  },
] as const;

export function AiFeature() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eff8ff_44%,#eefcff_100%)] px-4 py-10 md:px-6 md:py-12">
      <div className="absolute inset-0">
        <div className="absolute left-[10%] top-[14%] h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-[12%] bottom-[10%] h-64 w-64 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-100/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-[68rem]">
        <Card className="relative overflow-hidden border border-white/85 bg-white/86 shadow-[0_28px_80px_rgba(56,189,248,0.16)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_82%_20%,rgba(34,211,238,0.18),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,248,255,0.92))]" />
          <div className="absolute left-8 top-8 h-16 w-16 rounded-full border-[10px] border-sky-100/70" />
          <div className="absolute bottom-8 right-10 h-20 w-20 rounded-full border-[12px] border-cyan-100/80" />

          <div className="relative grid gap-7 p-5 md:grid-cols-[0.9fr_1.1fr] md:items-center md:p-8 lg:p-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-sky-600 shadow-[0_12px_28px_rgba(56,189,248,0.12)]">
                <Sparkles className="size-4" />
                AirHealth AI
              </div>

              <h2 className="max-w-xl text-[1.9rem] font-black leading-[1.04] tracking-[-0.05em] text-slate-950 md:text-[2.7rem]">
                Ask the AI when the air feels confusing.
              </h2>

              <p className="mt-4 max-w-xl text-[13px] leading-6 text-slate-600 md:text-[0.98rem]">
                AirHealth AI helps turn live sensor context into simple first-care suggestions for PM2.5,
                cough, headache, throat irritation, masks, and outdoor activity decisions.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {aiHighlights.map(({ Icon, label, text }) => (
                  <div
                    key={label}
                    className="rounded-[1.15rem] border border-sky-100 bg-white/72 p-3.5 shadow-[0_12px_30px_rgba(56,189,248,0.08)]"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-[0_10px_22px_rgba(56,189,248,0.18)]">
                        <Icon className="size-4" />
                      </span>
                      <p className="text-sm font-black text-slate-900">{label}</p>
                    </div>
                    <p className="text-xs leading-5 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>

              <a
                href="/ai"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(56,189,248,0.28)]"
              >
                Open AI chat
                <ArrowRight className="size-4" />
              </a>
            </div>

            <div className="relative mx-auto w-full max-w-[30rem]">
              <div className="absolute -left-4 top-8 size-16 rounded-[1.4rem] bg-sky-100/80 rotate-[-10deg]" />
              <div className="absolute -right-3 bottom-8 size-20 rounded-full bg-cyan-100/90" />

              <div className="relative rounded-[1.8rem] border border-white/80 bg-white/88 p-4 shadow-[0_28px_70px_rgba(148,163,184,0.22)] backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-12 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-500 text-white shadow-[0_16px_30px_rgba(56,189,248,0.24)]">
                      <Bot className="size-6" />
                      <span className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-white bg-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-950">AirHealth AI</p>
                      <p className="text-xs font-semibold text-emerald-600">Ready to help</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">
                    Gemini
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="ml-auto max-w-[82%] rounded-[1.15rem] rounded-tr-sm bg-gradient-to-br from-sky-500 to-blue-500 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-[0_12px_26px_rgba(56,189,248,0.2)]">
                    Can I go outside if PM2.5 is high?
                  </div>
                  <div className="max-w-[88%] rounded-[1.15rem] rounded-tl-sm border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
                    Keep it short, avoid intense activity, and use a well-fitted mask when conditions are unhealthy.
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {aiPrompts.map((prompt) => (
                    <div
                      key={prompt}
                      className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm"
                    >
                      <MessageCircle className="size-3.5 text-sky-500" />
                      <span className="truncate">{prompt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
