import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Book, Search, Download, Bookmark, FileText, Filter, BookOpen, ExternalLink, Archive, Plus, Trash2, Link as LinkIcon, FileCheck, Mic, Video, Cpu } from 'lucide-react';
import { LibraryItem } from '../context/types';
import { cn } from '../components/utils';

export function ELibrary() {
  const { libraryItems, addLibraryItem, deleteLibraryItem, courses, user, learningMaterials } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<LibraryItem>>({
    type: 'Note',
    category: 'General'
  });

  const categories = ['All', 'Book', 'Past Paper', 'Practical', 'Reference', 'Note', 'Audio', 'Video', 'Link', 'Doc'];
  const isAdmin = user?.role === 'admin' || user?.role === 'staff' || user?.username === 'Felix Brown (Developer)';
  const isStudent = user?.role === 'student';
  const isLocked = false;
  const studentCourseId = user?.studentData?.courseId;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.title && newItem.author && newItem.type && newItem.category) {
      addLibraryItem({
        title: newItem.title,
        author: newItem.author,
        type: newItem.type as any,
        category: newItem.category,
        fileUrl: newItem.fileUrl || '#',
        courseId: newItem.courseId
      });
      setIsAdding(false);
      setNewItem({ type: 'Note', category: 'General' });
    }
  };

  const allDisplayItems: LibraryItem[] = [
    ...libraryItems,
    ...learningMaterials.map(m => ({
      id: m.id,
      title: m.title,
      author: 'Academy Resources',
      type: (m.type === 'pdf' ? 'Doc' : m.type === 'link' ? 'Link' : m.type === 'video' ? 'Video' : 'Note') as any,
      category: 'Course Material',
      fileUrl: m.url,
      courseId: m.moduleId
    }))
  ];

  const filteredItems = allDisplayItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.type === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex justify-between items-end text-left">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">Academy E-Library</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Academic Repository & Secure Digital Artifacts</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Deposit Artifact
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border-2 border-primary shadow-2xl animate-in zoom-in-95 duration-300">
          <h2 className="text-xl font-black italic mb-6 uppercase">Upload Academic Resource</h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Title / Nomenclature</label>
              <input 
                required
                className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary font-bold"
                placeholder="e.g. Advanced Cryptography Notes"
                onChange={e => setNewItem({...newItem, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Origin / Author</label>
              <input 
                required
                className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary font-bold"
                placeholder="e.g. Dr. Kelvin M."
                onChange={e => setNewItem({...newItem, author: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Classification</label>
              <select 
                className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary font-bold text-sm"
                onChange={e => setNewItem({...newItem, type: e.target.value as any})}
              >
                <option value="Note">Class Note / PDF</option>
                <option value="Practical">Practical Material / Lab Guide</option>
                <option value="Book">Official Textbook</option>
                <option value="Past Paper">Examination Archive</option>
                <option value="Reference">Technical Documentation</option>
                <option value="Audio">Audio Lecture / Podcast</option>
                <option value="Video">Video Tutorial</option>
                <option value="Link">External Resource Link</option>
                <option value="Doc">Word / Text Document</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Module Alignment</label>
              <select 
                className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary font-bold text-sm"
                onChange={e => setNewItem({...newItem, courseId: e.target.value})}
              >
                <option value="">General Access</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Source URL / Link</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  required
                  className="w-full p-4 pl-12 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary font-bold"
                  placeholder="https://storage.ita.ac/notes/pdf..."
                  onChange={e => setNewItem({...newItem, fileUrl: e.target.value})}
                />
              </div>
            </div>
            <div className="md:col-span-2 flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg">Confirm Deposit</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-8 bg-gray-100 text-gray-500 py-4 rounded-xl font-black uppercase tracking-widest text-xs">Abort</button>
            </div>
          </form>
        </div>
      )}

      {/* Header / Search */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input 
            type="text"
            placeholder="Scan the digital archives..."
            className="w-full h-16 bg-gray-50 border-0 pl-16 pr-8 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100">
           {categories.map(cat => (
             <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                activeCategory === cat ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
              )}
             >
               {cat}s
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-left">
        {filteredItems.map(item => {
          const IconComp = {
            'Book': Book,
            'Past Paper': Archive,
            'Reference': FileText,
            'Note': FileCheck,
            'Practical': Cpu,
            'Audio': Mic,
            'Video': Video,
            'Link': LinkIcon,
            'Doc': FileText
          }[item.type] || Archive;

          return (
            <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 pt-8 h-full bg-gray-50 group-hover:bg-primary transition-colors" />
        <div className="flex justify-between items-start mb-8">
              <div className={cn(
                "w-16 h-20 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] relative z-10 group-hover:scale-110 transition-transform duration-500",
                item.type === 'Book' ? "bg-gradient-to-br from-amber-400 to-orange-600" : 
                item.type === 'Past Paper' ? "bg-gradient-to-br from-blue-400 to-indigo-600" : 
                item.type === 'Practical' ? "bg-gradient-to-br from-cyan-400 to-teal-600" :
                item.type === 'Note' ? "bg-gradient-to-br from-emerald-400 to-green-600" : 
                item.type === 'Audio' ? "bg-gradient-to-br from-rose-400 to-pink-600" : 
                item.type === 'Video' ? "bg-gradient-to-br from-indigo-400 to-violet-600" : "bg-gradient-to-br from-purple-400 to-fuchsia-600"
              )}>
                <IconComp className="w-8 h-8" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              </div>
              {isAdmin && (
                <button 
                  onClick={() => deleteLibraryItem(item.id)}
                  className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase text-primary tracking-[0.2em] mb-3">{item.category}</p>
              <h3 className="text-xl font-black text-gray-900 leading-tight mb-3 group-hover:text-primary transition-colors tracking-tight italic">
                {item.title}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.author}</p>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-50">
              <a 
                href={item.fileUrl} 
                className="w-full h-14 bg-gray-900 text-white rounded-2xl hover:bg-primary transition-all shadow-xl flex items-center justify-center gap-3 group-hover:scale-[1.02] active:scale-95 font-black uppercase tracking-widest text-[10px]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-5 h-5" />
                Open Artifact
              </a>
            </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-24 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Archive className="w-8 h-8 text-gray-200" />
             </div>
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Query Return Null: No matching artifacts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
