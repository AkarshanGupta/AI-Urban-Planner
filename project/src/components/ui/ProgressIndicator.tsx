import React from 'react';

interface ProgressIndicatorProps {
  progress: number;
  label?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  label
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {progress}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};