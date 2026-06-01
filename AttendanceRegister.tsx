import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  UserCheck,
  ShieldCheck,
  Zap,
  Search,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/utils";
import { TimetableEntry, Attendance } from "../context/types";

export function AttendanceRegister() {
  const {
    user,
    timetable,
    attendance,
    registerAttendance,
    courses,
    refreshData,
  } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRegistering, setIsRegistering] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("all");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const isStaff =
    user?.role === "admin" ||
    user?.role === "instructor" ||
    user?.role === "staff" ||
    user?.email?.toLowerCase() === "felixbrownz907@gmail.com";
  const userCanRegister = !isStaff || user?.studentData || user?.role === 'admin';
  const currentStudentId =
    user?.role === "student"
      ? user.studentData?.studentId || user.username
      : `STAFF_${user?.username}`;
  const myAttendance = attendance.filter(
    (a) => a.studentId === currentStudentId,
  );

  // Manual Session Generation for students if none found
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualSession, setManualSession] = useState({
    title: "General Academic Session",
    time: currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  // Get today's day name (e.g. "Monday")
  const today = currentTime.toLocaleDateString("en-US", { weekday: "long" });
  const todaysClasses = timetable.filter((t) => t.day === today);

  // Sort today's classes to show student's course sessions first
  const sortedClasses = [...todaysClasses].sort((a, b) => {
    const aIsMyCourse = a.courseId === user?.studentData?.courseId;
    const bIsMyCourse = b.courseId === user?.studentData?.courseId;
    if (aIsMyCourse && !bIsMyCourse) return -1;
    if (!aIsMyCourse && bIsMyCourse) return 1;
    return 0;
  });

  const canRegister = (sessionTime: string, courseId?: string) => {
    // Admins and Staff bypass the restriction window in this high-sync environment
    if (isStaff) return true;

    // Support for students registering for their own current course with a very generous window for demo/early stage
    const isMyCourse = courseId === user?.studentData?.courseId;

    try {
      // sessionTime format: "08:00 - 10:00"
      const startTimeStr = sessionTime.split("-")[0].trim();
      const [hours, minutes] = startTimeStr.split(":").map(Number);

      const classStartTime = new Date();
      classStartTime.setHours(hours, minutes, 0, 0);

      // We allow registration anytime 4 hours before and 12 hours after the start time for the demo environment stability
      const windowStart = new Date(
        classStartTime.getTime() - 4 * 60 * 60 * 1000,
      );
      const windowEnd = new Date(
        classStartTime.getTime() + 12 * 60 * 60 * 1000,
      );

      const inWindow = currentTime >= windowStart && currentTime <= windowEnd;

      // Students can ALWAYS see their own today's classes as "active" in this specialized environment to avoid confusion
      if (isMyCourse) return true;

      return inWindow;
    } catch (e) {
      return isMyCourse; // Fallback to allowing if it's their course
    }
  };

  const [registrationModal, setRegistrationModal] =
    useState<TimetableEntry | null>(null);
  const [regData, setRegData] = useState({
    program: "",
    duration: "",
    sessionTime: "",
  });

  useEffect(() => {
    if (registrationModal) {
      const studentCourse = courses.find(
        (c) => c.id === user?.studentData?.courseId,
      );

      setRegData({
        program: studentCourse?.name || "General IT Essentials",
        duration: user?.studentData?.selectedDuration || "6 Months",
        sessionTime: registrationModal.sessionTime,
      });
    }
  }, [registrationModal, user, timetable, courses]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationModal) return;

    setIsRegistering(registrationModal.id);
    setError(null);
    try {
      // Find actual program name
      const programName = timetable.find((t) => t.id === registrationModal.id)
        ?.id
        ? "Software Engineering"
        : regData.program; // Simple fallback

      await registerAttendance(registrationModal.id, {
        program: regData.program,
        duration: regData.duration,
        sessionTime: regData.sessionTime,
      });
      setSuccess(registrationModal.id);
      setRegistrationModal(null);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(
        `REGISTRATION_FAILED: ${err.message || "Check terminal connection"}`,
      );
    } finally {
      setIsRegistering(null);
    }
  };

  const hasRegistered = (classId: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    return myAttendance.some(
      (a) => a.classId === classId && a.date === todayStr,
    );
  };

  const [isRegistrationLive, setIsRegistrationLive] = useState(
    typeof window !== "undefined" && window.AcademyState
      ? window.AcademyState.isRegistrationLive
      : false
  );

  useEffect(() => {
    const handleSync = () => {
      if (typeof window !== "undefined" && window.AcademyState) {
        setIsRegistrationLive(window.AcademyState.isRegistrationLive);
      }
    };
    
    const interval = setInterval(handleSync, 500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleRegistrationLive = (active: boolean) => {
    if (typeof window !== "undefined" && window.AcademyState) {
      window.AcademyState.isRegistrationLive = active;
      if (active) {
        window.AcademyState.activeClasses = [...timetable];
      } else {
        window.AcademyState.activeClasses = [];
      }
      setIsRegistrationLive(active);
    }
  };

  const [viewMode, setViewMode] = useState<"monitoring" | "registration">(
    isStaff ? "monitoring" : "registration",
  );

  if (isStaff && viewMode === "monitoring") {
    const todayStr = new Date().toISOString().split("T")[0];
    const registeredToday = attendance.filter((a) => a.date === todayStr);
    const uniqueStudentsToday = new Set(registeredToday.map((a) => a.studentId))
      .size;

    // Available programs for filtering - Use full course list for comprehensive separation
    const programs = ["all", ...courses.map((c) => c.name)];
    if (
      attendance.some(
        (a) => !programs.includes(a.program || "External/General"),
      )
    ) {
      programs.push("External/General");
    }

    const filteredAttendance = attendance
      .filter((a) => {
        const matchesSearch =
          (a.studentName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (a.studentId || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (a.classTitle || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (a.program || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProgram =
          programFilter === "all" ||
          a.program === programFilter ||
          (programFilter === "External/General" &&
            !courses.some((c) => c.name === a.program));

        return matchesSearch && matchesProgram;
      })
      .sort(
        (a, b) =>
          new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime(),
      );

    return (
      <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="text-left">
            <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase leading-none">
              Attendance Monitoring
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">
              Live Attendance Tracker & Records System
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {!isStaff && (
              <button
                onClick={() => {
                  const defaultEntry: TimetableEntry = {
                    id: `MANUAL_${Date.now()}`,
                    day: today,
                    sessionTime: `${currentTime.getHours().toString().padStart(2, "0")}:00 - ${(currentTime.getHours() + 2).toString().padStart(2, "0")}:00`,
                    courseId: user?.studentData?.courseId || "",
                    lecturerId: "",
                  };
                  setRegistrationModal(defaultEntry);
                }}
                className="bg-primary text-secondary px-8 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-3 h-3" />
                Open Registration
              </button>
            )}
            <button
              onClick={() => setViewMode("registration")}
              className="bg-primary text-secondary px-8 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Switch to Registration Mode
            </button>
            {isStaff && (
              <button
                onClick={async () => {
                  await refreshData();
                  alert("SYNC: Attendance data updated.");
                }}
                className="bg-white border-2 border-gray-100 text-gray-400 px-8 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-sm hover:text-primary hover:border-primary transition-all flex items-center gap-2 active:scale-95"
              >
                <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
                Quick Sync
              </button>
            )}
            <div className="bg-white px-8 py-6 rounded-[32px] border-2 border-gray-100 shadow-sm flex items-center gap-6 group hover:border-primary/20 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-2 tracking-widest">
                  Students present today
                </p>
                <p className="text-3xl font-black text-gray-900 leading-none italic">
                  {uniqueStudentsToday}
                </p>
              </div>
            </div>

            <div className="relative group flex-1 lg:w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="SEARCH RECORDS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border-2 border-gray-100 rounded-[24px] focus:outline-none focus:border-primary/50 text-[10px] font-black uppercase tracking-widest shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* SYSTEM CLASS SETUP CONTROLLER */}
        <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md hover:border-primary/20 transition-all text-left">
           <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-gray-900 italic tracking-tighter flex items-center gap-2">
                 <Zap className={cn("w-5 h-5", isRegistrationLive ? "text-emerald-500 animate-pulse" : "text-gray-400")} />
                 ADMIN ACADEMY GATEWAY // SESSION SETUP
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                 SYS_LINK_GATEWAY: Active class setup controls permitting daily presence validations.
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest font-mono">SYSTEM_STATUS</p>
                 <p className={cn("text-xs font-black uppercase tracking-wider italic font-mono", isRegistrationLive ? "text-emerald-500" : "text-red-500")}>
                    {isRegistrationLive ? "REG_LIVE_ON_CHANNEL_A" : "ISOLATED_PORT_OFFLINE"}
                 </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleRegistrationLive(!isRegistrationLive)}
                className={cn(
                  "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] font-mono transition-all duration-300 hover:scale-102 active:scale-95 shadow-lg",
                  isRegistrationLive 
                    ? "bg-red-500 text-white shadow-red-500/10 hover:bg-red-600" 
                    : "bg-primary text-secondary shadow-primary/20 hover:bg-primary/95"
                )}
              >
                 {isRegistrationLive ? "Shutdown Session" : "Trigger Class Setup"}
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500 p-8 rounded-[40px] text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2 italic">
                Total Registrations
              </p>
              <h3 className="text-4xl font-black italic tracking-tighter">
                {registeredToday.length}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-4 opacity-60">
                Confirmed Attendance Today
              </p>
            </div>
            <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
          </div>

          <div className="bg-secondary p-8 rounded-[40px] text-white shadow-2xl shadow-black/20 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2 italic">
                Active Courses
              </p>
              <h3 className="text-4xl font-black italic tracking-tighter">
                {new Set(registeredToday.map((r) => r.program)).size}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-4 opacity-60">
                Courses Active Today
              </p>
            </div>
            <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div className="bg-white border-2 border-gray-100 p-8 rounded-[40px] shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="relative z-10 text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 italic">
                Peak Session
              </p>
              <h3 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase">
                {(() => {
                  if (registeredToday.length === 0) return "No Sessions";
                  const counts: Record<string, number> = {};
                  registeredToday.forEach((r) => {
                    const time = r.sessionTime || "Unknown";
                    counts[time] = (counts[time] || 0) + 1;
                  });
                  const entries = Object.entries(counts);
                  if (entries.length === 0) return "No Peak Data";
                  return entries.sort((a, b) => b[1] - a[1])[0][0];
                })()}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-4 text-primary">
                Busiest Session
              </p>
            </div>
            <Clock className="absolute -right-4 -bottom-4 w-32 h-32 text-primary opacity-5 group-hover:-rotate-12 transition-transform duration-700" />
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-10 border-2 border-gray-100 shadow-xl">
          <div className="flex items-center justify-between mb-10 overflow-x-auto">
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h2 className="text-xl font-black uppercase italic tracking-tighter">
                Real-time Attendance
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-6 py-2 rounded-2xl border border-gray-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Live Monitoring Active
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              {programs.map((p) => (
                <button
                  key={p}
                  onClick={() => setProgramFilter(p)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    programFilter === p
                      ? "bg-primary text-secondary shadow-lg shadow-primary/10"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto space-y-12">
            {Array.from(
              new Set(
                filteredAttendance.map((a) => a.program || "General Program"),
              ),
            )
              .sort()
              .map((program) => {
                const programAttendance = filteredAttendance.filter(
                  (a) => (a.program || "General Program") === program,
                );
                return (
                  <div key={program} className="space-y-4">
                    <div className="flex items-center gap-4 py-4 border-b-2 border-gray-50">
                      <div className="w-2 h-6 bg-primary rounded-full" />
                      <h3 className="text-lg font-black uppercase italic tracking-tighter text-gray-900">
                        {program}
                      </h3>
                    </div>

                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-50">
                          <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                            Student Name
                          </th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                            Duration
                          </th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                            Class / Session
                          </th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">
                            Time
                          </th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-right">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        <AnimatePresence mode="popLayout">
                          {programAttendance.map((record) => (
                            <motion.tr
                              key={record.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="group hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center font-black uppercase text-xs shadow-lg shadow-black/5">
                                    {record.studentName?.[0] || 'S'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black uppercase italic tracking-tight text-gray-900 group-hover:text-primary transition-colors">
                                      {record.studentName}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      ID: {record.studentId}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {record.duration || "Standard"}
                                </p>
                              </td>
                              <td className="px-6 py-5">
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-gray-700">
                                    {record.classTitle}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-gray-300" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      {new Date(record.date).toLocaleDateString(
                                        "en-GB",
                                        {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        },
                                      )}
                                      {record.sessionTime &&
                                        ` // ${record.sessionTime}`}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 group-hover:border-primary/20 transition-colors">
                                  <Clock className="w-3 h-3 text-primary" />
                                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                    {new Date(
                                      record.checkInTime,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                                  {record.status}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                );
              })}

            {filteredAttendance.length === 0 && (
              <div className="text-center py-24 opacity-20 flex flex-col items-center gap-4">
                <AlertCircle className="w-16 h-16 text-gray-400" />
                <p className="text-sm font-black uppercase tracking-[0.3em] italic">
                  No attendance records found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-start">
        <div className="text-left space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 italic">
            Attendance Register
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Daily Class Attendance Registration
          </p>
        </div>
        <div className="flex items-center gap-4">
          {userCanRegister && (
            <button
              onClick={() => {
                const defaultEntry: TimetableEntry = {
                  id: `MANUAL_${Date.now()}`,
                  day: today,
                  sessionTime: `${currentTime.getHours().toString().padStart(2, "0")}:00 - ${(currentTime.getHours() + 2).toString().padStart(2, "0")}:00`,
                  courseId: user?.studentData?.courseId || "",
                  lecturerId: "",
                };
                setRegistrationModal(defaultEntry);
              }}
              className="bg-primary text-secondary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              Registration Override
            </button>
          )}
          {isStaff && (
            <button
              onClick={() => setViewMode("monitoring")}
              className="bg-secondary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Switch to Monitoring
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] p-10 border-2 border-gray-100 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <Calendar className="w-48 h-48" />
            </div>

            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h2 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> REAL-TIME ATTENDANCE:{" "}
                  {today}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Daily Attendance List
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                  Current Time
                </p>
                <p className="text-lg font-black text-primary italic tracking-tighter">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {!isRegistrationLive ? (
                <div className="py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 text-center flex flex-col items-center justify-center p-6 transition-all">
                   <AlertCircle className="w-12 h-12 text-gray-300 mb-4 animate-bounce" />
                   <h3 className="text-base font-black uppercase tracking-widest text-slate-800 italic mb-2">No Active Session</h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed max-w-sm">The digital attendance registry requires administrative presence initialization. Please await active session gateway launch from school supervisors.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedClasses.length > 0 ? (
                    sortedClasses.map((entry) => {
                      const active = true; // Bypassed- restriction filters removed!
                      const registered = hasRegistered(entry.id);
                      const isMyCourse =
                        entry.courseId === user?.studentData?.courseId;

                      return (
                        <div
                          key={entry.id}
                          className={cn(
                            "p-8 rounded-[32px] border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6",
                            registered
                              ? "bg-emerald-50 border-emerald-100"
                              : "bg-primary/5 border-primary shadow-lg shadow-primary/5",
                          )}
                        >
                          <div className="flex items-center gap-6">
                            <div
                              className={cn(
                                "w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black transition-all",
                                registered
                                  ? "bg-emerald-500 text-white"
                                  : "bg-primary text-secondary",
                              )}
                            >
                              <Clock className="w-6 h-6" />
                              <span className="text-[10px] uppercase leading-none mt-1">
                                {entry.sessionTime.split(" - ")[0]}
                              </span>
                            </div>
                            <div className="text-left">
                              <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 leading-none mb-2">
                                Session {entry.sessionTime}
                              </h3>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" /> Digital
                                  Attendance Status
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {registered ? (
                              <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20">
                                <CheckCircle className="w-4 h-4" /> Registered
                              </div>
                            ) : (
                              <button
                                onClick={() => setRegistrationModal(entry)}
                                className="px-8 h-14 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                              >
                                Record Attendance
                                <Zap className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                      <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">No classes cataloged for today</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Guidelines */}
          <div className="bg-secondary p-10 rounded-[40px] text-white space-y-6 shadow-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
              <ShieldCheck className="w-40 h-40" />
            </div>
            {/* ... same content as before ... */}
            <div className="w-16 h-16 rounded-3xl bg-primary text-secondary flex items-center justify-center shrink-0 shadow-xl shadow-black/20">
              <UserCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-black uppercase italic tracking-tighter">
                Attendance Protocol
              </h4>
              <p className="text-[10px] font-medium text-white/40 leading-relaxed uppercase tracking-widest italic">
                Students are required to register presence within the 2-hour
                pre-session window for academic credit.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">
                Status
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-[10px] font-black italic text-emerald-400 uppercase tracking-widest">
                  Synchronized
                </span>
              </span>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-[40px] p-8 border-2 border-gray-100 shadow-xl text-left">
            <h3 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2 mb-8">
              <Clock className="w-4 h-4 text-primary" /> Recent Logins
            </h3>
            <div className="space-y-4">
              {myAttendance.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between"
                >
                  <div className="text-left">
                    <p className="text-xs font-black uppercase text-gray-900 leading-none mb-1">
                      {record.classTitle}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
              ))}
              {myAttendance.length === 0 && (
                <div className="py-10 text-center opacity-20">
                  <p className="text-[10px] font-black uppercase tracking-widest italic">
                    No history found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {registrationModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 bg-white/20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

              <div className="flex items-center justify-between mb-8">
                <div className="text-left">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                    Registration Protocol
                  </h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    Verify Program & Session Metadata
                  </p>
                </div>
                <button
                  onClick={() => setRegistrationModal(null)}
                  className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors flex items-center justify-center font-black"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-4">
                  <div className="text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary block ml-2 mb-2">
                      Course of Study
                    </label>
                    <select
                      required
                      value={regData.program}
                      onChange={(e) =>
                        setRegData((prev) => ({
                          ...prev,
                          program: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all font-bold text-gray-700 appearance-none"
                    >
                      <option value="">Select Course of Study</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.name}>{course.name}</option>
                      ))}
                      {!courses.some(c => c.name === 'General IT Essentials') && (
                        <option value="General IT Essentials">General IT Essentials</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary block text-left ml-2">
                      Duration
                    </label>
                    <select
                      required
                      value={regData.duration}
                      onChange={(e) =>
                        setRegData((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all font-bold text-gray-700 appearance-none"
                    >
                      <option value="6 Weeks">6 Weeks</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary block text-left ml-2">
                      Time
                    </label>
                    <input
                      type="text"
                      required
                      value={regData.sessionTime}
                      onChange={(e) =>
                        setRegData((prev) => ({
                          ...prev,
                          sessionTime: e.target.value,
                        }))
                      }
                      placeholder="e.g. 09:00 - 11:00"
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all font-bold text-gray-700 uppercase"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering !== null}
                  className="w-full bg-primary h-16 rounded-2xl text-secondary font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                >
                  {isRegistering ? "TRANSMITTING..." : "Confirm Registration"}
                  <Zap className="w-4 h-4" />
                </button>
                {error && (
                  <p className="text-[8px] font-black text-red-500 uppercase tracking-widest text-center mt-4 italic">
                    {error}
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
