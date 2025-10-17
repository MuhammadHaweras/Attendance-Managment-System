export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  UNMARKED = 'Unmarked',
}

export interface Class {
  id: number;
  name: string;
}

export interface Student {
  id: number;
  name: string;
  rollNumber: string;
  classId: number;
}

export interface AttendanceRecord {
  [studentId: number]: AttendanceStatus;
}

export interface AttendanceHistory {
  [date: string]: AttendanceRecord;
}
