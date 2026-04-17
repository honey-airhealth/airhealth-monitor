import { Cpu, Thermometer, Flame, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

const sensors = [
  {
    code: 'PMS7003',
    name: 'PM2.5 Dust Sensor',
    icon: AlertTriangle,
    description: 'Measures fine particulate matter (PM2.5) concentration in the air',
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-50 to-red-50',
    iconColor: 'text-orange-500',
    badgeColor: 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0',
  },
  {
    code: 'KY-015',
    name: 'Temperature & Humidity Sensor',
    icon: Thermometer,
    description: 'Measures ambient temperature and relative humidity levels',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    iconColor: 'text-blue-500',
    badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0',
  },
  {
    code: 'MQ-2',
    name: 'Smoke & Gas Sensor',
    icon: Flame,
    description: 'Detects smoke, LPG, and combustible gases for air quality events',
    gradient: 'from-red-500 to-pink-500',
    bgGradient: 'from-red-50 to-pink-50',
    iconColor: 'text-red-500',
    badgeColor: 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-0',
  },
  {
    code: 'MQ-9',
    name: 'Carbon Monoxide (CO) Sensor',
    icon: Cpu,
    description: 'Detects toxic carbon monoxide from vehicle exhaust and combustion',
    gradient: 'from-purple-500 to-indigo-500',
    bgGradient: 'from-purple-50 to-indigo-50',
    iconColor: 'text-purple-500',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0',
  },
];

export function Sensors() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fafbff_38%,#ffffff_100%)] px-4 py-10 md:px-6 md:py-12">
      <div className="absolute inset-0">
        <div className="absolute left-[6%] top-16 h-72 w-72 rounded-full border-[3px] border-blue-100/80 opacity-60" />
        <div className="absolute bottom-10 right-[6%] h-72 w-72 rounded-full border-[3px] border-purple-100/80 opacity-60" />
        <div className="absolute left-[20%] top-[34%] h-56 w-56 rounded-full bg-cyan-100/30 blur-3xl" />
        <div className="absolute right-[18%] top-[52%] h-56 w-56 rounded-full bg-pink-100/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[68rem]">
        <div className="mb-8 text-center md:mb-9">
          <div className="animate-fade-up mb-3 inline-flex items-center rounded-full border border-purple-200/80 bg-white/88 px-4 py-2 shadow-[0_14px_30px_rgba(168,85,247,0.12)] backdrop-blur-md">
            <span className="text-[11px] font-semibold tracking-[0.24em] text-purple-600 uppercase md:text-xs">
              HARDWARE
            </span>
          </div>
          <h2 className="animate-fade-up mb-2.5 text-[1.7rem] font-black leading-[1.08] tracking-[-0.045em] text-slate-900 md:text-[2.45rem]" style={{ animationDelay: '0.08s' }}>
            Sensor{' '}
            <span className="bg-[linear-gradient(90deg,#7c3aed_0%,#a855f7_42%,#ec4899_100%)] bg-clip-text text-transparent">
              Technology
            </span>
          </h2>
          <p className="animate-fade-up mx-auto max-w-2xl text-[13px] leading-6 text-slate-600 md:text-sm" style={{ animationDelay: '0.14s' }}>
            Real-time environmental data collected from multiple sensor modules for comprehensive air quality monitoring.
          </p>
        </div>

        <div className="mb-7 grid gap-3.5 md:grid-cols-2 md:gap-4">
          {sensors.map((sensor, index) => {
            const Icon = sensor.icon;
            return (
              <Card
                key={index}
                className="animate-fade-up group relative overflow-hidden border border-white/80 bg-white/88 p-4 shadow-[0_22px_58px_rgba(148,163,184,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_74px_rgba(99,102,241,0.16)] md:p-5"
                style={{ animationDelay: `${0.08 + index * 0.07}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${sensor.bgGradient} opacity-[0.28] transition-opacity duration-300 group-hover:opacity-[0.42]`} />
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${sensor.gradient} opacity-[0.12] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.18]`} />

                <div className="relative z-10 flex items-start gap-4">
                  <div className={`flex shrink-0 items-center justify-center rounded-[1.35rem] bg-gradient-to-br ${sensor.gradient} p-3 shadow-[0_16px_34px_rgba(59,130,246,0.18)] transition-transform duration-300 group-hover:scale-105`}>
                    <Icon className="size-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold tracking-[-0.03em] text-slate-900 md:text-lg">
                        {sensor.name}
                      </h3>
                      <Badge className={`${sensor.badgeColor} rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] shadow-[0_10px_22px_rgba(99,102,241,0.16)]`}>
                        {sensor.code}
                      </Badge>
                    </div>
                    <p className="text-[13px] leading-6 text-slate-600 md:text-sm">
                      {sensor.description}
                    </p>
                    <div className="mt-4 h-px w-full bg-gradient-to-r from-slate-200/80 via-slate-100 to-transparent" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Card className="animate-fade-up relative inline-block overflow-hidden border-0 bg-[linear-gradient(90deg,#4f46e5_0%,#7c3aed_36%,#c026d3_68%,#db2777_100%)] p-4 shadow-[0_28px_70px_rgba(124,58,237,0.26)] md:p-5" style={{ animationDelay: '0.24s' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.08))]" />
            <div className="relative z-10">
              <p className="mb-2 text-sm font-semibold text-white md:text-base">
                ⏱️ Automatic Timestamp Logging
              </p>
              <p className="max-w-2xl text-[13px] text-white/92 md:text-sm">
                All sensor readings are recorded with precise date and time information for accurate time-series analysis
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
