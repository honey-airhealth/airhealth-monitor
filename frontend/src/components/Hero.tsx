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
  const openApiDashboard = () => {
    window.location.hash = '#/api';
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(168,85,247,0.16),_transparent_26%),radial-gradient(circle_at_50%_85%,_rgba(34,211,238,0.08),_transparent_34%),linear-gradient(180deg,_#f7fbff_0%,_#eef6fb_48%,_#ffffff_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.045)_1px,transparent_1px)] bg-[size:96px_96px] opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_56%,rgba(255,255,255,0.72)_100%)]" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-300/24 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-300/18 blur-3xl" />
        <div className="absolute left-[10%] top-[28%] h-3 w-3 rounded-full bg-sky-300/55 shadow-[0_0_30px_rgba(125,211,252,0.95)]" />
        <div className="absolute left-[34%] top-[62%] h-3.5 w-3.5 rounded-full bg-cyan-300/45 shadow-[0_0_26px_rgba(103,232,249,0.8)]" />
        <div className="absolute right-[16%] top-[22%] h-4 w-4 rounded-full bg-violet-300/40 shadow-[0_0_34px_rgba(196,181,253,0.8)]" />
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/28 opacity-60" />
        <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/36 opacity-70" />
        <div className="absolute left-1/2 top-1/2 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/26 opacity-55" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[88rem] items-center gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.82fr)]">
        <div className="animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-sky-200/80 bg-white/88 px-4 py-2 text-[11px] font-medium tracking-[0.24em] text-sky-700 uppercase shadow-[0_14px_30px_rgba(125,211,252,0.16)] backdrop-blur-md">
            <Waves className="size-4 text-sky-500" />
            Air-aware health intelligence
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-[1.4rem] border border-sky-200/80 bg-gradient-to-br from-cyan-50 via-white to-blue-100 text-sky-600 shadow-[0_18px_40px_rgba(56,189,248,0.16)] md:size-14">
              <Wind className="size-7 md:size-8" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700/75 md:text-sm">AirHealth</p>
              <h1 className="text-[2.8rem] font-black leading-[0.86] tracking-[-0.07em] text-slate-900 md:text-[4.7rem] xl:text-[5.35rem]">
                Monitor
                <span className="block bg-[linear-gradient(90deg,#15c9e8_0%,#1798eb_38%,#4f78ff_72%,#7c3aed_100%)] bg-clip-text text-transparent drop-shadow-[0_10px_35px_rgba(96,165,250,0.2)]">
                  the invisible.
                </span>
              </h1>
            </div>
          </div>

          <div className="mb-5 max-w-[42rem] animate-fade-in" style={{ animationDelay: '0.14s' }}>
            <p className="mb-3 max-w-[44rem] text-lg font-semibold leading-tight text-slate-900 md:text-[1.95rem] xl:text-[2.2rem]">
              Turning live environmental data into clear respiratory and public-health signals.
            </p>
            <p className="max-w-[39rem] text-sm leading-7 text-slate-600 md:text-[1.02rem]">
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
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="group h-14 min-w-[17rem] justify-start overflow-hidden rounded-[1.55rem] border-0 bg-[linear-gradient(90deg,#1dc7e8_0%,#19afe8_38%,#2393ee_70%,#3b82f6_100%)] px-5 text-[1.02rem] text-white shadow-[0_18px_50px_rgba(59,130,246,0.24)] hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(59,130,246,0.3)]"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <Activity className="size-5 transition-transform group-hover:scale-110" />
              </span>
              <span className="pr-2 font-semibold">View Live Dashboard</span>
            </Button>
            <Button
              size="lg"
              className="h-14 min-w-[14rem] justify-start rounded-[1.55rem] border border-slate-200 bg-white/90 px-5 text-[1.02rem] text-slate-700 shadow-sm backdrop-blur-xl hover:-translate-y-1 hover:bg-white"
              onClick={openApiDashboard}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-sky-50 ring-1 ring-sky-100">
                <TrendingUp className="size-5 text-sky-600" />
              </span>
              <span className="pr-2 font-semibold">Explore API</span>
            </Button>
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.18s' }}>
          <div className="relative overflow-hidden rounded-[1.85rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,251,255,0.98))] p-4 shadow-[0_35px_100px_rgba(148,163,184,0.24)] backdrop-blur-2xl">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.24),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(103,232,249,0.18),transparent_22%)]" />
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-700/60">Live overview</p>
                <h2 className="mt-1.5 text-lg font-bold tracking-[-0.03em] text-slate-900 md:text-[1.45rem]">Urban Air Snapshot</h2>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Sensors active
              </div>
            </div>

            <div className="mb-3 rounded-[1.25rem] border border-slate-200/90 bg-white/72 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="mb-2.5 flex items-center justify-between text-sm text-slate-600">
                <span>Exposure score</span>
                <span className="font-semibold text-sky-600">Stable</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
                <div className="h-full w-[68%] rounded-full bg-[linear-gradient(90deg,#19d39d_0%,#1dd1c8_35%,#1fa7eb_68%,#3482f6_100%)] shadow-[0_0_22px_rgba(34,211,238,0.35)]" />
              </div>
              <div className="mt-2.5 flex justify-between text-[11px] text-slate-500">
                <span>Clean airflow</span>
                <span>Precaution threshold</span>
              </div>
            </div>

            <div className="relative space-y-2.5">
              {signalMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between rounded-[1.15rem] border border-slate-200/90 bg-white/88 px-4 py-3 shadow-[0_8px_24px_rgba(148,163,184,0.09)]"
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
              <div className="rounded-[1.2rem] border border-cyan-100/90 bg-[linear-gradient(135deg,rgba(236,254,255,0.95),rgba(240,249,255,0.9))] p-3.5 shadow-[0_10px_28px_rgba(125,211,252,0.08)]">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-700/70">Primary insight</p>
                <p className="mt-1.5 text-sm font-semibold text-slate-900 md:text-base">Cleaner data, calmer decisions.</p>
              </div>
              <div className="rounded-[1.2rem] border border-violet-100/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,243,255,0.9))] p-3.5 shadow-[0_10px_28px_rgba(196,181,253,0.08)]">
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
