import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, BookOpen, Layers, PlayCircle, FileText, ChevronRight, Save, X, CheckCircle, Video, Headset, Link2, Download, ArrowLeft, ArrowRight, Settings, ExternalLink, Library, Sparkles, Monitor, Shield, Code, Award, Lock, Unlock } from 'lucide-react';
import { Course, Module, Lesson } from '../context/types';
import { cn } from '../components/utils';
import ReactMarkdown from 'react-markdown';
import { AICourseGenesis } from '../components/AICourseGenesis';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

const getQuestionsForModule = (title: string): QuizQuestion[] => {
  const t = title.toLowerCase();
  
  if (t.includes('java') || t.includes('html')) {
    return [
      {
        question: 'Which HTML5 element is used to display self-contained content, like illustrations, diagrams, or photos?',
        options: ['<section>', '<figure>', '<aside>', '<canvas>'],
        answer: '<figure>'
      },
      {
        question: 'What is the correct way to declare an abstract class in Java?',
        options: [
          'public abstract class Vehicle {}',
          'public class Vehicle abstract {}',
          'public static class Vehicle abstract {}',
          'abstract public Vehicle {}'
        ],
        answer: 'public abstract class Vehicle {}'
      },
      {
        question: 'Which keyword is used to refer to a superclass object or trigger his constructor in Java class inheritance?',
        options: ['this', 'super', 'interface', 'extends'],
        answer: 'super'
      }
    ];
  }
  
  if (t.includes('app') || t.includes('mobile') || t.includes('ios') || t.includes('android')) {
    return [
      {
        question: 'Which layout container is the primary building block for native declarative user interfaces in SwiftUI?',
        options: ['VStack', 'LinearLayout', 'ConstraintLayout', 'DivBlock'],
        answer: 'VStack'
      },
      {
        question: 'How do you define a non-blocking asynchronous coroutine stream in mobile Kotlin development?',
        options: ['new Thread()', 'suspend function / launch()', 'Runnable.run()', 'System.async()'],
        answer: 'suspend function / launch()'
      },
      {
        question: 'What is the primary compilation build tool used by Google Android development environments?',
        options: ['Xcode', 'Maven', 'Gradle', 'Vite'],
        answer: 'Gradle'
      }
    ];
  }
  
  if (t.includes('front-end') || t.includes('react') || t.includes('css')) {
    return [
      {
        question: 'Which React hook is used to optimize performance by caching the typed values of a slow functional calculation?',
        options: ['useEffect', 'useState', 'useMemo', 'useRef'],
        answer: 'useMemo'
      },
      {
        question: 'What Tailwind utility class sets an item to display as a grid containing 3 columns on medium screen sizes?',
        options: ['grid-cols-3 md:grid', 'md:grid-cols-3', 'lg:grid-cols-3', 'cols-span-3'],
        answer: 'md:grid-cols-3'
      },
      {
        question: 'How does React know when to trigger the callback function passed to a useEffect hook?',
        options: ['Every time any element re-renders', 'Based on a tick timer', 'When values in the dependency array change', 'When state variables are deleted'],
        answer: 'When values in the dependency array change'
      }
    ];
  }
  
  if (t.includes('back-end') || t.includes('server') || t.includes('node') || t.includes('db') || t.includes('sql')) {
    return [
      {
        question: 'What does the `--packages=external` flag do when compiling backend servers with esbuild?',
        options: [
          'Bundles all external libraries into a single file',
          'Keeps external node_modules completely out of the resulting bundle',
          'Changes CSS modules directory structures',
          'Uploads compiled routes stream to the Cloud'
        ],
        answer: 'Keeps external node_modules completely out of the resulting bundle'
      },
      {
        question: 'Which method is used in Express framework to intercept and extract route query parameters safely?',
        options: ['req.query', 'req.params', 'req.body', 'req.headers'],
        answer: 'req.query'
      },
      {
        question: 'What is the purpose of database transactions (using ACID standards) in SQL databases?',
        options: [
          'To format text styling lists',
          'To guarantee multiple operations either all succeed or all rollback cleanly',
          'To optimize front-end bundle compilation streams',
          'To create responsive layout presets'
        ],
        answer: 'To guarantee multiple operations either all succeed or all rollback cleanly'
      }
    ];
  }
  
  if (t.includes('hack') || t.includes('penetration') || t.includes('reco')) {
    return [
      {
        question: 'Which Nmap scanning flag combination is used for stealthy TCP SYN port scanning without completing hands-shakes?',
        options: ['-sS', '-sT', '-sU', '-sO'],
        answer: '-sS'
      },
      {
        question: 'What type of exploit vector takes advantage of input variables to inject malicious script executions inside user browsers?',
        options: ['SQL Injection', 'Cross-Site Scripting (XSS)', 'ARP Poisoning', 'Buffer Overflow'],
        answer: 'Cross-Site Scripting (XSS)'
      },
      {
        question: 'What does OWASP stand for in global cybersecurity analyst operations?',
        options: [
          'Open Web Application Security Project',
          'Official Website Authentication Shield Protocol',
          'Object Web Association Standard Packets',
          'Outer Wireless Security Portals'
        ],
        answer: 'Open Web Application Security Project'
      }
    ];
  }
  
  // Default cisco networking
  return [
    {
      question: 'Which subnet mask corresponds to a standard classless inter-domain routing (CIDR) notation of /24?',
      options: ['255.255.0.0', '255.255.255.0', '255.255.255.255', '255.0.0.0'],
      answer: '255.255.255.0'
    },
    {
      question: 'What official protocol is used to map IP logical addresses to physical hardware MAC addresses on a local area network?',
      options: ['DNS', 'DHCP', 'ARP', 'ICMP'],
      answer: 'ARP'
    },
    {
      question: 'What Cisco Catalyst configuration isolates physical network segments logically at layer 2?',
      options: ['VPN Bridge', 'ACL Registry', 'VLAN Configuration', 'TACACS+ Protocol'],
      answer: 'VLAN Configuration'
    }
  ];
};

export function Courses() {
  const { courses, addCourse, updateCourse, deleteCourse, user, learningMaterials, addLearningMaterial, deleteLearningMaterial, completions, toggleLessonCompletion } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'genesis'>('catalog');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseData, setNewCourseData] = useState({ name: '', description: '', duration: '6 Months', price: 'ZK 1,000', videoUrl: '' });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<'all' | 'software' | 'IT' | 'cybersecurity'>('all');
  
  // Crossed/unlocked module exams tracking state synced to localStorage
  const [passedExams, setPassedExams] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ita_passed_exams');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Quiz interactive testing modules states
  const [activeQuizForModule, setActiveQuizForModule] = useState<Module | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isViewingCertificate, setIsViewingCertificate] = useState(false);

  // Simulated rapid payment deposit gateway
  const [isSimulatingDeposit, setIsSimulatingDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newMaterialData, setNewMaterialData] = useState({ title: '', author: '', type: 'book' as const, url: '', moduleId: '' });
  const [editingLesson, setEditingLesson] = useState<{ courseId: string, moduleId: string, lessonId: string } | null>(null);
  const [editingModule, setEditingModule] = useState<{ courseId: string, moduleId: string } | null>(null);
  const [lessonFormData, setLessonFormData] = useState<Lesson | null>(null);
  const [moduleFormData, setModuleFormData] = useState<{ title: string, order: number } | null>(null);
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);
  
  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor' || isAdmin;
  const isStudent = user?.role === 'student';
  const isLocked = false;

  const handleOpenIntegratedNotes = (url: string, title: string) => {
    window.dispatchEvent(new CustomEvent('open-integrated-notes', {
      detail: { url, title }
    }));
  };

  const handleAddProgramNote = (course: Course, title: string, url: string) => {
    const newNote = {
      id: crypto.randomUUID(),
      title,
      url
    };
    const updatedNotes = course.programNotes ? [...course.programNotes, newNote] : [newNote];
    const updatedCourse = {
      ...course,
      programNotes: updatedNotes
    };
    updateCourse(updatedCourse);
  };

  const handleDeleteProgramNote = (course: Course, noteId: string) => {
    if (!course.programNotes) return;
    const updatedNotes = course.programNotes.filter(n => n.id !== noteId);
    const updatedCourse = {
      ...course,
      programNotes: updatedNotes
    };
    updateCourse(updatedCourse);
  };

  const getCourseDept = (course: Course): 'software' | 'IT' | 'cybersecurity' => {
    const name = (course.name || '').toLowerCase();
    const desc = (course.description || '').toLowerCase();
    if (
      name.includes('cyber') || 
      name.includes('security') || 
      name.includes('hack') || 
      name.includes('analyst') ||
      desc.includes('cyber') ||
      desc.includes('security')
    ) {
      return 'cybersecurity';
    }
    if (
      name.includes('front-end') || 
      name.includes('back-end') || 
      name.includes('software') || 
      name.includes('programm') || 
      name.includes('developer') || 
      name.includes('java') ||
      desc.includes('software') ||
      desc.includes('programm')
    ) {
      return 'software';
    }
    return 'IT';
  };

  const accessibleCourses = courses;

  const currentDeptCourses = selectedDept === 'all'
    ? accessibleCourses
    : accessibleCourses.filter(c => getCourseDept(c) === selectedDept);
  const activeCourseId = selectedCourseId && currentDeptCourses.some(c => c.id === selectedCourseId)
    ? selectedCourseId 
    : null;

  const selectedCourse = activeCourseId ? accessibleCourses.find(c => c.id === activeCourseId) : null;

  // Auto-completion helper
  const markAsComplete = (lessonId: string) => {
    if (isStudent && !completions.includes(lessonId)) {
      toggleLessonCompletion(lessonId);
    }
  };

  const handleLessonView = (lesson: Lesson) => {
    setViewingLesson(lesson);
    // Auto-mark as complete if it has no video, PDF, or audio content
    if (!lesson.videoUrl && !lesson.pdfUrl && !lesson.audioUrl) {
      markAsComplete(lesson.id);
    }
  };

  const handleResourceClick = (lessonId: string, url: string, title?: string) => {
    markAsComplete(lessonId);
    handleOpenIntegratedNotes(url, title || 'Study Notes');
  };

  // Progress calculations
  const getCourseProgress = (course: Course) => {
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    if (totalLessons === 0) return 0;
    const completedCount = course.modules.reduce((acc, m) => {
      return acc + m.lessons.filter(l => completions.includes(l.id)).length;
    }, 0);
    return Math.round((completedCount / totalLessons) * 100);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourseData({
      name: course.name,
      description: course.description,
      duration: course.duration,
      price: course.price || 'ZK 1,000',
      videoUrl: course.videoUrl || ''
    });
  };

  const handleUpdateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    updateCourse({
      ...editingCourse,
      name: newCourseData.name,
      description: newCourseData.description,
      duration: newCourseData.duration,
      price: newCourseData.price,
      videoUrl: newCourseData.videoUrl
    });
    setEditingCourse(null);
    setNewCourseData({ name: '', description: '', duration: '6 Months', price: 'ZK 1,000', videoUrl: '' });
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    addCourse({
      id: '',
      name: newCourseData.name || 'New Academic Program',
      description: newCourseData.description,
      duration: newCourseData.duration,
      price: newCourseData.price || 'ZK 1,000',
      videoUrl: newCourseData.videoUrl,
      modules: []
    });
    setIsAddingCourse(false);
    setNewCourseData({ name: '', description: '', duration: '6 Months', price: 'ZK 1,000', videoUrl: '' });
  };

  const handleEditLesson = (courseId: string, moduleId: string, lesson: Lesson) => {
    setEditingLesson({ courseId, moduleId, lessonId: lesson.id });
    setLessonFormData(lesson);
  };

  const handleEditModule = (courseId: string, module: Module) => {
    setEditingModule({ courseId, moduleId: module.id });
    setModuleFormData({ title: module.title, order: module.order });
  };

  const saveLesson = () => {
    if (!editingLesson || !lessonFormData || !selectedCourse) return;
    const newModules = selectedCourse.modules.map(m => {
      if (m.id === editingLesson.moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === editingLesson.lessonId ? lessonFormData : l)
        };
      }
      return m;
    });
    updateCourse({ ...selectedCourse, modules: newModules });
    setEditingLesson(null);
  };

  const saveModule = () => {
    if (!editingModule || !moduleFormData || !selectedCourse) return;
    const newModules = selectedCourse.modules.map(m => {
      if (m.id === editingModule.moduleId) {
        return {
          ...m,
          title: moduleFormData.title,
          order: moduleFormData.order
        };
      }
      return m;
    });
    updateCourse({ ...selectedCourse, modules: newModules });
    setEditingModule(null);
  };

  const handleDeleteModule = (moduleId: string) => {
    if (!selectedCourse) return;
    if (!window.confirm('Are you sure you want to delete this module and its lessons? This action cannot be undone.')) return;
    const newModules = selectedCourse.modules.filter(m => m.id !== moduleId);
    updateCourse({ ...selectedCourse, modules: newModules });
  };

  return (
    <div className="space-y-8 pb-12">
      {isLocked && selectedCourseId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-6" onClick={() => setSelectedCourseId(null)}>
           <div className="bg-white rounded-[40px] p-12 border-4 border-red-500 shadow-2xl max-w-lg text-center space-y-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-500 mx-auto border-2 border-red-200">
                 <X className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tight text-gray-900 leading-none italic">Access Denied</h3>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Administrative Verification Required</p>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] leading-relaxed py-4 border-y border-gray-100">
                You can't open academic modules because you haven't made your first payment, or unless being given permission by the admin.
              </p>
              <button 
                onClick={() => setSelectedCourseId(null)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary transition-all"
              >
                Return to Course List
              </button>
           </div>
        </div>
      )}
      {/* Learning Material Modal */}
      {isAddingMaterial && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-primary p-8 text-white flex justify-between items-center">
                <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <Library className="w-6 h-6" /> Deposit Module Resource
                </h3>
                <button onClick={() => setIsAddingMaterial(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all"><X className="w-6 h-6"/></button>
             </div>
             <form className="p-10 space-y-6" onSubmit={(e) => {
               e.preventDefault();
               addLearningMaterial({
                 title: newMaterialData.title,
                 author: newMaterialData.author,
                 type: newMaterialData.type as any,
                 url: newMaterialData.url,
                 moduleId: newMaterialData.moduleId
               });
               setIsAddingMaterial(false);
               setNewMaterialData({ title: '', author: '', type: 'book', url: '', moduleId: '' });
             }}>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Resource Nomenclature</label>
                   <input 
                     required
                     className="w-full h-14 bg-gray-50 border border-gray-100 px-6 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary"
                     placeholder="e.g. Fiber Optics Guide v4"
                     value={newMaterialData.title}
                     onChange={e => setNewMaterialData({...newMaterialData, title: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Artifact Author</label>
                   <input 
                     required
                     className="w-full h-14 bg-gray-50 border border-gray-100 px-6 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary"
                     placeholder="e.g. ITA Research Dept"
                     value={newMaterialData.author}
                     onChange={e => setNewMaterialData({...newMaterialData, author: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Typology</label>
                    <select 
                      className="w-full h-14 bg-gray-50 border border-gray-100 px-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary text-xs"
                      value={newMaterialData.type}
                      onChange={e => setNewMaterialData({...newMaterialData, type: e.target.value as any})}
                    >
                      <option value="book">Textbook</option>
                      <option value="pdf">PDF Artifact</option>
                      <option value="link">Web Node</option>
                      <option value="video">Video stream</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Protocol URL</label>
                    <input 
                      required
                      className="w-full h-14 bg-gray-50 border border-gray-100 px-6 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary text-xs"
                      placeholder="https://..."
                      value={newMaterialData.url}
                      onChange={e => setNewMaterialData({...newMaterialData, url: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                   Finalize Transaction & Upload
                </button>
             </form>
          </div>
        </div>
      )}
      {/* Module Edit Modal */}
      {editingModule && moduleFormData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-secondary p-6 text-white flex justify-between items-center">
               <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <Edit2 className="w-4 h-4" /> Edit Module Properties
               </h3>
               <button onClick={() => setEditingModule(null)} className="hover:bg-white/20 p-2 rounded-lg transition-all"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Module Title</label>
                 <input 
                   className="w-full h-12 bg-gray-50 border border-gray-100 px-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-secondary"
                   value={moduleFormData.title}
                   onChange={e => setModuleFormData({...moduleFormData, title: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Sequence Order</label>
                 <input 
                   type="number"
                   className="w-full h-12 bg-gray-50 border border-gray-100 px-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-secondary"
                   value={moduleFormData.order}
                   onChange={e => setModuleFormData({...moduleFormData, order: parseInt(e.target.value)})}
                 />
               </div>
               <div className="flex justify-end gap-3 mt-4">
                  <button onClick={saveModule} className="bg-secondary text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-all">
                    <Save className="w-4 h-4" /> Sync Module
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Edit Modal */}
      {editingLesson && lessonFormData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary p-6 text-white flex justify-between items-center">
               <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <Edit2 className="w-4 h-4" /> Edit Lesson Payload
               </h3>
               <button onClick={() => setEditingLesson(null)} className="hover:bg-white/20 p-2 rounded-lg transition-all"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Lesson Title</label>
                 <input 
                   className="w-full h-12 bg-gray-50 border border-gray-100 px-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary"
                   value={lessonFormData.title}
                   onChange={e => setLessonFormData({...lessonFormData, title: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Content (Markdown/Text)</label>
                 <textarea 
                   className="w-full h-32 bg-gray-50 border border-gray-100 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary text-sm"
                   placeholder="# Lesson Objective\nWrite some markdown here..."
                   value={lessonFormData.content}
                   onChange={e => setLessonFormData({...lessonFormData, content: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Video (YT/Direct)</label>
                   <input 
                     className="w-full h-12 bg-gray-50 border border-gray-100 px-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary text-xs"
                     placeholder="https://..."
                     value={lessonFormData.videoUrl || ''}
                     onChange={e => setLessonFormData({...lessonFormData, videoUrl: e.target.value})}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Audio Note (Direct URL)</label>
                   <input 
                     className="w-full h-12 bg-gray-50 border border-gray-100 px-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary text-xs"
                     placeholder="https://..."
                     value={lessonFormData.audioUrl || ''}
                     onChange={e => setLessonFormData({...lessonFormData, audioUrl: e.target.value})}
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">PDF / Document Link</label>
                 <input 
                   className="w-full h-12 bg-gray-50 border border-gray-100 px-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary text-xs"
                   placeholder="https://drive.google.com/..."
                   value={lessonFormData.pdfUrl || ''}
                   onChange={e => setLessonFormData({...lessonFormData, pdfUrl: e.target.value})}
                 />
               </div>
               <div className="flex justify-end gap-3 mt-4">
                  <button onClick={saveLesson} className="bg-primary text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg hover:bg-primary-hover transition-all">
                    <Save className="w-4 h-4" /> Commit Changes
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
      {/* Content Player Modal */}
      {viewingLesson && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col md:flex-row animate-in fade-in duration-300">
          {/* Main Player Area */}
          <div className="flex-1 bg-black flex flex-col relative">
            <div className="absolute top-6 left-6 z-10">
              <button 
                onClick={() => setViewingLesson(null)}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md text-white transition-all flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest pr-2">Exit Classroom</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-start">
              <div className="w-full max-w-5xl space-y-8 mt-12 pb-16">
                {/* Video Player Section */}
                {viewingLesson.videoUrl && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest text-left">Interactive Lab Simulation & Video Lecture</p>
                    <div className="w-full aspect-video bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
                       <iframe 
                         src={viewingLesson.videoUrl.replace('watch?v=', 'embed/')}
                         className="w-full h-full"
                         allowFullScreen
                         title={viewingLesson.title}
                       />
                    </div>
                  </div>
                )}

                {/* Audio Briefing Section */}
                {viewingLesson.audioUrl && (
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-6 text-left">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Audio Lecture Notes</p>
                      <audio controls className="w-full h-10 accent-primary">
                        <source src={viewingLesson.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                )}

                {/* Lesson Written Notes Section (Always Visible) */}
                <div className="w-full bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-left border border-gray-150">
                  <div className="flex items-center gap-3 border-b border-gray-150 pb-6 mb-6">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-sans font-black text-lg text-gray-950 uppercase tracking-tight italic">Lesson Study Notes & Curriculum</h3>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Cisco Systems Official Study Registries & Command Modules</p>
                    </div>
                  </div>

                  <div className="markdown-body text-gray-800 font-sans leading-relaxed selection:bg-primary/20">
                     <ReactMarkdown>{viewingLesson.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Controls */}
            <div className="h-24 bg-black/50 backdrop-blur-3xl border-t border-white/5 px-8 flex items-center justify-between">
               <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                   <button 
                    onClick={() => {
                        const allLessons = selectedCourse?.modules.flatMap(m => m.lessons) || [];
                        const currentIndex = allLessons.findIndex(l => l.id === viewingLesson.id);
                        if(currentIndex > 0) setViewingLesson(allLessons[currentIndex - 1]);
                    }}
                    disabled={selectedCourse?.modules.flatMap(m => m.lessons).findIndex(l => l.id === viewingLesson.id) === 0}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all disabled:opacity-20"
                   >
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={() => {
                        const allLessons = selectedCourse?.modules.flatMap(m => m.lessons) || [];
                        const currentIndex = allLessons.findIndex(l => l.id === viewingLesson.id);
                        if(currentIndex < allLessons.length - 1) setViewingLesson(allLessons[currentIndex + 1]);
                    }}
                    disabled={selectedCourse?.modules.flatMap(m => m.lessons).findIndex(l => l.id === viewingLesson.id) === (selectedCourse?.modules.flatMap(m => m.lessons).length || 0) - 1}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all disabled:opacity-20"
                   >
                     <ArrowRight className="w-5 h-5" />
                   </button>
                 </div>
                 <div className="text-left hidden sm:block">
                   <h2 className="text-white font-black uppercase tracking-tight text-lg leading-none mb-1">{viewingLesson.title}</h2>
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{selectedCourse?.name}</p>
                 </div>
               </div>
                <div className="flex items-center gap-4">
                  {viewingLesson.pdfUrl && (
                    <button 
                      onClick={() => {
                        markAsComplete(viewingLesson.id);
                        handleOpenIntegratedNotes(viewingLesson.pdfUrl!, viewingLesson.title);
                      }}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-white/60 text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none"
                    >
                      <Download className="w-4 h-4" /> Lesson Notes
                    </button>
                  )}
                  {viewingLesson.audioUrl && (
                    <a 
                      href={viewingLesson.audioUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={() => markAsComplete(viewingLesson.id)}
                      className="flex items-center gap-2 bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
                    >
                       <Headset className="w-4 h-4" /> Listen to Audio
                    </a>
                  )}
                  {(viewingLesson.videoUrl || viewingLesson.pdfUrl || viewingLesson.audioUrl) && (
                    <button 
                      onClick={() => markAsComplete(viewingLesson.id)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        completions.includes(viewingLesson.id) 
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                          : "bg-white text-black hover:bg-primary hover:text-white"
                      )}
                    >
                      <CheckCircle className="w-4 h-4" /> {completions.includes(viewingLesson.id) ? 'Completed' : 'Mark as Complete'}
                    </button>
                  )}
                </div>
            </div>
          </div>

          {/* Sidebar Playlist */}
          <div className="w-full md:w-96 bg-gray-900 border-l border-white/5 flex flex-col p-8 overflow-y-auto">
             <h3 className="text-white/40 font-black uppercase text-[10px] tracking-[0.3em] mb-8">Course Playlist</h3>
             <div className="space-y-4">
                {selectedCourse?.modules.map(module => (
                  <div key={module.id} className="space-y-4">
                    <p className="text-primary font-black uppercase text-[8px] tracking-[0.4em] border-b border-primary/20 pb-2">Module {module.order}</p>
                    <div className="space-y-2">
                       {module.lessons.map(lesson => (
                         <button 
                          key={lesson.id}
                          onClick={() => handleLessonView(lesson)}
                          className={cn(
                            "w-full p-4 rounded-xl text-left border flex items-center gap-4 transition-all group",
                            viewingLesson.id === lesson.id 
                              ? "bg-primary border-primary text-white shadow-lg" 
                              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                          )}
                         >
                            <div className={cn(
                              "w-8 h-8 rounded shrink-0 flex items-center justify-center border",
                              viewingLesson.id === lesson.id ? "bg-white/20 border-white/30" : "bg-black/40 border-white/5"
                            )}>
                               {lesson.videoUrl ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                               <p className="text-xs font-bold leading-tight line-clamp-2">{lesson.title}</p>
                               {completions.includes(lesson.id) && <span className="text-[8px] font-black uppercase text-green-400 mt-1 block">Completed</span>}
                            </div>
                         </button>
                       ))}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end text-left gap-6 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">Academic Programs</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Curriculum Intelligence // Global Certification Matrix</p>
        </div>
        
        {/* Toggle between standard Catalog mapping and Genesis Builder */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setActiveTab('catalog'); setSelectedCourseId(null); }}
            className={cn(
              "px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all focus:outline-none",
              activeTab === 'catalog'
                ? "bg-gray-900 text-white shadow-lg"
                : "border border-gray-100 bg-white text-gray-400 hover:bg-gray-50"
            )}
          >
            📚 Course Catalog
          </button>

          {isAdmin && activeTab === 'catalog' && (
            <button 
              onClick={() => setIsAddingCourse(true)}
              className="bg-primary text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2.5 shadow-xl shadow-primary/10 hover:scale-105 active:scale-95 transition-all focus:outline-none"
            >
              <Plus className="w-3.5 h-3.5" /> Initialize Program
            </button>
          )}
        </div>
      </div>

      {isAddingCourse && (
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-300">
          <h2 className="text-2xl font-black italic mb-8 uppercase text-gray-900">New Academic Program Registration</h2>
          <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Program Nomenclature</label>
              <input 
                required
                className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Advanced Network Engineering"
                value={newCourseData.name}
                onChange={e => setNewCourseData({...newCourseData, name: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duration Schema</label>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setNewCourseData({...newCourseData, duration: '6 Weeks', price: 'ZK 200'})} className="text-[8px] bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded font-bold text-gray-600">6W</button>
                  <button type="button" onClick={() => setNewCourseData({...newCourseData, duration: '3 Months', price: 'ZK 550'})} className="text-[8px] bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded font-bold text-gray-600">3M</button>
                  <button type="button" onClick={() => setNewCourseData({...newCourseData, duration: '6 Months', price: 'ZK 1,000'})} className="text-[8px] bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded font-bold text-gray-600">6M</button>
                </div>
              </div>
              <input 
                required
                className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-primary text-sm"
                placeholder="e.g. 6 Weeks, 3 Months, 2 Years"
                value={newCourseData.duration}
                onChange={e => setNewCourseData({...newCourseData, duration: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enrollment Fee (Price)</label>
              <input 
                required
                className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. ZK 200 or ZK 550"
                value={newCourseData.price}
                onChange={e => setNewCourseData({...newCourseData, price: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Program Description</label>
              <input 
                className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-primary"
                placeholder="Brief curriculum overview..."
                value={newCourseData.description}
                onChange={e => setNewCourseData({...newCourseData, description: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Promotional/Intro Video URL</label>
              <input 
                className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-primary"
                placeholder="YouTube or direct link..."
                value={newCourseData.videoUrl}
                onChange={e => setNewCourseData({...newCourseData, videoUrl: e.target.value})}
              />
            </div>
            <div className="md:col-span-3 flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg">Commit Program to Database</button>
              <button type="button" onClick={() => setIsAddingCourse(false)} className="px-12 bg-gray-100 text-gray-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Abort</button>
            </div>
          </form>
        </div>
      )}

      {editingCourse && (
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-300">
          <h2 className="text-2xl font-black italic mb-8 uppercase text-gray-900">Modify Academic Program</h2>
          <form onSubmit={handleUpdateCourse} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Program Nomenclature</label>
              <input 
                required
                className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-secondary"
                value={newCourseData.name}
                onChange={e => setNewCourseData({...newCourseData, name: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duration Schema</label>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setNewCourseData({...newCourseData, duration: '6 Weeks', price: 'ZK 200'})} className="text-[8px] bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded font-bold text-gray-600">6W</button>
                  <button type="button" onClick={() => setNewCourseData({...newCourseData, duration: '3 Months', price: 'ZK 550'})} className="text-[8px] bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded font-bold text-gray-600">3M</button>
                  <button type="button" onClick={() => setNewCourseData({...newCourseData, duration: '6 Months', price: 'ZK 1,000'})} className="text-[8px] bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded font-bold text-gray-600">6M</button>
                </div>
              </div>
              <input 
                required
                className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-secondary text-sm"
                placeholder="e.g. 6 Weeks, 3 Months, 2 Years"
                value={newCourseData.duration}
                onChange={e => setNewCourseData({...newCourseData, duration: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enrollment Fee (Price)</label>
              <input 
                required
                className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-secondary"
                value={newCourseData.price}
                onChange={e => setNewCourseData({...newCourseData, price: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Program Description</label>
              <input 
                className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-secondary"
                value={newCourseData.description}
                onChange={e => setNewCourseData({...newCourseData, description: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Promotional/Intro Video URL</label>
              <input 
                className="w-full h-16 bg-gray-50 border-0 px-6 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-secondary"
                value={newCourseData.videoUrl}
                onChange={e => setNewCourseData({...newCourseData, videoUrl: e.target.value})}
              />
            </div>
            <div className="md:col-span-3 flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-secondary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg">Sync Changes to Curriculum</button>
              <button type="button" onClick={() => setEditingCourse(null)} className="px-12 bg-gray-100 text-gray-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'genesis' ? (
        <AICourseGenesis />
      ) : (
        <div className="space-y-8">
          {/* Department Menu Bar Switcher */}
          <div className="bg-white rounded-3xl border border-gray-100 p-2 shadow-md flex flex-col md:flex-row gap-2">
             <button
                onClick={() => { setSelectedDept('all'); setSelectedCourseId(null); }}
                type="button"
                className={cn(
                  "flex-1 py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-3 focus:outline-none",
                  selectedDept === 'all'
                    ? "bg-primary text-white shadow-xl shadow-primary/20"
                    : "bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                )}
             >
                <Layers className="w-4 h-4 shrink-0" />
                <span>All Academic Programs</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-black",
                  selectedDept === 'all' ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                )}>{accessibleCourses.length}</span>
             </button>

             <button
               onClick={() => { setSelectedDept('software'); setSelectedCourseId(null); }}
               type="button"
               className={cn(
                 "flex-1 py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-3 focus:outline-none",
                 selectedDept === 'software'
                   ? "bg-primary text-white shadow-xl shadow-primary/20"
                   : "bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600"
               )}
             >
                <Code className="w-4 h-4 shrink-0" />
                <span>Software Engineering</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-black",
                  selectedDept === 'software' ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                )}>{accessibleCourses.filter(c => getCourseDept(c) === 'software').length}</span>
             </button>

             <button
               onClick={() => { setSelectedDept('IT'); setSelectedCourseId(null); }}
               type="button"
               className={cn(
                 "flex-1 py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-3 focus:outline-none",
                 selectedDept === 'IT'
                   ? "bg-primary text-white shadow-xl shadow-primary/20"
                   : "bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600"
               )}
             >
                <Monitor className="w-4 h-4 shrink-0" />
                <span>Information & Mobile Tech</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-black",
                  selectedDept === 'IT' ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                )}>{accessibleCourses.filter(c => getCourseDept(c) === 'IT').length}</span>
             </button>

             <button
               onClick={() => { setSelectedDept('cybersecurity'); setSelectedCourseId(null); }}
               type="button"
               className={cn(
                 "flex-1 py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-3 focus:outline-none",
                 selectedDept === 'cybersecurity'
                   ? "bg-primary text-white shadow-xl shadow-primary/20"
                   : "bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600"
               )}
             >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Cybersecurity Academy</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-black",
                  selectedDept === 'cybersecurity' ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                )}>{accessibleCourses.filter(c => getCourseDept(c) === 'cybersecurity').length}</span>
             </button>
          </div>

          {/* Catalog Course Selection Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDeptCourses.map(course => {
              const courseProgress = getCourseProgress(course);
              const isActive = course.id === activeCourseId;
              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(selectedCourseId === course.id ? null : course.id)}
                  className={cn(
                    "bg-white p-6 rounded-3xl border transition-all relative overflow-hidden cursor-pointer shadow-sm flex flex-col justify-between group text-left",
                    isActive 
                      ? "border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]" 
                      : "border-gray-100 hover:border-primary/50 hover:shadow-md"
                  )}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                         isActive ? "bg-primary text-white" : "bg-gray-50 text-primary group-hover:bg-primary/10"
                       )}>
                          <BookOpen className="w-5 h-5" />
                       </div>
                       <div className="flex items-center gap-2">
                         {isAdmin && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (window.confirm(`Are you sure you want to delete the course "${course.name}"? This action cannot be undone.`)) {
                                deleteCourse(course.id); 
                              }
                            }}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-all rounded-lg hover:bg-gray-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                         )}
                       </div>
                    </div>
                    
                    <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 uppercase italic">{course.name}</h3>
                    <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-2 pr-4">{course.description}</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-50">
                    {isStudent && (
                      <div className="space-y-2 mb-4 text-left">
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-400">
                          <span>Course Progress</span>
                          <span className="text-primary">{courseProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000 ease-out" 
                            style={{ width: `${courseProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Duration & Price Indicators Schedule */}
                    <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50/55 p-3 rounded-2xl border border-gray-100">
                      <div className="flex flex-col text-left">
                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Duration</span>
                        <span className="text-[11px] font-black text-slate-800 uppercase italic mt-0.5">{course.duration}</span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Enrollment Fee</span>
                        <span className="text-[11px] font-black text-primary uppercase italic mt-0.5">{course.price || "ZK 1,000"}</span>
                      </div>
                    </div>

                    {/* Program notes & link submission block */}
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="mt-2 mb-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/80 space-y-3 text-left shadow-inner"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-primary" /> Study Notes
                        </span>
                        {course.programNotes && course.programNotes.length > 0 && (
                          <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                            {course.programNotes.length} Document{course.programNotes.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Display Existing Links */}
                      {course.programNotes && course.programNotes.length > 0 ? (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {course.programNotes.map((note) => (
                            <div key={note.id} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100 group shadow-sm">
                              <button
                                onClick={() => handleOpenIntegratedNotes(note.url, note.title)}
                                className="styled-note-link flex-1 text-[10px] font-bold text-gray-700 hover:text-primary transition-colors text-left flex items-center gap-2 focus:outline-none"
                              >
                                <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{note.title}</span>
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteProgramNote(course, note.id)}
                                  className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50/40 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] font-semibold text-gray-400 italic">No study program notes integrated yet</p>
                      )}

                      {/* Add Provision ONLY for Admin */}
                      {isAdmin && (
                        <div className="border-t border-dashed border-gray-150 pt-3 space-y-2">
                          <p className="text-[7.5px] font-black uppercase text-gray-400 tracking-wider">Quick Add Study Notes (Admin)</p>
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              const title = (form.elements.namedItem('noteTitle') as HTMLInputElement).value;
                              const url = (form.elements.namedItem('noteUrl') as HTMLInputElement).value;
                              if (title && url) {
                                handleAddProgramNote(course, title, url);
                                form.reset();
                              }
                            }}
                            className="space-y-2"
                          >
                            <input 
                              name="noteTitle"
                              required
                              placeholder="e.g. 6-Weeks Cybersecurity Handbook"
                              className="w-full text-[10px] h-8 bg-white border border-gray-150 px-2.5 rounded-lg outline-none focus:ring-1 focus:ring-primary font-bold"
                            />
                            <div className="flex gap-1.5">
                              <input 
                                name="noteUrl"
                                required
                                type="url"
                                placeholder="Notes source web address (https://...)"
                                className="flex-1 text-[10px] h-8 bg-white border border-gray-150 px-2.5 rounded-lg outline-none focus:ring-1 focus:ring-primary font-bold"
                              />
                              <button 
                                type="submit"
                                className="bg-primary text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-secondary transition-all focus:outline-none shrink-0"
                              >
                                Add Notes
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400 uppercase">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          <span>{course.modules.length} Modules</span>
                       </div>
                       <div className={cn(
                         "flex items-center gap-1 text-[8px] font-black uppercase tracking-widest transition-transform",
                         isActive ? "text-primary translate-x-1" : "text-gray-400 group-hover:text-primary group-hover:translate-x-1"
                       )}>
                          {isActive ? 'Close Syllabus' : 'Open Syllabus'} <ArrowRight className="w-3.5 h-3.5" />
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {currentDeptCourses.length === 0 && (
               <div className="col-span-full py-16 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-150 text-center">
                  <Layers className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No active modules configured in this academy department</p>
               </div>
            )}
          </div>

          {/* Active Course Learning Roadmap Downward Modules List */}
          {selectedCourse ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
               <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden min-h-[500px]">
                 <div className="bg-gray-900 p-10 text-white relative text-left">
                   <div className="absolute top-0 right-0 p-10 opacity-5">
                      <Layers className="w-32 h-32" />
                   </div>
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                     <div className="space-y-4 flex-1">
                       <div className="flex flex-wrap items-center gap-3">
                          <span className="bg-primary text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">Active Syllabus</span>
                          <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">{selectedCourse.duration} Program</span>
                          {isStudent && (
                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                              {getCourseProgress(selectedCourse)}% Complete
                            </span>
                          )}
                       </div>
                       <div>
                         <h2 className="text-3xl font-black uppercase tracking-tight leading-tight mb-2 italic text-white">{selectedCourse.name}</h2>
                         <p className="text-white/60 font-medium max-w-2xl text-xs leading-relaxed">{selectedCourse.description}</p>
                       </div>
                     </div>
                     {isInstructor && (
                       <button 
                         onClick={() => handleEditCourse(selectedCourse)}
                         className="bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-all border border-white/5"
                       >
                          <Settings className="w-5 h-5 text-white/40" />
                       </button>
                     )}
                   </div>
                 </div>

                 <div className="p-10 text-left">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-4 border-b border-gray-50">
                      <div>
                        <h3 className="text-base font-black uppercase tracking-widest text-gray-900 flex flex-wrap items-center gap-3">
                          <Layers className="w-5 h-5 text-primary" /> CISCO Curriculum roadmap ({selectedCourse.modules.length} Connected Modules)
                        </h3>
                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Select physical modules & lesson chapters below to start standard reading</p>
                      </div>
                      {isInstructor && (
                        <button
                         onClick={() => {
                           const newModule: Module = { id: crypto.randomUUID(), title: 'New Academic Module', order: selectedCourse.modules.length + 1, lessons: [] };
                           updateCourse({ ...selectedCourse, modules: [...selectedCourse.modules, newModule] });
                         }}
                         className="bg-primary text-white px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2 shadow-lg shadow-primary/15 hover:scale-102 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Expand Syllabus
                        </button>
                      )}
                   </div>

                   <div className="grid grid-cols-1 gap-12 relative">
                      {/* Connection Line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-150 hidden lg:block" />

                      {([...selectedCourse.modules].sort((a,b) => a.order - b.order)).map((module, mIdx) => {
                         const sortedModulesList = [...selectedCourse.modules].sort((a,b) => a.order - b.order);
                         const isLocked = isStudent && mIdx > 0 && !passedExams.includes(sortedModulesList[mIdx - 1].id);
                         const isPassed = passedExams.includes(module.id);
                         return (
                        <div key={module.id} className="relative z-10">
                           <div className="flex flex-col lg:flex-row items-start gap-8">
                              <div className={cn(
                                 "w-12 h-12 border rounded-xl flex items-center justify-center font-black text-base shadow-sm shrink-0 transition-all",
                                 isLocked 
                                   ? "bg-slate-100 border-slate-200 text-slate-400" 
                                   : (isPassed ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-200 text-primary")
                               )}>
                                 {module.order}
                              </div>
                              <div className="flex-1 w-full">
                                  <div className="flex justify-between items-end mb-6 border-b border-gray-50 pb-3">
                                     <div className="flex-1">
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2 justify-start"><span>Module {module.order}</span>{isLocked && <span className="bg-slate-100 text-slate-550 px-2 py-0.5 rounded text-[7px] font-black tracking-widest leading-none normal-case">Locked</span>}{isPassed && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[7px] font-black tracking-widest leading-none normal-case">Passed</span>}{!isLocked && !isPassed && isStudent && <span className="bg-blue-100 text-blue-850 px-2 py-0.5 rounded text-[7px] font-black tracking-widest leading-none normal-case">Active</span>}</p>
                                        <h4 className="text-xl font-black text-gray-900 uppercase italic">{module.title}</h4>
                                        {isStudent && (
                                          <div className="flex items-center gap-3 mt-2">
                                             <div className="w-24 h-1 bg-gray-150 rounded-full overflow-hidden">
                                                <div 
                                                  className="h-full bg-emerald-500 transition-all duration-700" 
                                                  style={{ width: `${Math.round((module.lessons.filter(l => completions.includes(l.id)).length / (module.lessons.length || 1)) * 100)}%` }}
                                                />
                                             </div>
                                             <span className="text-[8px] font-black text-gray-400 tracking-wider">
                                               {Math.round((module.lessons.filter(l => completions.includes(l.id)).length / (module.lessons.length || 1)) * 100)}% COMPLETE
                                             </span>
                                          </div>
                                        )}
                                     </div>
                                     <div className="flex items-center gap-4 pb-1">
                                        {isInstructor && <MoreActionButtons 
                                           onEditModule={() => handleEditModule(selectedCourse.id, module)}
                                           onDeleteModule={() => handleDeleteModule(module.id)}
                                          onAddLesson={() => {
                                            const newLesson: Lesson = { id: crypto.randomUUID(), title: 'New Cisco Lesson Chapter', content: '# Section Core Objectives\n\n- Realize network system bounds.', order: module.lessons.length + 1 };
                                            const newModules = selectedCourse.modules.map(m => m.id === module.id ? { ...m, lessons: [...m.lessons, newLesson] } : m);
                                            updateCourse({ ...selectedCourse, modules: newModules });
                                          }}
                                        />}
                                     </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                     {module.lessons.map(lesson => (
                                       <div 
                                         key={lesson.id} 
                                         onClick={() => handleLessonView(lesson)}
                                         className={cn(
                                           "bg-gray-50/50 p-5 rounded-2xl border border-gray-100 hover:border-primary hover:bg-white hover:shadow-lg transition-all group cursor-pointer relative text-left",
                                           completions.includes(lesson.id) && "border-emerald-100 bg-emerald-50/10"
                                         )}
                                       >
                                          <div className="flex justify-between items-start mb-4">
                                             <div className={cn(
                                               "w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
                                               completions.includes(lesson.id) ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/10" : "bg-white text-gray-400 border-gray-150 group-hover:border-primary group-hover:text-primary shadow-sm"
                                             )}>
                                                {completions.includes(lesson.id) ? <CheckCircle className="w-4 h-4" /> : (lesson.videoUrl ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />)}
                                             </div>
                                              {isInstructor && (
                                               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <button 
                                                    onClick={(e) => { e.stopPropagation(); handleEditLesson(selectedCourse.id, module.id, lesson); }}
                                                    className="p-1 text-gray-400 hover:text-primary"
                                                  >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button 
                                                    onClick={(e) => { e.stopPropagation(); const newModules = selectedCourse.modules.map(m => m.id === module.id ? { ...m, lessons: m.lessons.filter(l => l.id !== lesson.id) } : m); updateCourse({...selectedCourse, modules: newModules}); }}
                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                               </div>
                                             )}
                                          </div>
                                          <h5 className={cn(
                                            "font-black text-xs uppercase tracking-tight mb-3 transition-colors",
                                            completions.includes(lesson.id) ? "text-gray-400" : "text-gray-900 group-hover:text-primary"
                                          )}>{lesson.title}</h5>
                                          
                                          <div className="flex flex-wrap gap-1.5">
                                             {lesson.videoUrl && (
                                               <button 
                                                 onClick={(e) => { e.stopPropagation(); handleLessonView(lesson); }}
                                                 className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-100 text-[8px] font-black uppercase text-blue-600 hover:scale-102 transition-all"
                                               >
                                                 <Video className="w-2.5 h-2.5" /> Video Media
                                               </button>
                                             )}
                                             {lesson.pdfUrl && (
                                               <button 
                                                 onClick={(e) => { e.stopPropagation(); handleResourceClick(lesson.id, lesson.pdfUrl!); }}
                                                 className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-100 text-[8px] font-black uppercase text-amber-600 hover:scale-102 transition-all"
                                               >
                                                 <Link2 className="w-2.5 h-2.5" /> PDF Core
                                               </button>
                                             )}
                                          </div>
                                       </div>
                                     ))}
                                     
                                     {isInstructor && (
                                       <button 
                                         onClick={() => {
                                           const newLesson: Lesson = { id: crypto.randomUUID(), title: 'New Lesson Chapter', content: '', order: module.lessons.length + 1 };
                                           const newModules = selectedCourse.modules.map(m => m.id === module.id ? { ...m, lessons: [...m.lessons, newLesson] } : m);
                                           updateCourse({ ...selectedCourse, modules: newModules });
                                         }}
                                         className="border border-dashed border-gray-250 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group min-h-[100px]"
                                       >
                                         <Plus className="w-5 h-5 group-hover:scale-105 transition-transform" />
                                         <span className="text-[9px] font-black uppercase tracking-widest">Inject Lesson</span>
                                       </button>
                                     )}
                                  </div>

                                  {/* Learning Materials for this module */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
                                    {learningMaterials.filter(m => m.moduleId === module.id).map(material => (
                                      <div key={material.id} className="bg-primary/5 p-5 rounded-2xl border border-primary/10 relative overflow-hidden group flex flex-col justify-between text-left">
                                         <div>
                                           <div className="flex justify-between items-start mb-3">
                                              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-md">
                                                 <Library className="w-4 h-4" />
                                              </div>
                                              {isInstructor && (
                                                <button 
                                                 onClick={() => deleteLearningMaterial(material.id)}
                                                 className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                   <Trash2 className="w-3 h-3" />
                                                </button>
                                              )}
                                           </div>
                                           <p className="text-[7px] font-black uppercase text-primary mb-1 tracking-widest">{material.type}</p>
                                           <h5 className="font-black text-xs uppercase tracking-tight text-gray-900 group-hover:text-primary transition-colors mb-1 italic line-clamp-1">{material.title}</h5>
                                         </div>
                                         <div className="flex justify-between items-center mt-3 pt-3 border-t border-primary/10">
                                            <span className="text-[7px] font-bold text-gray-400 uppercase">{material.author}</span>
                                            <a href={material.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[7px] font-black uppercase text-primary hover:underline">
                                               Open <ExternalLink className="w-2 h-2" />
                                            </a>
                                         </div>
                                      </div>
                                    ))}

                                    {isInstructor && (
                                      <button 
                                        onClick={() => {
                                          setNewMaterialData({ ...newMaterialData, moduleId: module.id });
                                          setIsAddingMaterial(true);
                                        }}
                                        className="bg-white p-5 rounded-2xl border border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group min-h-[120px]"
                                      >
                                         <div className="p-2 rounded-full bg-gray-50 text-gray-300 group-hover:bg-primary group-hover:text-white transition-all">
                                            <Plus className="w-4 h-4" />
                                         </div>
                                         <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">Add Resource</span>
                                      </button>
                                    )}
                                  </div>

                                  {module.lessons.length === 0 && (
                                    <div className="col-span-full p-8 text-center text-gray-350 text-[10px] font-black uppercase bg-gray-50/50 rounded-xl border border-dashed border-gray-150 mt-4">
                                      Zero Lesson chapters configured
                                    </div>
                                  )}
                              </div>
                           </div>
                        </div>
                       );
                     })}
                   </div>
                 </div>
               </div>
            </div>
          ) : (
             <div className="bg-white rounded-[32px] border border-gray-150 p-12 text-center shadow-lg space-y-4 max-w-4xl mx-auto mt-6 animate-in fade-in duration-300">
               <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-md">
                 <BookOpen className="w-8 h-8 animate-pulse" />
               </div>
               <div>
                  <h3 className="font-sans font-black text-lg text-gray-950 uppercase tracking-tight italic">Academy Syllabus Repository</h3>
                  <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed mt-1">Select any Cisco Course card above to open, configure, and study connected academic learning modules and practice quizzes.</p>
               </div>
             </div>
          )}
        </div>
      )}

    </div>
  );
}

function MoreActionButtons({ 
  onAddLesson, 
  onEditModule, 
  onDeleteModule 
}: { 
  onAddLesson: () => void, 
  onEditModule: () => void, 
  onDeleteModule: () => void 
}) {
  return (
    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
       <button 
        onClick={onAddLesson} 
        title="Add Lesson"
        className="p-1.5 text-primary hover:bg-white rounded-md transition-all shadow-sm"
       >
          <Plus className="w-3.5 h-3.5" />
       </button>
       <button 
        onClick={onEditModule} 
        title="Edit Module"
        className="p-1.5 text-gray-400 hover:text-secondary hover:bg-white rounded-md transition-all"
       >
          <Edit2 className="w-3.5 h-3.5" />
       </button>
       <button 
        onClick={onDeleteModule} 
        title="Delete Module"
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-md transition-all"
       >
          <Trash2 className="w-3.5 h-3.5" />
       </button>
    </div>
  );
}
