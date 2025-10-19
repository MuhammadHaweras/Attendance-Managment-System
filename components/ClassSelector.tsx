import React from 'react';
import type { Class } from '../types';
import { PlusIcon, EditIcon } from './Icons';

interface ClassSelectorProps {
  classes: Class[];
  selectedClassId: number | null;
  onSelectClass: (id: number) => void;
  onAddClass: () => void;
  onManageClasses: () => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({ classes, selectedClassId, onSelectClass, onAddClass, onManageClasses }) => {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label htmlFor="class-selector" className="text-base sm:text-lg font-semibold text-gray-700">
          Current Class:
        </label>
        <select
          id="class-selector"
          value={selectedClassId ?? ''}
          onChange={(e) => onSelectClass(Number(e.target.value))}
          className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 text-base sm:text-sm font-medium"
          disabled={classes.length === 0}
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
         <button
            onClick={onAddClass}
            className="flex-1 sm:flex-none items-center justify-center gap-1 sm:gap-2 bg-indigo-500 text-white font-semibold px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg shadow-md hover:bg-indigo-600 transition-colors text-sm sm:text-base flex"
          >
            <PlusIcon />
            <span>New Class</span>
          </button>
        <button
            onClick={onManageClasses}
            className="flex-1 sm:flex-none items-center justify-center gap-1 sm:gap-2 bg-gray-600 text-white font-semibold px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg shadow-md hover:bg-gray-700 transition-colors text-sm sm:text-base flex"
          >
            <EditIcon />
            <span>Manage</span>
          </button>
      </div>
    </div>
  );
};

export default ClassSelector;
