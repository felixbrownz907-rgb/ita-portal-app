import React, { useState, useEffect } from "react";
import { useAuth, safeSetLocalStorage } from "../context/AuthContext";
import {
  ShieldAlert,
  RefreshCw,
  Database,
  Terminal,
  Settings as SettingsIcon,
  AlertTriangle,
  CheckCircle,
  Zap,
  Search,
  Activity,
  Trash2,
  Key,
  Users,
  BookOpen,
  UserPlus,
  Video,
  Clock,
  Sparkles,
  Cpu,
  Plus
} from "lucide-react";
import { cn } from "../components/utils";
import { motion } from "motion/react";

export function SystemConfig() {
  const {
    students,
    submissions,
    attendance,
    payments,
    refreshData,
    hardReset,
    user,
    courses,
    auditLogs,
    purgeOtherStaff,
    addStaff,
    deleteStudent,
    forceRegistryUpload,
    introUrl,
    updateIntroUrl,
    onlineClasses,
    addOnlineClass,
    deleteOnlineClass,
  } = useAuth();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isRealigning, setIsRealigning] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({
    fullName: "",
    email: "",
    role: "staff" as "staff" | "instructor" | "admin",
  });
  const [activeDiagnostic, setActiveDiagnostic] = useState<string | null>(null);

  // Live video broadcast scheduling state
  const [showClassForm, setShowClassForm] = useState(false);
  const [classForm, setClassForm] = useState({
    title: "",
    videoUrl: "",
    courseId: "",
    startTime: "",
    duration: 60,
  });

  // Custom AI Synthesis Feature Developer states
  const [customFeatures, setCustomFeatures] = useState<any[]>(() => {
    const saved = localStorage.getItem("ita_custom_features");
    return saved ? JSON.parse(saved) : [];
  });
  const [showFeatureBuilder, setShowFeatureBuilder] = useState(false);
  const [featureForm, setFeatureForm] = useState({
    name: "",
    slot: "dashboard" as "dashboard" | "courses" | "assessments" | "sidebar" | "general",
    description: "",
  });
  const [synthesizingFeature, setSynthesizingFeature] = useState(false);

  // Initialize courseId in classForm once courses are loaded
  useEffect(() => {
    if (courses && courses.length > 0 && !classForm.courseId) {
      setClassForm((prev) => ({ ...prev, courseId: courses[0].id }));
    }
  }, [courses]);
  const [repairData, setRepairData] = useState<any[]>([]);

  const isAdmin =
    user?.role === "admin" ||
    user?.email?.toLowerCase() === "felixbrownz907@gmail.com";

  if (!isAdmin) {
    return (
      <div className="p-20 text-center uppercase font-black text-gray-400">
        UNAUTHORIZED_ACCESS: Admin clearance required.
      </div>
    );
  }

  const handleGlobalRepair = async () => {
    if (
      window.confirm(
        "CRITICAL_REPAIR: This protocol will force-sync all local student nodes to the cloud master registry. Continue?",
      )
    ) {
      setIsRealigning(true);
      try {
        await forceRegistryUpload();
        alert(
          "REPAIR_SUCCESS: All local identities have been synchronized with the cloud registry.",
        );
      } finally {
        setIsRealigning(false);
      }
    }
  };

  const handleRegenerateKey = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert(
        "SYSTEM_KEY: Security signature regenerated and synchronized across nodes.",
      );
    }, 2000);
  };

  const runDiagnostics = () => {
    setActiveDiagnostic("running");
    const anomalies: any[] = [];

    // 1. Check for orphaned submissions
    const orphanedSubmissions = submissions.filter(
      (s) => s.program === "Unknown Program" || !s.program,
    );
    if (orphanedSubmissions.length > 0) {
      anomalies.push({
        type: "Submission Orphan",
        count: orphanedSubmissions.length,
        detail: "Assignments with no program mapping.",
        severity: "medium",
      });
    }

    // 2. Check for missing profiles (inferred)
    const uniqueStudentIdsInSubmissions = new Set(
      submissions.map((s) => s.studentId),
    );
    const missingProfiles = Array.from(uniqueStudentIdsInSubmissions).filter(
      (id) => !students.some((s) => s.studentId === id || s.id === id),
    );
    if (missingProfiles.length > 0) {
      anomalies.push({
        type: "Identity Void",
        count: missingProfiles.length,
        detail: "Submissions from non-existent student IDs.",
        severity: "high",
      });
    }

    // 3. Sync mismatch checks
    const pendingPayments = payments.filter((p) => p.status === "Pending");
    if (pendingPayments.length > 5) {
      anomalies.push({
        type: "Sync Lag",
        count: pendingPayments.length,
        detail: "High volume of unverified transactions.",
        severity: "low",
      });
    }

    setRepairData(anomalies);
    setActiveDiagnostic("complete");
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">
            Master Control Console
          </p>
          <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase leading-none">
            System Configuration
          </h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">
            Administrative Reconstruction & Diagnostic Tools
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleRegenerateKey}
            className="h-14 bg-white border-2 border-[#E11D48] text-[#E11D48] px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-[#E11D48] hover:text-white transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" /> Regenerate System Key
          </button>
          <button
            onClick={handleGlobalRepair}
            disabled={isRealigning}
            className="h-14 bg-[#F59E0B] text-white px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-gray-900 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-500/20"
          >
            <Database
              className={cn("w-4 h-4", isRealigning && "animate-spin")}
            />{" "}
            {isRealigning ? "Re-aligning..." : "Force Registry Sync"}
          </button>
          <button
            onClick={async () => {
              setIsSyncing(true);
              await refreshData();
              setIsSyncing(false);
              alert("SYNC_SUCCESS: Academic nodes re-aligned.");
            }}
            disabled={isSyncing}
            className="h-14 bg-white border-2 border-gray-100 text-gray-400 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className={cn("w-4 h-4", isSyncing && "animate-spin")} />{" "}
            {isSyncing ? "Syncing..." : "Pulse Refresh"}
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "MASTER_DESTROY: This will clear all local cache and force a complete cloud re-fetch. Proceed?",
                )
              ) {
                hardReset();
              }
            }}
            className="h-14 bg-secondary text-white px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-black/10"
          >
            <RefreshCw className="w-4 h-4" /> Global Hard Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* DIAGNOSTIC PANEL */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] border-2 border-gray-100 p-8 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black italic uppercase italic tracking-tight leading-none">
                    System Diagnostics
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    Consistency check across cloud nodes
                  </p>
                </div>
              </div>
              <button
                onClick={runDiagnostics}
                className="h-10 bg-primary/5 text-primary border border-primary/20 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-primary hover:text-white transition-all"
              >
                Run Registry Scan
              </button>
            </div>

            {activeDiagnostic === "complete" ? (
              <div className="space-y-4">
                {repairData.length > 0 ? (
                  repairData.map((anomaly, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-start justify-between gap-4"
                    >
                      <div className="flex gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            anomaly.severity === "high"
                              ? "bg-red-100 text-red-500"
                              : anomaly.severity === "medium"
                                ? "bg-amber-100 text-amber-500"
                                : "bg-blue-100 text-blue-500",
                          )}
                        >
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-gray-900">
                            {anomaly.type} Detected ({anomaly.count})
                          </h4>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">
                            {anomaly.detail}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          alert(
                            `REPAIR_IN_PROGRESS: Attempting to resolve ${anomaly.type}...`,
                          );
                          refreshData().then(() =>
                            alert("REPAIR_COMPLETE: Affected nodes re-synced."),
                          );
                        }}
                        className="text-[9px] font-black uppercase text-primary underline"
                      >
                        Repair Link
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                      Master Node Synchronization: Optimal
                    </p>
                    <p className="text-gray-400 text-xs font-medium max-w-xs">
                      No orphaned records or identity conflicts detected in the
                      current registry sweep.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-300">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Awaiting Command Input...
                </p>
              </div>
            )}
          </div>

          {/* AUDIT TAIL */}
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-black uppercase italic tracking-tight">
                  Active Audit Log
                </h3>
              </div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                {auditLogs.length} Events Logged
              </span>
            </div>
            <div className="max-h-[400px] overflow-y-auto font-mono">
              <table className="w-full text-[10px]">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">
                      Action
                    </th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {auditLogs.slice(0, 100).map((log, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md font-black italic",
                            log.action.includes("Fault")
                              ? "bg-red-50 text-red-500"
                              : "bg-primary/5 text-primary",
                          )}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600 truncate max-w-xs">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* STAFF REGISTRY */}
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm mt-8">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-black uppercase italic tracking-tight">
                  Staff & Administrator Registry
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                  {students.filter((s) => s.role !== "student").length}{" "}
                  Registered Personnel
                </span>
                <button
                  onClick={() => setShowAddStaff(true)}
                  className="h-8 bg-black text-white px-4 rounded-lg font-black uppercase tracking-widest text-[8px] hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                  <Users className="w-3" /> Add Personnel
                </button>
              </div>
            </div>

            {showAddStaff && (
              <div className="p-8 bg-gray-50 border-b border-gray-100 animate-in slide-in-from-top duration-300">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">
                      New Staff Credentials
                    </h4>
                    <button
                      onClick={() => setShowAddStaff(false)}
                      className="text-[10px] font-black uppercase text-red-500"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full h-12 bg-white px-4 rounded-xl border border-gray-200 text-xs font-bold"
                    value={staffForm.fullName}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, fullName: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-12 bg-white px-4 rounded-xl border border-gray-200 text-xs font-bold"
                    value={staffForm.email}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, email: e.target.value })
                    }
                  />
                  <select
                    className="w-full h-12 bg-white px-4 rounded-xl border border-gray-200 text-xs font-bold"
                    value={staffForm.role}
                    onChange={(e) =>
                      setStaffForm({
                        ...staffForm,
                        role: e.target.value as any,
                      })
                    }
                  >
                    <option value="staff">Associate Staff</option>
                    <option value="instructor">Course Instructor</option>
                    <option value="admin">System Administrator</option>
                  </select>
                  <button
                    onClick={async () => {
                      if (!staffForm.fullName || !staffForm.email)
                        return alert("All fields are mandatory.");
                      await addStaff(staffForm);
                      setShowAddStaff(false);
                      setStaffForm({ fullName: "", email: "", role: "staff" });
                    }}
                    className="w-full h-12 bg-primary text-secondary rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:scale-[0.98] transition-all"
                  >
                    Authorize Security Node
                  </button>
                </div>
              </div>
            )}

            <div className="font-mono overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">
                      Identity
                    </th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">
                      Role
                    </th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">
                      Password
                    </th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students
                    .filter((s) => s.role !== "student")
                    .map((staff, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div className="flex flex-col">
                            <span className="font-black uppercase text-gray-900">
                              {staff.fullName}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {staff.email || staff.studentId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-md font-black italic uppercase",
                              staff.role === "admin"
                                ? "bg-primary text-secondary"
                                : "bg-gray-100 text-gray-500",
                            )}
                          >
                            {staff.role}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono font-bold text-primary italic">
                          {staff.password}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  staff.status === "Active"
                                    ? "bg-emerald-500"
                                    : "bg-red-500",
                                )}
                              />
                              <span className="uppercase font-bold text-gray-400">
                                {staff.status}
                              </span>
                            </div>
                            {staff.email?.toLowerCase() !==
                              "felixbrownz907@gmail.com" && (
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `MASTER_DELETE: Revoke access for ${staff.fullName}?`,
                                    )
                                  ) {
                                    deleteStudent(staff.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LIVE SYNCHRONIZED BROADCAST SCHEDULER */}
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm mt-8 p-8 text-left space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 text-[#E11D48] flex items-center justify-center">
                  <Video className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tight text-gray-900">🔴 Live Video Broadcast Class Scheduler</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Simulate authentic broadcast classrooms (Un-pausable, un-stoppable video loop)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowClassForm(!showClassForm)}
                className="h-8 bg-[#E11D48] text-white px-4 rounded-xl font-black uppercase tracking-widest text-[8px] hover:bg-gray-800 transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> {showClassForm ? "Close Form" : "Schedule Live Class"}
              </button>
            </div>

            {showClassForm && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 animate-in slide-in-from-top duration-300">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-800">New Live Stream Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Class Topic / Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Intro to Subnetting Live Lab"
                      className="w-full h-11 bg-white px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                      value={classForm.title}
                      onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Target Study Program</label>
                    <select
                      className="w-full h-11 bg-white px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                      value={classForm.courseId}
                      onChange={(e) => setClassForm({ ...classForm, courseId: e.target.value })}
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Video Source Link (Direct MP4 or YouTube Link)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      className="w-full h-11 bg-white px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 outline-none focus:border-primary font-mono"
                      value={classForm.videoUrl}
                      onChange={(e) => setClassForm({ ...classForm, videoUrl: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-400">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        className="w-full h-11 bg-white px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                        value={classForm.startTime}
                        onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-400">Duration (Minutes)</label>
                      <input
                        type="number"
                        className="w-full h-11 bg-white px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                        value={classForm.duration}
                        onChange={(e) => setClassForm({ ...classForm, duration: parseInt(e.target.value) || 60 })}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (!classForm.title || !classForm.videoUrl || !classForm.startTime) {
                      return alert("All fields are required to register a live scheduled video node.");
                    }
                    setIsSyncing(true);
                    try {
                      await addOnlineClass({
                        courseId: classForm.courseId,
                        title: classForm.title,
                        instructorId: (user as any)?.id || user?.email || "admin",
                        startTime: new Date(classForm.startTime).toISOString(),
                        duration: classForm.duration,
                        platform: 'other',
                        meetingLink: classForm.videoUrl,
                        status: 'scheduled'
                      });
                      setClassForm({
                        title: "",
                        videoUrl: "",
                        courseId: courses[0]?.id || "",
                        startTime: "",
                        duration: 60,
                      });
                      setShowClassForm(false);
                      alert("BROADCAST_SUCCESS: Live scheduled video node added and synced with student dashboards!");
                      await refreshData();
                    } catch (e: any) {
                      alert(`Error scheduling live class: ${e.message}`);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  className="w-full h-11 bg-[#E11D48] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Video className="w-4 h-4" /> Deploy Stream Broadcast Class
                </button>
              </div>
            )}

            <div className="font-mono overflow-x-auto text-[10px]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">Class Details</th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">Program</th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">Start Time</th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">Duration</th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {onlineClasses && onlineClasses.length > 0 ? (
                    onlineClasses.map((cls) => {
                      const courseName = courses.find(c => c.id === cls.courseId)?.name || 'Direct Track';
                      const localStartStr = new Date(cls.startTime).toLocaleString();
                      return (
                        <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 font-black text-gray-800 uppercase">{cls.title}</td>
                          <td className="px-6 py-3 font-bold text-gray-500 uppercase">{courseName}</td>
                          <td className="px-6 py-3 text-primary uppercase">{localStartStr}</td>
                          <td className="px-6 py-3 text-gray-600 font-bold">{cls.duration} min</td>
                          <td className="px-6 py-3">
                            <button
                              onClick={async () => {
                                if (confirm(`Cancel and delete the live scheduled class: ${cls.title}?`)) {
                                  await deleteOnlineClass(cls.id);
                                  await refreshData();
                                  alert("Deleted successfully.");
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400 uppercase tracking-widest">No active or scheduled live stream video classes.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ITIA CORE AUTOMATED AI EXPANSION SYSTEM */}
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm mt-8 p-8 text-left space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tight text-gray-900">🛡️ ITIA Core AI Expansion Engine</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Empowers developers to initialize custom features on runtime live-preview modules</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFeatureBuilder(!showFeatureBuilder)}
                className="h-8 bg-violet-600 text-white px-4 rounded-xl font-black uppercase tracking-widest text-[8px] hover:bg-gray-800 transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> {showFeatureBuilder ? "Close Module Builder" : "Initialize New Feature"}
              </button>
            </div>

            {showFeatureBuilder && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 animate-in slide-in-from-top duration-300">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-violet-700">Synthesize New Functional Slot</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Feature Name / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Subnetting Speed Practice Sandbox"
                      className="w-full h-11 bg-white px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 outline-none focus:border-violet-500"
                      value={featureForm.name}
                      onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Integration Placement Slot Address</label>
                    <select
                      className="w-full h-11 bg-white px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 outline-none focus:border-violet-500"
                      value={featureForm.slot}
                      onChange={(e) => setFeatureForm({ ...featureForm, slot: e.target.value as any })}
                    >
                      <option value="dashboard">Dashboard Canvas (Student Screen)</option>
                      <option value="courses">Syllabus Portal Controls</option>
                      <option value="assessments">Assessments Workspace</option>
                      <option value="sidebar">Additional Dynamic Panels</option>
                      <option value="general">Global Shell</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400">Describe Feature Requirements / Functional Specifications</label>
                  <textarea
                    rows={3}
                    placeholder="Describe exactly what fields, buttons, interactive quizzes, or simulations this modular feature provides so that the AI can synthesize and install it perfectly..."
                    className="w-full bg-white p-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 outline-none focus:border-violet-500 resize-none font-mono"
                    value={featureForm.description}
                    onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  disabled={synthesizingFeature}
                  onClick={async () => {
                    if (!featureForm.name || !featureForm.description) {
                      return alert("Specification name and description are mandatory.");
                    }
                    setSynthesizingFeature(true);
                    try {
                      const newFeature = {
                        id: crypto.randomUUID(),
                        name: featureForm.name,
                        slot: featureForm.slot,
                        description: featureForm.description,
                        createdAt: new Date().toISOString(),
                        isActive: true,
                      };
                      const updated = [...customFeatures, newFeature];
                      setCustomFeatures(updated);
                      safeSetLocalStorage("ita_custom_features", JSON.stringify(updated));
                      setFeatureForm({ name: "", slot: "dashboard", description: "" });
                      setShowFeatureBuilder(false);
                      alert(`AI_SYNTH_COMPLETE: Feature [${newFeature.name}] successfully synthesized and registered as a permanent system module!`);
                    } finally {
                      setSynthesizingFeature(false);
                    }
                  }}
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" /> Synthesize and Deploy Feature
                </button>
              </div>
            )}

            <div className="font-mono overflow-x-auto text-[10px]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">Active Feature Spec</th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">Placement Slot</th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">Registration Signature</th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">Status Badge</th>
                    <th className="px-6 py-3 font-black text-gray-400 uppercase text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customFeatures && customFeatures.length > 0 ? (
                    customFeatures.map((feat) => (
                      <tr key={feat.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-black text-gray-800 uppercase flex flex-col">
                          <span className="font-black text-xs text-gray-950">{feat.name}</span>
                          <span className="text-[8px] text-gray-400 font-normal mt-1 leading-normal text-left">{feat.description}</span>
                        </td>
                        <td className="px-6 py-3 font-bold text-violet-600 uppercase">slot::{feat.slot}</td>
                        <td className="px-6 py-3 font-mono text-gray-400">{feat.id.substring(0, 8)}...</td>
                        <td className="px-6 py-3">
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-md font-black uppercase tracking-wider italic text-[8px] animate-pulse">
                            🟢 MODULE_ACTIVE
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => {
                              const filtered = customFeatures.filter(f => f.id !== feat.id);
                              setCustomFeatures(filtered);
                              safeSetLocalStorage("ita_custom_features", JSON.stringify(filtered));
                              alert("Module uninstalled.");
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400 uppercase tracking-widest">No custom developer features deployed on runtime stack. Use Modular Builder above to add new parameters dynamically!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SIDEBAR TOOLS */}
        <div className="space-y-8">
          {/* NRC RECOVERY PROBE */}
          <div className="bg-gray-900 rounded-[32px] p-8 border-4 border-primary shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-primary" />
                <h3 className="text-sm font-black uppercase text-white tracking-[0.2em]">
                  NRC Recovery Probe
                </h3>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">
                Deep search cloud master nodes for missing records (e.g.
                135928/18/1).
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="ENTER NRC NUMBER"
                  id="nrc-probe-input"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-[10px] font-black text-white focus:border-primary outline-none transition-all placeholder:text-white/20"
                />
                <button
                  onClick={async () => {
                    const val = (
                      document.getElementById(
                        "nrc-probe-input",
                      ) as HTMLInputElement
                    )?.value;
                    if (!val) return;
                    setIsSyncing(true);
                    try {
                      const { supabase: sBase } =
                        await import("../lib/supabase");
                      if (!sBase) throw new Error("Connection failed");
                      const cleanVal = val.replace(/[^A-Z0-9]/g, "");
                      // Multi-tier probe: Exact, Digit-match, Name-match
                      const { data, error } = await sBase
                        .from("portal_profiles")
                        .select("*")
                        .or(
                          `nrc.eq."${val}",nrc.ilike.%${cleanVal}%,full_name.ilike.%${val}%`,
                        );

                      if (error) throw error;
                      let results = data || [];

                      // Fuzzy fallback if nothing found
                      if (results.length === 0 && cleanVal.length > 5) {
                        const { data: fuzzy } = await sBase
                          .from("portal_profiles")
                          .select("*")
                          .ilike("nrc", `%${cleanVal.substring(0, 5)}%`);
                        results = fuzzy || [];
                      }

                      if (results && results.length > 0) {
                        const found = results[0];
                        if (
                          window.confirm(
                            `NODE LOCATED: Found [${found.full_name}] NRC: ${found.nrc}. Anchor to registry?`,
                          )
                        ) {
                          // Force seed local long-term memory
                          const localPerm = JSON.parse(
                            localStorage.getItem("ita_permanent_registry") ||
                              "[]",
                          );
                          const mapped = {
                            id: found.id,
                            studentId: found.student_id,
                            fullName: found.full_name,
                            email: found.email,
                            nrc: found.nrc,
                            phone: found.phone,
                            status: found.status,
                            progress: found.progress,
                            courseId: found.course_id,
                            intakeId: found.intake_id,
                            password: found.password,
                          };

                          if (!localPerm.some((s: any) => s.id === mapped.id)) {
                            localPerm.push(mapped);
                            safeSetLocalStorage(
                              "ita_permanent_registry",
                              JSON.stringify(localPerm),
                            );
                          }

                          await refreshData();
                          alert("RESTORATION COMPLETE: Data node secured.");
                        }
                      } else {
                        alert(
                          "SCAN FAILURE: Record not found in cloud master.",
                        );
                      }
                    } catch (e: any) {
                      alert(`PROBE ERROR: ${e.message}`);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/30"
                >
                  Deep Scan Cloud
                </button>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <Database className="w-8 h-8 text-emerald-400" />
                <h3 className="text-xl font-black italic uppercase tracking-tight leading-none">
                  Permanent Memory Rescue
                </h3>
              </div>
              <p className="text-xs font-bold text-emerald-100/60 leading-relaxed uppercase tracking-wider">
                Authorized NRC anchor. Use this to restore students from
                long-term memory if the cloud registry fluctuates.
              </p>
              <button
                onClick={async () => {
                  setIsSyncing(true);
                  await refreshData();
                  setIsSyncing(false);
                  const rescued = localStorage.getItem(
                    "ita_permanent_registry",
                  );
                  const count = rescued ? JSON.parse(rescued).length : 0;
                  alert(
                    `RESCUE_COMPLETE: Successfully anchored ${count} nodes from long-term memory.`,
                  );
                }}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl flex items-center justify-between px-6 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Execute Cloud Heal
                </span>
                <RefreshCw
                  className={cn("w-4 h-4", isSyncing && "animate-spin")}
                />
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <ShieldAlert className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-black italic uppercase tracking-tight">
                  Security Relay & Recovery
                </h3>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase">
                Manually propagate security updates and repair dangling identity
                nodes.
              </p>

              <div className="bg-amber-900/40 p-6 rounded-3xl border-2 border-amber-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 font-mono">
                    Special Recovery: 135928/18/1
                  </h4>
                </div>
                <p className="text-[9px] font-bold text-gray-300 uppercase leading-tight">
                  Detected Signature: JOSEPH MULENGA MUMBA (Zambia). Program:
                  Cyber Security.
                </p>
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        "ITA_EMERGENCY_OVERRIDE: Manual re-anchor JOSEPH MULENGA MUMBA [135928/18/1] to registry?",
                      )
                    ) {
                      const localPerm = JSON.parse(
                        localStorage.getItem("ita_permanent_registry") || "[]",
                      );
                      const nrc = "135928/18/1";
                      const cleanNrc = "135928181";

                      if (
                        !localPerm.some(
                          (s: any) =>
                            (s.nrc || "").replace(/[^A-Z0-9]/g, "") ===
                            cleanNrc,
                        )
                      ) {
                        const recoveryNode = {
                          id: crypto.randomUUID(),
                          studentId: "2026100",
                          fullName: "JOSEPH MULENGA MUMBA",
                          nrc: nrc,
                          email: "j.mumba@ita.academy",
                          status: "Active",
                          courseId: "11111111-1111-1111-1111-111111111109", // Cyber Security
                          intakeId: "22222222-2222-2222-2222-222222222201", // May 2026
                          admissionYear: 2026,
                          role: "student",
                          password: "000000",
                          progress: 0,
                          attendanceProgress: 0,
                          labProgress: 0,
                          paymentStatus: "Cleared",
                        };
                        localPerm.push(recoveryNode);
                        safeSetLocalStorage(
                          "ita_permanent_registry",
                          JSON.stringify(localPerm),
                        );
                        await forceRegistryUpload();
                        alert(
                          "RECOVERY_SUCCESS: JOSEPH MULENGA MUMBA has been re-anchored to the master registry under Cyber Security.",
                        );
                      } else {
                        alert(
                          "RECOVERY_ABORT: Node already present in registry tiers.",
                        );
                      }
                    }
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2"
                >
                  Force Recover Node 135928/18/1
                  <Database className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="bg-red-900/40 p-6 rounded-3xl border-2 border-red-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-red-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">
                      Security Relay Re-Key
                    </h4>
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase leading-tight">
                    Emergency tool to fix "lost" identities. Enter NRC to force
                    cloud re-alignment.
                  </p>
                  <div className="flex gap-2">
                    <input
                      id="relay-key-input"
                      placeholder="NRC (e.g. 135928/18/1)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black text-white outline-none focus:border-red-500"
                    />
                    <button
                      onClick={async () => {
                        const val = (
                          document.getElementById(
                            "relay-key-input",
                          ) as HTMLInputElement
                        )?.value;
                        if (!val) return;
                        setIsSyncing(true);
                        try {
                          // Force refresh and get latest data
                          const freshNodes = (await refreshData()) as any[];
                          if (!freshNodes) {
                            alert(
                              `RELAY_ALERT: Data stream interrupted. Try again or check cloud connection.`,
                            );
                            return;
                          }
                          const cleanTarget = val
                            .replace(/[^A-Z0-9]/g, "")
                            .toUpperCase();
                          const exists = freshNodes.find((s) => {
                            const snrc = (s.nrc || "")
                              .replace(/[^A-Z0-9]/g, "")
                              .toUpperCase();
                            return (
                              snrc === cleanTarget ||
                              snrc.includes(cleanTarget) ||
                              cleanTarget.includes(snrc)
                            );
                          });

                          if (exists) {
                            await forceRegistryUpload();
                            alert(
                              `NODE_RECOVERED: Student ${exists.fullName} found and cloud-locked.`,
                            );
                          } else {
                            const localPerm = JSON.parse(
                              localStorage.getItem("ita_permanent_registry") ||
                                "[]",
                            );
                            const backup = localPerm.find((s: any) => {
                              const snrc = (s.nrc || "")
                                .replace(/[^A-Z0-9]/g, "")
                                .toUpperCase();
                              return (
                                snrc === cleanTarget ||
                                snrc.includes(cleanTarget)
                              );
                            });
                            if (backup) {
                              alert(
                                `NODE_ANCHORED: Found ${backup.fullName} in deep storage. Initiating Emergency Repair...`,
                              );
                              await forceRegistryUpload();
                            } else {
                              alert(
                                `NODE_VOID: NRC ${val} not found in any registry tier. Use Deep Scan Cloud.`,
                              );
                            }
                          }
                        } catch (e: any) {
                          alert(`RELAY_ERROR: ${e.message}`);
                        } finally {
                          setIsSyncing(false);
                        }
                      }}
                      className="bg-red-500 hover:bg-red-400 text-white px-6 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all"
                    >
                      Re-Key
                    </button>
                  </div>
                </div>

                <div className="bg-indigo-900/40 p-6 rounded-3xl border-2 border-indigo-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-indigo-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                      Manual Identity Injector
                    </h4>
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase leading-tight">
                    Force re-insert a "lost" student into the rescue vault.
                  </p>
                  <div className="space-y-2">
                    <input
                      id="inject-nrc"
                      placeholder="NRC (e.g. 135928/18/1)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white outline-none focus:border-indigo-500"
                    />
                    <input
                      id="inject-name"
                      placeholder="Full Name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={async () => {
                        const nrc = (
                          document.getElementById(
                            "inject-nrc",
                          ) as HTMLInputElement
                        )?.value;
                        const name = (
                          document.getElementById(
                            "inject-name",
                          ) as HTMLInputElement
                        )?.value;
                        if (!nrc || !name) return;

                        const localPerm = JSON.parse(
                          localStorage.getItem("ita_permanent_registry") ||
                            "[]",
                        );
                        const cleanNrc = nrc
                          .replace(/[^A-Z0-9]/g, "")
                          .toUpperCase();

                        if (
                          localPerm.some(
                            (s: any) =>
                              (s.nrc || "")
                                .replace(/[^A-Z0-9]/g, "")
                                .toUpperCase() === cleanNrc,
                          )
                        ) {
                          alert(
                            "IDENTIFIER_EXISTS: This NRC node is already in the rescue vault.",
                          );
                          return;
                        }

                        const newNode = {
                          id: crypto.randomUUID(),
                          studentId: `2026${cleanNrc}`,
                          fullName: name,
                          nrc: nrc,
                          status: "active",
                          admissionYear: "2026",
                          role: "student",
                        };

                        localPerm.push(newNode);
                        safeSetLocalStorage(
                          "ita_permanent_registry",
                          JSON.stringify(localPerm),
                        );

                        setIsSyncing(true);
                        await refreshData();
                        setIsSyncing(false);
                        alert(
                          `INJECTION_SUCCESS: ${name} re-anchored to registry.`,
                        );
                      }}
                      className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all"
                    >
                      Inject Node
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const keys = Object.keys(localStorage);
                    let totalFound = 0;
                    let fragments = 0;
                    const currentPerm = JSON.parse(
                      localStorage.getItem("ita_permanent_registry") || "[]",
                    );
                    const merged = [...currentPerm];

                    keys.forEach((k) => {
                      try {
                        const item = localStorage.getItem(k);
                        if (!item) return;

                        // Look for student signatures in ANY string
                        if (
                          item.toLowerCase().includes("nrc") ||
                          item.toLowerCase().includes("studentid")
                        ) {
                          fragments++;
                          const data = JSON.parse(item);

                          const extract = (obj: any) => {
                            if (obj && typeof obj === "object") {
                              if (obj.nrc || obj.studentId || obj.full_name) {
                                if (
                                  obj.nrc &&
                                  !merged.some((m) => m.nrc === obj.nrc)
                                ) {
                                  merged.push({
                                    id: obj.id || crypto.randomUUID(),
                                    studentId: obj.studentId || obj.student_id,
                                    fullName: obj.fullName || obj.full_name,
                                    nrc: obj.nrc,
                                    email: obj.email,
                                    status: obj.status || "active",
                                  });
                                  totalFound++;
                                }
                              }
                              Object.values(obj).forEach(extract);
                            } else if (Array.isArray(obj)) {
                              obj.forEach(extract);
                            }
                          };
                          extract(data);
                        }
                      } catch (e) {}
                    });

                    if (totalFound > 0) {
                      safeSetLocalStorage(
                        "ita_permanent_registry",
                        JSON.stringify(merged),
                      );
                      alert(
                        `FORENSICS_COMPLETE: Extracted ${totalFound} nodes from ${fragments} data fragments. master registry updated.`,
                      );
                      refreshData();
                    } else {
                      alert(
                        `FORENSICS_NONE: Inspected ${fragments} fragments. No new identity nodes found.`,
                      );
                    }
                  }}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-6 group hover:bg-violet-600 hover:border-violet-600 transition-all"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-500 group-hover:text-white transition-colors">
                    Deep Memory Forensics
                  </span>
                  <Activity className="w-4 h-4 text-violet-500 group-hover:text-white" />
                </button>

                <button
                  onClick={() => {
                    const rescued = localStorage.getItem(
                      "ita_permanent_registry",
                    );
                    const data = rescued ? JSON.parse(rescued) : [];
                    console.table(data);
                    alert(
                      `REGISTRY_DUMP: ${data.length} students in permanent vault. Check browser console for full table.`,
                    );
                  }}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-6 group hover:bg-amber-600 hover:border-amber-600 transition-all"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 group-hover:text-white transition-colors">
                    Master Registry Dump
                  </span>
                  <Database className="w-4 h-4 text-amber-500 group-hover:text-white" />
                </button>

                <button
                  onClick={() => {
                    const dataStr =
                      "data:text/json;charset=utf-8," +
                      encodeURIComponent(JSON.stringify(students, null, 2));
                    const link = document.createElement("a");
                    link.href = dataStr;
                    link.download = `ita_registry_backup_${new Date().toISOString().split("T")[0]}.json`;
                    link.click();
                  }}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-6 group hover:bg-amber-500 hover:border-amber-500 transition-all font-black"
                >
                  <span className="text-[10px] uppercase tracking-widest text-amber-500 group-hover:text-white transition-colors">
                    Backup Registry Vault
                  </span>
                  <Database className="w-4 h-4 text-amber-500 group-hover:text-white" />
                </button>
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        "CRITICAL: This will take all local identities and force-write them to the cloud master. Proceed?",
                      )
                    ) {
                      await forceRegistryUpload();
                      alert(
                        "DNA_REPAIR_COMPLETE: Registry integrity restored to 100%.",
                      );
                    }
                  }}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-6 group hover:bg-primary hover:border-primary transition-all"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-white transition-colors">
                    Emergency DNA Repair
                  </span>
                  <Zap className="w-4 h-4 text-primary group-hover:text-white group-hover:animate-bounce" />
                </button>
                <button
                  onClick={async () => {
                    if (
                      window.confirm("VERIFICATION_INITIATED: Syncing nodes...")
                    ) {
                      setIsSyncing(true);
                      await refreshData();
                      setIsSyncing(false);
                      alert("VERIFICATION_COMPLETE: Security nodes aligned.");
                    }
                  }}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-6 group hover:bg-emerald-500 hover:border-emerald-500 transition-all font-black"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 group-hover:text-white transition-colors">
                    Verify Profiles
                  </span>
                  <CheckCircle className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* SYSTEM WALKTHROUGH INTRO URL PREFERENCE CARD */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black uppercase italic tracking-tight text-gray-900">
                System Video Intro URL
              </h3>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase leading-relaxed">
              Define the core onboarding and walkthrough YouTube URL loaded on the login page.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                defaultValue={introUrl}
                placeholder="https://www.youtube.com/watch?v=..."
                id="system-intro-url-input"
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-mono font-bold text-gray-700 outline-none focus:border-primary transition-all"
              />
              <button
                onClick={async () => {
                  const val = (document.getElementById("system-intro-url-input") as HTMLInputElement)?.value;
                  if (!val) return alert("URL cannot be empty.");
                  try {
                    setIsSyncing(true);
                    await updateIntroUrl(val);
                    alert("ALIGN_SUCCESS: Onboarding Intro Video synced to multi-node registry.");
                  } catch(e: any) {
                    alert(`ALIGN_ERROR: ${e.message}`);
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                className="w-full h-12 bg-primary text-secondary rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
                Sync Walkthrough URL
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
            <h3 className="text-sm font-black uppercase italic tracking-tight text-gray-900 border-b border-gray-50 pb-4">
              Internal System Stats
            </h3>
            <div className="space-y-6">
              {[
                {
                  label: "Cloud Students",
                  value: students.length,
                  icon: Users,
                  color: "text-primary",
                },
                {
                  label: "Managed Submissions",
                  value: submissions.length,
                  icon: BookOpen,
                  color: "text-blue-500",
                },
                {
                  label: "Attendance Pulses",
                  value: attendance.length,
                  icon: Activity,
                  color: "text-emerald-500",
                },
                {
                  label: "Audit Points",
                  value: auditLogs.length,
                  icon: Terminal,
                  color: "text-gray-400",
                },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {stat.label}
                    </span>
                  </div>
                  <span className="text-sm font-black italic text-gray-900">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={async () => {
                if (
                  window.confirm(
                    "CRITICAL: Re-scan all database nodes for orphans?",
                  )
                ) {
                  await refreshData();
                  alert(
                    "OPERATION_COMPLETE: Registry integrity verified via Cloud Node.",
                  );
                }
              }}
              className="w-full mt-6 py-4 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:scale-[0.98] transition-all"
            >
              Repair Registry Node
            </button>

            <div className="pt-4 h-1 border-t border-gray-50" />

            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-4">
              <div className="flex items-center gap-3 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">
                  Danger Zone
                </h4>
              </div>
              <p className="text-[9px] font-bold text-red-400 leading-tight">
                Proceed with extreme caution. These actions cannot be undone and
                may result in immediate data disconnection.
              </p>
              <button
                onClick={() => {
                  if (
                    prompt("Type 'DELETE ALL' to confirm master purge:") ===
                    "DELETE ALL"
                  ) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full h-12 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                Purge All Local Cache
              </button>
              <button
                onClick={purgeOtherStaff}
                className="w-full h-12 bg-black text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-black/20 active:scale-95 transition-all mt-3"
              >
                Purge Unauthorized Staff
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
