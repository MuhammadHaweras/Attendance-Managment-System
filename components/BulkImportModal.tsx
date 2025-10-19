import React, { useState } from 'react';
import { Student } from '../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Omit<Student, 'id' | 'classId'>[]) => void;
  selectedClassId: number | null;
  existingStudents: Student[];
}

interface ParsedStudent {
  rollNumber: string;
  name: string;
}

export default function BulkImportModal({ isOpen, onClose, onImport, selectedClassId, existingStudents }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicates, setDuplicates] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please upload a valid Excel file (.xlsx, .xls) or CSV file (.csv)');
      setFile(null);
      setParsedStudents([]);
      return;
    }

    setFile(selectedFile);
    setError('');
    parseFile(selectedFile);
  };

  const parseFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        // @ts-ignore - XLSX is loaded via CDN
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // @ts-ignore
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Parse the data - expecting columns: Roll Number, Name (or just Roll Number)
        const students: ParsedStudent[] = [];
        let hasHeader = false;

        // Check if first row is a header
        if (jsonData.length > 0) {
          const firstRow = jsonData[0] as any[];
          if (firstRow.some((cell: any) =>
            typeof cell === 'string' &&
            (cell.toLowerCase().includes('roll') ||
             cell.toLowerCase().includes('number') ||
             cell.toLowerCase().includes('name'))
          )) {
            hasHeader = true;
          }
        }

        const startRow = hasHeader ? 1 : 0;

        for (let i = startRow; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          const rollNumber = row[0]?.toString().trim();
          const name = row[1]?.toString().trim() || '';

          if (rollNumber) {
            students.push({ rollNumber, name });
          }
        }

        if (students.length === 0) {
          setError('No valid student data found in file. Please ensure the file has Roll Number in the first column.');
          setParsedStudents([]);
          setDuplicates([]);
        } else {
          // Check for duplicates with existing students
          const existingRollNumbers = existingStudents.map(s => s.rollNumber.toLowerCase());
          const duplicateRollNumbers: string[] = [];
          const internalDuplicates = new Set<string>();
          const seenInFile = new Set<string>();

          students.forEach(student => {
            const rollLower = student.rollNumber.toLowerCase();

            // Check against existing students
            if (existingRollNumbers.includes(rollLower)) {
              duplicateRollNumbers.push(student.rollNumber);
            }

            // Check for duplicates within the file itself
            if (seenInFile.has(rollLower)) {
              internalDuplicates.add(student.rollNumber);
            } else {
              seenInFile.add(rollLower);
            }
          });

          // Combine both types of duplicates
          const allDuplicates = [...new Set([...duplicateRollNumbers, ...Array.from(internalDuplicates)])];

          setParsedStudents(students);
          setDuplicates(allDuplicates);

          if (allDuplicates.length > 0) {
            setError(`Warning: ${allDuplicates.length} duplicate roll number(s) found. These will be highlighted below.`);
          } else {
            setError('');
          }
        }
      } catch (err) {
        setError('Error parsing file. Please ensure it is a valid Excel or CSV file.');
        setParsedStudents([]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (!selectedClassId) {
      setError('Please select a class first');
      return;
    }

    if (parsedStudents.length === 0) {
      setError('No students to import');
      return;
    }

    // Filter out students with duplicate roll numbers
    const validStudents = parsedStudents.filter(
      student => !duplicates.includes(student.rollNumber)
    );

    if (validStudents.length === 0) {
      setError('All students have duplicate roll numbers. Please fix the duplicates and try again.');
      return;
    }

    if (duplicates.length > 0) {
      setError(`${duplicates.length} student(s) with duplicate roll numbers will be skipped. Importing ${validStudents.length} valid student(s).`);
      // Give user time to read the message before proceeding
      setTimeout(() => {
        onImport(validStudents);
        handleClose();
      }, 2000);
    } else {
      onImport(validStudents);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedStudents([]);
    setError('');
    setDuplicates([]);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Bulk Import Students</h2>

        {!selectedClassId && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
            Please select a class before importing students.
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Excel or CSV File
          </label>
          <p className="text-sm text-gray-600 mb-3">
            File should have:<br />
            - <strong>Column 1:</strong> Roll Number (required)<br />
            - <strong>Column 2:</strong> Name (optional, can be blank)
          </p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={!selectedClassId || isProcessing}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
            Processing file...
          </div>
        )}

        {parsedStudents.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">
              Preview ({parsedStudents.length} students found
              {duplicates.length > 0 && <span className="text-red-600"> - {duplicates.length} duplicate(s)</span>})
            </h3>
            <div className="border rounded max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedStudents.map((student, index) => {
                    const isDuplicate = duplicates.includes(student.rollNumber);
                    return (
                      <tr key={index} className={isDuplicate ? 'bg-red-50' : ''}>
                        <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                        <td className={`px-4 py-2 text-sm font-medium ${isDuplicate ? 'text-red-700' : 'text-gray-900'}`}>
                          {student.rollNumber}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {student.name || <span className="text-gray-400 italic">blank</span>}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {isDuplicate ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Duplicate
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Valid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedClassId || parsedStudents.length === 0 || isProcessing || parsedStudents.length === duplicates.length}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {parsedStudents.length > 0 ? (
              duplicates.length > 0 ? (
                `Import ${parsedStudents.length - duplicates.length} Valid Student${parsedStudents.length - duplicates.length !== 1 ? 's' : ''}`
              ) : (
                `Import ${parsedStudents.length} Student${parsedStudents.length !== 1 ? 's' : ''}`
              )
            ) : (
              'Import'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
