import React from 'react';
import { Play, BookOpen, CheckCircle, Upload, Zap, ShieldCheck, HelpCircle, ArrowRight, Video, Sparkles, Cpu, Layers, TrendingUp, Terminal, Code, Database, Server, Workflow } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../components/utils';

export default function AcademyGuide() {
  const [activeWalkthrough, setActiveWalkthrough] = React.useState<string | null>(null);
  const [step, setStep] = React.useState(0);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const guides = [
    {
      id: 'attendance',
      title: 'Presence Registration Protocol',
      duration: '1:45',
      description: 'Learn how to synchronize your daily presence with the faculty node.',
      steps: [
        'Navigate to "Attendance Monitoring" from your dashboard.',
        'Locate your current active class session in the "Active Channels" list.',
        'Click "Register Presence" — ensure you are within the 2-hour synchronization window.',
        'Select your Program, Duration, and verify your Session Time.',
        'Success! Your presence is now transmitted to the faculty registry.'
      ],
      visuals: [
        { type: 'dashboard', highlight: 'Attendance' },
        { type: 'list', highlight: 'Active Session' },
        { type: 'button', highlight: 'Register' },
        { type: 'form', highlight: 'Selection' },
        { type: 'success', highlight: 'Verified' }
      ],
      icon: CheckCircle,
      color: 'bg-emerald-500'
    },
    {
      id: 'assignments',
      title: 'Academic Submission Workflow',
      duration: '2:30',
      description: 'Master the process of uploading assignments and Cyber Security work.',
      steps: [
        'Access the "Assessment Center" periodically to check for due work.',
        'Identify the target assignment (e.g. Cyber Security Assignment).',
        'If the assignment is not listed, use the "Manual Submission Protocol" at the bottom.',
        'Select your file (PDF or Image) — ensure the filename is clear.',
        'Click "Transmit Work" and wait for the "Synchronization Successful" message.'
      ],
      visuals: [
        { type: 'center', highlight: 'Assessments' },
        { type: 'file', highlight: 'Cyber Security' },
        { type: 'manual', highlight: 'Protocol' },
        { type: 'upload', highlight: 'PDF/IMG' },
        { type: 'transmit', highlight: 'Transmit' }
      ],
      icon: Upload,
      color: 'bg-primary'
    },
    {
      id: 'enrollment',
      title: 'Portal Enrollment Protocol',
      duration: '2:00',
      description: 'New to the Academy? Learn how to register your identity and secure your node.',
      steps: [
        'Click "New Student Register" on the login console.',
        'Enter your Full Legal Name and a valid Email node.',
        'Provide your NRC and select your target Academic Program.',
        'Record your auto-generated Student ID and Password immediately.',
        'Perform your first entry into the portal to activate your student registry.'
      ],
      visuals: [
        { type: 'login', highlight: 'Registration' },
        { type: 'form', highlight: 'Identity Data' },
        { type: 'nrc', highlight: 'Verification' },
        { type: 'credentials', highlight: 'Master Key' },
        { type: 'entry', highlight: 'Activation' }
      ],
      icon: ShieldCheck,
      color: 'bg-secondary'
    }
  ];

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStartWalkthrough = (id: string) => {
    setActiveWalkthrough(id);
    setStep(0);
    const guide = guides.find(g => g.id === id);
    if (guide) {
      speak(`Initializing ${guide.title}. Step one. ${guide.steps[0]}`);
    }
  };

  const handleNext = () => {
    const guide = guides.find(g => g.id === activeWalkthrough);
    if (!guide) return;
    
    if (step < guide.steps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      speak(`Step ${nextStep + 1}. ${guide.steps[nextStep]}`);
    } else {
      setActiveWalkthrough(null);
      speak("Walkthrough protocol terminated. Returning to knowledge base.");
    }
  };

  const handlePrev = () => {
    const guide = guides.find(g => g.id === activeWalkthrough);
    if (!guide || step === 0) return;
    
    const prevStep = step - 1;
    setStep(prevStep);
    speak(`Returning to step ${prevStep + 1}. ${guide.steps[prevStep]}`);
  };

  const renderVirtualUI = () => {
    const guide = guides.find(g => g.id === activeWalkthrough);
    const visual = guide?.visuals[step];
    if (!visual) return null;

    return (
      <div className="w-full h-full flex flex-col relative overflow-hidden bg-black rounded-3xl border-4 border-gray-800 shadow-2xl group/player">
         {/* Top Bar - Video Title */}
         <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/80 to-transparent z-20 px-6 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">{guide?.title} — Live Rec</span>
           </div>
           <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">4K HL-STREAM</div>
         </div>

         {/* Playback Container */}
         <div className="flex-1 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${activeWalkthrough}-${step}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8"
              >
                 <div className="relative">
                   <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mb-6 border-2 border-primary/40 relative z-10 backdrop-blur-xl">
                      {activeWalkthrough === 'attendance' ? <CheckCircle className="w-10 h-10 text-primary" /> : 
                       activeWalkthrough === 'enrollment' ? <ShieldCheck className="w-10 h-10 text-primary" /> :
                       <Upload className="w-10 h-10 text-primary" />}
                   </div>
                   {/* Glow effect */}
                   <div className="absolute inset-0 bg-primary/30 blur-3xl -z-10 rounded-full animate-pulse" />
                 </div>
                 
                 <div className="space-y-3 text-center">
                   <p className="text-[12px] font-black uppercase tracking-[0.4em] text-primary">System Command Executing</p>
                   <h4 className="text-3xl font-black uppercase italic tracking-tighter text-white">{visual.highlight}</h4>
                   <div className="flex justify-center gap-1">
                     <div className="h-1 w-12 bg-primary rounded-full" />
                     <div className="h-1 w-4 bg-primary/30 rounded-full" />
                   </div>
                 </div>

                 {/* Simulated Cursor */}
                 <motion.div 
                   animate={{ 
                     x: [40, -40, 0],
                     y: [20, -20, 0],
                   }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute pointer-events-none"
                 >
                   <div className="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center">
                     <div className="w-1 h-1 bg-primary rounded-full" />
                   </div>
                 </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.1] pointer-events-none">
              <div className="w-full h-full grid grid-cols-20 gap-px">
                {Array.from({ length: 400 }).map((_, i) => (
                  <div key={i} className="bg-white/20" />
                ))}
              </div>
            </div>
         </div>

         {/* Bottom Control Bar */}
         <div className="h-16 bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col justify-end gap-3 z-20">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden relative">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${((step + 1) / (guide?.steps.length || 1)) * 100}%` }}
                 className="absolute top-0 left-0 h-full bg-primary"
               />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-white">
                <Play className="w-4 h-4 fill-current" />
                <div className="w-px h-3 bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  00:{String(step * 30).padStart(2, '0')} / {guide?.duration}
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">Processing</span>
              </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="text-left">
        <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">Academy Knowledge Base</h1>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">Operational Manuals & Systems Guidance</p>
      </div>

      <AnimatePresence>
        {activeWalkthrough && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[2000] flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full bg-white rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
               <button 
                 onClick={() => setActiveWalkthrough(null)}
                 className="absolute top-8 right-8 w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
               >
                 <Zap className="w-6 h-6 rotate-45" />
               </button>

               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/5">
                          <Video className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Interactive Protocol</p>
                          <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
                            {guides.find(g => g.id === activeWalkthrough)?.title}
                          </h3>
                       </div>
                    </div>
                    {isSpeaking && (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-4 bg-primary animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1 h-6 bg-primary animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1 h-4 bg-primary animate-bounce" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-80 md:h-full min-h-[300px]">
                      {renderVirtualUI()}
                    </div>
                    
                    <div className="bg-gray-50 rounded-[32px] p-10 border-2 border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                       <motion.div 
                         key={step}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         className="space-y-6 relative z-10"
                       >
                          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl mx-auto shadow-xl shadow-primary/20">
                             {step + 1}
                          </div>
                          <div className="space-y-2">
                             <p className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight max-w-md mx-auto">
                                {guides.find(g => g.id === activeWalkthrough)?.steps[step]}
                             </p>
                             <div className="flex items-center justify-center gap-2 text-primary">
                                <Sparkles className="w-4 h-4 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Voice Synthesis Enabled</span>
                             </div>
                          </div>
                       </motion.div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                     <div className="flex gap-2">
                        {guides.find(g => g.id === activeWalkthrough)?.steps.map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "h-2 rounded-full transition-all duration-500",
                              i === step ? "w-12 bg-primary" : "w-3 bg-gray-200"
                            )} 
                          />
                        ))}
                     </div>
                     <div className="flex gap-4 font-mono">
                        <button 
                          disabled={step === 0}
                          onClick={handlePrev}
                          className="px-8 h-14 rounded-2xl border-2 border-gray-100 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-gray-50 transition-all"
                        >
                          Protocol Prev
                        </button>
                        <button 
                          onClick={handleNext}
                          className="px-10 h-14 rounded-2xl bg-secondary text-primary text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all outline-none focus:ring-2 ring-primary ring-offset-4"
                        >
                          {step === (guides.find(g => g.id === activeWalkthrough)?.steps.length || 1) - 1 ? 'Terminate Guide' : 'Execute Next'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {guides.map((guide, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={guide.id}
            className="bg-white rounded-[50px] border-2 border-gray-100 overflow-hidden shadow-2xl hover:border-primary/20 transition-all flex flex-col group/card"
          >
            <div 
              onClick={() => handleStartWalkthrough(guide.id)}
              className={cn("h-72 relative flex items-center justify-center cursor-pointer overflow-hidden", guide.color)}
            >
              {/* Virtual Preview Grid */}
              <div className="absolute inset-0 grid grid-cols-8 gap-1 p-4 opacity-10">
                 {Array.from({ length: 64 }).map((_, i) => (
                   <div key={i} className="aspect-square bg-white rounded-sm" />
                 ))}
              </div>

              <div className="absolute inset-0 bg-black/10 group-hover/card:bg-black/0 transition-colors" />
              
              <div className="flex flex-col items-center gap-6 text-white relative z-10">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white scale-100 group-hover/card:scale-110 transition-all duration-500 border-2 border-white/30 shadow-2xl">
                  <Play className="w-10 h-10 fill-current" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[12px] font-black uppercase tracking-[0.3em] italic">Launch Interactive Visuals</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Click to start tutorial walkthrough</p>
                </div>
              </div>

              <div className="absolute bottom-6 left-10 flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <Video className="w-3 h-3 text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{guide.duration} Guide Protocol</span>
              </div>
            </div>

            <div className="p-12 space-y-8 flex-1 flex flex-col">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", guide.color)}>
                    <guide.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">{guide.title}</h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2">Active Training Module</p>
                  </div>
                </div>
                <p className="text-gray-500 font-medium leading-relaxed text-lg">{guide.description}</p>
              </div>

              <div className="space-y-6 flex-1 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> System Logic Chain
                </h3>
                <div className="space-y-4">
                  {guide.steps.map((step, i) => (
                    <div key={i} className="flex gap-5 group/step">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-gray-100 flex items-center justify-center text-[11px] font-black text-gray-400 shrink-0 group-hover/step:border-primary group-hover/step:text-primary transition-colors">
                        {i + 1}
                      </div>
                      <p className="text-md font-bold text-gray-600 text-left leading-snug">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleStartWalkthrough(guide.id)}
                className="w-full mt-4 h-20 rounded-[28px] bg-secondary text-primary font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl group/btn"
              >
                Initialize Walkthrough Protocol <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-10">
        <div className="text-left">
          <h2 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase">90% Practical Learning Roadmap</h2>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[9px] mt-2 italic">Building real systems from day one // No unnecessary theory</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              level: 'Level 1: Beginner',
              goal: 'Learn by Building',
              color: 'text-emerald-500',
              borderColor: 'border-emerald-100',
              bgColor: 'bg-emerald-50/50',
              icon: Code,
              subSections: [
                { title: 'Computer & Internet Setup', tasks: ['Set up folders, tools, browsers', 'Install VS Code & Python', 'Practice workspace organization'] },
                { title: 'Web Development Starter', tasks: ['Build personal profile website', 'Style with HTML/CSS', 'Create 3 mini-web projects'] },
                { title: 'Python Basics', tasks: ['Write scripts immediately', 'Build Calculator & Login system', 'Create Grade checker'] },
                { title: 'Networking Basics', tasks: ['Identify device IP addresses', 'Test pings & connectivity', 'Network diagram practice'] },
                { title: 'Cybersecurity Awareness', tasks: ['Create strong password logic', 'Phishing safe simulations', 'Secure your own accounts'] }
              ],
              final: 'Build a personal portfolio website + Python mini toolkit'
            },
            {
              level: 'Level 2: Intermediate',
              goal: 'Real System Building',
              color: 'text-amber-500',
              borderColor: 'border-amber-100',
              bgColor: 'bg-amber-50/50',
              icon: Database,
              subSections: [
                { title: 'JavaScript + Web Interaction', tasks: ['Build interactive buttons & forms', 'Create dynamic websites', 'Project: To-do list app'] },
                { title: 'Python Projects (Real use cases)', tasks: ['File handling systems', 'Simple database storage', 'Project: Student record & Inventory systems'] },
                { title: 'Networking Practice Lab', tasks: ['Set up virtual network concepts', 'Diagnose connection issues', 'Simulate office network structure'] },
                { title: 'Cybersecurity Lab (Hands-on)', tasks: ['Ethical password cracking labs', 'Identify vulnerabilities in sample apps', 'Practice: secure a mock website'] },
                { title: 'Graphic Design for Real Projects', tasks: ['Design actual UI for websites', 'Create logos and banners for projects', 'Practice: design full website interface'] }
              ],
              final: 'Build a fully functional website with Python backend + design system'
            },
            {
              level: 'Level 3: Expert',
              goal: 'Production Readiness',
              color: 'text-red-500',
              borderColor: 'border-red-100',
              bgColor: 'bg-red-50/50',
              icon: Server,
              subSections: [
                { title: 'Full-Stack Web Development', tasks: ['Build complete systems (frontend + backend)', 'Database integration', 'Project: LMS (like IT International Academy)'] },
                { title: 'Advanced Python Automation', tasks: ['Automation scripts for efficiency', 'API integration nodes', 'Project: automated data or task systems'] },
                { title: 'Cybersecurity Practical Labs', tasks: ['Penetration testing simulations', 'Secure system design', 'Vulnerability scanning practice'] },
                { title: 'Networking & System Setup', tasks: ['Server configuration basics', 'Cloud setup introduction', 'Real deployment practice'] },
                { title: 'Software Engineering Practice', tasks: ['GitHub project workflow', 'Team collaboration logic', 'Real project management'] }
              ],
              final: 'Build a complete real platforms (like IT International Academy system itself)'
            }
          ].map((lvl, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn("p-10 rounded-[45px] border-2 shadow-sm flex flex-col h-full group transition-all hover:shadow-xl", lvl.borderColor, lvl.bgColor)}
            >
              <div className="flex items-center justify-between mb-8">
                 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", lvl.bgColor.replace('/50', ''))}>
                    <lvl.icon className={cn("w-7 h-7", lvl.color)} />
                 </div>
                 <div className="text-right">
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", lvl.color)}>{lvl.level}</p>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">{lvl.goal}</h3>
                 </div>
              </div>

              <div className="space-y-6 flex-1">
                 {lvl.subSections.map((sub, sIdx) => (
                   <div key={sIdx} className="space-y-2">
                     <h4 className="text-[11px] font-black uppercase text-gray-900 flex items-center gap-2">
                       {sIdx + 1}. {sub.title}
                     </h4>
                     <ul className="space-y-1 ml-5">
                       {sub.tasks.map((t, tIdx) => (
                         <li key={tIdx} className="text-[10px] font-medium text-gray-500 flex items-center gap-2">
                           <div className={cn("w-1 h-1 rounded-full", lvl.color.replace('text', 'bg'))} /> {t}
                         </li>
                       ))}
                     </ul>
                   </div>
                 ))}
              </div>

              <div className="mt-10 pt-8 border-t-2 border-dashed border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className={cn("w-4 h-4", lvl.color)} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Capstone Project</span>
                </div>
                <p className="text-sm font-black italic text-gray-800 leading-tight">
                  <span className={cn(lvl.color, "mr-1")}>👉</span> {lvl.final}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-[50px] p-12 text-white overflow-hidden relative group">
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white rotate-12 group-hover:rotate-0 transition-transform">
                      <Zap className="w-6 h-6" />
                   </div>
                   <h2 className="text-4xl font-black uppercase italic tracking-tighter">🔥 The 90% Practical Rule</h2>
                </div>
                <p className="text-xl text-white/60 font-bold leading-relaxed mb-8">
                  Engineered to prevent theoretical staleness. Every lesson follows the industry-proven "Build-First" philosophy.
                </p>
                <div className="grid grid-cols-2 gap-4">
                   {[
                     { label: '🧪 Do first', desc: 'Build something' },
                     { label: '⚙️ Learn theory', desc: 'Only when stuck' },
                     { label: '🔁 Repeat', desc: 'With variation' },
                     { label: '🚀 End goal', desc: 'Real project' }
                   ].map((rule, idx) => (
                     <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-emerald-500 font-black uppercase text-[10px] tracking-widest mb-1">{rule.label}</p>
                        <p className="text-xs font-bold text-white/80">{rule.desc}</p>
                     </div>
                   ))}
                </div>
              </div>
              <div className="bg-white/5 rounded-[40px] p-10 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <TrendingUp className="w-48 h-48" />
                </div>
                 <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />💡 Why this works
                 </h3>
                 <ul className="space-y-6">
                   {[
                     'Learners become job-ready faster',
                     'Less boredom (no long theory dumps)',
                     'Strong portfolio by the end',
                     'Matches real industry work'
                   ].map((item, idx) => (
                     <li key={idx} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                           <CheckCircle className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-bold text-white/90">{item}</span>
                     </li>
                   ))}
                 </ul>
              </div>
           </div>
           
           {/* Abstract background graphics */}
           <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
           <div className="absolute -left-20 -top-20 w-80 h-80 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />
        </div>
      </div>

      <div className="bg-primary p-12 rounded-[60px] relative overflow-hidden group shadow-2xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-secondary">
          <div className="text-left space-y-6 max-w-2xl">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
               </div>
               <h2 className="text-4xl font-black uppercase italic tracking-tighter">Live Support Node</h2>
             </div>
             <p className="text-secondary/60 font-bold text-lg leading-relaxed uppercase tracking-tight">
               Encountering synchronization errors or metadata corruption? Our faculty engineering squad is active 24/7 via the WhatsApp Global Node for emergency intervention.
             </p>
             <button className="inline-flex items-center gap-4 bg-secondary text-primary px-12 py-6 rounded-[24px] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl group/sub">
               Connect to Academy Admin <Zap className="w-4 h-4 group-hover/sub:animate-bounce" />
             </button>
          </div>
          <div className="w-48 h-48 bg-secondary/5 rounded-[50px] flex items-center justify-center relative group-hover:rotate-12 transition-all duration-1000">
            <ShieldCheck className="w-24 h-24 text-secondary/20" />
            <div className="absolute inset-0 border-4 border-dashed border-secondary/10 rounded-[50px] animate-[spin_10s_linear_infinite]" />
          </div>
        </div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
