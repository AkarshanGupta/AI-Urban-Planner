import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const trafficData = [
  { intersection: 'Main St & 1st Ave', congestion: 85, avgWait: '2.3 min', status: 'high' },
  { intersection: 'Park Rd & Center St', congestion: 45, avgWait: '1.1 min', status: 'medium' },
  { intersection: 'Highway 101 & Oak St', congestion: 92, avgWait: '3.7 min', status: 'high' },
  { intersection: 'Elm St & Broadway', congestion: 25, avgWait: '0.8 min', status: 'low' },
];

export const TrafficAnalyzer: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'bg-red-200 dark:bg-red-900/30';
      case 'medium': return 'bg-yellow-200 dark:bg-yellow-900/30';
      case 'low': return 'bg-green-200 dark:bg-green-900/30';
      default: return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Real-time Traffic Analysis
        </h4>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Live</span>
        </div>
      </div>
      
      {trafficData.map((traffic, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center space-x-3">
            {getStatusIcon(traffic.status)}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {traffic.intersection}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Avg wait: {traffic.avgWait}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getStatusColor(traffic.status)}`}
                style={{ width: `${traffic.congestion}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
              {traffic.congestion}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};