import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cn } from './utils';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Bell, LayoutDashboard, BookOpen, Library, GraduationCap, Radio, Settings, Sparkles, FolderOpen, CreditCard, FileText, LogOut, Users, Upload, Award, Calendar, Beaker } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Navbar({ activeSection, onSectionChange }: NavbarProps) {
  const { user, notifications, clearNotifications, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'learning-site', label: 'Learning Materials & Handouts', icon: BookOpen },
    { id: 'library', label: 'E-Library Resource Hub', icon: Library },
    { id: 'courses', label: 'Academy Programs', icon: FolderOpen },
    { id: 'submissions', label: 'Assignments & Exams', icon: FileText },
    { id: 'labs', label: 'Practical Labs (1000+ Simulated Labs)', icon: Beaker },
    { id: 'financial', label: 'Financial Registry Receipts', icon: CreditCard },
  ];

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl bg-[#0a1b44] h-20 z-[1000] border border-[#00f2fe]/15 flex justify-center items-center px-6 sm:px-10 font-sans shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl">
        <div className="w-full flex items-center justify-between">
          
          {/* Menu Trigger Hamburger button + Brand Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsOpen(true)}
              className="w-12 h-12 bg-[#05112e] border border-[#00f2fe]/10 text-[#00f2fe] hover:bg-[#00f2fe] hover:text-[#05112e] transition-all rounded-xl flex items-center justify-center shadow-inner active:scale-95 group focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSectionChange('dashboard')}>
              <div className="w-11 h-11 bg-[#00f2fe] flex items-center justify-center font-black text-[#05112e] text-base border border-white/10 rounded-xl shadow-md">IT</div>
              <div className="flex flex-col">
                <h1 className="text-white font-black tracking-[-0.04em] text-sm md:text-base uppercase leading-none group-hover:text-[#00f2fe] transition-colors italic">ACADEMY_GLOBAL</h1>
                <p className="text-[8px] text-[#38bdf8] font-bold uppercase tracking-[0.4em] mt-1 group-hover:text-white transition-colors">CENTRAL_INTERFACE</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Direct, Persistent Access for quick views) */}
          <div className="hidden lg:flex items-center gap-3 bg-[#05112e]/60 border border-[#00f2fe]/10 px-4 py-1.5 rounded-xl">
            {[
              { id: 'dashboard', label: 'Home' },
              { id: 'learning-site', label: 'Learning Hub' },
              { id: 'library', label: '📚 E-Library', highlight: true },
              { id: 'labs', label: 'Simulated Labs' },
              { id: 'submissions', label: 'Assignments' },
              { id: 'financial', label: 'Financial' },
            ].map((link) => {
              const active = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSectionChange(link.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 focus:outline-none",
                    active
                      ? "bg-[#00f2fe] text-[#05112e] shadow-[0_0_10px_rgba(0,242,254,0.3)]"
                      : link.highlight
                        ? "text-[#00f2fe] hover:bg-[#00f2fe]/20 border border-[#00f2fe]/30 bg-[#00f2fe]/5"
                        : "text-[#8fa3c7] hover:bg-[#00f2fe]/5 hover:text-white"
                  )}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Right Buttons Container (Alerts Center & Settings Trigger) */}
          <div className="flex items-center gap-3">
            
            {/* Notification Center */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "px-4 py-2.5 transition-all relative border rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest focus:outline-none",
                  showNotifications 
                    ? "bg-[#00f2fe] text-[#05112e] border-[#00f2fe]" 
                    : "bg-[#05112e] text-[#e2e8f0] border-[#00f2fe]/15 hover:border-[#00f2fe]/50"
                )}
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">ALERTS</span>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a1b44]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 md:w-96 bg-[#0a1b44] shadow-2xl border border-[#00f2fe]/20 rounded-2xl overflow-hidden animate-in fade-in duration-300 z-[1100]">
                   <div className="bg-[#05112e] p-5 flex justify-between items-center border-b border-[#00f2fe]/10">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#00f2fe]" /> SYSTEM_ALERTS
                      </h3>
                      <button onClick={clearNotifications} className="text-[9px] font-black uppercase text-[#38bdf8] hover:text-red-400">CLEAR</button>
                   </div>
                   <div className="max-h-[320px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {notifications.length > 0 ? (
                         notifications.map(notif => (
                           <div key={notif.id} className="p-4 bg-[#05112e] border border-[#00f2fe]/5 rounded-xl group hover:border-[#00f2fe]/20 transition-all">
                             <p className="text-[10px] font-black text-white uppercase tracking-tight">{notif.title}</p>
                             <p className="text-[10px] font-semibold text-[#8fa3c7] leading-relaxed mt-1">{notif.message}</p>
                           </div>
                         ))
                      ) : (
                         <div className="py-12 text-center flex flex-col gap-2">
                            <p className="text-[10px] font-black uppercase text-[#38bdf8]/40 tracking-widest">NULL_FEED</p>
                         </div>
                      )}
                   </div>
                </div>
              )}
            </div>

            {/* Direct, Unmissable E-Library Button */}
            <button 
              onClick={() => onSectionChange('library')}
              className={cn(
                "px-4 py-2.5 transition-all text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 border focus:outline-none",
                activeSection === 'library'
                  ? "bg-amber-500 text-white border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-500 hover:bg-amber-500/20"
              )}
            >
              <Library className="w-5 h-5 shrink-0 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">E-Library</span>
            </button>

            <button 
              onClick={() => onSectionChange(user?.role === 'admin' ? 'sys-config' : 'settings')}
              className="bg-[#00f2fe] hover:bg-[#00c6ff] text-[#05112e] text-[10px] font-black px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center gap-1.5 focus:outline-none"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">SYSTEM</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-out Navigation Drawer Menu with Blur Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#05112e]/80 backdrop-blur-md z-[1500]"
            />

            {/* Side Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-full max-w-sm bg-[#0a1b44] z-[1600] border-r border-[#00f2fe]/15 shadow-[10px_0_40px_rgba(0,0,0,0.5)] flex flex-col font-sans"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#00f2fe]/15 flex items-center justify-between bg-[#05112e]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00f2fe] flex items-center justify-center font-black text-[#05112e] text-sm rounded-lg shadow-sm">IT</div>
                  <div>
                    <h2 className="text-white font-black uppercase text-sm tracking-tight leading-none">ACADEMY DIRECTORY</h2>
                    <p className="text-[8px] font-bold text-[#38bdf8] uppercase tracking-[0.3em] mt-1">MODULE_NAVIGATION_NODE</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 bg-[#0a1b44] hover:bg-[#00f2fe] hover:text-[#05112e] text-[#00f2fe] border border-[#00f2fe]/10 rounded-lg flex items-center justify-center active:scale-95 transition-all focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Menu Items */}
              <div className="flex-1 overflow-y-auto py-8 px-4 space-y-3 custom-scrollbar">
                {menuItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSectionChange(item.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-sans text-left group focus:outline-none",
                        isActive 
                          ? "bg-[#00f2fe] text-[#05112e] font-black shadow-[0_4px_20px_rgba(0,242,254,0.15)]" 
                          : "text-[#e2e8f0] hover:bg-[#05112e] hover:text-[#00f2fe] border border-transparent hover:border-[#00f2fe]/10"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-[#05112e]" : "text-[#38bdf8]"
                      )} />
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                  );
                })}

                {/* 1. FOR THE ADMINISTRATIVE ENVIRONMENT CONTEXT */}
                {(user?.role === 'admin' || user?.role === 'instructor' || user?.role === 'staff' || user?.email?.toLowerCase() === 'felixbrownz907@gmail.com') && (
                  <>
                    <div className="h-px bg-[#00f2fe]/10 my-4" />
                    
                    {/* Master string item: "Total Registered Students" */}
                    <button
                      onClick={() => {
                        onSectionChange('students');
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-sans text-left group focus:outline-none",
                        activeSection === 'students'
                          ? "bg-[#00f2fe] text-[#05112e] font-black shadow-[0_4px_20px_rgba(0,242,254,0.15)]"
                          : "text-[#e2e8f0] hover:bg-[#05112e] hover:text-[#00f2fe] border border-transparent hover:border-[#00f2fe]/10"
                      )}
                    >
                      <Users className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                        activeSection === 'students' ? "text-[#05112e]" : "text-[#38bdf8]"
                      )} />
                      <span className="text-xs font-black uppercase tracking-widest">Total Registered Students</span>
                    </button>

                    {/* Manage Courses (Admin) */}
                    <button
                      onClick={() => {
                        onSectionChange('courses');
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-sans text-left group focus:outline-none",
                        activeSection === 'courses'
                          ? "bg-[#00f2fe] text-[#05112e] font-black shadow-[0_4px_20px_rgba(0,242,254,0.15)]"
                          : "text-[#e2e8f0] hover:bg-[#05112e] hover:text-[#00f2fe] border border-transparent hover:border-[#00f2fe]/10"
                      )}
                    >
                      <BookOpen className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                        activeSection === 'courses' ? "text-[#05112e]" : "text-[#38bdf8]"
                      )} />
                      <span className="text-xs font-black uppercase tracking-widest">Manage Academic Programs</span>
                    </button>

                    {/* Manage Intakes (Admin) */}
                    <button
                      onClick={() => {
                        onSectionChange('intakes');
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-sans text-left group focus:outline-none",
                        activeSection === 'intakes'
                          ? "bg-[#00f2fe] text-[#05112e] font-black shadow-[0_4px_20px_rgba(0,242,254,0.15)]"
                          : "text-[#e2e8f0] hover:bg-[#05112e] hover:text-[#00f2fe] border border-transparent hover:border-[#00f2fe]/10"
                      )}
                    >
                      <Calendar className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                        activeSection === 'intakes' ? "text-[#05112e]" : "text-[#38bdf8]"
                      )} />
                      <span className="text-xs font-black uppercase tracking-widest">Manage Academic Intakes</span>
                    </button>

                    {/* Categorized Registry Section Header */}
                    <div className="pt-4 pb-1 pl-2">
                       <p className="text-[9px] font-black uppercase text-[#38bdf8]/50 tracking-[0.2em] italic">
                         Program Upload Matrix
                       </p>
                    </div>

                    {[
                      { id: 'upload-cyber', label: 'Cyber Security Upload Portal' },
                      { id: 'upload-web', label: 'Web Development Upload Portal' },
                      { id: 'upload-software', label: 'Software Engineering Upload Portal' },
                      { id: 'upload-data', label: 'Data Science Upload Portal' }
                    ].map((portal) => {
                      const isActive = activeSection === portal.id;
                      return (
                        <button
                          key={portal.id}
                          onClick={() => {
                            onSectionChange(portal.id);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-sans text-left group focus:outline-none",
                            isActive
                              ? "bg-[#00f2fe] text-[#05112e] font-black shadow-[0_4px_20px_rgba(0,242,254,0.15)]"
                              : "text-[#e2e8f0] hover:bg-[#05112e] hover:text-[#00f2fe] border border-transparent hover:border-[#00f2fe]/10"
                          )}
                        >
                          <Upload className={cn(
                            "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                            isActive ? "text-[#05112e]" : "text-[#38bdf8]"
                          )} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{portal.label}</span>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* 2. FOR THE STUDENT ENVIRONMENT CONTEXT */}
                {(user?.role === 'student') && (
                  <>
                    <div className="h-px bg-[#00f2fe]/10 my-4" />
                    
                    {/* Interactive Segment Header: "Academic Submissions" */}
                    <div className="pt-4 pb-1 pl-2">
                       <p className="text-[9px] font-black uppercase text-[#38bdf8]/50 tracking-[0.2em] italic">
                         Academic Submissions
                       </p>
                    </div>

                    {[
                      { id: 'submissions', label: 'Upload Active Assignments' },
                      { id: 'assessments', label: 'Upload Examination Scripts' }
                    ].map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSectionChange(item.id);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-sans text-left group focus:outline-none",
                            isActive
                              ? "bg-[#00f2fe] text-[#05112e] font-black shadow-[0_4px_20px_rgba(0,242,254,0.15)]"
                              : "text-[#e2e8f0] hover:bg-[#05112e] hover:text-[#00f2fe] border border-transparent hover:border-[#00f2fe]/10"
                          )}
                        >
                          <FileText className={cn(
                            "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                            isActive ? "text-[#05112e]" : "text-[#38bdf8]"
                          )} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                        </button>
                      );
                    })}

                    <div className="h-px bg-[#00f2fe]/10 my-4" />

                    {/* Direct Performance Assessment link: "Check My Results" */}
                    <button
                      onClick={() => {
                        onSectionChange('assessments');
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-sans text-left group focus:outline-none",
                        activeSection === 'assessments'
                          ? "bg-[#00f2fe] text-[#05112e] font-black shadow-[0_4px_20px_rgba(0,242,254,0.15)]"
                          : "text-[#e2e8f0] hover:bg-[#05112e] hover:text-[#00f2fe] border border-transparent hover:border-[#00f2fe]/10"
                      )}
                    >
                      <Award className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                        activeSection === 'assessments' ? "text-[#05112e]" : "text-[#38bdf8]"
                      )} />
                      <span className="text-xs font-black uppercase tracking-widest">Check My Results</span>
                    </button>

                    <div className="h-px bg-[#00f2fe]/10 my-4" />

                    {/* Dynamic Certificate Download link with balanceDue block */}
                    <button
                      id="certificateLink"
                      className={cn(
                        "menu-item-certificate w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-sans text-left group focus:outline-none",
                        activeSection === 'certificate'
                          ? "bg-[#00f2fe] text-[#05112e] font-black shadow-[0_4px_20px_rgba(0,242,254,0.15)]"
                          : "text-[#e2e8f0] hover:bg-[#05112e] hover:text-[#00f2fe] border border-transparent hover:border-[#00f2fe]/10"
                      )}
                      onClick={(e) => {
                        const ledger = (window as any).AcademyFinanceLedger || [];
                        const record = ledger.find((r: any) => r.studentId === user?.studentData?.studentId);
                        
                        let balAmount = 0;
                        let hasOutstanding = false;
                        if (record) {
                           balAmount = record.balanceDue;
                           hasOutstanding = record.balanceDue > 0;
                        } else {
                           const duration = user?.studentData?.selectedDuration || '6 Months';
                           const prices: Record<string, number> = {
                             "6 weeks": 200,
                             "3 months": 350,
                             "6 months": 1000
                           };
                           const price = prices[duration.toLowerCase().trim()] || 1000;
                           balAmount = price;
                           hasOutstanding = price > 0;
                        }

                        if (hasOutstanding) {
                           e.preventDefault();
                           e.stopPropagation();
                           window.dispatchEvent(new CustomEvent('graduation-certificate-blocked', {
                              detail: { balance: balAmount }
                           }));
                           setIsOpen(false);
                        } else {
                           onSectionChange('certificate');
                           setIsOpen(false);
                        }
                      }}
                    >
                      <Award className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                        activeSection === 'certificate' ? "text-[#05112e]" : "text-yellow-400 group-hover:text-yellow-300"
                      )} />
                      <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">Download Certificate</span>
                    </button>
                  </>
                )}

                <div className="h-px bg-[#00f2fe]/10 my-4" />

                <button
                  onClick={() => {
                    onSectionChange(user?.role === 'admin' ? 'sys-config' : 'settings');
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-sans text-left group focus:outline-none",
                    (activeSection === 'settings' || activeSection === 'sys-config')
                      ? "bg-[#00f2fe] text-[#05112e] font-black shadow-[0_4px_20px_rgba(0,242,254,0.15)]"
                      : "text-[#e2e8f0] hover:bg-[#05112e] hover:text-[#00f2fe] border border-transparent hover:border-[#00f2fe]/10"
                  )}
                >
                  <Settings className={cn(
                    "w-5 h-5 shrink-0 transition-transform group-hover:rotate-45 duration-300",
                    (activeSection === 'settings' || activeSection === 'sys-config') ? "text-[#05112e]" : "text-[#38bdf8]"
                  )} />
                  <span className="text-xs font-black uppercase tracking-widest">System Settings</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-sans text-left group focus:outline-none text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1 text-red-400" />
                  <span className="text-xs font-black uppercase tracking-widest">Log Out Account</span>
                </button>
              </div>

              {/* Drawer Footer Status */}
              <div className="p-6 bg-[#05112e] border-t border-[#00f2fe]/10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[9px] font-black text-[#38bdf8] uppercase tracking-[0.45em]">GLOBAL_ACADEMY_ONLINE</span>
                </div>
                <div className="mt-3 text-[9px] font-semibold text-[#8fa3c7]/65 uppercase tracking-wide leading-relaxed">
                  SECURE CONNECTION // JWT AUTHENTICATED <br />
                  NODE_ID: {user?.role === 'admin' ? 'ROOT_SERVER' : (user?.studentData?.studentId || 'STUDENT_PORT')}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
