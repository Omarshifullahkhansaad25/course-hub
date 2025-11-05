
import React from 'react';
import { Role } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UserIcon } from './icons/UserIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';

interface LoginProps {
  onLogin: (role: Role) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-brand-blue flex flex-col justify-center items-center p-4">
      <div className="text-center text-white mb-12">
        <BookOpenIcon className="h-16 w-16 mx-auto text-brand-secondary" />
        <h1 className="text-4xl font-bold mt-4">North Western University</h1>
        <p className="text-xl text-blue-200">Course Hub</p>
      </div>
      
      <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Log in as...</h2>
        <div className="space-y-6">
          <button
            onClick={() => onLogin('student')}
            className="w-full flex items-center justify-center bg-brand-blue text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
          >
            <UserIcon className="h-6 w-6 mr-3" />
            <span className="text-lg font-semibold">Student</span>
          </button>
          <button
            onClick={() => onLogin('teacher')}
            className="w-full flex items-center justify-center bg-gray-700 text-white py-3 px-4 rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
          >
            <AcademicCapIcon className="h-6 w-6 mr-3" />
            <span className="text-lg font-semibold">Teacher</span>
          </button>
        </div>
      </div>
       <footer className="text-center mt-10 text-blue-300 text-sm">
        <p>&copy; {new Date().getFullYear()} North Western University. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
