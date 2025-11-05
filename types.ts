
export type Role = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  role: Role;
  details?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  credits: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedDate: string;
  grade?: string;
  feedback?: string;
}
   