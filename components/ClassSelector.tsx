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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4 flex-grow">
        <label htmlFor="class-selector" className="text-lg font-semibold text-gray-700 whitespace-nowrap">
          Current Class:
        </label>
        <select
          id="class-selector"
          value={selectedClassId ?? ''}
          onChange={(e) => onSelectClass(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
          disabled={classes.length === 0}
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
         <button
            onClick={onAddClass}
            className="flex items-center gap-2 bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition-colors"
          >
            <PlusIcon />
            <span>New Class</span>
          </button>
        <button
            onClick={onManageClasses}
            className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
          >
            <EditIcon />
            <span>Manage</span>
          </button>
      </div>
    </div>
  );
};

export default ClassSelector;
