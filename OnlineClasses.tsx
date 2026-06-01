import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Video, Plus, Calendar, Clock, Link as LinkIcon, MoreVertical, ExternalLink, VideoOff, MessageCircle, Mic, Trash2, Edit2, Play, CheckCircle, AlertCircle, LayoutGrid, List } from 'lucide-react';
import { cn } from '../components/utils';
import { OnlineClass } from '../context/types';

export function OnlineClasses() {
  const { onlineClasses, addOnlineClass, updateOnlineClass, deleteOnlineClass, courses, user } = useAuth();
  const [isScheduling, setIsScheduling] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [newClass, setNewClass] = useState<Partial<OnlineClass>>({
    platform: 'google-meet',
    status: 'scheduled',
    duration: 60
  });

  const canManage = user?.role === 'admin' || user?.role === 'instructor';

  const liveClasses = onlineClasses.filter(c => c.status === 'live');
  const scheduledClasses = onlineClasses.filter(c => c.status === 'scheduled').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const completedClasses = onlineClasses.filter(c => c.status === 'completed');

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClass.title && newClass.courseId && newClass.startTime && newClass.meetingLink) {
      addOnlineClass(newClass as Omit<OnlineClass, 'id'>);
      setIsScheduling(false);
      setNewClass({ platform: 'google-meet', status: 'scheduled', duration: 60 });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google-meet': return <Video className="w-5 h-5 text-blue-500" />;
      case 'zoom': return <Video className="w-5 h-5 text-indigo-500" />;
      case 'whatsapp': return <MessageCircle className="w-5 h-5 text-green-500" />;
      default: return <Mic className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">Synchronous Learning</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Academic Live Stream Gateway // Virtual Campus Node</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-gray-400")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('timeline')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'timeline' ? "bg-white text-primary shadow-sm" : "text-gray-400")}
              >
                <List className="w-4 h-4" />
              </button>
           </div>
           {canManage && (
            <button 
              onClick={() => setIsScheduling(true)}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-primary/20"
            >
              <Video className="w-4 h-4" /> Initialize Session
            </button>
           )}
        </div>
      </div>

      {isScheduling && (
        <div className="bg-white p-8 rounded-3xl border-2 border-primary shadow-2xl animate-in zoom-in-95 duration-300">
          <h2 className="text-xl font-black italic mb-6 uppercase">Schedule New Class</h2>
          <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class Title</label>
              <input 
                required
                className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary font-bold"
                placeholder="e.g. Cyber Security Week 1 Review"
                onChange={e => setNewClass({...newClass, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Course</label>
              <select 
                required
                className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary font-bold"
                onChange={e => setNewClass({...newClass, courseId: e.target.value})}
              >
                <option value="">Choose Course...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Start Time</label>
              <input 
                required
                type="datetime-local"
                className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary font-bold"
                onChange={e => setNewClass({...newClass, startTime: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Platform</label>
              <select 
                className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary font-bold"
                onChange={e => setNewClass({...newClass, platform: e.target.value as any})}
              >
                <option value="google-meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="whatsapp">WhatsApp Group Call</option>
                <option value="other">Audio Only / Other</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Meeting Link</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  required
                  className="w-full p-4 pl-12 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary font-bold"
                  placeholder="https://..."
                  onChange={e => setNewClass({...newClass, meetingLink: e.target.value})}
                />
              </div>
            </div>
            <div className="md:col-span-2 flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg">Confirm Schedule</button>
              <button type="button" onClick={() => setIsScheduling(false)} className="px-8 bg-gray-100 text-gray-500 py-4 rounded-xl font-black uppercase tracking-widest text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-12">
        {/* Live Section */}
        {liveClasses.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
               <h2 className="text-sm font-black uppercase tracking-[0.3em] text-red-500 italic">Sessions In Progress</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveClasses.map(cls => <ClassCard key={cls.id} cls={cls} isLive={true} canManage={canManage} onUpdate={updateOnlineClass} onDelete={deleteOnlineClass} courses={courses} />)}
            </div>
          </section>
        )}

        {/* Scheduled Section */}
        <section className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-secondary italic">Upcoming Academic Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scheduledClasses.map(cls => <ClassCard key={cls.id} cls={cls} isLive={false} canManage={canManage} onUpdate={updateOnlineClass} onDelete={deleteOnlineClass} courses={courses} />)}
            {scheduledClasses.length === 0 && (
              <div className="col-span-full py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                 <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">No future broadcasts indexed in global partition</p>
              </div>
            )}
          </div>
        </section>

        {/* Completed Section (Optional/Filtered) */}
        {completedClasses.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-300 italic">Archive Intelligence (Past Sessions)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-60 hover:opacity-100 transition-opacity">
              {completedClasses.map(cls => <ClassCard key={cls.id} cls={cls} isLive={false} canManage={canManage} onUpdate={updateOnlineClass} onDelete={deleteOnlineClass} courses={courses} />)}
            </div>
          </section>
        )}
      </div>

      <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <MessageCircle className="w-32 h-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 italic">Collaborative Learning</h3>
          <h2 className="text-3xl font-black italic tracking-tighter mb-4 leading-tight">"Education is a conversation. Join our virtual halls and learn together."</h2>
          <p className="text-white/60 font-medium text-sm leading-relaxed mb-6">
            Our online classes are fully integrated with real-time feedback. Whether it's a technical demonstration via Google Meet or a quick check-in on WhatsApp, we maintain the ITA standard of excellence.
          </p>
          <div className="flex flex-wrap gap-4">
             <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Global Relay Active</span>
             </div>
             <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Fiber Low-Latency Node</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassCard({ cls, isLive, canManage, onUpdate, onDelete, courses }: { cls: OnlineClass; isLive: boolean; canManage: boolean; onUpdate: any; onDelete: any; courses: any[] }) {
  const course = courses.find(c => c.id === cls.courseId);
  const isCompleted = cls.status === 'completed';

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google-meet': return <Video className="w-5 h-5 text-blue-500" />;
      case 'zoom': return <Video className="w-5 h-5 text-indigo-500" />;
      case 'whatsapp': return <MessageCircle className="w-5 h-5 text-green-500" />;
      default: return <Mic className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className={cn(
      "p-8 bg-white rounded-[40px] border-2 transition-all group relative overflow-hidden flex flex-col justify-between",
      isLive ? "border-primary shadow-2xl shadow-primary/20 scale-105 z-10" : "border-gray-100 hover:border-primary/30"
    )}>
      {isLive && (
        <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-2xl text-[8px] font-black uppercase tracking-widest animate-pulse border-4 border-white shadow-xl">
          <span className="w-2 h-2 bg-white rounded-full" /> Transmission Live
        </div>
      )}
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner mt-2",
            isLive ? "bg-primary text-white" : "bg-gray-50 text-gray-400"
          )}>
            {getPlatformIcon(cls.platform)}
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-primary italic">{course?.name || 'Academic Domain'}</p>
            <h3 className="text-xl font-black italic leading-tight text-gray-900 tracking-tight">{cls.title}</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-50 mt-4">
          <div className="space-y-1">
             <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Event Date</p>
             <p className="text-xs font-bold text-gray-700">{new Date(cls.startTime).toLocaleDateString()}</p>
          </div>
          <div className="space-y-1">
             <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time-Window</p>
             <p className="text-xs font-bold text-gray-700">
               {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8 pt-6">
        {!isCompleted && (
          <a 
            href={cls.meetingLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              "flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all",
              isLive 
                ? "bg-secondary text-white shadow-xl shadow-secondary/20 hover:scale-105" 
                : "bg-gray-900 text-white hover:bg-black"
            )}
          >
            {isLive ? <Play className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
            {isLive ? 'Accelerate to Join' : 'Access Node'}
          </a>
        )}
        {canManage && (
          <div className="flex gap-2">
            {!isCompleted ? (
              <button 
                onClick={() => onUpdate(cls.id, { status: isLive ? 'completed' : 'live' })}
                className={cn(
                  "px-5 rounded-2xl flex items-center justify-center transition-all",
                  isLive ? "bg-emerald-50 text-emerald-500 border border-emerald-100" : "bg-primary/5 text-primary border border-primary/10"
                )}
                title={isLive ? "Mark as Completed" : "Initialize Live Broadcast"}
              >
                {isLive ? <CheckCircle className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            ) : (
              <button 
                onClick={() => onUpdate(cls.id, { status: 'live' })}
                className="px-5 bg-orange-50 text-orange-500 rounded-2xl border border-orange-100"
                title="Restore Live State"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => onDelete(cls.id)}
              className="px-5 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
