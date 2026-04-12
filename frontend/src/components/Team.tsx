import { Users, Heart } from 'lucide-react';
import { Card } from './ui/card';

const teamMembers = [
  {
    name: 'Karnpon POOCHITKANON',
    studentId: '6710545458',
    imageSrc: '/team/vince.jpg',
    imageAlt: 'Vince',
    fallbackEmoji: '👨‍💻',
  },
  {
    name: 'Thitirat SOMSUPANGSRI',
    studentId: '6710545563',
    imageSrc: '/team/tal.jpg',
    imageAlt: 'Tal',
    fallbackEmoji: '👩‍💻',
  },
] as const;

export function Team() {
  return (
    <div id="team-honey" className="py-10 md:py-12 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-gradient-to-br from-yellow-200 to-pink-200 rounded-full filter blur-3xl opacity-20"></div>
      </div>
      
      <div className="max-w-[68rem] mx-auto relative z-10">
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 relative">
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 size-32 border-8 border-white rounded-full"></div>
            <div className="absolute top-20 right-20 size-40 border-8 border-white rounded-full"></div>
            <div className="absolute bottom-10 left-1/3 size-24 border-8 border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 p-5 md:p-7 text-center">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="p-3.5 md:p-4 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/50 shadow-2xl">
                  <Users className="size-10 md:size-14 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 p-2.5 bg-pink-500 rounded-full animate-bounce">
                  <Heart className="size-5 text-white fill-white" />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="inline-block mb-3">
                <span className="text-white/90 text-[11px] md:text-xs font-semibold tracking-wide bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border-2 border-white/30">
                  🍯 TEAM 11
                </span>
              </div>
              <h2 className="text-[1.7rem] md:text-[2.45rem] font-bold leading-[1.08] text-white mb-3 drop-shadow-lg">
                Team Honey
              </h2>
            </div>
            
            <div className="max-w-2xl mx-auto mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.studentId}
                    className="bg-white/20 backdrop-blur-sm p-3.5 md:p-4 rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all hover:-translate-y-1"
                  >
                    <div className="mb-3 flex justify-center">
                      <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/20 text-3xl shadow-lg">
                        <img
                          src={member.imageSrc}
                          alt={member.imageAlt}
                          className="size-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                            const fallback = event.currentTarget.nextElementSibling as HTMLSpanElement | null;
                            if (fallback) fallback.style.display = 'inline';
                          }}
                        />
                        <span style={{ display: 'none' }}>{member.fallbackEmoji}</span>
                      </div>
                    </div>
                    <p className="text-white text-base md:text-lg font-bold">
                      {member.name}
                    </p>
                    <p className="mt-1.5 text-[13px] md:text-sm text-white/85 font-medium">
                      {member.studentId}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm p-4 md:p-5 rounded-2xl border-2 border-white/30">
                <p className="text-white text-[13px] md:text-sm leading-6 font-medium">
                  💡 Dedicated to bridging the gap between environmental sensing and personal well-being 
                  by making invisible air conditions <span className="font-bold text-yellow-200">visible</span>, 
                  <span className="font-bold text-yellow-200"> meaningful</span>, and 
                  <span className="font-bold text-yellow-200"> actionable</span>.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
