import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { Chart } from '../ui/Chart';
import { RiskAssessment } from '../ui/RiskAssessment';
import { TimelineControl } from '../ui/TimelineControl';
import { MetricsCard } from '../ui/MetricsCard';
import { usePlanning } from '../../context/PlanningContext';
import { geminiAnalytics } from '../../lib/gemini';

export const PredictiveDashboard: React.FC = () => {
  const [timeHorizon, setTimeHorizon] = useState(20);
  const [aiLoading, setAiLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const { cityData } = usePlanning();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Predictive Analytics
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Future scenarios, risk assessment, and development planning
        </p>
      </div>

      {/* AI Analytics Q&A */}
      <div className="space-y-2">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
          AI Analytics
        </h3>
        <div className="flex items-center space-x-2">
          <input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask about risk, ROI, population growth impacts…"
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
          />
          <button
            onClick={async () => {
              if (!userQuery.trim()) return;
              setAiLoading(true);
              const text = await geminiAnalytics(userQuery, cityData as any);
              setAiAnswer(text);
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
        {aiAnswer && (
          <pre className="whitespace-pre-wrap text-xs bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded p-3 text-gray-800 dark:text-gray-200">
            {aiAnswer}
          </pre>
        )}
        <p className="text-xs text-gray-500">Set `VITE_GEMINI_API_KEY` (and optional `VITE_GEMINI_MODEL`) in `.env`.</p>
      </div>

      {/* Timeline Control */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <Clock className="h-4 w-4 mr-2 text-blue-600" />
          Development Timeline
        </h3>
        <TimelineControl 
          value={timeHorizon}
          onChange={setTimeHorizon}
          min={5}
          max={50}
          step={5}
        />
      </div>

      {/* Population Growth Chart */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
          Population Growth Projection
        </h3>
        <Chart type="population" timeHorizon={timeHorizon} />
      </div>

      {/* Risk Assessment */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
          Climate Risk Assessment
        </h3>
        <RiskAssessment />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricsCard
          title="Development Cost"
          value="2.4B"
          unit="$"
          icon={DollarSign}
          trend="down"
          color="green"
        />
        <MetricsCard
          title="ROI Timeline"
          value="15"
          unit="years"
          icon={TrendingUp}
          trend="up"
          color="blue"
        />
      </div>
    </div>
  );
};