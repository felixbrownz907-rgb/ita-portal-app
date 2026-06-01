export type UserRole = 'admin' | 'staff' | 'instructor' | 'student';

export interface OnlineClass {
  id: string;
  courseId: string;
  title: string;
  instructorId: string;
  startTime: string;
  duration: number; // in minutes
  platform: 'google-meet' | 'zoom' | 'whatsapp' | 'other';
  meetingLink: string;
  status: 'scheduled' | 'live' | 'completed';
}

export interface User {
  username: string;
  email?: string;
  role: UserRole;
  isNetacadLinked?: boolean;
  studentData?: Student; // For student portal synergy
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
  externalLinks?: { title: string, url: string }[];
  order: number;
  isCompleted?: boolean;
}

export interface LabTask {
  id: string;
  title: string;
  description: string;
  steps: { id: string; text: string; isCompleted: boolean }[];
  courseId: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'pending' | 'completed';
  type?: 'crimping' | 'terminal' | 'circuit' | 'general' | 'cisco';
  scenario?: string;
  objectives?: string[];
  tools?: string[];
  procedure?: string[];
  reportTemplate?: string;
  reportNotes?: string;
  findings?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  type: 'Book' | 'Past Paper' | 'Reference' | 'Note' | 'Audio' | 'Video' | 'Link' | 'Practical' | 'Doc';
  courseId?: string;
  fileUrl: string;
  category: string;
  isBookmarked?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  details: string;
  category?: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
  description: string;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  videoUrl?: string;
  modules: Module[];
  price?: string;
  programNotes?: { id: string; title: string; url: string }[];
  recordedLectures?: { id: string; title: string; url: string; date?: string; lessonTitle?: string }[];
}

export interface Intake {
  id: string;
  name: string;
  startDate: string;
}

export interface Student {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  nrc: string;
  courseId: string;
  intakeId: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Pending';
  progress: number; // Course completion %
  attendanceProgress: number; // 0-100
  labProgress: number; // 0-100
  paymentHistory: Payment[];
  currentModuleId?: string;
  currentTrack?: string;
  paymentStatus: 'Cleared' | 'Pending Approval' | 'Outstanding';
  admissionYear: number;
  password?: string; // Auto-generated 6-digit PIN
  selectedDuration?: string;
  enrollmentDate?: string;
  role?: UserRole;
}

export interface Exam {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  dueDate: string;
  type: 'assignment' | 'test';
  maxMark: number;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  type: 'assignment' | 'test';
  title: string;
  moduleId: string;
  fileUrl: string;
  fileType: 'pdf' | 'image';
  submittedAt: string;
  status: 'pending' | 'marked' | 'ai_marked';
  grade?: string;
  feedback?: string;
  aiGrade?: string;
  aiFeedback?: string;
  email?: string;
  isAiMarked?: boolean;
  program?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amountPaid: number;
  balance: number;
  paymentDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  evidenceUrl?: string;
  transactionId?: string;
  accountNumber?: string;
}

export interface MentorBooking {
  id: string;
  studentId: string;
  studentName: string;
  bookingDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  preferredTime?: string;
  transactionId?: string;
}

export interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  timestamp: string;
  faculty?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'course-specific';
  courseId?: string;
  date: string;
}

export interface Lecturer {
  id: string;
  name: string;
  userId?: string;
  courseName?: string;
}

export interface Meeting {
  id: string;
  hostId: string;
  title: string;
  status: 'active' | 'ended';
  roomId: string;
  startedAt: string;
  endedAt?: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  author?: string;
  description?: string;
  type: 'pdf' | 'doc' | 'link' | 'video' | 'audio' | 'book';
  url: string;
  moduleId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer?: string; // For MCQ index or short answer keywords
}

export interface MockExam {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
}

export interface MockExamResult {
  id: string;
  studentId: string;
  examId: string;
  answers: { questionId: string; answer: string }[];
  score?: number;
  maxScore: number;
  feedback?: string;
  completedAt: string;
  isAiGraded: boolean;
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  lecturerId: string;
  day: string;
  sessionTime: string;
  notes?: string;
  audioUrl?: string;
  pdfUrl?: string;
  wpsLink?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  classTitle: string;
  date: string;
  checkInTime: string;
  status: 'present' | 'absent' | 'late' | 'duty';
  program: string;
  duration: string;
  sessionTime: string;
  courseId?: string;
  courseName?: string;
}

export interface AIMessage {
  role: 'user' | 'model';
  content: string;
}
