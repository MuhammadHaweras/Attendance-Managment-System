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
import { PlusIcon, SearchIcon } from './components/Icons';

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
  
  // Modals state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);
  const [classToEdit, setClassToEdit] = useState<Class | null>(null);
  const [isManageClassesModalOpen, setIsManageClassesModalOpen] = useState<boolean>(false);
  

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
    if (window.confirm('Are you sure you want to delete this student and all their attendance records? This action cannot be undone.')) {
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
    }
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
    if (window.confirm('Are you sure you want to delete this class? This will also delete ALL associated students and their attendance records. This action is irreversible.')) {
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
    }
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

    doc.setFontSize(18);
    doc.text('Attendance Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Class: ${selectedClass?.name || 'N/A'}`, 14, 29);
    
    const displayDate = new Date(selectedDate);
    displayDate.setMinutes(displayDate.getMinutes() + displayDate.getTimezoneOffset());
    doc.text(`Date: ${displayDate.toLocaleDateString()}`, 14, 36);

    const tableColumn = ["Roll Number", "Student Name", "Status"];
    const tableRows = studentsInClass.map(student => [
      student.rollNumber,
      student.name,
      currentRecords[student.id]
    ]);
    
    (doc as any).autoTable({
      head: [tableColumn], body: tableRows, startY: 42, theme: 'striped',
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">Attendance System</h1>
          <button
            onClick={() => handleOpenStudentModal(null)}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
            disabled={!selectedClassId}
          >
            <PlusIcon />
            <span>Add Student</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
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
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div className="flex-grow">
                    <label htmlFor="search-student" className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text" id="search-student" value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                            placeholder="Search by name or roll no..."
                        />
                    </div>
                  </div>
                <div className="flex items-end space-x-4">
                  <div>
                    <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-1">Attendance Date</label>
                    <input type="date" id="date-picker" value={selectedDate} onChange={handleDateChange}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <AttendanceSummary records={currentRecords} />

            {isAttendanceComplete && (
               <div className="mb-8 text-right">
                 <button onClick={handleExport}
                  className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors"
                >
                  Export to PDF
                </button>
               </div>
            )}

            <StudentList 
              students={filteredStudents} records={currentRecords}
              onStatusChange={handleStatusChange} onViewHistory={handleViewHistory}
              onEdit={handleOpenStudentModal} onDelete={handleDeleteStudent}
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
        onSave={handleSaveStudent} student={studentToEdit}
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
    </div>
  );
};

export default App;
