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
}

const StudentList: React.FC<StudentListProps> = ({ students, records, onStatusChange, onViewHistory, onEdit, onDelete }) => {
  if (students.length === 0) {
    return (
      <div className="text-center bg-white rounded-lg shadow-lg p-12">
        <h3 className="text-xl font-semibold text-gray-700">No Students in this Class</h3>
        <p className="text-gray-500 mt-2">Add a new student to this class to start tracking attendance.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="hidden md:grid md:grid-cols-6 font-bold text-left text-sm text-gray-500 uppercase tracking-wider border-b border-gray-200">
        <div className="p-4 col-span-1">Roll No</div>
        <div className="p-4 col-span-2">Student Name</div>
        <div className="p-4 col-span-2">Status</div>
        <div className="p-4 text-right">Actions</div>
      </div>
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
          />
        ))}
      </div>
    </div>
  );
};

export default StudentList;
