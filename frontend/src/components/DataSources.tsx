import { TrendingUp, Cloud, Gauge } from 'lucide-react';
import { Card } from './ui/card';

const dataSources = [
  {
    name: 'Google Trends API',
    icon: TrendingUp,
    description: 'Monitors search interest for health-related keywords in Thailand, such as headache, cough, difficulty breathing, and PM2.5',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    iconBg: 'from-green-500 to-emerald-500',
  },
  {
    name: 'IQAir / OpenAQ API',
    icon: Gauge,
    description: 'Provides official PM2.5 and AQI measurements from nearby monitoring stations for comparison and validation',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    iconBg: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'OpenMeteo API',
    icon: Cloud,
    description: 'Delivers additional weather information including forecasts and atmospheric conditions to support environmental interpretation',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    iconBg: 'from-indigo-500 to-purple-500',
  },
];

export function DataSources() {
  return (
    <div className="py-8 md:py-10 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 size-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 size-96 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-[72rem] mx-auto relative z-10">
        <div className="text-center mb-7 md:mb-8">
          <div className="inline-block mb-3">
            <span className="text-[11px] md:text-xs font-semibold tracking-wide text-green-600 bg-green-100 px-3 py-1.5 rounded-full">
              DATA INTEGRATION
            </span>
          </div>
          <h2 className="text-[1.7rem] md:text-[2.45rem] font-bold leading-[1.08] text-gray-900 mb-2.5">
            External Data <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Sources</span>
          </h2>
          <p className="text-[13px] md:text-sm leading-6 text-gray-600 max-w-3xl mx-auto">
            Enriching local sensor readings with trusted public datasets for validation, context, and deeper insights.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-3.5 md:gap-4 mb-8">
          {dataSources.map((source, index) => {
            const Icon = source.icon;
            return (
              <Card 
                key={index} 
                className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-white relative"
              >
                {/* Gradient header */}
                <div className={`h-24 md:h-28 bg-gradient-to-br ${source.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`p-3.5 bg-gradient-to-br ${source.iconBg} rounded-[1.4rem] shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="size-8 text-white" />
                    </div>
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute top-4 right-4 size-18 border-4 border-white/20 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 size-14 border-4 border-white/20 rounded-full"></div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-base md:text-[1.45rem] font-bold text-gray-900 mb-2.5 group-hover:text-gray-700 transition-colors">
                    {source.name}
                  </h3>
                  <p className="text-[13px] md:text-sm text-gray-600 leading-6">
                    {source.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center">
          <Card className="inline-block max-w-4xl p-4 md:p-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 border-0 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 size-32 bg-white rounded-full opacity-10"></div>
              <div className="absolute bottom-0 left-0 size-24 bg-white rounded-full opacity-10"></div>
            </div>
            <div className="relative z-10">
              <p className="text-white text-sm md:text-base font-bold mb-2">
                🎯 The Power of Integration
              </p>
              <p className="text-white/95 text-[13px] md:text-sm leading-6">
                By combining local sensor readings with wider public data, our system produces 
                <span className="font-bold text-yellow-300"> exponentially more meaningful insights </span>
                than either source could provide alone.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
