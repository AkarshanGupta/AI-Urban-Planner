import React, { useState } from 'react';
import { Route, Plane, Heart, GraduationCap, Zap, Droplets, MapPin } from 'lucide-react';
import { DragDropGrid } from '../ui/DragDropGrid';
import { ToggleControl } from '../ui/ToggleControl';
import { MetricsCard } from '../ui/MetricsCard';
import { TrafficAnalyzer } from '../ui/TrafficAnalyzer';
import { usePlanning } from '../../context/PlanningContext';
import { fetchRoadSuggestions } from '../../lib/gpt';
import { geminiRoadSuggestions, geminiAnalytics } from '../../lib/gemini';

export const InfrastructureDesigner: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('road');
  const [showTrafficFlow, setShowTrafficFlow] = useState(false);
  const [showUtilities, setShowUtilities] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string>('');
  const [userQuery, setUserQuery] = useState<string>('');
  const { cityData } = usePlanning();

  const tools = [
    { id: 'road', label: 'Roads', icon: Route, color: 'gray' },
    { id: 'hospital', label: 'Hospital', icon: Heart, color: 'red' },
    { id: 'school', label: 'School', icon: GraduationCap, color: 'blue' },
    { id: 'airport', label: 'Airport', icon: Plane, color: 'purple' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Infrastructure Designer
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Place and optimize transportation networks and essential services
        </p>
      </div>

      {/* Tool Selection */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
          Infrastructure Tools
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                selectedTool === tool.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <tool.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visualization Controls */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
          Analysis Views
        </h3>
        
        <ToggleControl
          label="Traffic Flow Simulation"
          description="Show congestion patterns and flow analysis"
          checked={showTrafficFlow}
          onChange={setShowTrafficFlow}
        />
        
        <ToggleControl
          label="Utility Networks"
          description="Display power grids, water systems, and fiber networks"
          checked={showUtilities}
          onChange={setShowUtilities}
        />
      </div>

      {/* AI Road Suggestions */}
      <div className="space-y-2">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
          GPT Road Suggestions
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Provide quick, AI-generated improvements for the road network based on current city parameters.
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              setAiLoading(true);
              const useGemini = !!import.meta.env.VITE_GEMINI_API_KEY;
              const text = useGemini
                ? await geminiRoadSuggestions(cityData as any)
                : await fetchRoadSuggestions(cityData as any);
              setAiText(text);
              setAiLoading(false);
            }}
            disabled={aiLoading}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              aiLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {aiLoading ? 'Asking GPT…' : 'Ask GPT for Road Tips'}
          </button>
          <span className="text-xs text-gray-500">Set `VITE_OPENAI_API_KEY` or `VITE_GEMINI_API_KEY` in `.env`.</span>
        </div>
        {aiText && (
          <pre className="whitespace-pre-wrap text-xs bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded p-3 text-gray-800 dark:text-gray-200">
            {aiText}
          </pre>
        )}
      </div>

      {/* AI Analytics Q&A */}
      <div className="space-y-2">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">City Analytics Q&A</h3>
        <div className="flex items-center space-x-2">
          <input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask about congestion, coverage, or road layout…"
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
          />
          <button
            onClick={async () => {
              if (!userQuery.trim()) return;
              setAiLoading(true);
              const useGemini = !!import.meta.env.VITE_GEMINI_API_KEY;
              const text = useGemini
                ? await geminiAnalytics(userQuery, cityData as any)
                : await fetchRoadSuggestions(cityData as any);
              setAiText(text);
              setAiLoading(false);
            }}
            disabled={aiLoading}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              aiLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {aiLoading ? 'Analyzing…' : 'Ask'}
          </button>
        </div>
      </div>

      {/* Drag & Drop Grid */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
          Infrastructure Placement Grid
        </h3>
        <DragDropGrid selectedTool={selectedTool} />
      </div>

      {/* Traffic Analysis */}
      {showTrafficFlow && (
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-red-600" />
            Traffic Flow Analysis
          </h3>
          <TrafficAnalyzer />
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricsCard
          title="Coverage"
          value="92"
          unit="%"
          icon={Zap}
          trend="up"
          color="yellow"
        />
        <MetricsCard
          title="Efficiency"
          value="87"
          unit="%"
          icon={Droplets}
          trend="up"
          color="blue"
        />
      </div>
    </div>
  );
};