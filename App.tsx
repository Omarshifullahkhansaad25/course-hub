
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import Login from './components/Login';
import Chatbot from './components/Chatbot';
import { Role, User, Course, Assignment, Submission } from './types';
import { STUDENT_DATA, TEACHER_DATA, INITIAL_COURSES, INITIAL_ASSIGNMENTS, INITIAL_SUBMISSIONS } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>('student');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);

  const currentUser: User | null = useMemo(() => {
    if (!isAuthenticated) return null;
    return role === 'student' ? STUDENT_DATA : TEACHER_DATA;
  }, [role, isAuthenticated]);

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleAddAssignment = (newAssignment: Omit<Assignment, 'id'>) => {
    setAssignments(prev => [...prev, { ...newAssignment, id: `asg-${Date.now()}` }]);
  };

  const handleAddSubmission = (newSubmission: Omit<Submission, 'id'>) => {
    setSubmissions(prev => [...prev, { ...newSubmission, id: `sub-${Date.now()}` }]);
  };

  const handleGradeSubmission = (submissionId: string, grade: string, feedback: string) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId ? { ...sub, grade, feedback } : sub
    ));
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (!currentUser) {
    // This is a safeguard and should ideally not be reached if authenticated.
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header user={currentUser} role={role} setRole={setRole} onLogout={handleLogout} />
      <main className="p-4 sm:p-6 lg:p-8">
        {role === 'student' ? (
          <StudentDashboard 
            student={STUDENT_DATA}
            courses={courses}
            assignments={assignments}
            submissions={submissions}
            onAddSubmission={handleAddSubmission}
          />
        ) : (
          <TeacherDashboard
            teacher={TEACHER_DATA}
            courses={courses.filter(c => c.teacherId === TEACHER_DATA.id)}
            assignments={assignments}
            submissions={submissions}
            onAddAssignment={handleAddAssignment}
            onGradeSubmission={handleGradeSubmission}
          />
        )}
      </main>
      <Chatbot />
    </div>
  );
};

export default App;
