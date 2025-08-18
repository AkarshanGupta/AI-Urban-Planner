import React from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = ''
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value.toLocaleString()}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{min.toLocaleString()}{unit}</span>
        <span>{max.toLocaleString()}{unit}</span>
      </div>
    </div>
  );
};