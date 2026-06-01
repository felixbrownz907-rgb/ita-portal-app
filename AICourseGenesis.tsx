import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  BookOpen, 
  Layers, 
  Search, 
  HelpCircle,
  Award,
  BookMarked
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { cn } from "./utils";

export function AICourseGenesis() {
  const { courses, askMentor, user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    {
      role: "model",
      content: `### Welcome to **IT INTERNATIONAL ACADEMY Academic AI Office**! 🎓

I am your dedicated academic advisor & program assistant. Choose a program above or type your question below. I can guide you on:
- Detailed module objectives
- Practical laboratory requirements (e.g. RJ-45 copper terminal crimping, router security configurations)
- Pricing queries (e.g. ZK 200 for 6 weeks, ZK 550 for 3 months, ZK 1,000 for 6 months)
- Recommended learning paths & academic pacing

How can I help you excel today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const presets = [
    { label: "What is covered in Cisco Routing & Switching?", text: "What is the detailed curriculum roadmap & modules in Cisco Routing & Switching?" },
    { label: "Explain the Practical Lab requirements.", text: "Can you detail the hardware & crimping laboratory tasks required to pass ITIA programs?" },
    { label: "What are the course prices & durations?", text: "What are the price options and durations available for cybersecurity versus software engineering?" },
    { label: "How is grading done?", text: "How do teachers grade our labs and assignments at IT INTERNATIONAL ACADEMY?" }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg = { role: "user" as const, content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Find course context to enrich the system instruction
      let contextPrompt = "";
      if (selectedCourseId !== "all") {
        const selectedC = courses.find(c => c.id === selectedCourseId);
        if (selectedC) {
          contextPrompt = `[TARGET PROGRAM: ${selectedC.name}]\nDescription: ${selectedC.description}\nModules: ${selectedC.modules.map(m => m.title).join(", ")}`;
        }
      } else {
        contextPrompt = `[ALL AVAILABLE ACADEMY PROGRAMS:\n${courses.map(c => `- ${c.name} (${c.duration}, ${c.modules.length} modules)`).join("\n")}]`;
      }

      const promptHistory = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: `[ACADEMY CONTEXT]\n${contextPrompt}\n\n[USER INQUIRY]\n${text}` }
      ];

      const response = await askMentor(
        promptHistory,
        "You are the official IT INTERNATIONAL ACADEMY Academic AI Advisor. You are highly professional, concise, encouraging, and provide very technical, precise descriptions about the course curriculum roadmaps, practical lab sessions, and pacing. Never refer to any other academy. Keep formatting clean with Markdown elements."
      );

      setMessages(prev => [...prev, { role: "model" as const, content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "model" as const, content: "Neural sync interrupted. Please check your network connection and retry." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "model",
        content: "Session reset. Ask me anything about IT INTERNATIONAL ACADEMY programs to get immediate assistance!"
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[750px] bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden text-left" id="ita-ai-assistant-root">
      {/* Sidebar Header */}
      <div className="bg-gray-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center font-black animate-pulse shadow-lg shadow-primary/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[9px] font-black tracking-widest text-primary uppercase block">Official Academy Support Node</span>
            <h1 className="text-xl font-black uppercase tracking-tight italic">IT INTERNATIONAL ACADEMY Assistant</h1>
          </div>
        </div>

        <button 
          onClick={handleClear}
          className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl font-bold uppercase tracking-wider border border-white/5 transition-all text-white/80 shrink-0 self-start md:self-auto"
        >
          Reset Consultation
        </button>
      </div>

      {/* Program Context Selector Filter */}
      <div className="bg-gray-50 border-b border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0 flex items-center gap-1">
          <BookMarked className="w-3.5 h-3.5" /> Target Program Room:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCourseId("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
              selectedCourseId === "all" ? "bg-primary text-white" : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-100"
            )}
          >
            All Programs
          </button>
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                selectedCourseId === course.id ? "bg-primary text-white" : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-100"
              )}
            >
              {course.name}
            </button>
          ))}
        </div>
      </div>

      {/* Core Split Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat Stream Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div ref={scrollRef} className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 custom-scrollbar scroll-smooth">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex gap-4 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-black uppercase tracking-wider text-[10px] shrink-0 font-mono",
                  msg.role === 'user' ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                )}>
                  {msg.role === 'user' ? user?.username?.substring(0,2) || 'US' : 'AI'}
                </div>
                <div className={cn(
                  "rounded-2xl p-5 text-sm leading-relaxed border border-gray-100",
                  msg.role === 'user' 
                    ? "bg-gray-550/5 text-gray-800 border-gray-250/5 ml-12 rounded-tr-none font-medium" 
                    : "bg-white shadow-sm mr-12 rounded-tl-none text-gray-700 markdown-body"
                )}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 max-w-lg mr-auto">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-[10px] animate-bounce">
                  AI
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 text-xs font-bold text-gray-400 italic flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> ITIA Assistant is reflecting on course syllabus...
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Prompts */}
          {messages.length <= 2 && (
            <div className="px-6 md:px-8 py-3 border-t border-gray-50 bg-gray-50/50 flex flex-wrap gap-2 text-left">
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider w-full mb-1">Frequently Asked Presets:</span>
              {presets.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSend(preset.text)}
                  className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200/60 px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <div className="p-4 md:p-6 border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <input
                className="flex-1 h-14 bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-primary/40 focus:ring-1 focus:ring-primary/10 rounded-2xl px-6 text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                placeholder={selectedCourseId === "all" ? "Ask a question about ITIA Programs..." : `Ask about modules & pricing for this program...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={() => handleSend()}
                className="h-14 w-14 bg-primary hover:bg-primary-hover active:scale-95 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-primary/20"
              >
                <Send className="w-5 h-5 fill-current" />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 mt-2 font-medium tracking-wide text-center">Powered by ITIA Academic Intelligence Node</p>
          </div>
        </div>

        {/* Dynamic Program Factbox Panel */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50 p-6 md:p-8 space-y-6 overflow-y-auto">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1e293b]">Selected Room Map</h4>
            <div className="mt-4 p-4 rounded-2xl bg-white border border-gray-150/40 shadow-sm text-left">
              {selectedCourseId === "all" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-primary">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">ITIA Academic Grid</span>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Loaded Catalog: {courses.length} Standard Streams</p>
                  <div className="space-y-2 pt-2 border-t border-gray-50">
                    <div className="text-[10px] text-gray-550 font-medium">Standard Price Structure:</div>
                    <div className="text-[11px] font-black tracking-wide text-gray-700 bg-gray-50 p-2 rounded-lg">6 Weeks: ZK 200</div>
                    <div className="text-[11px] font-black tracking-wide text-gray-700 bg-gray-50 p-2 rounded-lg">3 Months: ZK 550</div>
                    <div className="text-[11px] font-black tracking-wide text-gray-700 bg-gray-50 p-2 rounded-lg">6 Months: ZK 1,000</div>
                  </div>
                </div>
              ) : (
                (() => {
                  const currentC = courses.find(c => c.id === selectedCourseId);
                  if (!currentC) return null;
                  return (
                    <div className="space-y-4">
                      <div className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded font-black uppercase tracking-wider inline-block">
                        Active Profile
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 leading-tight italic">{currentC.name}</h3>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{currentC.description}</p>
                      
                      <div className="pt-3 border-t border-gray-50 space-y-2">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase">
                          <span>Duration:</span>
                          <span className="text-gray-800 font-extrabold">{currentC.duration}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase">
                          <span>Tuition Fee:</span>
                          <span className="text-primary font-black">{currentC.price || "ZK ZK 1,000"}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase">
                          <span>Syllabus:</span>
                          <span className="text-gray-800 font-extrabold">{currentC.modules.length} Modules</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1e293b]">Laboratory Standards</h4>
            <div className="mt-4 p-4 rounded-2xl bg-white border border-gray-150/40 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-500">
                <Award className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">ITIA Endorsed Labs</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                All physical terminals require complete alignment tests. Ask the AI mentor for terminal guide procedures and crimping layouts anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
