import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/utils';
import ReactMarkdown from 'react-markdown';
import { BookingCalendar } from '../components/BookingCalendar';
import { AIMessage } from '../context/types';
import { motion } from 'motion/react';

export function AIMentor() {
  const { askMentor, bookMentor, user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({ preferredTime: '', notes: '', transactionId: '' });
  const [isBooking, setIsBooking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isStudent = user?.role === 'student';
  const [apiKeyValid, setApiKeyValid] = useState(true);

  const systemInstruction = "You are the official AI International Academy Student Assistant. Your core mandate is to assist students with every question they may have, including course modules, Cisco configurations, CCNA modules, cybersecurity concepts, coding challenges, pricing structures, balances, class schedules, or exam guidelines. Be highly thorough, encouraging, precise, and practical.";

  useEffect(() => {
    const checkApiKey = () => {
      const key = process.env.GEMINI_API_KEY;
      setApiKeyValid(!!key && key !== 'undefined' && key !== '');
    };
    checkApiKey();

    if (messages.length === 0 && user?.studentData) {
      const initializeProactiveSession = async () => {
        setIsTyping(true);
        try {
          const initialPrompt: AIMessage[] = [{ 
            role: 'user', 
            content: `Initialize a proactive greeting from the AI International Academy Student Assistant. Acknowledge my name (${user.studentData.fullName}), course, and progress (${user.studentData.progress}%). Welcoming me and asking how you can assist me with any questions or curricula challenges today.` 
          }];
          const response = await askMentor(initialPrompt, systemInstruction);
          setMessages([{ role: 'model', content: response }]);
        } finally {
          setIsTyping(false);
        }
      };
      initializeProactiveSession();
    }
  }, [user]);

  const generateStudyPlan = async () => {
    const history: AIMessage[] = [
      ...messages,
      { role: 'user', content: "Based on my current progress and the modules I'm taking, please generate a detailed study plan for this week." }
    ];
    setMessages(history);
    setIsTyping(true);
    try {
      const response = await askMentor(history, systemInstruction);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.studentData) return;
    if (!bookingDetails.transactionId) {
      alert('Transaction ID is required.');
      return;
    }
    setIsBooking(true);
    try {
      await bookMentor({
        studentId: user.studentData.studentId,
        studentName: user.studentData.fullName,
        preferredTime: bookingDetails.preferredTime,
        notes: bookingDetails.notes,
        transactionId: bookingDetails.transactionId
      });
      setIsBookingModalOpen(false);
      setBookingDetails({ preferredTime: '', notes: '', transactionId: '' });
      alert('Booking request sent for verification.');
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const history: AIMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(history);
    setInput('');
    setIsTyping(true);
    try {
      const response = await askMentor(history, systemInstruction);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', content: `Neural Sync Failure. Please verify your neural link.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white font-sans text-blue-900">
      <div className="flex justify-between items-center px-10 py-6 shrink-0 bg-white border-b border-blue-600/10 z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center font-black italic text-sm border border-blue-600/10 shadow-lg shadow-blue-600/10">
            A_I
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-blue-950 leading-none italic">
              AI INTERNATIONAL ACADEMY STUDENT ASSISTANT
            </h1>
            <p className="text-[9px] font-black text-blue-600/40 uppercase tracking-[0.4em] mt-2">Active Service Node // Standing Ready</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isStudent && (
            <button onClick={generateStudyPlan} disabled={isTyping} className="bg-blue-600 text-white px-8 py-4 font-black uppercase tracking-widest text-[10px] hover:bg-blue-950 transition-all shadow-xl shadow-blue-600/10 border border-blue-600/10 disabled:opacity-50">
              ACADEMIC_ROADMAP
            </button>
          )}
          <button onClick={clearChat} className="px-6 py-4 border border-blue-600/10 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white transition-all">
            RESET_SESSION
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-0 overflow-hidden bg-white">
        <div className="flex-1 flex flex-col relative overflow-hidden border-r border-blue-600/5">
          <div className="h-10 bg-blue-600/5 border-b border-blue-600/10 flex items-center px-10 justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className={cn("w-2 h-2", isTyping ? "bg-blue-600 animate-pulse" : "bg-emerald-500")} />
              <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest">
                {isTyping ? "NEURAL_SYNCHRONIZING..." : "LINK_ACTIVE_100"}
              </span>
            </div>
            <div className="text-[8px] font-black uppercase text-blue-900/20 tracking-[0.3em] italic">V4.0.1_STABLE_NODE</div>
          </div>

          <div ref={scrollRef} className="flex-1 p-10 space-y-12 overflow-y-auto bg-white custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-20 gap-12">
                {!apiKeyValid && (
                  <div className="bg-blue-50 border border-blue-600/10 p-6 flex flex-col gap-2 italic">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">GEMINI_KEY_MISSING</p>
                  </div>
                )}
                <div className="w-32 h-32 bg-blue-600 text-white flex items-center justify-center font-black italic text-2xl border border-blue-600/10 shadow-2xl">
                  HUB
                </div>
                <div className="max-w-xl space-y-6">
                  <h3 className="text-3xl font-black text-blue-950 uppercase italic tracking-tighter">AI Student Assistant</h3>
                  <p className="text-[11px] font-bold text-blue-900/40 leading-relaxed uppercase tracking-[0.2em] px-10">
                    Always here to assist students with every question they may have on academic lessons, configuration tasks, billing invoices, or portal guidelines.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                   {["Explain CCNA IP Subnetting", "What is my tuition amount or course balance due?", "Clarify core cybersecurity principles", "How do I use the learning materials site?"].map(hint => (
                     <button key={hint} onClick={() => sendMessage(hint)} disabled={isTyping} className="p-8 bg-blue-600/5 hover:bg-blue-600 hover:text-white border border-blue-600/10 text-[11px] font-black uppercase tracking-widest text-blue-600 transition-all text-left group">
                       {">"} {hint}
                     </button>
                   ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex flex-col gap-4", msg.role === 'model' ? "items-start max-w-[85%]" : "items-end ml-auto max-w-[85%]")}>
                <div className={cn("px-4 py-1 text-[9px] font-black uppercase tracking-widest", msg.role === 'model' ? "text-blue-600" : "text-blue-900/40")}>
                  {msg.role === 'model' ? "STUDENT_ASSISTANT_AI" : "STUDENT_INPUT"}
                </div>
                <div className={cn("p-10 border shadow-sm", msg.role === 'model' ? "bg-white border-blue-600/10 text-blue-900" : "bg-blue-600 border-blue-700 text-white shadow-xl shadow-blue-600/20")}>
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start gap-4 animate-pulse">
                <div className="text-[9px] font-black uppercase tracking-widest text-blue-600 italic">SYSTEM_SYNTHESIZING...</div>
                <div className="bg-blue-600/5 p-10 border border-blue-600/10 flex items-center gap-6">
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-blue-900/20 tracking-widest">Accessing Knowledge Node...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 border-t border-blue-600/10 bg-white">
            <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="relative group max-w-5xl mx-auto">
              <input 
                type="text" placeholder="Enter query..."
                className="w-full h-20 bg-white border border-blue-600/20 px-10 pr-40 font-black text-blue-950 uppercase tracking-widest outline-none focus:border-blue-600 transition-all shadow-sm"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <div className="absolute right-4 top-4">
                <button type="submit" disabled={!input.trim() || isTyping} className="h-12 px-10 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-900 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                  {isTyping ? "SYNC" : "SEND"}
                </button>
              </div>
            </form>
            <div className="mt-8 flex items-center justify-center gap-12 text-[9px] font-black uppercase text-blue-900/20 tracking-[0.4em] italic">
               <div>DATA_LINK_ENCRYPTED</div>
               <div>ITA_CURRICULUM_V4</div>
               <div>NODE_ACTIVE</div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-96 flex-col gap-10 shrink-0 h-full overflow-y-auto p-10 custom-scrollbar border-l border-blue-600/10">
           {user?.studentData ? (
             <div className="bg-blue-950 p-10 text-white shadow-2xl space-y-10 group shrink-0">
                <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-600 italic">REGISTRY_INFO</h4>
                <div className="space-y-10 relative z-10">
                   <div>
                      <p className="text-[10px] font-black text-white/20 uppercase mb-2">IDENTIFICATION</p>
                      <p className="text-xl font-black italic tracking-tighter uppercase">{user.studentData.fullName}</p>
                   </div>
                   <div className="space-y-6">
                      <div className="p-8 bg-white/5 border border-white/10">
                         <p className="text-[9px] font-black text-blue-600 uppercase mb-3 tracking-widest">MODULES_PROGRESS</p>
                         <div className="flex justify-between items-end mb-4">
                            <span className="text-2xl font-black italic">{user.studentData.progress}%</span>
                         </div>
                         <div className="h-1 w-full bg-white/10 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${user.studentData.progress}%` }} className="h-full bg-blue-600" />
                         </div>
                      </div>
                      <div className="p-8 bg-white/5 border border-white/10">
                         <p className="text-[9px] font-black text-blue-600 uppercase mb-3 tracking-widest">LABS_PROGRESS</p>
                         <div className="flex justify-between items-end mb-4">
                            <span className="text-2xl font-black italic">{user.studentData.labProgress}%</span>
                         </div>
                         <div className="h-1 w-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${user.studentData.labProgress}%` }} />
                         </div>
                      </div>
                   </div>
                   <button onClick={() => setIsBookingModalOpen(true)} className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-500 transition-all border border-blue-600/20 italic">
                     BOOK_HUMAN_NODAL_MENTOR
                   </button>
                </div>
             </div>
           ) : (
             <div className="bg-blue-600 p-10 text-white shadow-2xl shrink-0">
                <h4 className="text-[10px] font-black uppercase tracking-[0.6em] mb-4 italic">STAFF_NODE</h4>
                <p className="text-xs font-bold leading-relaxed opacity-60 uppercase tracking-widest italic">
                  MENTOR_ONLY_OPTIMIZED_FOR_CANDIDATE_DATA
                </p>
             </div>
           )}

           <div className="flex-1 space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-900/40 italic">NEURAL_SHORTCUTS</h4>
              <div className="space-y-4">
                 {[
                   { label: "Exam Mode", desc: "Simulation" },
                   { label: "Practical Lab", desc: "Hands-on" },
                   { label: "Cisco Mastery", desc: "Networking" }
                 ].map((tool, i) => (
                   <button key={i} onClick={() => sendMessage(`Switch to ${tool.label} mode.`)} disabled={isTyping} className="w-full p-8 bg-white border border-blue-600/10 flex flex-col gap-4 hover:border-blue-600 transition-all text-left shadow-sm hover:shadow-xl group">
                      <div className="text-[11px] font-black uppercase text-blue-950 group-hover:text-blue-600 transition-colors tracking-widest italic">{tool.label}</div>
                      <div className="text-[9px] font-black text-blue-900/40 uppercase tracking-widest">{tool.desc}_PROTOCOL</div>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-blue-900/10 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl border border-blue-600/20 shadow-2xl overflow-hidden">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center border-b border-blue-700">
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">BOOK_PRIVATE_SESSION</h3>
                <p className="text-[10px] font-bold opacity-60 uppercase mt-2 tracking-widest italic leading-none">HUMAN_TO_HUMAN_PROTOCOL_ENABLING</p>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors underline">CLOSE</button>
            </div>
            <form onSubmit={handleBookSession} className="p-10 space-y-8">
              <div className="space-y-3">
                 <p className="text-[10px] font-black uppercase tracking-widest text-blue-900/40 px-1">SESSION_DESCRIPTION</p>
                 <textarea placeholder="Specify technical challenges..." className="w-full p-6 bg-blue-600/5 border border-blue-600/10 outline-none focus:border-blue-600 font-bold text-sm min-h-[120px] text-blue-950" value={bookingDetails.notes} onChange={e => setBookingDetails({...bookingDetails, notes: e.target.value})} />
              </div>
              <div className="space-y-3">
                 <p className="text-[10px] font-black uppercase tracking-widest text-blue-900/40 px-1">SCHEDULE_MATRIX</p>
                 <BookingCalendar onSelect={(dt) => setBookingDetails({...bookingDetails, preferredTime: dt})} selectedDateTime={bookingDetails.preferredTime} />
              </div>
              <div className="space-y-3">
                 <p className="text-[10px] font-black uppercase tracking-widest text-blue-900/40 px-1">IDENTIFICATION_TOKEN // FEE: K150</p>
                 <input type="text" required placeholder="TRANSACTION_ID" className="w-full h-16 bg-blue-600/5 border border-blue-600/10 px-6 outline-none focus:border-blue-600 font-black text-sm text-blue-950 tracking-widest" value={bookingDetails.transactionId} onChange={e => setBookingDetails({...bookingDetails, transactionId: e.target.value})} />
              </div>
              <p className="text-[9px] font-black text-blue-900/40 uppercase text-center px-10 leading-relaxed italic tracking-widest">
                SEND_FEE_TO: 0779417675 // RE-SYNC_AFTER_VERIFICATION
              </p>
              <button type="submit" disabled={isBooking || !bookingDetails.preferredTime} className="w-full bg-blue-600 text-white py-6 font-black uppercase tracking-[0.4em] shadow-xl shadow-blue-600/20 disabled:opacity-50">
                {isBooking ? 'REGISTERING...' : 'COMMIT_BOOKING'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
