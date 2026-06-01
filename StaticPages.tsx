import React from 'react';
import { Info, Eye, Globe, Target } from 'lucide-react';

interface StaticPagesProps {
  type: 'about' | 'vision' | 'achievements';
}

export function StaticPages({ type }: StaticPagesProps) {
  const isAbout = type === 'about';
  const isVision = type === 'vision';
  const isAchievements = type === 'achievements';

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
          {isAbout ? <Info className="w-10 h-10" /> : isVision ? <Eye className="w-10 h-10" /> : <Target className="w-10 h-10" />}
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-primary italic">
            {isAbout ? 'Institutional Overview' : isVision ? 'Educational Projections' : 'National Achievements'}
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-xs mt-1">
            IT INTERNATIONAL ACADEMY // Official Documentation
          </p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl space-y-12 leading-relaxed text-gray-700">
        {isAbout && (
          <div className="space-y-10">
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-primary">
                 <Globe className="w-6 h-6" />
                 <h2 className="text-xl font-black uppercase tracking-tight">Our Mission & Global Presence</h2>
               </div>
               <p className="text-lg font-medium">
                IT INTERNATIONAL ACADEMY stands as a beacon of modern technical education, bridging the gap between theoretical knowledge and industrial application. Founded on the principles of accessibility and excellence, we have successfully transformed thousands of careers across the globe.
               </p>
            </section>
            
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-primary">
                 <Target className="w-6 h-6" />
                 <h2 className="text-xl font-black uppercase tracking-tight">Academic Sovereignty</h2>
               </div>
               <p className="text-sm font-medium leading-relaxed">
                 Our institution is recognized for its rigorous technical training programs. We specialize in Computer Networking (CCNA/CCNP), Software Engineering, Cyber Security, and Digital Governance. Our curriculum is constantly updated by industry experts to reflect the latest shifts in the global technology landscape.
               </p>
            </section>

            <div className="bg-gray-900 p-10 rounded-[32px] border-4 border-primary/20 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                  <Globe className="w-32 h-32" />
               </div>
               <p className="text-lg font-black italic relative z-10">
                "Empowering the next generation of digital leaders through rigorous technical training and industry-aligned curricula. We are more than an academy; we are an ecosystem of innovation."
               </p>
               <div className="mt-8 flex gap-6 relative z-10">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center flex-1">
                     <p className="text-2xl font-black text-primary">10k+</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-1">Graduates</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center flex-1">
                     <p className="text-2xl font-black text-primary">50+</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-1">Partner Corps</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center flex-1">
                     <p className="text-2xl font-black text-primary">95%</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-1">Job Placement</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {isVision && (
          <>
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-primary">
                 <Target className="w-6 h-6" />
                 <h2 className="text-xl font-black uppercase tracking-tight">Systemic Vision</h2>
               </div>
               <p className="text-lg font-medium">
                To become a leading international academy in technology education, empowering students with skills for the digital future. We envision a world where high-level technical skills are not a privilege, but an accessible right for all motivated learners.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {['Innovation', 'Excellence', 'Accessibility', 'Integrity'].map(word => (
                 <div key={word} className="bg-primary/5 p-6 rounded-2xl border border-primary/10 text-center group hover:bg-primary transition-all">
                   <span className="text-xs font-black uppercase tracking-[0.4em] text-primary group-hover:text-white">{word}</span>
                 </div>
               ))}
            </div>
          </>
        )}

        {isAchievements && (
          <div className="space-y-12">
             <div className="space-y-4">
               <div className="flex items-center gap-3 text-primary">
                 <Info className="w-6 h-6" />
                 <h2 className="text-xl font-black uppercase tracking-tight">Legacy of Excellence</h2>
               </div>
               <p className="text-lg font-medium">
                 Over the last decade, IT International Academy has reached significant milestones that solidify our position as a leader in technical education.
               </p>
             </div>

             <div className="space-y-6">
                {[
                  { 
                    title: "Best Technical Institution 2025", 
                    desc: "Awarded by the National Education Council for outstanding contribution to technical vocational training.",
                    date: "September 2025"
                  },
                  { 
                    title: "Cisco Cisco Networking Academy Excellence", 
                    desc: "Recognized as a Premier Partner for delivering the highest quality CCNA and Security certification training.",
                    date: "May 2024"
                  },
                  { 
                    title: "Cyber Security Innovation Award", 
                    desc: "Honored for our unique AI-integrated laboratory simulations that set new standards for practical exams.",
                    date: "January 2026"
                  }
                ].map((ach, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="flex flex-col items-center">
                       <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          {i + 1}
                       </div>
                       <div className="w-0.5 h-full bg-gray-100" />
                    </div>
                    <div className="pb-10">
                       <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{ach.date}</span>
                       <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mt-1 mb-2 italic">{ach.title}</h3>
                       <p className="text-gray-500 font-medium text-sm leading-relaxed">{ach.desc}</p>
                    </div>
                  </div>
                ))}
             </div>

             <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
                   <Target className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1 italic">Current Goal</p>
                   <p className="text-sm font-bold text-emerald-900 uppercase tracking-tight">Surpassing 15,000 Certified Professionals by 2027</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
