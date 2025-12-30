import { useEffect, useState } from "react";
import {
  Wind,
  TrendingUp,
  Calendar,
  Loader,
  RefreshCw,
  Wifi,
  WifiOff,
  Sun,
  Moon,
} from "lucide-react";
import AQICard from "./components/AQICard";
import LocationSelector from "./components/LocationSelector";
import PollutantBreakdown from "./components/PollutantBreakdown";
import HealthRecommendations from "./components/HealthRecommendations";
import PredictionChart from "./components/PredictionChart";
import RegionInfo from "./components/RegionInfo";
import { useAirQuality } from "./hooks/useAirQuality";
import { getAQICategory, calculateTrend } from "./utils/airQuality";
import Login from "./components/Login";
import Profile from "./components/Profile";
import ChatBot from "./components/ChatBot";
import NotificationToast from "./components/NotificationToast";
import About from "./components/About";
import WeatherAgent from "./components/WeatherAgent";
import ShareLogo from "./components/ShareLogo";
import AccountSettings from "./components/AccountSettings";
import MLDemo from "./components/MLDemo";
import MLStatusBadge from "./components/MLStatusBadge";
import { supabase } from "./lib/supabase";

function App() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  const [chatBotOpen, setChatBotOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("North Delhi");
  const {
    currentReading,
    predictions,
    loading,
    error,
    isRealTimeEnabled,
    refreshData,
    toggleRealTime,
  } = useAirQuality(selectedLocation);

  // Simple auth (Supabase-backed)
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    () => {
      try {
        const raw = localStorage.getItem("airaware_user");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
  );

  const [page, setPage] = useState<"dashboard" | "profile" | "login" | "about">(
    user ? "dashboard" : "login"
  );

  // Theme (dark/light) persisted
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const t = localStorage.getItem("airaware_theme");
      return t === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      const el = document.documentElement;
      if (theme === "dark") el.classList.add("dark");
      else el.classList.remove("dark");
      localStorage.setItem("airaware_theme", theme);
    } catch (err) {
      console.warn("Failed to apply theme class", err);
    }
  }, [theme]);

  // Listen for auth state changes (for OAuth)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user = {
          name:
            session.user.user_metadata?.name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
          email: session.user.email!,
        };
        localStorage.setItem("airaware_user", JSON.stringify(user));
        setUser(user);
        setPage("dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function generateAQIPDF() {
    if (!currentReading) {
      alert("No reading available to generate report.");
      return;
    }

    try {
      // Build a local pollutants snapshot from the current reading
      const localPollutants = [
        { name: "PM2.5", value: currentReading.pm25, unit: "µg/m³" },
        { name: "PM10", value: currentReading.pm10, unit: "µg/m³" },
        { name: "O3", value: currentReading.o3, unit: "ppb" },
        { name: "NO2", value: currentReading.no2, unit: "ppb" },
        { name: "SO2", value: currentReading.so2, unit: "ppb" },
        { name: "CO", value: currentReading.co, unit: "ppm" },
      ];

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <title>AQI Report</title>
            <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}</style>
          </head>
          <body>
            <h1>AirAware AQI Report</h1>
            <p><strong>Location:</strong> ${selectedLocation}</p>
            <p><strong>AQI:</strong> ${currentReading.aqi} (${
        currentReading.category
      })</p>
            <p><strong>Time:</strong> ${new Date(
              currentReading.timestamp
            ).toLocaleString()}</p>
            <h3>Pollutants</h3>
            <ul>
              ${localPollutants
                .map(
                  (p) =>
                    `<li><strong>${p.name}:</strong> ${p.value} ${p.unit}</li>`
                )
                .join("")}
            </ul>
          </body>
        </html>`;

      const w = window.open("", "_blank");
      if (!w) return;
      w.document.write(html);
      w.document.close();
      // Give the window a moment to render
      setTimeout(() => {
        try {
          w.print();
        } catch (err) {
          // ignore print errors (popup blocked or print not available)
          console.debug("Print failed", err);
        }
      }, 500);
    } catch (err) {
      console.error("Failed to generate report", err);
      alert("Failed to generate PDF report.");
    }
  }

  const userInitials = user
    ? user.name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const [notifications, setNotifications] = useState<
    { id: string; title: string; body?: string }[]
  >([]);

  useEffect(() => {
    if (!currentReading) return;
    const threshold = 200; // AQI threshold for alert
    if (currentReading.aqi >= threshold) {
      const id = String(Date.now());
      setNotifications((n) => [
        {
          id,
          title: `High AQI: ${currentReading.aqi}`,
          body: `Category: ${currentReading.category}`,
        },
        ...n,
      ]);
    }
  }, [currentReading]);

  function onLogout() {
    localStorage.removeItem("airaware_user");
    setUser(null);
    setPage("login");
  }

  function updateProfile(updatedUser: { name: string; email: string }) {
    setUser(updatedUser);
  }

  function dismissNotification(id: string) {
    setNotifications((n) => n.filter((x) => x.id !== id));
  }

  // If not logged in, show login screen
  if (!user && page === "login") {
    return (
      <Login
        onLogin={(u) => {
          setUser(u);
          setPage("dashboard");
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading air quality data...</p>
        </div>
      </div>
    );
  }

  if (error || !currentReading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-red-600 mb-4">
            No data available for this location yet.
          </p>
          <p className="text-gray-600 text-sm">
            Please select a different location.
          </p>
        </div>
      </div>
    );
  }

  const currentAQI = getAQICategory(currentReading.aqi);

  const pollutants = [
    {
      name: "PM2.5",
      value: currentReading.pm25,
      unit: "µg/m³",
      trend: calculateTrend(currentReading.pm25),
      percentage: Math.min((currentReading.pm25 / 50) * 100, 100),
    },
    {
      name: "PM10",
      value: currentReading.pm10,
      unit: "µg/m³",
      trend: calculateTrend(currentReading.pm10),
      percentage: Math.min((currentReading.pm10 / 100) * 100, 100),
    },
    {
      name: "O3",
      value: currentReading.o3,
      unit: "ppb",
      trend: calculateTrend(currentReading.o3),
      percentage: Math.min((currentReading.o3 / 70) * 100, 100),
    },
    {
      name: "NO2",
      value: currentReading.no2,
      unit: "ppb",
      trend: calculateTrend(currentReading.no2),
      percentage: Math.min((currentReading.no2 / 50) * 100, 100),
    },
    {
      name: "SO2",
      value: currentReading.so2,
      unit: "ppb",
      trend: calculateTrend(currentReading.so2),
      percentage: Math.min((currentReading.so2 / 35) * 100, 100),
    },
    {
      name: "CO",
      value: currentReading.co,
      unit: "ppm",
      trend: calculateTrend(currentReading.co),
      percentage: Math.min((currentReading.co / 4) * 100, 100),
    },
  ];

  const avgPrediction =
    predictions.length > 0
      ? Math.round(
          predictions.reduce((sum, p) => sum + p.predicted_aqi, 0) /
            predictions.length
        )
      : currentReading.aqi;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-y-2">
            {/* Branding */}
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen((v) => !v)}
                  className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-haspopup="true"
                  aria-expanded={userDropdownOpen ? "true" : "false"}
                  tabIndex={0}
                >
                  {userInitials}
                </button>
                {userDropdownOpen && (
                  <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 animate-fade-in">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setPage("profile");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setAccountSettingsOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Account Settings
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight truncate">
                  AirAware Delhi
                </h1>
                <span className="text-xs text-gray-500">
                  Delhi Air Quality Monitoring
                </span>
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-4">
              <MLStatusBadge />
              <div className="flex gap-2">
                <button
                  onClick={toggleRealTime}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isRealTimeEnabled
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="Toggle real-time updates"
                >
                  {isRealTimeEnabled ? (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span>Offline</span>
                    </>
                  )}
                </button>
                <button
                  onClick={refreshData}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <ShareLogo location={selectedLocation} />
              </div>
            </div>
            {/* Nav links */}
            <nav className="header-nav hidden md:flex gap-1 px-3">
              <button
                onClick={() => setPage("dashboard")}
                className={`text-xs px-3 py-2 rounded-md hover:bg-gray-100 ${
                  page === "dashboard" ? "font-semibold" : ""
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setPage("about")}
                className={`text-xs px-3 py-2 rounded-md hover:bg-gray-100 ${
                  page === "about" ? "font-semibold" : ""
                }`}
              >
                About
              </button>
            </nav>
            {/* Theme Toggle and Location Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="p-2 rounded-md hover:bg-gray-100"
                title="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-gray-700" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
              </button>
              <div className="w-[150px]">
                <LocationSelector
                  location={selectedLocation}
                  onLocationChange={setSelectedLocation}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {notifications.length > 0 && (
        <NotificationToast
          items={notifications}
          onDismiss={dismissNotification}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {page === "profile" ? (
          <Profile
            user={user}
            onLogout={onLogout}
            onDownloadReport={generateAQIPDF}
          />
        ) : page === "about" ? (
          <About />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <AQICard aqi={currentAQI} location={selectedLocation} />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quick Stats
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current AQI</span>
                    <span className="text-lg font-bold text-gray-900">
                      {currentReading.aqi}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="text-sm font-semibold">
                      {currentReading.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-xs text-gray-500">
                      {new Date(currentReading.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">7-Day Avg</span>
                    <span className="text-lg font-bold text-gray-900">
                      {avgPrediction} AQI
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Real-time Updates
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {isRealTimeEnabled
                            ? "Auto-refresh every 30 minutes"
                            : "Manual refresh only"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="w-48">
                        <WeatherAgent location={selectedLocation} />
                      </div>
                      <div>
                        <button
                          onClick={generateAQIPDF}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                          Download AQI Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <PollutantBreakdown pollutants={pollutants} />
              <HealthRecommendations category={currentAQI.category} />
            </div>

            <div className="mb-8">
              <RegionInfo region={selectedLocation} />
            </div>

            <div className="mb-8">
              <MLDemo />
            </div>

            <PredictionChart
              predictions={predictions}
              currentAQI={currentReading.aqi}
            />
            {/* Chatbot FAB + expandable panel */}
            {accountSettingsOpen && user && (
              <AccountSettings
                user={user}
                onClose={() => setAccountSettingsOpen(false)}
                onUpdateProfile={updateProfile}
              />
            )}
            {chatBotOpen ? (
              <div className="fixed bottom-24 right-6 w-80 hidden md:block z-50 pointer-events-auto animate-fade-in">
                <div className="absolute -top-6 -right-6">
                  <button
                    onClick={() => setChatBotOpen(false)}
                    className="w-10 h-10 rounded-full bg-blue-600 text-white shadow flex items-center justify-center text-2xl hover:bg-blue-700"
                  >
                    ×
                  </button>
                </div>
                <ChatBot />
              </div>
            ) : (
              <button
                onClick={() => setChatBotOpen(true)}
                className="fixed bottom-24 right-6 w-16 h-16 hidden md:flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg z-50 hover:bg-blue-700 focus:outline-none transition-transform transform hover:scale-105 animate-fade-in"
                aria-label="Open chatbot"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="w-8 h-8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect
                    x="5"
                    y="9"
                    width="14"
                    height="8"
                    rx="4"
                    fill="#fff"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                  />
                  <circle cx="9" cy="13" r="1.3" fill="#2563eb" />
                  <circle cx="15" cy="13" r="1.3" fill="#2563eb" />
                  <rect
                    x="10.5"
                    y="15.5"
                    width="3"
                    height="1"
                    rx="0.5"
                    fill="#2563eb"
                  />
                  <rect
                    x="11"
                    y="5"
                    width="2"
                    height="3"
                    rx="1"
                    fill="#2563eb"
                  />
                  <rect
                    x="6"
                    y="7"
                    width="1.3"
                    height="1.3"
                    rx="0.65"
                    fill="#2563eb"
                  />
                  <rect
                    x="16.7"
                    y="7"
                    width="1.3"
                    height="1.3"
                    rx="0.65"
                    fill="#2563eb"
                  />
                </svg>
              </button>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            {isRealTimeEnabled
              ? "Live data updates every 30 minutes"
              : "Data updates on refresh"}{" "}
            • Predictions powered by machine learning algorithms • Real-time
            data from WAQI and OpenWeatherMap APIs
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
