export default function About() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
        About AirAware
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        AirAware is a lightweight air-quality dashboard focused on making local
        AQI and pollutant information understandable and actionable. It combines
        public data, weather context and simple ML predictions to help users
        monitor conditions, download reports, and receive alerts when air
        quality is poor.
      </p>

      <div className="space-y-4">
        <section>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
            How it works
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            AirAware aggregates real-time readings from public APIs and
            community sensors, normalizes pollutant concentrations, computes an
            AQI value, and surfaces trend-based predictions. The chatbot
            provides heuristic guidance (not medical advice) and the report
            export creates a printable snapshot of the current reading.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
            Data sources
          </h3>
          <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-300">
            <li>World Air Quality Index (WAQI) feeds</li>
            <li>OpenWeatherMap (for weather and contextual signals)</li>
            <li>Optional community sensor networks where available</li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
            Privacy & limitations
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This demo stores only minimal, local data in your browser (a
            lightweight profile and theme preference). No user data is
            transmitted to any third-party by this app unless you explicitly use
            OAuth sign-in. Readings are fetched from public APIs and may have
            gaps or delays.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
            Interpretation & safety
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            AQI categories indicate population-level risk. Sensitive groups
            (children, elderly, people with respiratory conditions) should take
            extra precautions when AQI is elevated. The recommendations shown in
            the app are heuristic and should not replace professional medical
            advice.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
            Contributing & source
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This project is open-source and intended as a demo. Contributions
            are welcome — see the repository README for how to run locally, add
            data sources, or improve models and UI.
          </p>
        </section>
      </div>

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p>
          For development notes, see the project README. This is a demonstration
          tool — use it as a guide, not a certified monitoring system.
        </p>
      </div>
    </div>
  );
}
