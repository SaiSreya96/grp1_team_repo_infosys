import pandas as pd
import numpy as np
import pickle
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
# from xgboost import XGBRegressor
from sklearn.metrics import r2_score

# 1. Load Data
try:
    df = pd.read_csv("delhi_aqi.csv")
except FileNotFoundError:
    print("Error: delhi_aqi.csv not found.")
    exit()

# 2. AQI Calculation Logic
breakpoints = {
    "pm2_5": [(0,30,0,50),(31,60,51,100),(61,90,101,200),(91,120,201,300),
              (121,250,301,400),(251,500,401,500)],
    "pm10":  [(0,50,0,50),(51,100,51,100),(101,250,101,200),(251,350,201,300),
              (351,430,301,400),(431,600,401,500)],
    "no2":   [(0,40,0,50),(41,80,51,100),(81,180,101,200),(181,280,201,300),
              (281,400,301,400),(401,1000,401,500)],
    "so2":   [(0,40,0,50),(41,80,51,100),(81,380,101,200),(381,800,201,300),
              (801,1600,301,400),(1601,2000,401,500)],
    "co":    [(0,1,0,50),(1.1,2,51,100),(2.1,10,101,200),(10.1,17,201,300),
              (17.1,34,301,400),(34.1,50,401,500)],
    "o3":    [(0,50,0,50),(51,100,51,100),(101,168,101,200),(169,208,201,300),
              (209,748,301,400),(749,1000,401,500)],
    "nh3":   [(0,200,0,50),(201,400,51,100),(401,800,101,200),(801,1200,201,300),
              (1201,1800,301,400),(1801,3000,401,500)]
}

def calc_subindex(pollutant, value):
    if pollutant not in breakpoints: return None
    for bp_low, bp_high, si_low, si_high in breakpoints[pollutant]:
        if bp_low <= value <= bp_high:
            return ((si_high - si_low) / (bp_high - bp_low)) * (value - bp_low) + si_low
    return None

def compute_aqi(row):
    sub = []
    for pollutant in breakpoints.keys():
        if pollutant in row and not pd.isna(row[pollutant]):
            si = calc_subindex(pollutant, row[pollutant])
            if si is not None:
                sub.append(si)
    return max(sub) if sub else np.nan

# Create Target and clean data
df["AQI"] = df.apply(compute_aqi, axis=1)
df = df.dropna(subset=["AQI"]) # Critical: Remove rows where AQI is NaN

# 3. Features and Preprocessing
X = df.drop(columns=["AQI", "date"], errors='ignore')
y = df["AQI"]

numeric_features = X.columns
preprocessor = ColumnTransformer(
    transformers=[
        ("num", Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ]), numeric_features)
    ]
)

# 4. Model Selection with Overfitting Checks
models = {
    "Linear Regression": LinearRegression(),
    "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
    "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42),
    # "XGBoost": XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
}

results = {}
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"\n{'Model':<20} | {'Train R²':<10} | {'Test R²':<10} | {'CV Mean R²':<10}")
print("-" * 60)

for name, model in models.items():
    pipe = Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])
    
    # Cross-Validation Score
    cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring='r2')
    
    # Train/Test Score
    pipe.fit(X_train, y_train)
    train_acc = r2_score(y_train, pipe.predict(X_train))
    test_acc = r2_score(y_test, pipe.predict(X_test))
    
    results[name] = {"test_score": test_acc, "model_obj": model}
    
    print(f"{name:<20} | {train_acc:.4f}     | {test_acc:.4f}    | {cv_scores.mean():.4f}")

# 5. Finalize and Save
best_model_name = max(results, key=lambda k: results[k]["test_score"])
print(f"\nSelected Best Model: {best_model_name}")

# Re-train the best model on the FULL dataset
final_pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("model", results[best_model_name]["model_obj"])
])
final_pipeline.fit(X, y)

with open("best_aqi_model.pkl", "wb") as f:
    pickle.dump(final_pipeline, f)

print("Model successfully saved as: best_aqi_model.pkl")