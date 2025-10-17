

import type { Student } from './types';

export const STUDENTS: Student[] = [
  // FIX: Added classId to each student object to match the Student type.
  { id: 1, name: 'Alice Johnson', rollNumber: 'S001', classId: 1 },
  { id: 2, name: 'Bob Williams', rollNumber: 'S002', classId: 1 },
  { id: 3, name: 'Charlie Brown', rollNumber: 'S003', classId: 1 },
  { id: 4, name: 'Diana Miller', rollNumber: 'S004', classId: 1 },
  { id: 5, name: 'Ethan Davis', rollNumber: 'S005', classId: 1 },
  { id: 6, name: 'Fiona Garcia', rollNumber: 'S006', classId: 1 },
  { id: 7, name: 'George Rodriguez', rollNumber: 'S007', classId: 1 },
  { id: 8, name: 'Hannah Martinez', rollNumber: 'S008', classId: 1 },
  { id: 9, name: 'Ian Hernandez', rollNumber: 'S009', classId: 1 },
  { id: 10, name: 'Jane Lopez', rollNumber: 'S010', classId: 1 },
];