import { Wind, Activity, TrendingUp, Waves } from 'lucide-react';
import { Button } from './ui/button';

const signalMetrics = [
  { label: 'Air Quality', value: 'AQI 42', detail: 'Low-risk urban zone' },
  { label: 'Respiratory Load', value: '18%', detail: 'Below alert threshold' },
  { label: 'Prediction Window', value: '72h', detail: 'Trend model online' },
];

const featurePills = [
  'Live sensor streams',
  'Health risk patterns',
  'Readable public insights',
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(168,85,247,0.12),_transparent_24%),linear-gradient(180deg,_#f7fbff_0%,_#eef6fb_52%,_#ffffff_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:96px_96px] opacity-40" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-300/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/40 opacity-60" />
        <div className="absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/40 opacity-70" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[88rem] items-center gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.82fr)]">
        <div className="animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-sky-200 bg-white/85 px-4 py-2 text-[11px] font-medium tracking-[0.24em] text-sky-700 uppercase shadow-sm backdrop-blur-md">
            <Waves className="size-4 text-sky-500" />
            Air-aware health intelligence
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-sky-200 bg-gradient-to-br from-cyan-50 to-blue-100 text-sky-600 shadow-[0_18px_40px_rgba(56,189,248,0.16)] md:size-14">
              <Wind className="size-7 md:size-8" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700/75 md:text-sm">AirHealth</p>
              <h1 className="text-[2.8rem] font-black leading-[0.9] tracking-[-0.065em] text-slate-900 md:text-[4.3rem] xl:text-[4.8rem]">
                Monitor
                <span className="block bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  the invisible.
                </span>
              </h1>
            </div>
          </div>

          <div className="mb-5 max-w-[42rem] animate-fade-in" style={{ animationDelay: '0.14s' }}>
            <p className="mb-3 text-lg font-semibold leading-tight text-slate-900 md:text-[1.75rem] xl:text-[1.95rem]">
              Turning live environmental data into clear respiratory and public-health signals.
            </p>
            <p className="max-w-[38rem] text-sm leading-6 text-slate-600 md:text-[0.98rem]">
              AirHealth connects sensor streams, trend analytics, and human-readable indicators so people can understand
              what the air is doing now, what it might do next, and when conditions start becoming risky.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-2.5 animate-fade-in" style={{ animationDelay: '0.24s' }}>
            {featurePills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-slate-200 bg-white/90 px-3.5 py-1.5 text-[11px] font-medium text-slate-600 md:text-xs shadow-sm backdrop-blur-md"
              >
                {pill}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.34s' }}>
            <Button
              size="lg"
              className="group rounded-2xl border border-cyan-200/40 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 px-5 py-4 text-sm text-white shadow-[0_18px_50px_rgba(59,130,246,0.24)] hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(59,130,246,0.3)]"
            >
              <Activity className="size-4.5 transition-transform group-hover:scale-110" />
              View Live Dashboard
            </Button>
            <Button
              size="lg"
              className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 text-sm text-slate-700 shadow-sm backdrop-blur-xl hover:-translate-y-1 hover:bg-white"
            >
              <TrendingUp className="size-4.5 text-sky-600" />
              Explore API
            </Button>
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.18s' }}>
          <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(240,249,255,0.98))] p-4 shadow-[0_30px_80px_rgba(148,163,184,0.22)] backdrop-blur-2xl">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-700/60">Live overview</p>
                <h2 className="mt-1.5 text-lg font-bold tracking-[-0.03em] text-slate-900 md:text-[1.45rem]">Urban Air Snapshot</h2>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Sensors active
              </div>
            </div>

            <div className="mb-3 rounded-[1.2rem] border border-slate-200 bg-slate-50/90 p-3.5">
              <div className="mb-2.5 flex items-center justify-between text-sm text-slate-600">
                <span>Exposure score</span>
                <span className="font-semibold text-sky-600">Stable</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500" />
              </div>
              <div className="mt-2.5 flex justify-between text-[11px] text-slate-500">
                <span>Clean airflow</span>
                <span>Precaution threshold</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {signalMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between rounded-[1.1rem] border border-slate-200 bg-white/92 px-4 py-2.5 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{metric.label}</p>
                    <p className="text-xs text-slate-500">{metric.detail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold tracking-[-0.03em] text-slate-900 md:text-lg">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-[1.1rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 to-sky-50 p-3.5">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-700/70">Primary insight</p>
                <p className="mt-1.5 text-sm font-semibold text-slate-900 md:text-base">Cleaner data, calmer decisions.</p>
              </div>
              <div className="rounded-[1.1rem] border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-3.5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Response mode</p>
                <p className="mt-1.5 text-sm font-semibold text-slate-900 md:text-base">Readable alerts for ordinary users.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { left: '8%', top: '18%', delay: '0s', duration: '9s' },
          { left: '18%', top: '72%', delay: '1s', duration: '11s' },
          { left: '34%', top: '22%', delay: '2s', duration: '8s' },
          { left: '58%', top: '16%', delay: '0.5s', duration: '10s' },
          { left: '72%', top: '70%', delay: '1.5s', duration: '12s' },
          { left: '88%', top: '28%', delay: '2.2s', duration: '9.5s' },
        ].map((particle, index) => (
          <div
            key={index}
            className="absolute size-2 rounded-full bg-sky-400/20 animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>
    </section>
  );
}
