
import React from 'react';
import type { Student, AttendanceHistory, AttendanceStatus } from '../types';
import { AttendanceStatus as StatusEnum } from '../types';

interface StudentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  history: AttendanceHistory;
}

const StatusBadge: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full text-white';
  switch (status) {
    case StatusEnum.PRESENT:
      return <span className={`${baseClasses} bg-green-500`}>Present</span>;
    case StatusEnum.ABSENT:
      return <span className={`${baseClasses} bg-red-500`}>Absent</span>;
    default:
      return <span className={`${baseClasses} bg-gray-400`}>Unmarked</span>;
  }
};

const StudentHistoryModal: React.FC<StudentHistoryModalProps> = ({ isOpen, onClose, student, history }) => {
  if (!isOpen) return null;

  const studentHistory = Object.entries(history)
    .map(([date, records]) => ({
      date,
      status: records[student.id] || StatusEnum.UNMARKED,
    }))
    .filter(record => record.status !== StatusEnum.UNMARKED)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-indigo-700">Attendance History for {student.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {studentHistory.length > 0 ? (
            <ul className="space-y-3">
              {studentHistory.map(({ date, status }) => (
                <li key={date} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-700">{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <StatusBadge status={status} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No attendance records found for this student.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 text-right rounded-b-lg">
           <button 
            onClick={onClose} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentHistoryModal;
