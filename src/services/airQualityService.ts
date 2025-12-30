import { supabase } from "../lib/supabase";
import type { Location, AirQualityReading } from "../lib/supabase";

export interface ExternalAQIData {
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  timestamp: string;
}

export class AirQualityService {
  private static readonly WAQI_BASE_URL = "https://api.waqi.info";
  private static readonly OPENWEATHER_BASE_URL =
    "https://api.openweathermap.org/data/2.5";

  // Fetch data from WAQI API
  static async fetchFromWAQI(
    lat: number,
    lon: number
  ): Promise<ExternalAQIData | null> {
    try {
      const apiKey = import.meta.env.VITE_WAQI_API_KEY;
      if (!apiKey) return null;

      const response = await fetch(
        `${this.WAQI_BASE_URL}/feed/geo:${lat};${lon}/?token=${apiKey}`
      );

      if (!response.ok) return null;

      const data = await response.json();

      if (data.status !== "ok" || !data.data) return null;

      const iaqi = data.data.iaqi;

      return {
        aqi: data.data.aqi || 0,
        category: this.getAQICategory(data.data.aqi || 0),
        pm25: iaqi.pm25?.v || 0,
        pm10: iaqi.pm10?.v || 0,
        o3: iaqi.o3?.v || 0,
        no2: iaqi.no2?.v || 0,
        so2: iaqi.so2?.v || 0,
        co: iaqi.co?.v || 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("WAQI API error:", error);
      return null;
    }
  }

  // Fetch data from OpenWeatherMap API
  static async fetchFromOpenWeather(
    lat: number,
    lon: number
  ): Promise<ExternalAQIData | null> {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) return null;

      const response = await fetch(
        `${this.OPENWEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );

      if (!response.ok) return null;

      const data = await response.json();

      if (!data.list || data.list.length === 0) return null;

      const components = data.list[0].components;

      // Calculate AQI from components (simplified calculation)
      const aqi = this.calculateAQIFromComponents(components);

      return {
        aqi,
        category: this.getAQICategory(aqi),
        pm25: components.pm2_5 || 0,
        pm10: components.pm10 || 0,
        o3: components.o3 || 0,
        no2: components.no2 || 0,
        so2: components.so2 || 0,
        co: components.co || 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("OpenWeather API error:", error);
      return null;
    }
  }

  // Fetch data from multiple sources and return the best available
  static async fetchRealTimeData(
    lat: number,
    lon: number
  ): Promise<ExternalAQIData | null> {
    // Try WAQI first (more accurate)
    const waqiData = await this.fetchFromWAQI(lat, lon);
    if (waqiData) return waqiData;

    // Fallback to OpenWeatherMap
    const owData = await this.fetchFromOpenWeather(lat, lon);
    if (owData) return owData;

    return null;
  }

  // Store data in Supabase
  static async storeReading(
    locationId: string,
    data: ExternalAQIData
  ): Promise<void> {
    try {
      const { error } = await supabase.from("air_quality_readings").insert({
        location_id: locationId,
        aqi: data.aqi,
        category: data.category,
        pm25: data.pm25,
        pm10: data.pm10,
        o3: data.o3,
        no2: data.no2,
        so2: data.so2,
        co: data.co,
        timestamp: data.timestamp,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error storing air quality reading:", error);
      throw error;
    }
  }

  // Get latest reading for a location
  static async getLatestReading(
    locationId: string
  ): Promise<AirQualityReading | null> {
    try {
      const { data, error } = await supabase
        .from("air_quality_readings")
        .select("*")
        .eq("location_id", locationId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching latest reading:", error);
      return null;
    }
  }

  // Update data for a location (fetch + store)
  static async updateLocationData(location: Location): Promise<void> {
    try {
      const realTimeData = await this.fetchRealTimeData(
        location.latitude,
        location.longitude
      );

      if (realTimeData) {
        await this.storeReading(location.id, realTimeData);
        console.log(`Updated air quality data for ${location.name}`);
      } else {
        console.warn(`Failed to fetch real-time data for ${location.name}`);
      }
    } catch (error) {
      console.error(`Error updating data for ${location.name}:`, error);
    }
  }

  // Helper method to calculate AQI category
  private static getAQICategory(aqi: number): string {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  }

  // Simplified AQI calculation from components
  private static calculateAQIFromComponents(
    components: Record<string, number | undefined>
  ): number {
    // This is a simplified calculation - in production, you'd use EPA's AQI calculation formula
    const pm25 = components.pm2_5 || 0;
    const pm10 = components.pm10 || 0;
    const o3 = components.o3 || 0;
    const no2 = components.no2 || 0;
    const so2 = components.so2 || 0;
    const co = components.co || 0;

    // Use the highest contributing factor for AQI
    const pm25AQI = this.calculatePM25AQI(pm25);
    const pm10AQI = this.calculatePM10AQI(pm10);
    const o3AQI = this.calculateO3AQI(o3);
    const no2AQI = this.calculateNO2AQI(no2);
    const so2AQI = this.calculateSO2AQI(so2);
    const coAQI = this.calculateCOAQI(co);

    return Math.max(pm25AQI, pm10AQI, o3AQI, no2AQI, so2AQI, coAQI);
  }

  // Individual AQI calculation methods (simplified EPA formulas)
  private static calculatePM25AQI(pm25: number): number {
    if (pm25 <= 12.0) return (pm25 / 12.0) * 50;
    if (pm25 <= 35.4) return ((pm25 - 12.0) / 23.4) * 50 + 50;
    if (pm25 <= 55.4) return ((pm25 - 35.4) / 20.0) * 50 + 100;
    if (pm25 <= 150.4) return ((pm25 - 55.4) / 95.0) * 50 + 150;
    if (pm25 <= 250.4) return ((pm25 - 150.4) / 100.0) * 50 + 200;
    if (pm25 <= 350.4) return ((pm25 - 250.4) / 100.0) * 50 + 300;
    return ((pm25 - 350.4) / 100.0) * 50 + 400;
  }

  private static calculatePM10AQI(pm10: number): number {
    if (pm10 <= 54) return (pm10 / 54) * 50;
    if (pm10 <= 154) return ((pm10 - 54) / 100) * 50 + 50;
    if (pm10 <= 254) return ((pm10 - 154) / 100) * 50 + 100;
    if (pm10 <= 354) return ((pm10 - 254) / 100) * 50 + 150;
    if (pm10 <= 424) return ((pm10 - 354) / 70) * 50 + 200;
    if (pm10 <= 504) return ((pm10 - 424) / 80) * 50 + 300;
    return ((pm10 - 504) / 100) * 50 + 400;
  }

  private static calculateO3AQI(o3: number): number {
    const ppm = o3 / 1000; // Convert ppb to ppm
    if (ppm <= 0.054) return (ppm / 0.054) * 50;
    if (ppm <= 0.07) return ((ppm - 0.054) / 0.016) * 50 + 50;
    if (ppm <= 0.085) return ((ppm - 0.07) / 0.015) * 50 + 100;
    if (ppm <= 0.105) return ((ppm - 0.085) / 0.02) * 50 + 150;
    if (ppm <= 0.2) return ((ppm - 0.105) / 0.095) * 50 + 200;
    return ((ppm - 0.2) / 0.1) * 50 + 300;
  }

  private static calculateNO2AQI(no2: number): number {
    const ppm = no2 / 1000; // Convert ppb to ppm
    if (ppm <= 0.053) return (ppm / 0.053) * 50;
    if (ppm <= 0.1) return ((ppm - 0.053) / 0.047) * 50 + 50;
    if (ppm <= 0.36) return ((ppm - 0.1) / 0.26) * 50 + 100;
    if (ppm <= 0.649) return ((ppm - 0.36) / 0.289) * 50 + 150;
    if (ppm <= 1.249) return ((ppm - 0.649) / 0.6) * 50 + 200;
    return ((ppm - 1.249) / 0.6) * 50 + 300;
  }

  private static calculateSO2AQI(so2: number): number {
    const ppm = so2 / 1000; // Convert ppb to ppm
    if (ppm <= 0.035) return (ppm / 0.035) * 50;
    if (ppm <= 0.075) return ((ppm - 0.035) / 0.04) * 50 + 50;
    if (ppm <= 0.185) return ((ppm - 0.075) / 0.11) * 50 + 100;
    if (ppm <= 0.304) return ((ppm - 0.185) / 0.119) * 50 + 150;
    if (ppm <= 0.604) return ((ppm - 0.304) / 0.3) * 50 + 200;
    if (ppm <= 0.804) return ((ppm - 0.604) / 0.2) * 50 + 300;
    return ((ppm - 0.804) / 0.2) * 50 + 400;
  }

  private static calculateCOAQI(co: number): number {
    const ppm = co / 1000; // Convert ppm to consistent units if needed
    if (ppm <= 4.4) return (ppm / 4.4) * 50;
    if (ppm <= 9.4) return ((ppm - 4.4) / 5.0) * 50 + 50;
    if (ppm <= 12.4) return ((ppm - 9.4) / 3.0) * 50 + 100;
    if (ppm <= 15.4) return ((ppm - 12.4) / 3.0) * 50 + 150;
    if (ppm <= 30.4) return ((ppm - 15.4) / 15.0) * 50 + 200;
    if (ppm <= 40.4) return ((ppm - 30.4) / 10.0) * 50 + 300;
    return ((ppm - 40.4) / 10.0) * 50 + 400;
  }
}
