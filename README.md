# 🌍 AirAware - Smart Air Quality Monitoring & Prediction System

A comprehensive full-stack application for real-time air quality monitoring, ML-powered predictions, and health recommendations.

## ✨ Features

### 🎯 Core Functionality
- **Real-time AQI Monitoring** - Live air quality index tracking across multiple locations
- **ML-Powered Predictions** - 7-day AQI forecast using Gradient Boosting Regressor
- **Multi-Source Data** - Integrates WAQI and OpenWeatherMap APIs with intelligent fallback
- **Pollutant Breakdown** - Detailed tracking of PM2.5, PM10, O3, NO2, SO2, CO, NH3
- **Health Recommendations** - Personalized advice based on current air quality
- **Intelligent ChatBot** - Rule-based assistant for air quality queries

### 🔐 User Features
- **Authentication** - Email/password and OAuth support via Supabase
- **Profile Management** - Customizable user settings
- **High AQI Alerts** - Automatic notifications when AQI exceeds threshold (200)
- **PDF Reports** - Generate printable air quality reports
- **Dark/Light Mode** - Theme persistence across sessions

### 📊 Technical Features
- **Supabase Realtime** - Live data synchronization
- **Auto-refresh** - Optional 10-minute data updates
- **Location Selection** - Support for multiple regions
- **Historical Data** - PostgreSQL-backed data storage
- **REST API** - Flask-powered ML prediction endpoint

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (3.12+)
- Supabase Account
- API Keys (WAQI, OpenWeatherMap)

### Installation

1. **Install Dependencies**
```powershell
npm install
pip install pandas numpy scikit-learn flask flask-cors
```

2. **Configure Environment**
Create `.env` file with your credentials (see .env.example)

3. **Train ML Model**
```powershell
python model.py
```

4. **Start Application**

Terminal 1:
```powershell
python api.py          # Flask API on port 5000
```

Terminal 2:
```powershell
npm run dev            # React frontend on port 5173
```

5. **Access Application**
- Frontend: http://localhost:5173
- ML API: http://localhost:5000

---

## 🏗️ Technology Stack

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS  
**Backend:** Supabase (PostgreSQL) + Flask REST API  
**ML Model:** Gradient Boosting Regressor (R² = 0.9978)  
**APIs:** WAQI + OpenWeatherMap

---

## 📊 Project Status

✅ ML model trained and integrated  
✅ Flask API serving predictions  
✅ React frontend running  
✅ Real-time data synchronization  
✅ Multi-source API integration  
✅ Authentication & user management  

---

## 📝 Documentation

See full documentation in project files:
- `model.py` - ML training pipeline
- `api.py` - Flask API endpoints
- `src/services/` - Frontend services
- `supabase/migrations/` - Database schema

---

**Built with ❤️ for cleaner air and healthier communities**