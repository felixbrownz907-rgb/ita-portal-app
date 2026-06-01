import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trophy, 
  ArrowLeft,
  BrainCircuit,
  Timer,
  Info,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MockExam, Question } from '../context/types';
import { cn } from '../components/utils';

export function MockExams() {
  const { user, courses, mockExams, mockExamResults, submitMockExam, gradeMockExamWithAI } = useAuth();
  const [selectedExam, setSelectedExam] = useState<MockExam | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingResultId, setViewingResultId] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const studentCourse = courses.find(c => c.id === user?.studentData?.courseId);
  const filteredExams = mockExams.filter(e => e.courseId === user?.studentData?.courseId);
  const studentResults = mockExamResults.filter(r => r.studentId === user?.studentData?.studentId);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, timeLeft]);

  const handleStartExam = (exam: MockExam) => {
    setSelectedExam(exam);
    setIsStarted(true);
    setTimeLeft(exam.duration * 60);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (selectedExam?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!selectedExam) return;
    setIsSubmitting(true);
    
    const submittedAnswers = selectedExam.questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] || ''
    }));

    try {
      const resultId = await submitMockExam(selectedExam.id, submittedAnswers);
      setIsStarted(false);
      setSelectedExam(null);
      setViewingResultId(resultId);
      
      // AI grading is triggered automatically in AuthContext.submitMockExam
    } catch (e) {
      console.error("Submission failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const viewingResult = mockExamResults.find(r => r.id === viewingResultId);
  const relatedExam = viewingResult ? mockExams.find(e => e.id === viewingResult.examId) : null;

  if (viewingResult && relatedExam) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setViewingResultId(null)}
          className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[40px] p-8 md:p-12 border-4 border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">{relatedExam.title}</h2>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Performance Analysis</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Completed</p>
                  <p className="font-mono text-xs text-gray-900">{new Date(viewingResult.completedAt).toLocaleString()}</p>
                </div>
                <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center border-4",
                  viewingResult.isAiGraded ? "bg-green-50 border-green-500 text-green-600" : "bg-gray-50 border-gray-200 text-gray-400"
                )}>
                  {viewingResult.isAiGraded ? <Trophy className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-[30px] p-6 border-2 border-gray-100">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black italic text-primary">
                    {viewingResult.isAiGraded ? viewingResult.score : '--'}
                  </span>
                  <span className="text-xl font-bold text-gray-300">/ {viewingResult.maxScore}</span>
                </div>
              </div>
              <div className="md:col-span-2 bg-gray-50 rounded-[30px] p-6 border-2 border-gray-100">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    viewingResult.isAiGraded ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  )}>
                    {viewingResult.isAiGraded ? 'Graded by AI' : 'Grading in Progress'}
                  </div>
                  {!viewingResult.isAiGraded && (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Timer className="w-4 h-4 text-yellow-500" />
                    </motion.div>
                  )}
                </div>
                {viewingResult.isAiGraded && (
                  <p className="mt-3 text-xs font-medium text-gray-600 leading-relaxed italic">
                    {viewingResult.feedback}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 border-b-2 border-gray-50 pb-4">Detailed View</h3>
              <div className="space-y-4 text-left">
                {relatedExam.questions.map((q, idx) => {
                  const studentAnswer = viewingResult.answers.find(a => a.questionId === q.id)?.answer;
                  return (
                    <div key={q.id} className="bg-white rounded-3xl p-6 border-2 border-gray-100 space-y-4">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-black text-gray-500">
                          {idx + 1}
                        </span>
                        <div className="space-y-4 w-full">
                          <p className="text-sm font-bold text-gray-900 leading-relaxed">{q.text}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Your Input</p>
                              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs font-medium text-gray-600">
                                {q.type === 'multiple-choice' ? (q.options?.[parseInt(studentAnswer || '-1')] || 'No answer') : (studentAnswer || 'No answer')}
                              </div>
                            </div>
                            {q.type === 'multiple-choice' && (
                              <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest text-green-500">Correct Answer</p>
                                <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-xs font-bold text-green-700">
                                  {q.options?.[parseInt(q.correctAnswer || '0')]}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isStarted && selectedExam) {
    const currentQuestion = selectedExam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedExam.questions.length) * 100;

    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col pt-[3.8rem]">
        <div className="h-2 bg-gray-100">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">{selectedExam.title}</h3>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Mock Session Active</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Time Remaining</p>
                  <div className={cn(
                    "flex items-center gap-2 font-mono text-2xl font-black italic",
                    timeLeft < 60 ? "text-red-500 animate-pulse" : "text-primary"
                  )}>
                    <Timer className="w-6 h-6" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm("Abort exam? Progress will be lost.")) {
                      setIsStarted(false);
                      setSelectedExam(null);
                    }
                  }}
                  className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 md:p-12 border-4 border-gray-50 shadow-sm space-y-10">
              <div className="flex items-center gap-4 text-left">
                <span className="w-12 h-12 bg-primary text-secondary rounded-2xl flex items-center justify-center text-xl font-black italic">
                  {currentQuestionIndex + 1}
                </span>
                <div>
                   {currentQuestion.type === 'multiple-choice' ? (
                     <span className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> Select Correct Option
                     </span>
                   ) : (
                     <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-1">
                       <FileText className="w-3 h-3" /> Provide Text Response
                     </span>
                   )}
                   <p className="text-xl font-bold text-gray-900 mt-1">{currentQuestion.text}</p>
                </div>
              </div>

              <div className="space-y-4">
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion.id, idx.toString())}
                    className={cn(
                      "w-full p-6 bg-gray-50 rounded-3xl border-2 transition-all flex items-center gap-4 group",
                      answers[currentQuestion.id] === idx.toString() 
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                        : "border-transparent hover:border-gray-200"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-colors",
                      answers[currentQuestion.id] === idx.toString() ? "bg-primary text-secondary" : "bg-white text-gray-400 group-hover:text-primary"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={cn(
                      "text-sm font-bold transition-colors",
                      answers[currentQuestion.id] === idx.toString() ? "text-primary" : "text-gray-600"
                    )}>{option}</span>
                  </button>
                ))}

                {(currentQuestion.type === 'essay' || currentQuestion.type === 'short-answer') && (
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full h-64 bg-gray-50 rounded-[30px] p-8 border-2 border-transparent focus:border-primary focus:bg-primary/5 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-800 font-medium leading-relaxed"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-8 border-t-2 border-gray-50">
                <button 
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="px-8 py-3 rounded-2xl bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>
                {currentQuestionIndex === (selectedExam?.questions.length || 0) - 1 ? (
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-12 py-4 bg-primary text-secondary rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-sm font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    {isSubmitting ? 'Finalizing...' : 'Submit Exam'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={handleNext}
                    className="px-12 py-4 bg-primary text-secondary rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-sm font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    Next Question
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-gray-50 pb-8">
        <div className="text-left">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Mock Assessment</h1>
          <p className="mt-4 text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Experimental Knowledge Validation Protocols</p>
        </div>
        <div className="bg-primary/5 px-6 py-4 rounded-[30px] border-2 border-primary/10 flex items-center gap-4">
           <BrainCircuit className="w-10 h-10 text-primary" />
           <div className="text-left">
             <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">AI Integrated</p>
             <p className="text-xs font-bold text-gray-500 italic">Gemini-Marked Grading Engines</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Available Nodes</h2>
            <div className="h-[2px] flex-1 bg-gray-100" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredExams.length > 0 ? filteredExams.map((exam, idx) => (
              <motion.div 
                key={exam.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[35px] p-8 border-4 border-gray-50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FileText className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                </div>
                
                <div className="relative z-10 flex flex-col gap-6 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-full">
                        {exam.duration} Min Session
                      </span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 group-hover:text-primary transition-colors">{exam.title}</h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{exam.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-lg bg-gray-100 border-2 border-white" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Students</span>
                    </div>
                    <button 
                      onClick={() => handleStartExam(exam)}
                      className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-secondary shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      Start Node <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="bg-gray-50 rounded-[40px] p-12 text-center border-4 border-dashed border-gray-200">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-black uppercase italic text-gray-400 tracking-tighter">No Active Exams</h4>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mt-2 px-10">
                  There are no mock exams currently provisioned for {studentCourse?.name || 'your curriculum'}.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Historical Archives</h2>
            <div className="h-[2px] flex-1 bg-gray-100" />
          </div>

          <div className="space-y-4">
            {studentResults.length > 0 ? studentResults.map((result, idx) => {
              const exam = mockExams.find(e => e.id === result.examId);
              return (
                <motion.div 
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[30px] p-6 border-2 border-gray-100 hover:border-primary/30 transition-all flex items-center justify-between gap-6 group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border-2",
                      result.isAiGraded ? "bg-green-50 border-green-200 text-green-500" : "bg-gray-50 border-gray-100 text-gray-300"
                    )}>
                      {result.isAiGraded ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-gray-900 leading-none mb-1">{exam?.title || 'Unknown Exam'}</h4>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                          Score: {result.isAiGraded ? `${result.score}/${result.maxScore}` : 'Grading...'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setViewingResultId(result.id)}
                    className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-primary hover:text-secondary group-hover:scale-110 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              );
            }) : (
              <div className="bg-gray-50 rounded-[30px] p-10 border-2 border-dashed border-gray-200 text-center">
                <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">Archival records empty</p>
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-[40px] p-10 text-secondary relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:w-48 group-hover:h-48 transition-all" />
            <div className="relative z-10 flex items-center gap-6 text-left">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[20px] flex items-center justify-center border border-white/20">
                <Info className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black uppercase italic tracking-tighter">Academic Integrity</h4>
                <p className="text-xs text-secondary/60 font-medium max-w-xs">
                  Mock examinations are for skill validation only. Official certifications require presence at designated physical nodes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
