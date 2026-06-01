import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Zap, ShieldCheck, User, Award, CheckCircle, Search, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '../components/utils';

interface ManualResultUploaderProps {
  programName: string;
}

export function ManualResultUploader({ programName }: ManualResultUploaderProps) {
  const { students, addNotification } = useAuth();
  
  const [formData, setFormData] = useState({
    assignmentTitle: '',
    achievedScore: '',
    selectedStudentId: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter students based on role/program and search query
  const filteredStudents = (students || []).filter(student => {
    if (!student) return false;
    const fullName = typeof student.fullName === 'string' ? student.fullName : '';
    const studentId = typeof student.studentId === 'string' ? student.studentId : '';
    const query = typeof searchQuery === 'string' ? searchQuery.toLowerCase() : '';
    return fullName.toLowerCase().includes(query) || studentId.toLowerCase().includes(query);
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assignmentTitle || !formData.achievedScore) {
       addNotification('Uploader Alert', 'Please provide a valid assignment title and score percentage.', 'alert');
       return;
    }

    const scoreNum = parseFloat(formData.achievedScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
       addNotification('Uploader Alert', 'Please enter a valid percentage between 0 and 100.', 'alert');
       return;
    }

    // Call the manual bridge function as specified (which propagates both elements & React state)
    const success = window.publishAssignmentGradeManually(
       formData.assignmentTitle,
       formData.achievedScore
    );

    if (success) {
       const selectedStudent = students.find(s => s.studentId === formData.selectedStudentId);
       const recipientName = selectedStudent ? selectedStudent.fullName : 'All Active Students';
       
       setSuccessMessage(`Grade for "${formData.assignmentTitle}" (${formData.achievedScore}%) published successfully to ${recipientName}!`);
       addNotification(
         'Grade Upload Success', 
         `Result published for ${formData.assignmentTitle} on administrative channel.`, 
         'success'
       );
       
       // Clear form inputs
       setFormData({
         assignmentTitle: '',
         achievedScore: '',
         selectedStudentId: formData.selectedStudentId
       });

       setTimeout(() => setSuccessMessage(null), 6000);
    } else {
       addNotification('System Bridge Error', 'Manual registry container is offline.', 'alert');
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-6 font-sans text-left">
      <div className="border-b border-[#00f2fe]/15 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#00f2fe] animate-pulse" />
            {programName} Upload Portal
          </h1>
          <p className="text-[#38bdf8] font-bold mt-2 uppercase tracking-[0.4em] text-[10px]">
             SYS_NODE: Program Upload Matrix / Results Management
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#05112e] border border-[#00f2fe]/10 px-5 py-3 rounded-2xl">
           <ShieldCheck className="w-5 h-5 text-emerald-500" />
           <span className="text-[10px] font-black uppercase text-white tracking-widest font-mono">STAFF SECURITY CLEARANCE VERIFIED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {successMessage && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <div className="text-xs font-black uppercase tracking-wider">{successMessage}</div>
            </div>
          )}

          <div className="bg-[#0a1b44] border border-[#00f2fe]/15 p-10 shadow-xl rounded-[40px] relative overflow-hidden">
            <div className="absolute right-0 top-0 p-8 opacity-5 rotate-12 pointer-events-none">
               <Award className="w-40 h-40 text-white" />
            </div>

            <form onSubmit={handlePublish} className="space-y-8 relative z-10">
              {/* Select Student */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#38bdf8]" /> Target Student Recipient
                </label>
                <div className="relative">
                  <select
                    value={formData.selectedStudentId}
                    onChange={(e) => setFormData({ ...formData, selectedStudentId: e.target.value })}
                    className="w-full h-16 bg-[#05112e] border-2 border-[#00f2fe]/10 focus:border-[#00f2fe]/50 rounded-2xl px-6 text-sm text-white font-black uppercase tracking-wider focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="">-- Broadcasting / Publish to All Students --</option>
                    {filteredStudents.map(student => (
                      <option key={student.id} value={student.studentId}>
                        {student.fullName} ({student.studentId}) — {student.status}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#00f2fe] h-4 w-4">
                     ▼
                  </div>
                </div>
              </div>

              {/* Assignment Title Field */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#38bdf8]" /> Assignment Title
                </label>
                <input
                  type="text"
                  id="assignmentTitleField"
                  value={formData.assignmentTitle}
                  onChange={(e) => setFormData({ ...formData, assignmentTitle: e.target.value })}
                  placeholder="e.g. Advanced Penetration Testing Lab 1"
                  required
                  className="w-full h-16 bg-[#05112e] border-2 border-[#00f2fe]/10 focus:border-[#00f2fe]/50 rounded-2xl px-6 text-sm text-white font-black uppercase tracking-wider placeholder:text-gray-600 focus:outline-none"
                />
              </div>

              {/* Score Percentage Field */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#38bdf8]" /> Achieved Score Percentage
                </label>
                <input
                  type="number"
                  id="assignmentScoreField"
                  value={formData.achievedScore}
                  onChange={(e) => setFormData({ ...formData, achievedScore: e.target.value })}
                  placeholder="e.g. 94"
                  required
                  min="0"
                  max="100"
                  className="w-full h-16 bg-[#05112e] border-2 border-[#00f2fe]/10 focus:border-[#00f2fe]/50 rounded-2xl px-6 text-sm text-white font-black uppercase tracking-wider placeholder:text-gray-600 focus:outline-none"
                />
              </div>

              {/* Submit Grade Button */}
              <button
                type="submit"
                id="adminSubmitGradeBtn"
                className="w-full h-16 bg-[#00f2fe] text-[#05112e] rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#00f2fe]/20 hover:bg-[#00c6ff] hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Trigger Manual Publish
                <Zap className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          <div className="bg-[#05112e] border border-[#00f2fe]/15 p-8 rounded-[36px] text-white">
            <Sparkles className="w-8 h-8 text-[#00f2fe] mb-5 animate-pulse" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">Manual Publishing Bridge</h3>
            <p className="text-xs text-[#8fa3c7] leading-relaxed mb-6 font-semibold uppercase tracking-wide">
              Results entered in this portal trigger the Global Shared State Engine in real-time. Students connected to this interface will instantly view published changes in their Performance Grade Matrix redraw cycle.
            </p>
            <div className="space-y-3 pt-4 border-t border-[#00f2fe]/10">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-gray-400">Class State:</span>
                <span className="text-emerald-400">SYNC_ENABLED</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-gray-400">Data Broadcaster:</span>
                <span className="text-[#00f2fe]">CHANNEL_METRIC_B</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0a1b44] border border-[#00f2fe]/10 p-8 rounded-[36px]">
             <h4 className="text-[10px] font-extrabold uppercase text-[#38bdf8] tracking-widest mb-6">Active Student Registry Roster</h4>
             <div className="relative mb-4">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
               <input
                 type="text"
                 placeholder="Search roster..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full h-11 bg-[#05112e] border border-[#00f2fe]/10 rounded-xl pl-11 pr-4 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00f2fe]/30"
               />
             </div>
             <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(st => (
                    <button
                      key={st.id}
                      onClick={() => setFormData({ ...formData, selectedStudentId: st.studentId })}
                      className={cn(
                        "w-full p-4 rounded-xl text-left text-xs uppercase font-semibold border transition-all flex justify-between items-center group",
                        formData.selectedStudentId === st.studentId
                          ? "bg-[#00f2fe] text-[#05112e] border-[#00f2fe]"
                          : "bg-[#05112e] border-transparent hover:border-[#00f2fe]/10 text-white"
                      )}
                    >
                      <div>
                        <p className="font-extrabold">{st.fullName}</p>
                        <p className={cn("text-[9px] mt-1 font-mono", formData.selectedStudentId === st.studentId ? "text-slate-800" : "text-gray-500")}>ID: {st.studentId}</p>
                      </div>
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded",
                        st.status === 'Active' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {st.status}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-gray-500 uppercase text-center py-4">No matching students</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
