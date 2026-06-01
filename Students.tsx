import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, Phone, BookOpen, Hash, MoreHorizontal, Bot, User, BarChart3, Clock, MapPin, X, Sparkles, TrendingUp, DollarSign, CheckCircle, Users, ShieldCheck, Zap, RefreshCw, ShieldAlert } from 'lucide-react';
import { Student } from '../context/types';
import { cn } from '../components/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Students({ initialTab }: { initialTab?: 'registry' | 'security' }) {
  const { students, courses, intakes, addStudent, updateStudent, deleteStudent, user, askMentor, refreshData, allProgress, toggleLessonCompletion, forceRegistryUpload, addNotification, isSyncing, addIntake } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingIntake, setIsAddingIntake] = useState(false);
  const [newIntakeName, setNewIntakeName] = useState('');
  const [isEnrolled, setIsEnrolled] = useState<{ studentId: string, pass: string } | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nrcError, setNrcError] = useState<string | null>(null);
  const [repairNRC, setRepairNRC] = useState('');
  const [repairId, setRepairId] = useState('');
  const [repairPass, setRepairPass] = useState('');

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'felixbrownz907@gmail.com';
  const canEdit = isAdmin || user?.role === 'staff';
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    nrc: '',
    courseId: courses[0]?.id || '',
    intakeId: intakes[0]?.id || '',
    phone: '',
    selectedDuration: '6 Months',
    preferredSession: 'Morning (08:00 - 12:00)',
    status: 'Active' as const,
    customStudentId: ''
  });

  const [activeTab, setActiveTab] = useState<'registry' | 'security'>(initialTab || 'registry');
  const [selectedCourseId, setSelectedCourseId] = useState<string | 'all'>('all');

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nrc || '').includes(searchTerm);
    
    const matchesCourse = selectedCourseId === 'all' || s.courseId === selectedCourseId;
    
    return matchesSearch && matchesCourse;
  }).sort((a, b) => {
    const courseA = courses.find(c => c.id === a.courseId)?.name || '';
    const courseB = courses.find(c => c.id === b.courseId)?.name || '';
    return courseA.localeCompare(courseB);
  });

  const cleanNRC = (nrc: string) => nrc.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setNrcError(null);

    // NRC Regex Validation: Relaxed to allow various formats while keeping standard as default
    const nrcRegex = /^(\d{6}\/\d{2}\/\d{1})|(\d{9})$/;
    if (!nrcRegex.test(formData.nrc) && formData.nrc.length < 9) {
      setNrcError("INVALID FORMAT: Use XXXXXX/XX/X or 9 digits.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Check for duplicate NRC in registry
      const normalizedNRC = cleanNRC(formData.nrc);
      const duplicate = students.find(s => cleanNRC(s.nrc || '') === normalizedNRC);
      if (duplicate) {
        alert(`IDENTIFICATION CONFLICT: This NRC (${formData.nrc}) already exists in the registry under ID ${duplicate.studentId}. Duplicate enrollment blocked.`);
        setIsAnalyzing(false);
        return;
      }

      const result = await addStudent({ 
        ...formData,
        studentId: formData.customStudentId || undefined 
      } as any);
      setIsEnrolled(result);
      setIsAdding(false);
      setFormData({
        fullName: '',
        email: '',
        nrc: '',
        courseId: courses[0]?.id || '',
        intakeId: intakes[0]?.id || '',
        phone: '',
        selectedDuration: '6 Months',
        preferredSession: 'Morning (08:00 - 12:00)',
        status: 'Active',
        customStudentId: ''
      });
      // Force refresh to ensure list is updated from cloud if needed
      await refreshData();
    } catch (err: any) {
      console.error("Enrollment failed:", err);
      alert(err.message || "Enrollment failed. Please check network connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAnalysis = async (student: Student) => {
    setIsAnalyzing(true);
    const analysis = await askMentor([{ role: 'user', content: `Analyze this student's performance: Name: ${student.fullName}, Course Progress: ${student.progress}%, Labs: ${student.labProgress || 0}%, Attendance: ${student.attendanceProgress || 0}%. Provide a world-class educational consultant review for the Academic Board at IT INTERNATIONAL ACADEMY.` }]);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const isStudent = user?.role === 'student';

  if (isStudent) {
    const studentProfile = students.find(s => s.studentId === user?.studentData?.studentId) || user?.studentData;
    const course = courses.find(c => c.id === studentProfile?.courseId);
    const intake = intakes.find(i => i.id === studentProfile?.intakeId);
    
    // Find completed lessons mapping
    const studentCompletions = allProgress.filter(p => p.student_id === studentProfile?.studentId).map(p => p.lesson_id);
    const studentSubmissions = useAuth().submissions?.filter(sub => sub.studentId === studentProfile?.studentId) || [];
    
    return (
      <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-28 text-left">
        {/* Header Block styled for Dark Blue Canvas */}
        <div className="border-b border-[#00f2fe]/15 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-[#00f2fe] mb-2">STUDENT_OFFICE_OFFICIAL</p>
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white leading-none">
              Academic Transcript
            </h1>
            <p className="text-[#38bdf8] font-bold mt-2 uppercase tracking-widest text-[10px]">
              IT INTERNATIONAL ACADEMY // ENROLLED CANDIDATE DOSSIER
            </p>
          </div>
          
          <button 
            onClick={async () => {
              await refreshData();
              alert("TRANSCRIPT_SYNC: Academic registry nodes successfully validated.");
            }}
            className="h-12 bg-[#05112e] hover:bg-[#00f2fe] hover:text-[#05112e] text-[#00f2fe] border border-[#00f2fe]/15 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2.5 transition-all focus:outline-none"
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            Sync Registry Status
          </button>
        </div>

        {/* Profile Details Block */}
        <div className="bg-[#0a1b44] border border-[#00f2fe]/10 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-8 gap-3">
             <div className="w-20 h-20 bg-[#00f2fe]/10 rounded-2xl flex items-center justify-center text-[#00f2fe] text-3xl font-black border border-[#00f2fe]/20">
               {studentProfile?.fullName ? studentProfile.fullName.charAt(0).toUpperCase() : 'U'}
             </div>
             <p className="text-sm font-black text-white text-center md:text-left">{studentProfile?.fullName || 'Academic Student'}</p>
             <p className="text-[10px] font-bold text-[#38bdf8] tracking-widest uppercase bg-[#05112e] px-3 py-1 rounded-full border border-[#00f2fe]/5">{studentProfile?.studentId || 'GEN-STUDENT'}</p>
          </div>

          <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-[#05112e]/50 p-5 rounded-xl border border-[#00f2fe]/5">
              <span className="text-[9px] font-black text-[#8fa3c7] uppercase tracking-wider block mb-1">REGISTERED PROGRAM</span>
              <p className="text-xs font-black text-white uppercase">{course?.name || 'Technical Course Node'}</p>
              <p className="text-[9px] font-semibold text-[#38bdf8] uppercase mt-1">Duration: {studentProfile?.selectedDuration || 'Standard'}</p>
            </div>

            <div className="bg-[#05112e]/50 p-5 rounded-xl border border-[#00f2fe]/5">
              <span className="text-[9px] font-black text-[#8fa3c7] uppercase tracking-wider block mb-1">INTAKE SESSION</span>
              <p className="text-xs font-black text-white uppercase">{intake?.name || 'Class Session Node'}</p>
              <p className="text-[9px] font-semibold text-[#38bdf8] uppercase mt-1">Preferred: {(studentProfile as any)?.preferredSession || 'Morning Schedule'}</p>
            </div>

            <div className="bg-[#05112e]/50 p-5 rounded-xl border border-[#00f2fe]/5">
              <span className="text-[9px] font-black text-[#8fa3c7] uppercase tracking-wider block mb-1">REGISTRY STATUS</span>
              <p className="text-xs font-black text-[#00f2fe] uppercase italic pt-0.5 leading-none block">● {studentProfile?.status || 'Active'}</p>
              <p className="text-[9px] font-semibold text-[#38bdf8] uppercase mt-1">Finance: {studentProfile?.paymentStatus || 'Cleared'}</p>
            </div>

            <div className="bg-[#05112e]/50 p-5 rounded-xl border border-[#00f2fe]/5">
              <span className="text-[9px] font-black text-[#8fa3c7] uppercase tracking-wider block mb-1">NATIONAL IDENTIFIER NRC</span>
              <p className="text-xs font-mono font-bold text-white tracking-widest">{studentProfile?.nrc || 'ZAMBIAN_NRC'}</p>
            </div>

            <div className="bg-[#05112e]/50 p-5 rounded-xl border border-[#00f2fe]/5">
              <span className="text-[9px] font-black text-[#8fa3c7] uppercase tracking-wider block mb-1">PRIMARY CONTACT MOB</span>
              <p className="text-xs font-mono font-bold text-white">{studentProfile?.phone || 'Pending Number'}</p>
            </div>

            <div className="bg-[#05112e]/50 p-5 rounded-xl border border-[#00f2fe]/5">
              <span className="text-[9px] font-black text-[#8fa3c7] uppercase tracking-wider block mb-1">OFFICIAL EMAIL</span>
              <p className="text-xs font-bold text-white truncate">{studentProfile?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Real-time Performance Metrics Bar Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a1b44] border border-[#00f2fe]/10 rounded-2xl p-6 flex items-center justify-between gap-4">
             <div className="text-left">
                <span className="text-[9px] font-black text-[#8fa3c7] uppercase tracking-widest block mb-1">COURSE CURRICULUM</span>
                <p className="text-xl font-black text-white italic">{studentProfile?.progress || 0}%</p>
                <div className="w-28 h-1.5 bg-[#05112e] rounded-full overflow-hidden mt-2 border border-[#00f2fe]/5">
                   <div style={{ width: `${studentProfile?.progress || 0}%` }} className="h-full bg-gradient-to-r from-[#00f2fe] to-[#38bdf8] rounded-full" />
                </div>
             </div>
             <div className="w-11 h-11 bg-[#00f2fe]/5 border border-[#00f2fe]/10 rounded-xl flex items-center justify-center text-[#00f2fe]">
               <BookOpen className="w-5 h-5" />
             </div>
          </div>

          <div className="bg-[#0a1b44] border border-[#00f2fe]/10 rounded-2xl p-6 flex items-center justify-between gap-4">
             <div className="text-left">
                <span className="text-[9px] font-black text-[#8fa3c7] uppercase tracking-widest block mb-1">LABS & PRACTICAL NODES</span>
                <p className="text-xl font-black text-white italic">{studentProfile?.labProgress || 0}%</p>
                <div className="w-28 h-1.5 bg-[#05112e] rounded-full overflow-hidden mt-2 border border-[#00f2fe]/5">
                   <div style={{ width: `${studentProfile?.labProgress || 0}%` }} className="h-full bg-gradient-to-r from-[#00f2fe] to-[#38bdf8] rounded-full" />
                </div>
             </div>
             <div className="w-11 h-11 bg-[#00f2fe]/5 border border-[#00f2fe]/10 rounded-xl flex items-center justify-center text-[#38bdf8]">
               <Zap className="w-5 h-5" />
             </div>
          </div>

          <div className="bg-[#0a1b44] border border-[#00f2fe]/10 rounded-2xl p-6 flex items-center justify-between gap-4">
             <div className="text-left">
                <span className="text-[9px] font-black text-[#8fa3c7] uppercase tracking-widest block mb-1">ACADEMY REGISTRY ATTENDANCE</span>
                <p className="text-xl font-black text-white italic">{studentProfile?.attendanceProgress || 0}%</p>
                <div className="w-28 h-1.5 bg-[#05112e] rounded-full overflow-hidden mt-2 border border-[#00f2fe]/5">
                   <div style={{ width: `${studentProfile?.attendanceProgress || 0}%` }} className="h-full bg-gradient-to-r from-[#00f2fe] to-[#38bdf8] rounded-full" />
                </div>
             </div>
             <div className="w-11 h-11 bg-[#00f2fe]/5 border border-[#00f2fe]/10 rounded-xl flex items-center justify-center text-emerald-400">
               <ShieldCheck className="w-5 h-5" />
             </div>
          </div>
        </div>

        {/* Detailed Module Transcript Listing */}
        <div className="bg-[#0a1b44] border border-[#00f2fe]/10 rounded-[28px] overflow-hidden">
           <div className="p-6 bg-[#05112e]/50 border-b border-[#00f2fe]/10 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Module Transcript Records</h3>
              <span className="text-[9px] font-mono uppercase text-[#38bdf8] tracking-widest bg-[#05112e] border border-[#00f2fe]/15 px-3 py-1.5 rounded-lg">VERIFIED DATA FEED</span>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-[#00f2fe]/5">
                       <th className="p-5 text-[10px] font-black text-[#38bdf8] uppercase tracking-widest bg-transparent">Module Title</th>
                       <th className="p-5 text-[10px] font-black text-[#38bdf8] uppercase tracking-widest bg-transparent">Completed Units</th>
                       <th className="p-5 text-[10px] font-black text-[#38bdf8] uppercase tracking-widest bg-transparent">Performance Index</th>
                       <th className="p-5 text-[10px] font-black text-[#38bdf8] uppercase tracking-widest bg-transparent text-right">Academic Appraisal</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#00f2fe]/5">
                    {course?.modules && course.modules.length > 0 ? (
                      course.modules.map((mod, idx) => {
                         const lessonsTotal = mod.lessons?.length || 0;
                         const lessonsCompleted = mod.lessons?.filter(les => studentCompletions.includes(les.id)).length || 0;
                         const isModuleCompleted = lessonsTotal > 0 && lessonsCompleted === lessonsTotal;
                         
                         // Determine custom grading based on completion and submission scores
                         const moduleSubmissions = studentSubmissions.filter(sub => sub.moduleId === mod.id);
                         const bestScore = moduleSubmissions.find(sub => sub.grade && sub.grade.length < 3)?.grade || 
                                           (isModuleCompleted ? 'DISTINCTION (A)' : lessonsCompleted > 0 ? 'CREDIT (B)' : 'PENDING');

                         return (
                            <tr key={mod.id} className="hover:bg-[#05112e]/30 transition-all font-mono">
                               <td className="p-5">
                                  <div className="text-xs font-black text-white uppercase">Module {idx + 1}: {mod.title}</div>
                                  <div className="text-[10px] text-[#8fa3c7] uppercase mt-1 font-bold">Order Index: MODULE_NODE_0{mod.order || idx + 1}</div>
                               </td>
                               <td className="p-5">
                                  <div className="text-xs font-bold text-white">{lessonsCompleted} / {lessonsTotal} Units</div>
                                  <div className="w-24 h-1 bg-[#05112e] rounded-full mt-1.5 overflow-hidden border border-[#00f2fe]/5">
                                     <div style={{ width: `${lessonsTotal > 0 ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0}%` }} className="h-full bg-[#00f2fe]" />
                                  </div>
                               </td>
                               <td className="p-5">
                                  <div className="text-xs font-black text-[#38bdf8]">{bestScore}</div>
                                  {moduleSubmissions.length > 0 && (
                                    <div className="text-[8px] text-[#8fa3c7] font-bold uppercase mt-1">Graded Tasks: {moduleSubmissions.length}</div>
                                  )}
                               </td>
                               <td className="p-5 text-right">
                                  <span className={cn(
                                    "px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase border leading-none inline-block",
                                    isModuleCompleted 
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" 
                                      : lessonsCompleted > 0 
                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/15" 
                                        : "bg-[#05112e] text-[#8fa3c7] border-[#00f2fe]/10"
                                  )}>
                                     {isModuleCompleted ? 'GRADUATED' : lessonsCompleted > 0 ? 'IN_PROGRESS' : 'LOCKED'}
                                  </span>
                               </td>
                            </tr>
                         );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-xs font-black text-[#8fa3c7] uppercase tracking-widest">
                          NULL_MODULES_DETECTED
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Advisory board AI analysis block */}
        <div className="bg-[#0a1b44] border border-[#00f2fe]/10 rounded-[32px] p-8 md:p-10 text-left space-y-6">
           <div>
              <p className="text-[9px] font-black tracking-[0.45em] text-[#00f2fe] uppercase">BOARD_ROOM_AI_ADVISORY</p>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight italic mt-1 font-mono">Academic Consultation Terminal</h2>
              <p className="text-xs text-[#8fa3c7] font-semibold leading-relaxed uppercase mt-2">
                 Interrogate the Executive Advisory Board AI to construct a global analysis of your training dossier, exam history, and professional development.
              </p>
           </div>

           <button
             onClick={() => runAnalysis(studentProfile as any)}
             disabled={isAnalyzing}
             className="px-8 py-4 bg-[#00f2fe] text-[#05112e] font-black uppercase tracking-widest text-[10px] hover:bg-[#00c6ff] transition-all rounded-xl shadow-lg shadow-[#00f2fe]/10 active:scale-95 disabled:opacity-50"
           >
             {isAnalyzing ? 'SUMMONING ACADEMIC BOARD REVIEW...' : 'LAUNCH AI APPRAISAL'}
           </button>

           <AnimatePresence>
              {aiAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#05112e] border border-[#00f2fe]/20 p-8 rounded-2xl relative overflow-hidden"
                >
                  <span className="text-[9px] font-mono font-black uppercase text-[#00f2fe] border border-[#00f2fe]/20 bg-[#05112e] px-2.5 py-1 rounded-md mb-4 inline-block tracking-widest">[ ADVISORY_REPORT_MEMO ]</span>
                  <div className="text-sm text-white font-medium whitespace-pre-line leading-relaxed custom-scrollbar max-h-96 overflow-y-auto">
                    {aiAnalysis}
                  </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Registry Control Node</p>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 leading-none">
            Academic Records
          </h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">
             IT INTERNATIONAL ACADEMY // NRC POLICY VERIFIED (LONG-TERM MEMORY ENABLED)
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {isAdmin && (
            <div className="hidden xl:flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 animate-pulse">
               <ShieldCheck className="w-5 h-5 text-emerald-500" />
               <div className="text-left">
                  <p className="text-[9px] font-black text-emerald-600 uppercase leading-none">NRC Global Policy</p>
                  <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Registry Permanence Active</p>
               </div>
            </div>
          )}
          <div className="relative group flex-1 min-w-[300px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              className="w-full h-14 bg-white border-2 border-gray-100 pl-16 pr-6 rounded-[20px] shadow-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm"
              placeholder="Search Student ID, Name or NRC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddingIntake(true)}
            className="h-14 bg-white border-2 border-slate-100 text-slate-500 px-8 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-sm hover:border-primary hover:text-primary active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> New Intake
          </button>
          <button 
            onClick={async () => {
              await refreshData();
              addNotification('Registry Synchronized', 'Identity nodes re-aligned with cloud master.', 'success');
            }}
            className="h-14 bg-primary text-secondary px-8 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} /> Cloud Sync
          </button>
          <button 
            onClick={async () => {
              if (window.confirm("CRITICAL_RECOVERY_PROTOCOL: This will force-merge all local identity nodes into the cloud registry. This is the master repair key. Proceed?")) {
                 await forceRegistryUpload();
                 addNotification('Protocol Success', 'Global registry nodes re-anchored.', 'success');
              }
            }}
            className="h-14 bg-secondary text-primary px-8 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl active:scale-95 transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-red-500" />
            Repair Root Node
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="h-14 bg-primary hover:bg-gray-900 text-white px-8 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl active:scale-95 transition-all shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Register Student
          </button>
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('security')}
              className="h-14 bg-secondary text-primary px-8 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              <ShieldCheck className="w-4 h-4" /> Manage Passwords
            </button>
          )}
        </div>
      </div>

      {/* STATISTICS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Admissions', value: students.length, color: 'text-primary', icon: Users, bg: 'bg-primary/5' },
           { label: 'Active Progress', value: `${Math.round(students.reduce((acc, s) => acc + (s.progress || 0), 0) / (students.length || 1))}%`, color: 'text-emerald-500', icon: TrendingUp, bg: 'bg-emerald-50' },
           { label: 'Fiscal Clearance', value: students.filter(s => s.paymentStatus === 'Cleared').length, color: 'text-blue-500', icon: DollarSign, bg: 'bg-blue-50' },
           { label: 'Pending Audit', value: students.filter(s => s.status !== 'Active').length, color: 'text-amber-500', icon: Clock, bg: 'bg-amber-50' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-sm flex items-center gap-6 group hover:border-primary/20 transition-all">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", stat.bg, stat.color)}>
                 <stat.icon className="w-7 h-7" />
              </div>
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                 <p className={cn("text-2xl font-black italic tracking-tighter leading-none", stat.color)}>{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* PROGRAM SELECTION GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <button
          onClick={() => setSelectedCourseId('all')}
          className={cn(
            "p-6 rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between aspect-square group",
            selectedCourseId === 'all' 
              ? "bg-gray-900 border-primary shadow-2xl shadow-black/20" 
              : "bg-white border-gray-100 hover:border-primary/20"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
            selectedCourseId === 'all' ? "bg-primary text-white" : "bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className={cn(
              "text-[8px] font-black uppercase tracking-[0.2em] mb-1",
              selectedCourseId === 'all' ? "text-primary" : "text-gray-400"
            )}>All Students</p>
            <h3 className={cn(
              "text-lg font-black italic uppercase leading-none",
              selectedCourseId === 'all' ? "text-white" : "text-gray-900"
            )}>All Courses</h3>
            <p className={cn(
              "text-[10px] font-bold mt-2",
              selectedCourseId === 'all' ? "text-gray-400" : "text-primary"
            )}>{students.length} Students</p>
          </div>
        </button>

        {courses.map(course => {
          const count = students.filter(s => s.courseId === course.id).length;
          const isActive = selectedCourseId === course.id;
          return (
            <button
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={cn(
                "p-6 rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between aspect-square group relative overflow-hidden",
                isActive 
                  ? "bg-primary border-primary shadow-2xl shadow-primary/20" 
                  : "bg-white border-gray-100 hover:border-primary/20"
              )}
            >
              {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />}
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative z-10",
                isActive ? "bg-white text-primary" : "bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <p className={cn(
                  "text-[8px] font-black uppercase tracking-[0.2em] mb-1",
                  isActive ? "text-white/60" : "text-gray-400"
                )}>Program</p>
                <h3 className={cn(
                  "text-base font-black italic uppercase leading-tight tracking-tighter truncate",
                  isActive ? "text-white" : "text-gray-900"
                )}>{course.name}</h3>
                <p className={cn(
                  "text-[10px] font-bold mt-2",
                  isActive ? "text-white" : "text-primary"
                )}>{count} Students</p>
              </div>
            </button>
          );
        })}
      </div>

      {isAdmin && (
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('registry')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'registry' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Student List
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'security' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Security & Credentials
          </button>
        </div>
      )}

      {activeTab === 'security' && isAdmin ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
           <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div>
                <h3 className="text-xl font-black italic uppercase italic tracking-tight">Credential Management</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Manage student login credentials and overrides</p>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={() => {
                     const text = students.map(s => `${s.fullName}\tID: ${s.studentId}\tPass: ${s.password}\tNRC: ${s.nrc}`).join('\n');
                     navigator.clipboard.writeText(text);
                     alert("DATA COPIED: All student credentials copied to clipboard.");
                   }}
                   className="h-10 bg-secondary text-white px-6 rounded-xl font-black uppercase tracking-widest text-[8px] flex items-center gap-2"
                 >
                   Export Credentials
                 </button>
              </div>
           </div>

           {/* DIRECT REPAIR CONSOLE */}
            <div className="p-6 bg-primary/5 border-b border-primary/10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-primary/10 shadow-sm col-span-1 md:col-span-3">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                       <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Update Login Info</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Search by NRC</label>
                       <input 
                         type="text" 
                         className="w-full h-10 bg-gray-50 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                         placeholder="NRC Lookup..."
                         onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-gray-400 ml-1">New ID</label>
                       <input 
                         id="repair-id"
                         type="text" 
                         className="w-full h-10 bg-gray-50 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                         placeholder="Override ID..."
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-gray-400 ml-1">New Password</label>
                       <input 
                         id="repair-pass"
                         type="text" 
                         className="w-full h-10 bg-gray-50 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                         placeholder="Override Pass..."
                       />
                    </div>
                    <div className="flex items-end">
                       <button 
                         onClick={() => {
                           const targetNRC = searchTerm;
                           const target = students.find(s => s.nrc === targetNRC);
                           const newId = (document.getElementById('repair-id') as HTMLInputElement).value;
                           const newPass = (document.getElementById('repair-pass') as HTMLInputElement).value;
                           
                           if (!target) {
                             alert("ERROR: Student not found with this NRC.");
                             return;
                           }
                           if (!newId && !newPass) {
                             alert("ERROR: Please provide a new ID or Password.");
                             return;
                           }
                           
                           updateStudent({
                             ...target,
                             studentId: newId || target.studentId,
                             password: newPass || target.password
                           });
                           alert(`SUCCESS: Login info updated for ${target.fullName}.`);
                         }}
                         className="w-full h-10 bg-primary text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-primary/20"
                       >
                         Sync Credentials
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* GROUPED SECURITY VIEW */}
           <div className="space-y-12">
              {courses
                .filter(c => selectedCourseId === 'all' || c.id === selectedCourseId)
                .map(course => {
                  const courseStudents = filteredStudents.filter(s => s.courseId === course.id);
                  if (courseStudents.length === 0) return null;

                  return (
                    <div key={course.id + '-security'} className="space-y-4">
                       <div className="flex items-center gap-4 px-8 pt-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{course.name} Credentials</span>
                          <div className="h-px bg-gray-100 flex-1" />
                       </div>
                       <div className="overflow-x-auto">
                         <table className="w-full text-left">
                           <thead>
                             <tr className="bg-gray-100/50">
                               <th className="px-8 py-4 text-[9px] font-black uppercase text-gray-400">Student Name</th>
                               <th className="px-8 py-4 text-[9px] font-black uppercase text-gray-400">Student ID</th>
                               <th className="px-8 py-4 text-[9px] font-black uppercase text-gray-400">Password</th>
                               <th className="px-8 py-4 text-[9px] font-black uppercase text-gray-400">NRC Number</th>
                               <th className="px-8 py-4 text-right text-[9px] font-black uppercase text-gray-400">Actions</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                             {courseStudents.map(s => (
                               <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                 <td className="px-8 py-4">
                                    <div className="flex flex-col">
                                       <span className="text-sm font-bold text-gray-900">{s.fullName}</span>
                                       <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{s.email}</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-4">
                                    <button 
                                      onClick={() => {
                                         const newID = prompt(`Override Student ID for ${s.fullName}:`, s.studentId);
                                         if (newID) updateStudent({...s, studentId: newID});
                                      }}
                                      className="text-[10px] font-black bg-gray-900 text-white px-2 py-1 rounded-lg uppercase tracking-widest hover:bg-primary transition-colors cursor-pointer"
                                    >
                                      {s.studentId}
                                    </button>
                                 </td>
                                 <td className="px-8 py-4">
                                    <button 
                                       onClick={() => {
                                          const newPass = prompt(`Override Password for ${s.fullName}:`, s.password);
                                          if (newPass) updateStudent({...s, password: newPass});
                                       }}
                                       className="text-[10px] font-black text-primary px-2 py-1 bg-primary/5 rounded-lg border border-primary/20 tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer"
                                    >
                                       {s.password}
                                    </button>
                                 </td>
                                 <td className="px-8 py-4 text-[10px] font-bold text-gray-400 font-mono flex items-center gap-2">
                                    {s.nrc}
                                    <span title="NRC Policy Compliant">
                                       <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    </span>
                                 </td>
                                 <td className="px-8 py-4 text-right">
                                   <button 
                                     onClick={() => {
                                        const newPass = Math.floor(100000 + Math.random() * 900000).toString();
                                        if (window.confirm(`Generate random flash protocol update for ${s.fullName}? New pass will be: ${newPass}`)) {
                                           updateStudent({...s, password: newPass});
                                        }
                                     }}
                                     className="text-[9px] font-black uppercase text-primary hover:underline flex items-center justify-end gap-2"
                                   >
                                     <Sparkles className="w-3 h-3" />
                                     Flash Reset
                                   </button>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                    </div>
                  );
                })}
           </div>
        </div>
      ) : (
        <>
          {/* INTAKE MODAL */}
      {isAddingIntake && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl"
            onClick={() => setIsAddingIntake(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-right">
              <button 
                onClick={() => setIsAddingIntake(false)}
                className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all ml-auto"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-10 pr-12">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Registry Expansion</p>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">New Program Intake</h2>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Intake Designation</label>
                  <input 
                    className="w-full h-14 bg-gray-50 border-0 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold"
                    placeholder="e.g. MAY - JUNE 2026"
                    value={newIntakeName}
                    onChange={(e) => setNewIntakeName(e.target.value)}
                  />
               </div>

               <button 
                 onClick={async () => {
                   if (!newIntakeName) return;
                   await addIntake({
                     id: crypto.randomUUID(),
                     name: newIntakeName,
                     startDate: new Date().toISOString()
                   });
                   addNotification('Registry Updated', `New Intake [${newIntakeName}] authorized.`, 'success');
                   setIsAddingIntake(false);
                   setNewIntakeName('');
                 }}
                 className="w-full h-14 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <Plus className="w-5 h-5" /> Initialize Intake
               </button>
            </div>
          </motion.div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border-2 border-primary shadow-2xl animate-in zoom-in-95 duration-200">
           <h2 className="text-xl font-black italic mb-6 uppercase">New Student Onboarding</h2>
           <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Full Identity</label>
               <input required className="w-full h-14 bg-gray-50 border-0 px-4 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
             </div>
             <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Email Address</label>
               <input required type="email" className="w-full h-14 bg-gray-50 border-0 px-4 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             </div>
             <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">NRC Identification</label>
               <input 
                 required 
                 className={cn(
                   "w-full h-14 bg-gray-50 border-0 px-4 rounded-xl outline-none focus:ring-2 font-bold transition-all",
                   nrcError ? "ring-2 ring-red-500 bg-red-50" : "focus:ring-primary"
                 )} 
                 placeholder="XXXXXX/XX/X"
                 value={formData.nrc} 
                 onChange={e => {
                   setFormData({...formData, nrc: e.target.value});
                   if (nrcError) setNrcError(null);
                 }} 
               />
               {nrcError && <p className="text-[8px] font-black text-red-500 uppercase tracking-widest px-1">{nrcError}</p>}
             </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">ITA Identification Code</label>
                <div className="w-full h-14 bg-gray-100 border-0 px-4 rounded-xl flex flex-col justify-center font-black italic text-secondary">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">
                    {formData.customStudentId ? "MANUAL OVERRIDE DETECTED" : "NRC-Based ID Strategy"}
                  </span>
                  {formData.customStudentId ? (
                    formData.customStudentId
                  ) : formData.nrc.length >= 6 ? (
                    `202600${formData.nrc.trim().toUpperCase()}`
                  ) : (
                    "AWAITING NRC INPUT..."
                  )}
                </div>
              </div>
             <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Academic Module</label>
               <select 
                 className="w-full h-14 bg-gray-50 border-0 px-4 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold" 
                 value={formData.courseId} 
                 onChange={e => {
                   const cId = e.target.value;
                   const selectedCourseObj = courses.find(c => c.id === cId);
                   let duration = "6 Months";
                   if (selectedCourseObj) {
                     duration = selectedCourseObj.duration === "6 Weeks" ? "6 Weeks" : (selectedCourseObj.duration === "3 Months" ? "3 Months" : "6 Months");
                   }
                   setFormData({...formData, courseId: cId, selectedDuration: duration});
                 }}
               >
                 {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
             <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Scheduled Intake</label>
               <select className="w-full h-14 bg-gray-50 border-0 px-4 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold" value={formData.intakeId} onChange={e => setFormData({...formData, intakeId: e.target.value})}>
                 {intakes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
               </select>
             </div>
             <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Communication Relay (Phone)</label>
               <input required className="w-full h-14 bg-gray-50 border-0 px-4 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
             </div>
             <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Manual node Override (Optional)</label>
                <input 
                  className="w-full h-14 bg-gray-50 border-0 px-4 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold placeholder:text-gray-300" 
                  placeholder="Set Custom Student ID..."
                  value={formData.customStudentId} 
                  onChange={e => setFormData({...formData, customStudentId: e.target.value})} 
                />
                <p className="text-[8px] font-bold text-primary uppercase tracking-widest px-1 italic">Leave blank for NRC-based auto-generation</p>
              </div>
             <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Selected Program Duration</label>
               <select 
                 className="w-full h-14 bg-gray-50 border-0 px-4 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold" 
                 value={formData.selectedDuration} 
                 onChange={e => setFormData({...formData, selectedDuration: e.target.value})}
               >
                 {(() => {
                   const selectedCourseObj = courses.find(c => c.id === formData.courseId);
                   const courseDuration = selectedCourseObj?.duration || "6 Months";
                   if (courseDuration === "6 Weeks") {
                     return (
                       <>
                         <option value="6 Weeks">6 Weeks (Intensive)</option>
                         <option value="Self-Paced">Self-Paced (Introductory)</option>
                       </>
                     );
                   } else if (courseDuration === "3 Months") {
                     return <option value="3 Months">3 Months (Standard)</option>;
                   } else {
                     return <option value="6 Months">6 Months (Advanced & Professional)</option>;
                   }
                 })()}
               </select>
             </div>
             <div className="flex items-end pb-1">
               <div className="flex gap-4 w-full">
                 <button type="submit" disabled={isAnalyzing} className="flex-1 bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50">
                    {isAnalyzing ? 'Synchronizing...' : 'Activate Record'}
                 </button>
                 <button type="button" onClick={() => setIsAdding(false)} className="px-8 bg-gray-100 text-gray-400 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
               </div>
             </div>
           </form>
        </div>
      )}

      {isEnrolled && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-md w-full rounded-[32px] p-8 text-center shadow-2xl border border-primary/20"
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-emerald-500/20">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Enrollment Success</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Credentials generated and synced to master node.</p>
            
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-primary/30 space-y-4 mb-8">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Student ID</p>
                <p className="text-3xl font-black text-secondary tracking-tighter">{isEnrolled.studentId}</p>
              </div>
              <div className="h-px bg-gray-200 w-1/2 mx-auto" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Access Pass-Key</p>
                <p className="text-2xl font-black text-primary tracking-widest">{isEnrolled.pass}</p>
              </div>
            </div>

            <button 
              onClick={() => setIsEnrolled(null)}
              className="w-full py-4 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all active:scale-95"
            >
              Continue to Registry
            </button>
          </motion.div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
              <div className="md:w-1/3 bg-gray-900 p-8 text-white flex flex-col items-center text-center">
                 <div className="w-32 h-32 rounded-[2rem] bg-primary flex items-center justify-center text-5xl font-black italic shadow-2xl mb-6 scale-110">
                   {selectedStudent.fullName?.charAt(0) || '?'}
                 </div>
                 <h2 className="text-2xl font-black italic tracking-tighter leading-tight mb-2">
                   {selectedStudent.fullName || 'Unknown Student'}
                 </h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">{selectedStudent.studentId}</p>
                 
                  <div className="w-full space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                       <DollarSign className="w-5 h-5 text-primary" />
                       <div className="flex-1">
                          <p className="text-[8px] font-black uppercase text-white/40 mb-1">Fiscal Permit Status</p>
                          <select 
                            className="w-full bg-transparent border-0 text-white font-bold text-sm outline-none cursor-pointer focus:text-primary transition-colors"
                            value={selectedStudent.paymentStatus || 'Expected'}
                            onChange={(e) => updateStudent({ ...selectedStudent, paymentStatus: e.target.value as any })}
                          >
                            <option className="bg-gray-900" value="Expected">Fees Expected (Locked)</option>
                            <option className="bg-gray-900" value="Pending Approval">Pending Approval (Locked)</option>
                            <option className="bg-gray-900" value="Cleared">System Cleared (Permitted)</option>
                          </select>
                       </div>
                    </div>

                    {/* MASTER ACCOUNT MANAGEMENT SECTION */}
                    <div className="bg-primary/20 p-4 rounded-2xl border border-primary/30 flex flex-col gap-3 text-left">
                       <div className="flex items-center gap-3">
                         <ShieldCheck className="w-5 h-5 text-primary" />
                         <div>
                            <p className="text-[8px] font-black uppercase text-gray-300 mb-0.5">Master Account Management</p>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Security Credentials</h5>
                         </div>
                       </div>
                       
                       <div className="space-y-3 pt-2">
                          <div>
                            <p className="text-[8px] font-bold text-white/40 uppercase mb-1">Pass-Key Override</p>
                            <div className="flex gap-2">
                               <input 
                                 type="text" 
                                 className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-primary"
                                 value={selectedStudent.password || ''}
                                 onChange={(e) => setSelectedStudent({...selectedStudent, password: e.target.value})}
                               />
                               <button 
                                 onClick={() => {
                                   updateStudent(selectedStudent);
                                   alert("SECURITY SYNC: Password protocol updated. Node re-authorized.");
                                 }}
                                 className="bg-primary text-white text-[8px] font-black px-4 rounded-lg uppercase tracking-widest"
                               >
                                 Sync
                               </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-white/40 uppercase mb-1">Student Number (ID Override)</p>
                            <div className="flex gap-2">
                               <input 
                                 type="text" 
                                 className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-primary"
                                 value={selectedStudent.studentId || ''}
                                 onChange={(e) => setSelectedStudent({...selectedStudent, studentId: e.target.value})}
                               />
                               <button 
                                 onClick={async () => {
                                   try {
                                     await updateStudent(selectedStudent);
                                     alert("ID SYNC: Student number configuration updated.");
                                   } catch (err: any) {
                                     alert(`SYNC FAILED: ${err.message || 'Check NRC for duplicates'}`);
                                   }
                                 }}
                                 className="bg-primary text-white text-[8px] font-black px-4 rounded-lg uppercase tracking-widest"
                               >
                                 Update
                               </button>
                            </div>
                          </div>
                       </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                       <BookOpen className="w-5 h-5 text-primary" />
                       <div>
                          <p className="text-[8px] font-black uppercase text-white/40 mb-1">Enrolled Module</p>
                          <p className="text-sm font-bold">{courses.find(c => c.id === selectedStudent.courseId)?.name}</p>
                       </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                       <Clock className="w-5 h-5 text-primary" />
                       <div>
                          <p className="text-[8px] font-black uppercase text-white/40 mb-1">Selected Program Duration</p>
                          <p className="text-sm font-bold">{selectedStudent.selectedDuration || 'Not Specified'}</p>
                       </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                       <Clock className="w-5 h-5 text-primary" />
                       <div>
                          <p className="text-[8px] font-black uppercase text-white/40 mb-1">Intake Window</p>
                          <p className="text-sm font-bold">{intakes.find(i => i.id === selectedStudent.intakeId)?.name}</p>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={() => runAnalysis(selectedStudent)}
                   disabled={isAnalyzing}
                   className="mt-auto w-full bg-white text-gray-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                 >
                    {isAnalyzing ? <span className="animate-spin text-lg">◌</span> : <Sparkles className="w-4 h-4" />}
                    Generate AI Insight
                 </button>
              </div>

              <div className="flex-1 p-10 overflow-y-auto bg-gray-50 flex flex-col">
                 <div className="flex justify-between items-start mb-10">
                   <div>
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Diagnostic Analytics</h3>
                     <h4 className="text-2xl font-black italic tracking-tight uppercase text-gray-900">Performance Matrix</h4>
                   </div>
                   <button onClick={() => { setSelectedStudent(null); setAiAnalysis(null); }} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900">
                     <X className="w-5 h-5" />
                   </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                       <div className="flex justify-between items-center mb-4">
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Course Pulse</p>
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                       </div>
                       <div className="text-4xl font-black italic text-gray-900 mb-4">{selectedStudent.progress}%</div>
                       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${selectedStudent.progress}%` }} />
                       </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                       <div className="flex justify-between items-center mb-4">
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Lab Saturation</p>
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                       </div>
                       <div className="text-4xl font-black italic text-gray-900 mb-4">{selectedStudent.labProgress || 0}%</div>
                       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${selectedStudent.labProgress || 0}%` }} />
                       </div>
                    </div>
                 </div>

                 {/* Focus Areas Analysis Section */}
                 <div className="mb-10 bg-orange-50/50 rounded-3xl p-8 border border-orange-100">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                          <Sparkles className="w-5 h-5" />
                       </div>
                       <div>
                          <h5 className="text-sm font-black italic uppercase tracking-tight">Focus Discovery Node</h5>
                          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Identified pedagogical bottlenecks</p>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                       {courses.find(c => c.id === selectedStudent.courseId)?.modules.map((mod) => {
                          const studentCompletions = allProgress.filter(p => p.student_id === selectedStudent.studentId).map(p => p.lesson_id);
                          const completedInMod = mod.lessons.filter(l => studentCompletions.includes(l.id)).length;
                          const modProgress = mod.lessons.length > 0 ? (completedInMod / mod.lessons.length) * 100 : 0;
                          
                          if (modProgress < 50) {
                             return (
                               <div key={mod.id} className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
                                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                  <span className="text-[11px] font-black uppercase text-orange-700">{mod.title}</span>
                                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{Math.round(modProgress)}%</span>
                               </div>
                             );
                          }
                          return null;
                       })}
                       
                       {courses.find(c => c.id === selectedStudent.courseId)?.modules.every(mod => {
                          const studentCompletions = allProgress.filter(p => p.student_id === selectedStudent.studentId).map(p => p.lesson_id);
                          const completedInMod = mod.lessons.filter(l => studentCompletions.includes(l.id)).length;
                          return (mod.lessons.length > 0 ? (completedInMod / mod.lessons.length) * 100 : 0) >= 50;
                       }) && (
                          <div className="flex items-center gap-2 text-emerald-600">
                             <CheckCircle className="w-4 h-4" />
                             <span className="text-xs font-black uppercase italic">Student is currently optimal in all technical clusters.</span>
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-y-auto mb-6">
                    <div className="flex justify-between items-center mb-6">
                      <h5 className="text-sm font-black italic tracking-tight uppercase">Detailed Curriculum Progress</h5>
                      <span className="text-[9px] font-black uppercase text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                        {courses.find(c => c.id === selectedStudent.courseId)?.modules.length || 0} Modules Detected
                      </span>
                    </div>

                    <div className="space-y-6">
                      {courses.find(c => c.id === selectedStudent.courseId)?.modules.map((mod, mIdx) => {
                        const studentCompletions = allProgress.filter(p => p.student_id === selectedStudent.studentId).map(p => p.lesson_id);
                        const completedInMod = mod.lessons.filter(l => studentCompletions.includes(l.id)).length;
                        const modProgress = mod.lessons.length > 0 ? (completedInMod / mod.lessons.length) * 100 : 0;

                        return (
                          <div key={mod.id} className="space-y-3">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">Module {mIdx + 1}</p>
                                <h6 className="text-sm font-bold text-gray-900">{mod.title}</h6>
                              </div>
                              <div className="text-right">
                                <span className={cn(
                                  "text-[10px] font-black italic",
                                  modProgress === 100 ? "text-emerald-500" : "text-gray-400"
                                )}>
                                  {completedInMod}/{mod.lessons.length} Lessons
                                </span>
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                               <div 
                                 className={cn(
                                   "h-full transition-all duration-700",
                                   modProgress === 100 ? "bg-emerald-500" : "bg-primary"
                                 )} 
                                 style={{ width: `${modProgress}%` }} 
                               />
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                              {mod.lessons.map(lesson => {
                                const isDone = studentCompletions.includes(lesson.id);
                                return (
                                  <button 
                                    key={lesson.id} 
                                    onClick={() => toggleLessonCompletion(lesson.id, selectedStudent.studentId)}
                                    className={cn(
                                      "px-3 py-2 rounded-xl border text-[9px] font-bold transition-all flex items-center justify-between group/lesson",
                                      isDone 
                                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                        : "bg-white border-gray-100 text-gray-400 hover:border-primary/30 hover:bg-gray-50"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                       <div className={cn(
                                         "w-2 h-2 rounded-full shrink-0",
                                         isDone ? "bg-emerald-500" : "bg-gray-200 group-hover/lesson:bg-primary/30"
                                       )} />
                                       <span className="truncate">{lesson.title}</span>
                                    </div>
                                    <div className={cn(
                                       "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all",
                                       isDone ? "bg-emerald-500 border-emerald-500" : "border-gray-200 group-hover/lesson:border-primary/50"
                                    )}>
                                       {isDone && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {(!courses.find(c => c.id === selectedStudent.courseId)?.modules || courses.find(c => c.id === selectedStudent.courseId)?.modules.length === 0) && (
                        <div className="py-12 text-center">
                           <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                             <BookOpen className="w-6 h-6" />
                           </div>
                           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No modules configured for this track</p>
                        </div>
                      )}
                    </div>
                  </div>

                 {aiAnalysis ? (
                    <div className="bg-purple-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
                       <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                         <Bot className="w-32 h-32" />
                       </div>
                       <h5 className="text-[9px] font-black uppercase tracking-widest text-purple-300 mb-4">AI Mentor Protocol Output</h5>
                       <p className="text-lg font-bold italic leading-relaxed relative z-10">"{aiAnalysis}"</p>
                    </div>
                  ) : (
                    <div className="flex-1 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-sm mb-4">
                         <Sparkles className="w-8 h-8" />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Deep analysis node awaiting activation</p>
                    </div>
                  )}
              </div>
           </div>
        </div>
      )}

      {/* GROUPED REGISTRY VIEW */}
      <div className="space-y-12">
        {courses
          .filter(c => selectedCourseId === 'all' || c.id === selectedCourseId)
          .map(course => {
            const courseStudents = filteredStudents.filter(s => s.courseId === course.id);
            if (courseStudents.length === 0) return null;

            return (
              <div key={course.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-6 px-4">
                   <div className="h-px bg-gray-100 flex-1" />
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 border-2 border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                         <BookOpen className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-black italic uppercase tracking-tight text-gray-900">
                         {course.name} <span className="text-[10px] font-bold text-gray-400 not-italic uppercase tracking-widest ml-2">({courseStudents.length} Nodes)</span>
                      </h2>
                   </div>
                   <div className="h-px bg-gray-100 flex-1" />
                </div>

              <div className="bg-gray-50 p-8 rounded-3xl mb-10 flex flex-wrap gap-4 items-center">
                 {selectedStudents.length > 0 && isAdmin ? (
                   <div className="flex-1 flex items-center justify-between bg-primary/10 p-6 rounded-3xl border-2 border-primary/20 animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary text-secondary rounded-2xl flex items-center justify-center shadow-lg">
                           <ShieldAlert className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Bulk Action Node</p>
                            <p className="font-black text-secondary italic uppercase tracking-tighter">{selectedStudents.length} Identities Selected</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <button 
                           onClick={() => {
                             if(window.confirm(`BULK SECURITY: Terminate and purge ${selectedStudents.length} selected identities?`)) {
                               selectedStudents.forEach(id => deleteStudent(id));
                               setSelectedStudents([]);
                               addNotification('Bulk Deletion', 'Identity nodes purged successfully.', 'success');
                             }
                           }}
                           className="h-12 bg-red-500 text-white px-6 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
                         >
                            Delete Selected
                         </button>
                         <button 
                           onClick={() => {
                             if(window.confirm(`BULK SECURITY: Suspend ${selectedStudents.length} selected identities?`)) {
                               selectedStudents.forEach(id => {
                                 const s = students.find(st => st.id === id);
                                 if (s) updateStudent({...s, status: 'Inactive'});
                               });
                               setSelectedStudents([]);
                               addNotification('Bulk Suspension', 'Identity nodes blocked successfully.', 'success');
                             }
                           }}
                           className="h-12 bg-amber-500 text-white px-6 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                         >
                            Block Selected
                         </button>
                         <button 
                           onClick={() => setSelectedStudents([])}
                           className="h-12 bg-white text-gray-500 px-6 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-100 transition-all"
                         >
                           Desync
                         </button>
                      </div>
                   </div>
                 ) : (
                   <>
                    <div className="flex -space-x-3">
                    {courseStudents.slice(0, 5).map((s, i) => (
                      <div key={i} className="w-10 h-10 rounded-xl bg-gray-900 border-2 border-white flex items-center justify-center text-[10px] text-primary font-black shadow-lg">
                        {s.fullName?.[0]}
                      </div>
                    ))}
                    {courseStudents.length > 5 && (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-400 font-black">
                        +{courseStudents.length - 5}
                      </div>
                    )}
                 </div>
                 <div className="text-left flex-1 min-w-[200px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Master Registry</p>
                    <p className="text-sm font-black italic tracking-tight text-gray-900 uppercase">Track Identity Cluster</p>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const confirmBlock = window.confirm("SECURITY: Block all students in this intake node?");
                        if (confirmBlock) {
                           courseStudents.forEach(s => updateStudent({...s, status: 'Inactive'}));
                        }
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Block Cluster
                    </button>
                 </div>
               </>
             )}
           </div>

              <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          {isAdmin && (
                            <th className="px-8 py-6 w-10">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary transition-all cursor-pointer"
                                checked={selectedStudents.length === courseStudents.length && courseStudents.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudents(prev => [...new Set([...prev, ...courseStudents.map(s => s.id)])]);
                                  } else {
                                    setSelectedStudents(prev => prev.filter(id => !courseStudents.some(s => s.id === id)));
                                  }
                                }}
                              />
                            </th>
                          )}
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Student Entity</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Diagnostic Pulse</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Module Alignment</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Sync Status</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-bold">
                        {courseStudents.map((s) => {
                          const courseObj = courses.find(c => c.id === s.courseId);
                          const totalLessons = courseObj?.modules.reduce((acc, mod) => acc + mod.lessons.length, 0) || 0;
                          const completedLessons = allProgress.filter(p => p.student_id === s.studentId).length;

                          return (
                            <tr key={s.id || s.studentId || Math.random().toString()} className={cn("hover:bg-gray-50/50 transition-all group border-b border-gray-100 last:border-0", selectedStudents.includes(s.id) && "bg-primary/5")}>
                              {isAdmin && (
                                <td className="px-8 py-8 w-10">
                                  <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary transition-all cursor-pointer"
                                    checked={selectedStudents.includes(s.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedStudents(prev => [...prev, s.id]);
                                      } else {
                                        setSelectedStudents(prev => prev.filter(id => id !== s.id));
                                      }
                                    }}
                                  />
                                </td>
                              )}
                              <td className="px-8 py-8">
                                <div className="flex items-center gap-5">
                                  <div className="relative">
                                    <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center font-black italic text-primary group-hover:scale-105 transition-all shadow-xl shadow-black/10">
                                      {s.fullName?.charAt(0) || '?'}
                                    </div>
                                    <div className={cn(
                                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                                      s.status === 'Active' ? "bg-emerald-500" : "bg-gray-400"
                                    )} />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-base font-black italic text-gray-900 leading-none mb-1.5 group-hover:text-primary transition-colors">{s.fullName || 'Anonymous Identity'}</p>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[9px] font-black text-white bg-secondary px-2 py-0.5 rounded-lg uppercase tracking-widest">{s.studentId}</span>
                                       <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{s.phone}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-8">
                                <div className="space-y-3 w-48">
                                   <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">Global Synthesis</span>
                                      <span className="text-xs font-black text-emerald-500 italic">{s.progress}%</span>
                                   </div>
                                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
                                      <div className="h-full bg-emerald-500 rounded-full shadow-lg transition-all duration-1000 ease-out" style={{ width: `${s.progress}%` }} />
                                   </div>
                                   <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest text-right">Adaptive Learning Index</p>
                                </div>
                              </td>
                              <td className="px-8 py-8">
                                <div className="text-left">
                                  <span className="text-xs font-black uppercase tracking-tight text-secondary block mb-2 italic">
                                    {courseObj?.name || 'Unknown Node'}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                       {[...Array(5)].map((_, i) => (
                                         <div key={i} className={cn(
                                           "w-3 h-1.5 rounded-full transition-all",
                                           i < Math.floor((completedLessons / (totalLessons || 1)) * 5) ? "bg-primary" : "bg-gray-200"
                                         )} />
                                       ))}
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                       {completedLessons} / {totalLessons} Nodes
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-8">
                                <div className="flex flex-col items-start gap-2">
                                  <span className={cn(
                                    "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2",
                                    s.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                  )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full", s.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                    {s.status}
                                  </span>
                                  <span className={cn(
                                    "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                    s.paymentStatus === 'Cleared' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-50 text-gray-400 border-gray-100"
                                  )}>
                                    {s.paymentStatus || 'Outstanding'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-8 text-right">
                                <div className="flex justify-end items-center gap-3">
                                  <button 
                                    onClick={() => setSelectedStudent(s)}
                                    className="w-12 h-12 bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-primary hover:scale-110 active:scale-95 transition-all flex items-center justify-center overflow-hidden relative group/btn"
                                  >
                                     <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                                     <MoreHorizontal className="w-6 h-6 relative z-10" />
                                  </button>
                                  {isAdmin && (
                                    <div className="flex gap-3">
                                      <button 
                                        onClick={() => {
                                          const action = s.status === 'Active' ? 'Inactive' : 'Active';
                                          if(window.confirm(`SECURITY: ${action === 'Inactive' ? 'Suspend' : 'Reactive'} student node [${s.studentId}]?`)) {
                                            updateStudent({...s, status: action});
                                          }
                                        }}
                                        title={s.status === 'Active' ? "Block Node" : "Unblock Node"}
                                        className={cn(
                                          "w-12 h-12 rounded-2xl transition-all border flex items-center justify-center shadow-sm",
                                          s.status === 'Active' ? "bg-amber-50 text-amber-500 border-amber-100 hover:bg-amber-500 hover:text-white" : "bg-emerald-50 text-emerald-500 border-emerald-100 hover:bg-emerald-500 hover:text-white"
                                        )}
                                      >
                                        <ShieldAlert className="w-5 h-5" />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          if(window.confirm(`Permanently terminate node [${s.studentId}] and purge student data?`)) {
                                            deleteStudent(s.id);
                                          }
                                        }} 
                                        className="w-12 h-12 bg-red-50 text-red-300 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-100 flex items-center justify-center shadow-sm"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
              </div>
            );
          })}
        
        {/* UNASSIGNED STUDENTS SECTION */}
        {selectedCourseId === 'all' && filteredStudents.filter(s => !courses.some(c => c.id === s.courseId)).length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-6 px-4">
               <div className="h-px bg-gray-100 flex-1" />
               <div className="flex items-center gap-3 text-amber-500">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 border-2 border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
                     <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black italic uppercase tracking-tight text-gray-900">
                     Unassigned Nodes <span className="text-[10px] font-bold text-gray-400 not-italic uppercase tracking-widest ml-2">({filteredStudents.filter(s => !courses.some(c => c.id === s.courseId)).length} Missing Assignment)</span>
                  </h2>
               </div>
               <div className="h-px bg-gray-100 flex-1" />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Student Entity</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Diagnostic Pulse</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-bold">
                    {filteredStudents.filter(s => !courses.some(c => c.id === s.courseId)).map((s) => (
                      <tr key={s.id || s.studentId} className="hover:bg-gray-50/50 transition-all group border-b border-gray-100 last:border-0">
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center font-black italic shadow-xl shadow-amber-500/10">
                              {s.fullName?.charAt(0) || '?'}
                            </div>
                            <div className="text-left">
                              <p className="text-base font-black italic text-gray-900 leading-none mb-1.5 group-hover:text-primary transition-colors">{s.fullName || 'Anonymous Identity'}</p>
                              <div className="flex items-center gap-2">
                                 <span className="text-[9px] font-black text-white bg-secondary px-2 py-0.5 rounded-lg uppercase tracking-widest">{s.studentId}</span>
                                 <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest italic">Action Required: No Course Link</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <span className="text-[10px] font-black text-gray-400 italic">Progress Sync Unavailable</span>
                        </td>
                        <td className="px-8 py-8">
                          <span className="px-4 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[9px] font-black uppercase tracking-widest">Awaiting Assignment</span>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => setSelectedStudent(s)} className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-xl">
                              <MoreHorizontal className="w-6 h-6" />
                            </button>
                            {isAdmin && (
                              <button 
                                onClick={() => {
                                  if(window.confirm("Purge unassigned node?")) deleteStudent(s.id);
                                }}
                                className="w-12 h-12 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center border border-red-100"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {filteredStudents.length === 0 && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center shadow-sm">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Search className="w-10 h-10" />
             </div>
             <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 mb-2">No Matching Nodes Found</h3>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">The search parameters returned zero results from the academy registry.</p>
          </div>
        )}
      </div>
      </>
    )}
  </div>
);
}
