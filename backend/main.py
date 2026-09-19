from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path

app = FastAPI(title="Voltara API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"

evs = pd.read_csv(DATA_DIR / "virtual_evs_day1.csv")
timeline = pd.read_csv(DATA_DIR / "energy_timeline_day1.csv")
charging = pd.read_csv(DATA_DIR / "charging_results_day1.csv")
final_status = pd.read_csv(DATA_DIR / "ev_final_status_day1.csv")


def clean_records(df):
    return df.where(pd.notnull(df), None).to_dict(orient="records")


@app.get("/")
def root():
    return {
        "project": "Voltara",
        "status": "Backend running"
    }


@app.get("/api/dashboard")
def dashboard():
    latest = timeline.iloc[-1]

    return {
        "building_load_kw": float(latest["building_load_kw"]),
        "solar_generation_kw": float(latest["solar_generation_kw"]),
        "grid_capacity_kw": float(latest["grid_capacity_kw"]),
        "available_grid_capacity_kw": float(latest["available_grid_capacity_kw"]),
        "connected_ev_count": int(latest["connected_ev_count"]),
    }


@app.get("/api/evs")
def get_evs():
    return clean_records(evs)


@app.get("/api/timeline")
def get_timeline():
    return clean_records(timeline)


@app.get("/api/charging")
def get_charging():
    return clean_records(charging)


@app.get("/api/final-status")
def get_final_status():
    return clean_records(final_status)

from sklearn.linear_model import LinearRegression
import numpy as np


@app.get("/api/forecast")
def forecast():
    data = timeline.copy()

    data["timestamp"] = pd.to_datetime(data["timestamp"])

    # Time-based features
    data["hour"] = data["timestamp"].dt.hour + data["timestamp"].dt.minute / 60
    data["sin_hour"] = np.sin(2 * np.pi * data["hour"] / 24)
    data["cos_hour"] = np.cos(2 * np.pi * data["hour"] / 24)

    X = data[["hour", "sin_hour", "cos_hour"]]
    y = data["building_load_kw"]

    # Lightweight ML model
    model = LinearRegression()
    model.fit(X, y)

    # Predict the next four 15-minute intervals
    last_time = data["timestamp"].iloc[-1]
    future_times = pd.date_range(
        start=last_time + pd.Timedelta(minutes=15),
        periods=4,
        freq="15min"
    )

    future = pd.DataFrame({"timestamp": future_times})
    future["hour"] = (
        future["timestamp"].dt.hour
        + future["timestamp"].dt.minute / 60
    )
    future["sin_hour"] = np.sin(2 * np.pi * future["hour"] / 24)
    future["cos_hour"] = np.cos(2 * np.pi * future["hour"] / 24)

    predictions = model.predict(
        future[["hour", "sin_hour", "cos_hour"]]
    )

    return {
        "model": "Linear Regression",
        "target": "Building Load",
        "unit": "kW",
        "forecast": [
            {
                "timestamp": timestamp.isoformat(),
                "predicted_building_load_kw": round(float(prediction), 2)
            }
            for timestamp, prediction in zip(
                future["timestamp"], predictions
            )
        ]
    }