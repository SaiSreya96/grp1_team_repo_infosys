import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Pollutant {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

interface PollutantBreakdownProps {
  pollutants: Pollutant[];
}

export default function PollutantBreakdown({ pollutants }: PollutantBreakdownProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Pollutant Breakdown</h3>

      <div className="space-y-5">
        {pollutants.map((pollutant) => (
          <div key={pollutant.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-gray-900 w-16">{pollutant.name}</span>
                <span className="text-sm text-gray-600">
                  {pollutant.value} {pollutant.unit}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(pollutant.trend)}
                <span className={`text-sm font-medium ${getTrendColor(pollutant.trend)}`}>
                  {pollutant.percentage}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  pollutant.percentage >= 80
                    ? 'bg-red-500'
                    : pollutant.percentage >= 60
                    ? 'bg-orange-500'
                    : pollutant.percentage >= 40
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${pollutant.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Legend:</span> PM = Particulate Matter, O3 = Ozone, NO2 = Nitrogen Dioxide, SO2 = Sulfur Dioxide, CO = Carbon Monoxide
        </p>
      </div>
    </div>
  );
}
