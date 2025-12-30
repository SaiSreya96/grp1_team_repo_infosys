import type { ExternalAQIData } from '../services/airQualityService';

export interface PollutantData {
  pm2_5: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  nh3: number;
}

export interface MLPredictionResponse {
  predicted_aqi: number;
  category: string;
  color: string;
  description: string;
  input_pollutants: PollutantData;
}

export class MLModelService {
  private static readonly ML_API_URL = 'http://localhost:5000';

  /**
   * Predict AQI using ML model based on pollutant concentrations
   */
  static async predictAQI(pollutants: PollutantData): Promise<MLPredictionResponse | null> {
    try {
      const response = await fetch(`${this.ML_API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollutants),
      });

      if (!response.ok) {
        console.error('ML API prediction failed:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('ML Model prediction error:', error);
      return null;
    }
  }

  /**
   * Check if ML API is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ML_API_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('ML API health check failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  static async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.ML_API_URL}/model/info`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to get model info:', error);
      return null;
    }
  }

  /**
   * Convert external API data to pollutant format for ML prediction
   */
  static convertToPollutantData(data: any): PollutantData {
    return {
      pm2_5: data.pm25 || data.pm2_5 || 0,
      pm10: data.pm10 || 0,
      no2: data.no2 || 0,
      so2: data.so2 || 0,
      co: data.co || 0,
      o3: data.o3 || 0,
      nh3: data.nh3 || 0,
    };
  }
}
