import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileUp, Send, CheckCircle, Clock, FileText, ImageIcon, Search, AlertCircle, Bot, Eye, Check, X, ShieldCheck, Sparkles, Zap, MessageSquare, Layers, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../components/utils';
import { Submission } from '../context/types';

export function WorkSubmissions() {
  const { user, courses, submissions, submitWork, verifySubmission, approveAiGrade, refreshData } = useAuth();
  const [type, setType] = useState<'assignment' | 'test'>('assignment');
  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image'>('pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyingSubmission, setVerifyingSubmission] = useState<Submission | null>(null);
  const [editGrade, setEditGrade] = useState('');
  const [editFeedback, setEditFeedback] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const isStaff = user?.role === 'admin' || user?.role === 'instructor' || user?.role === 'staff' || user?.email?.toLowerCase() === 'felixbrownz907@gmail.com';
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'ai_marked' | 'marked'>(isStaff ? 'pending' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const isLocked = false;
  
  const mySubmissions = submissions.filter(s => s.studentId === user?.studentData?.studentId);
  const studentCourse = courses.find(c => c.id === user?.studentData?.courseId);
  
  const programs = ['all', ...courses.map(c => c.name)];
  if (submissions.some(s => !programs.includes(s.program || 'Unknown Program'))) {
    programs.push('Unassigned/History');
  }

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      (sub.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (sub.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProgram = programFilter === 'all' || 
                           sub.program === programFilter || 
                           (programFilter === 'Unassigned/History' && !courses.some(c => c.name === sub.program));
    
    const matchesStatus = 
      statusFilter === 'all' 
        ? true 
        : statusFilter === 'pending' 
          ? (sub.status === 'pending' || sub.status === 'ai_marked') 
          : sub.status === statusFilter;
    
    return matchesSearch && matchesProgram && matchesStatus;
  });

  const handleVerify = async () => {
    if (!verifyingSubmission) return;
    await verifySubmission(verifyingSubmission.id, editGrade, editFeedback);
    setVerifyingSubmission(null);
  };

  const handleApproveAi = async () => {
    if (!verifyingSubmission) return;
    await approveAiGrade(verifyingSubmission.id);
    setVerifyingSubmission(null);
  };

  const openVerify = (sub: Submission) => {
    setVerifyingSubmission(sub);
    setEditGrade(sub.aiGrade || sub.grade || '');
    setEditFeedback(sub.aiFeedback || sub.feedback || '');
  };

  const handeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user?.studentData) {
      setError("AUTHENTICATION_ERROR: Please login again.");
      return;
    }
    if (!fileUrl) {
      setError("FILE_MISSING: Please capture or upload a file first.");
      return;
    }
    if (!title || !moduleId) {
      setError("DETAILS_MISSING: Please provide all required submission details.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitWork({
        studentId: user.studentData.studentId,
        studentName: user.studentData.fullName,
        type,
        title,
        moduleId,
        fileUrl,
        fileType
      });
      setSuccess(true);
      setTitle('');
      setModuleId('');
      setFileUrl('');
      setUploadFile(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(`TRANSMISSION_REJECTED: ${err.message || 'Check connection'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="text-left">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 italic">Work Submissions</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">
            {isStaff ? 'Faculty Oversight & Academic Synthesis Node' : 'Upload Tests & Assignments for Academic Synthesis'}
          </p>
        </div>
        {isStaff && (
          <button 
            onClick={async () => {
              await refreshData();
              alert("FLASH SYNC: Academic registry buffer aligned and validated.");
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            Flash Node Sync
          </button>
        )}
      </div>

      {isStaff && (
        <div className="space-y-12">
          {/* 1. ACADEMIC OVERVIEW DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden group border-4 border-emerald-500/10">
                <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                   <ShieldCheck className="w-32 h-32" />
                </div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Queue Priority</p>
                <p className="text-4xl font-black italic mb-4 leading-none">
                  {submissions.filter(s => s.status !== 'marked').length} <span className="text-gray-600">Pending</span>
                </p>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                    {submissions.filter(s => s.status === 'ai_marked').length} AI SUGGESTIONS
                  </div>
                  <div className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-red-500/20">
                    {submissions.filter(s => s.status === 'pending').length} RAW NODES
                  </div>
                </div>
             </div>

             <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Syncs', val: submissions.length, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Avg Accuracy', val: '88%', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Active Programs', val: courses.length, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/5' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl flex items-center gap-6 group hover:border-primary transition-all">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform", stat.bg, stat.color)}>
                        <stat.icon className="w-7 h-7" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">{stat.label}</p>
                         <p className="text-3xl font-black text-gray-900 leading-none italic">{stat.val}</p>
                      </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white rounded-[40px] border-4 border-gray-50 shadow-2xl overflow-hidden">
            <div className="p-10 border-b-4 border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-secondary rotate-3 shadow-xl">
                     <Bot className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Grading Registry Node</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Multi-Program Verification Environment</p>
                  </div>
               </div>
               
                <div className="flex flex-wrap items-center gap-4">
                   <button 
                      onClick={async () => {
                         await refreshData();
                         alert(`SYNC_COMPLETE: Found ${submissions.length} total assignments globally.`);
                      }}
                      className="h-10 px-6 bg-white border-2 border-gray-100 rounded-xl font-black uppercase tracking-widest text-[9px] text-gray-400 hover:text-primary hover:border-primary transition-all flex items-center gap-2"
                   >
                      <Zap className="w-3 h-3 text-amber-500" /> Pulse Sync
                   </button>
                  <div className="flex bg-gray-50 p-1.5 rounded-2xl border-2 border-gray-100">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="h-10 px-4 bg-transparent border-0 rounded-xl font-black uppercase tracking-widest text-[9px] outline-none"
                    >
                      <option value="all">ALL ENTRIES</option>
                      <option value="pending">WAITING QUEUE (Pending + AI)</option>
                      <option value="marked">VERIFIED / FINISHED</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="SEARCH STUDENT NODES..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-14 bg-gray-50 border-2 border-transparent pl-14 pr-8 rounded-[20px] font-black uppercase tracking-widest text-[10px] focus:border-primary/20 focus:bg-white transition-all w-full md:w-64 outline-none"
                    />
                  </div>
               </div>
            </div>
         </div>

            {/* 2. PROGRAM NAVIGATION CAROUSEL */}
            <div className="px-10 py-6 bg-gray-50/50 border-b-2 border-gray-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
               {programs.map(p => {
                 const count = submissions.filter(s => (s.program || 'Unknown Program') === p || (p === 'all')).length;
                 return (
                    <button
                       key={p}
                       onClick={() => setProgramFilter(p)}
                       className={cn(
                          "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 border-2",
                          programFilter === p 
                             ? "bg-primary text-secondary border-primary shadow-xl shadow-primary/20 scale-105" 
                             : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                       )}
                    >
                       {p}
                       <span className={cn(
                         "px-2 py-0.5 rounded-lg text-[9px]",
                         programFilter === p ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                       )}>{count}</span>
                    </button>
                 );
               })}
            </div>


            <div className="overflow-x-auto space-y-12 pb-12 min-h-[400px]">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-40 opacity-30 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center">
                    <Search className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black uppercase tracking-widest">No Submissions Found</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Total Registry Count: {submissions.length} Nodes</p>
                  </div>
                  <button 
                    onClick={refreshData}
                    className="mt-4 px-8 py-3 bg-primary text-secondary rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    Force Registry Refresh
                  </button>
                </div>
              ) : Array.from(new Set(filteredSubmissions.map(s => s.program || 'Unknown Program'))).sort().map(program => {
                const programSubmissions = filteredSubmissions.filter(s => (s.program || 'Unknown Program') === program);
                return (
                  <div key={program} className="space-y-4 px-8">
                    <div className="flex items-center gap-4 py-4 border-b-2 border-gray-50">
                      <div className="w-2 h-8 bg-primary rounded-full" />
                      <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">{program}</h3>
                      <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {programSubmissions.length} Nodes
                      </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">Student Identity</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">Assessment Detail</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">AI Index</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">Final Mark</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-right">Verification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-50 font-bold">
                           {[...programSubmissions].reverse().map(sub => (
                             <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                               <td className="px-6 py-5">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-primary font-black uppercase text-xs">
                                       {sub.studentName?.[0] || 'S'}
                                    </div>
                                    <div>
                                       <p className="text-sm text-gray-900 uppercase tracking-tight">{sub.studentName}</p>
                                       <p className="text-[10px] text-gray-400 uppercase tracking-widest">ID: {sub.studentId}</p>
                                    </div>
                                 </div>
                               </td>
                               <td className="px-6 py-5">
                                 <div className="space-y-1">
                                    <p className="text-sm text-gray-900">{sub.title}</p>
                                    <div className="flex items-center gap-2">
                                       <span className={cn(
                                         "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                         sub.type === 'test' ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                                       )}>
                                         {sub.type}
                                       </span>
                                       <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Module {sub.moduleId}</span>
                                    </div>
                                 </div>
                               </td>
                               <td className="px-6 py-5 text-center">
                                  {sub.isAiMarked ? (
                                    <div className="flex flex-col items-center">
                                       <span className="text-sm font-black text-primary leading-none">{sub.aiGrade}%</span>
                                       <span className="text-[7px] font-black text-gray-400 uppercase mt-1">Autonomous</span>
                                    </div>
                                  ) : (
                                    <span className="text-[8px] font-black text-gray-300 uppercase italic">Pending AI</span>
                                  )}
                               </td>
                               <td className="px-6 py-5 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                     <div className={cn(
                                       "px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest border-2",
                                       sub.status === 'marked' 
                                         ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                         : (sub.status === 'ai_marked' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-gray-50 text-gray-300 border-gray-100 italic")
                                     )}>
                                        {sub.status === 'marked' || sub.status === 'ai_marked' ? `${sub.grade || sub.aiGrade}%` : 'Unverified'}
                                     </div>
                                     {sub.status === 'ai_marked' && (
                                       <span className="text-[7px] font-black text-amber-500 uppercase flex items-center gap-1">
                                          <Zap className="w-2 h-2" /> Action Required
                                       </span>
                                     )}
                                  </div>
                               </td>
                               <td className="px-6 py-5">
                                 <div className="flex items-center justify-end gap-3">
                                    <button 
                                      onClick={() => openVerify(sub)}
                                      className={cn(
                                        "group h-12 px-6 rounded-2xl border-2 transition-all flex items-center gap-3 shadow-xl active:scale-95",
                                        sub.status === 'marked' 
                                          ? "bg-white border-gray-100 text-gray-400 hover:border-primary hover:text-primary" 
                                          : "bg-primary text-secondary border-primary"
                                      )}
                                    >
                                       {sub.status === 'marked' ? <ShieldCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5 animate-pulse" />}
                                       <span className="text-[10px] font-black uppercase tracking-widest">
                                         {sub.status === 'marked' ? 'Revise Mark' : 'Finalize Grade'}
                                       </span>
                                    </button>
                                    <a 
                                      href={sub.fileUrl} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="group w-12 h-12 rounded-2xl bg-gray-50 border-2 border-gray-100 text-gray-400 hover:border-primary hover:text-primary transition-all flex items-center justify-center"
                                      title="Open Artifact"
                                    >
                                       <FileText className="w-5 h-5" />
                                    </a>
                                 </div>
                               </td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
              
              {filteredSubmissions.length === 0 && (
                <div className="p-20 text-center opacity-30">
                   <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                   <p className="text-sm font-black uppercase tracking-widest">No Submissions Detected in search parameters</p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Shared History & Personal Submission Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Student Submission Form (Hidden for staff unless they are also students) */}
        {(!isStaff || (isStaff && user?.studentData)) && (
          <div className="space-y-8">
            {isLocked && (
              <div className="bg-red-50 p-8 rounded-[40px] border-4 border-red-100 text-center space-y-4">
                 <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                 <h3 className="text-xl font-black uppercase text-red-600">Portal Locked</h3>
                 <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Financial Clearance Required</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-10 border-2 border-gray-100 shadow-xl space-y-6">
               <div className="flex gap-4 p-2 bg-gray-50 rounded-2xl mb-8">
                  <button 
                    type="button"
                    onClick={() => setType('assignment')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                      type === 'assignment' ? "bg-primary text-secondary shadow-lg" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Assignment Submission
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('test')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                      type === 'test' ? "bg-primary text-secondary shadow-lg" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Critical Test Portal
                  </button>
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Topic or Test Title</label>
                     <input 
                       required
                       className="w-full h-14 bg-gray-50 border-0 px-6 rounded-2xl font-bold focus:ring-2 focus:ring-primary"
                       placeholder="e.g. Network Security Lab"
                       value={title}
                       onChange={e => setTitle(e.target.value)}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Target Module</label>
                         <select 
                           required
                           className="w-full h-14 bg-gray-50 border-0 px-6 rounded-2xl font-bold focus:ring-2 focus:ring-primary appearance-none"
                           value={moduleId}
                           onChange={e => setModuleId(e.target.value)}
                         >
                            <option value="">Select Module</option>
                            {studentCourse?.modules.map(m => (
                              <option key={m.id} value={m.id}>Module {m.order}: {m.title}</option>
                            ))}
                         </select>
                     </div>
                     <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Capture Method</label>
                         <select 
                           className="w-full h-14 bg-gray-50 border-0 px-6 rounded-2xl font-bold focus:ring-2 focus:ring-primary appearance-none"
                           value={fileType}
                           onChange={e => setFileType(e.target.value as any)}
                         >
                            <option value="pdf">Document PDF</option>
                            <option value="image">Image / Scan Capture</option>
                         </select>
                     </div>
                  </div>

                  <div className="space-y-2 pt-4">
                     <div className="w-full h-40 bg-gray-50 rounded-[32px] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center group hover:border-primary transition-all relative overflow-hidden">
                        <FileUp className="w-10 h-10 text-gray-300 mb-4 group-hover:text-primary transition-colors" />
                        <p className="text-[10px] font-black uppercase text-gray-400">Click to Upload Artifact</p>
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handeFileChange}
                          accept={fileType === 'pdf' ? '.pdf' : 'image/*'}
                        />
                        {fileUrl && <div className="absolute inset-0 bg-primary/10 flex items-center justify-center font-black text-primary text-[10px] uppercase">Artifact Loaded</div>}
                     </div>
                  </div>
               </div>

               <button 
                 disabled={isSubmitting || !fileUrl}
                 className="w-full h-16 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
               >
                 {isSubmitting ? 'Transmitting...' : 'Finalize Submission'}
               </button>

               <AnimatePresence>
                 {success && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 text-emerald-500"
                   >
                     <CheckCircle className="w-5 h-5" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Submission Cached Successfully.</p>
                   </motion.div>
                 )}
                 {error && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500"
                   >
                     <AlertCircle className="w-5 h-5" />
                     <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                   </motion.div>
                 )}
               </AnimatePresence>
            </form>
          </div>
        )}

        <div className="space-y-8">
          {(user?.studentData || !isStaff) && (
            <div className="bg-white rounded-[40px] p-10 border-2 border-gray-100 shadow-xl">
               <h2 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2 mb-8">
                 <Clock className="w-4 h-4 text-primary" /> My Personal History
               </h2>
               <div className="space-y-6">
                  {mySubmissions.length > 0 ? [...mySubmissions].reverse().map(sub => (
                    <div key={sub.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-start gap-6 group hover:translate-x-2 transition-all">
                       <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          {sub.fileType === 'pdf' ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                       </div>
                       <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                             <h4 className="text-sm font-black uppercase tracking-tight italic">{sub.title}</h4>
                             <span className={cn(
                               "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                               sub.status === 'marked' ? "bg-emerald-500/10 text-emerald-500" :
                               sub.status === 'ai_marked' ? "bg-primary/20 text-primary" : "bg-amber-500/10 text-amber-500"
                             )}>
                               {sub.status}
                             </span>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Module {sub.moduleId} | {new Date(sub.submittedAt).toLocaleDateString()}</p>
                          
                          {(sub.status === 'marked' || sub.status === 'ai_marked' || sub.feedback || sub.aiFeedback) && (
                            <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                               <div className="flex justify-between items-center mb-2">
                                  <span className="text-[8px] font-black uppercase text-primary tracking-widest">Feedback</span>
                                  <span className={cn(
                                    "text-xs font-black italic",
                                    (sub.grade || sub.aiGrade) ? "text-emerald-500" : "text-amber-500"
                                  )}>
                                    Grade: {sub.grade || sub.aiGrade || 'Pending'}
                                  </span>
                               </div>
                               <p className="text-[10px] font-medium text-gray-600 italic line-clamp-3">"{sub.feedback || sub.aiFeedback || 'Evaluation in progress...'}"</p>
                            </div>
                          )}
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                       <Search className="w-12 h-12" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No personal submissions found</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          <div className="bg-secondary p-8 rounded-[40px] text-white flex items-center gap-8 shadow-2xl border-4 border-white/5 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <AlertCircle className="w-32 h-32" />
               </div>
               <div className="w-16 h-16 rounded-3xl bg-primary text-secondary flex items-center justify-center shrink-0">
                  <Bot className="w-8 h-8" />
               </div>
               <div>
                  <h4 className="text-sm font-black uppercase italic tracking-tighter mb-1">AI Marking Protocol</h4>
                  <p className="text-[10px] font-medium text-white/40 leading-relaxed uppercase tracking-widest italic">AI Agents provide preliminary marking. Human verification ensures total academic accuracy.</p>
               </div>
            </div>
          </div>
        </div>

      {/* Verification Modal for Lecturers */}
      <AnimatePresence>
        {verifyingSubmission && (
          <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white w-full max-w-6xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden border-8 border-white/5"
             >
                {/* Artifact Preview */}
                <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center group">
                   <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.15)_0,transparent_70%)]" />
                   </div>
                   
                   {verifyingSubmission.fileType === 'image' ? (
                     <img 
                      src={verifyingSubmission.fileUrl} 
                      alt="Work Artifact" 
                      className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] group-hover:scale-[1.02] transition-transform duration-700" 
                     />
                   ) : (
                     <div className="text-center text-white space-y-8 max-w-md p-10">
                        <div className="w-32 h-32 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
                           <FileText className="w-16 h-16 text-primary" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-3xl font-black uppercase italic tracking-tighter">Document Node Locked</h3>
                          <p className="text-sm font-medium text-white/40 uppercase tracking-widest leading-relaxed">External PDF encapsulation required. Open the artifact node to analyze the student's submission work.</p>
                        </div>
                        <a 
                         href={verifyingSubmission.fileUrl} 
                         target="_blank" 
                         rel="noreferrer"
                         className="inline-flex h-16 items-center justify-center px-12 bg-primary text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                          Access Submission Node
                        </a>
                     </div>
                   )}

                   <div className="absolute bottom-10 left-10 text-left">
                      <div className="px-6 py-3 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-4">
                         <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-white/90 uppercase tracking-widest">Live Trace Active</p>
                            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest tracking-widest">Artifact ID: {verifyingSubmission.id}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Grading Panel */}
                <div className="w-full md:w-[450px] bg-white p-12 border-l-4 border-gray-50 overflow-y-auto">
                   <div className="space-y-12">
                      <div className="flex items-center justify-between">
                         <div className="text-left">
                            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none mb-1">Verify Node</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Human Synthesis Protocol</p>
                         </div>
                         <button onClick={() => setVerifyingSubmission(null)} className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all hover:rotate-90">
                            <X className="w-6 h-6" />
                         </button>
                      </div>

                      <div className="bg-gray-50 p-8 rounded-[35px] border-2 border-gray-100 flex items-center justify-between group">
                         <div className="flex items-center gap-4 text-left">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary font-black text-xl border-4 border-gray-100 shadow-sm uppercase group-hover:scale-110 transition-transform">
                               {verifyingSubmission.studentName?.[0] || 'S'}
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-sm font-black text-gray-900 uppercase leading-none">{verifyingSubmission.studentName}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {verifyingSubmission.studentId}</p>
                            </div>
                         </div>
                         <div className={cn(
                           "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                           verifyingSubmission.type === 'test' ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                         )}>
                            {verifyingSubmission.type}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-3 opacity-50">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4 flex items-center gap-2">
                               <Bot className="w-3.5 h-3.5" /> AI SUGGESTION
                            </label>
                            <div className="w-full h-20 bg-gray-50 border-4 border-dashed border-gray-100 px-10 rounded-[28px] font-black text-4xl italic tracking-tighter text-gray-400 flex items-center">
                               {verifyingSubmission.aiGrade || '--'}%
                            </div>
                         </div>
                         <div className="space-y-3 text-left">
                            <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-4 flex items-center gap-2">
                               <ShieldCheck className="w-3.5 h-3.5" /> FINAL NODE MARK
                            </label>
                            <input 
                              className="w-full h-20 bg-emerald-50 border-4 border-emerald-100 px-10 rounded-[28px] font-black text-4xl italic tracking-tighter focus:border-emerald-500 focus:bg-white transition-all text-emerald-600 outline-none shadow-sm"
                              placeholder="SET %"
                              value={editGrade}
                              onChange={e => setEditGrade(e.target.value)}
                            />
                         </div>
                      </div>

                      <div className="space-y-3 text-left mt-10">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4 flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5" /> Official Verification Feedback
                         </label>
                         <textarea 
                           className="w-full h-48 bg-gray-50 border-4 border-transparent p-8 rounded-[40px] font-bold text-sm tracking-tight focus:border-primary/10 focus:bg-white outline-none transition-all resize-none text-gray-600 leading-relaxed shadow-sm"
                           placeholder="Enter final academic feedback node context..."
                           value={editFeedback}
                           onChange={e => setEditFeedback(e.target.value)}
                         />
                      </div>

                      <div className="pt-8 space-y-4">
                         {verifyingSubmission.status === 'ai_marked' && (
                           <button 
                             onClick={handleApproveAi}
                             className="w-full h-20 bg-emerald-500 text-white rounded-[28px] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-emerald-500/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-4"
                           >
                              <Check className="w-6 h-6" /> Deploy AI Marking as Final
                           </button>
                         )}
                         <button 
                           onClick={handleVerify}
                           className="w-full h-20 bg-primary text-secondary rounded-[28px] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-4"
                         >
                            <Zap className="w-6 h-6" /> Finalize Human Synthesis
                         </button>
                         
                         {verifyingSubmission.aiFeedback && (
                            <div className="p-8 bg-black/5 rounded-[40px] border-2 border-black/5 space-y-3 text-left">
                               <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                  <Sparkles className="w-3 h-3" /> AI Analysis Draft
                               </p>
                               <p className="text-[11px] font-bold text-gray-500 italic leading-relaxed">
                                  "{verifyingSubmission.aiFeedback}"
                               </p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
