import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmButtonClass = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base font-semibold text-white rounded-lg focus:outline-none focus:ring-2 transition-colors ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
