import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Settings, Play, Send, Bot, CheckCircle2, XCircle, History, Terminal, Zap, ShieldCheck, Link2 } from 'lucide-react';
import { cn } from '../components/utils';
import { motion, AnimatePresence } from 'motion/react';

export function WhatsAppAI() {
  const { whatsappAISettings, updateWhatsAppAI, whatsappMessages, addWhatsAppMessage, askMentor, user } = useAuth();
  const [simulationInput, setSimulationInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempInstruction, setTempInstruction] = useState(whatsappAISettings.instruction);

  const isAdmin = user?.role === 'admin';

  const handleSimulate = async () => {
    if (!simulationInput.trim() || !whatsappAISettings.enabled) return;
    
    setIsProcessing(true);
    
    try {
      const reply = await askMentor(
        [{ role: 'user', content: simulationInput }],
        whatsappAISettings.instruction
      );
      addWhatsAppMessage({
        sender: 'Student',
        message: simulationInput,
        reply: reply
      });
      setSimulationInput('');
    } catch (error) {
      console.error('WhatsApp Logic Fault:', error);
    } finally {
      // Small delay for UI feel
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  const saveSettings = () => {
    updateWhatsAppAI({
      ...whatsappAISettings,
      instruction: tempInstruction
    });
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end text-left">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">Messaging Node</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">WhatsApp Cloud API // AI Automation Module</p>
        </div>
        <div className="flex gap-2">
           <div className={cn(
             "px-4 py-2 rounded-xl border flex items-center gap-2",
             whatsappAISettings.enabled ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
           )}>
             <div className={cn("w-2 h-2 rounded-full", whatsappAISettings.enabled ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
             <span className="text-[10px] font-black uppercase tracking-widest">{whatsappAISettings.enabled ? 'Global Active' : 'System Offline'}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admin Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Settings className="w-24 h-24" />
             </div>
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-2">
               <ShieldCheck className="w-3 h-3" /> Admin Control Layer
             </h2>

             <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div>
                      <p className="text-sm font-black uppercase italic italic text-gray-900 leading-none mb-1">Compute State</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Enable AI Neural Engine</p>
                   </div>
                   <button 
                     onClick={() => updateWhatsAppAI({ ...whatsappAISettings, enabled: !whatsappAISettings.enabled })}
                     className={cn(
                       "w-12 h-6 rounded-full transition-all relative",
                       whatsappAISettings.enabled ? "bg-primary" : "bg-gray-200"
                     )}
                   >
                     <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", whatsappAISettings.enabled ? "right-1" : "left-1")} />
                   </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div>
                      <p className="text-sm font-black uppercase italic text-gray-900 leading-none mb-1">Auto-Response</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Autonomous Data Relay</p>
                   </div>
                   <button 
                     onClick={() => updateWhatsAppAI({ ...whatsappAISettings, autoReply: !whatsappAISettings.autoReply })}
                     className={cn(
                       "w-12 h-6 rounded-full transition-all relative",
                       whatsappAISettings.autoReply ? "bg-primary" : "bg-gray-200"
                     )}
                   >
                     <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", whatsappAISettings.autoReply ? "right-1" : "left-1")} />
                   </button>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Behavioral Instructions</label>
                   <textarea 
                     className="w-full h-48 bg-gray-50 border-0 p-4 rounded-2xl text-xs font-bold leading-relaxed resize-none focus:ring-2 focus:ring-primary outline-none custom-scrollbar"
                     value={tempInstruction}
                     onChange={(e) => setTempInstruction(e.target.value)}
                     placeholder="Define the AI persona..."
                   />
                   <button 
                     onClick={saveSettings}
                     className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-primary transition-all shadow-lg active:scale-95"
                   >
                     Synchronize Instructions
                   </button>
                </div>
             </div>
          </div>

          <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Terminal className="w-16 h-16" />
             </div>
             <h3 className="text-[9px] font-black uppercase tracking-widest text-primary mb-4">API Node Status</h3>
             <div className="space-y-3 font-mono text-[9px]">
                <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-white/40">Latency</span>
                   <span className="text-emerald-400">12ms</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-white/40">Webhook</span>
                   <span className="text-emerald-400 italic">HEALTHY</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-white/40">Throughput</span>
                   <span className="text-blue-400">4.2 req/s</span>
                </div>
             </div>
          </div>
        </div>

        {/* Simulator & Logs */}
        <div className="lg:col-span-2 space-y-8">
           {/* Simulator */}
           <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Zap className="w-5 h-5" />
                 </div>
                 <div>
                    <h2 className="text-lg font-black italic uppercase leading-none text-gray-900">Message Stream Simulator</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Test AI Response Polling</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="relative flex-1">
                    <input 
                      className="w-full h-16 bg-gray-50 border-0 pl-6 pr-16 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Simulate a student message..."
                      value={simulationInput}
                      onChange={(e) => setSimulationInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
                      disabled={!whatsappAISettings.enabled || isProcessing}
                    />
                    <button 
                      onClick={handleSimulate}
                      disabled={!whatsappAISettings.enabled || isProcessing}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 disabled:grayscale"
                    >
                       {isProcessing ? <span className="animate-spin text-lg">◌</span> : <Send className="w-4 h-4" />}
                    </button>
                 </div>
              </div>
              {!whatsappAISettings.enabled && (
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-3 flex items-center gap-2">
                   <XCircle className="w-3 h-3" /> System Restricted: AI Neural Engine is currently offline
                </p>
              )}
           </div>

           {/* Logs */}
           <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[500px]">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                    <History className="w-3 h-3" /> Real-time Response Logs
                 </h2>
                 <span className="text-[8px] font-black bg-gray-900 text-white px-2 py-1 rounded italic uppercase">Live Feed</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 <AnimatePresence initial={false}>
                 {whatsappMessages.map((msg) => (
                   <motion.div 
                     key={msg.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-4"
                   >
                      <div className="flex gap-4 items-start">
                         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                         </div>
                         <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none">
                            <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Student @ {new Date(msg.timestamp).toLocaleTimeString()}</p>
                            <p className="text-sm font-bold text-gray-900">{msg.message}</p>
                         </div>
                      </div>
                      <div className="flex gap-4 items-start justify-end">
                         <div className="bg-primary/5 p-4 rounded-2xl rounded-tr-none border border-primary/10 text-right max-w-[80%]">
                            <p className="text-[8px] font-black uppercase text-primary mb-1">GPT-Assistant [AI REPLY]</p>
                            <p className="text-sm font-bold text-gray-900">{msg.reply}</p>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg">
                            <Bot className="w-4 h-4 text-white" />
                         </div>
                      </div>
                   </motion.div>
                 ))}
                 </AnimatePresence>

                 {whatsappMessages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-20 grayscale">
                      <Terminal className="w-16 h-16 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting API Payload Event...</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
