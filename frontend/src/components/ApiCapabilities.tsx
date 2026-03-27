import { Activity, BarChart3, Thermometer, Clock, Scale, TrendingUp, Target, LineChart, Map, LayoutDashboard, GitMerge, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

const capabilities = [
  {
    icon: Activity,
    question: 'What is the current health risk score?',
    answer: 'Based on live PM2.5, CO, smoke, temperature, humidity, and official AQI data',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: TrendingUp,
    question: 'How do environmental spikes relate to illness trends?',
    answer: 'Compare PM2.5 and CO levels with illness-related search trends over the past 7 days',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Thermometer,
    question: 'What is the predicted discomfort index?',
    answer: 'Calculated from current environmental conditions and historical patterns',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: Clock,
    question: 'When does air quality become most concerning?',
    answer: 'Identify critical time periods throughout the day for specific locations',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Scale,
    question: 'How do local readings compare to official reports?',
    answer: 'Validate sensor data against nearby government monitoring stations',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    question: 'What are the long-term trends?',
    answer: 'Monitor changes over time with comprehensive trend analysis dashboards',
    color: 'from-indigo-500 to-purple-500',
  },
];

const outputs = [
  {
    name: 'Health Risk Indicators',
    desc: 'Live risk scores updated every minute from PM2.5, CO & AQI sensors.',
    Icon: Target,
    iconBg: 'from-rose-500 to-pink-600',
    iconShadow: 'rgba(244,63,94,0.3)',
    tag: 'Real-time',
    tagColor: 'bg-rose-50 text-rose-600 border-rose-200',
  },
  {
    name: 'Time-Series Charts',
    desc: 'Interactive charts showing every sensor reading across time.',
    Icon: LineChart,
    iconBg: 'from-sky-500 to-blue-600',
    iconShadow: 'rgba(59,130,246,0.3)',
    tag: 'Interactive',
    tagColor: 'bg-sky-50 text-sky-600 border-sky-200',
  },
  {
    name: 'Hourly Heatmaps',
    desc: 'Spot pollution hotspots visualized by hour and day of week.',
    Icon: Map,
    iconBg: 'from-amber-400 to-orange-500',
    iconShadow: 'rgba(245,158,11,0.3)',
    tag: 'Spatial',
    tagColor: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    name: 'Trend Dashboards',
    desc: 'Long-term monitoring panels for sustained environmental trends.',
    Icon: LayoutDashboard,
    iconBg: 'from-violet-500 to-purple-600',
    iconShadow: 'rgba(139,92,246,0.3)',
    tag: 'Analytics',
    tagColor: 'bg-violet-50 text-violet-600 border-violet-200',
  },
  {
    name: 'Correlation Graphs',
    desc: 'Link pollutant spikes directly to illness-related search signals.',
    Icon: GitMerge,
    iconBg: 'from-teal-500 to-emerald-500',
    iconShadow: 'rgba(20,184,166,0.3)',
    tag: 'Insights',
    tagColor: 'bg-teal-50 text-teal-600 border-teal-200',
  },
  {
    name: 'Predictive Summaries',
    desc: 'AI-generated forecasts and plain-language health recommendations.',
    Icon: Sparkles,
    iconBg: 'from-indigo-500 to-blue-700',
    iconShadow: 'rgba(99,102,241,0.3)',
    tag: 'AI-powered',
    tagColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
];

export function ApiCapabilities() {
  return (
    <div className="py-10 md:py-12 px-4 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 size-full opacity-5">
        <div className="absolute top-10 left-10 size-40 border-8 border-blue-500 rounded-lg rotate-12"></div>
        <div className="absolute bottom-10 right-10 size-40 border-8 border-purple-500 rounded-lg -rotate-12"></div>
      </div>
      
      <div className="max-w-[68rem] mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-9">
          <div className="inline-block mb-3">
            <span className="inline-flex items-center rounded-full border border-indigo-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(238,242,255,0.92))] px-4 py-2 shadow-[0_12px_28px_rgba(99,102,241,0.12)]">
              <span className="bg-[linear-gradient(90deg,#4338ca_0%,#4f46e5_40%,#7c3aed_100%)] bg-clip-text text-[11px] font-bold tracking-[0.2em] text-transparent uppercase md:text-xs">
                API CAPABILITIES
              </span>
            </span>
          </div>
          <h2 className="text-[1.7rem] md:text-[2.45rem] font-bold leading-[1.08] text-gray-900 mb-2.5">
            Intelligent <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Insights</span>
          </h2>
          <p className="text-[13px] md:text-sm leading-6 text-gray-600 max-w-2xl mx-auto">
            Our API doesn't just deliver raw data — it generates useful interpretations and answers practical health-related questions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-3.5 md:gap-4 mb-8">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <Card 
                key={index} 
                className="group p-4 md:p-5 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white relative overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${capability.color}`}></div>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${capability.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 p-3 bg-gradient-to-br ${capability.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[15px] md:text-base font-bold text-gray-900 mb-2 group-hover:text-gray-700">
                      {capability.question}
                    </h3>
                    <p className="text-[13px] md:text-sm text-gray-600 leading-6">
                      {capability.answer}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        {/* Output Formats — Blue Glass */}
        <div className="relative rounded-3xl overflow-hidden p-[2px]"
          style={{ background: 'linear-gradient(135deg, rgba(99,179,237,0.6) 0%, rgba(59,130,246,0.8) 40%, rgba(109,40,217,0.6) 100%)' }}>

          {/* gradient border glow */}
          <div className="absolute inset-0 rounded-3xl blur-xl opacity-50 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6, #6d28d9)' }} />

          <div className="relative rounded-[22px] overflow-hidden p-7 md:p-10"
            style={{ background: 'linear-gradient(135deg, #0f2b5b 0%, #0c1e4a 40%, #0e1a3d 70%, #1a0a3d 100%)' }}>

            {/* ambient light blobs */}
            <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full blur-[110px]"
              style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.25), transparent 70%)' }} />
            <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full blur-[110px]"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)' }} />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full blur-[80px]"
              style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08), transparent 70%)' }} />

            {/* dot grid texture */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

            {/* Header */}
            <div className="relative text-center mb-8">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 border border-white/20 backdrop-blur-md"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className="size-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_3px_rgba(125,211,252,0.8)]" />
                <span className="text-[10px] font-bold tracking-[0.22em] text-sky-200 uppercase">Output Formats</span>
              </span>
              <h3 className="text-[1.6rem] md:text-[2.1rem] font-bold leading-tight text-white">
                Data delivered{' '}
                <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                  beautifully
                </span>
              </h3>
              <p className="mt-2.5 text-[13px] md:text-sm text-white/50 max-w-lg mx-auto leading-6">
                Six formats crafted for clarity — from real-time dashboards to AI-driven forecasts.
              </p>
            </div>

            {/* Glass cards grid */}
            <div className="relative grid sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {outputs.map((output, index) => {
                const { Icon } = output;
                return (
                  <div
                    key={index}
                    className="group relative flex flex-col rounded-2xl border border-white/10 p-5 cursor-default
                      transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)' }}
                  >
                    {/* hover inner glow */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                      style={{ background: 'radial-gradient(ellipse at top left, rgba(147,210,255,0.09), transparent 65%)' }} />

                    {/* shimmer top border */}
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                    {/* icon + tag */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`inline-flex items-center justify-center size-11 rounded-xl bg-gradient-to-br ${output.iconBg} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                        style={{ boxShadow: `0 6px 20px ${output.iconShadow}` }}
                      >
                        <Icon className="size-5 text-white" />
                      </div>
                      <span className="text-[10px] font-semibold rounded-full px-2.5 py-1 border border-white/15 text-white/50"
                        style={{ background: 'rgba(255,255,255,0.07)' }}>
                        {output.tag}
                      </span>
                    </div>

                    {/* text */}
                    <h4 className="font-bold text-white text-[15px] leading-snug mb-1.5">
                      {output.name}
                    </h4>
                    <p className="text-white/45 text-[12px] leading-relaxed flex-1">
                      {output.desc}
                    </p>

                    {/* bottom accent */}
                    <div className={`mt-4 h-[1.5px] rounded-full bg-gradient-to-r ${output.iconBg} opacity-30 group-hover:opacity-70 transition-opacity duration-300`} />
                  </div>
                );
              })}
            </div>

            {/* footer */}
            <p className="relative text-center text-white/25 mt-6 text-[11px] tracking-wide">
              Designed for everyone — from casual users to production data pipelines
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
