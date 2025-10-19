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
  isSelected: boolean;
  onSelect: (studentId: number, checked: boolean) => void;
}

const StatusRadioButton: React.FC<{
  studentId: number;
  value: StatusEnum;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ studentId, value, label, checked, onChange }) => {
  // Determine border and background colors based on checked state and value
  const getBorderClass = () => {
    if (value === StatusEnum.PRESENT) {
      return checked ? 'border-green-500 bg-green-500' : 'border-green-400 bg-transparent';
    } else {
      return checked ? 'border-red-500 bg-red-500' : 'border-red-400 bg-transparent';
    }
  };

  return (
    <label className="flex items-center space-x-2 cursor-pointer text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900">
      <input
        type="radio"
        name={`status-${studentId}`}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className={`w-5 h-5 sm:w-6 sm:h-6 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${getBorderClass()}`}>
        {checked && <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white"></span>}
      </span>
      <span>{label}</span>
    </label>
  );
};

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string, 'aria-label': string }> = ({ onClick, children, className = '', ...props }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
    {...props}
  >
    {children}
  </button>
);


const StudentRow: React.FC<StudentRowProps> = ({ student, status, onStatusChange, onViewHistory, onEdit, onDelete, isLast, isSelected, onSelect }) => {
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStatusChange(student.id, e.target.value as AttendanceStatus);
  };

  // Determine if student is unmarked
  const isUnmarked = status === StatusEnum.UNMARKED;
  const rowBackgroundClass = isUnmarked ? 'bg-red-50' : '';
  const hoverClass = isUnmarked ? 'hover:bg-red-100' : 'hover:bg-gray-50';

  return (
    <div className={`p-4 sm:p-5 transition-colors duration-200 ${rowBackgroundClass} ${hoverClass} ${!isLast ? 'border-b border-gray-200' : ''}`}>
      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {/* Row 1: Checkbox, Name, and Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(student.id, e.target.checked)}
              className="w-5 h-5 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-lg font-bold text-gray-900 break-words">{student.name}</p>
              <p className="text-sm sm:text-base text-gray-600 font-medium mt-1">Roll No: {student.rollNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
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

        {/* Row 2: Status Radio Buttons */}
        <div className="flex items-center gap-6 pl-8">
          <StatusRadioButton
            studentId={student.id}
            value={StatusEnum.PRESENT}
            label="Present"
            checked={status === StatusEnum.PRESENT}
            onChange={handleRadioChange}
          />
          <StatusRadioButton
            studentId={student.id}
            value={StatusEnum.ABSENT}
            label="Absent"
            checked={status === StatusEnum.ABSENT}
            onChange={handleRadioChange}
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-7 items-center gap-4">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(student.id, e.target.checked)}
            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <div className="col-span-1">
          <p className="text-sm lg:text-base text-gray-600 font-medium">{student.rollNumber}</p>
        </div>

        <div className="col-span-2">
          <p className="text-base lg:text-lg font-semibold text-gray-800">{student.name}</p>
        </div>

        <div className="flex items-center gap-x-6 col-span-2">
          <StatusRadioButton
            studentId={student.id}
            value={StatusEnum.PRESENT}
            label="Present"
            checked={status === StatusEnum.PRESENT}
            onChange={handleRadioChange}
          />
          <StatusRadioButton
            studentId={student.id}
            value={StatusEnum.ABSENT}
            label="Absent"
            checked={status === StatusEnum.ABSENT}
            onChange={handleRadioChange}
          />
        </div>

        <div className="flex justify-end items-center space-x-1">
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
    </div>
  );
};

export default StudentRow;