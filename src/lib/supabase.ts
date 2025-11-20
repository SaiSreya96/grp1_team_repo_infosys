import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface AirQualityReading {
  id: string;
  location_id: string;
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  timestamp: string;
  created_at: string;
}

export interface Prediction {
  id: string;
  location_id: string;
  prediction_date: string;
  predicted_aqi: number;
  predicted_category: string;
  confidence_score: number;
  created_at: string;
}
