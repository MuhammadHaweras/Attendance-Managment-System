import React, { useState, useEffect, useMemo } from 'react';
import type { Student, AttendanceHistory, AttendanceStatus, Class } from './types';
import { AttendanceStatus as StatusEnum } from './types';
import StudentList from './components/StudentList';
import AttendanceSummary from './components/AttendanceSummary';
import StudentHistoryModal from './components/StudentHistoryModal';
import StudentModal from './components/StudentModal';
import ClassSelector from './components/ClassSelector';
import ClassModal from './components/ClassModal';
import ManageClassesModal from './components/ManageClassesModal';
import BulkImportModal from './components/BulkImportModal';
import ConfirmDialog from './components/ConfirmDialog';
import { PlusIcon, SearchIcon } from './components/Icons';
import Typewriter from './components/Typewriter';

const getInitialState = () => {
  try {
    const savedClasses = localStorage.getItem('classes');
    const savedStudents = localStorage.getItem('students');
    const savedHistory = localStorage.getItem('attendanceHistory');
    const savedSelectedClassId = localStorage.getItem('selectedClassId');

    if (savedClasses && savedStudents) {
      const classes = JSON.parse(savedClasses);
      const students = JSON.parse(savedStudents);
      const attendanceHistory = savedHistory ? JSON.parse(savedHistory) : {};
      const selectedClassId = savedSelectedClassId ? JSON.parse(savedSelectedClassId) : (classes.length > 0 ? classes[0].id : null);
      return { classes, students, attendanceHistory, selectedClassId };
    }
  } catch (error) {
    console.error("Could not parse data from localStorage", error);
  }
  
  // Default data for first-time users
  const defaultClass: Class = { id: 1, name: 'Sample Class' };
  const defaultStudents: Student[] = [
    { id: 1, name: 'Alice Johnson', rollNumber: 'S001', classId: 1 },
    { id: 2, name: 'Bob Williams', rollNumber: 'S002', classId: 1 },
  ];
  return {
    classes: [defaultClass],
    students: defaultStudents,
    attendanceHistory: {},
    selectedClassId: 1,
  };
};


const App: React.FC = () => {
  const getTodayDateString = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  };

  const initialState = getInitialState();
  
  const [classes, setClasses] = useState<Class[]>(initialState.classes);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(initialState.selectedClassId);
  const [students, setStudents] = useState<Student[]>(initialState.students);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistory>(initialState.attendanceHistory);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Modals state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);
  const [classToEdit, setClassToEdit] = useState<Class | null>(null);
  const [isManageClassesModalOpen, setIsManageClassesModalOpen] = useState<boolean>(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState<boolean>(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Yes',
    onConfirm: () => {},
  });
  

  // Data Persistence
  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
     if (classes.length === 0) {
        setSelectedClassId(null);
    } else if (!selectedClassId || !classes.find(c => c.id === selectedClassId)) {
        setSelectedClassId(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('attendanceHistory', JSON.stringify(attendanceHistory));
  }, [attendanceHistory]);

  useEffect(() => {
    if (selectedClassId !== null) {
      localStorage.setItem('selectedClassId', JSON.stringify(selectedClassId));
    } else {
      localStorage.removeItem('selectedClassId');
    }
  }, [selectedClassId]);

  // Handlers
  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendanceHistory(prev => {
      const newHistory = { ...prev };
      if (!newHistory[selectedDate]) {
        newHistory[selectedDate] = {};
      }
      newHistory[selectedDate][studentId] = status;
      return newHistory;
    });
  };

  const handleViewHistory = (student: Student) => {
    setSelectedStudentForHistory(student);
    setIsHistoryModalOpen(true);
  };
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  // Bulk Attendance Handlers
  const handleMarkAllPresent = () => {
    if (studentsInClass.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Mark All Present',
      message: 'Are you sure you want to mark all students as Present for the selected date?',
      confirmText: 'Yes',
      onConfirm: () => {
        setAttendanceHistory(prev => {
          const newHistory = { ...prev };
          if (!newHistory[selectedDate]) {
            newHistory[selectedDate] = {};
          }
          studentsInClass.forEach(student => {
            newHistory[selectedDate][student.id] = StatusEnum.PRESENT;
          });
          return newHistory;
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleMarkAllAbsent = () => {
    if (studentsInClass.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Mark All Absent',
      message: 'Are you sure you want to mark all students as Absent for the selected date?',
      confirmText: 'Yes',
      onConfirm: () => {
        setAttendanceHistory(prev => {
          const newHistory = { ...prev };
          if (!newHistory[selectedDate]) {
            newHistory[selectedDate] = {};
          }
          studentsInClass.forEach(student => {
            newHistory[selectedDate][student.id] = StatusEnum.ABSENT;
          });
          return newHistory;
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleClearStatus = () => {
    if (studentsInClass.length === 0) return;

    // Count how many students are currently marked
    const markedCount = studentsInClass.filter(student => {
      const status = currentRecords[student.id];
      return status === StatusEnum.PRESENT || status === StatusEnum.ABSENT;
    }).length;

    if (markedCount === 0) {
      // No students marked, nothing to clear
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Clear Attendance Status',
      message: 'Are you sure you want to clear attendance status for all marked students?',
      confirmText: 'Yes',
      onConfirm: () => {
        setAttendanceHistory(prev => {
          const newHistory = { ...prev };
          if (newHistory[selectedDate]) {
            // Remove all attendance records for students in this class for the selected date
            studentsInClass.forEach(student => {
              delete newHistory[selectedDate][student.id];
            });
            // Clean up empty date entries
            if (Object.keys(newHistory[selectedDate]).length === 0) {
              delete newHistory[selectedDate];
            }
          }
          return newHistory;
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Student Handlers
  const handleOpenStudentModal = (student: Student | null) => {
    setStudentToEdit(student);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (studentData: { id?: number; name: string; rollNumber: string }) => {
    if (!selectedClassId) {
        alert("A class must be selected to add a student.");
        return;
    }
    if (studentData.id) { // Editing existing student
      setStudents(prev => prev.map(s => s.id === studentData.id ? { ...s, name: studentData.name, rollNumber: studentData.rollNumber } : s));
    } else { // Adding new student
      const newStudent: Student = {
        id: Date.now(),
        name: studentData.name,
        rollNumber: studentData.rollNumber,
        classId: selectedClassId,
      };
      setStudents(prev => [...prev, newStudent]);
    }
    setIsStudentModalOpen(false);
    setStudentToEdit(null);
  };

  const handleDeleteStudent = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Student',
      message: `Are you sure you want to delete ${student?.name || 'this student'} and all their attendance records? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: () => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setAttendanceHistory(prev => {
          const newHistory = { ...prev };
          Object.keys(newHistory).forEach(date => {
            if (newHistory[date][studentId]) {
              delete newHistory[date][studentId];
            }
          });
          return newHistory;
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleBulkImport = (importedStudents: Omit<Student, 'id' | 'classId'>[]) => {
    if (!selectedClassId) {
      alert("A class must be selected to import students.");
      return;
    }

    const existingIds = students.map(s => s.id);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;

    const newStudents: Student[] = importedStudents.map((student, index) => ({
      id: maxId + index + 1,
      name: student.name,
      rollNumber: student.rollNumber,
      classId: selectedClassId,
    }));

    setStudents(prev => [...prev, ...newStudents]);
    setIsBulkImportModalOpen(false);
  };

  // Bulk Selection Handlers
  const handleSelectStudent = (studentId: number, checked: boolean) => {
    setSelectedStudents(prev =>
      checked
        ? [...prev, studentId]
        : prev.filter(id => id !== studentId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedStudents(checked ? filteredStudents.map(s => s.id) : []);
  };

  const handleBulkDelete = () => {
    if (selectedStudents.length === 0) {
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Multiple Students',
      message: `Are you sure you want to delete ${selectedStudents.length} selected student(s) and all their attendance records? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: () => {
        setStudents(prev => prev.filter(s => !selectedStudents.includes(s.id)));
        setAttendanceHistory(prev => {
          const newHistory = { ...prev };
          Object.keys(newHistory).forEach(date => {
            selectedStudents.forEach(studentId => {
              if (newHistory[date][studentId]) {
                delete newHistory[date][studentId];
              }
            });
          });
          return newHistory;
        });
        setSelectedStudents([]);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Class Handlers
  const handleSelectClass = (id: number) => setSelectedClassId(id);

  const handleOpenClassModal = (cls: Class | null) => {
    setClassToEdit(cls);
    setIsClassModalOpen(true);
    setIsManageClassesModalOpen(false);
  };

  const handleSaveClass = (classData: { id?: number; name: string }) => {
    if (classData.id) { // Edit
      setClasses(prev => prev.map(c => c.id === classData.id ? { ...c, name: classData.name } : c));
    } else { // Add
      const newClass: Class = { id: Date.now(), name: classData.name };
      setClasses(prev => [...prev, newClass]);
      setSelectedClassId(newClass.id);
    }
    setIsClassModalOpen(false);
    setClassToEdit(null);
  };

  const handleDeleteClass = (classId: number) => {
    const classToDelete = classes.find(c => c.id === classId);
    const studentsCount = students.filter(s => s.classId === classId).length;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Class',
      message: `Are you sure you want to delete "${classToDelete?.name || 'this class'}"? This will also delete ${studentsCount} student(s) and all their attendance records. This action is irreversible.`,
      confirmText: 'Delete',
      onConfirm: () => {
        const studentsToDelete = students.filter(s => s.classId === classId).map(s => s.id);

        setClasses(prev => prev.filter(c => c.id !== classId));
        setStudents(prev => prev.filter(s => s.classId !== classId));
        setAttendanceHistory(prev => {
          const newHistory = { ...prev };
          Object.keys(newHistory).forEach(date => {
            studentsToDelete.forEach(studentId => {
              if (newHistory[date][studentId]) delete newHistory[date][studentId];
            });
          });
          return newHistory;
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };
  
  // Memoized calculations
  const studentsInClass = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return studentsInClass;
    const lowercasedQuery = searchQuery.toLowerCase();
    return studentsInClass.filter(student =>
      student.name.toLowerCase().includes(lowercasedQuery) ||
      student.rollNumber.toLowerCase().includes(lowercasedQuery)
    );
  }, [studentsInClass, searchQuery]);
  
  const currentRecords = useMemo(() => {
    const records = attendanceHistory[selectedDate] || {};
    const fullRecords: { [id: number]: AttendanceStatus } = {};
    studentsInClass.forEach(student => {
      fullRecords[student.id] = records[student.id] || StatusEnum.UNMARKED;
    });
    return fullRecords;
  }, [attendanceHistory, selectedDate, studentsInClass]);

  const isAttendanceComplete = useMemo(() => {
    if (studentsInClass.length === 0) return false;
    return studentsInClass.every(student =>
      currentRecords[student.id] === StatusEnum.PRESENT || currentRecords[student.id] === StatusEnum.ABSENT
    );
  }, [currentRecords, studentsInClass]);

  const handleExport = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const selectedClass = classes.find(c => c.id === selectedClassId);

    // Developer credit at the top
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 168, 107); // Green color matching hero section
    doc.text('This system is developed by Muhammad Haweras', 14, 15);

    // Main report title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Attendance Report', 14, 28);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`Class: ${selectedClass?.name || 'N/A'}`, 14, 35);

    const displayDate = new Date(selectedDate);
    displayDate.setMinutes(displayDate.getMinutes() + displayDate.getTimezoneOffset());
    doc.text(`Date: ${displayDate.toLocaleDateString()}`, 14, 42);

    const tableColumn = ["Roll Number", "Student Name", "Status"];
    const tableRows = studentsInClass.map(student => [
      student.rollNumber,
      student.name,
      currentRecords[student.id]
    ]);

    (doc as any).autoTable({
      head: [tableColumn], body: tableRows, startY: 48, theme: 'striped',
      headStyles: { fillColor: [75, 85, 99] },
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    const summary = {
      present: Object.values(currentRecords).filter(s => s === StatusEnum.PRESENT).length,
      absent: Object.values(currentRecords).filter(s => s === StatusEnum.ABSENT).length,
    };

    (doc as any).autoTable({
      head: [['Daily Summary', '']],
      body: [['Total Students', studentsInClass.length], ['Present', summary.present], ['Absent', summary.absent]],
      startY: finalY + 10, theme: 'grid', headStyles: { fillColor: [49, 46, 229] },
    });

    doc.save(`attendance_${selectedClass?.name || 'report'}_${selectedDate}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-indigo-600">Attendance System</h1>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setIsBulkImportModalOpen(true)}
                className="flex items-center gap-1 sm:gap-2 bg-green-600 text-white font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={!selectedClassId}
              >
                <PlusIcon />
                <span className="hidden sm:inline">Bulk Import</span>
                <span className="sm:hidden">Import</span>
              </button>
              <button
                onClick={() => handleOpenStudentModal(null)}
                className="flex items-center gap-1 sm:gap-2 bg-indigo-600 text-white font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={!selectedClassId}
              >
                <PlusIcon />
                <span className="hidden xs:inline">Add Student</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="bg-[#00A86B] flex items-center justify-center shadow-lg fade-in px-4" style={{ minHeight: '180px', height: 'clamp(180px, 30vh, 225px)' }}>
        <Typewriter
          text="Develop by Haweras"
          speed={100}
          className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold text-center px-4"
          showCursor={true}
        />
      </div>
      <style>{`
        .text-2xl, .text-3xl, .text-4xl {
          font-family: 'Comic Sans MS', cursive, sans-serif;
        }
      `}</style>

      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
           <ClassSelector
              classes={classes}
              selectedClassId={selectedClassId}
              onSelectClass={handleSelectClass}
              onAddClass={() => handleOpenClassModal(null)}
              onManageClasses={() => setIsManageClassesModalOpen(true)}
            />
        </div>

        {selectedClassId ? (
          <>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
              <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="flex-grow">
                    <label htmlFor="search-student" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Search Students</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text" id="search-student" value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 text-base sm:text-sm"
                            placeholder="Search by name or roll no..."
                        />
                    </div>
                  </div>
                <div className="w-full sm:w-auto">
                  <div>
                    <label htmlFor="date-picker" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Attendance Date</label>
                    <input type="date" id="date-picker" value={selectedDate} onChange={handleDateChange}
                      className="w-full sm:w-auto px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 text-base sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <AttendanceSummary records={currentRecords} />

            {/* Bulk Attendance Controls */}
            {studentsInClass.length > 0 && (
              <div className="mb-6 bg-white p-4 sm:p-5 rounded-lg shadow-md border border-indigo-100">
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="text-sm sm:text-base font-semibold text-gray-700">Bulk Attendance Actions</span>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <button
                      onClick={handleMarkAllPresent}
                      className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-4 py-2.5 sm:py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Mark All Present</span>
                    </button>

                    <button
                      onClick={handleMarkAllAbsent}
                      className="flex items-center justify-center gap-2 bg-red-500 text-white font-semibold px-4 py-2.5 sm:py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Mark All Absent</span>
                    </button>

                    <button
                      onClick={handleClearStatus}
                      className="flex items-center justify-center gap-2 bg-gray-500 text-white font-semibold px-4 py-2.5 sm:py-2 rounded-lg shadow-md hover:bg-gray-600 transition-colors text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Clear Status</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 sm:mb-8 flex flex-wrap justify-between items-center gap-3 sm:gap-4">
              <div className="flex gap-2 sm:gap-3">
                {selectedStudents.length > 0 && (
                  <>
                    <button
                      onClick={handleBulkDelete}
                      className="bg-red-600 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                      <span className="hidden sm:inline">Delete Selected ({selectedStudents.length})</span>
                      <span className="sm:hidden">Delete ({selectedStudents.length})</span>
                    </button>
                  </>
                )}
              </div>

              {isAttendanceComplete && (
                <button onClick={handleExport}
                  className="bg-green-600 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Export to PDF</span>
                  <span className="sm:hidden">Export PDF</span>
                </button>
              )}
            </div>

            <StudentList
              students={filteredStudents} records={currentRecords}
              onStatusChange={handleStatusChange} onViewHistory={handleViewHistory}
              onEdit={handleOpenStudentModal} onDelete={handleDeleteStudent}
              selectedStudents={selectedStudents}
              onSelectStudent={handleSelectStudent}
              onSelectAll={handleSelectAll}
            />
          </>
        ) : (
          <div className="text-center bg-white rounded-lg shadow-lg p-12">
            <h3 className="text-2xl font-bold text-gray-800">Welcome!</h3>
            <p className="text-gray-600 mt-2 mb-6">Create a class to start taking attendance.</p>
            <button
              onClick={() => handleOpenClassModal(null)}
              className="flex items-center gap-2 mx-auto bg-indigo-600 text-white font-semibold px-5 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon />
              <span>Create Your First Class</span>
            </button>
          </div>
        )}
      </main>
      
      {isHistoryModalOpen && selectedStudentForHistory && (
        <StudentHistoryModal
          isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)}
          student={selectedStudentForHistory} history={attendanceHistory}
        />
      )}
      
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => { setIsStudentModalOpen(false); setStudentToEdit(null); }}
        onSave={handleSaveStudent}
        student={studentToEdit}
        existingStudents={students}
      />

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => { setIsClassModalOpen(false); setClassToEdit(null); }}
        onSave={handleSaveClass} classToEdit={classToEdit}
      />
      
      <ManageClassesModal
        isOpen={isManageClassesModalOpen}
        onClose={() => setIsManageClassesModalOpen(false)}
        classes={classes} onEdit={handleOpenClassModal} onDelete={handleDeleteClass}
      />

      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onImport={handleBulkImport}
        selectedClassId={selectedClassId}
        existingStudents={students}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default App;