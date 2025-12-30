import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AirQualityService } from '../services/airQualityService';
import type { Location, AirQualityReading, Prediction } from '../lib/supabase';

export function useAirQuality(locationName: string) {
  const [location, setLocation] = useState<Location | null>(null);
  const [currentReading, setCurrentReading] = useState<AirQualityReading | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  // Function to fetch fresh data
  const fetchData = useCallback(async (shouldFetchRealTime = false) => {
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
        setLoading(false);
        return;
      }

      setLocation(locationData);

      // If real-time fetching is requested, update from external APIs
      if (shouldFetchRealTime) {
        try {
          await AirQualityService.updateLocationData(locationData);
          console.log('Real-time data fetched and stored');
        } catch (updateError) {
          console.warn('Failed to fetch real-time data:', updateError);
        }
      }

      // Fetch current reading (with a small delay if we just stored new data)
      if (shouldFetchRealTime) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const { data: readingData, error: readingError } = await supabase
        .from('air_quality_readings')
        .select('*')
        .eq('location_id', locationData.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (readingError) throw readingError;
      setCurrentReading(readingData);

      // Fetch predictions
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
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [locationName]);

  // Set up real-time subscription
  useEffect(() => {
    if (!location) return;

    const channel = supabase
      .channel(`air_quality_${location.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'air_quality_readings',
          filter: `location_id=eq.${location.id}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          if (payload.new) {
            setCurrentReading(payload.new as AirQualityReading);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [location]);

  // Initial data fetch on location change
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Set up periodic real-time updates (every 10 minutes instead of 30)
  useEffect(() => {
    if (!isRealTimeEnabled || !location) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, location, fetchData]);

  // Manual refresh function
  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Toggle real-time updates
  const toggleRealTime = useCallback(() => {
    setIsRealTimeEnabled(prev => !prev);
  }, []);

  return { 
    location, 
    currentReading, 
    predictions, 
    loading, 
    error,
    isRealTimeEnabled,
    refreshData,
    toggleRealTime
  };
}