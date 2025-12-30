import { Cloud, AlertCircle } from "lucide-react";

interface AQICardProps {
  aqi: {
    value: number;
    category: string;
    color: string;
    textColor: string;
    description: string;
  };
  location: string;
}

export default function AQICard({ aqi, location }: AQICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Current Air Quality
          </h2>
          <p className="text-gray-600 flex items-center">
            <Cloud className="w-4 h-4 mr-1.5" />
            Last updated: 2 minutes ago • {location}
          </p>
        </div>
        <div
          className={`${aqi.color} text-white px-4 py-2 rounded-lg font-semibold`}
        >
          {aqi.category}
        </div>
      </div>

      <div className="flex items-end space-x-8 mb-6">
        <div>
          <div className="text-7xl font-bold text-gray-900">{aqi.value}</div>
          <div className="text-lg text-gray-600 mt-2">AQI Index</div>
        </div>

        <div className="flex-1 pb-4">
          <div className="h-8 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 to-purple-600 rounded-full relative overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-1 bg-gray-900 shadow-lg"
              style={{ left: `${(aqi.value / 300) * 100}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                You are here
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>0 Good</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
            <span>300+ Hazardous</span>
          </div>
        </div>
      </div>

      <div className={`bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded`}>
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-900 mb-1">
              What this means
            </p>
            <p className="text-sm text-yellow-800">
              {aqi.description}. Sensitive groups should consider reducing
              prolonged outdoor activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
