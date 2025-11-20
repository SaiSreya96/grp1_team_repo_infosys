import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Location, AirQualityReading, Prediction } from '../lib/supabase';

export function useAirQuality(locationName: string) {
  const [location, setLocation] = useState<Location | null>(null);
  const [currentReading, setCurrentReading] = useState<AirQualityReading | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .select('*')
          .eq('name', locationName)
          .maybeSingle();

        if (locationError) throw locationError;
        if (!locationData) {
          setError('Location not found');
          return;
        }

        setLocation(locationData);

        const { data: readingData, error: readingError } = await supabase
          .from('air_quality_readings')
          .select('*')
          .eq('location_id', locationData.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (readingError) throw readingError;
        setCurrentReading(readingData);

        const { data: predictionsData, error: predictionsError } = await supabase
          .from('predictions')
          .select('*')
          .eq('location_id', locationData.id)
          .gte('prediction_date', new Date().toISOString().split('T')[0])
          .order('prediction_date', { ascending: true })
          .limit(7);

        if (predictionsError) throw predictionsError;
        setPredictions(predictionsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [locationName]);

  return { location, currentReading, predictions, loading, error };
}
