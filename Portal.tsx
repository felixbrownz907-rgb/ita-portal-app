import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Dashboard } from './Dashboard';
import { Timetable } from './Timetable';
import { Courses } from './Courses';
import { Intakes } from './Intakes';
import { Students } from './Students';
import { Financial } from './Financial';
import { PracticalLab } from './PracticalLab';
import { ELibrary } from './ELibrary';
import { OnlineClasses } from './OnlineClasses';
import { WhatsAppAI } from './WhatsAppAI';
import { AIMentor } from './AIMentor';
import { LearningHub } from './LearningHub';
import { WorkSubmissions } from './WorkSubmissions';
import { AssessmentCenter } from './AssessmentCenter';
import { StaticPages } from './StaticPages';
import { CommunityHub } from './CommunityHub';
import { Interlink } from './Interlink';
import { MockExams } from './MockExams';
import { SystemConfig } from './SystemConfig';
import { AttendanceRegister } from './AttendanceRegister';
import Tutorials from './Tutorials';
import { ManualResultUploader } from './ManualResultUploader';
import { AICourseGenesis } from '../components/AICourseGenesis';
// BottomNav removed for uncluttered view
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../components/utils';
import { Settings, ShieldCheck, Download, Award, AlertCircle, ArrowLeft, MessageSquare, Sparkles, Bot, Send, X, Users } from 'lucide-react';

export function Portal({ portalType }: { portalType: 'staff' | 'student' }) {
  const { 
    user, announcementMarquee, updateMarquee, seedInitialData, dbStatus, 
    updatePassword, biometricEnabled, toggleBiometric, transparencyMode, toggleTransparency,
    refreshData, attendance, hardReset, registerAttendance, courses,
    whatsappMessages, addWhatsAppMessage, askMentor
  } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isEditingMarquee, setIsEditingMarquee] = useState(false);
  const [tempMarquee, setTempMarquee] = useState(announcementMarquee);
  const [isSyncingStatus, setIsSyncingStatus] = useState(false);
  const [blockedCertificateBalance, setBlockedCertificateBalance] = useState<number | null>(null);
  const [activeNotes, setActiveNotes] = useState<{ url: string, title: string } | null>(null);

  // Floating AI states
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const studentData = user?.studentData;
  const isStudent = user?.role === 'student';

  // Extract student floating AI history from permanent Supabase memory (whatsapp_messages table)
  const floatAiMessages = React.useMemo(() => {
    if (!isStudent || !studentData?.studentId || !whatsappMessages) return [];
    return whatsappMessages
      .filter((msg: any) => msg.sender === `FLOAT_AI_${studentData.studentId}`)
      .sort((a: any, b: any) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
  }, [whatsappMessages, studentData?.studentId, isStudent]);

  // Keep chat containers pinned to bottom when opened or typed
  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [floatAiMessages, isSending, isAiOpen]);

  const handleSendAiMessage = async () => {
    if (!chatInput.trim() || isSending || !studentData) return;
    const text = chatInput.trim();
    setChatInput('');
    setIsSending(true);

    try {
      // 1. Compile historical conversation chain
      const history: any[] = [];
      floatAiMessages.forEach((msg: any) => {
        history.push({ role: 'user', content: msg.message });
        history.push({ role: 'model', content: msg.reply });
      });
      history.push({ role: 'user', content: text });

      const courseName = courses.find(c => c.id === studentData.courseId)?.name || 'Micro-Credentials Program';
      const systemInstruction = `You are the official Academy Smart Companion for ${studentData.fullName}. They are studying ${courseName}. Assist them contextually. Keep replies highly actionable, motivational, and succinct (always below 120 words).`;

      // 2. Fetch evaluation
      const reply = await askMentor(history, systemInstruction);

      // 3. Commit permanently to Supabase
      await addWhatsAppMessage({
        sender: `FLOAT_AI_${studentData.studentId}`,
        message: text,
        reply: reply
      });
    } catch (err) {
      console.error("AI floating error", err);
    } finally {
      setIsSending(false);
    }
  };

  React.useEffect(() => {
    const handleBlockedCert = (e: any) => {
      if (e.detail && typeof e.detail.balance === 'number') {
        setBlockedCertificateBalance(e.detail.balance);
      }
    };
    window.addEventListener('graduation-certificate-blocked', handleBlockedCert as any);

    const handleOpenNotes = (e: any) => {
      if (e.detail && e.detail.url) {
        let cleanUrl = e.detail.url.trim();
        if (cleanUrl.includes("docs.google.com")) {
          if (cleanUrl.includes("/edit")) {
            cleanUrl = cleanUrl.split("/edit")[0] + "/preview";
          }
          if (!cleanUrl.includes("rm=minimal") && !cleanUrl.includes("/embed")) {
            cleanUrl += (cleanUrl.includes("?") ? "&" : "?") + "rm=minimal";
          }
        }
        setActiveNotes({ url: cleanUrl, title: e.detail.title || 'Study Notes' });
      }
    };
    const handleCloseNotes = () => {
      setActiveNotes(null);
    };

    window.addEventListener('open-integrated-notes', handleOpenNotes as any);
    window.addEventListener('close-integrated-notes', handleCloseNotes as any);

    const handleKeyDown = (e: KeyboardEvent) => {
      const isDev = user?.email?.toLowerCase() === 'felixbrownz907@gmail.com' || user?.role === 'admin';
      const key = e.key.toLowerCase();
      if (e.ctrlKey && e.shiftKey && key === 's') {
        e.preventDefault();
        refreshData();
      }
      if (e.ctrlKey && e.shiftKey && key === 'd' && isDev) {
        e.preventDefault();
        setActiveSection('sys-config');
      }
    };
    
    const handleNavEvent = (e: any) => {
      if (e.detail) setActiveSection(e.detail);
    };

    window.addEventListener('nav-section', handleNavEvent as any);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('nav-section', handleNavEvent as any);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('graduation-certificate-blocked', handleBlockedCert as any);
      window.removeEventListener('open-integrated-notes', handleOpenNotes as any);
      window.removeEventListener('close-integrated-notes', handleCloseNotes as any);
    };
  }, [refreshData, user, setActiveSection]);

  const canManageMarquee = user?.role === 'admin' && portalType === 'staff';
  const isDev = user?.role === 'admin' || user?.email?.toLowerCase() === 'felixbrownz907@gmail.com';
  const studentCourse = courses.find(c => c.id === user?.studentData?.courseId);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    if (portalType === 'student' && user?.role !== 'student') {
       return <div className="p-20 text-center uppercase font-black text-blue-900/20 tracking-[0.5em]">UNAUTHORIZED_ACCESS</div>;
    }
    
    const restrictedForStudents = ['intakes', 'security'];
    let targetSection = activeSection;
    if (portalType === 'student') {
      if (restrictedForStudents.includes(activeSection)) {
         targetSection = 'dashboard';
      }
    }

    switch (targetSection) {
      case 'dashboard': return <Dashboard onAction={setActiveSection} portalType={portalType} />;
      case 'timetable': return <Timetable />;
      case 'courses': return <Courses />;
      case 'intakes': return <Intakes />;
      case 'students': return <Students />;
      case 'financial': return <Financial />;
      case 'labs': return <PracticalLab />;
      case 'whatsapp': return <WhatsAppAI />;
      case 'library': return <ELibrary />;
      case 'live': return <OnlineClasses />;
      case 'learning-site': return <LearningHub onAction={setActiveSection} />;
      case 'submissions': return <WorkSubmissions />;
      case 'assessments': return <AssessmentCenter />;
      case 'upload-cyber': return <ManualResultUploader programName="Cyber Security" />;
      case 'upload-web': return <ManualResultUploader programName="Web Development" />;
      case 'upload-software': return <ManualResultUploader programName="Software Engineering" />;
      case 'upload-data': return <ManualResultUploader programName="Data Science" />;
      case 'mock-exams': return <MockExams />;
      case 'attendance': return <AttendanceRegister />;
      case 'lecturers': return <Interlink defaultFilter="lecturers" />;
      case 'interlink': return <Interlink />;
      case 'telemetry': return <Interlink />;
      case 'mentor': return <AIMentor />;
      case 'community': return <CommunityHub />;
      case 'tutorials': return <Tutorials />;
      case 'guide': return <Tutorials />;
      case 'student-manager': return <Students />;
      case 'security': return <Students initialTab="security" />;
      case 'certificate': return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto py-10 text-left font-sans text-white">
           <div className="flex justify-between items-end border-b border-[#00f2fe]/15 pb-8">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.45em] text-[#00f2fe] mb-2 font-mono">GRADUATED_ALUMNI_CREDENTIAL</p>
                 <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">OFFICIAL CERTIFICATION</h1>
                 <p className="text-[#38bdf8] font-bold mt-2 uppercase tracking-widest text-[10px]">IT INTERNATIONAL ACADEMY // DIGITAL DIPLOMA DIRECTORY</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-2xl flex items-center gap-2.5">
                 <ShieldCheck className="w-5 h-5 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest font-mono">CLEARANCE STATUS: APPROVED</span>
              </div>
           </div>

           {/* Core Certificate Mock Card */}
           <div className="bg-[#0a1b44] border border-[#00f2fe]/10 rounded-[40px] p-8 md:p-14 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center space-y-10">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
                 <Award className="w-64 h-64 text-white" />
              </div>

              {/* Certificate Border Line Frame */}
              <div className="border border-[#00f2fe]/15 w-full rounded-[28px] p-6 md:p-12 space-y-8 bg-[#05112e]/40 relative">
                 <div className="flex justify-between items-start mb-6">
                    <span className="text-[8px] font-mono text-[#38bdf8]/60 uppercase tracking-widest">[ SECURITY_SERIAL_REGISTRY: ITIA-77492-ZMB ]</span>
                    <span className="text-[8px] font-mono text-[#38bdf8]/60 uppercase tracking-widest">[ DATE: {new Date().toLocaleDateString()} ]</span>
                 </div>

                 <div className="space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 italic">DIPLOMA OF COMPLETION</h2>
                     <p className="text-[10px] font-extrabold uppercase text-[#38bdf8] tracking-[0.3em] font-sans">THIS SECURE CREDENTIAL CONFIRMS THE SUCCESSFUL GRADUATION OF</p>
                     
                     <h3 className="text-4xl font-extrabold text-white uppercase italic tracking-tight font-serif py-4">{user?.studentData?.fullName}</h3>
                     
                     <p className="text-xs text-[#8fa3c7] uppercase tracking-[0.1em] max-w-2xl mx-auto leading-relaxed font-semibold">
                       WHO HAS SATISFACTORILY OUTLINE-MET ALL PERFORMANCE REQUIREMENTS, ASSIGNMENTS, AND LAB PROTOCOLS ESTABLISHED BY THE FACULTY FOR THE DEGREE PATHWAY IN
                     </p>
                     
                     <h4 className="text-2xl font-black text-[#00f2fe] uppercase tracking-wider italic py-2">
                       {courses.find(c => c.id === user?.studentData?.courseId)?.name || 'CYBER SECURITY & SYSTEM DEFENSE'}
                     </h4>
                 </div>

                 <div className="grid grid-cols-2 gap-8 pt-10 border-t border-[#00f2fe]/10 font-bold">
                    <div className="text-left space-y-1">
                       <p className="text-xs font-serif text-white italic">F. Chisenga</p>
                       <p className="text-[8px] font-black text-[#38bdf8] uppercase tracking-widest">REGISTRY COMMANDER</p>
                    </div>
                    <div className="text-right space-y-1">
                       <p className="text-[10px] font-mono text-emerald-400">● SIGNATURE VERIFIED</p>
                       <p className="text-[8px] font-black text-[#38bdf8] uppercase tracking-widest">ITIA VERIFIED NODE</p>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
                 <button 
                   onClick={() => alert("DIPLOMA_DOWNLOAD: Generating cryptographic PDF payload archive...")}
                   className="h-14 bg-[#00f2fe] text-[#05112e] hover:bg-[#00c6ff] font-black uppercase tracking-widest text-xs px-10 rounded-2xl active:scale-95 transition-all shadow-xl shadow-[#00f2fe]/15 flex items-center justify-center gap-2.5"
                 >
                    <Download className="w-4 h-4" /> Download Official PDF Diploma
                 </button>
                 <button 
                   onClick={() => setActiveSection('dashboard')}
                   className="h-14 bg-[#05112e] text-[#8fa3c7] hover:text-white border border-[#00f2fe]/10 px-10 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all"
                 >
                    Return to Terminal
                 </button>
              </div>
           </div>
        </div>
      );
      case 'sys-config': return <SystemConfig />;
      case 'reset': return (
        <div className="flex items-center justify-center h-[60vh]">
          <button 
            onClick={() => {
              if(window.confirm('FORCE_PURGE: Reconstruct all local nodes?')) hardReset();
            }}
            className="px-10 py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl"
          >
            Purge Local Cache
          </button>
        </div>
      );
      case 'about': return <StaticPages type="about" />;
      case 'vision': return <StaticPages type="vision" />;
      case 'achievements': return <StaticPages type="achievements" />;
      case 'settings': return (
        <div className="space-y-12 text-left max-w-7xl mx-auto py-10 font-sans text-white">
          <div className="border-b border-[#00f2fe]/15 pb-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">SYSTEM_SETTINGS</h1>
            <p className="text-[#38bdf8] font-bold mt-2 uppercase tracking-[0.4em] text-[10px]">User Preferences & Configuration</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-10">
              <div className="bg-[#0a1b44] border border-[#00f2fe]/15 p-10 shadow-xl rounded-[24px]">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#00f2fe] border-b border-[#00f2fe]/10 pb-6 mb-8">USER_PROFILE</h3>
                <div className="space-y-10">
                   <div className="flex items-center gap-8">
                      <div className="w-24 h-24 bg-[#00f2fe] flex items-center justify-center text-[#05112e] text-4xl font-black italic rounded-xl">
                        {user?.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-3xl font-black text-white uppercase tracking-tighter">{user?.username}</p>
                        <p className="text-[10px] font-black text-[#00f2fe] uppercase tracking-[0.4em] mt-2">{user?.role} ACCESS_LEVEL</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-[#05112e] border border-[#00f2fe]/10 rounded-xl">
                         <p className="text-[10px] font-black text-[#38bdf8] uppercase tracking-widest mb-2">SESSION_ID</p>
                         <p className="text-sm font-mono font-bold text-white tracking-widest leading-none">
                           {user?.role === 'student' ? user.studentData?.studentId : 'ADMIN_ROOT'}
                         </p>
                      </div>
                      <div className="p-6 bg-[#05112e] border border-[#00f2fe]/10 rounded-xl">
                         <p className="text-[10px] font-black text-[#38bdf8] uppercase tracking-widest mb-2">LAST_LOGIN</p>
                         <p className="text-sm font-bold text-white uppercase">{new Date().toLocaleString()} UTC</p>
                      </div>
                   </div>
                </div>
              </div>

               <div className="bg-[#0a1b44] border border-[#00f2fe]/15 p-10 shadow-xl rounded-[24px]">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#00f2fe] border-b border-[#00f2fe]/10 pb-6 mb-8">SECURITY_PROTOCOLS</h3>
                <div className="space-y-10">
                    <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#8fa3c7]/60 px-1">UPDATE_PASSWORD</p>
                     <div className="flex gap-4">
                       <input 
                         id="new-pass-input"
                         type="password" 
                         className="flex-1 h-14 bg-[#05112e] border border-[#00f2fe]/15 px-6 outline-none font-bold text-sm text-white focus:border-[#00f2fe] rounded-xl" 
                         placeholder="Min 6 characters"
                       />
                       <button 
                         onClick={async () => {
                           const input = document.getElementById('new-pass-input') as HTMLInputElement;
                           if (input && input.value.length >= 6) {
                             const success = await updatePassword(input.value);
                             if (success) {
                               alert('Password updated successfully.');
                               input.value = '';
                             } else {
                               alert('Update failed.');
                             }
                           } else {
                             alert('Invalid password length.');
                           }
                         }}
                         className="px-8 bg-[#00f2fe] hover:bg-[#00c6ff] text-[#05112e] font-black uppercase tracking-widest text-[10px] transition-all rounded-xl shadow-lg"
                       >
                         CONFIRM
                       </button>
                     </div>
                   </div>

                   <button 
                     onClick={async () => {
                        await refreshData();
                        alert('Sync Complete.');
                     }}
                     className="w-full h-16 bg-[#05112e] border border-[#00f2fe]/10 px-8 flex items-center justify-between group hover:border-[#00f2fe]/30 transition-all rounded-xl"
                   >
                      <span className="text-[11px] font-black uppercase text-[#e2e8f0] group-hover:text-[#00f2fe] tracking-widest">SYNCHRONIZE_PROFILE</span>
                      <span className="text-[9px] font-black uppercase text-[#00f2fe]/40 italic tracking-widest">EXECUTE</span>
                   </button>

                   <div className="h-px bg-[#00f2fe]/10" />

                   <button 
                     onClick={toggleBiometric}
                     className={cn(
                       "w-full h-16 border px-8 flex items-center justify-between transition-all rounded-xl",
                       biometricEnabled ? "bg-[#00f2fe]/5 border-[#00f2fe] text-[#00f2fe]" : "bg-[#05112e] border-[#00f2fe]/15 text-[#e2e8f0]"
                     )}
                   >
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        {biometricEnabled ? "BIOMETRICS_ACTIVE" : "ENABLE_BIOMETRICS"}
                      </span>
                      <div className="w-12 h-6 flex items-center justify-center font-black text-[10px]">
                        {biometricEnabled ? "[ ON ]" : "[ OFF ]"}
                      </div>
                   </button>

                   <button 
                     onClick={toggleTransparency}
                     className={cn(
                       "w-full h-16 border px-8 flex items-center justify-between transition-all rounded-xl",
                       transparencyMode ? "bg-[#00f2fe]/5 border-[#00f2fe] text-[#00f2fe]" : "bg-[#05112e] border-[#00f2fe]/15 text-[#e2e8f0]"
                     )}
                   >
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        {transparencyMode ? "TRANSPARENCY_ON" : "TRANSPARENCY_OFF"}
                      </span>
                      <div className="w-12 h-6 flex items-center justify-center font-black text-[10px]">
                        {transparencyMode ? "[ ON ]" : "[ OFF ]"}
                      </div>
                   </button>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="bg-[#0a1b44] border border-[#00f2fe]/15 p-10 text-white shadow-xl rounded-[24px]">
                <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#00f2fe] mb-8 italic">SYSTEM_METRICS</h4>
                <div className="space-y-6">
                   <div className="p-6 bg-white/5 border border-white/10">
                      <p className="text-[10px] font-black uppercase text-white/40 mb-2">ENVIRONMENT</p>
                      <p className="text-xs font-bold text-[#00f2fe] uppercase tracking-widest">PRODUCTION_BUILD_V4.0.1</p>
                   </div>
                   <div className="p-6 bg-[#05112e] border border-[#00f2fe]/10 flex items-center justify-between rounded-xl">
                      <div>
                        <p className="text-[10px] font-black uppercase text-[#00f2fe]/40 mb-2">CLOUD_ENGINE</p>
                        <p className="text-xs font-bold text-emerald-500 tracking-widest uppercase">STABLE_ACADEMY_NODE</p>
                      </div>
                      <div className="w-2.5 h-2.5 bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                   </div>
                   
                   <div className="pt-6 border-t border-white/10 space-y-4">
                      <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.4em] mb-4">LIVE_ACADEMY_VOLUMES</p>
                      {dbStatus.map((stat, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                           <span className="text-[10px] text-white/60 font-bold uppercase tracking-tight">{stat.table}</span>
                           <span className="text-[11px] font-black text-[#00f2fe]">{stat.count}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      default: return <Dashboard onAction={setActiveSection} portalType={portalType} />;
    }
  };

  if (activeNotes) {
    return (
      <div className="fixed inset-0 bg-white z-[2000] w-screen h-screen flex flex-col animate-in fade-in duration-350">
        {/* Circular float Action Back Key */}
        <button 
          type="button"
          onClick={() => setActiveNotes(null)}
          className="fixed top-6 left-6 z-[2100] flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-black uppercase text-[10px] tracking-widest rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group cursor-pointer border border-gray-800 focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-white" />
          <span>Go Back</span>
        </button>
        
        {/* Embedded page reader full screen iframe preview */}
        <iframe 
          src={activeNotes.url} 
          title={activeNotes.title}
          className="w-full h-full border-0 bg-white"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05112e] flex flex-col text-[#8fa3c7] relative overflow-x-hidden selection:bg-blue-600 selection:text-white font-sans">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#05112e]" />
      
      {activeSection !== 'mentor' && <Navbar activeSection={activeSection} onSectionChange={handleSectionChange} />}
      
      {(user?.role === 'admin' || user?.email?.toLowerCase() === 'felixbrownz907@gmail.com') && activeSection !== 'sys-config' && activeSection !== 'mentor' && (
        <div className="fixed bottom-36 right-6 z-[1100] md:bottom-8 md:right-8 animate-bounce">
          <button 
            onClick={() => setActiveSection('sys-config')}
            className="w-14 h-14 bg-[#111827] border-2 border-[#cca01a] text-[#cca01a] rounded-full flex items-center justify-center hover:bg-[#cca01a] hover:text-[#111827] transition-all duration-300 shadow-[0_4px_25px_rgba(204,160,26,0.25)] active:scale-95 group"
          >
            <Settings className="w-6 h-6 animate-spin [animation-duration:12s] group-hover:rotate-180" />
          </button>
        </div>
      )}
      
      <div className={cn("flex-1 relative z-10", activeSection !== 'mentor' && "pt-32 bg-[#05112e]")}>
        {activeSection !== 'mentor' && (
          <div className="bg-[#0a1b44] border-y border-[#00f2fe]/15 h-10 flex items-center relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 px-8 bg-[#00f2fe] text-[#05112e] flex items-center justify-center z-20 font-black italic border-r border-[#00f2fe]/15">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] shrink-0">BROADCAST</span>
            </div>

            <div className="marquee flex whitespace-nowrap items-center h-full">
              <div className="animate-marquee inline-block py-2">
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-[0.3em] px-12 border-l border-[#00f2fe]/10">
                  {announcementMarquee || "Welcome to IT International Academy portal. System operational. All modules active."}
                </span>
                <span className="text-[11px] font-bold text-[#38bdf8] uppercase tracking-[0.3em] px-12 border-l border-[#00f2fe]/10">
                   Academic Session: {new Date().getFullYear()} Enrollment Open
                </span>
                {useAuth().announcements.slice(-3).map((anno, idx) => (
                  <span key={idx} className="text-[11px] font-bold text-[#00f2fe] uppercase tracking-[0.3em] px-12 border-l border-[#00f2fe]/10">
                    [NEWS] {anno.title}: {anno.content}
                  </span>
                ))}
              </div>
            </div>

            {canManageMarquee && (
              <button 
                onClick={() => {
                  setTempMarquee(announcementMarquee);
                  setIsEditingMarquee(true);
                }}
                className="absolute right-0 top-0 bottom-0 px-6 bg-[#05112e] text-[#00f2fe] hover:bg-[#00f2fe] hover:text-[#05112e] flex items-center justify-center z-20 transition-all border-l border-[#00f2fe]/15 font-black text-[10px]"
              >
                EDIT
              </button>
            )}
          </div>
        )}

        {isEditingMarquee && (
          <div className="fixed inset-0 bg-[#05112e]/85 backdrop-blur-md z-[1500] flex items-center justify-center p-4">
             <div className="bg-[#0a1b44] border border-[#00f2fe]/15 w-full max-w-xl p-10 shadow-[0_10px_45px_rgba(0,0,0,0.6)] rounded-2xl animate-in zoom-in-95 duration-300 text-white">
                <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter text-white">BULLETIN_MANAGER</h2>
                <textarea 
                  className="w-full h-40 p-6 bg-[#05112e] border border-[#00f2fe]/15 focus:border-[#00f2fe] font-bold text-sm mb-8 outline-none text-white placeholder:text-[#8fa3c7]/30 rounded-xl"
                  value={tempMarquee}
                  onChange={e => setTempMarquee(e.target.value)}
                  placeholder="Enter important announcement..."
                />
                <div className="flex gap-4">
                   <button 
                     onClick={() => {
                       updateMarquee(tempMarquee);
                       setIsEditingMarquee(false);
                     }}
                     className="flex-1 bg-[#00f2fe] hover:bg-[#00c6ff] text-[#05112e] py-5 font-black uppercase tracking-widest text-[11px] rounded-xl shadow-lg transition-all"
                   >
                     DEPLOY_MARQUEE
                   </button>
                   <button 
                     onClick={() => setIsEditingMarquee(false)}
                     className="px-10 bg-transparent border border-[#00f2fe]/10 text-white hover:bg-white/5 py-5 font-black uppercase tracking-widest text-[11px] rounded-xl transition-all"
                   >
                     CANCEL
                   </button>
                </div>
             </div>
          </div>
        )}
        
        <main className={cn(
          "mx-auto w-full flex-1 flex flex-col gap-16 transition-all duration-500",
          activeSection === 'mentor' ? "p-0 h-screen" : "px-4 sm:px-8 md:px-20 py-20 pb-56 max-w-7xl mx-auto"
        )}>
          {user?.role === 'student' && !attendance?.some(a => a.studentId === user.studentData?.studentId && new Date(a.date).toDateString() === new Date().toDateString()) && activeSection !== 'mentor' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-12 overflow-hidden"
            >
              <div className="bg-[#0a1b44] border border-[#00f2fe]/15 p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl rounded-[24px]">
                <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-black uppercase text-white tracking-tight italic">VERIFICATION_PENDING</h3>
                    <p className="text-[10px] font-black text-[#38bdf8] uppercase tracking-[0.4em]">Mark presence in academy registry to unlock all nodes.</p>
                </div>
                <button 
                  onClick={() => registerAttendance('DAILY_PORTAL_CHECKIN', {
                    program: studentCourse?.name || 'Academic Program',
                    duration: user?.studentData?.selectedDuration || 'Standard',
                    sessionTime: new Date().toLocaleTimeString()
                  })}
                  className="px-12 py-5 bg-[#00f2fe] hover:bg-[#00c6ff] text-[#05112e] font-black uppercase tracking-widest text-xs transition-all shadow-lg rounded-xl"
                >
                  CONFIRM_REGISTRY
                </button>
              </div>
            </motion.div>
          )}

          {activeSection !== 'dashboard' && activeSection !== 'mentor' && (
            <button
              onClick={() => setActiveSection('dashboard')}
              className="mb-12 w-fit px-10 py-5 bg-[#0a1b44] text-[#00f2fe] border border-[#00f2fe]/15 hover:border-[#00f2fe]/40 hover:text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl rounded-xl"
            >
              {"<"} BACK_TO_DIRECTORY
            </button>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={cn("h-full", activeSection === 'mentor' && "flex flex-col")}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {activeSection !== 'mentor' && (
          <footer className="bg-[#0a1b44] border-t border-[#00f2fe]/15 relative pt-24 pb-48 px-12 text-[#e2e8f0]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 relative z-10">
              <div className="md:col-span-2 space-y-12">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#00f2fe] text-[#05112e] flex items-center justify-center font-black text-xl italic rounded-xl border border-[#00f2fe]/10 shadow-lg shadow-[#00f2fe]/10">
                       ITIA
                    </div>
                    <div>
                      <h2 className="text-4xl font-black uppercase text-white tracking-tighter leading-none italic">IT INTERNATIONAL ACADEMY</h2>
                      <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#00f2fe]/60 mt-3">Technical Education Node</p>
                    </div>
                 </div>
                 <p className="text-[#8fa3c7] font-bold uppercase text-[12px] leading-relaxed max-w-lg tracking-tight">
                   Sovereign technical training and industry-aligned curricula. Operational since 2015. Node synchronized with global standards.
                 </p>
                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setActiveSection('about')} className="px-8 py-4 border border-[#00f2fe]/15 text-[#00f2fe] bg-[#05112e] hover:bg-[#00f2fe] hover:text-[#05112e] font-black uppercase tracking-widest text-[10px] transition-all rounded-xl">OVERVIEW</button>
                    <button onClick={() => setActiveSection('achievements')} className="px-8 py-4 border border-[#00f2fe]/15 text-[#00f2fe] bg-[#05112e] hover:bg-[#00f2fe] hover:text-[#05112e] font-black uppercase tracking-widest text-[10px] transition-all rounded-xl">NODES</button>
                 </div>
              </div>

              <div className="space-y-8">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#00f2fe]">CONTACT_RELAY</h3>
                 <div className="space-y-8">
                    <div className="group cursor-pointer">
                       <p className="text-[9px] font-black uppercase text-[#38bdf8] tracking-widest mb-2">OFFICIAL_COMMUNICATIONS</p>
                       <p className="text-sm font-black text-white group-hover:text-[#00f2fe] tracking-tight transition-colors">itinternationalacademy46@gmail.com</p>
                    </div>
                    <div className="group cursor-pointer">
                       <p className="text-[9px] font-black uppercase text-[#38bdf8] tracking-widest mb-2">SUPPORT_DESK</p>
                       <p className="text-sm font-black text-white group-hover:text-[#00f2fe] tracking-tight transition-colors">0766149405</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-10">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#00f2fe]">SYSTEM_INTEGRITY</h3>
                 <div className="p-8 bg-[#05112e] border border-[#00f2fe]/10 space-y-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="w-2.5 h-2.5 bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                       <span className="text-[10px] font-black text-[#00f2fe] uppercase tracking-widest">NODE_ACTIVE</span>
                    </div>
                    <p className="text-[9px] font-bold text-[#8fa3c7]/60 uppercase tracking-[0.25em] leading-[1.8]">
                      SOVEREIGNTY PROTOCOL V4.0.1 <br />
                      CLOUD_SYNC: OPERATIONAL <br />
                      ENCRYPTION: ACTIVE <br />
                      OVERSIGHT: NOMINAL
                    </p>
                 </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-[#00f2fe]/10 flex flex-col md:flex-row justify-between items-center gap-10">
               <p className="text-[10px] font-bold text-[#8fa3c7]/30 uppercase tracking-[0.5em]">© {new Date().getFullYear()} ITIA ACADEMY. SOVEREIGNTY_RESERVED.</p>
               <div className="flex gap-10">
                  <span className="text-[9px] font-black uppercase text-[#8fa3c7]/30 hover:text-[#00f2fe] transition-colors cursor-pointer tracking-widest leading-none">PRIVACY</span>
                  <span className="text-[9px] font-black uppercase text-[#8fa3c7]/30 hover:text-[#00f2fe] transition-colors cursor-pointer tracking-widest leading-none">SECURITY_AUDIT</span>
               </div>
            </div>
          </footer>
        )}
      </div>
      {/* BottomNav removed to prevent view congestion */}

      <AnimatePresence>
        {blockedCertificateBalance !== null && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a1b44] border-2 border-red-500/30 max-w-lg w-full rounded-[36px] p-10 text-center relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] font-sans text-white"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
              <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-3">graduation clearance blocked</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8] mb-6">Error Code: OUTSTANDING_BALANCE_DEBT</p>
              
              <div className="bg-[#05112e] border border-red-500/10 rounded-2xl p-6 mb-8 text-left">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 font-mono">Student Account Arrears</p>
                 <p className="text-3xl font-black text-red-500 italic tracking-tight font-mono">K{blockedCertificateBalance.toLocaleString()}</p>
                 <p className="text-xs font-semibold text-[#8fa3c7] mt-3 uppercase leading-relaxed text-left">
                   Your certificate has been securely compiled, but access is restricted due to outstanding tutoring fee debts. Please clear the remaining Kwacha balance at the financial registry desk to authorize immediate clearance.
                 </p>
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={() => {
                     setBlockedCertificateBalance(null);
                     setActiveSection('financial');
                   }}
                   className="flex-1 h-14 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                 >
                   Clear Balance Due
                 </button>
                 <button 
                   onClick={() => setBlockedCertificateBalance(null)}
                   className="px-8 h-14 bg-[#05112e] text-[#8fa3c7] hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] border border-[#00f2fe]/10 hover:border-[#00f2fe]/30 transition-all"
                 >
                   Acknowledge
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CO-NAV FLOATING INTELLIGENT COMPANIONS */}
      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col md:flex-row items-center gap-3">
        {/* 1A. OFFICIAL WHATSAPP GROUP */}
        <a 
          href="https://chat.whatsapp.com/FRcVEmyR9gBE0psXL7D72P?mlu=2&s=cl&p=a" 
          target="_blank" 
          rel="noreferrer"
          title="Join Official WhatsApp Group"
          className="group relative flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-[#128c7e] to-[#25d366] hover:from-[#25d366] hover:to-[#34bf49] text-white rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.3)] transition-all hover:scale-105 active:scale-95 border-2 border-white/20 focus:outline-none"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse opacity-20" />
          <Users className="w-5 h-5 text-white" />
        </a>

        {/* 1B. COMPACT WHATSAPP ASSISTANT (Reduced Size - Support 0766149405) */}
        <a 
          href="https://wa.me/260766149405?text=Hello%20IT%2520Academy%2520Portal%2520Assistant%2C%20I%20have%20a%20question%20about%20my%20enrolled%20academic%20program." 
          target="_blank" 
          rel="noreferrer"
          title="WhatsApp Support Chat (0766149405)"
          className="group relative flex items-center justify-center w-11 h-11 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.3)] transition-all hover:scale-105 active:scale-95 border-2 border-white/20 focus:outline-none"
        >
          <span className="absolute inset-0 rounded-full bg-[#25d366] animate-pulse opacity-10" />
          <MessageSquare className="w-5 h-5 fill-white text-[#25d366]" />
        </a>

        {/* 2. DYNAMIC FLOATING AI ACADEMY COMPANION BUTTON (visible to students) */}
        {isStudent && (
          <div className="relative">
            <button
              onClick={() => setIsAiOpen(!isAiOpen)}
              title="Speak to AI Student Assistant"
              className={cn(
                "group relative flex items-center justify-center w-11 h-11 rounded-full shadow-[0_4px_20px_rgba(0,242,254,0.3)] transition-all hover:scale-105 active:scale-95 border-2 border-white/20 focus:outline-none",
                isAiOpen 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-gradient-to-tr from-[#00f2fe] to-[#8b5cf6] text-white animate-pulse"
              )}
            >
              {isAiOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 animate-spin-slow text-white" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                </>
              )}
            </button>

            {/* FLOATING CHAT COMPONENT WINDOW */}
            <AnimatePresence>
              {isAiOpen && studentData && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed bottom-20 right-0 md:right-0 z-[2000] w-[350px] sm:w-[380px] h-[480px] bg-[#0c1a3b]/95 backdrop-blur-xl border border-[#00f2fe]/30 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#05112e] to-[#0c1f4e] border-b border-[#00f2fe]/20 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00f2fe] to-[#8b5cf6] flex items-center justify-center border border-[#00f2fe]/45 text-white shadow-inner">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Academy AI Copilot</h4>
                        <p className="text-[9px] text-[#00f2fe] uppercase font-black tracking-widest flex items-center gap-1.5 min-w-max">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Supabase Memory Synced
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsAiOpen(false)}
                      className="text-slate-400 hover:text-white transition-all p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Message log */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#030a1e]/40">
                    {/* Welcome message */}
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded bg-[#0c1f4e] border border-[#00f2fe]/20 flex items-center justify-center text-white shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-[#0c245c] border border-white/5 p-3 rounded-2xl rounded-tl-none max-w-[85%] text-[10.5px] leading-relaxed text-slate-200">
                        <p className="font-bold text-[#00f2fe] mb-1">Hello, {studentData.fullName}!</p>
                        I'm your persistent floating Academic Assistant. I remember our conversations permanently across devices. How can I help you today?
                      </div>
                    </div>

                    {/* Historical Messages */}
                    {floatAiMessages.map((item: any) => (
                      <React.Fragment key={item.id}>
                        {/* User statement */}
                        <div className="flex justify-end">
                          <div className="bg-[#00f2fe]/10 border border-[#00f2fe]/25 p-3 rounded-2xl rounded-tr-none max-w-[85%] text-[10.5px] leading-relaxed text-slate-100">
                            {item.message}
                          </div>
                        </div>

                        {/* Model reply */}
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded bg-[#0c1f4e] border border-[#00f2fe]/20 flex items-center justify-center text-white shrink-0">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <div className="bg-[#0c245c]/85 border border-white/5 p-3 rounded-2xl rounded-tl-none max-w-[85%] text-[10.5px] leading-relaxed text-slate-200 font-mono text-left">
                            {item.reply}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}

                    {/* Loading typing indicator */}
                    {isSending && (
                      <div className="flex gap-2 items-center">
                        <div className="w-6 h-6 rounded bg-[#0c1f4e] border border-[#00f2fe]/20 flex items-center justify-center text-white shrink-0">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-[#0c245c]/50 p-2.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#00f2fe] rounded-full animate-bounce delay-100" />
                          <span className="w-1.5 h-1.5 bg-[#00f2fe] rounded-full animate-bounce delay-200" />
                          <span className="w-1.5 h-1.5 bg-[#00f2fe] rounded-full animate-bounce delay-300" />
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Footer Input */}
                  <div className="p-3 bg-[#05112e] border-t border-[#00f2fe]/15 flex items-center gap-2">
                    <input 
                      type="text"
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendAiMessage();
                      }}
                      disabled={isSending}
                      className="flex-1 bg-[#091b42] border border-[#00f2fe]/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00f2fe]/50 disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendAiMessage}
                      disabled={isSending || !chatInput.trim()}
                      className="w-8 h-8 rounded-xl bg-[#00f2fe] hover:bg-[#00c6ff] text-[#05112e] flex items-center justify-center transition-all disabled:opacity-30 disabled:scale-100 scale-100 hover:scale-105 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
