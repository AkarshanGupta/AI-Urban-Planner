import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PopulationChartProps {
  cityData: any;
}

export const PopulationChart: React.FC<PopulationChartProps> = ({ cityData }) => {
  const data = [
    { age: '0-18', population: Math.round(cityData.population * 0.22) },
    { age: '19-35', population: Math.round(cityData.population * 0.28) },
    { age: '36-50', population: Math.round(cityData.population * 0.25) },
    { age: '51-65', population: Math.round(cityData.population * 0.15) },
    { age: '65+', population: Math.round(cityData.population * 0.10) },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        Age Distribution
      </h4>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="age" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
          />
          <Bar 
            dataKey="population" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};