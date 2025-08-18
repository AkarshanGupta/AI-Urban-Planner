import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export const SelectControl: React.FC<SelectControlProps> = ({
  label,
  value,
  onChange,
  options
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};