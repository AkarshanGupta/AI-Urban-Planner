import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface TabButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 px-6 py-4 text-left w-full transition-all ${
        isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium">{label}</span>
    </button>
  );
};