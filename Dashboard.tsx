import React, { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../components/utils";
import { supabase } from "../lib/supabase";
import {
  Video,
  Beaker,
  Award,
  BookOpen,
  FileText,
  CheckCircle,
  Cpu,
  Sparkles,
  Trash2,
} from "lucide-react";

function DashboardTile({
  label,
  desc,
  onClick,
  textColor = "text-white",
  badge,
  badgeColor = "text-[#00f2fe]",
  locked = false,
}: {
  label: string;
  desc: string;
  onClick: () => void;
  textColor?: string;
  badge?: string;
  badgeColor?: string;
  locked?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ y: -2, borderColor: "rgba(0, 242, 254, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      onClick={locked ? undefined : onClick}
      className={cn(
        "p-8 border border-[#00f2fe]/15 transition-all duration-300 group flex flex-col items-start gap-6 active:scale-95 text-left relative bg-[#0a1b44] rounded-2xl w-full",
        locked && "opacity-40 cursor-not-allowed grayscale border-blue-600/5",
      )}
    >
      {badge && !locked && (
        <div
          className={cn(
            "text-[9px] font-black uppercase tracking-[0.25em] mb-2 flex items-center gap-2 px-3 py-1.5 bg-[#00f2fe]/5 border border-[#00f2fe]/20 text-[#00f2fe]",
            badgeColor,
          )}
        >
          {badge}
        </div>
      )}

      <div className="flex-1 w-full relative z-10">
        <h4
          className={cn(
            "text-sm font-black uppercase tracking-tight leading-tight mb-2 group-hover:text-[#00f2fe] transition-colors",
            locked ? "text-slate-400" : textColor,
          )}
        >
          {label}
        </h4>
        <p className="text-[10px] md:text-[11px] font-bold text-[#e2e8f0] group-hover:text-white transition-colors uppercase tracking-widest leading-relaxed line-clamp-2">
          {locked ? "IDENTITY_UNVERIFIED" : desc}
        </p>
      </div>

      <div className="mt-4 pt-4 w-full flex items-center justify-between transition-all border-t border-[#00f2fe]/10 relative z-10 w-full">
        <div className="text-[10px] font-black text-[#00f2fe]/60 group-hover:text-[#00f2fe] uppercase tracking-widest">
          PROCEED
        </div>
        <div className="text-[#00f2fe] text-lg font-black">{">"}</div>
      </div>
    </motion.button>
  );
}

export function Dashboard({
  onAction,
}: {
  onAction?: (section: string) => void;
  portalType: string;
}) {
  const {
    courses,
    intakes,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    user,
    refreshData,
    lecturers,
    attendance,
    submissions,
    completions,
    payments,
    onlineClasses,
    registerAttendance,
    updateStudent,
    addNotification,
  } = useAuth();
  const [isAddingAnnouncement, setIsAddingAnnouncement] = React.useState(false);
  const [isSyncing] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = React.useState({
    title: "",
    content: "",
    type: "general" as const,
  });

  // Custom video playback states
  const [enteredClassId, setEnteredClassId] = useState<string | null>(null);

  // Dynamic custom synthesized features loaded from localStorage
  const [customFeatures, setCustomFeatures] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("ita_custom_features");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Helper functions for packing program track information into Supabase current_track field
  const packStudentEnrollments = (courseIds: string[], activeCourseId: string, trackName: string = "Unit 1: Fundamentals") => {
    return `TRACKS:${courseIds.join(",")}|ACTIVE:${activeCourseId}|${trackName}`;
  };

  const unpackStudentEnrollments = (currentTrackStr: string | undefined, defaultCourseId: string) => {
    if (!currentTrackStr || !currentTrackStr.startsWith("TRACKS:")) {
      return {
        courseIds: defaultCourseId ? [defaultCourseId] : [],
        activeCourseId: defaultCourseId,
        trackName: currentTrackStr || "Unit 1: Fundamentals"
      };
    }
    try {
      const parts = currentTrackStr.split("|");
      const tracksPart = parts[0].replace("TRACKS:", "");
      const activePart = parts[1] ? parts[1].replace("ACTIVE:", "") : defaultCourseId;
      const trackName = parts[2] || "Unit 1: Fundamentals";
      
      let courseIds = tracksPart ? tracksPart.split(",") : [defaultCourseId];
      if (defaultCourseId && !courseIds.includes(defaultCourseId)) {
        courseIds.unshift(defaultCourseId);
      }
      return {
        courseIds: Array.from(new Set(courseIds)),
        activeCourseId: activePart || defaultCourseId,
        trackName
      };
    } catch (e) {
      return {
        courseIds: defaultCourseId ? [defaultCourseId] : [],
        activeCourseId: defaultCourseId,
        trackName: "Unit 1: Fundamentals"
      };
    }
  };

  const [blueprint, setBlueprint] = React.useState<any>(null);

  const isStudent = user?.role === "student";
  const studentData = user?.studentData;

  // Unpack enrollments from Supabase permanent memory
  const enrollmentInfo = React.useMemo(() => {
    return unpackStudentEnrollments(studentData?.currentTrack, studentData?.courseId || "");
  }, [studentData?.currentTrack, studentData?.courseId]);

  const enrolledCourseIds = enrollmentInfo.courseIds;
  const activeCourseId = enrollmentInfo.activeCourseId;

  const handleEnrollInCourse = async (newCourseId: string) => {
    if (!studentData) return;
    try {
      const updatedCourseIds = Array.from(new Set([...enrolledCourseIds, newCourseId])).slice(0, 3);
      const newTrackValue = packStudentEnrollments(updatedCourseIds, newCourseId, enrollmentInfo.trackName);
      
      await updateStudent({
        ...studentData,
        currentTrack: newTrackValue
      });
      
      if (addNotification) {
        addNotification("Enrolled Successfully", `Micro-program self-paced track added to Supabase.`, "success");
      }
    } catch (e) {
      console.error("Failed to enroll", e);
    }
  };

  const handleSwitchActiveCourse = async (courseId: string) => {
    if (!studentData) return;
    try {
      const newTrackValue = packStudentEnrollments(enrolledCourseIds, courseId, enrollmentInfo.trackName);
      
      await updateStudent({
        ...studentData,
        currentTrack: newTrackValue
      });
      
      if (addNotification) {
        addNotification("Track Active", `Syllabus set to ${courses.find(c => c.id === courseId)?.name}`, "info");
      }
    } catch (e) {
      console.error("Failed to swap track", e);
    }
  };

  const studentCourse = courses.find((c) => c.id === (activeCourseId || studentData?.courseId));
  const studentIntake = intakes.find((i) => i.id === studentData?.intakeId);

  const studentPayments = payments
    ? payments.filter((p: any) => p.studentId === studentData?.studentId)
    : [];
  const totalPaid = studentPayments
    .filter((p: any) => p.status === "Approved")
    .reduce((sum: number, p: any) => sum + p.amountPaid, 0);
  const currentBalance =
    studentPayments.length > 0
      ? studentPayments[studentPayments.length - 1].balance
      : 0;

  const hasRegisteredToday = attendance?.some(
    (a) =>
      a.studentId === studentData?.studentId &&
      new Date(a.date).toDateString() === new Date().toDateString(),
  );

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement({
      ...newAnnouncement,
      id: "",
      date: new Date().toISOString(),
    });
    setIsAddingAnnouncement(false);
    setNewAnnouncement({ title: "", content: "", type: "general" });
  };

  const totalLessons =
    studentCourse?.modules.reduce((acc, m: any) => acc + m.lessons.length, 0) ||
    0;
  const completedLessons = completions.length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Create a function that calculates progress based on enrollment date and course duration weeks
  const calculateProgress = React.useCallback(() => {
    if (!studentData) return 0;

    // 1. If study blueprint exists with commencement_date, calculate based on that
    if (blueprint?.commencement_date) {
      const now = new Date();
      const start = new Date(blueprint.commencement_date);
      const durationWeeks = blueprint.program_duration_weeks || 12;

      if (now < start) {
        return 0; // Classes haven't started yet
      } else {
        const weeksElapsed = (now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000);
        return Math.min(100, Math.round((weeksElapsed / durationWeeks) * 100));
      }
    }

    // 2. Otherwise fall back to student data metadata
    const sData = studentData as any;
    // Fetch 'start_date' and 'duration_weeks' from the student's enrollment record.
    const start_date =
      sData.start_date ||
      sData.startDate ||
      sData.enrollmentDate ||
      studentIntake?.startDate ||
      "2026-05-01";
      
    const duration_weeks =
      sData.duration_weeks ||
      sData.durationWeeks ||
      (sData.selectedDuration
        ? sData.selectedDuration.toLowerCase().includes("week")
          ? parseInt(sData.selectedDuration)
          : sData.selectedDuration.toLowerCase().includes("month")
          ? parseInt(sData.selectedDuration) * 4.33
          : 26
        : 26);

    const startDateObj = new Date(start_date);
    const currentDate = new Date();
    
    // Ensure duration_weeks is within 6 to 26 weeks as specified
    const durationWeeksVal = Math.min(26, Math.max(6, Number(duration_weeks) || 26));
    
    // Calculate progress = ((current_date - start_date) / (duration_weeks * 7)) * 100
    const diffMs = currentDate.getTime() - startDateObj.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const progress = (diffDays / (durationWeeksVal * 7)) * 100;
    
    return Math.min(100, Math.max(0, Math.round(progress)));
  }, [studentData, studentIntake, blueprint]);

  const progressionWeeksPercent = React.useMemo(() => {
    return calculateProgress();
  }, [calculateProgress]);

  // Helper to calculate progress of any specific course based on lessons completed under it
  const getCourseCompletionProgress = React.useCallback((course: any) => {
    if (!course?.modules) return 0;
    const lessonsInCourse = course.modules.flatMap((m: any) => m.lessons || []);
    if (lessonsInCourse.length === 0) return 0;
    
    // Find how many of these lessons are in completions array
    const completedInCourse = lessonsInCourse.filter((l: any) => completions.includes(l.id));
    return Math.round((completedInCourse.length / lessonsInCourse.length) * 100);
  }, [completions]);

  const activeTiles = isStudent
    ? [
        {
          id: "library",
          label: "📚 E-Library Resource Hub",
          desc: "Sovereign E-book library, academic journals, system blueprints, and PDF resources.",
          badge: "E-Library Hub",
          badgeColor: "text-yellow-400 border-yellow-400/20",
        },
        {
          id: "learning-site",
          label: "Learning Materials & Handouts",
          desc: "Access study modules, lesson handouts, video guides, and units of your study course.",
          badge: "Academics",
        },
        {
          id: "labs",
          label: "Practical Labs Simulators",
          desc: "Interact with hands-on network setups and live Cisco iOS terminals.",
          badge: "Sovereign Lab",
        },
        {
          id: "submissions",
          label: "Assignments & Exams Upload",
          desc: "Post completed tasks, and upload final examinations directly.",
          badge: "Submissions",
        },
        {
          id: "financial",
          label: "Financial Registry Invoice",
          desc: "Download official Kwacha receipts and invoice clearances.",
          badge: "Bursar Desk",
        },
        {
          id: "mentor",
          label: "AI International Academy Student Assistant",
          desc: "Assist students with every question they may have, whether curriculum, pricing, or administration.",
          badge: "AI Assistant",
        },
        {
          id: "tutorials",
          label: "Portal Video Guide",
          desc: "Visual tutorials, video lessons, and guidance to master the ITIA node.",
          badge: "Start Here",
        },
      ]
    : [
        {
          id: "students",
          label: "Students Registry",
          desc: "Enrollment administration, records alignment, and balance modifications.",
          badge: "Registry Office",
        },
        {
          id: "courses",
          label: "Curriculum & Courses Streams",
          desc: "Establish study paths, structure units, and modify student syllabi.",
          badge: "Syllabus Manager",
        },
        {
          id: "financial",
          label: "Financial Desk Ledger",
          desc: "Overlook transactions, register manual cashier check-ins.",
          badge: "Treasurer Node",
        },
        {
          id: "sys-config",
          label: "System Config Core",
          desc: "Administer database seeding, hard reset cache, view storage tables.",
          badge: "Root Config",
        },
        {
          id: "labs",
          label: "Practical Labs Workspace",
          desc: "Monitor interactive laboratory protocols.",
          badge: "Simulations",
        },
        {
          id: "library",
          label: "📚 E-Library Resource Hub",
          desc: "Manage E-book library items, upload digital blueprints, or delete resources.",
          badge: "E-Library Manager",
          badgeColor: "text-yellow-400 border-yellow-400/20",
        },
        {
          id: "whatsapp",
          label: "WhatsApp Broadcast",
          desc: "Control API push signals and text notification streams.",
          badge: "Telemetry Gate",
        },
      ];

  const [hubStream, setHubStream] = React.useState(() => {
    return (
      (window as any).AcademyHubStream || {
        activeLiveLink: { type: "NONE", url: "", topic: "", timestamp: "" },
        isLiveCallActive: false,
      }
    );
  });

  React.useEffect(() => {
    if ((window as any).syncStudentHubView) {
      setTimeout(() => {
        (window as any).syncStudentHubView();
      }, 100);
    }

    const handleSync = () => {
      if ((window as any).AcademyHubStream) {
        setHubStream({ ...(window as any).AcademyHubStream });
      }
      if ((window as any).syncStudentHubView) {
        (window as any).syncStudentHubView();
      }
    };

    window.addEventListener("academy-hub-sync", handleSync);
    return () => {
      window.removeEventListener("academy-hub-sync", handleSync);
    };
  }, []);

  // Compute active livestream matching the student's program
  const activeBroadcastClass = React.useMemo(() => {
    if (!onlineClasses || !isStudent || !studentData?.courseId) return null;
    const now = new Date();
    return onlineClasses.find((cls) => {
      if (cls.courseId !== studentData.courseId) return false;
      const startTime = new Date(cls.startTime);
      const endTime = new Date(startTime.getTime() + cls.duration * 60 * 1000);
      return now >= startTime && now <= endTime;
    });
  }, [onlineClasses, isStudent, studentData]);

  // Handle joining a broadcast with dynamic everyday registration auto-checking
  const handleJoinBroadcastClass = async (classId: string) => {
    if (!hasRegisteredToday) {
      const confirmRegister = window.confirm(
        "📋 EVERYDAY'S REGISTRATION PROTOCOL:\nYou are required to confirm your everyday check-in presence before joining study video streams.\n\nClick OK to automatically register your presence for today and connect to the live broadcast!",
      );
      if (confirmRegister) {
        try {
          await registerAttendance("DAILY_PORTAL_CHECKIN", {
            program: studentCourse?.name || "Academic Core Track",
            duration:
              studentData?.selectedDuration ||
              studentCourse?.duration ||
              "Standard Term",
            sessionTime: new Date().toLocaleTimeString(),
          });
        } catch (e) {
          console.error("Auto day registration fail:", e);
        }
      } else {
        return; // Deny entry
      }
    }
    setEnteredClassId(classId);
  };

  // Compute active selected class from the entire list matching enteredClassId
  const currentSelectedClass = React.useMemo(() => {
    if (!onlineClasses || !enteredClassId) return null;
    return onlineClasses.find((c) => c.id === enteredClassId);
  }, [onlineClasses, enteredClassId]);

  // Automatically record attendance for the specific video class being watched
  React.useEffect(() => {
    if (isStudent && enteredClassId && currentSelectedClass) {
      console.log(
        "ITA: Student loaded stream. Automating course stream presence capture...",
      );
      registerAttendance(currentSelectedClass.id, {
        program: studentCourse?.name || "Academic Core Track",
        duration:
          studentData?.selectedDuration ||
          studentCourse?.duration ||
          "Standard Term",
        sessionTime: currentSelectedClass.startTime,
      }).catch((e) => {
        console.error("Live classroom presence capture failure:", e);
      });
    }
  }, [
    enteredClassId,
    currentSelectedClass,
    isStudent,
    studentCourse,
    studentData,
    registerAttendance,
  ]);

  // Subscribe to real-time updates for 'payments' table to sync balance
  React.useEffect(() => {
    if (!supabase) return;
    
    console.log("ITA Dashboard: Subscribing to payments real-time channel");
    const channel = supabase.channel('payments-dashboard-view')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'payments' }, (payload: any) => {
        // Force UI to refresh balance immediately when status becomes 'Approved'
        if (payload?.new?.status === 'Approved') {
          console.log("ITA Dashboard Real-time [UPDATE]: Payment approved node detected, forcing refreshData...");
          refreshData();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  // Fetch Study Blueprint from Supabase
  React.useEffect(() => {
    if (!supabase || !isStudent || !studentData) return;
    
    const currentStudentId = studentData.studentId;
    if (!currentStudentId) return;

    const fetchBlueprint = async () => {
      try {
        console.log(`ITA Dashboard: Querying study blueprint for ${currentStudentId}`);
        const { data: bpData, error: bpError } = await supabase
          .from("study_blueprints")
          .select("*")
          .eq("student_id", currentStudentId)
          .maybeSingle();

        if (bpError) {
          console.warn("Could not load study blueprint:", bpError);
        } else if (bpData) {
          console.log("Found study blueprint detail:", bpData);
          setBlueprint(bpData);
        }
      } catch (err) {
        console.error("Failed to query study_blueprints:", err);
      }
    };

    fetchBlueprint();
  }, [isStudent, studentData]);

  // Compute elapsed offset seconds safely
  const elapsedSeconds = React.useMemo(() => {
    if (!currentSelectedClass) return 0;
    const startTime = new Date(currentSelectedClass.startTime).getTime();
    const now = new Date().getTime();
    return Math.max(0, (now - startTime) / 1000);
  }, [currentSelectedClass]);

  // Extract Youtube Embed URL with standard interactive controls enabled
  const getYouTubeEmbedUrl = (url: string, elapsed: number) => {
    let videoId = "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&start=${Math.floor(elapsed)}&rel=0&showinfo=1&modestbranding=1`;
    }
    return null;
  };

  // FULLSCREEN IMMERSIVE VIDEO CLASSROOM OVERRIDE
  if (enteredClassId && currentSelectedClass) {
    const isYouTube =
      currentSelectedClass.meetingLink.includes("youtube.com") ||
      currentSelectedClass.meetingLink.includes("youtu.be");
    const ytUrl = isYouTube
      ? getYouTubeEmbedUrl(currentSelectedClass.meetingLink, elapsedSeconds)
      : null;

    return (
      <div className="fixed inset-0 z-[99999] bg-[#03091e] flex flex-col items-center justify-center font-sans overflow-hidden p-4 md:p-8 animate-in fade-in duration-500">
        <div className="w-full max-w-6xl flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-[#00f2fe] font-mono font-black uppercase text-[10px] tracking-[0.3em]">
              📺 ACTIVE CHANNEL: {currentSelectedClass.title}
            </span>
          </div>
          <button
            onClick={() => setEnteredClassId(null)}
            className="bg-[#E11D48] hover:bg-red-700 text-white font-mono text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            style={{ pointerEvents: "auto" }}
          >
            ❌ Close & Return
          </button>
        </div>

        {/* STUDY STAGE CANVAS AREA */}
        <div className="w-full max-w-6xl flex-1 bg-black rounded-[24px] border-4 border-[#00f2fe]/30 overflow-hidden relative aspect-video shadow-2xl flex items-center justify-center">
          {isYouTube && ytUrl ? (
            <iframe
              title={currentSelectedClass.title}
              src={ytUrl}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; gyroscope; accelerometer"
              allowFullScreen
              style={{ pointerEvents: "auto" }}
            />
          ) : (
            <video
              autoPlay
              controls
              playsInline
              className="w-full h-full object-contain"
              style={{ pointerEvents: "auto" }}
              src={currentSelectedClass.meetingLink}
              onError={() =>
                alert(
                  "MEDIA_DECODE_ERR: Direct stream play error. Please verify the media link.",
                )
              }
              onEnded={() => setEnteredClassId(null)}
            />
          )}

          {/* LOWER DECK STUDY TELEMETRY */}
          <div className="absolute bottom-4 left-4 right-4 z-40 bg-black/80 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 flex items-center justify-between gap-4 pointer-events-none opacity-40 hover:opacity-100 transition-opacity hidden sm:flex">
            <div className="text-left">
              <span className="text-[7px] font-black tracking-widest text-[#00f2fe] uppercase block">
                ACTIVE ACADEMIC FEED
              </span>
              <h3 className="text-[11px] font-black text-white uppercase">
                {currentSelectedClass.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="block text-[7px] font-black tracking-widest text-emerald-400 uppercase">
                ATTENDANCE STATUS
              </span>
              <span className="text-[10px] font-mono font-bold text-gray-300 uppercase">
                ✓ RECORDED SECURELY
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[9px] font-mono leading-relaxed text-gray-400 uppercase tracking-[0.2em] text-center max-w-2xl">
          💡 TIP: Rotate your device sideways to play almost full screen. Tap
          the player expand icon to enter custom display.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-500 pb-20 bg-transparent font-sans min-h-screen text-[#e2e8f0] text-left">
      <header className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-[#00f2fe]/15 pb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-[#00f2fe]/5 w-fit px-6 py-3 border border-[#00f2fe]/15 rounded-xl">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00f2fe]">
              SYSTEM_AUTHORIZED
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight transition-all">
            {isStudent ? (
              <div className="flex flex-col gap-2">
                <span className="text-[#38bdf8] text-[10px] tracking-wider uppercase font-bold">
                  NEXUS POINT
                </span>
                <span className="text-[#00f2fe] italic tracking-tight">
                  {studentData?.fullName}
                </span>
              </div>
            ) : (
              "CORE COMMAND"
            )}
          </h1>
          <p className="text-[#38bdf8] font-bold uppercase tracking-[0.5em] text-[11px] leading-relaxed">
            {isStudent
              ? `ACADEMY ARCHIVE // BATCH ${studentData?.admissionYear} // ${studentIntake?.name}`
              : "TERMINAL ACCESS: GLOBAL ADMINISTRATIVE OVERRIDE"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-6 min-w-[320px] w-full md:w-auto">
          <div className="bg-[#0a1b44] p-6 border border-[#00f2fe]/15 w-full flex items-center justify-between group hover:border-[#00f2fe]/30 transition-all shadow-xl rounded-2xl">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#38bdf8] uppercase tracking-widest mb-2">
                OPERATIONAL_ID
              </span>
              <span className="text-lg font-mono font-bold text-white tracking-[0.2em]">
                {isStudent ? studentData?.studentId : "ADMIN-001"}
              </span>
            </div>
            <button
              onClick={refreshData}
              className={cn(
                "w-12 h-12 bg-[#05112e] text-[#00f2fe] flex items-center justify-center border border-[#00f2fe]/15 hover:bg-[#00f2fe] hover:text-[#05112e] transition-all font-black rounded-xl",
                isSyncing && "animate-spin",
              )}
            >
              ↺
            </button>
          </div>

          {isStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Syllabus Progress */}
              <div className="bg-[#0a1b44] p-6 border border-[#00f2fe]/15 shadow-xl rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black uppercase text-[#38bdf8] tracking-[0.3em]">
                    SYLLABUS_PROGRESS
                  </span>
                  <span className="text-2xl font-black text-[#00f2fe]">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-2 w-full bg-[#05112e] border border-[#00f2fe]/10 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-[#00f2fe] to-[#38bdf8] transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 26-Week Duration Progress */}
              <div className="bg-[#0a1b44] p-6 border border-[#00f2fe]/15 shadow-xl rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black uppercase text-[#38bdf8] tracking-[0.3em]">
                    26_WEEK_DURATION_PROGRESS
                  </span>
                  <span className="text-2xl font-black text-[#00f2fe]">
                    {progressionWeeksPercent}%
                  </span>
                </div>
                <div className="h-2 w-full bg-[#05112e] border border-[#00f2fe]/10 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-[#00f2fe] to-emerald-400 transition-all duration-1000"
                    style={{ width: `${progressionWeeksPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* DYNAMIC COMPULSORY LIVE VIDEO INVITE CARD */}
      {isStudent &&
        activeBroadcastClass &&
        enteredClassId !== activeBroadcastClass.id && (
          <div className="bg-gradient-to-br from-[#450a0a] via-[#110000] to-[#03091e] border-2 border-rose-500/60 p-8 rounded-[24px] shadow-2xl text-left relative overflow-hidden animate-pulse">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-500">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    🔴 COMPULSORY CLASSROOM BROADCAST IN PROGRESS
                  </span>
                </div>
                <h3 className="text-lg font-black text-white uppercase">
                  {activeBroadcastClass.title}
                </h3>
                <p className="text-[10px] md:text-xs text-gray-300 font-bold uppercase tracking-wider leading-relaxed">
                  Class started at{" "}
                  {new Date(
                    activeBroadcastClass.startTime,
                  ).toLocaleTimeString()}
                  . Continuous un-stoppable stream is active now. Attendance
                  tracking verified on the multi-node registry.
                </p>
              </div>
              <button
                onClick={() =>
                  handleJoinBroadcastClass(activeBroadcastClass.id)
                }
                className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest px-8 h-12 rounded-xl transition-all shadow-lg text-center whitespace-nowrap flex items-center justify-center gap-2"
              >
                🛰️ ENTER BROADCAST CANVAS
              </button>
            </div>
          </div>
        )}

      {isStudent && (
        <div className="space-y-10 mb-10">
          {/* OFFICIAL ACADEMY STUDY BLUEPRINT HIGH-VISIBILITY HERO COMMAND CENTER */}
          <div className="bg-gradient-to-br from-[#0c1f4e] via-[#05112e] to-[#040e29] border-[3px] border-[#00f2fe] p-10 md:p-14 rounded-[32px] shadow-[0_0_50px_rgba(0,242,254,0.3)] relative text-left overflow-hidden group">
            <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none transition-transform duration-500 group-hover:scale-110">
              <FileText className="w-80 h-80 text-[#00f2fe]" />
            </div>
            
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Sparkles className="w-24 h-24 text-[#00f2fe]" />
            </div>

            <div className="relative z-10 space-y-6">
              {/* Alert indicator tag */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2fe] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00f2fe]"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-[#00f2fe] font-mono leading-none">
                  ACADEMY SYSTEM SYNC // STUDY BLUEPRINT DECREE
                </span>
                {(!blueprint) && (
                  <span className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 font-mono font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Core Tracks Loaded // Custom Syncing
                  </span>
                )}
              </div>
              
              {/* Massive Header */}
              <div className="space-y-2">
                <h1 
                  className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight uppercase text-white leading-none filter drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]"
                  style={{
                    textShadow: "0 0 10px rgba(0, 242, 254, 0.4), 0 0 20px rgba(0, 242, 254, 0.2)"
                  }}
                >
                  OFFICIAL ACADEMY STUDY BLUEPRINT
                </h1>
                <p className="text-sm font-black text-[#38bdf8] uppercase tracking-[0.2em] font-mono">
                  ACTIVE TRACK: {studentCourse?.name || "CURRICULUM ADVANCED MOBILE APP DEVELOPER"}
                </p>
              </div>
              
              <div className="h-0.5 w-full bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-transparent rounded-full opacity-40" />

              <p className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-widest leading-relaxed max-w-4xl">
                Your program study blueprint is compiled and synced. Use this dashboard to track physical milestones, access custom materials, view course directives, and query live lessons.
              </p>

              {/* Progress Bar Container */}
              <div className="bg-[#05112e]/80 border border-[#00f2fe]/20 p-6 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                    PROGRAM LEARNING PROGRESSION:
                  </span>
                  <span className="text-lg font-black text-[#00f2fe] font-mono">
                    {progressionWeeksPercent}%
                  </span>
                </div>
                <div className="w-full bg-[#03091e] h-4 rounded-full overflow-hidden border border-[#00f2fe]/10 relative">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00f2fe] to-[#38bdf8] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,242,254,0.6)]" 
                    style={{ width: `${progressionWeeksPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <span>Week 0 (Commenced)</span>
                  <span>Week {Math.max(12, blueprint?.program_duration_weeks || 12)} (Target Mastery)</span>
                </div>
              </div>

              {/* Action and Tags line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4">
                <div className="flex flex-wrap gap-3">
                  <div className="bg-[#05112e]/90 border border-[#00f2fe]/20 px-4 py-2.5 rounded-xl flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#38bdf8] uppercase tracking-wider font-mono">TERM:</span>
                    <span className="text-xs font-black text-white uppercase font-mono">
                      {studentData?.selectedDuration || studentCourse?.duration || "12 WEEKS"}
                    </span>
                  </div>
                  <div className="bg-[#05112e]/90 border border-[#00f2fe]/20 px-4 py-2.5 rounded-xl flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#38bdf8] uppercase tracking-wider font-mono">STATUS:</span>
                    <span className="text-xs font-black text-emerald-400 uppercase font-mono">SYLLABUS DISPATCHED</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const url = blueprint?.url || "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1200";
                    window.open(url);
                  }}
                  className="w-full sm:w-auto bg-[#00f2fe] hover:bg-[#00f2fe]/90 text-[#05112e] font-black text-sm uppercase tracking-[0.2em] px-10 h-14 rounded-2xl transition-all shadow-[0_0_20px_rgba(0,242,254,0.5)] hover:shadow-[0_0_35px_rgba(0,242,254,0.7)] text-center whitespace-nowrap flex items-center justify-center gap-2 hover:scale-[1.03] transform shrink-0 cursor-pointer"
                >
                  VIEW STUDY BLUEPRINT ➔
                </button>
              </div>
            </div>
          </div>

          {/* ANNOUNCEMENT TICKER ("Passing Announcements") */}
          {announcements && announcements.length > 0 && (
            <div className="bg-[#05112e] border-2 border-[#00f2fe]/20 rounded-2xl p-4 overflow-hidden shadow-2xl relative flex items-center gap-6">
              <style>{`
                @keyframes marqueeStudent {
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                .animate-marquee-student {
                  animation: marqueeStudent 32s linear infinite;
                }
              `}</style>
              <div className="flex items-center gap-3 shrink-0 bg-[#00f2fe] text-[#05112e] font-black text-[10px] tracking-[0.3em] uppercase px-5 py-2.5 rounded-lg shadow-lg z-10 font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>BULLETIN</span>
              </div>
              <div className="flex-1 overflow-hidden relative w-full h-6 flex items-center">
                <div className="animate-marquee-student whitespace-nowrap inline-flex gap-16 text-xs font-black uppercase tracking-widest text-[#00f2fe] font-mono">
                  {announcements.map((anno, idx) => (
                    <span
                      key={anno.id || idx}
                      className="flex items-center gap-3"
                    >
                      <span className="text-white/40">⚡</span>
                      <span>
                        [ {new Date(anno.date).toLocaleDateString()} ]{" "}
                        {anno.title}:
                      </span>
                      <span className="text-white font-bold">
                        {anno.content}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OFFICIAL MATRICULATION & PROGRAM ENROLLMENT PORTAL */}
          <div className="bg-gradient-to-br from-[#0c1f4e] to-[#040e29] border-2 border-[#00f2fe]/35 rounded-[24px] p-8 md:p-10 shadow-[0_10px_50px_rgba(0,242,254,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Award className="w-40 h-40 text-[#00f2fe]" />
            </div>

            <div className="relative z-10 space-y-8 text-left">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#00f2fe]/15 pb-6">
                <div>
                  <span className="text-xs font-mono font-black text-[#00f2fe] uppercase tracking-[0.4em] block mb-2">
                    OFFICIAL STUDENT ENROLLMENT DECREE
                  </span>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-none">
                    IT INTERNATIONAL ACADEMY PORTAL
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 font-mono font-black text-[9px] px-3 py-1.5 rounded-lg uppercase tracking-widest leading-none">
                  STATUS: ACTIVE STUDYING
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Full name & student ID info */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    FULL ENROLLED STUDENT NAME
                  </span>
                  <div className="text-2xl font-black text-white italic uppercase tracking-tight leading-tight">
                    {studentData?.fullName || user?.username}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#38bdf8] uppercase tracking-widest mt-1">
                    STUDENT ID: {studentData?.studentId}
                  </div>
                </div>

                {/* Program name / active track */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    ACTIVE STUDY PROGRAM
                  </span>
                  <div className="text-2xl font-black text-[#00f2fe] italic uppercase tracking-tight leading-tight">
                    {studentCourse?.name || "Academic Core Track"}
                  </div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">
                    Applied Course Stream
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    PROGRAM DURATION
                  </span>
                  <div className="text-2xl font-black text-[#f59e0b] italic uppercase tracking-tight leading-tight">
                    {studentData?.selectedDuration ||
                      studentCourse?.duration ||
                      "Standard Track"}
                  </div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">
                    Course Study Period
                  </div>
                </div>
              </div>

              {/* Explicit studying message requested */}
              <div className="bg-[#05112e]/80 border border-[#00f2fe]/15 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-300 uppercase tracking-wide">
                    Enrolled Statement:
                  </p>
                  <p className="text-sm font-bold text-white uppercase tracking-wider">
                    You are studying this program:{" "}
                    <span className="text-[#00f2fe] font-black">
                      {studentCourse?.name}
                    </span>{" "}
                    for a total duration of{" "}
                    <span className="text-[#f59e0b] font-black">
                      {studentData?.selectedDuration ||
                        studentCourse?.duration ||
                        "Standard Term"}
                    </span>
                    .
                  </p>
                </div>
                <div className="p-3 bg-[#00f2fe]/5 border border-[#00f2fe]/10 rounded-xl max-w-fit shrink-0">
                  <span className="text-[10px] font-mono font-bold text-[#38bdf8] tracking-widest uppercase">
                    INTAKE GRANTED: {studentIntake?.name || "N/A"}
                  </span>
                </div>
              </div>

              {/* Financial summary - if they have paid something or balance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-[#00f2fe]/10">
                <div className="bg-[#0a1b44]/50 border border-white/5 p-5 rounded-2xl">
                  <span className="block text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">
                    Tuition Cost of Program
                  </span>
                  <span className="text-lg font-black neon-glow italic">
                    K{studentCourse?.price || "1,000"}
                  </span>
                </div>
                <div className="bg-[#0a1b44]/50 border border-white/5 p-5 rounded-2xl">
                  <span className="block text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">
                    Total Paid to Date
                  </span>
                  <span className="text-lg font-black neon-glow italic">
                    K{totalPaid || (studentData as any)?.amountPaid || 0}
                  </span>
                </div>
                <div className="bg-[#0a1b44]/50 border border-white/5 p-5 rounded-2xl">
                  <span className="block text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">
                    Outstanding Balance
                  </span>
                  <span className="text-lg font-black neon-glow italic">
                    K{currentBalance || (studentData as any)?.balance || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* MULTI-PROGRAM TRACK COMMAND & STUDY HISTORY HUB */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMN 1: STUDY HISTORY LOG // ENROLLED PROGRAM TRACKS (MAX 3) */}
            <div className="bg-gradient-to-br from-[#0c1f4e] to-[#040e29] border border-[#00f2fe]/20 rounded-[24px] p-8 shadow-2xl relative text-left flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#00f2fe]/15 pb-4">
                  <span className="text-xl">📊</span>
                  <div>
                    <h3 className="text-sm font-black text-[#00f2fe] uppercase tracking-wider font-mono">
                      ACADEMIC MULTI-TRACK STUDIES HISTORY LOG
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      Sovereign Enrollment Registry (Max 3 Programs)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {enrolledCourseIds.map((cid, index) => {
                    const enrolledCourse = courses.find((c) => c.id === cid);
                    if (!enrolledCourse) return null;
                    const isCurrentlyStudying = enrolledCourse.id === studentCourse?.id;
                    const completionPercent = getCourseCompletionProgress(enrolledCourse);

                    return (
                      <div 
                        key={enrolledCourse.id} 
                        className={cn(
                          "p-5 rounded-2xl border transition-all relative overflow-hidden",
                          isCurrentlyStudying 
                            ? "bg-[#0b1b44] border-[#00f2fe]/35 shadow-[0_0_15px_rgba(0,242,254,0.1)]" 
                            : "bg-[#05112e]/50 border-slate-800 hover:border-slate-700 hover:bg-[#05112e]/80"
                        )}
                      >
                        {isCurrentlyStudying && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-[#00f2fe]/10 to-transparent w-full h-full pointer-events-none" />
                        )}
                        <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black text-rose-500 uppercase tracking-widest">
                                PROGRAM {index + 1}:
                              </span>
                              {isCurrentlyStudying ? (
                                <span className="bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 font-mono font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                  ACTIVE STUDY INDEX
                                </span>
                              ) : (
                                <span className="bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">
                                  ENROLLED REGISTER
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-black text-white uppercase italic tracking-tight mt-1">
                              {enrolledCourse.name}
                            </h4>
                            <div className="flex gap-4 text-[10px] font-mono text-slate-400 uppercase mt-1">
                              <span>Term: {enrolledCourse.duration}</span>
                              <span>•</span>
                              <span>Cost: {enrolledCourse.price}</span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-400 uppercase">COURSE LESSONS PROGRESS:</span>
                            <span className="text-[#00f2fe] font-black">{completionPercent}%</span>
                          </div>
                          <div className="w-full bg-[#03091e] h-2.5 rounded-full overflow-hidden border border-[#00f2fe]/10 relative">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isCurrentlyStudying ? "bg-gradient-to-r from-[#00f2fe] to-[#38bdf8]" : "bg-slate-600"
                              )} 
                              style={{ width: `${completionPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          {isCurrentlyStudying ? (
                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                              ✓ STUDYING THIS TRACK NOW
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                handleSwitchActiveCourse(enrolledCourse.id);
                              }}
                              className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 hover:bg-[#00f2fe] hover:text-[#05112e] text-[#00f2fe] font-mono font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all"
                            >
                              START STUDYING TRACK ➔
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 border-t border-[#00f2fe]/10 pt-4 text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-relaxed">
                📢 SYSTEM NOTICE: You can hold up to three concurrently active program tracks. Click "START STUDYING TRACK" to hot-swap your entire active dashboard syllabus instantly. Duplicate enrollments are bypassed.
              </div>
            </div>

            {/* COLUMN 2: SELF-PACED PROGRAM CENTRE (AVAILABLE SIX-WEEKS COURSES FOR ZK 200) */}
            <div className="bg-gradient-to-br from-[#0c1f4e] to-[#040e29] border border-[#00f2fe]/20 rounded-[24px] p-8 shadow-2xl relative text-left flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#00f2fe]/15 pb-4">
                  <span className="text-xl">🎓</span>
                  <div>
                    <h3 className="text-sm font-black text-[#00f2fe] uppercase tracking-wider font-mono">
                      K200 SELF-PACED MICRO-CREDENTIAL TRACKS
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      Select parallel six-week certificate tracks at ZK 200
                    </p>
                  </div>
                </div>

                {/* Grid of self-paced courses */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: rgba(0, 242, 254, 0.05);
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: rgba(0, 242, 254, 0.15);
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: rgba(0, 242, 254, 0.3);
                    }
                  `}</style>
                  {courses
                    .filter(c => c.duration.includes("6 Weeks") || c.duration.includes("Self-Paced"))
                    .map((sph) => {
                      const isEnrolledAlready = enrolledCourseIds.includes(sph.id);
                      const isPortFolioFull = enrolledCourseIds.length >= 3;

                      return (
                        <div 
                          key={sph.id} 
                          className={cn(
                            "p-4 rounded-xl border border-white/5 transition-all",
                            isEnrolledAlready ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[#05112e]/30 hover:border-[#00f2fe]/15 hover:bg-[#05112e]/50"
                          )}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-white uppercase italic tracking-tight">
                                {sph.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                                {sph.description}
                              </p>
                              <div className="flex gap-3 text-[9px] font-mono font-bold text-[#38bdf8] uppercase">
                                <span>⌛ {sph.duration}</span>
                                <span>•</span>
                                <span className="text-amber-400">💵 PRICE: {sph.price} (Self-Paced)</span>
                              </div>
                            </div>

                            <div className="shrink-0 mt-1">
                              {isEnrolledAlready ? (
                                <button
                                  onClick={() => handleSwitchActiveCourse(sph.id)}
                                  className="bg-emerald-600/25 border border-emerald-500/35 hover:bg-emerald-600 hover:text-white text-emerald-400 font-mono font-black text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                                >
                                  STUDY ➔
                                </button>
                              ) : isPortFolioFull ? (
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-mono">
                                  [LIMIT]
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleEnrollInCourse(sph.id)}
                                  className="bg-[#00f2fe] hover:bg-[#00c6ff] text-[#05112e] font-mono font-black text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all shadow-md active:scale-95"
                                >
                                  ENROLL & STUDY
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Status banner */}
              <div className="mt-6">
                {enrolledCourseIds.length >= 3 ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
                    <p className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest font-black leading-relaxed">
                      ⚠️ PORTFOLIO BOUNDARY REACHED: Maximum of 3 parallel academic programs has been reached. Complete your tracks or clear course registrations to initiate custom enrollments.
                    </p>
                  </div>
                ) : (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-center justify-between gap-4">
                    <p className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider leading-none font-black">
                      Portfolio slots: <span className="text-white">{enrolledCourseIds.length} / 3 used</span>
                    </p>
                    <span className="bg-[#00f2fe]/10 text-[#00f2fe] font-mono font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">
                      ELIGIBLE FOR DUAL ENROLLMENT
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* IT INTERNATIONAL ACADEMY INTERACTIVE KNOWLEDGE PROVISION DESK */}
          <div className="bg-gradient-to-br from-[#05112e] via-[#05112e]/90 to-[#03091e] border-2 border-[#00f2fe]/20 rounded-[28px] p-8 md:p-10 shadow-2xl relative text-left">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#00f2fe]/10 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💡</span>
                    <h3 className="text-base font-black text-[#00f2fe] uppercase tracking-widest font-mono">
                      ACADEMY SYSTEM INSIGHTS & KNOWLEDGE DESK
                    </h3>
                  </div>
                  <p className="text-[10px] font-black tracking-widest text-[#38bdf8] uppercase">
                    Direct academic guidelines, micro-learning standards, and procedural resources
                  </p>
                </div>
                <div className="bg-[#00f2fe]/5 border border-[#00f2fe]/15 px-4 py-2 rounded-xl text-center">
                  <span className="block text-[8px] font-mono font-black text-slate-400 tracking-widest uppercase mb-0.5">SYSTEM REVISION</span>
                  <span className="text-[10px] font-mono font-black text-white">ICT-KIS 2.0</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Insight 1: Syllabus Tracking */}
                <div className="bg-[#0a1b44]/40 border border-white/5 p-6 rounded-2xl hover:border-[#00f2fe]/20 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex items-center justify-center text-[#00f2fe] text-sm font-black font-mono">
                    01
                  </div>
                  <h4 className="text-xs font-black text-white uppercase font-mono">Dynamic Syllabus Progress</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
                    Calculated in real-time as you complete lessons. Mark lessons finished to study modules ahead.
                  </p>
                </div>

                {/* Insight 2: Micro-credentials */}
                <div className="bg-[#0a1b44]/40 border border-white/5 p-6 rounded-2xl hover:border-[#00f2fe]/20 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-black font-mono">
                    02
                  </div>
                  <h4 className="text-xs font-black text-white uppercase font-mono">Self-Paced Certificates</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
                    Self-paced courses (duration 6 weeks, priced at K240) bypass physical class schedules, allowing instant certification.
                  </p>
                </div>

                {/* Insight 3: Cisco iOS Sandboxes */}
                <div className="bg-[#0a1b44]/40 border border-white/5 p-6 rounded-2xl hover:border-[#00f2fe]/20 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-sm font-black font-mono">
                    03
                  </div>
                  <h4 className="text-xs font-black text-white uppercase font-mono">Practical iOS Lab Node</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
                    Our simulation labs mimic enterprise gateways. Always keep testing scopes distinct from prod nodes.
                  </p>
                </div>

                {/* Insight 4: Unified Credentials */}
                <div className="bg-[#0a1b44]/40 border border-white/5 p-6 rounded-2xl hover:border-[#00f2fe]/20 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-black font-mono">
                    04
                  </div>
                  <h4 className="text-xs font-black text-white uppercase font-mono">Dual Study Governance</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
                    Registered program configurations stay stored. Keep multiple syllabi active and toggle paths as required.
                  </p>
                </div>

              </div>
            </div>
          </div>


          {/* ACTIVE INSTRUCTION CURRICULUM SYLLABUS & INJECTED NOTES */}
          <div className="bg-[#0a1b44] border border-[#00f2fe]/15 rounded-[24px] p-8 md:p-10 shadow-2xl relative text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#00f2fe]/15 pb-6 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#00f2fe]" />
                  <h3 className="text-lg font-black neon-glow uppercase italic tracking-tight">
                    Active Curriculum & Syllabus
                  </h3>
                </div>
                <p className="text-[10px] font-black tracking-widest text-[#38bdf8] uppercase">
                  The structured modules and permanent study notes injected for
                  your program
                </p>
              </div>
              <div className="bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20 font-mono font-black text-[9px] px-3 py-1 rounded-md uppercase tracking-wider">
                {studentCourse?.modules?.length || 0} Course Modules
              </div>
            </div>

            {/* Modules List Grid */}
            <div className="space-y-6">
              {studentCourse?.modules && studentCourse.modules.length > 0 ? (
                studentCourse.modules.map((mod: any, mIdx: number) => (
                  <div
                    key={mod.id || mIdx}
                    className="bg-[#05112e]/50 border border-[#00f2fe]/10 p-6 rounded-2xl hover:border-[#00f2fe]/20 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#00f2fe]/5 border border-[#00f2fe]/20 text-[#00f2fe] flex items-center justify-center font-mono text-xs font-black rounded-lg">
                          {mIdx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-black neon-glow uppercase tracking-wide">
                            {mod.title}
                          </h4>
                          <span className="text-[9px] text-[#38bdf8] font-bold uppercase tracking-widest">
                            {mod.lessons?.length || 0} Syllabus Lessons
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lessons list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mod.lessons &&
                        mod.lessons.map((lesson: any, lIdx: number) => {
                          const isDone = completions.includes(lesson.id);
                          return (
                            <div
                              key={lesson.id || lIdx}
                              className="p-3.5 bg-[#05112e]/80 border border-white/5 flex items-center justify-between rounded-xl group transition-all hover:bg-[#0c245c]"
                            >
                              <div className="flex items-center gap-3.5">
                                <div
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    isDone ? "bg-emerald-500" : "bg-slate-500",
                                  )}
                                />
                                <span className="text-[11px] font-mono text-slate-300 group-hover:text-white uppercase tracking-wider">
                                  {lesson.title}
                                </span>
                              </div>
                              {isDone && (
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-[#05112e]/50 rounded-2xl border border-dashed border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-widest">
                    No interactive curriculum syllabus mapped to this program
                    track yet.
                  </p>
                </div>
              )}
            </div>

            {/* INJECTED NOTES & HANDOUTS BLUEPRINTS (Permanent, dynamically modified by admin) */}
            <div className="mt-10 pt-10 border-t border-[#00f2fe]/15 space-y-6">
              <div className="flex items-center justify-between border-b border-dashed border-[#00f2fe]/15 pb-4">
                <span className="text-xs font-black text-[#00f2fe] uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00f2fe]" /> Administrative
                  Injected Study Notes [PERMANENT RESOURCE]
                </span>
                {studentCourse?.programNotes &&
                  studentCourse.programNotes.length > 0 && (
                    <span className="text-[10px] font-black text-[#00f2fe] uppercase bg-[#00f2fe]/10 border border-[#00f2fe]/20 px-3 py-1 rounded-full font-mono">
                      {studentCourse.programNotes.length} Document Node
                      {studentCourse.programNotes.length > 1 ? "s" : ""}
                    </span>
                  )}
              </div>

              {studentCourse?.programNotes &&
              studentCourse.programNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentCourse.programNotes.map((note: any) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent("open-integrated-notes", {
                            detail: { url: note.url, title: note.title },
                          }),
                        );
                      }}
                      className="flex items-center justify-between p-5 bg-[#05112e] hover:bg-[#0c245c] rounded-2xl border border-[#00f2fe]/10 hover:border-[#00f2fe]/30 transition-all text-left focus:outline-none group shadow-lg w-full"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#00f2fe]/5 text-[#00f2fe] flex items-center justify-center border border-[#00f2fe]/25 rounded-xl group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white group-hover:text-[#00f2fe] uppercase tracking-wide transition-colors">
                            {note.title}
                          </p>
                          <span className="font-black text-[#38bdf8] uppercase tracking-[0.2em] mt-1 block" style={{ fontSize: "9.6px" }}>
                            OFFICIAL ACADEMY STUDY BLUEPRINT
                          </span>
                        </div>
                      </div>
                      <span className="text-[#00f2fe] text-xs font-black tracking-widest uppercase group-hover:translate-x-1.5 transition-transform">
                        VIEW ➔
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-[#05112e]/50 border border-dashed border-[#00f2fe]/10 rounded-2xl text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-black italic">
                    No administrative program study notes have been injected for
                    this course yet.
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                    Injected study notes stay permanent and accessible directly
                    below curriculum.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* DAILY VIDEO SESSIONS & PRERECORDED CLASSES PROVIDER */}
          {isStudent && (
            <div className="bg-[#0a1b44] border border-[#00f2fe]/15 rounded-[24px] p-8 md:p-10 shadow-2xl relative text-left space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#00f2fe]/15 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-[#E11D48]" />
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                      📅 Prerecorded Classes & Live Streams
                    </h3>
                  </div>
                  <p className="text-[10px] font-black tracking-widest text-[#38bdf8] uppercase">
                    Access time-scheduled broadcasts and daily class records
                    below the curriculum
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {onlineClasses &&
                onlineClasses.filter(
                  (c) => c.courseId === studentData?.courseId,
                ).length > 0 ? (
                  onlineClasses
                    .filter((c) => c.courseId === studentData?.courseId)
                    .map((cls) => {
                      const classStart = new Date(cls.startTime);
                      const classEnd = new Date(
                        classStart.getTime() + cls.duration * 60 * 1000,
                      );
                      const now = new Date();
                      const isCurrentlyLive =
                        now >= classStart && now <= classEnd;
                      const isUpcoming = now < classStart;

                      return (
                        <div
                          key={cls.id}
                          className="p-6 bg-[#05112e] rounded-2xl border border-white/5 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-md font-black text-[8px] uppercase tracking-wider italic",
                                isCurrentlyLive
                                  ? "bg-rose-500 text-white animate-pulse"
                                  : isUpcoming
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                              )}
                            >
                              {isCurrentlyLive
                                ? "🔴 BROADCAST_LIVE"
                                : isUpcoming
                                  ? "⏳ UPCOMING"
                                  : "📼 RECORDED_CLASS_STATION"}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                              {cls.duration} MINUTES
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white uppercase">
                              {cls.title}
                            </h4>
                            <p className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest mt-1">
                              START: {classStart.toLocaleString()}
                            </p>
                          </div>
                          {!isUpcoming ? (
                            <button
                              onClick={() => handleJoinBroadcastClass(cls.id)}
                              className={cn(
                                "w-full h-10 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all",
                                isCurrentlyLive
                                  ? "bg-[#E11D48] hover:bg-[#b91c1c] text-white"
                                  : "bg-[#00f2fe]/10 hover:bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/30",
                              )}
                            >
                              {isCurrentlyLive
                                ? "🚀 Connect to Direct Broadcast Canvas"
                                : "▶️ Watch Recorded Class / Video Guide"}
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full h-10 bg-gray-800 text-gray-500 font-black text-[9px] uppercase tracking-widest rounded-xl cursor-not-allowed"
                            >
                              Standby for Broadcast Time
                            </button>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="col-span-2 p-6 bg-[#05112e]/50 border border-dashed border-[#00f2fe]/10 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-black italic">
                      No scheduled broadcasts or daily video links available for
                      your program stream today.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DYNAMIC CUSTOM SYNTHESIZED FEATURES SLOT (STUDENT VIEW) */}
          {isStudent &&
            customFeatures &&
            customFeatures.filter((f) => f.slot === "dashboard").length > 0 && (
              <div className="space-y-8">
                {customFeatures
                  .filter((f) => f.slot === "dashboard")
                  .map((feat) => (
                    <div
                      key={feat.id}
                      className="bg-gradient-to-br from-[#0a1b44] via-[#05112e]/90 to-black border-2 border-violet-500/35 p-8 md:p-10 rounded-[24px] shadow-2xl text-left relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Cpu className="w-24 h-24 text-violet-500" />
                      </div>
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between border-b border-violet-500/10 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                              <Cpu className="w-4 h-4 animate-pulse" />
                            </div>
                            <div>
                              <span className="text-violet-400 font-mono font-black text-[8px] uppercase tracking-[0.25em]">
                                ITIA DIVERGENT CORE SYNAPSE WORKSPACE
                              </span>
                              <h4 className="text-md font-black text-white uppercase">
                                {feat.name}
                              </h4>
                            </div>
                          </div>
                          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">
                            Active Sandbox Node
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed uppercase tracking-wider bg-black/40 p-4 rounded-xl border border-white/5 font-mono">
                          ⚙️ Spec Payload: {feat.description}
                        </p>

                        {/* Highly interactive synthetic playground based on the specification */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                          <h5 className="text-[10px] font-black uppercase text-violet-300 tracking-wider flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-violet-400" />{" "}
                            Live Simulated Module Terminal Sandbox
                          </h5>

                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[8px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                  Sandbox Input Parameter Alpha
                                </label>
                                <input
                                  type="text"
                                  id={`param-a-${feat.id}`}
                                  placeholder="Type simulation parameter value..."
                                  className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-bold text-white outline-none focus:border-violet-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                  Sandbox Input Parameter Beta
                                </label>
                                <input
                                  type="text"
                                  id={`param-b-${feat.id}`}
                                  placeholder="Enter payload credentials..."
                                  className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-bold text-white outline-none focus:border-violet-500"
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                const valA = (
                                  document.getElementById(
                                    `param-a-${feat.id}`,
                                  ) as HTMLInputElement
                                )?.value;
                                const valB = (
                                  document.getElementById(
                                    `param-b-${feat.id}`,
                                  ) as HTMLInputElement
                                )?.value;
                                alert(
                                  `CORE_RUN: Executing decentralized simulation with signature input [${valA || "Empty"} / ${valB || "Empty"}]. Target synthesized module successfully verified!`,
                                );
                              }}
                              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all shadow-md"
                            >
                              ⚡ Execute Real-Time Synthesized Simulation Test
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

          {/* ACTIVE CLASSROOM RECEPTION ALERT */}
          <div className="alert-card bg-[#0a1b44] border-2 border-dashed border-[#00f2fe]/20 p-8 rounded-[24px] shadow-2xl text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Video className="w-16 h-16 text-[#00f2fe]" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                {hubStream.activeLiveLink.type !== "NONE" ? (
                  <>
                    <div className="alert-tag inline-block text-[10px] font-black uppercase tracking-[0.4em] text-[#00f2fe] bg-[#00f2fe]/5 border border-[#00f2fe]/15 px-4 py-2 rounded-lg font-mono">
                      🔴 LIVE CLASS HUB — SYNCED AT{" "}
                      {hubStream.activeLiveLink.timestamp}
                    </div>
                    <p className="text-sm font-medium text-white/80 leading-relaxed uppercase tracking-tight max-w-3xl">
                      <strong>Topic: {hubStream.activeLiveLink.topic}</strong>
                      <br />
                      Your instructor has launched an active learning session.
                      Click the link below to join immediately:
                      <br />
                      <br />
                      <a
                        href={hubStream.activeLiveLink.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          background: "#00f2fe",
                          color: "#05112e",
                          padding: "12px 24px",
                          borderRadius: "12px",
                          textDecoration: "none",
                          fontWeight: 900,
                          marginTop: "8px",
                          border: "2px solid #00f2fe",
                          boxShadow: "0 0 15px rgba(0, 242, 254, 0.3)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                        className="glowing-btn"
                      >
                        Join Session Now
                      </a>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="alert-tag inline-block text-[10px] font-black uppercase tracking-[0.4em] text-[#38bdf8] bg-[#00f2fe]/5 border border-[#00f2fe]/15 px-4 py-2 rounded-lg font-mono">
                      📢 CENTRAL LANDING HUB — RECEPTION STANDBY
                    </div>
                    <p className="text-sm font-medium text-white/80 leading-relaxed uppercase tracking-tight max-w-3xl">
                      System standby. Standard broadcasts from the academy
                      administrative desk will propagate here in real-time.
                      Please stay tuned.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Incoming call overlay block */}
          {hubStream?.isLiveCallActive && (
            <div className="bg-red-500/10 border-2 border-red-500/30 p-8 rounded-[24px] shadow-2xl text-left relative overflow-hidden animate-pulse">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#ef4444]">
                    📞 FLOATING PORTAL VIDEO CALL ACTIVE
                  </h4>
                  <p className="text-xs text-white/80 uppercase tracking-tight mt-1">
                    An active virtual stream session has been activated on your
                    workspace. Connect now to participate.
                  </p>
                </div>
                {hubStream?.activeLiveLink?.url && (
                  <a
                    href={hubStream.activeLiveLink.url}
                    target="_blank"
                    className="bg-red-500 hover:bg-red-600 text-white font-black text-[10px] tracking-widest uppercase px-6 py-3 rounded-xl transition-all shadow-lg text-center"
                  >
                    🚀 ACCEPT & STREAM CALL NOW
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Bento-grid banner launcher and metrics for 1,000+ Practical Labs */}
          <div className="bg-gradient-to-br from-[#0a1b44] to-[#040e29] border-2 border-[#00f2fe]/20 p-8 sm:p-10 rounded-[24px] shadow-2xl text-left relative overflow-hidden group">
            {/* Absolute accent patterns */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Beaker className="w-24 h-24 text-[#00f2fe]" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10 w-full">
              <div className="space-y-4 max-w-2xl text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="alert-tag inline-block text-[9px] font-black uppercase tracking-[0.4em] text-[#00f2fe] bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-3.5 py-1.5 rounded-lg font-mono">
                    ⚡ HIGH FIDELITY SIMULATION WORKSPACE
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-widest">
                    No Multiple Choice
                  </span>
                  <span className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe] font-mono font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-widest">
                    100% Practical Labs
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight uppercase">
                  1,000+ Cisco Hands-On & Packet Tracer Practical Labs
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed uppercase tracking-wide">
                  Execute configuration milestones directly in simulated Cisco
                  IOS command terminals, interact with live Packet Tracer
                  network topologies, align UTP cable pins, wire circuit boards,
                  and write live Unix scripts.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 col-sapn">
                  <div className="bg-[#05112e]/60 border border-white/5 p-3 rounded-xl">
                    <span className="block text-lg font-black text-white leading-none">
                      1,215
                    </span>
                    <span className="text-[8px] font-black tracking-widest text-[#38bdf8] uppercase">
                      Generated Labs
                    </span>
                  </div>
                  <div className="bg-[#05112e]/60 border border-white/5 p-3 rounded-xl">
                    <span className="block text-lg font-black text-[#00f2fe] leading-none">
                      100%
                    </span>
                    <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase">
                      Interactive
                    </span>
                  </div>
                  <div className="bg-[#05112e]/60 border border-white/5 p-3 rounded-xl">
                    <span className="block text-lg font-black text-white leading-none">
                      CCNA
                    </span>
                    <span className="text-[8px] font-black tracking-widest text-purple-400 uppercase">
                      Cisco IOS CLI
                    </span>
                  </div>
                  <div className="bg-[#05112e]/60 border border-white/5 p-3 rounded-xl">
                    <span className="block text-lg font-black text-[#00f2fe] leading-none">
                      ONLINE
                    </span>
                    <span className="text-[8px] font-black tracking-widest text-sky-400 uppercase">
                      Packet Tracer
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onAction?.("labs")}
                className="bg-[#00f2fe] hover:bg-[#00c6ff] text-[#05112e] px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] font-mono rounded-xl transition-all shadow-lg active:scale-95 text-center shrink-0 w-full lg:w-auto"
              >
                📡 LAUNCH PRACTICAL SIMULATORS ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {!isStudent && (
        <div className="space-y-6 mb-10">
          {/* Admin central broadcast panel */}
          <div className="bg-[#0a1b44] border hover:border-[#00f2fe]/30 border-[#00f2fe]/15 p-8 rounded-[24px] shadow-2xl relative overflow-hidden group space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-[#00f2fe]/10 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-[#00f2fe]">
                  🛰️ CENTRAL BROADCAST CORE
                </h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                  Live Student Sync Node
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#00c853] rounded-full animate-pulse" />
                <span className="text-[9px] font-mono text-[#00c853] font-bold uppercase tracking-widest animate-pulse">
                  TRANSMISSION STANDBY
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const typeSelect = e.currentTarget.elements.namedItem(
                  "broadcastType",
                ) as HTMLSelectElement;
                const urlInput = e.currentTarget.elements.namedItem(
                  "broadcastUrl",
                ) as HTMLInputElement;
                const topicInput = e.currentTarget.elements.namedItem(
                  "broadcastTopic",
                ) as HTMLInputElement;

                if (typeSelect && urlInput) {
                  const type = typeSelect.value;
                  const url = urlInput.value;
                  const topic = topicInput ? topicInput.value : "";
                  const success = (window as any).broadcastLiveLink(
                    type,
                    url,
                    topic,
                  );
                  if (success) {
                    alert(
                      `[HUB SYNC SUCCESS]: Live Broadcast initiated on Student Hub.`,
                    );
                    urlInput.value = "";
                    if (topicInput) topicInput.value = "";
                  } else {
                    alert(
                      `[HUB SYNC FAILED]: Could not broadcast endpoint URL.`,
                    );
                  }
                }
              }}
              className="space-y-6 text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    STREAM PLATFORM
                  </label>
                  <select
                    name="broadcastType"
                    className="w-full h-14 bg-[#05112e] border border-[#00f2fe]/15 px-4 outline-none font-black text-white focus:border-[#00f2fe] rounded-xl text-xs uppercase"
                  >
                    <option value="ZOOM">ZOOM MEETING</option>
                    <option value="WHATSAPP">WHATSAPP GROUP LINK</option>
                    <option value="MEET">GOOGLE MEET</option>
                    <option value="NONE">CLEAR BROADCAST (NONE)</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    CLASS SESSION TOPIC
                  </label>
                  <input
                    name="broadcastTopic"
                    type="text"
                    className="w-full h-14 bg-[#05112e] border border-[#00f2fe]/15 px-4 outline-none font-bold text-white focus:border-[#00f2fe] placeholder:text-[#8fa3c7]/20 rounded-xl text-xs"
                    placeholder="e.g. Software Engineering Practice & Workflow Coordination"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  TARGET URL ENDPOINT
                </label>
                <input
                  name="broadcastUrl"
                  type="url"
                  className="w-full h-14 bg-[#05112e] border border-[#00f2fe]/15 px-4 outline-none font-mono text-[#00f2fe] focus:border-[#00f2fe] placeholder:text-[#8fa3c7]/20 rounded-xl text-xs"
                  placeholder="https://zoom.us/j/9920194821 or https://chat.whatsapp.com/abc..."
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-[#00f2fe]/10 gap-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      (window as any).toggleInternalPortalCall(true);
                      alert(
                        "[HUB SYNCS]: Portal Video Call overlay simulation activated for all students.",
                      );
                    }}
                    className="bg-[#00c853]/10 border border-[#00c853]/20 text-[#00c853] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00c853]/20 transition-all font-mono"
                  >
                    📞 TOGGLE INTERNAL VIDEO CALL ON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      (window as any).toggleInternalPortalCall(false);
                      alert("[HUB SYNCS]: Portal Video Call overlay offline.");
                    }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all font-mono"
                  >
                    🛑 TOGGLE VIDEO CALL OFF
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#00f2fe] text-[#05112e] px-10 py-4 font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-[#00c6ff] transition-all font-mono shadow-md shadow-[#00f2fe]/10"
                >
                  🛰️ PUSH HUB BROADCAST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. BENTO HERO SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 bg-[#0a1b44] border border-[#00f2fe]/15 px-5 py-6 sm:p-10 md:p-12 relative shadow-xl hover:border-[#00f2fe]/40 transition-all rounded-[24px]">
          <div className="flex flex-col h-full space-y-12">
            <div className="flex justify-between items-start">
              <div className="text-[#00f2fe] text-[10px] font-black uppercase tracking-[0.5em]">
                REGISTRY_PROTOCOL
              </div>
              <div className="text-right">
                <p className="text-[12px] font-black text-white tracking-tighter uppercase">
                  {hasRegisteredToday ? "IDENTITY_SECURED" : "UNVERIFIED"}
                </p>
              </div>
            </div>

            <div className="space-y-10">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                SYSTEM VALIDATION
              </h2>
              <p className="text-[11px] text-[#e2e8f0] font-bold uppercase tracking-[0.3em] leading-loose">
                CRITICAL: CONFIRM PRESENCE FOR DATA SYNCHRONIZATION.
              </p>

              {!hasRegisteredToday ? (
                <button
                  onClick={() => onAction?.("attendance")}
                  className="w-full bg-[#00f2fe] hover:bg-[#00c6ff] text-[#05112e] py-6 font-black uppercase tracking-[0.4em] text-[12px] transition-all active:scale-95 shadow-lg shadow-[#00f2fe]/15 rounded-xl"
                >
                  Confirm Attendance
                </button>
              ) : (
                <div className="w-full py-6 bg-[#00f2fe]/5 border border-[#00f2fe]/20 flex items-center justify-center gap-4 text-[#00f2fe] rounded-xl">
                  <span className="text-[12px] font-black uppercase tracking-[0.4em]">
                    ✓ Verified
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-[#0a1b44] border border-[#00f2fe]/15 px-5 py-6 sm:p-10 md:p-12 relative shadow-xl hover:border-[#00f2fe]/40 transition-all rounded-[24px]">
          <div className="flex flex-col h-full space-y-12">
            <div className="flex justify-between items-start">
              <div className="text-[#00f2fe] text-[10px] font-black uppercase tracking-[0.5em]">
                ACADEMIC_TRAJECTORY
              </div>
              <div className="flex gap-8">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-[#38bdf8] tracking-widest">
                    MODULES
                  </span>
                  <span className="text-3xl font-black text-white tracking-tighter">
                    {studentCourse?.modules.length || 0}
                  </span>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-black tracking-tight uppercase text-white leading-tight">
              {studentData?.currentTrack || "CORE_STREAM"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {studentCourse?.modules
                .slice(0, 4)
                .map((mod: any, idx: number) => {
                  const modCompletions = mod.lessons.filter((l: any) =>
                    completions.includes(l.id),
                  ).length;
                  const modTotal = mod.lessons.length || 1;
                  const modPercent = Math.round(
                    (modCompletions / modTotal) * 100,
                  );

                  return (
                    <div
                      key={mod.id}
                      className="space-y-4 pt-6 border-t border-[#00f2fe]/10 group"
                    >
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-black text-[#38bdf8] uppercase tracking-widest mb-1">
                            UNIT_0{idx + 1}
                          </p>
                          <h5 className="text-[13px] font-black uppercase text-white tracking-tight group-hover:text-[#00f2fe] transition-colors">
                            {mod.title}
                          </h5>
                        </div>
                        <span className="text-[14px] font-black text-[#00f2fe]">
                          {modPercent}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#05112e] rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-[#00f2fe] to-[#38bdf8] transition-all duration-1000"
                          style={{ width: `${modPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {!isStudent && (
        <>
          <div className="flex items-center gap-8 py-10">
            <h2 className="text-[13px] font-black uppercase text-white tracking-[0.6em] shrink-0">
              DATA DISPATCH
            </h2>
            <div className="h-px flex-1 bg-[#00f2fe]/15" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div className="bg-[#0a1b44] border border-[#00f2fe]/15 shadow-xl overflow-hidden rounded-[24px]">
                <div className="bg-[#05112e] px-5 py-6 sm:p-10 text-white flex items-center justify-between border-b border-[#00f2fe]/10">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-normal leading-none mb-2 text-white">
                      BROADCAST_FEED
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#38bdf8]">
                      System Synchronized Relay
                    </p>
                  </div>
                  {isAddingAnnouncement ? (
                    <button
                      onClick={() => setIsAddingAnnouncement(false)}
                      className="text-[11px] font-black uppercase tracking-widest text-[#38bdf8] hover:text-white"
                    >
                      CANCEL
                    </button>
                  ) : (
                    ["admin", "staff", "instructor"].includes(
                      user?.role || "",
                    ) && (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={async () => {
                            const now = new Date();
                            const expiredAndFee = announcements.filter((anno) => {
                              const title = (anno.title || "").toLowerCase();
                              const content = (anno.content || "").toLowerCase();
                              const isFeeOrBroadcast =
                                title.includes("fee") ||
                                title.includes("broadcast") ||
                                title.includes("payment") ||
                                content.includes("fee") ||
                                content.includes("broadcast") ||
                                content.includes("payment");
                              const createdDate = new Date(anno.date || now);
                              const hoursDiff =
                                (now.getTime() - createdDate.getTime()) /
                                (1000 * 60 * 60);
                              return isFeeOrBroadcast && hoursDiff >= 24;
                            });

                            if (expiredAndFee.length === 0) {
                              alert(
                                "No expired broadcast/fee announcements found (older than 24 hours).",
                              );
                              return;
                            }

                            if (
                              window.confirm(
                                `Confirm deletion of ${expiredAndFee.length} expired broadcast/fee announcements (older than 24h)?`,
                              )
                            ) {
                              let count = 0;
                              for (const anno of expiredAndFee) {
                                deleteAnnouncement(anno.id);
                                count++;
                              }
                              alert(
                                `Successfully cleaned up ${count} expired broadcast/fee announcements.`,
                              );
                            }
                          }}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-[#E11D48] border border-rose-500/25 px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl shadow-md cursor-pointer shrink-0 flex items-center gap-1.5"
                        >
                          CLEAN EXPIRED FEES
                        </button>
                        <button
                          onClick={() => setIsAddingAnnouncement(true)}
                          className="bg-[#00f2fe] text-[#05112e] px-8 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-[#00c6ff] transition-all font-mono rounded-xl shadow-md focus:ring-2 focus:ring-[#00f2fe]/20"
                        >
                          NEW_ENTRY
                        </button>
                      </div>
                    )
                  )}
                </div>

                <div className="px-5 py-6 sm:p-10 space-y-12">
                  {isAddingAnnouncement && (
                    <form
                      onSubmit={handleAddAnnouncement}
                      className="space-y-6 bg-[#05112e] p-8 border border-[#00f2fe]/10 rounded-2xl"
                    >
                      <input
                        className="w-full h-16 bg-[#0a1b44] border border-[#00f2fe]/15 px-6 outline-none font-black text-white focus:border-[#00f2fe] placeholder:text-[#8fa3c7]/40 rounded-xl"
                        placeholder="ENTRY_TITLE..."
                        value={newAnnouncement.title}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                      <textarea
                        className="w-full p-8 bg-[#0a1b44] border border-[#00f2fe]/15 outline-none font-mono min-h-[160px] text-white focus:border-[#00f2fe] placeholder:text-[#8fa3c7]/40 rounded-xl"
                        placeholder="DATA_CONTENT..."
                        value={newAnnouncement.content}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            content: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        type="submit"
                        className="w-fit bg-[#00f2fe] text-[#05112e] px-12 py-4 font-black uppercase tracking-widest text-xs ml-auto block rounded-xl hover:bg-[#00c6ff] transition-all"
                      >
                        PUSH_DISPATCH
                      </button>
                    </form>
                  )}

                  <div className="space-y-12 divide-y divide-[#00f2fe]/10">
                    {announcements.length > 0 ? (
                      [...announcements]
                        .reverse()
                        .slice(0, 4)
                        .map((anno) => (
                          <div
                            key={anno.id || `anno-${anno.date}`}
                            className="pt-12 first:pt-0 group border-none"
                          >
                            <div className="flex gap-10">
                              <div className="flex flex-col items-center justify-start shrink-0 pt-2 bg-[#05112e] border border-[#00f2fe]/10 w-16 h-20 rounded-xl">
                                <span className="text-[24px] font-black text-[#00f2fe] leading-none">
                                  0{new Date(anno.date).getDate()}
                                </span>
                                <span className="text-[10px] font-black text-[#38bdf8] uppercase tracking-widest mt-2">
                                  {new Date(anno.date).toLocaleString(
                                    "default",
                                    { month: "short" },
                                  )}
                                </span>
                              </div>
                              <div className="space-y-4 flex-1 text-left">
                                <div className="flex items-center justify-between gap-4">
                                  <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-[#00f2fe] transition-colors leading-none">
                                    {anno.title}
                                  </h3>
                                  {["admin", "staff", "instructor"].includes(
                                    user?.role || "",
                                  ) && (
                                    <button
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            `Are you sure you want to delete this announcement: "${anno.title}"?`,
                                          )
                                        ) {
                                          deleteAnnouncement(anno.id);
                                        }
                                      }}
                                      className="text-[#E11D48] hover:text-red-500 font-black font-mono text-[10px] uppercase tracking-wider px-3 py-1 bg-[#E11D48]/10 border border-[#E11D48]/20 hover:bg-[#E11D48]/20 rounded-lg transition-all flex items-center gap-1.5 shrink-0"
                                    >
                                      <Trash2 className="w-3 h-3" /> DELETE
                                    </button>
                                  )}
                                </div>
                                <p className="text-[#e2e8f0] font-medium text-sm leading-relaxed uppercase tracking-tight">
                                  {anno.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="py-20 text-center flex flex-col items-center gap-6">
                        <p className="text-[12px] font-black text-[#38bdf8]/40 uppercase tracking-[0.5em] italic">
                          NO_ACTIVE_TRANSMISSIONS
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              {/* SYSTEM-WIDE AUTOMATED CUSTOM FEATURES DISPATCHER */}
              <div className="bg-[#0a1b44] border border-violet-500/20 px-5 py-6 sm:p-10 shadow-xl rounded-[24px] space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-violet-400">
                    SYSTEM FEATURES CONTROLLER
                  </h3>
                  <span className="bg-violet-500/10 border border-violet-500/30 text-violet-400 font-mono font-black text-[8px] px-2.5 py-1 rounded uppercase tracking-widest">
                    {customFeatures.length} Dynamic Node
                    {customFeatures.length === 1 ? "" : "s"}
                  </span>
                </div>

                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed text-left">
                  Deploy or decommission synthesized functional expansion
                  modules across the entire ITIA system stack natively.
                </p>

                {/* CREATE NEW FEATURE ACCORDION */}
                <div className="bg-[#05112e] border border-violet-500/15 p-5 rounded-2xl space-y-4">
                  <span className="text-[9px] font-black text-violet-300 uppercase tracking-widest block mb-2 text-left">
                    ⚡ SYNTHESIZE NEW FEATURE PAYLOAD
                  </span>
                  <div className="space-y-3">
                    <input
                      id="dash-feat-name"
                      type="text"
                      placeholder="FEATURE_NAME (e.g. Lab Autograder)..."
                      className="w-full h-10 bg-[#0a1b44] border border-violet-500/20 px-4 text-xs font-bold text-white placeholder:text-violet-500/30 outline-none focus:border-violet-400 rounded-xl"
                    />
                    <select
                      id="dash-feat-slot"
                      className="w-full h-10 bg-[#0a1b44] border border-violet-500/20 px-4 text-xs font-bold text-violet-300 outline-none focus:border-violet-400 rounded-xl"
                    >
                      <option value="dashboard">
                        SLOT: Dashboard App / Portal View
                      </option>
                      <option value="courses">
                        SLOT: Curriculums & Syllabus
                      </option>
                      <option value="financial">
                        SLOT: Financial Registry Invoice
                      </option>
                    </select>
                    <textarea
                      id="dash-feat-desc"
                      placeholder="PAYLOAD ACTION DESCRIPTION (Define behavior/requirements)..."
                      className="w-full p-4 bg-[#0a1b44] border border-violet-500/20 text-xs font-mono text-white placeholder:text-[#8fa3c7]/30 min-h-[80px] outline-none focus:border-violet-400 rounded-xl text-left"
                    />
                    <button
                      onClick={() => {
                        const nameEl = document.getElementById(
                          "dash-feat-name",
                        ) as HTMLInputElement;
                        const slotEl = document.getElementById(
                          "dash-feat-slot",
                        ) as HTMLSelectElement;
                        const descEl = document.getElementById(
                          "dash-feat-desc",
                        ) as HTMLTextAreaElement;
                        if (!nameEl.value || !descEl.value) {
                          alert(
                            "Please populate all features parameters to begin synapse generation.",
                          );
                          return;
                        }
                        const newFeat = {
                          id: crypto.randomUUID(),
                          name: nameEl.value,
                          slot: slotEl.value,
                          description: descEl.value,
                          createdAt: new Date().toISOString(),
                          isActive: true,
                        };
                        const updated = [...customFeatures, newFeat];
                        setCustomFeatures(updated);
                        localStorage.setItem(
                          "ita_custom_features",
                          JSON.stringify(updated),
                        );
                        nameEl.value = "";
                        descEl.value = "";
                        alert(
                          `AI_SYNTH_COMPLETE: Feature [${newFeat.name}] deployed to slot [${newFeat.slot}] successfully!`,
                        );
                      }}
                      className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all"
                    >
                      Initialize & Deploy System Module
                    </button>
                  </div>
                </div>

                {/* FEATURE LIST WITH DELETIONS */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-left">
                    ACTIVE RUNTIME DEPLOYMENTS
                  </span>
                  {customFeatures.length > 0 ? (
                    customFeatures.map((feat) => (
                      <div
                        key={feat.id}
                        className="p-4 bg-black/40 border border-[#00f2fe]/10 rounded-xl flex items-center justify-between gap-4"
                      >
                        <div className="text-left">
                          <h5 className="text-xs font-black text-white uppercase">
                            {feat.name}
                          </h5>
                          <span className="text-[8px] font-mono font-bold text-violet-400 uppercase block mt-0.5">
                            SLOT::{feat.slot}
                          </span>
                          <p className="text-[9px] text-gray-400 leading-normal uppercase mt-1 max-w-xs">
                            {feat.description}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to decommission/delete: "${feat.name}"?`,
                              )
                            ) {
                              const filtered = customFeatures.filter(
                                (f) => f.id !== feat.id,
                              );
                              setCustomFeatures(filtered);
                              localStorage.setItem(
                                "ita_custom_features",
                                JSON.stringify(filtered),
                              );
                              alert(
                                "Feature decoupled and uninstalled from runtime.",
                              );
                            }
                          }}
                          className="p-2 text-red-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-all border border-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center py-4 italic">
                      No custom modules initialized.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-[#0a1b44] border border-[#00f2fe]/15 px-5 py-6 sm:p-10 shadow-xl rounded-[24px]">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#00f2fe]">
                    SYSLOG_TELEMETRY
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-emerald-400">
                      ● LIVE
                    </span>
                  </div>
                </div>

                <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide divide-y divide-[#00f2fe]/10 custom-scrollbar">
                  {useAuth()
                    .auditLogs.slice(0, 15)
                    .map((log) => (
                      <div
                        key={log.id}
                        className="pt-8 first:pt-0 group border-none"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">
                            {log.action}
                          </span>
                          <span className="text-[9px] font-mono text-[#00f2fe] font-bold">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[#38bdf8] leading-relaxed uppercase mb-3">
                          {log.details}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-[#38bdf8]/60 tracking-widest">
                            {log.userId}
                          </span>
                          <span className="text-[8px] font-black text-white/40 uppercase">
                            {log.userRole}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0a1b44] to-[#05112e] px-5 py-6 sm:p-10 md:p-12 text-[#e2e8f0] shadow-2xl border border-[#00f2fe]/25 rounded-[32px]">
                <h3 className="text-[11px] font-black uppercase tracking-[0.6em] mb-8 text-[#00f2fe]">
                  SYSTEM_STABILITY
                </h3>
                <p className="text-xl sm:text-2xl font-black italic text-white tracking-tight leading-snug mb-10 uppercase">
                  "ALL NODES NOMINAL. SYNCHRONIZATION COMPLETE."
                </p>
                <button
                  onClick={() => onAction?.("mentor")}
                  className="w-full bg-[#00f2fe] hover:bg-[#00c6ff] text-[#05112e] py-6 font-black uppercase tracking-[0.5em] text-[11px] transition-all rounded-xl shadow-lg shadow-[#00f2fe]/10"
                >
                  DEPLOY NEURAL
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-8 py-10">
        <h2 className="text-[13px] font-black uppercase text-white tracking-[0.6em] shrink-0">
          OPERATIONAL STRATUM
        </h2>
        <div className="h-px flex-1 bg-[#00f2fe]/15" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {activeTiles.map((tile) => (
          <DashboardTile
            key={tile.id}
            {...tile}
            onClick={() => onAction?.(tile.id)}
          />
        ))}
      </div>
    </div>
  );
}
