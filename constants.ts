
import { User, Course, Assignment, Submission } from './types';

export const STUDENT_DATA: User = {
  id: '20232051010',
  name: 'Omar Shifullah Khan Saad',
  role: 'student',
  details: 'CSE, 3rd Year',
};

export const TEACHER_DATA: User = {
  id: 'prof-001',
  name: 'Dr. Eleanor Vance',
  role: 'teacher',
  details: 'Professor, CSE Department',
};

export const INITIAL_COURSES: Course[] = [
  { id: 'cse301', code: 'CSE 301', title: 'Data Structures & Algorithms', description: 'Advanced concepts in data structures and algorithm analysis.', teacherId: 'prof-001', teacherName: 'Dr. Eleanor Vance', credits: 3 },
  { id: 'cse302', code: 'CSE 302', title: 'Database Management Systems', description: 'Fundamentals of database design and SQL.', teacherId: 'prof-001', teacherName: 'Dr. Eleanor Vance', credits: 3 },
  { id: 'cse303', code: 'CSE 303', title: 'Operating Systems', description: 'Core concepts of modern operating systems.', teacherId: 'prof-001', teacherName: 'Dr. Eleanor Vance', credits: 3 },
  { id: 'cse304', code: 'CSE 304', title: 'Computer Networks', description: 'Principles of computer networking and protocols.', teacherId: 'prof-001', teacherName: 'Dr. Eleanor Vance', credits: 3 },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: 'asg-001', courseId: 'cse301', title: 'Assignment 1: Sorting Algorithms', description: 'Implement and compare Bubble Sort, Merge Sort, and Quick Sort.', dueDate: '2024-08-15' },
  { id: 'asg-002', courseId: 'cse301', title: 'Assignment 2: Graph Traversal', description: 'Implement BFS and DFS on a given graph dataset.', dueDate: '2024-09-01' },
  { id: 'asg-003', courseId: 'cse302', title: 'Project Part 1: ER Diagram', description: 'Design an Entity-Relationship diagram for a university management system.', dueDate: '2024-08-20' },
];

export const INITIAL_SUBMISSIONS: Submission[] = [
    { id: 'sub-001', assignmentId: 'asg-001', studentId: '20232051010', content: 'Here is my implementation of the sorting algorithms.', submittedDate: '2024-08-14', grade: 'A', feedback: 'Excellent work! Your analysis of time complexity was very thorough.' }
];
   