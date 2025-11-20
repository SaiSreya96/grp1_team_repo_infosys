import { useState } from 'react';
import { Wind, TrendingUp, Calendar, Loader } from 'lucide-react';
import AQICard from './components/AQICard';
import LocationSelector from './components/LocationSelector';
import PollutantBreakdown from './components/PollutantBreakdown';
import HealthRecommendations from './components/HealthRecommendations';
import PredictionChart from './components/PredictionChart';
import RegionInfo from './components/RegionInfo';
import { useAirQuality } from './hooks/useAirQuality';
import { getAQICategory, calculateTrend } from './utils/airQuality';

function App() {
  const [selectedLocation, setSelectedLocation] = useState('North Delhi');
  const { currentReading, predictions, loading, error } = useAirQuality(selectedLocation);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading air quality data...</p>
        </div>
      </div>
    );
  }

  if (error || !currentReading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-red-600 mb-4">No data available for this location yet.</p>
          <p className="text-gray-600 text-sm">Please select a different location.</p>
        </div>
      </div>
    );
  }

  const currentAQI = getAQICategory(currentReading.aqi);

  const pollutants = [
    { name: 'PM2.5', value: currentReading.pm25, unit: 'µg/m³', trend: calculateTrend(currentReading.pm25), percentage: Math.min((currentReading.pm25 / 50) * 100, 100) },
    { name: 'PM10', value: currentReading.pm10, unit: 'µg/m³', trend: calculateTrend(currentReading.pm10), percentage: Math.min((currentReading.pm10 / 100) * 100, 100) },
    { name: 'O3', value: currentReading.o3, unit: 'ppb', trend: calculateTrend(currentReading.o3), percentage: Math.min((currentReading.o3 / 70) * 100, 100) },
    { name: 'NO2', value: currentReading.no2, unit: 'ppb', trend: calculateTrend(currentReading.no2), percentage: Math.min((currentReading.no2 / 50) * 100, 100) },
    { name: 'SO2', value: currentReading.so2, unit: 'ppb', trend: calculateTrend(currentReading.so2), percentage: Math.min((currentReading.so2 / 35) * 100, 100) },
    { name: 'CO', value: currentReading.co, unit: 'ppm', trend: calculateTrend(currentReading.co), percentage: Math.min((currentReading.co / 4) * 100, 100) }
  ];

  const avgPrediction = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + p.predicted_aqi, 0) / predictions.length)
    : currentReading.aqi;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wind className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AirAware Delhi</h1>
                <p className="text-sm text-gray-600">Delhi Air Quality Monitoring System</p>
              </div>
            </div>
            <LocationSelector
              location={selectedLocation}
              onLocationChange={setSelectedLocation}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <AQICard aqi={currentAQI} location={selectedLocation} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current AQI</span>
                <span className="text-lg font-bold text-gray-900">{currentReading.aqi}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Category</span>
                <span className="text-sm font-semibold">{currentReading.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">7-Day Avg</span>
                <span className="text-lg font-bold text-gray-900">{avgPrediction} AQI</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Predictions Available</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {predictions.length} days of forecast data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PollutantBreakdown pollutants={pollutants} />
          <HealthRecommendations category={currentAQI.category} />
        </div>

        <div className="mb-8">
          <RegionInfo region={selectedLocation} />
        </div>

        <PredictionChart predictions={predictions} currentAQI={currentReading.aqi} />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Data updates every hour • Predictions powered by machine learning algorithms
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
