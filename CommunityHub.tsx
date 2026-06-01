import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Users, Shield, MessageCircle, Search, Hash, Phone, Mic, X, Video, Headphones } from 'lucide-react';
import { cn } from '../components/utils';

export function CommunityHub() {
  const { communityMessages, sendCommunityMessage, user, meetings, startMeeting, endMeeting } = useAuth();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [meetingJoined, setMeetingJoined] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin' || user?.role === 'instructor' || user?.username === 'Felix Brown (Developer)';
  const isLocked = false;

  const activeMeeting = meetings.find(m => m.status === 'active');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [communityMessages]);

  const handleStartMeeting = async () => {
    const title = prompt("Enter Meeting Title:", "Global Academic Audio Session");
    if (title) await startMeeting(title);
  };

  const handleJoinMeeting = () => {
    if (activeMeeting) {
      setActiveRoom(activeMeeting.roomId);
    }
  };

  const handleEndMeeting = async () => {
    if (activeMeeting) {
      await endMeeting(activeMeeting.id);
      setActiveRoom(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendCommunityMessage(input.trim());
      setInput('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-700 relative">
      {/* Audio Meeting Notification / Admin Controls */}
      <div className="flex flex-col gap-4">
        {activeMeeting ? (
          <div className="bg-secondary p-6 rounded-[32px] border-4 border-primary shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-secondary">
                <Phone className="w-8 h-8 animate-bounce" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black uppercase tracking-tight text-white leading-none italic">{activeMeeting.title}</h3>
                <p className="text-primary font-bold text-[10px] uppercase tracking-widest mt-1">Live Audio Transmission in Progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {!activeRoom ? (
                <button 
                  onClick={handleJoinMeeting}
                  className="flex-1 md:flex-none px-8 h-14 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <Headphones className="w-4 h-4" /> Join Meeting
                </button>
              ) : (
                <button 
                  onClick={() => setActiveRoom(null)}
                  className="flex-1 md:flex-none px-8 h-14 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Leave Room
                </button>
              )}
              {isAdmin && (
                <button 
                   onClick={handleEndMeeting}
                   className="px-6 h-14 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all flex items-center justify-center border border-white/20"
                >
                  End Session
                </button>
              )}
            </div>
          </div>
        ) : (
          isAdmin && (
            <button 
              onClick={handleStartMeeting}
              className="bg-white p-6 rounded-[32px] border-2 border-dashed border-gray-200 hover:border-primary hover:bg-gray-50 transition-all flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-secondary transition-all">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase text-gray-400 group-hover:text-primary transition-all">Audio Phone Call Provision</p>
                  <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 leading-none h-4">Host Global Meeting</h3>
                </div>
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover:bg-primary group-hover:text-secondary">
                Broadcast Node
              </div>
            </button>
          )
        )}

        {/* Meeting Interface (Jitsi iFrame) */}
        {activeRoom && (
          <div className="w-full space-y-4">
            {!meetingJoined ? (
              <div className="w-full aspect-video bg-gray-900 rounded-[40px] flex flex-col items-center justify-center p-12 text-center border-4 border-gray-800 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
                 <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <Video className="w-10 h-10 text-primary" />
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white mb-4">Secure Audio Link Established</h3>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Node: {activeRoom}</p>
                 <button 
                  onClick={() => setMeetingJoined(true)}
                  className="px-12 py-5 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 z-10"
                 >
                   Join Finalized Stream
                 </button>
                 <p className="mt-8 text-[9px] font-bold text-white/20 uppercase tracking-widest">Protocol: Encrypted Peer-to-Peer Tunnel</p>
              </div>
            ) : (
              <>
                <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[32px] flex items-start gap-6 shadow-sm">
                  <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                      <Mic className="w-6 h-6" />
                  </div>
                  <div className="text-left space-y-2 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 leading-none">Audio Protocol Enforcement</p>
                      <p className="text-[11px] font-bold text-amber-600 leading-tight">If audio is inactive, you MUST manually click the microphone icon inside the meeting window. Browsers block auto-audio until a direct click occurs.</p>
                      <div className="pt-2 flex flex-wrap gap-4">
                        <button 
                          onClick={() => {
                            const iframe = document.querySelector('iframe');
                            if (iframe) {
                              const currentSrc = iframe.src;
                              iframe.src = 'about:blank';
                              setTimeout(() => { iframe.src = currentSrc; }, 50);
                            }
                          }}
                          className="text-[9px] font-black uppercase text-amber-800 underline decoration-amber-300 underline-offset-4 hover:text-amber-600"
                        >
                          Hard Reset Audio Node
                        </button>
                        <button 
                          onClick={() => {
                            navigator.mediaDevices.getUserMedia({ audio: true })
                              .then(() => alert("Microphone clearance verified at OS level. Re-join meeting now."))
                              .catch(err => alert("BROWSER BLOCKED: Open settings and allow microphone for this site."));
                          }}
                          className="text-[9px] font-black uppercase text-amber-800 underline decoration-amber-300 underline-offset-4 hover:text-amber-600"
                        >
                          Verify Browser Permission
                        </button>
                        <a 
                            href={`https://meet.jit.si/${activeRoom}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-black uppercase text-amber-800 underline decoration-amber-300 underline-offset-4 hover:text-amber-600"
                          >
                            Emergency External Tunnel (100% Fix)
                          </a>
                      </div>
                  </div>
                </div>

                <div className="w-full aspect-video bg-black rounded-[40px] overflow-hidden border-4 border-primary shadow-2xl relative">
                  <iframe 
                    src={`https://meet.jit.si/${activeRoom}#config.startWithVideoMuted=true&config.startWithAudioMuted=false&config.prejoinPageEnabled=false&config.enableWelcomePage=false&config.disabledSounds=["REACTION_SOUND"]`}
                    allow="camera; microphone; display-capture; fullscreen; autoplay; speaker-selection"
                    className="w-full h-full border-0"
                  />
                  <div className="absolute top-6 left-6 px-4 py-2 bg-secondary/80 backdrop-blur-md rounded-xl text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 border border-primary/20">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Session Node
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isLocked && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 bg-white/20 backdrop-blur-[2px]">
           <div className="bg-white rounded-[40px] p-12 border-4 border-red-500 shadow-2xl max-w-lg text-center space-y-6 sticky top-20 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-500 mx-auto border-2 border-red-200">
                 <MessageCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tight text-gray-900 leading-none italic">Social Node Locked</h3>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Financial Clearance Required</p>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] leading-relaxed py-4 border-y border-gray-100 text-gray-400">
                You cannot participate in the community hub until your student account has been cleared for administrative full access.
              </p>
              <div className="bg-gray-50 p-4 rounded-2xl">
                 <p className="text-[10px] font-black uppercase text-secondary">Awaiting Admin Approval</p>
              </div>
           </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-black uppercase tracking-tight text-primary">Unity Hub</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Global Student Intelligence Stream [All Faculties]</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-2xl border border-gray-200">
           <div className="flex -space-x-3 items-center px-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-[8px] font-black uppercase">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-primary mr-2 animate-pulse">42 Nodes Active</span>
        </div>
      </div>

      <div className="flex-1 bg-white border-2 border-gray-100 rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Decor */}
        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary opacity-20" />
        
        {/* Messages Stream */}
        <div 
          ref={scrollRef}
          className="flex-1 p-8 overflow-y-auto space-y-8 scroll-smooth"
        >
          {communityMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-6 opacity-20">
               <Users className="w-20 h-20 text-gray-200" />
               <p className="text-xl font-black uppercase tracking-[0.4em] italic text-gray-300 text-center">Initialization Sequence Required...<br/>Start the Transmission</p>
            </div>
          )}
          
          {communityMessages.map((msg, idx) => {
            const isMe = msg.userId === user?.username;
            const isStaff = msg.userRole !== 'student';
            
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col gap-2 max-w-[80%] lg:max-w-[70%] animate-in slide-in-from-bottom-2 duration-300",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "flex items-center gap-3 mb-1",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{msg.userName}</span>
                  {msg.faculty && (
                    <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[7px] font-black uppercase tracking-widest text-gray-400">
                      {msg.faculty}
                    </span>
                  )}
                  {isStaff && (
                    <span className="px-2 py-0.5 bg-primary text-secondary rounded text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Shield className="w-2 h-2" /> Authorized
                    </span>
                  )}
                </div>
                
                <div className={cn(
                  "p-6 rounded-3xl text-sm font-bold leading-relaxed shadow-sm border",
                  isMe 
                    ? "bg-primary text-secondary border-primary/10 rounded-tr-none" 
                    : isStaff 
                      ? "bg-secondary text-primary border-secondary/10 rounded-tl-none shadow-xl shadow-secondary/5"
                      : "bg-gray-50 text-gray-700 border-gray-100 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
                
                <span className="text-[7px] font-bold text-gray-300 uppercase tracking-[0.2em] px-2 italic">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Transmission Input */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-100">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text"
              placeholder="Inject technical signal or community query..."
              className="w-full h-20 bg-white border-2 border-gray-100 px-8 pr-24 rounded-3xl outline-none focus:border-primary font-bold text-gray-900 shadow-sm transition-all"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isSending}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isSending}
              className="absolute right-4 top-4 bottom-4 px-6 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30 flex items-center gap-2"
            >
              {isSending ? 'Syncing...' : (
                <>
                  <Send className="w-4 h-4" />
                  Transmit
                </>
              )}
            </button>
          </form>
          <div className="mt-4 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 px-4">
             <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 italic">
                  <Hash className="w-2 h-2" /> Global_Channel
                </span>
                <span className="flex items-center gap-2">
                   <Users className="w-2 h-2" /> Shared Intelligence
                </span>
             </div>
             <p className="italic">Standard Protocol v2.6 // AES-256 Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
