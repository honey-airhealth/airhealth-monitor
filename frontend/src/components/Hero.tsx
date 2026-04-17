import { useEffect, useState } from 'react';
import { Wind, Waves } from 'lucide-react';
import PageTabs from './PageTabs.jsx';

const featurePills = [
  'Live sensor streams',
  'Health risk patterns',
  'Readable public insights',
];

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000/api/v1/integration';

function aqiLabel(pm25: number | null): string {
  if (pm25 == null) return '—';
  if (pm25 < 12)   return 'Good';
  if (pm25 < 35.4) return 'Moderate';
  if (pm25 < 55.4) return 'Unhealthy for SG';
  if (pm25 < 150)  return 'Unhealthy';
  return 'Hazardous';
}

function trendLabel(dir: string | undefined): string {
  if (dir === 'improving') return '↓ Improving';
  if (dir === 'worsening') return '↑ Worsening';
  return '→ Stable';
}

export function Hero() {
  const [snap, setSnap] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/live-dashboard`)
      .then(r => r.json())
      .then(d => setSnap(d))
      .catch(() => {});
  }, []);

  const pm25      = snap?.snapshot?.pm2_5 ?? null;
  const riskScore = snap?.safety?.risk_score ?? null;
  const riskLevel = snap?.safety?.risk_level ?? 'safe';
  const trendDir  = snap?.trend?.direction;
  const rec       = snap?.safety?.recommendation ?? 'Cleaner data, calmer decisions.';
  const barWidth  = riskScore != null ? Math.min(Math.round(riskScore), 100) : 68;
  const trendWord = trendLabel(trendDir);

  const riskLevelColor: Record<string, string> = {
    safe:      'text-sky-600',
    moderate:  'text-amber-600',
    unhealthy: 'text-red-600',
  };

  const signalMetrics = [
    {
      label: 'Air Quality · PM2.5',
      value: pm25 != null ? `${pm25.toFixed(1)} µg/m³` : '—',
      detail: aqiLabel(pm25),
    },
    {
      label: 'Risk Score',
      value: riskScore != null ? `${riskScore.toFixed(0)}%` : '—',
      detail: riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1),
    },
    {
      label: 'Air Trend',
      value: trendWord,
      detail: snap?.trend?.summary?.slice(0, 48) ?? 'Trend model online',
    },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(168,85,247,0.16),_transparent_26%),radial-gradient(circle_at_50%_85%,_rgba(34,211,238,0.08),_transparent_34%),linear-gradient(180deg,_#f7fbff_0%,_#eef6fb_48%,_#ffffff_100%)]">
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

      <div className="relative z-10 mx-auto max-w-[1320px] px-4 pb-4 pt-9 sm:px-6 sm:pt-10 lg:px-6 lg:pb-5 lg:pt-12">
        <div className="mb-3 flex justify-end animate-fade-up">
          <div className="flex min-w-[460px] flex-col items-end gap-3">
            <PageTabs current="home" />
            <div className="animate-fade-up rounded-full border border-sky-200/70 bg-white/58 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-sky-700/90 shadow-[0_14px_30px_rgba(125,211,252,0.12)] backdrop-blur-md" style={{ animationDelay: '0.1s' }}>
              Air-aware health
            </div>
          </div>
        </div>

        <div className="flex items-start pt-2 pb-8 lg:pt-3">
          <div className="grid w-full items-center gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.82fr)]">
            <div className="animate-fade-right">
              <div className="mb-4 inline-flex animate-fade-up items-center gap-3 rounded-full border border-sky-200/80 bg-white/88 px-4 py-2 text-[11px] font-medium tracking-[0.24em] text-sky-700 uppercase shadow-[0_14px_30px_rgba(125,211,252,0.16)] backdrop-blur-md" style={{ animationDelay: '0.08s' }}>
                <Waves className="size-4 text-sky-500" />
                Air-aware health intelligence
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div className="animate-drift flex size-12 items-center justify-center rounded-[1.4rem] border border-sky-200/80 bg-gradient-to-br from-cyan-50 via-white to-blue-100 text-sky-600 shadow-[0_18px_40px_rgba(56,189,248,0.16)] md:size-14">
                  <Wind className="size-7 md:size-8" />
                </div>
                <div>
                  <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.35em] text-sky-700/75 md:text-sm" style={{ animationDelay: '0.12s' }}>AirHealth</p>
                  <h1 className="animate-fade-up text-[2.8rem] font-black leading-[0.86] tracking-[-0.07em] text-slate-900 md:text-[4.7rem] xl:text-[5.35rem]" style={{ animationDelay: '0.16s' }}>
                    Monitor
                    <span className="block bg-[linear-gradient(90deg,#15c9e8_0%,#1798eb_38%,#4f78ff_72%,#7c3aed_100%)] bg-clip-text text-transparent drop-shadow-[0_10px_35px_rgba(96,165,250,0.2)]">
                      the invisible.
                    </span>
                  </h1>
                </div>
              </div>

              <div className="mb-5 max-w-[42rem] animate-fade-up" style={{ animationDelay: '0.24s' }}>
                <p className="mb-3 max-w-[44rem] text-lg font-semibold leading-tight text-slate-900 md:text-[1.95rem] xl:text-[2.2rem]">
                  Turning live environmental data into clear respiratory and public-health signals.
                </p>
                <p className="max-w-[39rem] text-sm leading-7 text-slate-600 md:text-[1.02rem]">
                  AirHealth connects sensor streams, trend analytics, and human-readable indicators so people can understand
                  what the air is doing now, what it might do next, and when conditions start becoming risky.
                </p>
              </div>

              <div className="mb-5 flex flex-wrap gap-2.5" style={{ animationDelay: '0.24s' }}>
                {featurePills.map((pill, index) => (
                  <span
                    key={pill}
                    className="animate-fade-up rounded-full border border-slate-200 bg-white/90 px-3.5 py-1.5 text-[11px] font-medium text-slate-600 md:text-xs shadow-sm backdrop-blur-md"
                    style={{ animationDelay: `${0.3 + index * 0.06}s` }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="animate-fade-left" style={{ animationDelay: '0.16s' }}>
              <div className="relative overflow-hidden rounded-[1.85rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,251,255,0.98))] p-4 shadow-[0_35px_100px_rgba(148,163,184,0.24)] backdrop-blur-2xl">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
                <div className="animate-glow-pulse absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.24),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(103,232,249,0.18),transparent_22%)]" />

                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-sky-700/60">Live overview</p>
                    <h2 className="mt-1.5 text-lg font-bold tracking-[-0.03em] text-slate-900 md:text-[1.45rem]">Urban Air Snapshot</h2>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${snap ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                    {snap ? 'Sensors active' : 'Connecting…'}
                  </div>
                </div>

                {/* Exposure bar */}
                <div className="mb-3 rounded-[1.25rem] border border-slate-200/90 bg-white/72 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <div className="mb-2.5 flex items-center justify-between text-sm text-slate-600">
                    <span>Risk score</span>
                    <span className={`font-semibold ${riskLevelColor[riskLevel] ?? 'text-sky-600'}`}>
                      {riskScore != null ? `${riskScore.toFixed(0)} / 100` : 'Loading…'}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#19d39d_0%,#1dd1c8_35%,#1fa7eb_68%,#3482f6_100%)] shadow-[0_0_22px_rgba(34,211,238,0.35)] transition-all duration-700"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="mt-2.5 flex justify-between text-[11px] text-slate-500">
                    <span>Safe</span>
                    <span>Unhealthy threshold</span>
                  </div>
                </div>

                {/* Live metrics */}
                <div className="relative space-y-2.5">
                  {signalMetrics.map((metric, index) => (
                    <div
                      key={metric.label}
                      className="animate-fade-up flex items-center justify-between rounded-[1.15rem] border border-slate-200/90 bg-white/88 px-4 py-3 shadow-[0_8px_24px_rgba(148,163,184,0.09)]"
                      style={{ animationDelay: `${0.34 + index * 0.08}s` }}
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

                {/* Bottom cards */}
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-cyan-100/90 bg-[linear-gradient(135deg,rgba(236,254,255,0.95),rgba(240,249,255,0.9))] p-3.5 shadow-[0_10px_28px_rgba(125,211,252,0.08)]">
                    <p className="text-xs uppercase tracking-[0.2em] text-sky-700/70">Recommendation</p>
                    <p className="mt-1.5 text-sm font-semibold text-slate-900 md:text-base line-clamp-2">{rec}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-violet-100/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,243,255,0.9))] p-3.5 shadow-[0_10px_28px_rgba(196,181,253,0.08)]">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk level</p>
                    <p className={`mt-1.5 text-base font-bold capitalize ${riskLevelColor[riskLevel] ?? 'text-slate-900'}`}>{riskLevel}</p>
                    <p className="text-xs text-slate-500 mt-0.5">from live sensor data</p>
                  </div>
                </div>
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
            style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, animationDuration: particle.duration }}
          />
        ))}
      </div>
    </section>
  );
}
