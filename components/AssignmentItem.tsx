
import React from 'react';
import { Assignment, Submission, Role } from '../types';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface AssignmentItemProps {
  assignment: Assignment;
  submission?: Submission;
  onClick: () => void;
  role: Role;
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment, submission, onClick, role }) => {
  const isPastDue = new Date(assignment.dueDate) < new Date();
  
  const getStatus = () => {
    if (submission) {
      if (submission.grade) {
        return { text: 'Graded', color: 'green', Icon: CheckCircleIcon };
      }
      return { text: 'Submitted', color: 'blue', Icon: CheckCircleIcon };
    }
    if (isPastDue) {
      return { text: 'Past Due', color: 'red', Icon: XCircleIcon };
    }
    return { text: 'Not Submitted', color: 'yellow', Icon: ClipboardListIcon };
  };

  const status = getStatus();

  return (
    <li className="py-4 flex items-center justify-between hover:bg-gray-50 rounded-md -mx-2 px-2 transition-colors duration-200">
      <div className="flex items-center space-x-4">
        <status.Icon className={`h-8 w-8 text-${status.color}-500 flex-shrink-0`} />
        <div>
          <p className="text-md font-semibold text-gray-900">{assignment.title}</p>
          <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
         <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-${status.color}-100 text-${status.color}-800`}>
          {status.text}
        </span>
        <button
          onClick={onClick}
          className="text-sm font-semibold text-brand-blue hover:underline"
        >
          View
        </button>
      </div>
    </li>
  );
};

export default AssignmentItem;
   