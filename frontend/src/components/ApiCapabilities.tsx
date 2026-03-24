import { Activity, BarChart3, Thermometer, Clock, Scale, TrendingUp } from 'lucide-react';
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
  { name: 'Real-time health risk indicators', icon: '🎯' },
  { name: 'Time-series visualizations', icon: '📊' },
  { name: 'Heatmaps by hour and day', icon: '🗺️' },
  { name: 'Trend analysis dashboards', icon: '📈' },
  { name: 'Correlation graphs', icon: '🔗' },
  { name: 'Predictive summaries', icon: '🔮' },
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
        
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 size-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-10 left-10 size-64 bg-pink-500 rounded-full filter blur-3xl opacity-20"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-lg md:text-[2rem] font-bold text-white mb-3 text-center">
              📊 Output Formats
            </h3>
            <p className="text-center text-white/80 text-[13px] md:text-sm mb-5 max-w-2xl mx-auto">
              Multiple visualization and analysis formats to make data accessible for everyone
            </p>
            
            <div className="grid md:grid-cols-3 gap-3.5">
              {outputs.map((output, index) => (
                <div
                  key={index} 
                  className="group bg-white/10 backdrop-blur-sm p-3.5 md:p-4 rounded-2xl border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-xl md:text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {output.icon}
                  </div>
                  <span className="text-white font-semibold text-[13px] md:text-sm">{output.name}</span>
                </div>
              ))}
            </div>
            
            <p className="text-center text-white/90 mt-5 text-[13px] md:text-base font-medium">
              ✨ These outputs make the system informative for both casual users and future data-driven applications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
