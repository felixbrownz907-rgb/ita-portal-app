import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, BookOpen, ChevronRight, LayoutGrid, List, FileText, Music, Link as LinkIcon, FileCheck, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../components/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TimetableEntry } from '../context/types';

export function Timetable() {
  const { timetable, courses, lecturers, user, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<TimetableEntry, 'id'>>({
    day: 'Monday',
    sessionTime: '09:00 - 11:00',
    courseId: '',
    lecturerId: '',
    notes: ''
  });

  // ITA [PROTOCOL]: Ensure session forms are initialized with valid data nodes
  useEffect(() => {
    if (courses.length > 0 && !newEntry.courseId) {
      setNewEntry(prev => ({ ...prev, courseId: courses[0].id }));
    }
    if (lecturers.length > 0 && !newEntry.lecturerId) {
      setNewEntry(prev => ({ ...prev, lecturerId: lecturers[0].id }));
    }
  }, [courses, lecturers]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || id;
  const getLecturerName = (id: string) => lecturers.find(l => l.id === id)?.name || 'TBA';

  const timetableByDay = days.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.day === day).sort((a,b) => a.sessionTime.localeCompare(b.sessionTime));
    return acc;
  }, {} as Record<string, typeof timetable>);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    setIsUpdating(true);
    try {
      await updateTimetableEntry(editingEntry.id, editingEntry);
      setEditingEntry(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await addTimetableEntry(newEntry);
      setIsAdding(false);
      setNewEntry({
        day: 'Monday',
        sessionTime: '09:00 - 11:00',
        courseId: courses[0]?.id || '',
        lecturerId: lecturers[0]?.id || '',
        notes: ''
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      await deleteTimetableEntry(id);
    }
  };

  const canEdit = user?.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-primary italic leading-none">Weekly Study Hub</h1>
          <p className="text-gray-500 font-medium mt-2 uppercase tracking-[0.2em] text-[10px]">Academic Synchronization Protocol // Timetable v4.1.0</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
          {canEdit && (
            <button 
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <LayoutGrid className="w-3 h-3" /> Add Session
            </button>
          )}
          <button 
            onClick={() => setViewMode('grid')}
            className={cn(
              "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <LayoutGrid className="w-3 h-3" /> Grid View
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn(
              "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <List className="w-3 h-3" /> List View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day === selectedDay ? null : day)}
            className={cn(
              "p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
              selectedDay === day 
                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105" 
                : "bg-white border-gray-100 text-gray-400 hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
              day === currentDay && selectedDay !== day && "border-primary/40 ring-1 ring-primary/20"
            )}
          >
            {day === currentDay && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <span className="text-[7px] font-black uppercase tracking-[0.1em] text-primary group-hover:text-primary">Today</span>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--color-primary),0.5)]" />
              </div>
            )}
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{day.substring(0, 3)}</p>
            <p className="text-lg font-black uppercase tracking-tighter leading-none">{day}</p>
            <div className={cn(
              "h-1 w-8 rounded-full mt-3 transition-all",
              selectedDay === day ? "bg-white" : "bg-primary/20 group-hover:bg-primary",
              day === currentDay && selectedDay !== day && "bg-primary w-12"
            )} />
          </button>
        ))}
      </div>

      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1"
      )}>
        {(selectedDay ? [selectedDay] : days).map(day => (
          <React.Fragment key={day}>
            {!selectedDay && (
              <div className="col-span-full mt-8 first:mt-0">
                <div className="flex items-center gap-4">
                   <div className="h-px flex-1 bg-gray-100" />
                   <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                     <Calendar className="w-3 h-3" /> {day} Schedule
                   </h2>
                   <div className="h-px flex-1 bg-gray-100" />
                </div>
              </div>
            )}
            {timetableByDay[day]?.map((entry, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={entry.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all border-b-4 border-b-gray-100 hover:border-b-primary group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 group-hover:rotate-0 transform transition-transform duration-500">
                  <BookOpen className="w-24 h-24" />
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                      <Clock className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{entry.sessionTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(entry.pdfUrl || entry.audioUrl || entry.wpsLink) && (
                        <div className="flex -space-x-1">
                          {entry.pdfUrl && <div className="w-2 h-2 rounded-full bg-red-500 border border-white" title="PDF Available" />}
                          {entry.audioUrl && <div className="w-2 h-2 rounded-full bg-blue-500 border border-white" title="Audio Available" />}
                          {entry.wpsLink && <div className="w-2 h-2 rounded-full bg-green-500 border border-white" title="Link Available" />}
                        </div>
                      )}
                      {canEdit && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setEditingEntry(entry)}
                            className="p-1.5 hover:bg-primary/10 rounded-full text-gray-400 hover:text-primary transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-black text-gray-900 leading-tight uppercase group-hover:text-primary transition-colors flex-1">
                        {getCourseName(entry.courseId)}
                      </h3>
                      {(entry.pdfUrl || entry.audioUrl) && (
                        <div className="shrink-0 flex items-center gap-1.5">
                           {entry.pdfUrl && (
                             <a 
                               href={entry.pdfUrl} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="px-2 py-0.5 bg-red-500/10 text-red-600 rounded text-[7px] font-black uppercase tracking-widest border border-red-500/20 flex items-center gap-1 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                             >
                               <FileText className="w-2.5 h-2.5" /> PDF
                             </a>
                           )}
                           {entry.audioUrl && (
                             <a 
                               href={entry.audioUrl} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[7px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-1 hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                             >
                               <Music className="w-2.5 h-2.5" /> Audio
                             </a>
                           )}
                           <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[7px] font-black uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                             Digital Sync
                           </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {getLecturerName(entry.lecturerId)}
                      </span>
                    </div>
                  </div>

                  {entry.notes && (
                    <p className="text-[11px] text-gray-500 font-medium line-clamp-2 leading-relaxed">
                      {entry.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {entry.pdfUrl && (
                      <a href={entry.pdfUrl} target="_blank" rel="noopener noreferrer" className="pl-2 pr-3 py-1.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100/50 group/btn" title="PDF Notes">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">PDF Notes</span>
                      </a>
                    )}
                    {entry.audioUrl && (
                      <a href={entry.audioUrl} target="_blank" rel="noopener noreferrer" className="pl-2 pr-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2 border border-blue-100/50 group/btn" title="Audio Lecture">
                        <Music className="w-3.5 h-3.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Audio Record</span>
                      </a>
                    )}
                    {entry.wpsLink && (
                      <a href={entry.wpsLink} target="_blank" rel="noopener noreferrer" className="pl-2 pr-3 py-1.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all flex items-center gap-2 border border-green-100/50 group/btn" title="Collaborative Workspace">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Work Lab</span>
                      </a>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        (entry.pdfUrl || entry.audioUrl) ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                      )} />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest transition-colors italic",
                        (entry.pdfUrl || entry.audioUrl) ? "text-emerald-600" : "text-gray-400 group-hover:text-primary"
                      )}>
                        {entry.pdfUrl || entry.audioUrl ? 'Materials Released' : (entry.notes ? 'Overview Logged' : 'In-Person Session')}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
            {timetableByDay[day]?.length === 0 && (
              <div className="col-span-1 p-10 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center opacity-40">
                <Calendar className="w-8 h-8 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Sessions Assigned</p>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
            >
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none italic">Assign New Session</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Academic Scheduling Protocol // Central Unit</p>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Day</label>
                       <select 
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                         value={newEntry.day}
                         onChange={e => setNewEntry({...newEntry, day: e.target.value})}
                       >
                         {days.map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Time Window</label>
                       <input 
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                         value={newEntry.sessionTime}
                         onChange={e => setNewEntry({...newEntry, sessionTime: e.target.value})}
                         placeholder="09:00 - 11:00"
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Module / Course</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newEntry.courseId}
                      onChange={e => setNewEntry({...newEntry, courseId: e.target.value})}
                    >
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Assigned Lecturer</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newEntry.lecturerId}
                      onChange={e => setNewEntry({...newEntry, lecturerId: e.target.value})}
                    >
                      {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Session Notes</label>
                    <textarea 
                      value={newEntry.notes || ''}
                      onChange={e => setNewEntry({...newEntry, notes: e.target.value})}
                      placeholder="Objectives, topics, etc..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 px-6 py-3 rounded-2xl border border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {isUpdating ? 'Synchronizing...' : 'Assign Session'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {editingEntry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingEntry(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
            >
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">Session Resources</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{getCourseName(editingEntry.courseId)} // {editingEntry.day} {editingEntry.sessionTime}</p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Session Notes</label>
                    <textarea 
                      value={editingEntry.notes || ''}
                      onChange={e => setEditingEntry({...editingEntry, notes: e.target.value})}
                      placeholder="Add summary or key learning outcomes..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">PDF Document (URL)</label>
                      <div className="flex gap-2">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-red-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <input 
                          type="url"
                          value={editingEntry.pdfUrl || ''}
                          onChange={e => setEditingEntry({...editingEntry, pdfUrl: e.target.value})}
                          placeholder="https://example.com/lecture.pdf"
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Audio Recording (URL)</label>
                      <div className="flex gap-2">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-blue-500">
                          <Music className="w-4 h-4" />
                        </div>
                        <input 
                          type="url"
                          value={editingEntry.audioUrl || ''}
                          onChange={e => setEditingEntry({...editingEntry, audioUrl: e.target.value})}
                          placeholder="https://example.com/lecture.mp3"
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">WPS / Collaborative Link</label>
                      <div className="flex gap-2">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-green-500">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <input 
                          type="url"
                          value={editingEntry.wpsLink || ''}
                          onChange={e => setEditingEntry({...editingEntry, wpsLink: e.target.value})}
                          placeholder="https://wps.com/join/..."
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setEditingEntry(null)}
                      className="flex-1 px-6 py-3 rounded-2xl border border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {isUpdating ? 'Synchronizing...' : 'Update Session'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-12 bg-gray-900 rounded-[40px] p-10 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 rounded-full border border-primary/30">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic">Live Attendance Monitoring</span>
               </div>
               <h2 className="text-3xl font-black uppercase tracking-tight leading-none italic">Academic Excellence is <br /> <span className="text-primary italic">Built on Discipline</span></h2>
               <p className="text-xs font-medium text-white/40 uppercase tracking-widest max-w-md">Attend all scheduled sessions to maximize your technical performance and certification eligibility.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
               <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-[10px] font-black uppercase text-white/30 mb-2">Weekly Load</p>
                  <p className="text-2xl font-black text-primary italic">28 <span className="text-xs text-white/60 NOT-italic font-bold">Hrs</span></p>
               </div>
               <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-[10px] font-black uppercase text-white/30 mb-2">Lecturers</p>
                  <p className="text-2xl font-black text-primary italic">{lecturers.length}</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
