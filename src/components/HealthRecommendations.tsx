import { Heart, AlertTriangle, Activity, Home } from 'lucide-react';

interface HealthRecommendationsProps {
  category: string;
}

export default function HealthRecommendations({ category }: HealthRecommendationsProps) {
  const getRecommendations = () => {
    switch (category) {
      case 'Good':
        return [
          { icon: Activity, text: 'Perfect conditions for outdoor activities', color: 'text-green-600' },
          { icon: Heart, text: 'All groups can enjoy normal outdoor activities', color: 'text-green-600' },
          { icon: Home, text: 'Windows can remain open for ventilation', color: 'text-green-600' }
        ];
      case 'Moderate':
        return [
          { icon: Activity, text: 'Outdoor activities are generally acceptable', color: 'text-yellow-600' },
          { icon: AlertTriangle, text: 'Sensitive individuals should limit prolonged outdoor exertion', color: 'text-yellow-600' },
          { icon: Heart, text: 'People with respiratory conditions should monitor symptoms', color: 'text-yellow-600' }
        ];
      case 'Unhealthy for Sensitive Groups':
        return [
          { icon: AlertTriangle, text: 'Sensitive groups should reduce prolonged outdoor activities', color: 'text-orange-600' },
          { icon: Heart, text: 'Children and elderly should take breaks during outdoor activities', color: 'text-orange-600' },
          { icon: Home, text: 'Consider keeping windows closed', color: 'text-orange-600' }
        ];
      default:
        return [
          { icon: Activity, text: 'Limit outdoor activities', color: 'text-red-600' },
          { icon: AlertTriangle, text: 'Everyone should avoid prolonged outdoor exertion', color: 'text-red-600' },
          { icon: Home, text: 'Keep windows closed and use air purifiers', color: 'text-red-600' }
        ];
    }
  };

  const recommendations = getRecommendations();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Health Recommendations</h3>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const IconComponent = rec.icon;
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`${rec.color} mt-1`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <p className="text-gray-700 flex-1">{rec.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Sensitive Groups Include:</h4>
        <div className="flex flex-wrap gap-2">
          {['Children', 'Elderly', 'Asthma patients', 'Heart disease', 'Active outdoors'].map((group) => (
            <span
              key={group}
              className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
            >
              {group}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
