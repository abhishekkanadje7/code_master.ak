
export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: Role;
  batchId?: string; // Only for students
  createdAt: number;
}

export interface Batch {
  id: string;
  name: string;
  description: string;
  studentCount: number;
}

export interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Exam {
  id: string;
  name: string;
  batchId: string;
  durationMinutes: number;
  totalMarks: number;
  startTime: number; // timestamp
  endTime: number; // timestamp
  questions: Question[];
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

export interface Submission {
  id: string;
  examId: string;
  studentId: string;
  answers: number[]; // index of selected option
  score: number;
  startTime: number;
  endTime: number;
  warningsCount: number;
  isAutoSubmitted: boolean;
  status: 'SUBMITTED' | 'TERMINATED';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
