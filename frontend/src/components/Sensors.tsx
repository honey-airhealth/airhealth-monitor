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
    <div className="py-10 md:py-12 px-4 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 size-64 border-4 border-blue-500 rounded-full"></div>
        <div className="absolute bottom-20 right-20 size-64 border-4 border-purple-500 rounded-full"></div>
      </div>
      
      <div className="max-w-[68rem] mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-9">
          <div className="inline-block mb-3">
            <span className="text-[11px] md:text-xs font-semibold tracking-wide text-purple-600 bg-purple-100 px-3 py-1.5 rounded-full">
              HARDWARE
            </span>
          </div>
          <h2 className="text-[1.7rem] md:text-[2.45rem] font-bold leading-[1.08] text-gray-900 mb-2.5">
            Sensor <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Technology</span>
          </h2>
          <p className="text-[13px] md:text-sm leading-6 text-gray-600 max-w-2xl mx-auto">
            Real-time environmental data collected from multiple sensor modules for comprehensive air quality monitoring.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-3.5 md:gap-4 mb-7">
          {sensors.map((sensor, index) => {
            const Icon = sensor.icon;
            return (
              <Card 
                key={index} 
                className="group p-4 md:p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-xl bg-white overflow-hidden relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${sensor.bgGradient} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                
                <div className="relative z-10 flex items-start gap-4">
                  <div className={`flex-shrink-0 p-3 bg-gradient-to-br ${sensor.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="size-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                      <h3 className="text-base md:text-lg font-bold text-gray-900">
                        {sensor.name}
                      </h3>
                      <Badge className={`${sensor.badgeColor} px-2 py-1 text-[10px] font-semibold`}>
                        {sensor.code}
                      </Badge>
                    </div>
                    <p className="text-[13px] md:text-sm text-gray-600 leading-6">
                      {sensor.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center">
          <Card className="inline-block p-4 md:p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-0 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <p className="text-white text-sm md:text-base font-semibold mb-2">
                ⏱️ Automatic Timestamp Logging
              </p>
              <p className="text-white/90 text-[13px] md:text-sm max-w-2xl">
                All sensor readings are recorded with precise date and time information for accurate time-series analysis
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
