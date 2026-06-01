import React, { useState } from 'react';
import { Play, BookOpen, Upload, Shield, CheckCircle, HelpCircle, ChevronRight, ChevronLeft, MapPin, MousePointer2, Monitor, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Tutorials() {
  const [activeTab, setActiveTab] = useState<'onboarding' | 'monitoring' | 'upload'>('onboarding');
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialData = {
    onboarding: {
      title: "Node Onboarding Protocol",
      desc: "Registering new student identities into the Supabase cloud.",
      icon: <Shield className="w-6 h-6" />,
      videoUrl: "https://www.youtube.com/embed/5Nsh0Y30uO8",
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop",
      steps: [
        { 
          title: "Access Admin Console", 
          detail: "Open the side drawer and select 'Master student List'. Only admins with Master Keys can access this node.",
          action: "Click the 'Students' link in navigation."
        },
        { 
          title: "Initiate Enrollment", 
          detail: "Click the 'Enroll New Student' button at the top header.",
          action: "Locate the primary action button."
        },
        { 
          title: "NRC Identity Link", 
          detail: "Enter the student's legal NRC. Example: 318468/62/1. This is the unique anchor for all academic data.",
          action: "Input valid NRC identification."
        },
        { 
          title: "Generate Credentials", 
          detail: "The system will automatically generate a Student ID and a temporary Pass-Key based on the NRC. You can view, override, and re-configure these at any time in the 'Security & Credentials' tab of the Student Manager.",
          action: "Confirm generated node parameters or use the 'Security' tab to override."
        }
      ]
    },
    monitoring: {
      title: "Daily Register & Monitoring",
      desc: "How to log daily attendance and sync presence with the mentor console.",
      icon: <Monitor className="w-6 h-6" />,
      videoUrl: "https://www.youtube.com/embed/v9N2q2O5_N4",
      imageUrl: "https://images.unsplash.com/photo-1573161158365-59b832b20281?q=80&w=1000&auto=format&fit=crop",
      steps: [
        { 
          title: "Login to Node", 
          detail: "Students use their ID or NRC (e.g., 318468/62/1) and pass-key at the login portal.",
          action: "Verify credentials at auth gate."
        },
        { 
          title: "Presence Sync", 
          detail: "Navigate to 'Daily Register'. The system captures your current session timestamp.",
          action: "Select the 'Attendance' tile on the dashboard."
        },
        { 
          title: "Confirm Status", 
          detail: "Tap the 'Check-In' button. Your status will update to 'PRESENT' in real-time.",
          action: "Trigger the status update protocol."
        }
      ]
    },
    upload: {
      title: "Assignment Submission Wave",
      desc: "Uploading evidence of work for module evaluation.",
      icon: <FileUp className="w-6 h-6" />,
      videoUrl: "https://www.youtube.com/embed/v9N2q2O5_N4",
      imageUrl: "https://images.unsplash.com/photo-1586282391129-59a998bd1160?q=80&w=1000&auto=format&fit=crop",
      steps: [
        { 
          title: "Locate Module", 
          detail: "Go to 'Active Modules'/Courses and select the specific subject you are working on.",
          action: "Enter the academic node."
        },
        { 
          title: "Submit Evidence", 
          detail: "Select the 'Upload Work' option. Ensure your file is in PDF or Document format.",
          action: "Attach module artifacts."
        },
        { 
          title: "Verification Sync", 
          detail: "Await the 'Sync Successful' message. This ensures your work is stored in Supabase.",
          action: "Watch for the green success signal."
        }
      ]
    }
  };

  const currentTutorial = tutorialData[activeTab];

  return (
    <div className="space-y-8 pb-32 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 flex items-center gap-4">
          Training & Protocol Intel
          <div className="px-3 py-1 bg-secondary text-white rounded-full text-[10px] font-black animate-pulse">
            MASTER ACCESS
          </div>
        </h2>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Interactive assistance for student & staff node management</p>
      </div>

      {/* Tutorial Selector */}
      <div className="flex flex-wrap gap-4 p-2 bg-gray-100 rounded-3xl border border-gray-200">
        {(Object.keys(tutorialData) as Array<keyof typeof tutorialData>).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setCurrentStep(0); }}
            className={`flex-1 min-w-[200px] h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === tab ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-transparent text-gray-400 hover:text-gray-900'}`}
          >
            {tutorialData[tab].icon}
            {tutorialData[tab].title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Step Interaction */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/5 px-3 py-1 rounded-full">
                Step {currentStep + 1} of {currentTutorial.steps.length}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  disabled={currentStep === currentTutorial.steps.length - 1}
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-black italic uppercase italic tracking-tight text-gray-900">
                    {currentTutorial.steps[currentStep].title}
                  </h3>
                  <p className="text-gray-500 font-bold text-sm mt-4 leading-relaxed">
                    {currentTutorial.steps[currentStep].detail}
                  </p>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                    <MousePointer2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase text-primary tracking-widest">Required Action</span>
                    <p className="text-[11px] font-black text-gray-900 uppercase">
                      {currentTutorial.steps[currentStep].action}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex gap-2">
              {currentTutorial.steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-12 bg-primary' : 'w-2 bg-gray-100'}`} 
                />
              ))}
            </div>
          </div>

          <div className="p-6 bg-secondary rounded-3xl text-white">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="w-3 h-3 text-primary" />
              Security Intel
            </h4>
            <p className="text-[11px] font-bold opacity-80 leading-relaxed">
              Always verify that the NRC format matches your official legal document (e.g., 318468/62/1) to ensure protocol synchronization with the Master Key database.
            </p>
          </div>
        </div>

        {/* Right: Visual Assistance */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-[2.5rem] border-[12px] border-gray-800 shadow-2xl aspect-video relative overflow-hidden group">
              <iframe 
                className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                src={currentTutorial.videoUrl}
                title={currentTutorial.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              
              <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-end">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Training Video</span>
                      <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">System Walkthrough</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border-[12px] border-gray-50 shadow-2xl aspect-video relative overflow-hidden group">
              {(currentTutorial as any).imageUrl && (
                <img 
                  src={(currentTutorial as any).imageUrl} 
                  alt={currentTutorial.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Visual Intel</span>
                    <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Interface Artifact</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-lg hover:border-primary transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black italic uppercase tracking-tight">Manual Documentation</h3>
              </div>
              <p className="text-xs font-bold text-gray-400 mb-6">Download the full technical manual for off-network reference.</p>
              <button className="w-full h-12 bg-gray-50 text-gray-900 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-gray-200 transition-colors">
                Download Protocol PDF
              </button>
            </div>

            <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-lg hover:border-emerald-500 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black italic uppercase tracking-tight">Technical Support</h3>
              </div>
              <p className="text-xs font-bold text-gray-400 mb-6">Need immediate assistance with a node error?</p>
              <a href="https://wa.me/260766149405" className="w-full h-12 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2">
                Open Support Line
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
