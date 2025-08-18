import React from 'react';

interface ToggleControlProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleControl: React.FC<ToggleControlProps> = ({
  label,
  description,
  checked,
  onChange
}) => {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          } mt-1`}
        />
      </button>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </h4>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};