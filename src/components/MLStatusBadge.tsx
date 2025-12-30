import { useEffect, useState } from "react";
import { Brain, Activity } from "lucide-react";
import { MLModelService } from "../services/mlModelService";

export default function MLStatusBadge() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await MLModelService.healthCheck();
      setIsHealthy(healthy);

      if (healthy) {
        const info = await MLModelService.getModelInfo();
        setModelInfo(info);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (isHealthy === null) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Activity className="w-4 h-4 text-gray-400 animate-pulse" />
        <span className="text-xs text-gray-600">Checking ML API...</span>
      </div>
    );
  }

  if (!isHealthy) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-red-100 rounded-lg">
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <span className="text-xs text-red-700 font-medium">ML Offline</span>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg cursor-pointer">
        <Brain className="w-4 h-4 text-purple-600" />
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-purple-700 font-medium">ML Active</span>
      </div>

      {/* Tooltip */}
      {modelInfo && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="text-xs font-bold text-gray-900 mb-2">
            🧠 ML Model Status
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Algorithm:</span>
              <span className="font-medium text-gray-900">
                {modelInfo.model_type || "Gradient Boosting"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Features:</span>
              <span className="font-medium text-gray-900">
                {modelInfo.feature_count || 7} pollutants
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-green-600">✓ Connected</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
            Flask API: localhost:5000
          </div>
        </div>
      )}
    </div>
  );
}
