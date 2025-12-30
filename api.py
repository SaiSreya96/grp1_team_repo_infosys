"""
Flask API for AirAware ML Model
Serves predictions for air quality index based on pollutant concentrations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load the trained model
try:
    with open('best_aqi_model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("✓ Model loaded successfully!")
except FileNotFoundError:
    print("Error: best_aqi_model.pkl not found. Please train the model first.")
    exit(1)

def get_aqi_category(aqi):
    """Convert AQI value to category and description"""
    if aqi <= 50:
        return {
            "category": "Good",
            "color": "#00e400",
            "description": "Air quality is satisfactory, and air pollution poses little or no risk"
        }
    elif aqi <= 100:
        return {
            "category": "Moderate",
            "color": "#ffff00",
            "description": "Air quality is acceptable. However, there may be a risk for some people"
        }
    elif aqi <= 150:
        return {
            "category": "Unhealthy for Sensitive Groups",
            "color": "#ff7e00",
            "description": "Members of sensitive groups may experience health effects"
        }
    elif aqi <= 200:
        return {
            "category": "Unhealthy",
            "color": "#ff0000",
            "description": "Some members of the general public may experience health effects"
        }
    elif aqi <= 300:
        return {
            "category": "Very Unhealthy",
            "color": "#8f3f97",
            "description": "Health alert: The risk of health effects is increased for everyone"
        }
    else:
        return {
            "category": "Hazardous",
            "color": "#7e0023",
            "description": "Health warning of emergency conditions: everyone is more likely to be affected"
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model_loaded": True}), 200

@app.route('/predict', methods=['POST'])
def predict_aqi():
    """
    Predict AQI from pollutant concentrations
    
    Expected JSON body:
    {
        "pm2_5": float,
        "pm10": float,
        "no2": float,
        "so2": float,
        "co": float,
        "o3": float,
        "nh3": float
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3', 'nh3']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Prepare input for prediction
        input_data = pd.DataFrame([{
            'pm2_5': float(data['pm2_5']),
            'pm10': float(data['pm10']),
            'no2': float(data['no2']),
            'so2': float(data['so2']),
            'co': float(data['co']),
            'o3': float(data['o3']),
            'nh3': float(data['nh3'])
        }])
        
        # Make prediction
        predicted_aqi = model.predict(input_data)[0]
        predicted_aqi = max(0, round(predicted_aqi))  # Ensure non-negative integer
        
        # Get category and details
        aqi_info = get_aqi_category(predicted_aqi)
        
        return jsonify({
            "predicted_aqi": int(predicted_aqi),
            "category": aqi_info["category"],
            "color": aqi_info["color"],
            "description": aqi_info["description"],
            "input_pollutants": data
        }), 200
        
    except ValueError as e:
        return jsonify({"error": f"Invalid input values: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict AQI for multiple readings (for forecasting)
    
    Expected JSON body:
    {
        "readings": [
            {
                "pm2_5": float,
                "pm10": float,
                ...
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if 'readings' not in data or not isinstance(data['readings'], list):
            return jsonify({"error": "Expected 'readings' array in request body"}), 400
        
        results = []
        for reading in data['readings']:
            input_data = pd.DataFrame([reading])
            predicted_aqi = model.predict(input_data)[0]
            predicted_aqi = max(0, round(predicted_aqi))
            aqi_info = get_aqi_category(predicted_aqi)
            
            results.append({
                "predicted_aqi": int(predicted_aqi),
                "category": aqi_info["category"],
                "color": aqi_info["color"]
            })
        
        return jsonify({"predictions": results}), 200
        
    except Exception as e:
        return jsonify({"error": f"Batch prediction failed: {str(e)}"}), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    try:
        model_type = type(model.named_steps['model']).__name__
        feature_names = ['pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3', 'nh3']
        
        return jsonify({
            "model_type": model_type,
            "features": feature_names,
            "feature_count": len(feature_names),
            "description": "AQI prediction model trained on Delhi air quality data"
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to get model info: {str(e)}"}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🌍 AirAware ML API Server")
    print("="*60)
    print("Model: Gradient Boosting Regressor")
    print("Features: PM2.5, PM10, NO2, SO2, CO, O3, NH3")
    print("Server running on: http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
