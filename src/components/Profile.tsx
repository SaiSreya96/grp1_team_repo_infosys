import { useEffect, useState } from "react";

interface Props {
  user: { name: string; email?: string } | null;
  onLogout: () => void;
  onDownloadReport?: () => void;
}

export default function Profile({ user, onLogout, onDownloadReport }: Props) {
  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [notificationThreshold, setNotificationThreshold] =
    useState<number>(200);
  const [realtime, setRealtime] = useState<boolean>(false);
  const [savedLocations, setSavedLocations] = useState<string[]>([
    "North Delhi",
  ]);
  const [recentActivity, setRecentActivity] = useState<string[]>([
    "Viewed AQI for North Delhi",
    "Downloaded AQI report",
  ]);

  const [aqiDisplay, setAqiDisplay] = useState<string>("--");
  const [pm25Display, setPm25Display] = useState<string>("--");
  const [pm10Display, setPm10Display] = useState<string>("--");

  useEffect(() => {
    try {
      const t = localStorage.getItem("airaware_notification_threshold");
      if (t) setNotificationThreshold(Number(t));

      const s = localStorage.getItem("airaware_saved_locations");
      if (s) setSavedLocations(JSON.parse(s));

      const r = localStorage.getItem("airaware_realtime");
      if (r) setRealtime(r === "true");

      const reading = localStorage.getItem("airaware_current_reading");
      if (reading) {
        const rj = JSON.parse(reading);
        setAqiDisplay(String(rj.aqi ?? "--"));
        setPm25Display(String(rj.pm25 ?? "--"));
        setPm10Display(String(rj.pm10 ?? "--"));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  function toggleRealtime() {
    const next = !realtime;
    setRealtime(next);
    localStorage.setItem("airaware_realtime", String(next));
  }

  function saveThreshold() {
    localStorage.setItem(
      "airaware_notification_threshold",
      String(notificationThreshold)
    );
    setRecentActivity((s) => [
      `Set notification threshold to ${notificationThreshold} AQI`,
      ...s.slice(0, 4),
    ]);
  }

  function clearSaved() {
    setSavedLocations([]);
    localStorage.removeItem("airaware_saved_locations");
    setRecentActivity((s) => ["Cleared saved locations", ...s.slice(0, 4)]);
  }

  function downloadReport() {
    // Prefer app-level generator if provided, otherwise simulate activity
    try {
      if (onDownloadReport) onDownloadReport();
    } catch (err) {
      // ignore
    }
    setRecentActivity((s) => ["Downloaded AQI report", ...s.slice(0, 4)]);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-[#071427] dark:border dark:border-[#21303a] rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold shadow">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {user.name}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user.email ?? "No email provided"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last seen: just now
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0 md:ml-auto flex items-center gap-3">
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded shadow-sm hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-[#071427] p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Account
              </div>
              <div className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                {user.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {user.email ?? "No email provided"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Notification Threshold
              </div>
              <div className="mt-1 font-semibold">
                {notificationThreshold} AQI
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-[#06202a] rounded shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Saved Locations
              </div>
              <ul className="mt-2 list-disc ml-5 text-sm text-gray-800 dark:text-gray-100">
                {savedLocations.length ? (
                  savedLocations.map((loc) => <li key={loc}>{loc}</li>)
                ) : (
                  <li className="text-gray-500 dark:text-gray-400">
                    No saved locations
                  </li>
                )}
              </ul>
            </div>

            <div className="p-4 bg-white dark:bg-[#06202a] rounded shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Preferences
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm">Real-time updates</div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={realtime}
                    onChange={() => toggleRealtime()}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
              </div>
              <div className="mt-3">
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Alert threshold (AQI)
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="number"
                    value={notificationThreshold}
                    onChange={(e) =>
                      setNotificationThreshold(Number(e.target.value))
                    }
                    className="w-24 px-3 py-2 border rounded bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={saveThreshold}
                    className="bg-blue-600 text-white px-3 py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Recent activity
            </div>
            <ul className="mt-2 space-y-2 text-sm text-gray-800 dark:text-gray-100">
              {recentActivity.map((a, i) => (
                <li key={i} className="bg-white dark:bg-[#06202a] p-3 rounded">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-span-1 bg-gray-50 dark:bg-[#071427] p-6 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            AQI Snapshot
          </div>
          <div className="mt-3">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {aqiDisplay}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              PM2.5: {pm25Display} • PM10: {pm10Display}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Actions
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={downloadReport}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Download AQI Report
              </button>
              <button
                onClick={clearSaved}
                className="flex-1 bg-gray-200 dark:bg-[#0b2a36] text-gray-800 dark:text-gray-200 py-2 rounded hover:bg-gray-300"
              >
                Clear Saved
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
