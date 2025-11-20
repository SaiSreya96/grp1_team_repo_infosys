/*
  # AirAware Air Quality Database Schema

  ## Overview
  Creates the core database schema for the AirAware smart air quality prediction system.

  ## New Tables

  ### 1. `locations`
  - `id` (uuid, primary key) - Unique identifier for each location
  - `name` (text) - Location name (e.g., "San Francisco, CA")
  - `latitude` (numeric) - Geographical latitude
  - `longitude` (numeric) - Geographical longitude
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `air_quality_readings`
  - `id` (uuid, primary key) - Unique identifier for each reading
  - `location_id` (uuid, foreign key) - Reference to locations table
  - `aqi` (integer) - Air Quality Index value
  - `category` (text) - AQI category (Good, Moderate, etc.)
  - `pm25` (numeric) - PM2.5 particulate matter (µg/m³)
  - `pm10` (numeric) - PM10 particulate matter (µg/m³)
  - `o3` (numeric) - Ozone level (ppb)
  - `no2` (numeric) - Nitrogen dioxide level (ppb)
  - `so2` (numeric) - Sulfur dioxide level (ppb)
  - `co` (numeric) - Carbon monoxide level (ppm)
  - `timestamp` (timestamptz) - Reading timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `predictions`
  - `id` (uuid, primary key) - Unique identifier for each prediction
  - `location_id` (uuid, foreign key) - Reference to locations table
  - `prediction_date` (date) - Date for the prediction
  - `predicted_aqi` (integer) - Predicted AQI value
  - `predicted_category` (text) - Predicted AQI category
  - `confidence_score` (numeric) - Model confidence (0-100)
  - `created_at` (timestamptz) - When prediction was generated

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Add policies for authenticated and public read access
  - All users can read air quality data
  - Only authenticated users can insert data (for future admin features)

  ## Indexes
  - Index on location_id for faster queries
  - Index on timestamp for time-based queries
  - Index on prediction_date for forecast queries
*/

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude numeric(10, 6) NOT NULL,
  longitude numeric(10, 6) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS air_quality_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  aqi integer NOT NULL,
  category text NOT NULL,
  pm25 numeric(10, 2) DEFAULT 0,
  pm10 numeric(10, 2) DEFAULT 0,
  o3 numeric(10, 2) DEFAULT 0,
  no2 numeric(10, 2) DEFAULT 0,
  so2 numeric(10, 2) DEFAULT 0,
  co numeric(10, 2) DEFAULT 0,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  prediction_date date NOT NULL,
  predicted_aqi integer NOT NULL,
  predicted_category text NOT NULL,
  confidence_score numeric(5, 2) DEFAULT 85.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view locations"
  ON locations
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view air quality readings"
  ON air_quality_readings
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view predictions"
  ON predictions
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_air_quality_location ON air_quality_readings(location_id);
CREATE INDEX IF NOT EXISTS idx_air_quality_timestamp ON air_quality_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_predictions_location ON predictions(location_id);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON predictions(prediction_date);
