import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Thermometer } from 'lucide-react';

interface WeatherWidgetProps {
  climate: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ climate }) => {
  const [weather, setWeather] = useState({
    temperature: 22,
    condition: 'sunny',
    humidity: 65,
    windSpeed: 12
  });

  useEffect(() => {
    // Simulate weather based on climate
    const getWeatherForClimate = (climate: string) => {
      switch (climate) {
        case 'tropical':
          return {
            temperature: 28 + Math.random() * 8,
            condition: Math.random() > 0.6 ? 'rainy' : 'sunny',
            humidity: 70 + Math.random() * 20,
            windSpeed: 8 + Math.random() * 10
          };
        case 'arid':
          return {
            temperature: 32 + Math.random() * 12,
            condition: 'sunny',
            humidity: 20 + Math.random() * 30,
            windSpeed: 15 + Math.random() * 15
          };
        case 'continental':
          return {
            temperature: 5 + Math.random() * 20,
            condition: Math.random() > 0.7 ? 'snowy' : 'cloudy',
            humidity: 50 + Math.random() * 30,
            windSpeed: 10 + Math.random() * 20
          };
        default: // temperate
          return {
            temperature: 15 + Math.random() * 15,
            condition: Math.random() > 0.5 ? 'cloudy' : 'sunny',
            humidity: 55 + Math.random() * 25,
            windSpeed: 8 + Math.random() * 12
          };
      }
    };

    setWeather(getWeatherForClimate(climate));
  }, [climate]);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-5 w-5 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'snowy': return <Snowflake className="h-5 w-5 text-blue-300" />;
      default: return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Current Weather
        </h4>
        {getWeatherIcon(weather.condition)}
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <Thermometer className="h-4 w-4 text-red-500" />
          <span className="text-gray-700 dark:text-gray-300">
            {Math.round(weather.temperature)}°C
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Wind className="h-4 w-4 text-blue-500" />
          <span className="text-gray-700 dark:text-gray-300">
            {Math.round(weather.windSpeed)} km/h
          </span>
        </div>
        
        <div className="col-span-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Humidity</span>
            <span className="text-gray-700 dark:text-gray-300">
              {Math.round(weather.humidity)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${weather.humidity}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};