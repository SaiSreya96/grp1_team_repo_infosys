import { TrendingUp, Calendar } from 'lucide-react';
import { formatDate } from '../utils/airQuality';
import type { Prediction } from '../lib/supabase';

interface PredictionChartProps {
  predictions: Prediction[];
  currentAQI: number;
}

export default function PredictionChart({ predictions, currentAQI }: PredictionChartProps) {
  const chartData = [
    { day: formatDate(new Date().toISOString()), aqi: currentAQI, label: 'Today', isToday: true },
    ...predictions.slice(1, 7).map((pred, index) => ({
      day: formatDate(pred.prediction_date),
      aqi: pred.predicted_aqi,
      label: index === 0 ? 'Tomorrow' : formatDate(pred.prediction_date),
      isToday: false
    }))
  ];

  const maxAQI = Math.max(...chartData.map(p => p.aqi), 100);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    return 'bg-purple-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">7-Day Forecast</h3>
          <p className="text-sm text-gray-600 mt-1">Predicted air quality trends</p>
        </div>
        <div className="flex items-center space-x-2 text-blue-600">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium">AI Predictions</span>
        </div>
      </div>

      <div className="flex items-end justify-between space-x-4 h-64">
        {chartData.map((pred, index) => {
          const height = (pred.aqi / maxAQI) * 100;

          return (
            <div key={`${pred.day}-${index}`} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center justify-end h-full">
                <div className="relative group w-full">
                  <div
                    className={`${getAQIColor(pred.aqi)} w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${
                      pred.isToday ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                    }`}
                    style={{ height: `${height}%`, minHeight: '40px' }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      AQI: {pred.aqi}
                    </div>
                  </div>
                  <div className="text-center text-sm font-bold text-gray-900 mt-2">
                    {pred.aqi}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-gray-900">{pred.day}</div>
                <div className={`text-xs ${pred.isToday ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {pred.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Good (0-50)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Moderate (51-100)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-600">Unhealthy (101-150)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Updated hourly</span>
          </div>
        </div>
      </div>
    </div>
  );
}
