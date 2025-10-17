import React from 'react';
import type { Student, AttendanceStatus } from '../types';
import { AttendanceStatus as StatusEnum } from '../types';
import { HistoryIcon, EditIcon, DeleteIcon } from './Icons';

interface StudentRowProps {
  student: Student;
  status: AttendanceStatus;
  onStatusChange: (studentId: number, status: AttendanceStatus) => void;
  onViewHistory: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (studentId: number) => void;
  isLast: boolean;
}

const StatusRadioButton: React.FC<{
  studentId: number;
  value: StatusEnum;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  colorClasses: string;
}> = ({ studentId, value, label, checked, onChange, colorClasses }) => (
  <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
    <input
      type="radio"
      name={`status-${studentId}`}
      value={value}
      checked={checked}
      onChange={onChange}
      className="hidden peer"
    />
    <span className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${colorClasses}`}>
    </span>
    <span>{label}</span>
  </label>
);

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string, 'aria-label': string }> = ({ onClick, children, className = '', ...props }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
    {...props}
  >
    {children}
  </button>
);


const StudentRow: React.FC<StudentRowProps> = ({ student, status, onStatusChange, onViewHistory, onEdit, onDelete, isLast }) => {
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStatusChange(student.id, e.target.value as AttendanceStatus);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-6 items-center p-4 transition-colors duration-200 hover:bg-gray-50 ${!isLast ? 'border-b border-gray-200' : ''}`}>
      <div className="mb-4 md:mb-0 col-span-1">
        <p className="text-sm text-gray-600 font-medium">{student.rollNumber}</p>
      </div>
    
      <div className="mb-4 md:mb-0 col-span-2">
        <p className="font-semibold text-gray-800">{student.name}</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 col-span-2 mb-4 md:mb-0">
        <StatusRadioButton 
          studentId={student.id}
          value={StatusEnum.PRESENT}
          label="Present"
          checked={status === StatusEnum.PRESENT}
          onChange={handleRadioChange}
          colorClasses="border-green-400 peer-checked:bg-green-500 peer-checked:border-green-500"
        />
        <StatusRadioButton 
          studentId={student.id}
          value={StatusEnum.ABSENT}
          label="Absent"
          checked={status === StatusEnum.ABSENT}
          onChange={handleRadioChange}
          colorClasses="border-red-400 peer-checked:bg-red-500 peer-checked:border-red-500"
        />
      </div>

      <div className="flex justify-start md:justify-end items-center space-x-1">
        <ActionButton onClick={() => onViewHistory(student)} aria-label={`View history for ${student.name}`}>
          <HistoryIcon />
        </ActionButton>
        <ActionButton onClick={() => onEdit(student)} aria-label={`Edit ${student.name}`}>
          <EditIcon />
        </ActionButton>
        <ActionButton onClick={() => onDelete(student.id)} className="hover:bg-red-100 hover:text-red-600" aria-label={`Delete ${student.name}`}>
          <DeleteIcon />
        </ActionButton>
      </div>
    </div>
  );
};

export default StudentRow;