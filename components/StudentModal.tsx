import React, { useState, useEffect } from 'react';
import type { Student } from '../types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: { id?: number; name: string; rollNumber: string }) => void;
  student: Student | null;
  existingStudents: Student[];
}

const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, onSave, student, existingStudents }) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name);
      setRollNumber(student.rollNumber);
    } else {
      setName('');
      setRollNumber('');
    }
    setError('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name.trim() || !rollNumber.trim()) {
      setError('Both name and roll number are required.');
      return;
    }

    // Check for duplicate roll number
    const trimmedRollNumber = rollNumber.trim();
    const duplicateStudent = existingStudents.find(
      s => s.rollNumber.toLowerCase() === trimmedRollNumber.toLowerCase() && s.id !== student?.id
    );

    if (duplicateStudent) {
      setError(`Roll number "${trimmedRollNumber}" is already assigned to ${duplicateStudent.name}.`);
      return;
    }

    onSave({ id: student?.id, name, rollNumber: trimmedRollNumber });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-transform duration-300 scale-95"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)' }}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 id="student-modal-title" className="text-xl font-bold text-gray-800">{student ? 'Edit Student' : 'Add New Student'}</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 space-y-4">
          <div>
              <label htmlFor="roll-number" className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number
              </label>
              <input
                id="roll-number"
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                placeholder="Enter Student Roll No."
              />
            </div>
            <div>
              <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 mb-1">
                Student Name
              </label>
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                placeholder="Enter Student Name: "
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {student ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
