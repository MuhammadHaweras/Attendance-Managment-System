import React, { useMemo } from 'react';
import type { AttendanceStatus } from '../types';
import { AttendanceStatus as StatusEnum } from '../types';

interface AttendanceSummaryProps {
  records: { [studentId: number]: AttendanceStatus };
}

// FIX: Changed icon type from JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
const SummaryCard: React.FC<{ title: string; count: number; color: string; icon: React.ReactNode }> = ({ title, count, color, icon }) => (
  <div className={`p-4 rounded-lg flex items-center space-x-4 ${color}`}>
    <div className="text-white p-2 rounded-full bg-black bg-opacity-10">
      {icon}
    </div>
    <div>
      <p className="text-white font-bold text-2xl">{count}</p>
      <p className="text-white text-sm opacity-90">{title}</p>
    </div>
  </div>
);


const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ records }) => {
  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let unmarked = 0;
    
    Object.values(records).forEach(status => {
      switch (status) {
        case StatusEnum.PRESENT:
          present++;
          break;
        case StatusEnum.ABSENT:
          absent++;
          break;
        default:
          unmarked++;
          break;
      }
    });

    return { present, absent, unmarked };
  }, [records]);

  const PresentIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
  const AbsentIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
  const UnmarkedIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <SummaryCard title="Present" count={summary.present} color="bg-green-500" icon={PresentIcon} />
      <SummaryCard title="Absent" count={summary.absent} color="bg-red-500" icon={AbsentIcon} />
      <SummaryCard title="Unmarked" count={summary.unmarked} color="bg-gray-500" icon={UnmarkedIcon} />
    </div>
  );
};

export default AttendanceSummary;
