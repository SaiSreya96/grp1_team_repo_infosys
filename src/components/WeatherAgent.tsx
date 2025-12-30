import { useEffect, useState } from "react";

type Props = { location: string };

// Simple mapping for demo — extend with real geocoding in future
const COORDS: Record<string, { lat: number; lon: number }> = {
  "North Delhi": { lat: 28.7041, lon: 77.1025 },
  "Central Delhi": { lat: 28.6139, lon: 77.209 },
  "South Delhi": { lat: 28.5245, lon: 77.1855 },
};

export default function WeatherAgent({ location }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temp, setTemp] = useState<number | null>(null);
  const [wind, setWind] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const coords = COORDS[location] ?? { lat: 28.6139, lon: 77.209 }; // default to Delhi
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather fetch failed");
        const data = await res.json();
        const cw = data.current_weather;
        if (cw) {
          setTemp(Number(cw.temperature));
          setWind(Number(cw.windspeed));
        } else {
          setError("No weather data");
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Failed");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [location]);

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900">Weather</h4>
      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-xs text-red-500">{error}</div>
      ) : (
        <div className="text-sm text-gray-700">
          <div>Temp: {temp ?? "--"}°C</div>
          <div>Wind: {wind ?? "--"} km/h</div>
        </div>
      )}
    </div>
  );
}
