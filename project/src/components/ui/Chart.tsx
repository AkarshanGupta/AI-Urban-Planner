import React from 'react';

interface ChartProps {
  type: 'population' | 'economics' | 'environmental';
  timeHorizon: number;
}

export const Chart: React.FC<ChartProps> = ({ type, timeHorizon }) => {
  // Generate sample data points
  const generateData = () => {
    const points = [];
    const baseValue = type === 'population' ? 100000 : 1000;
    const growthRate = type === 'population' ? 0.02 : 0.05;
    
    for (let i = 0; i <= timeHorizon; i++) {
      const value = baseValue * Math.pow(1 + growthRate, i);
      const x = (i / timeHorizon) * 100;
      const y = 100 - (value / (baseValue * Math.pow(1 + growthRate, timeHorizon))) * 80;
      points.push({ x, y, value });
    }
    return points;
  };

  const data = generateData();
  
  // Create SVG path
  const pathD = data.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="h-48 w-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`${pathD} L 100 100 L 0 100 Z`}
            fill="url(#chartGradient)"
          />
          {data.map((point, index) => (
            index % 5 === 0 && (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="1"
                fill="#3B82F6"
                vectorEffect="non-scaling-stroke"
              />
            )
          ))}
        </svg>
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        <span>Current</span>
        <span>{timeHorizon} years</span>
      </div>
    </div>
  );
};