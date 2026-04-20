import { TrendingUp, Cloud, Gauge } from 'lucide-react';
import { Card } from './ui/card';

const dataSources = [
  {
    name: 'Google Trends',
    icon: TrendingUp,
    sourceType: 'Search signals',
    href: 'https://trends.google.com/trends/',
    description: 'Stores health-related keyword interest used by the statistic and correlation visualizations',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    iconBg: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Official PM2.5 Reference',
    icon: Gauge,
    sourceType: 'Official measurements',
    href: 'https://openaq.org/',
    description: 'Provides official PM2.5 measurements for comparison with local PMS7003 readings',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    iconBg: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Open-Meteo',
    icon: Cloud,
    sourceType: 'Weather context',
    href: 'https://open-meteo.com/',
    description: 'Adds weather context such as rain, wind, temperature, humidity, and weather condition codes',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    iconBg: 'from-indigo-500 to-purple-500',
  },
];

export function DataSources() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_46%,#f8fafc_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="absolute inset-0">
        <div className="absolute left-[18%] top-[18%] h-80 w-80 rounded-full bg-gradient-to-br from-blue-200/30 to-violet-200/30 blur-3xl" />
        <div className="absolute bottom-[10%] right-[14%] h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-200/26 to-orange-200/26 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:96px_96px] opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-[72rem]">
        <div className="mb-7 text-center md:mb-8">
          <div className="animate-fade-up mb-3 inline-flex items-center rounded-full border border-green-200/80 bg-white/88 px-4 py-2 shadow-[0_14px_30px_rgba(34,197,94,0.12)] backdrop-blur-md">
            <span className="text-[11px] font-semibold tracking-[0.24em] text-green-600 uppercase md:text-xs">
              DATA INTEGRATION
            </span>
          </div>
          <h2 className="animate-fade-up mb-2.5 text-[1.7rem] font-black leading-[1.08] tracking-[-0.045em] text-slate-900 md:text-[2.45rem]" style={{ animationDelay: '0.08s' }}>
            External Data{' '}
            <span className="bg-[linear-gradient(90deg,#16a34a_0%,#0ea5e9_100%)] bg-clip-text text-transparent">
              Sources
            </span>
          </h2>
          <p className="animate-fade-up mx-auto max-w-3xl text-[13px] leading-6 text-slate-600 md:text-sm" style={{ animationDelay: '0.14s' }}>
            Enriching local sensor readings with the external datasets currently represented in the backend.
          </p>
        </div>

        <div className="mb-8 grid gap-3.5 md:grid-cols-3 md:gap-4">
          {dataSources.map((source, index) => {
            const Icon = source.icon;
            return (
              <a
                key={index}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Card className="animate-fade-up group relative overflow-hidden border border-white/80 bg-white/92 shadow-[0_22px_58px_rgba(148,163,184,0.14)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_74px_rgba(99,102,241,0.16)]" style={{ animationDelay: `${0.08 + index * 0.08}s` }}>
                  <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${source.gradient} md:h-28`}>
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(0,0,0,0.08))]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`relative rounded-[1.4rem] bg-gradient-to-br ${source.iconBg} p-3.5 shadow-[0_20px_38px_rgba(15,23,42,0.16)] transition-transform duration-500 group-hover:scale-110`}>
                        <div className="absolute inset-0 rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent)]" />
                        <Icon className="relative size-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute left-4 top-4 h-14 w-14 rounded-full border-[4px] border-white/20" />
                    <div className="absolute right-4 top-4 h-18 w-18 rounded-full border-[4px] border-white/20" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-white/50" />
                  </div>

                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        {source.sourceType}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mb-2.5 text-base font-black tracking-[-0.03em] text-slate-900 transition-colors group-hover:text-slate-800 md:text-[1.35rem]">
                      {source.name}
                    </h3>
                    <p className="text-[13px] leading-6 text-slate-600 md:text-sm">
                      {source.description}
                    </p>
                    <div className="mt-4 h-px w-full bg-gradient-to-r from-slate-200/80 via-slate-100 to-transparent" />
                  </div>
                </Card>
              </a>
            );
          })}
        </div>

        <div className="text-center">
          <Card className="animate-fade-up relative inline-block max-w-4xl overflow-hidden border-0 bg-[linear-gradient(90deg,#06b6d4_0%,#2563eb_48%,#6366f1_100%)] p-4 shadow-[0_28px_72px_rgba(37,99,235,0.22)] md:p-5" style={{ animationDelay: '0.26s' }}>
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.08))]" />
              <div className="absolute top-0 right-0 size-32 rounded-full bg-white opacity-10"></div>
              <div className="absolute left-8 top-1/2 h-px w-28 -translate-y-1/2 bg-gradient-to-r from-white/0 via-white/28 to-white/0"></div>
            </div>
            <div className="relative z-10 text-left">
                <p className="mb-2 text-sm font-bold text-white md:text-base">
                  The Power of Integration
                </p>
                <p className="text-[13px] leading-6 text-white/95 md:text-sm">
                  Local sensor readings are combined with weather, official PM2.5, and Google Trends records
                  <span className="font-bold text-yellow-300"> to provide clearer context </span>
                  for dashboards, statistics, validation, and forecasts.
                </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
