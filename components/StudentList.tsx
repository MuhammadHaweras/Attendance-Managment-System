import React from 'react';
import type { Student, AttendanceStatus } from '../types';
import StudentRow from './StudentRow';

interface StudentListProps {
  students: Student[];
  records: { [studentId: number]: AttendanceStatus };
  onStatusChange: (studentId: number, status: AttendanceStatus) => void;
  onViewHistory: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (studentId: number) => void;
  selectedStudents: number[];
  onSelectStudent: (studentId: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, records, onStatusChange, onViewHistory, onEdit, onDelete, selectedStudents, onSelectStudent, onSelectAll }) => {
  if (students.length === 0) {
    return (
      <div className="text-center bg-white rounded-lg shadow-lg p-8 sm:p-12">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700">No Students in this Class</h3>
        <p className="text-sm sm:text-base text-gray-500 mt-2">Add a new student to this class to start tracking attendance.</p>
      </div>
    );
  }

  const allSelected = students.length > 0 && students.every(s => selectedStudents.includes(s.id));

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Mobile Header with Select All */}
      <div className="md:hidden bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-sm font-semibold text-gray-700">
            {selectedStudents.length > 0 ? `${selectedStudents.length} Selected` : 'Select All'}
          </span>
        </div>
        <span className="text-xs text-gray-500">{students.length} Student{students.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:grid md:grid-cols-7 font-bold text-left text-xs lg:text-sm text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
        <div className="p-4 flex items-center justify-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
        </div>
        <div className="p-4 col-span-1">Roll No</div>
        <div className="p-4 col-span-2">Student Name</div>
        <div className="p-4 col-span-2">Status</div>
        <div className="p-4 text-right">Actions</div>
      </div>

      {/* Student Rows */}
      <div>
        {students.map((student, index) => (
          <StudentRow
            key={student.id}
            student={student}
            status={records[student.id]}
            onStatusChange={onStatusChange}
            onViewHistory={onViewHistory}
            onEdit={onEdit}
            onDelete={onDelete}
            isLast={index === students.length - 1}
            isSelected={selectedStudents.includes(student.id)}
            onSelect={onSelectStudent}
          />
        ))}
      </div>
    </div>
  );
};

export default StudentList;
