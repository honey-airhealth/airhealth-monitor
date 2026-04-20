import { Shield, LineChart, Zap, Brain, Clock, Map } from 'lucide-react';
import { Card } from './ui/card';

const features = [
  {
    icon: Shield,
    title: 'Real-Time Health Risk Indicators',
    description: 'Health risk scoring from the latest PM2.5, PM10, CO, temperature, humidity, and official PM2.5 context.',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
  },
  {
    icon: LineChart,
    title: 'Time-Series Visualizations',
    description: 'Compare PM2.5, PM10, CO, temperature, and humidity readings with available Google Trends health-keyword data.',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-50 to-indigo-50',
  },
  {
    icon: Zap,
    title: 'Short-Horizon Forecasts',
    description: 'Project PM2.5, temperature, and humidity over the next 6 to 12 hours using recent trends and weather context.',
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-50 to-orange-50',
  },
  {
    icon: Brain,
    title: 'Correlation Analysis',
    description: 'Explore relationships among PM2.5, PM10, CO, humidity, temperature, and health-related search signals.',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
  },
  {
    icon: Clock,
    title: 'Critical Period Detection',
    description: 'Identify the most concerning times of day for air quality in specific locations with hour-by-hour heatmaps.',
    gradient: 'from-red-500 to-rose-500',
    bgGradient: 'from-red-50 to-rose-50',
  },
  {
    icon: Map,
    title: 'Data Validation',
    description: 'Compare local PMS7003 readings with the official PM2.5 reference data stored by the backend.',
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-50 to-blue-50',
  },
];

export function Features() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_36%,#ffffff_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-64 w-64 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="absolute right-[6%] top-[10%] h-72 w-72 rounded-full bg-violet-100/55 blur-3xl" />
        <div className="absolute bottom-[4%] left-[24%] h-56 w-56 rounded-full bg-emerald-100/45 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:92px_92px] opacity-45" />
      </div>

      <div className="relative z-10 mx-auto max-w-[72rem]">
        <div className="mb-6 text-center md:mb-8">
          <div className="animate-fade-up mb-4 inline-flex items-center rounded-full border border-blue-200/80 bg-white/85 px-4 py-2 shadow-[0_14px_32px_rgba(96,165,250,0.14)] backdrop-blur-md">
            <span className="text-[11px] font-semibold tracking-[0.24em] text-blue-600 uppercase md:text-xs">
              FEATURES
            </span>
          </div>
          <h2 className="animate-fade-up mb-3 text-[1.7rem] font-black leading-[1.04] tracking-[-0.045em] text-slate-900 md:text-[2.45rem]" style={{ animationDelay: '0.08s' }}>
            Key Features &{' '}
            <span className="bg-[linear-gradient(90deg,#2563eb_0%,#4f46e5_48%,#9333ea_100%)] bg-clip-text text-transparent">
              Capabilities
            </span>
          </h2>
          <p className="animate-fade-up mx-auto max-w-3xl text-[13px] leading-6 text-slate-600 md:text-[0.96rem]" style={{ animationDelay: '0.14s' }}>
            Transform the project&apos;s sensor, weather, official PM2.5, and Google Trends data into practical monitoring views.
          </p>
        </div>

        <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="animate-fade-up group relative min-h-[216px] overflow-hidden border border-white/75 bg-white/82 p-4 shadow-[0_24px_60px_rgba(148,163,184,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_74px_rgba(96,165,250,0.16)]"
                style={{ animationDelay: `${0.08 + index * 0.07}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-[0.18] transition-opacity duration-300 group-hover:opacity-[0.28]`} />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/90 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${feature.gradient} opacity-[0.12] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.18]`} />

                <div className="relative z-10">
                  <div className="mb-3 flex items-center justify-between">
                    <div className={`inline-flex rounded-[1.15rem] bg-gradient-to-br ${feature.gradient} p-2.5 text-white shadow-[0_14px_28px_rgba(59,130,246,0.16)] transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="size-4.5" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mb-2.5 text-[1rem] font-bold leading-snug tracking-[-0.025em] text-slate-900 md:text-[1.08rem]">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] leading-6 text-slate-600 md:text-[0.94rem]">
                    {feature.description}
                  </p>
                </div>

                <div className="relative z-10 mt-auto pt-5">
                  <div className="h-px w-full bg-gradient-to-r from-slate-200/80 via-slate-100 to-transparent" />
                </div>

                <div className={`absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-gradient-to-br ${feature.gradient} opacity-[0.12] transition-all duration-300 group-hover:scale-110 group-hover:opacity-[0.2]`} />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
