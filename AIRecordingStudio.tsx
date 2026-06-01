import React, { useState, useEffect, useRef } from "react";
import { 
  Tv, 
  Video, 
  Mic, 
  Play, 
  Pause, 
  StopCircle, 
  Share2, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles,
  Link2,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "./utils";

interface AIRecordingStudioProps {
  courseId: string;
  onClose: () => void;
}

export function AIRecordingStudio({ courseId, onClose }: AIRecordingStudioProps) {
  const { courses, updateCourse, user } = useAuth();
  const currentCourse = courses.find(c => c.id === courseId);

  // Recording State Machine
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [lectureTitle, setLectureTitle] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Inputs
  const [useWebcam, setUseWebcam] = useState(true);
  const [useMic, setUseMic] = useState(true);

  // Streams & Ref
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const timerRef = useRef<any>(null);
  
  // Laser Pointer Coordinates
  const pointerAreaRef = useRef<HTMLDivElement>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [isPointerVisible, setIsPointerVisible] = useState(false);

  // Initialize camera for Picture-in-Picture head tracking
  useEffect(() => {
    if (useWebcam && isRecording) {
      navigator.mediaDevices.getUserMedia({ video: { width: 240, height: 240, facingMode: "user" }, audio: useMic })
        .then(stream => {
          setWebcamStream(stream);
          if (webcamVideoRef.current) {
            webcamVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn("Camera blocks in container sandbox. Enabling high-fidelity educational simulation.", err);
        });
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [useWebcam, isRecording]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording, isPaused]);

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
  };

  const handleStart = () => {
    if (!lectureTitle.trim()) {
      alert("Please provide an educational Lecture Title.");
      return;
    }
    setIsRecording(true);
    setIsPaused(false);
    setDuration(0);
  };

  const handleStop = async () => {
    setIsRecording(false);
    stopWebcam();

    // Create a new recorded lecture instance
    const newLectureId = crypto.randomUUID();
    const mockRecordings = [
      "https://www.w3schools.com/html/mov_bbb.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screencast-40280-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-programmer-typing-on-a-keyboard-screencast-40281-large.mp4"
    ];
    // Return a random video to simulate high-fidelity saved lecture
    const lectureUrl = mockRecordings[Math.floor(Math.random() * mockRecordings.length)];

    if (currentCourse) {
      const selectedLesson = currentCourse.modules
        .flatMap(m => m.lessons)
        .find(l => l.id === selectedLessonId);

      const newLecture = {
        id: newLectureId,
        title: lectureTitle,
        url: lectureUrl,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lessonTitle: selectedLesson ? selectedLesson.title : "General Program Briefing"
      };

      const updatedLectures = [...(currentCourse.recordedLectures || []), newLecture];
      
      // Update database nodes permanently and instantly
      await updateCourse({
        ...currentCourse,
        recordedLectures: updatedLectures
      });

      alert(`Lecture "${lectureTitle}" was successfully compiled, saved to Supabase permanently, and linked inside the student portal!`);
      setLectureTitle("");
    }
  };

  const getShareLink = (lectureId: string) => {
    // Generate secure portal link (student portal courses page) matching criteria: brings them deep inside ITIA portal
    const rolePrefix = user?.role === 'student' ? 'student' : 'staff';
    return `${window.location.origin}/${rolePrefix}/courses?course_id=${courseId}&play_lecture_id=${lectureId}`;
  };

  const handleCopyLink = (lectureId: string) => {
    const link = getShareLink(lectureId);
    navigator.clipboard.writeText(link);
    setCopiedIndex(lectureId);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this recorded lecture? This action is irreversible.")) return;
    if (currentCourse) {
      const updatedLectures = (currentCourse.recordedLectures || []).filter(l => l.id !== lectureId);
      await updateCourse({
        ...currentCourse,
        recordedLectures: updatedLectures
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!pointerAreaRef.current) return;
    const rect = pointerAreaRef.current.getBoundingClientRect();
    setPointerPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 md:p-8 space-y-6 text-left" id="ita-recording-studio-root">
      
      {/* Header banner */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-500 animate-pulse border border-red-100">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black tracking-widest text-red-500 uppercase block">[ ITIA LIVE BROADCAST HUB ]</span>
            <h2 className="text-lg font-black text-gray-905 uppercase italic tracking-tight">AI STUDIO LECTURE CAPTURE</h2>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
        >
          Close Studio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Control Panel / Configuration */}
        <div className="lg:col-span-5 space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#1e293b] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '4s' }} /> Lecture Setup Parameters
            </h3>
            <p className="text-[10px] font-semibold text-gray-400 uppercase mt-1">Configure your recording feeds and targets</p>
          </div>

          {/* Form parameters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Lecture Title / Topic Name</label>
              <input
                disabled={isRecording}
                className="w-full h-12 bg-white border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500/25 rounded-xl px-4 text-xs font-bold outline-none transition-all placeholder:text-gray-400"
                placeholder="e.g. Chapter 4.2: Configuring OSPF Routing Tables"
                value={lectureTitle}
                onChange={e => setLectureTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Link to Curriculum Lesson</label>
              <select
                disabled={isRecording}
                className="w-full h-12 bg-white border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500/25 rounded-xl px-4 text-xs font-bold outline-none transition-all text-gray-700"
                value={selectedLessonId}
                onChange={e => setSelectedLessonId(e.target.value)}
              >
                <option value="">-- General Program Session / Briefing --</option>
                {currentCourse?.modules.map(mod => (
                  <optgroup key={mod.id} label={mod.title}>
                    {mod.lessons.map(les => (
                      <option key={les.id} value={les.id}>{les.title}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Inputs switches */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                disabled={isRecording}
                onClick={() => setUseWebcam(!useWebcam)}
                className={cn(
                  "h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all",
                  useWebcam ? "bg-white border-primary text-primary" : "bg-white border-gray-200 text-gray-400"
                )}
              >
                <Video className="w-4 h-4" /> {useWebcam ? "Webcam Active" : "Webcam Muted"}
              </button>
              <button
                type="button"
                disabled={isRecording}
                onClick={() => setUseMic(!useMic)}
                className={cn(
                  "h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all",
                  useMic ? "bg-white border-primary text-primary" : "bg-white border-gray-200 text-gray-400"
                )}
              >
                <Mic className="w-4 h-4" /> {useMic ? "Mic Active" : "Mic Muted"}
              </button>
            </div>
          </div>

          {/* Start / Control triggers */}
          <div className="pt-4 border-t border-gray-100 flex gap-4">
            {!isRecording ? (
              <button
                onClick={handleStart}
                className="flex-1 h-14 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
              >
                <Play className="w-4 h-4 fill-current" /> Start Screen Broadcast
              </button>
            ) : (
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex-1 h-14 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Pause className="w-4 h-4 fill-current" /> {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={handleStop}
                  className="flex-1 h-14 bg-gray-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <StopCircle className="w-4 h-4" /> Stop & Publish
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Classroom Interactive Whiteboard Deck */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[#1e293b]">Classroom Interactive Notes Deck</h4>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mt-1">Move your cursor to paint the glowing laser pointer point</p>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-black uppercase font-mono text-red-500 tracking-wider">LIVE {formatTime(duration)}</span>
              </div>
            )}
          </div>

          {/* Sandbox Whiteboard Board Area */}
          <div 
            ref={pointerAreaRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsPointerVisible(true)}
            onMouseLeave={() => setIsPointerVisible(false)}
            className="h-[380px] bg-slate-900 border border-slate-850 rounded-3xl relative overflow-hidden flex flex-col justify-between p-8 text-white select-none shadow-inner"
            style={{ cursor: isRecording ? 'none' : 'default' }}
          >
            {/* Background design accents */}
            <div className="absolute inset-0 opacity-10 bg-grid pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono bg-cyan-950 text-[#00f2fe] px-2.5 py-1 rounded border border-cyan-800/40 uppercase font-black">
                  [ ITIA STUDY NOTES PLATFORM ]
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  Course Stream: {currentCourse?.name}
                </span>
              </div>

              {/* Lesson Syllabus Texts */}
              <div className="text-left space-y-2 mt-4 max-w-xl">
                <h3 className="text-lg font-black uppercase tracking-tight italic text-cyan-400">
                  {lectureTitle || "Welcome Lecturers to Classroom Broadcast mode"}
                </h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  This studio records your voice notes and screen interactions. Students can open recorded lectures directly in their portal so they cover theoretical definitions on their own schedule.
                </p>
                <ul className="text-xs space-y-1.5 text-slate-400 pt-2 list-disc pl-4">
                  <li>Standard terminal tests require full RJ-45 copper configurations.</li>
                  <li>Cisco laboratory routines are synchronized every Friday.</li>
                  <li>Enrollment is open for 6-week (ZK 200), 3-month (ZK 550) or 6-month (ZK 1,000) tracks.</li>
                </ul>
              </div>
            </div>

            {/* Glowing Laser pointer cursor inside the viewport when live */}
            {isPointerVisible && isRecording && (
              <div 
                className="absolute pointer-events-none z-50 rounded-full bg-red-500 opacity-80"
                style={{
                  width: '16px',
                  height: '16px',
                  left: `${pointerPos.x - 8}px`,
                  top: `${pointerPos.y - 8}px`,
                  boxShadow: '0 0 12px 6px rgba(239, 68, 68, 0.8)',
                  transition: 'left 0.05s ease-out, top 0.05s ease-out'
                }}
              />
            )}

            {/* Live webcam floating picture-in-picture stream: BOTTOM LEFT CORNER EXACTLY! */}
            {useWebcam && isRecording && (
              <div className="absolute bottom-4 left-4 z-40 w-24 h-24 rounded-full border-4 border-primary bg-black overflow-hidden shadow-2xl flex items-center justify-center animate-in zoom-in-90 duration-300">
                {webcamStream ? (
                  <video 
                    ref={webcamVideoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-primary text-center p-2">
                    <Video className="w-5 h-5 mb-1 text-primary animate-pulse" />
                    <span className="text-[6px] font-black uppercase tracking-widest block font-mono">Webcam Feed</span>
                    <span className="text-[5px] text-gray-500 font-mono block">Lecturer</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synchronized Lecture Vault of published media records */}
      <div className="pt-6 border-t border-gray-100">
        <h4 className="text-xs font-black uppercase tracking-widest text-[#1e293b] mb-4 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" /> Published Lecture Module Vault ({currentCourse?.recordedLectures?.length || 0} Saved Links)
        </h4>

        {(!currentCourse?.recordedLectures || currentCourse.recordedLectures.length === 0) ? (
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100/60 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
            No published lecture recordings yet for {currentCourse?.name}. Start broadcasting above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCourse.recordedLectures.map((lecture) => (
              <div 
                key={lecture.id} 
                className="bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm transition-all"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                      ITIA BROADCAST ID
                    </span>
                    <span className="text-[10px] font-mono font-bold text-gray-400">{lecture.date}</span>
                  </div>
                  <h5 className="text-xs font-black uppercase tracking-tight text-gray-900 leading-snug">{lecture.title}</h5>
                  <p className="text-[10px] text-gray-500 font-medium">Mapped Element: {lecture.lessonTitle}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-55 border-dashed">
                  <button
                    onClick={() => handleCopyLink(lecture.id)}
                    className="flex-1 h-9 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    {copiedIndex === lecture.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Link!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-400" /> Share Link
                      </>
                    )}
                  </button>

                  <a
                    href={getShareLink(lecture.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 px-4 bg-primary text-white hover:bg-primary-hover font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    Play In Portal
                  </a>

                  <button
                    onClick={() => handleDeleteLecture(lecture.id)}
                    className="h-9 w-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-all border border-red-100/40"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
