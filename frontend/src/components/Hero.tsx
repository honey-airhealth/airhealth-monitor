import { Wind, Activity, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-16 px-4 md:px-5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 size-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-5 animate-fade-in">
            <div className="relative">
              <Wind className="size-12 md:size-14 text-cyan-400 animate-pulse" />
              <Sparkles className="size-5 text-yellow-300 absolute -top-2 -right-2 animate-ping" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AirHealth Monitor
            </h1>
          </div>
          
          <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-xl md:text-[1.7rem] font-semibold text-white mb-2.5">
              Turning Environmental Data into
            </p>
            <p className="text-xl md:text-[1.7rem] font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Meaningful Health Insights
            </p>
          </div>
          
          <p className="text-sm md:text-[15px] text-gray-300 max-w-3xl mx-auto mb-6 leading-7 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            A smart data acquisition and analytics system that explores how air quality influences everyday health conditions. 
            We transform sensor readings into <span className="text-cyan-300 font-semibold">understandable indicators</span>, 
            <span className="text-pink-300 font-semibold"> visual insights</span>, and 
            <span className="text-purple-300 font-semibold"> predictive information</span> that 
            ordinary users can easily interpret.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm px-4 py-2.5 shadow-2xl shadow-blue-500/50 transition-all hover:scale-105">
              <Activity className="size-4.5 mr-1.5" />
              View Live Dashboard
            </Button>
            <Button size="lg" className="bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white text-sm px-4 py-2.5 shadow-2xl transition-all hover:scale-105">
              <TrendingUp className="size-4.5 mr-1.5" />
              Explore API
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute size-2 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
