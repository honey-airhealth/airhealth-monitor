import { Wind, Github, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 py-8 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 size-64 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 size-64 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-3 gap-7 mb-7">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Wind className="size-6 text-white" />
              </div>
              <span className="font-bold text-base md:text-lg text-white">AirHealth Monitor</span>
            </div>
            <p className="text-[13px] md:text-sm text-gray-400 leading-6 mb-3">
              Making invisible air conditions visible, meaningful, and actionable for everyone.
            </p>
            <div className="flex items-center gap-2 text-pink-400">
              <Heart className="size-4 fill-pink-400" />
              <span className="text-[13px] font-medium">Built with passion</span>
            </div>
          </div>
          
          <div>
            <div className="md:mx-auto md:w-fit md:text-center">
            <h3 className="font-bold text-white text-sm md:text-base mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer text-[13px] md:text-sm hover:translate-x-2 transition-transform duration-200 inline-block">
                  → Live Dashboard
                </a>
              </li>
              <li>
                <a href="/api" className="text-gray-400 hover:text-white transition-colors cursor-pointer text-[13px] md:text-sm hover:translate-x-2 transition-transform duration-200 inline-block">
                  → API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer text-[13px] md:text-sm hover:translate-x-2 transition-transform duration-200 inline-block">
                  → Data Sources
                </a>
              </li>
              <li>
                <a href="/#team-honey" className="text-gray-400 hover:text-white transition-colors cursor-pointer text-[13px] md:text-sm hover:translate-x-2 transition-transform duration-200 inline-block">
                  → About Us
                </a>
              </li>
            </ul>
            </div>
          </div>
          
          <div>
            <div className="md:ml-auto md:max-w-xs md:text-right">
            <h3 className="font-bold text-white text-sm md:text-base mb-4">Connect With Us</h3>
            <div className="flex gap-3 mb-4 md:justify-end">
              <a
                href="https://github.com/honey-airhealth/airhealth-monitor.git"
                target="_blank"
                rel="noreferrer"
                className="group p-2.5 bg-gray-800 rounded-xl hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500 transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
                aria-label="GitHub repository"
              >
                <Github className="size-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
            <p className="text-gray-400 text-[13px] leading-6">
              Contact emails:
              <br />
              karnpon.p@ku.th
              <br />
              thitirat.som@ku.th
            </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-[13px] md:text-sm text-center md:text-left">
              &copy; 2026 <span className="text-white font-semibold">Team 11: Honey</span> - AirHealth Monitor. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-[13px] md:text-sm text-gray-400">
              <span>01219335 - Data Acquisition and Integration</span>
              <Heart className="size-4 text-pink-500 fill-pink-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
