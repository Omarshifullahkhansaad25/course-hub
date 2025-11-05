import React, { useState, useMemo } from 'react';
import { User, Course, Assignment, Submission } from '../types';
import CourseCard from './CourseCard';
import Modal from './Modal';
import { SparklesIcon } from './icons/SparklesIcon';
import { getAIAssistance } from '../services/geminiService';
import Spinner from './Spinner';
import { SearchIcon } from './icons/SearchIcon';

interface TeacherDashboardProps {
  teacher: User;
  courses: Course[];
  assignments: Assignment[];
  submissions: Submission[];
  onAddAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  onGradeSubmission: (submissionId: string, grade: string, feedback: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacher, courses, assignments, submissions, onAddAssignment, onGradeSubmission }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);

  const assignmentsToDisplay = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();

    if (lowercasedQuery) {
      const teacherCourseIds = new Set(courses.map(c => c.id));
      return assignments.filter(assignment => {
        if (!teacherCourseIds.has(assignment.courseId)) return false;

        const course = courseMap.get(assignment.courseId);
        const titleMatch = assignment.title.toLowerCase().includes(lowercasedQuery);
        const courseCodeMatch = course ? course.code.toLowerCase().includes(lowercasedQuery) : false;
        
        return titleMatch || courseCodeMatch;
      });
    }
    
    if (selectedCourse) {
      return assignments.filter(a => a.courseId === selectedCourse.id);
    }
    
    return [];
  }, [searchQuery, selectedCourse, assignments, courses, courseMap]);


  const getSubmissionsForAssignment = (assignmentId: string) => {
    return submissions.filter(s => s.assignmentId === assignmentId);
  };
  
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourse && newAssignment.title && newAssignment.description && newAssignment.dueDate) {
      onAddAssignment({
        courseId: selectedCourse.id,
        ...newAssignment,
      });
      setNewAssignment({ title: '', description: '', dueDate: '' });
      setIsCreateModalOpen(false);
    }
  };

  const handleAiAssistantSubmit = async () => {
    if (!aiTopic || !selectedCourse) return;
    setIsAiLoading(true);
    setAiResponse('');
    const prompt = `As a university professor for the course "${selectedCourse.title}", generate 3 creative assignment ideas related to the topic: "${aiTopic}". For each idea, provide a title and a brief description. Format the output clearly.`;
    const response = await getAIAssistance(prompt);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(selectedSubmission && grade && feedback) {
          onGradeSubmission(selectedSubmission.id, grade, feedback);
          setSelectedSubmission(null);
          setGrade('');
          setFeedback('');
      }
  }

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setSearchQuery('');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Courses</h2>
        <div className="space-y-4">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course}
              isSelected={selectedCourse?.id === course.id && !searchQuery}
              onClick={() => handleSelectCourse(course)}
            />
          ))}
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="mb-6">
            <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="search"
                    name="search"
                    id="search"
                    className="focus:ring-brand-blue focus:border-brand-blue block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                    placeholder="Search assignments by title or course code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {searchQuery ? (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">Search Results</h2>
                        <p className="text-gray-500">Found {assignmentsToDisplay.length} matching assignment(s)</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {assignmentsToDisplay.length > 0 ? assignmentsToDisplay.map(assignment => (
                        <div key={assignment.id} className="mb-6 border-b pb-4 last:pb-0 last:mb-0 last:border-0">
                          <h4 className="font-bold text-lg text-gray-800">
                            {assignment.title}
                            <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {courseMap.get(assignment.courseId)?.code}
                            </span>
                          </h4>
                          <p className="text-sm text-gray-500 mb-2">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                          <ul className="pl-4">
                            {getSubmissionsForAssignment(assignment.id).map(sub => (
                              <li key={sub.id} className="flex justify-between items-center py-2">
                                <span className="text-gray-700">Submission from student {sub.studentId}</span>
                                <button onClick={() => setSelectedSubmission(sub)} className={`px-3 py-1 text-xs font-semibold rounded-full ${sub.grade ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {sub.grade ? 'Graded' : 'Needs Grading'}
                                </button>
                              </li>
                            ))}
                            {getSubmissionsForAssignment(assignment.id).length === 0 && <p className="text-sm text-gray-400 italic">No submissions yet.</p>}
                          </ul>
                        </div>
                    )) : <p className="text-gray-500 text-center py-4">No assignments found for "{searchQuery}".</p>}
                </div>
            </div>
        ) : selectedCourse ? (
          <div>
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Dashboard for {selectedCourse.title}</h2>
                    <p className="text-gray-500">{selectedCourse.code}</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                >
                    + Create Assignment
                </button>
             </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Assignments & Submissions</h3>
              {assignmentsToDisplay.length > 0 ? assignmentsToDisplay.map(assignment => (
                <div key={assignment.id} className="mb-6 border-b pb-4 last:pb-0 last:mb-0 last:border-0">
                  <h4 className="font-bold text-lg text-gray-800">{assignment.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                  <ul className="pl-4">
                    {getSubmissionsForAssignment(assignment.id).map(sub => (
                      <li key={sub.id} className="flex justify-between items-center py-2">
                        <span className="text-gray-700">Submission from student {sub.studentId}</span>
                        <button onClick={() => setSelectedSubmission(sub)} className={`px-3 py-1 text-xs font-semibold rounded-full ${sub.grade ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {sub.grade ? 'Graded' : 'Needs Grading'}
                        </button>
                      </li>
                    ))}
                    {getSubmissionsForAssignment(assignment.id).length === 0 && <p className="text-sm text-gray-400 italic">No submissions yet.</p>}
                  </ul>
                </div>
              )) : <p className="text-gray-500 text-center py-4">No assignments created for this course yet.</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-md">
             <p className="text-xl text-gray-500">Select a course to manage.</p>
          </div>
        )}
      </div>

       <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Assignment">
          <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                  <input type="text" id="title" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" required/>
              </div>
              <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea id="description" rows={4} value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" required></textarea>
              </div>
               <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input type="date" id="dueDate" value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" required/>
              </div>
              <div className="mt-4 flex justify-between items-center">
                   <button
                    type="button"
                    onClick={() => setIsAiAssistantOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brand-blue bg-brand-light hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                  >
                    <SparklesIcon className="mr-2 h-5 w-5" />
                    AI Assistant
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                  >
                    Create Assignment
                  </button>
                </div>
          </form>
      </Modal>

        <Modal isOpen={isAiAssistantOpen} onClose={() => setIsAiAssistantOpen(false)} title="AI Assistant">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Course: <span className="font-semibold">{selectedCourse?.title}</span></p>
                <div>
                    <label htmlFor="ai-topic" className="block text-sm font-medium text-gray-700 mb-1">
                        Topic for Assignment Ideas
                    </label>
                    <input type="text" id="ai-topic" value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" placeholder="e.g., Binary Search Trees"/>
                </div>
                <button
                    onClick={handleAiAssistantSubmit}
                    disabled={isAiLoading}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-gray-400"
                >
                    {isAiLoading ? <Spinner /> : <SparklesIcon className="mr-2 h-5 w-5" />}
                    Generate Ideas
                </button>
                {aiResponse && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-md max-h-64 overflow-y-auto">
                        <p className="text-gray-800 whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                )}
            </div>
        </Modal>

        <Modal isOpen={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} title={`Grade Submission for Student ${selectedSubmission?.studentId}`}>
            <div className="space-y-4">
                <h4 className="font-semibold text-lg">Submission Content</h4>
                <div className="bg-gray-100 p-4 rounded-md max-h-48 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission?.content}</p>
                </div>
                <form onSubmit={handleGradeSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade (e.g., A, B+, 85%)</label>
                        <input type="text" id="grade" value={grade} onChange={e => setGrade(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" required/>
                    </div>
                    <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">Feedback</label>
                        <textarea id="feedback" rows={4} value={feedback} onChange={e => setFeedback(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" required></textarea>
                    </div>
                    <div className="flex justify-end">
                         <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                        >
                            Submit Grade
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    </div>
  );
};

export default TeacherDashboard;