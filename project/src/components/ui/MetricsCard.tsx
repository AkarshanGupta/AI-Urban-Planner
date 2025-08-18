import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  trend = 'neutral',
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend !== 'neutral' && (
          <div className={`flex items-center ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h4>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};