import { useState } from "react";
import { Brain, Loader, TrendingUp, AlertCircle } from "lucide-react";
import { MLModelService } from "../services/mlModelService";

export default function MLDemo() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);

  // Sample pollutant data
  const [pollutants, setPollutants] = useState({
    pm2_5: 45.2,
    pm10: 78.5,
    no2: 38.7,
    so2: 12.3,
    co: 1.2,
    o3: 42.1,
    nh3: 180,
  });

  const checkAPIHealth = async () => {
    const healthy = await MLModelService.healthCheck();
    setApiHealth(healthy);
  };

  const getPrediction = async () => {
    setLoading(true);
    setPrediction(null);

    const result = await MLModelService.predictAQI(pollutants);

    if (result) {
      setPrediction(result);
    }

    setLoading(false);
  };

  const randomizePollutants = () => {
    setPollutants({
      pm2_5: Math.round(Math.random() * 100 + 20),
      pm10: Math.round(Math.random() * 150 + 40),
      no2: Math.round(Math.random() * 60 + 20),
      so2: Math.round(Math.random() * 30 + 5),
      co: Math.round((Math.random() * 2 + 0.5) * 10) / 10,
      o3: Math.round(Math.random() * 70 + 20),
      nh3: Math.round(Math.random() * 300 + 100),
    });
    setPrediction(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              ML Model Integration Demo
            </h3>
            <p className="text-sm text-gray-600">
              Test the Gradient Boosting AQI Predictor
            </p>
          </div>
        </div>

        <button
          onClick={checkAPIHealth}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              apiHealth === null
                ? "bg-gray-400"
                : apiHealth
                ? "bg-green-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
          <span className="text-gray-700">API Status</span>
        </button>
      </div>

      {/* Input Pollutants */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Input Pollutants</h4>
          <button
            onClick={randomizePollutants}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            🎲 Randomize
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(pollutants).map(([key, value]) => (
            <div
              key={key}
              className="bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <div className="text-xs text-gray-600 uppercase mb-1">
                {key.replace("_", ".")}
              </div>
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  setPollutants({ ...pollutants, [key]: Number(e.target.value) })
                }
                className="w-full text-lg font-bold text-gray-900 bg-transparent border-none focus:outline-none"
                step="0.1"
              />
              <div className="text-xs text-gray-500">
                {key === "co" ? "ppm" : key === "nh3" ? "ppb" : "µg/m³"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predict Button */}
      <button
        onClick={getPrediction}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Predicting...</span>
          </>
        ) : (
          <>
            <TrendingUp className="w-5 h-5" />
            <span>Predict AQI with ML Model</span>
          </>
        )}
      </button>

      {/* Prediction Result */}
      {prediction && (
        <div className="mt-6 animate-fade-in">
          <div
            className="p-6 rounded-xl border-2"
            style={{
              backgroundColor: prediction.color + "20",
              borderColor: prediction.color,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  ML Predicted AQI
                </div>
                <div className="text-5xl font-bold text-gray-900">
                  {prediction.predicted_aqi}
                </div>
              </div>
              <div
                className="px-4 py-2 rounded-lg font-bold text-white"
                style={{ backgroundColor: prediction.color }}
              >
                {prediction.category}
              </div>
            </div>

            <div className="flex items-start space-x-2 text-sm text-gray-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{prediction.description}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="text-xs text-gray-600 font-medium mb-2">
                MODEL DETAILS
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                  Algorithm: Gradient Boosting
                </span>
                <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                  Test R²: 0.9978
                </span>
                <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                  Features: 7 pollutants
                </span>
                <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                  Training samples: 151
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Live ML Integration:</strong> This component connects to the
            Flask API (localhost:5000) running your trained Gradient Boosting model.
            Predictions are computed in real-time based on pollutant inputs.
          </div>
        </div>
      </div>
    </div>
  );
}
