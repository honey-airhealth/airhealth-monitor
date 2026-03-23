import { Shield, LineChart, Zap, Brain, Clock, Map } from 'lucide-react';
import { Card } from './ui/card';

const features = [
  {
    icon: Shield,
    title: 'Real-Time Health Risk Indicators',
    description: 'Continuous monitoring of environmental conditions with instant health risk assessment based on PM2.5, CO, smoke, temperature, and humidity levels.',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
  },
  {
    icon: LineChart,
    title: 'Time-Series Visualizations',
    description: 'Compare PM2.5 and CO readings with health-related search interest over time to reveal hidden patterns and correlations.',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-50 to-indigo-50',
  },
  {
    icon: Zap,
    title: 'Predictive Analytics',
    description: 'Estimate discomfort levels and potential health concerns using machine learning algorithms and historical data patterns.',
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-50 to-orange-50',
  },
  {
    icon: Brain,
    title: 'Correlation Analysis',
    description: 'Discover relationships among PM2.5, CO, smoke, humidity, temperature, and illness-related signals through advanced analytics.',
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
    description: 'Cross-reference local sensor readings with official air quality reports from IQAir and OpenAQ for accuracy and reliability.',
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-50 to-blue-50',
  },
];

export function Features() {
  return (
    <section className="min-h-screen py-6 md:py-8 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden flex items-center">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 size-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full filter blur-3xl opacity-30"></div>
      
      <div className="max-w-[68rem] mx-auto relative z-10">
        <div className="text-center mb-5 md:mb-6">
          <div className="inline-block mb-3">
            <span className="text-[11px] md:text-xs font-semibold tracking-wide text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full">
              FEATURES
            </span>
          </div>
          <h2 className="text-[1.7rem] md:text-[2.45rem] font-bold leading-[1.08] text-gray-900 mb-2.5">
            Key Features & <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Capabilities</span>
          </h2>
          <p className="text-[13px] md:text-sm leading-6 text-gray-600 max-w-2xl mx-auto">
            Transform raw environmental data into actionable health insights with our comprehensive monitoring and analytics platform.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group min-h-[220px] p-4 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className={`inline-flex p-2.5 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="size-4.5 text-white" />
                  </div>
                  <h3 className="text-[15px] md:text-base font-bold text-gray-900 mb-2 group-hover:text-gray-800 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] md:text-sm text-gray-600 leading-6">
                    {feature.description}
                  </p>
                </div>
                
                {/* Decorative corner */}
                <div className={`absolute -bottom-8 -right-8 size-24 bg-gradient-to-br ${feature.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
