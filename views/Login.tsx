import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Student } from '../context/types';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Check, ArrowRight } from 'lucide-react';

export function Login() {
  const { login, enrollStudent, courses, intakes, dataLoaded, refreshData, introUrl } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showIntroPlayer, setShowIntroPlayer] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [enrollData, setEnrollData] = useState({
    fullName: '',
    email: '',
    nrc: '',
    phone: '',
    courseId: '',
    intakeId: '',
    selectedDuration: ''
  });
  const [generatedCreds, setGeneratedCreds] = useState<{ id: string, pass: string, isExisting?: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryData, setRecoveryData] = useState({ nrc: '', email: '' });
  const [recoveredInfo, setRecoveredInfo] = useState<Student | null>(null);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // FORCE STRING NORMALIZATION: Strip all spaces, hyphens, slashes, and force to totally lowercase
      const normalizedNrc = (recoveryData.nrc || '')
        .toString()
        .replace(/[\/\s-]/g, '')
        .toLowerCase()
        .trim();
      
      const normalizedEmail = (recoveryData.email || '').trim().toLowerCase();

      const match = await (useAuth() as any).findStudentByRegistry(normalizedNrc, normalizedEmail);
      if (match) {
        setRecoveredInfo(match);
      } else {
        setError("REGISTRY_NOT_FOUND: No profile matches identifiers.");
      }
    } catch (err: any) {
      setError("Recovery sequence fault.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      // FORCE STRING NORMALIZATION: Strip all spaces, hyphens, slashes, and force to totally lowercase
      const normalizedUsername = (username || '')
        .toString()
        .replace(/[\/\s-]/g, '')
        .toLowerCase()
        .trim();

      const isAuthed = await login(normalizedUsername, password.trim());
      if (isAuthed) {
        setSuccess(true);
        refreshData();
      } else {
        setError('Identification mismatch or incorrect pass-key.');
      }
    } catch (err) {
      setError(`System access failure.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // FORCE STRING NORMALIZATION on enroll data NRC
      const normalizedEnrollNrc = (enrollData.nrc || '')
        .toString()
        .replace(/[\/\s-]/g, '')
        .toLowerCase()
        .trim();

      const normalizedEnrollData = {
        ...enrollData,
        nrc: normalizedEnrollNrc,
        email: (enrollData.email || '').trim().toLowerCase()
      };

      const result = await enrollStudent(normalizedEnrollData);
      setGeneratedCreds({ id: result.studentId, pass: result.pass, isExisting: result.isExisting });
    } catch (err: any) {
      setError(err.message || 'Enrollment failure.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05112e] flex items-center justify-center p-6 md:p-12 relative overflow-hidden font-sans text-white">
      
      {/* Top Brand Header matching mockup */}
      <div className="absolute top-0 left-0 right-0 h-18 bg-[#0a1b44] flex items-center justify-between px-8 z-20 shadow-lg border-b border-white/5 font-sans">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 leading-none">
            <span className="text-[#cca01a] font-black text-[16px] tracking-wider italic">IT</span>
            <span className="text-white font-black text-[16px] tracking-wider italic">INTERNATIONAL</span>
          </div>
          <span className="text-[10px] text-blue-300 font-bold tracking-[0.25em] uppercase mt-1">ACADEMY GLOBAL NODE</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-3.5 py-1.5 bg-red-650 bg-opacity-20 border border-red-500/30 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            SYSTEM KEY
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm hover:bg-white/20 transition-all cursor-pointer">
            ⚡
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`${isEnrolling && !generatedCreds ? 'max-w-3xl' : 'max-w-lg'} w-full bg-[#0a1b44] rounded-[32px] sm:rounded-[40px] border border-[#00f2fe]/15 relative z-10 shadow-2xl overflow-hidden mt-16`}
      >
        {!generatedCreds && (
          <div className="bg-[#06153a] p-10 text-white text-center border-b border-[#00f2fe]/10">
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="text-3xl font-black uppercase tracking-tighter italic mb-2 text-[#cca01a]">ITIA</div>
              <h1 className="text-xl font-extrabold uppercase tracking-tight leading-none mb-3 text-slate-100">
                ACADEMY PORTAL
              </h1>
              <div className="h-0.5 w-24 bg-[#cca01a]/30 mx-auto mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-200 opacity-85 italic">
                "PRACTICAL BASED INSTRUCTION"
              </p>
            </motion.div>
          </div>
        )}

        <div className="p-10 space-y-10 bg-[#0a1b44]">
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-400 flex flex-col gap-1.5"
            >
              <div className="text-[10px] font-black uppercase tracking-widest">[ SECURITY ERROR ]</div>
              <p className="text-[11px] font-semibold leading-relaxed opacity-90">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {success ? (
               <motion.div 
                 key="success"
                 className="py-16 text-center space-y-10"
               >
                  <div className="text-[12px] font-black uppercase tracking-[0.8em] text-[#00f2fe] animate-pulse">AUTHORIZING...</div>
                  <div className="h-1.5 w-full bg-[#05112e] rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: '100%' }}
                       transition={{ duration: 1.5 }}
                       className="h-full bg-[#00f2fe]" 
                     />
                  </div>
               </motion.div>
            ) : isRecovering ? (
               <motion.div key="recovery" className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-5">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">RECOVERY PROTOCOL</h3>
                  <button 
                    onClick={() => { setIsRecovering(false); setRecoveredInfo(null); setError(''); }}
                    className="text-[10px] font-black text-[#00f2fe] hover:text-[#00c6ff] uppercase tracking-widest"
                  >
                    {"<"} BACK
                  </button>
                </div>

                {!recoveredInfo ? (
                  <form onSubmit={handleRecover} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8fa3c7] px-1">NRC IDENTIFIER</label>
                      <input
                        type="text" required
                        className="w-full h-15 bg-[#05112e] border border-[#00f2fe]/20 text-white rounded-2xl px-5 focus:border-[#00f2fe] focus:bg-[#05112e] outline-none font-bold text-sm transition-all font-mono placeholder:text-gray-500 uppercase"
                        placeholder="XXXXXX/XX/XX"
                        value={recoveryData.nrc}
                        onChange={e => setRecoveryData({...recoveryData, nrc: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8fa3c7] px-1">REGISTERED EMAIL</label>
                      <input
                        type="email" required
                        className="w-full h-15 bg-[#05112e] border border-[#00f2fe]/20 text-white rounded-2xl px-5 focus:border-[#00f2fe] focus:bg-[#05112e] outline-none font-bold text-sm transition-all placeholder:text-gray-500"
                        placeholder="USER@HUB.TIA"
                        value={recoveryData.email}
                        onChange={e => setRecoveryData({...recoveryData, email: e.target.value})}
                      />
                    </div>
                    <button
                      type="submit" disabled={isLoading}
                      className="w-full h-15 bg-[#00f2fe] text-[#05112e] font-black uppercase tracking-widest hover:bg-[#00c6ff] transition-all text-xs rounded-2xl shadow-xl shadow-[#00f2fe]/10"
                    >
                      {isLoading ? 'EXECUTING SEARCH...' : 'INITIATE DISCOVERY'}
                    </button>
                  </form>
                ) : (
                  <motion.div className="space-y-8">
                    <div className="bg-[#05112e] border border-[#00f2fe]/20 rounded-[24px] p-8 text-center space-y-4">
                       <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#cca01a]">IDENTITY MATCHED</h4>
                       <div className="text-2xl font-black text-white uppercase tracking-tight">{recoveredInfo.fullName}</div>
                    </div>

                    <div className="bg-[#05112e] border-2 border-dashed border-[#cca01a]/30 text-white rounded-[24px] p-8 space-y-6 shadow-2xl">
                       <div className="space-y-2">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 opacity-60">STUDENT ID</span>
                         <p className="text-3xl font-black tracking-widest font-mono text-[#00f2fe]">{recoveredInfo.studentId}</p>
                       </div>
                       <div className="h-px bg-white/10" />
                       <div className="flex justify-between items-center italic text-blue-300 opacity-80 text-xs">
                          <span className="font-bold uppercase tracking-widest">LOGIN READY</span>
                          <span className="font-bold uppercase tracking-widest">ITA NODE V4</span>
                       </div>
                    </div>

                    <button
                      onClick={() => { setUsername(recoveredInfo.studentId); setIsRecovering(false); setRecoveredInfo(null); }}
                      className="w-full h-15 bg-[#00f2fe] text-[#05112e] font-black uppercase tracking-widest hover:bg-[#00c6ff] transition-all text-xs rounded-2xl"
                    >
                      USE IDENTIFIER
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : isEnrolling ? (
              generatedCreds ? (
                <motion.div key="creds" className="space-y-10 text-center py-4">
                  
                  {/* Beautiful Emerald Checkmark in smooth gradient ring matching screenshot */}
                  <div className="w-24 h-24 bg-[#00c853] text-white flex items-center justify-center rounded-full mx-auto mb-6 shadow-[0_10px_25px_rgba(0,200,83,0.35)] relative animate-in zoom-in-75 duration-300">
                    <Check className="w-12 h-12 stroke-[3.5]" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-[#00f2fe] leading-none mb-3 italic">
                      ENROLLMENT SUCCESS
                    </h3>
                    <p className="text-[11px] text-slate-300 font-extrabold uppercase tracking-widest leading-relaxed">
                      CREDENTIALS GENERATED AND SYNCED TO MASTER NODE.
                    </p>
                  </div>

                  {/* Dotted border dashboard box matching screenshot */}
                  <div className="border-2 border-dashed border-[#cca01a]/30 bg-[#05112e] rounded-[28px] p-8 space-y-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#8fa3c7]">STUDENT ID</span>
                      <div className="text-2xl md:text-3xl font-black text-white tracking-widest font-mono">
                        {generatedCreds.id}
                      </div>
                    </div>
                    <div className="h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#cca01a]">ACCESS PASS-KEY</span>
                      <div className="text-2xl md:text-3xl font-black text-[#cca01a] tracking-[0.25em] font-mono">
                        {generatedCreds.pass}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic uppercase font-bold tracking-tight">SECURE THESE IDENTIFIERS FOR HUB ACCESS</p>

                  <button
                    onClick={() => { setIsEnrolling(false); setGeneratedCreds(null); setUsername(generatedCreds.id); setError(''); }}
                    className="w-full py-5 bg-[#00f2fe] hover:bg-[#00c6ff] text-[#05112e] font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-[#00f2fe]/10 transition-all hover:scale-[1.01] active:scale-98"
                  >
                    CONTINUE TO REGISTRY
                  </button>
                </motion.div>
              ) : (
                <motion.div key="enroll-form" className="space-y-8">
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <h3 className="text-lg font-black uppercase tracking-tight text-[#00f2fe]">NEW ADMISSION</h3>
                    <button 
                      onClick={() => { setIsEnrolling(false); setError(''); }}
                      className="text-[10px] font-black text-[#00f2fe] hover:text-[#00c6ff] uppercase tracking-widest"
                    >
                      {"<"} BACK
                    </button>
                  </div>

                  <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['fullName', 'email', 'nrc', 'phone'].map((field) => (
                       <div key={field} className="space-y-2">
                         <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8fa3c7] px-1">{field.toUpperCase()}_DATA</label>
                         <input
                           type={field === 'email' ? 'email' : 'text'} required
                           className="w-full h-14 bg-[#05112e] border border-[#00f2fe]/20 rounded-2xl px-5 focus:border-[#00f2fe] focus:bg-[#05112e] outline-none font-bold text-sm text-white transition-all placeholder:text-gray-500"
                           placeholder={`Enter ${field}...`}
                           value={(enrollData as any)[field]}
                           onChange={e => setEnrollData({...enrollData, [field]: e.target.value})}
                         />
                       </div>
                    ))}
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8fa3c7] px-1">PROGRAM STREAM</label>
                      <select required className="w-full h-14 bg-[#05112e] border border-[#00f2fe]/20 rounded-2xl px-5 outline-none font-bold text-sm text-white focus:border-[#00f2fe] focus:bg-[#05112e] cursor-pointer appearance-none" value={enrollData.courseId} onChange={e => {
                           const cId = e.target.value;
                           const selectedCourseObj = courses.find(c => c.id === cId);
                           let duration = "";
                           if (selectedCourseObj) {
                             duration = selectedCourseObj.duration === "6 Weeks" ? "6 Weeks" : (selectedCourseObj.duration === "3 Months" ? "3 Months" : "6 Months");
                           }
                           setEnrollData({
                             ...enrollData,
                             courseId: cId,
                             selectedDuration: duration
                           });
                         }}>
                        <option value="" className="bg-[#0a1b44] text-white">-- SELECT PROGRAM --</option>
                        {courses?.map(c => <option key={c.id} value={c.id} className="bg-[#0a1b44] text-white">{c.name}</option>)}
                      </select>
                    </div>
                    {enrollData.courseId && (
                      <div className="space-y-4 animate-in fade-in duration-200 mt-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8fa3c7] px-1">STUDY PACE & PLAN</label>
                        <select 
                          required 
                          className="w-full h-14 bg-[#05112e] border border-[#00f2fe]/20 rounded-2xl px-5 outline-none font-bold text-sm text-white focus:border-[#00f2fe] focus:bg-[#05112e] cursor-pointer appearance-none" 
                          value={enrollData.selectedDuration} 
                          onChange={e => setEnrollData({...enrollData, selectedDuration: e.target.value})}
                        >
                          {(() => {
                            const selCourse = courses.find(c => c.id === enrollData.courseId);
                            const courseDuration = selCourse?.duration || "6 Months";
                            if (courseDuration === "6 Weeks") {
                              return (
                                <>
                                  <option value="6 Weeks" className="bg-[#0a1b44] text-white">6 Weeks (Intensive Stream)</option>
                                  <option value="Self-Paced" className="bg-[#0a1b44] text-white">Self-Paced (Introductory)</option>
                                </>
                              );
                            } else if (courseDuration === "3 Months") {
                              return <option value="3 Months" className="bg-[#0a1b44] text-white">3 Months (Standard Academic Track)</option>;
                            } else {
                              return <option value="6 Months" className="bg-[#0a1b44] text-white">6 Months (Professional Advanced Track)</option>;
                            }
                          })()}
                        </select>
                      </div>
                    )}
                    <div style={{ display: 'none' }}>
                      <select>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8fa3c7] px-1">INTAKE PERIOD</label>
                      <select required className="w-full h-14 bg-[#05112e] border border-[#00f2fe]/20 rounded-2xl px-5 outline-none font-bold text-sm text-white focus:border-[#00f2fe] focus:bg-[#05112e] cursor-pointer appearance-none" value={enrollData.intakeId} onChange={e => setEnrollData({...enrollData, intakeId: e.target.value})}>
                        <option value="" className="bg-[#0a1b44] text-white">-- SELECT INTAKE --</option>
                        {intakes?.map(i => <option key={i.id} value={i.id} className="bg-[#0a1b44] text-white">{i.name}</option>)}
                      </select>
                    </div>
                    <button
                      type="submit" disabled={isLoading || !dataLoaded}
                      className="md:col-span-2 mt-4 w-full h-15 bg-[#00f2fe] text-[#05112e] font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-[#00f2fe]/10 disabled:opacity-50 hover:bg-[#00c6ff] transition-all"
                    >
                      {isLoading ? 'EXECUTING ADMISSION...' : 'COMMIT REGISTRATION'}
                    </button>
                  </form>
                </motion.div>
              )
            ) : (
              <motion.div key="login-form" className="space-y-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[#8fa3c7] px-1">IDENTIFIER</label>
                      <input
                        type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-15 bg-[#05112e] border border-[#00f2fe]/20 rounded-2xl px-6 focus:border-[#00f2fe] focus:bg-[#05112e] transition-all font-bold text-white outline-none uppercase tracking-widest text-base font-mono"
                        placeholder="STUDENT_NUMBER" required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[#8fa3c7] px-1">PASS KEY</label>
                      <input
                        type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-15 bg-[#05112e] border border-[#00f2fe]/20 rounded-2xl px-6 focus:border-[#00f2fe] focus:bg-[#05112e] transition-all font-bold text-white outline-none tracking-widest text-base font-mono"
                        placeholder="••••••••" required
                      />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={isLoading || !dataLoaded}
                    className="w-full h-16 bg-[#00f2fe] text-[#05112e] font-black uppercase tracking-widest transition-all hover:bg-[#00c6ff] flex items-center justify-center text-xs rounded-2xl shadow-xl shadow-[#00f2fe]/20 disabled:opacity-50 hover:scale-[1.01] active:scale-98"
                  >
                    {isLoading ? 'VALIDATING...' : 'ACCESS HOST'}
                  </button>
                </form>

                <div className="space-y-6">
                  <button 
                    type="button"
                    onClick={() => setShowIntroPlayer(true)}
                    className="w-full h-14 bg-gradient-to-r from-blue-600/30 to-[#00f2fe]/30 border-2 border-[#00f2fe]/60 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[#00f2fe] hover:text-[#05112e] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all text-xs flex items-center justify-center gap-2"
                  >
                    📺 PLAY SYSTEM INTRO WALKTHROUGH
                  </button>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsEnrolling(true)} 
                      className="flex-1 h-14 bg-[#cca01a]/15 border-2 border-[#cca01a] text-[#cca01a] font-black uppercase tracking-wider rounded-2xl hover:bg-[#cca01a] hover:text-[#05112e] hover:shadow-[0_0_20px_rgba(204,160,26,0.3)] transition-all text-xs flex items-center justify-center gap-2"
                    >
                      🌟 SELF-ENROLLMENT
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsRecovering(true)} 
                      className="flex-1 h-14 bg-[#00f2fe]/10 border-2 border-[#00f2fe]/60 text-[#00f2fe] font-black uppercase tracking-wider rounded-2xl hover:bg-[#00f2fe] hover:text-[#05112e] hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all text-xs flex items-center justify-center gap-2"
                    >
                      🔑 RECOVERY
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setError("SUPPORT REQUEST: Contact 0766149405 or itinternationalacademy46@gmail.com for identity re-sync.")}
                    className="text-[10px] font-black uppercase text-[#8fa3c7] hover:text-[#00f2fe] tracking-wider block w-full text-center"
                  >
                    LOST CREDENTIALS?
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
             <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#8fa3c7]/40 italic">Node Status: Operational // Cloud Synced</div>
             <div className="flex gap-8">
                <span className="text-[10px] font-black uppercase text-[#00f2fe] transition-colors cursor-pointer hover:text-white tracking-widest italic">ITIA ADMIN</span>
                <span className="text-[10px] font-black uppercase text-[#00f2fe] transition-colors cursor-pointer hover:text-white tracking-widest italic">SECURITY NODE</span>
             </div>
          </div>
        </div>
      </motion.div>

      {showIntroPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-[#0a1b44] border-4 border-[#00f2fe]/40 rounded-[32px] p-6 shadow-[0_0_50px_rgba(0,242,254,0.3)] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-sm font-black uppercase text-[#00f2fe] tracking-widest italic flex items-center gap-2">
                📺 SYSTEM GUIDE &amp; PORTAL WALKTHROUGH
              </span>
              <button 
                type="button"
                onClick={() => setShowIntroPlayer(false)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-black hover:bg-white/20 transition-all text-xs"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/50 border border-white/5 shadow-inner">
              <iframe 
                className="w-full h-full"
                src={(() => {
                  const url = introUrl || 'https://www.youtube.com/embed/5Nsh0Y30uO8';
                  if (url.includes('embed/')) return url;
                  try {
                    if (url.includes('youtu.be/')) {
                      const id = url.split('youtu.be/')[1]?.split('?')[0];
                      return `https://www.youtube.com/embed/${id}`;
                    }
                    if (url.includes('watch?v=')) {
                      const id = url.split('watch?v=')[1]?.split('&')[0];
                      return `https://www.youtube.com/embed/${id}`;
                    }
                  } catch(e) {}
                  return url;
                })()}
                title="System Walkthrough Guide"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="text-center text-[10px] text-gray-400 font-extrabold uppercase tracking-widest italic pt-2">
              IT INTERNATIONAL ACADEMY MASTER INTRO VIDEO // RECONFIGURABLE BY SYSTEM ADMIN
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
