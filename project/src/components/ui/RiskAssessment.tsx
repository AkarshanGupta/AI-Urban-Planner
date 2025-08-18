import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const riskFactors = [
  { name: 'Sea Level Rise', level: 'medium', impact: 65 },
  { name: 'Extreme Weather', level: 'high', impact: 80 },
  { name: 'Urban Heat Island', level: 'low', impact: 35 },
  { name: 'Flood Risk', level: 'medium', impact: 55 },
  { name: 'Air Quality', level: 'low', impact: 25 },
];

export const RiskAssessment: React.FC = () => {
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-200 dark:bg-red-900/30';
      case 'medium': return 'bg-yellow-200 dark:bg-yellow-900/30';
      case 'low': return 'bg-green-200 dark:bg-green-900/30';
      default: return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {riskFactors.map((risk, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getRiskIcon(risk.level)}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {risk.name}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getRiskColor(risk.level)}`}
                style={{ width: `${risk.impact}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 w-10">
              {risk.impact}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};