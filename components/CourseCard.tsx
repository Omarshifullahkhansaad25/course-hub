
import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white rounded-lg shadow-sm cursor-pointer transition-all duration-200 border-2 ${
        isSelected ? 'border-brand-blue shadow-lg scale-105' : 'border-transparent hover:shadow-md hover:border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className={`font-bold text-lg ${isSelected ? 'text-brand-blue' : 'text-gray-800'}`}>{course.title}</p>
          <p className="text-sm text-gray-500">{course.code}</p>
        </div>
        <span className="text-xs font-semibold bg-brand-light text-brand-blue px-2 py-1 rounded-full">
            {course.credits} Credits
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2">{course.description}</p>
      <p className="text-xs text-gray-400 mt-4">Instructor: {course.teacherName}</p>
    </div>
  );
};

export default CourseCard;
   