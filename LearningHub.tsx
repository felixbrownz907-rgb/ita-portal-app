import React, { useState } from 'react';
import { Video, MessageCircle, Phone, Globe, ArrowRight, X, Library, Download, ExternalLink, FileUp, CheckCircle, PlayCircle, FileText, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/utils';
import ReactMarkdown from 'react-markdown';
import { Lesson } from '../context/types';

export function LearningHub({ onAction }: { onAction?: (section: string) => void }) {
  const { user, learningMaterials, courses } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(user?.studentData?.courseId || (courses.length > 0 ? courses[0].id : ''));
  const isLocked = false;

  const sites = [
    { 
      name: 'Google Meet', 
      desc: 'Primary Virtual Classroom for Interactive Lectures', 
      icon: Video, 
      color: 'bg-emerald-500', 
      url: 'https://meet.google.com' 
    },
    { 
      name: 'WhatsApp Classes', 
      desc: 'Mobile Learning & Fast Response Community', 
      icon: MessageCircle, 
      color: 'bg-green-500', 
      url: 'https://web.whatsapp.com' 
    },
    { 
      name: 'Zoom Bridge', 
      desc: 'High-Definition Screen Sharing & Webinars', 
      icon: Globe, 
      color: 'bg-blue-500', 
      url: 'https://zoom.us' 
    },
    { 
      name: 'Audio Portal', 
      desc: 'Direct Audio Stream for Low Bandwidth Access', 
      icon: Phone, 
      color: 'bg-purple-500', 
      url: '#' 
    },
    { 
      name: 'Cisco Netacad', 
      desc: 'Professional Networking Lab Integration', 
      icon: Globe, 
      color: 'bg-blue-600', 
      url: 'https://www.netacad.com' 
    }
  ];

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    // Lock logic disabled by system override
  };

  const studentCourse = courses.find(c => c.id === selectedCourseId);
  const { completions, toggleLessonCompletion } = useAuth();
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);

  const markAsComplete = (lessonId: string) => {
    if (!completions.includes(lessonId)) {
      toggleLessonCompletion(lessonId);
    }
  };

  const handleLessonView = (lesson: Lesson) => {
    setViewingLesson(lesson);
    if (!lesson.videoUrl && !lesson.pdfUrl && !lesson.audioUrl) {
      markAsComplete(lesson.id);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto relative pt-8 pb-32">
      {viewingLesson && (
        <div className="fixed inset-0 bg-gray-900/95 z-[100] flex animate-in fade-in duration-300">
           <div className="flex-1 flex flex-col relative">
              <div className="p-6 flex justify-between items-center border-b border-white/5">
                 <div className="flex items-center gap-4 text-white">
                    <button onClick={() => setViewingLesson(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                       <X className="w-6 h-6" />
                    </button>
                    <div>
                       <h3 className="text-sm font-black uppercase tracking-tight">{viewingLesson.title}</h3>
                       <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{studentCourse?.name}</p>
                    </div>
                 </div>
                  <div className="flex items-center gap-4">
                    {viewingLesson.pdfUrl && (
                      <button 
                        onClick={() => {
                          markAsComplete(viewingLesson.id);
                          window.dispatchEvent(new CustomEvent('open-integrated-notes', {
                            detail: { url: viewingLesson.pdfUrl, title: viewingLesson.title }
                          }));
                        }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-white/60 text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none"
                      >
                         <Download className="w-4 h-4" /> Notes
                      </button>
                    )}
                    {(viewingLesson.videoUrl || viewingLesson.pdfUrl || viewingLesson.audioUrl) && (
                      <button 
                        onClick={() => markAsComplete(viewingLesson.id)}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                          completions.includes(viewingLesson.id) 
                            ? "bg-emerald-500 text-white" 
                            : "bg-white text-black hover:bg-primary hover:text-white"
                        )}
                      >
                         <CheckCircle className="w-4 h-4" /> {completions.includes(viewingLesson.id) ? 'Completed' : 'Mark Complete'}
                      </button>
                    )}
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-12 flex items-center justify-center">
                  <div className="w-full max-w-5xl space-y-8">
                    {viewingLesson.videoUrl ? (
                      <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                         <iframe 
                           src={viewingLesson.videoUrl.replace('watch?v=', 'embed/')}
                           className="w-full h-full"
                           allowFullScreen
                         />
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {viewingLesson.audioUrl && (
                          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-6">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                              <PlayCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Audio Briefing</p>
                              <audio controls className="w-full h-10 accent-primary">
                                <source src={viewingLesson.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          </div>
                        )}
                        <div className="bg-white rounded-[40px] p-12 shadow-2xl">
                           <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{viewingLesson.content}</ReactMarkdown>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
              </div>
           </div>
        </div>
      )}
      <div className="text-left">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 italic">Academy Learning Site</h1>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Multi-Channel Virtual Infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sites.map((site, idx) => (
          <motion.a 
            key={site.name}
            href={site.url}
            onClick={(e) => handleLinkClick(e, site.url)}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group block bg-white rounded-[40px] p-8 border-2 border-gray-100 shadow-xl hover:border-primary transition-all relative overflow-hidden"
          >
            <div className={`w-16 h-16 rounded-3xl ${site.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-gray-200`}>
               <site.icon className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-black uppercase tracking-tighter italic text-gray-900 mb-2">{site.name}</h3>
            <p className="text-sm font-medium text-gray-400 leading-relaxed max-w-[200px] mb-8">{site.desc}</p>
            
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              Initialize Connection <ArrowRight className="w-4 h-4" />
            </div>

            <div className="absolute -right-4 -bottom-4 text-gray-100 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
               <site.icon className="w-32 h-32" />
            </div>
          </motion.a>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
           <div className="flex items-center gap-6">
             <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
               <Layers className="w-6 h-6 text-primary" /> Learning Roadmap
             </h2>
             <select 
               className="bg-gray-50 border-0 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary outline-none focus:ring-2 focus:ring-primary"
               value={selectedCourseId}
               onChange={(e) => setSelectedCourseId(e.target.value)}
             >
               {courses.map(course => (
                 <option key={course.id} value={course.id}>{course.name}</option>
               ))}
             </select>
           </div>
           {studentCourse && (
             <span className="text-[10px] font-black uppercase tracking-widest text-primary hidden sm:block">
               {studentCourse.name}
             </span>
           )}
        </div>

        {studentCourse ? (
          <div className="grid grid-cols-1 gap-12">
            {studentCourse.modules.sort((a,b) => a.order - b.order).map(module => (
              <div key={module.id} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
                    {module.order}
                  </div>
                  <h3 className="text-lg font-black uppercase text-gray-900">{module.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {module.lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonView(lesson)}
                      className={cn(
                        "bg-white p-6 rounded-3xl border-2 border-gray-100 hover:border-primary transition-all text-left group flex items-center gap-4",
                        completions.includes(lesson.id) && "border-emerald-100 bg-emerald-50/10"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border",
                        completions.includes(lesson.id) ? "bg-emerald-500 text-white border-emerald-500" : "bg-gray-50 text-gray-400 group-hover:border-primary group-hover:text-primary"
                      )}>
                        {completions.includes(lesson.id) ? <CheckCircle className="w-4 h-4" /> : (lesson.videoUrl ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />)}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-gray-900 line-clamp-1">{lesson.title}</p>
                        <div className="flex gap-2 mt-1">
                          {lesson.videoUrl && <span className="text-[7px] font-black uppercase text-blue-500 bg-blue-50 px-1 border border-blue-100">Video</span>}
                          {lesson.audioUrl && <span className="text-[7px] font-black uppercase text-purple-500 bg-purple-50 px-1 border border-purple-100">Audio</span>}
                          {lesson.pdfUrl && <span className="text-[7px] font-black uppercase text-amber-500 bg-amber-50 px-1 border border-amber-100">Notes</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">
             <Layers className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">No course roadmap assigned to your profile.</p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
           <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
             <Library className="w-6 h-6 text-primary" /> Module Resource Vault
           </h2>
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{learningMaterials.length} Artifacts Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <button 
             onClick={() => onAction && onAction('submissions')}
             className="bg-primary/10 p-6 rounded-[32px] border-2 border-primary/30 hover:border-primary transition-all flex flex-col items-center justify-center gap-4 group"
           >
              <div className="w-14 h-14 bg-primary text-secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                 <FileUp className="w-7 h-7" />
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">Assessment Node</p>
                 <p className="text-xs font-black uppercase text-secondary italic">Submit Work</p>
              </div>
           </button>
           {learningMaterials.map((material) => (
             <div key={material.id} className="bg-white p-6 rounded-[32px] border-2 border-gray-100 hover:border-primary transition-all shadow-lg group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                      {material.type === 'pdf' ? <Library className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                   </div>
                </div>
                <p className="text-[8px] font-black uppercase text-primary mb-1 tracking-widest">{material.type}</p>
                <h4 className="font-black text-xs uppercase tracking-tight text-gray-900 mb-2 truncate">{material.title}</h4>
                <p className="text-[10px] font-medium text-gray-400 mb-4 line-clamp-2">Associated with Module {material.moduleId}</p>
                <a 
                  href={material.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-black uppercase tracking-widest text-[8px] flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white transition-all"
                >
                  Access Resource <ExternalLink className="w-3 h-3" />
                </a>
             </div>
           ))}
           {learningMaterials.length === 0 && (
             <div className="col-span-full py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">
                <Library className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">Vault is empty. Awaiting instructor deployment.</p>
             </div>
           )}
        </div>
      </div>

      <div className="bg-gray-900 rounded-[40px] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-white/5">
         <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Technical Support Node</h2>
            <p className="text-white/60 font-medium max-w-md">If you encounter connectivity issues with any of the learning portals, contact the IT Operations desk immediately via the AI Support Hub.</p>
         </div>
         <div className="flex gap-4">
            <div className="px-8 py-4 bg-white/10 rounded-2xl border border-white/10">
               <p className="text-[10px] font-black uppercase text-primary mb-1">Status</p>
               <p className="text-sm font-bold uppercase italic">All Systems Nominal</p>
            </div>
         </div>
      </div>
    </div>
  );
}
