import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, MessageSquare, Receipt, GraduationCap, 
  Search, Filter, ChevronRight, CheckCircle2, 
  Clock, AlertCircle, ExternalLink, Mail, Phone,
  Hash, Calendar, Bot, ShieldCheck, Zap, UserPlus, Trash2, Plus
} from 'lucide-react';
import { cn } from '../components/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Interlink({ defaultFilter }: { defaultFilter?: 'all' | 'payments' | 'submissions' | 'mentor' | 'lecturers' }) {
  const { 
    students, submissions, payments, mentorBookings, 
    approvePayment, rejectPayment, updateMentorBooking,
    courses, user, lecturers, addLecturer, deleteLecturer,
    autoGradeSubmission
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'payments' | 'submissions' | 'mentor' | 'lecturers'>(defaultFilter || 'all');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isAddingLecturer, setIsAddingLecturer] = useState(false);
  const [newLecturer, setNewLecturer] = useState({ name: '', courseName: '' });
  const [gradingIds, setGradingIds] = useState<string[]>([]);

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const isStudent = user?.role === 'student';

  const myPayments = payments.filter(p => p.studentId === user?.studentData?.studentId);
  const mySubmissions = submissions.filter(s => s.studentId === user?.studentData?.studentId);
  const myBookings = mentorBookings.filter(b => b.studentId === user?.studentData?.studentId);

  const recentPayments = isAdmin ? payments.filter(p => 
    p.status === 'Pending' || (p.transactionId && String(p.transactionId).toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 10) : myPayments;

  const recentSubmissions = isAdmin ? submissions.filter(s => 
    s.status === 'pending' || (s.studentName && String(s.studentName).toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 10) : mySubmissions;

  const pendingMentors = isAdmin ? mentorBookings.filter(b => b.status === 'Pending') : myBookings.filter(b => b.status === 'Pending');

  const filteredStudents = isAdmin ? students.filter(s => 
    (s.fullName && String(s.fullName).toLowerCase().includes(searchTerm.toLowerCase())) || 
    (s.studentId && String(s.studentId).toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 10) : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Neural Interface</p>
          <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">
            {isAdmin ? 'Student Interlink' : 'Academy Sync'}
          </h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">
            {isAdmin ? 'Academic Synchronization Bureau // Admin Dashboard' : 'Your Live Link to IT International Academy'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search Student ID or Transaction..."
              className="w-full h-14 bg-white border-2 border-gray-100 pl-16 pr-6 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
            {[
              { id: 'all', label: 'Nodes', icon: Zap },
              { id: 'payments', label: 'Fiscal', icon: Hash },
              { id: 'submissions', label: 'Work', icon: MessageSquare },
              { id: 'mentor', label: 'Mentors', icon: Users },
              { id: 'lecturers', label: 'Faculty', icon: GraduationCap }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                  filterType === f.id ? "bg-white text-secondary shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ACTION QUEUE - Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* PENDING PAYMENTS TRACKER */}
          {(filterType === 'all' || filterType === 'payments') && (
            <div className="bg-white rounded-[40px] border-2 border-gray-100 shadow-2xl overflow-hidden">
               <div className="p-8 border-b border-gray-50 flex justify-between items-center text-left">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                        <Hash className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-secondary italic">Fiscal Submission Feed</h3>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Awaiting Transaction Verification</p>
                     </div>
                  </div>
                  <span className="px-4 py-1.5 bg-amber-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                     {recentPayments.filter(p => p.status === 'Pending').length} Pending
                  </span>
               </div>
               
               <div className="divide-y divide-gray-50">
                  {recentPayments.length > 0 ? recentPayments.map(p => (
                    <div key={p.id} className="p-8 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                       <div className="flex items-center gap-6 text-left">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black italic transition-all",
                            p.status === 'Pending' ? "bg-amber-100 text-amber-600 group-hover:scale-110" : "bg-emerald-100 text-emerald-600"
                          )}>
                             {p.studentName?.[0] || 'S'}
                          </div>
                              <div>
                                 <p className="text-base font-black italic text-gray-900 leading-none mb-2">{p.studentName}</p>
                                 <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-lg">{p.studentId}</span>
                                    <div className="h-3 w-px bg-gray-200 hidden md:block" />
                                    <span className={cn(
                                       "text-[12px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-xl shadow-sm border",
                                       p.status === 'Pending' ? "bg-red-500 text-white border-red-400" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    )}>
                                       <Zap className="w-4 h-4" /> TXN REF: {p.transactionId || 'NOT_PROVIDED'}
                                    </span>
                                 </div>
                              </div>
                       </div>
                       
                       <div className="flex items-center gap-6">
                          <div className="text-right">
                             <p className="text-xl font-black italic text-gray-900 tracking-tighter leading-none mb-1">K{p.amountPaid}</p>
                             <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{new Date(p.paymentDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                             {p.status === 'Pending' ? (
                               <div className="flex gap-2">
                                 <button 
                                   onClick={() => approvePayment(p.id)}
                                   title="Approve & Grant Full Portal Access"
                                   className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:bg-emerald-600"
                                 >
                                   <CheckCircle2 className="w-6 h-6" />
                                 </button>
                                 <button 
                                   onClick={() => {
                                     if(window.confirm(`Reject payment of K${p.amountPaid} from ${p.studentName}?`)) {
                                       rejectPayment(p.id);
                                     }
                                   }}
                                   title="Reject & Block Access"
                                   className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:bg-red-600"
                                 >
                                   <AlertCircle className="w-6 h-6" />
                                 </button>
                               </div>
                             ) : (
                               <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100">
                                  <ShieldCheck className="w-5 h-5" />
                               </div>
                             )}
                             <button className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                             </button>
                          </div>
                       </div>
                    </div>
                  )) : (
                    <div className="p-20 text-center text-gray-300 font-black uppercase text-xl italic tracking-widest opacity-20">
                       No Active Payments
                    </div>
                  )}
               </div>
               <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-center">
                  <a href="/portal/financial" className="text-[9px] font-black uppercase text-gray-400 hover:text-primary transition-colors tracking-[0.2em]">Enter Full Fiscal Center</a>
               </div>
            </div>
          )}

          {/* WORK SUBMISSIONS FEED */}
          {(filterType === 'all' || filterType === 'submissions') && (
            <div className="bg-white rounded-[40px] border-2 border-gray-100 shadow-2xl overflow-hidden mb-8">
               <div className="p-8 border-b border-gray-50 flex justify-between items-center text-left">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                        <MessageSquare className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-secondary italic">Academic Work Stream</h3>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Neural Submissions from Learning Nodes</p>
                     </div>
                  </div>
                  <span className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                     {recentSubmissions.length} Transmissions
                  </span>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2">
                  {recentSubmissions.map(s => (
                    <div key={s.id} className="p-8 border-b md:border-r border-gray-50 hover:bg-gray-50 transition-all text-left">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-primary text-sm font-black italic">
                                {s.studentName?.[0] || 'S'}
                             </div>
                             <div>
                                <p className="text-xs font-black italic text-gray-900 leading-none mb-1">{s.studentName}</p>
                                <p className="text-[9px] font-bold text-gray-300 uppercase">{s.studentId}</p>
                             </div>
                          </div>
                          {s.status === 'pending' ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full">
                               <Clock className="w-3 h-3" />
                               <span className="text-[8px] font-black uppercase tracking-widest">UNGRADED</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full">
                               <CheckCircle2 className="w-3 h-3" />
                               <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                 {s.isAiMarked && <Bot className="w-2.5 h-2.5" />}
                                 MARKED: {s.grade}
                               </span>
                            </div>
                          )}
                       </div>
                       
                       <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-inner mb-6">
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Project Module</p>
                          <p className="text-sm font-black italic text-secondary uppercase tracking-tight truncate">{s.title}</p>
                       </div>

                       <div className="flex items-center justify-between">
                          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{new Date(s.submittedAt).toLocaleString()}</p>
                          <div className="flex items-center gap-2">
                             {s.status === 'pending' && (
                               <button 
                                 onClick={async () => {
                                   setGradingIds(prev => [...prev, s.id]);
                                   try {
                                     await autoGradeSubmission(s.id);
                                   } finally {
                                     setGradingIds(prev => prev.filter(id => id !== s.id));
                                   }
                                 }}
                                 disabled={gradingIds.includes(s.id)}
                                 className="bg-primary text-secondary px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                               >
                                 <Bot className={cn("w-3 h-3", gradingIds.includes(s.id) && "animate-spin")} />
                                 {gradingIds.includes(s.id) ? 'Synthesizing...' : 'AI Grade'}
                               </button>
                             )}
                             <a 
                               href={s.fileUrl} 
                               target="_blank" 
                               rel="noreferrer"
                               className="bg-secondary text-primary px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                             >
                                <ExternalLink className="w-3 h-3" /> Analyze
                             </a>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-center">
                  <a href="/portal/work-submissions" className="text-[9px] font-black uppercase text-gray-400 hover:text-primary transition-colors tracking-[0.2em]">Enter Submission Logistics</a>
               </div>
            </div>
          )}

          {/* LECTURER MANAGEMENT */}
          {(filterType === 'all' || filterType === 'lecturers' || defaultFilter === 'lecturers') && (
            <div className="bg-white rounded-[40px] border-2 border-primary/20 shadow-2xl overflow-hidden mt-8 min-h-[800px]">
               <div className="bg-secondary p-12 flex flex-col md:flex-row justify-between items-center gap-8 border-b-4 border-primary shadow-inner">
                  <div className="flex items-center gap-8">
                     <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-secondary shadow-2xl rotate-3">
                        <GraduationCap className="w-12 h-12" />
                     </div>
                     <div className="text-left">
                        <h2 className="text-5xl font-black italic tracking-tighter uppercase text-primary leading-none">Faculty Hub</h2>
                        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white/40 mt-3 font-mono">Verified Academic Personnel Registry</p>
                     </div>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => setIsAddingLecturer(!isAddingLecturer)}
                      className="px-8 py-4 bg-primary text-secondary rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                    >
                      {isAddingLecturer ? <Plus className="w-4 h-4 rotate-45" /> : <UserPlus className="w-4 h-4" />}
                      {isAddingLecturer ? 'ABORT ENTRY' : 'SECURE REGISTRATION'}
                    </button>
                  )}
               </div>

               {isAdmin && isAddingLecturer && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-12 bg-gray-50/50 border-b-2 border-gray-100"
                  >
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      await addLecturer(newLecturer);
                      setNewLecturer({ name: '', courseName: '' });
                      setIsAddingLecturer(false);
                    }} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-4 font-mono">Full Legal Name</label>
                        <input 
                          required
                          className="w-full h-16 bg-white px-8 rounded-2xl font-black text-lg outline-none border-2 border-gray-100 focus:border-primary transition-all shadow-sm"
                          placeholder="e.g. Dr. Alistair Krown"
                          value={newLecturer.name}
                          onChange={e => setNewLecturer({...newLecturer, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-4 font-mono">Academic Discipline</label>
                        <input 
                          required
                          className="w-full h-16 bg-white px-8 rounded-2xl font-black text-lg outline-none border-2 border-gray-100 focus:border-primary transition-all shadow-sm"
                          placeholder="e.g. Software Engineering"
                          value={newLecturer.courseName}
                          onChange={e => setNewLecturer({...newLecturer, courseName: e.target.value})}
                        />
                      </div>
                      <button type="submit" className="md:col-span-2 h-16 bg-secondary text-primary rounded-2xl font-black uppercase tracking-[0.4em] text-xs hover:bg-black transition-all shadow-xl">
                         Sync Faculty Member to Local Buffer
                      </button>
                    </form>
                  </motion.div>
               )}

               <div className="p-12 bg-gray-50/50">
                  {lecturers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {lecturers.filter(l => (l.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (l.courseName?.toLowerCase() || '').includes(searchTerm.toLowerCase())).map((lecturer) => (
                        <motion.div 
                          key={lecturer.id}
                          layout
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-10 rounded-[40px] border-2 border-gray-100 hover:border-primary/40 transition-all group relative overflow-hidden shadow-sm hover:shadow-2xl"
                        >
                           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-primary/10" />
                           
                           <div className="flex flex-col items-center text-center relative z-10">
                              <div className="w-28 h-28 bg-gray-50 rounded-[32px] overflow-hidden shadow-inner flex-shrink-0 mb-6 border-2 border-gray-100 group-hover:rotate-6 transition-all group-hover:scale-110">
                                <img 
                                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${lecturer.id}`} 
                                  className="w-full h-full object-cover"
                                  alt="Faculty"
                                />
                              </div>
                              <div className="flex-1 w-full overflow-hidden">
                                 <h4 className="text-2xl font-black text-secondary leading-none mb-3 italic tracking-tighter truncate">{lecturer.name}</h4>
                                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 bg-primary/5 inline-block px-4 py-1.5 rounded-full">{lecturer.courseName || 'General Faculty'}</p>
                                 <div className="flex flex-wrap justify-center gap-3">
                                    <span className="px-4 py-1.5 bg-gray-100 text-[9px] font-black uppercase text-gray-500 rounded-xl tracking-widest italic">Tenured</span>
                                    <span className="px-4 py-1.5 bg-emerald-100 text-[9px] font-black uppercase text-emerald-600 rounded-xl tracking-widest italic animate-pulse">Neural Linked</span>
                                 </div>
                              </div>
                           </div>

                           <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Connection</span>
                              </div>
                              {isAdmin && (
                                 <button 
                                   onClick={async () => {
                                      if(window.confirm(`Permanently remove ${lecturer.name} from faculty database?`)) {
                                         await deleteLecturer(lecturer.id);
                                      }
                                   }}
                                   className="p-4 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                 >
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                              )}
                           </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-40 flex flex-col items-center justify-center text-center">
                       <div className="w-32 h-32 bg-gray-100 rounded-[48px] flex items-center justify-center text-gray-200 mb-10 shadow-inner">
                          <Users className="w-16 h-16" />
                       </div>
                       <h3 className="text-4xl font-black text-secondary italic tracking-tighter uppercase mb-2">No Registered Faculty</h3>
                       <p className="text-gray-400 text-[12px] font-black uppercase tracking-[0.5em]">Academic Personnel Registry Offline</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>

           {/* SIDEBAR - Right Side (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* STUDENT DIRECTORY / SUPPORT SHORTCUT */}
           <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-all pointer-events-none">
                 <ShieldCheck className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-8">
                 <div className="text-left">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-2 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4" /> {isAdmin ? 'Personnel Intel' : 'Academy Support'}
                    </h3>
                    <p className="text-2xl font-black italic tracking-tighter uppercase mb-6">
                       {isAdmin ? 'Learning Nodes' : 'Support Command'}
                    </p>
                 </div>

                 <div className="space-y-3">
                    {isAdmin ? filteredStudents.map(s => (
                       <div key={s.id} className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-primary/30 transition-all group/node relative cursor-pointer" onClick={() => setSelectedStudent(s.id)}>
                          <div className="flex justify-between items-center">
                             <div className="text-left">
                                <p className="text-[10px] font-black italic text-white leading-none mb-1 capitalize">{s.fullName}</p>
                                <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">{s.studentId}</p>
                             </div>
                             <div className={cn(
                               "w-2 h-2 rounded-full",
                               s.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-gray-500"
                             )} />
                          </div>
                          
                          <AnimatePresence>
                             {selectedStudent === s.id && (
                               <motion.div 
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: 'auto', opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 className="pt-6 mt-4 border-t border-white/5 space-y-4"
                               >
                                  <div className="grid grid-cols-2 gap-4">
                                     <button className="flex items-center gap-2 text-[9px] font-black text-white/60 hover:text-primary transition-colors">
                                        <Mail className="w-3 h-3" /> DISPATCH EMAIL
                                     </button>
                                     <button className="flex items-center gap-2 text-[9px] font-black text-white/60 hover:text-primary transition-colors">
                                        <Phone className="w-3 h-3" /> CALL NODE
                                     </button>
                                  </div>
                                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                     <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-2">
                                        <span className="text-white/40">Progression</span>
                                        <span className="text-primary">{s.progress}%</span>
                                     </div>
                                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${s.progress}%` }} />
                                     </div>
                                  </div>
                               </motion.div>
                             )}
                          </AnimatePresence>
                       </div>
                    )) : (
                      <div className="space-y-4">
                         <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-2">Technical Registry</p>
                            <p className="text-white font-black italic">0779417675</p>
                            <p className="text-white/40 text-[8px] font-bold uppercase mt-1">Primary Payment & Admin Node</p>
                         </div>
                         <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-2">1-on-1 Sessions</p>
                            <p className="text-white font-black italic">0766149405</p>
                            <p className="text-white/40 text-[8px] font-bold uppercase mt-1">Mentor Booking Verification</p>
                         </div>
                         <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2">System Status</p>
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                               <p className="text-white font-black italic uppercase">All Nodes Operational</p>
                            </div>
                         </div>
                      </div>
                    )}
                 </div>

                 {isAdmin && (
                   <button className="w-full py-4 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/10">
                      Access Global Directory
                   </button>
                 )}
              </div>
           </div>

           {/* SYSTEM ANALYTICS LOG */}
           <div className="bg-white rounded-[40px] border-2 border-gray-100 p-8 text-left space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic flex items-center gap-2">
                 <Bot className="w-4 h-4 text-primary" /> Active Neural Metrics
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Unchecked Payments', val: payments.filter(p => p.status === 'Pending').length, color: 'text-amber-500' },
                   { label: 'Unmarked Modules', val: submissions.filter(s => s.status === 'pending').length, color: 'text-blue-500' },
                   { label: 'Mentor Requests', val: pendingMentors.length, color: 'text-primary' },
                   { label: 'Network Health', val: '98.4%', color: 'text-emerald-500' }
                 ].map((metric, idx) => (
                   <div key={idx} className="flex justify-between items-center group cursor-help">
                      <p className="text-[10px] font-black uppercase tracking-tight text-gray-400 group-hover:text-gray-600 transition-colors">{metric.label}</p>
                      <span className={cn("text-xl font-black italic tracking-tighter", metric.color)}>{metric.val}</span>
                   </div>
                 ))}
              </div>
              <div className="pt-6 border-t border-gray-50">
                 <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4">
                    <Zap className="w-5 h-5 text-primary animate-pulse" />
                    <div>
                       <p className="text-[8px] font-black uppercase text-gray-400">Security Invariant</p>
                       <p className="text-[10px] font-bold text-secondary uppercase italic">Supabase Sync v4.1 ACTIVE</p>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
