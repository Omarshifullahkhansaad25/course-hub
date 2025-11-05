
import React, { useState, useMemo } from 'react';
import { User, Course, Assignment, Submission } from '../types';
import CourseCard from './CourseCard';
import AssignmentItem from './AssignmentItem';
import Modal from './Modal';
import { SparklesIcon } from './icons/SparklesIcon';
import { getAIAssistance } from '../services/geminiService';
import Spinner from './Spinner';
import { HistoryIcon } from './icons/HistoryIcon';

interface StudentDashboardProps {
  student: User;
  courses: Course[];
  assignments: Assignment[];
  submissions: Submission[];
  onAddSubmission: (submission: Omit<Submission, 'id'>) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, courses, assignments, submissions, onAddSubmission }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [aiTutorQuery, setAiTutorQuery] = useState('');
  const [aiTutorResponse, setAiTutorResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);
  const assignmentMap = useMemo(() => new Map(assignments.map(a => [a.id, a])), [assignments]);
  
  const studentSubmissions = useMemo(() => {
    return submissions
      .filter(s => s.studentId === student.id)
      .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
  }, [submissions, student.id]);

  const courseAssignments = useMemo(() => {
    if (!selectedCourse) return [];
    return assignments.filter(a => a.courseId === selectedCourse.id);
  }, [selectedCourse, assignments]);

  const getSubmissionStatus = (assignmentId: string) => {
    return submissions.find(s => s.assignmentId === assignmentId && s.studentId === student.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssignment && submissionContent) {
      onAddSubmission({
        assignmentId: selectedAssignment.id,
        studentId: student.id,
        content: submissionContent,
        submittedDate: new Date().toISOString().split('T')[0],
      });
      setSubmissionContent('');
      setSelectedAssignment(null);
    }
  };

  const handleAiTutorSubmit = async () => {
    if (!aiTutorQuery) return;
    setIsAiLoading(true);
    setAiTutorResponse('');
    const prompt = `I am a student working on an assignment titled "${selectedAssignment?.title}". The description is: "${selectedAssignment?.description}". Please help me understand the following topic or question: ${aiTutorQuery}. Provide a clear explanation suitable for a university student.`;
    const response = await getAIAssistance(prompt);
    setAiTutorResponse(response);
    setIsAiLoading(false);
  };
  
  const openTutorModal = () => {
    setIsTutorModalOpen(true);
    setAiTutorQuery('');
    setAiTutorResponse('');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            title="View Submission History"
          >
            <HistoryIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course}
              isSelected={selectedCourse?.id === course.id}
              onClick={() => setSelectedCourse(course)}
            />
          ))}
        </div>
      </div>
      <div className="lg:col-span-2">
        {selectedCourse ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Assignments for {selectedCourse.title}</h2>
            <p className="text-gray-500 mb-6">{selectedCourse.code}</p>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <ul className="divide-y divide-gray-200">
                {courseAssignments.length > 0 ? courseAssignments.map(assignment => (
                  <AssignmentItem 
                    key={assignment.id}
                    assignment={assignment}
                    submission={getSubmissionStatus(assignment.id)}
                    onClick={() => setSelectedAssignment(assignment)}
                    role="student"
                  />
                )) : <p className="text-gray-500 text-center py-4">No assignments for this course yet.</p>}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-md">
             <p className="text-xl text-gray-500">Select a course to view assignments.</p>
          </div>
        )}
      </div>

      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={selectedAssignment.title}
        >
          <div className="space-y-4">
            <p className="text-gray-600">{selectedAssignment.description}</p>
            <p className="text-sm text-gray-500">Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}</p>
            <hr />
            {getSubmissionStatus(selectedAssignment.id) ? (
              <div>
                <h4 className="font-semibold text-lg mb-2">My Submission</h4>
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-gray-700 whitespace-pre-wrap">{getSubmissionStatus(selectedAssignment.id)?.content}</p>
                  <p className="text-xs text-gray-500 mt-2">Submitted on: {new Date(getSubmissionStatus(selectedAssignment.id)!.submittedDate).toLocaleDateString()}</p>
                </div>
                {getSubmissionStatus(selectedAssignment.id)?.grade && (
                  <div className="mt-4 bg-brand-light p-4 rounded-md border border-brand-blue/30">
                     <h4 className="font-semibold text-lg mb-2 text-brand-blue">Feedback</h4>
                     <p className="font-bold text-2xl text-brand-blue mb-2">Grade: {getSubmissionStatus(selectedAssignment.id)?.grade}</p>
                     <p className="text-gray-800">{getSubmissionStatus(selectedAssignment.id)?.feedback}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label htmlFor="submission" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Assignment
                </label>
                <textarea
                  id="submission"
                  rows={8}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Write your assignment here..."
                ></textarea>
                <div className="mt-4 flex justify-between items-center">
                   <button
                    type="button"
                    onClick={openTutorModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brand-blue bg-brand-light hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                  >
                    <SparklesIcon className="mr-2 h-5 w-5" />
                    Ask AI Tutor
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                  >
                    Submit Assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}

      {isTutorModalOpen && (
        <Modal isOpen={isTutorModalOpen} onClose={() => setIsTutorModalOpen(false)} title="AI Tutor">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Assignment: <span className="font-semibold">{selectedAssignment?.title}</span></p>
                <div>
                    <label htmlFor="ai-query" className="block text-sm font-medium text-gray-700 mb-1">
                        What do you need help with?
                    </label>
                    <textarea
                        id="ai-query"
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
                        value={aiTutorQuery}
                        onChange={(e) => setAiTutorQuery(e.target.value)}
                        placeholder="e.g., Explain the difference between Merge Sort and Quick Sort"
                    ></textarea>
                </div>
                <button
                    onClick={handleAiTutorSubmit}
                    disabled={isAiLoading}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-gray-400"
                >
                    {isAiLoading ? <Spinner /> : <SparklesIcon className="mr-2 h-5 w-5" />}
                    Get Help
                </button>
                {aiTutorResponse && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-md max-h-64 overflow-y-auto">
                        <p className="text-gray-800 whitespace-pre-wrap">{aiTutorResponse}</p>
                    </div>
                )}
            </div>
        </Modal>
      )}

      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="My Submission History">
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
          {studentSubmissions.length > 0 ? (
            studentSubmissions.map(submission => {
              const assignment = assignmentMap.get(submission.assignmentId);
              const course = assignment ? courseMap.get(assignment.courseId) : undefined;
              return (
                <div key={submission.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{assignment?.title || 'Unknown Assignment'}</h4>
                      <p className="text-sm text-gray-500">{course?.code} - {course?.title || 'Unknown Course'}</p>
                      <p className="text-xs text-gray-400 mt-1">Submitted on: {new Date(submission.submittedDate).toLocaleDateString()}</p>
                    </div>
                    {submission.grade && (
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-base text-brand-blue">Grade</span>
                        <p className="font-bold text-2xl text-brand-blue">{submission.grade}</p>
                      </div>
                    )}
                  </div>
                  {submission.feedback && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="font-semibold text-gray-700 text-sm">Feedback:</p>
                      <p className="text-sm text-gray-600 italic mt-1">"{submission.feedback}"</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>You haven't made any submissions yet.</p>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default StudentDashboard;
