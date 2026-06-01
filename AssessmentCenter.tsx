import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  BookOpen, FileText, CheckCircle, Clock, ChevronRight, 
  Upload, ExternalLink, Bot, AlertCircle, Sparkles, ShieldAlert,
  UserCheck, ShieldCheck, Key, RefreshCw
} from 'lucide-react';
import { cn } from '../components/utils';
import { Submission, Exam } from '../context/types';

export function AssessmentCenter() {
  const { 
    user, exams, submissions, submitWork, autoGradeSubmission, 
    refreshData, attendance, addNotification, forceRegistryUpload, isSyncing 
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'submitted'>('available');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGrading, setIsGrading] = useState<string | null>(null);

  const studentSubmissions = submissions.filter(s => 
    (s.studentId && s.studentId === user?.studentData?.studentId) || 
    (user?.email && s.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
    (user?.studentData?.email && s.email && s.email.toLowerCase() === user.studentData.email.toLowerCase())
  );
  
  // Calculate attendance "marks" dynamically based on actual attendance records
  // This ensures marks "reflect" in real-time as requested
  const myAttendance = attendance.filter(a => a.studentId === user?.studentData?.studentId);
  const attendanceMarks = Math.min(100, Math.round(myAttendance.length * 0.5 * 100) / 100);
  
  // REAL-TIME SYNC: Poll for grade updates every 10 seconds while on this screen
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const [publishedGrades, setPublishedGrades] = useState<{ assignmentName: string; scorePercentage: number }[]>(
    typeof window !== 'undefined' && (window as any).AcademyState ? [...(window as any).AcademyState.studentGrades] : []
  );

  React.useEffect(() => {
    const handleGradePublished = () => {
      if (typeof window !== 'undefined' && (window as any).AcademyState) {
        setPublishedGrades([...(window as any).AcademyState.studentGrades]);
      }
    };
    
    window.addEventListener('academy-grade-published', handleGradePublished);
    const interval = setInterval(handleGradePublished, 1000);
    return () => {
      window.removeEventListener('academy-grade-published', handleGradePublished);
      clearInterval(interval);
    };
  }, []);

  const [manualMode, setManualMode] = useState(false);
  const [isVerifyingSystem, setIsVerifyingSystem] = useState(false);

  const handleSystemKey = async () => {
    setIsVerifyingSystem(true);
    addNotification('System Protocol', 'Initiating Deep Registry Validation...', 'info');
    try {
      await forceRegistryUpload(); // Trigger the actual repair logic we just fortified
    } catch (e) {
      addNotification('Protocol Fault', 'Identity alignment failed. Check cloud link.', 'alert');
    } finally {
      setIsVerifyingSystem(false);
    }
  };
  const [manualData, setManualData] = useState({
    title: '',
    moduleId: ''
  });

  const availableExams = exams.filter(e => {
    // Only show exams for the student's course/module if applicable
    // ADMIN OVERRIDE: Admins see all exams for testing/management
    const isAdmin = user?.role === 'admin' || user?.email === 'felixbrownz907@gmail.com';
    const isForStudentCourse = isAdmin || e.courseId === user?.studentData?.courseId || e.courseId === 'all';
    
    const isAlreadySubmitted = studentSubmissions.some(s => s.title === e.title && s.moduleId === e.moduleId);
    return isForStudentCourse && !isAlreadySubmitted;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if ((!selectedExam && !manualMode) || !uploadFile || !user?.studentData) return;
    if (manualMode && (!manualData.title || !manualData.moduleId)) return;
    
    setIsSubmitting(true);
    try {
      let fileUrl = 'https://storage.academy.edu/placeholder.png';
      
      // Read file as base64 if it's an image or small enough
      if (uploadFile.size < 2 * 1024 * 1024) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadFile);
        });
        fileUrl = await base64Promise;
      } else {
        fileUrl = URL.createObjectURL(uploadFile);
      }
      
      const title = manualMode ? manualData.title : (selectedExam?.title || 'Unknown');
      const moduleId = manualMode ? manualData.moduleId : (selectedExam?.moduleId || 'General');

      await submitWork({
        studentId: user.studentData.studentId,
        studentName: user.studentData.fullName,
        type: selectedExam?.type || 'assignment',
        title: title,
        moduleId: moduleId,
        fileUrl: fileUrl,
        fileType: uploadFile.type.includes('pdf') ? 'pdf' : 'image'
      });
      
      setSelectedExam(null);
      setManualMode(false);
      setUploadFile(null);
      setManualData({ title: '', moduleId: '' });
      setActiveTab('submitted');
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoGrade = async (submissionId: string) => {
    setIsGrading(submissionId);
    try {
      await autoGradeSubmission(submissionId);
    } finally {
      setIsGrading(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-primary flex items-center gap-3">
             <BookOpen className="w-7 h-7 md:w-8 md:h-8" />
             Assessment Center
          </h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-[0.3em] text-xs">Academic Integrity & Evaluation Engine // v2.0.4</p>
        </div>
        
        <div className="flex bg-gray-100/50 p-1.5 rounded-2xl border-2 border-gray-100">
           {(user?.role === 'admin' || user?.email?.toLowerCase() === 'felixbrownz907@gmail.com') && (
             <button
               onClick={handleSystemKey}
               disabled={isVerifyingSystem}
               className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#E11D48] hover:bg-white transition-all flex items-center gap-2 relative overflow-hidden"
             >
               {isVerifyingSystem && (
                 <motion.div 
                   initial={{ x: '-100%' }}
                   animate={{ x: '100%' }}
                   transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                   className="absolute inset-0 bg-primary/20 pointer-events-none"
                 />
               )}
               <ShieldAlert className={cn("w-3.5 h-3.5", isVerifyingSystem && "animate-spin")} />
               {isVerifyingSystem ? 'Scanning Node...' : 'System Verification Key'}
             </button>
           )}
           {(['available', 'submitted'] as const).map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                 activeTab === tab ? "bg-white text-primary shadow-lg" : "text-gray-400 hover:text-gray-600"
               )}
             >
               {tab === 'available' ? 'Pending Tasks' : 'My Submissions'}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'available' ? (
            <div className="space-y-4">
                {availableExams.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-20 text-center flex flex-col items-center gap-6">
                     <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <CheckCircle className="w-10 h-10" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900 uppercase">System Clearance</h3>
                        <p className="text-sm text-gray-400 font-medium">All assigned modules are currently submitted or pending release.</p>
                     </div>
                     <button 
                       onClick={() => setManualMode(true)}
                       className="mt-4 px-8 py-3 bg-secondary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                     >
                        Submit General Assignment <Upload className="w-3 h-3" />
                     </button>
                  </div>
                ) : (
                  <>
                    {availableExams.map((exam) => (
                      <motion.div 
                        layoutId={exam.id}
                        key={exam.id}
                        className="bg-white rounded-[2rem] border-2 border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                               "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                               exam.type === 'test' ? "bg-amber-500" : "bg-primary"
                             )}>
                                {exam.type === 'test' ? <AlertCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                             </div>
                             <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight group-hover:text-primary transition-colors">{exam.title}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{exam.maxMark} Points Available — {exam.type}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Due Strategy</p>
                             <p className="text-xs font-black text-red-500 uppercase">{new Date(exam.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 font-medium leading-relaxed mb-8 line-clamp-2">
                          {exam.description}
                        </p>
    
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Open for submission</span>
                           </div>
                           <button 
                             onClick={() => setSelectedExam(exam)}
                             className="bg-secondary text-primary px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                           >
                             Initialize Submission <ChevronRight className="w-3 h-3" />
                           </button>
                        </div>
                      </motion.div>
                    ))}
                    <div className="pt-6 border-t-2 border-gray-50 border-dashed">
                      <button 
                        onClick={() => setManualMode(true)}
                        className="w-full py-6 rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest italic"
                      >
                         <Upload className="w-4 h-4" /> Not seeing your assignment? Click for Manual Submission protocol
                      </button>
                    </div>
                  </>
                )}
            </div>
          ) : (
            <div className="space-y-4">
               {studentSubmissions.length === 0 ? (
                 <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-20 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                       <FileText className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-gray-900 uppercase italic">Digital Registry Empty</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No verified academic submissions detected on this node.</p>
                       <div className="flex gap-4 justify-center mt-6">
                         <button 
                           onClick={refreshData}
                           className="px-6 py-3 bg-primary text-secondary rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                         >
                           <RefreshCw className="w-3 h-3" /> Re-scan Cloud Node
                         </button>
                         <button 
                           onClick={handleSystemKey}
                           className="px-6 py-3 bg-secondary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                         >
                           <Key className="w-3 h-3 text-primary" /> Repair Identity
                         </button>
                       </div>
                    </div>
                 </div>
               ) : (
                <div className="space-y-4">
                  {/* ATTENDANCE MARK CARD */}
                  <div className="bg-primary/5 rounded-[2rem] border-2 border-primary/10 p-8 shadow-sm relative overflow-hidden group">
                     <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                        <UserCheck className="w-20 h-20 text-primary" />
                     </div>
                     <div className="flex flex-col md:flex-row justify-between gap-6 mb-4 relative z-10">
                        <div className="flex gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shrink-0">
                              <CheckCircle className="w-7 h-7" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Academic Presence</h3>
                                <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" /> Auto-Tracked
                                </div>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Consolidated Daily Registry Score</p>
                           </div>
                        </div>
                        
                        <div className="text-right">
                           <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-1">Attendance Weighted Mark</p>
                           <p className="text-3xl font-black text-primary italic tracking-tighter leading-none">{attendanceMarks}%</p>
                        </div>
                     </div>
                     <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden border border-primary/10">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${attendanceMarks}%` }} />
                     </div>
                     <p className="mt-4 text-[9px] font-black uppercase text-primary/40 italic tracking-widest">Calculated based on verified daily check-ins.</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-[28px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            <th className="px-6 py-4">Assessment Unit & Artifact</th>
                            <th className="px-6 py-4 text-center">Verify Hash</th>
                            <th className="px-6 py-4 text-center">Verification Status</th>
                            <th className="px-6 py-4 text-right">Acquired Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {studentSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map((sub) => (
                            <React.Fragment key={sub.id}>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5">
                                   <div className="flex flex-col gap-1">
                                      <span className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">{sub.title}</span>
                                      {sub.isAiMarked && (
                                        <span className="w-fit px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                          <Bot className="w-2.5 h-2.5" /> AI Evaluated
                                        </span>
                                      )}
                                   </div>
                                </td>
                                <td className="px-6 py-5 text-center font-mono text-xs font-bold text-slate-500">
                                   {sub.id.split("-")[0].toUpperCase()}
                                </td>
                                <td className="px-6 py-5 text-center">
                                   {sub.status === 'marked' ? (
                                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold uppercase tracking-wider">Verified</span>
                                   ) : (
                                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">Pending</span>
                                   )}
                                </td>
                                <td className="px-6 py-5 text-right font-bold text-slate-800">
                                   {sub.grade || '--'}
                                </td>
                              </tr>
                              {(sub.feedback || sub.aiFeedback) && (
                                <tr>
                                  <td colSpan={4} className="px-6 py-4 bg-slate-50/50 border-t border-gray-100">
                                    <div className="bg-white border border-gray-200 p-5 rounded-2xl relative overflow-hidden">
                                      <h4 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-blue-600" /> 
                                        {sub.feedback ? 'Assessor Feedback Board' : 'AI Evaluation Node'}
                                      </h4>
                                      <p className="text-xs text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                                        {sub.feedback || sub.aiFeedback}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}

                          {/* Live published grades */}
                          {publishedGrades.map((grade, idx) => (
                            <React.Fragment key={`pub-grade-${idx}`}>
                              <tr className="hover:bg-slate-50/50 bg-[#38bdf8]/5 transition-colors">
                                <td className="px-6 py-5">
                                   <div className="flex flex-col gap-1">
                                      <span className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">{grade.assignmentName}</span>
                                      <span className="w-fit px-2 py-0.5 bg-[#38bdf8]/10 text-primary-dark rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5 text-[#38bdf8] animate-pulse" /> Live Shared State
                                      </span>
                                   </div>
                                </td>
                                <td className="px-6 py-5 text-center font-mono text-xs font-bold text-slate-500">
                                   LIVE-MATRIX-{idx}
                                </td>
                                <td className="px-6 py-5 text-center">
                                   <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold uppercase tracking-wider">Published</span>
                                </td>
                                <td className="px-6 py-5 text-right font-black text-emerald-500">
                                   {grade.scorePercentage}%
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
               )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-primary rounded-[2.5rem] p-10 text-secondary shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
             <div className="relative z-10">
                <Sparkles className="w-10 h-10 mb-6 text-secondary animate-pulse" />
                <h3 className="text-2xl font-black uppercase leading-none mb-4">Submission Protocol</h3>
                <p className="text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest mb-8">
                   Ensure all academic artifacts are formatted as PDF or High-Resolution images. Our AI engine will conduct a preliminary integrity scan upon upload.
                </p>
                <div className="space-y-4">
                   {[
                     "Check file size (max 10MB)",
                     "Verify student credentials",
                     "AI-powered grading available",
                     "Instant cloud synchronization"
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-10">
             <h3 className="text-lg font-black uppercase text-gray-900 mb-6">Live Academic Status</h3>
             <div className="space-y-6">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                   <span className="text-[10px] font-black uppercase text-gray-400">Total Assessments</span>
                   <span className="text-xl font-black text-primary">{exams.length}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                   <span className="text-[10px] font-black uppercase text-emerald-600">Completed Nodes</span>
                   <span className="text-xl font-black text-emerald-700">{studentSubmissions.length}</span>
                </div>
                <div className="flex justify-between items-center bg-amber-50 p-4 rounded-xl border border-amber-100">
                   <span className="text-[10px] font-black uppercase text-amber-600">Average Score</span>
                   <span className="text-xl font-black text-amber-700">
                      {studentSubmissions.length > 0 
                        ? (studentSubmissions.reduce((acc, curr) => acc + parseInt(curr.grade || '0'), 0) / studentSubmissions.length).toFixed(1) + '%'
                        : 'N/A'
                      }
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {(selectedExam || manualMode) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 overflow-y-auto">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100%] z-0" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-8 border-4 border-white">
                    <Upload className="w-10 h-10" />
                 </div>
                 
                 <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Upload Academic Work</h2>
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">
                   {manualMode ? 'Manual Submission Protocol' : `Target: ${selectedExam?.title}`}
                 </p>

                 {manualMode && (
                   <div className="w-full space-y-4 mb-8">
                      <div className="text-left">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-2 mb-2 block">Assignment Title</label>
                         <input 
                           type="text"
                           placeholder="e.g. CYBER SECURITY ASSIGNMENT 1"
                           value={manualData.title}
                           onChange={e => setManualData(prev => ({ ...prev, title: e.target.value }))}
                           className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all font-bold text-gray-700 uppercase"
                         />
                      </div>
                      <div className="text-left">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-2 mb-2 block">Module / Course Node</label>
                         <select 
                           value={manualData.moduleId}
                           onChange={e => setManualData(prev => ({ ...prev, moduleId: e.target.value }))}
                           className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all font-bold text-gray-700 appearance-none"
                         >
                           <option value="">Select Module</option>
                           <option value="mod-cs-001">Cyber Security Fundamentals</option>
                           <option value="mod-se-001">Software Engineering</option>
                           <option value="mod-nw-001">Networking Architecture</option>
                           <option value="mod-ai-001">Artificial Intelligence</option>
                           <option value="general">Other / General</option>
                         </select>
                      </div>
                   </div>
                 )}
                 
                 <label className="w-full relative group cursor-pointer">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,image/*"
                      onChange={handleFileUpload}
                    />
                    <div className={cn(
                      "w-full h-40 rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center gap-3",
                      uploadFile ? "border-emerald-500 bg-emerald-50" : "border-gray-100 bg-gray-50 group-hover:border-primary/30"
                    )}>
                       {uploadFile ? (
                         <>
                           <CheckCircle className="w-10 h-10 text-emerald-500" />
                           <div>
                             <p className="text-sm font-black text-emerald-600 uppercase">{uploadFile.name}</p>
                             <p className="text-[10px] font-bold text-emerald-400 uppercase">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB — Ready for Cloud Sync</p>
                           </div>
                         </>
                       ) : (
                         <>
                           <Upload className="w-10 h-10 text-gray-300 group-hover:text-primary transition-colors" />
                           <div>
                             <p className="text-sm font-black text-gray-400 uppercase group-hover:text-gray-600">Select artifacts or drop here</p>
                             <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">PDF, PNG, JPG (MAX 10MB)</p>
                           </div>
                         </>
                       )}
                    </div>
                 </label>

                 <div className="flex gap-4 w-full mt-10">
                    <button 
                      onClick={handleSubmit}
                      disabled={!uploadFile || isSubmitting}
                      className="flex-1 h-16 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                          Synchronizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Finalize Submission
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedExam(null);
                        setManualMode(false);
                        setUploadFile(null);
                      }}
                      className="px-10 h-16 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                    >
                      Abort
                    </button>
                 </div>
                 
                 <p className="mt-8 text-[9px] font-black uppercase text-gray-300 italic tracking-[0.2em]">All uploads are timestamped and logged via Sentinel Security Protocols.</p>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
