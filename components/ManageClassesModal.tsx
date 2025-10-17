import React from 'react';
import type { Class } from '../types';
import { EditIcon, DeleteIcon } from './Icons';

interface ManageClassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: Class[];
  onEdit: (cls: Class) => void;
  onDelete: (classId: number) => void;
}

const ManageClassesModal: React.FC<ManageClassesModalProps> = ({ isOpen, onClose, classes, onEdit, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-indigo-700">Manage Classes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {classes.length > 0 ? (
            <ul className="space-y-3">
              {classes.map((cls) => (
                <li key={cls.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-800">{cls.name}</span>
                  <div className="flex items-center space-x-2">
                     <button
                        onClick={() => onEdit(cls)}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                        aria-label={`Edit ${cls.name}`}
                      >
                       <EditIcon />
                     </button>
                     <button
                        onClick={() => onDelete(cls.id)}
                        className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                        aria-label={`Delete ${cls.name}`}
                      >
                       <DeleteIcon />
                     </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">No classes have been created yet.</p>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 text-right rounded-b-lg">
           <button 
            onClick={onClose} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageClassesModal;
