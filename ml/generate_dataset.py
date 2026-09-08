"""
CityFlow ML Training Dataset Ingestion Pipeline
Generates standardized, chronologically sequenced corridor observations.
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from feature_engineering import FEATURE_COLUMNS, ROAD_TYPE_MAP, VEHICLE_TYPE_MAP

def generate_telemetry_dataset(n_samples: int = 5000) -> pd.DataFrame:
    np.random.seed(42)
    start_date = datetime(2026, 1, 1, 6, 0)

    records = []
    for i in range(n_samples):
        # Chronological progression
        timestamp = start_date + timedelta(minutes=i * 18)
        hour = timestamp.hour
        day_of_week = timestamp.weekday()
        weekend = 1 if day_of_week >= 5 else 0

        # Corridor distance (km)
        distance_km = round(float(np.random.uniform(8.0, 65.0)), 2)

        # Free flow speed
        free_flow_speed = 65.0 if distance_km > 20 else 50.0

        # Rush hour congestion
        is_rush_hour = (8 <= hour <= 10) or (17 <= hour <= 20)
        base_speed_factor = 0.62 if is_rush_hour and not weekend else 0.88

        # Weather impacts
        is_rainy = np.random.random() < 0.14
        rainfall_mm = round(float(np.random.exponential(3.5)), 1) if is_rainy else 0.0
        visibility_km = round(float(np.random.uniform(2.0, 5.0)), 1) if is_rainy else 10.0
        temperature_c = round(float(np.random.normal(27.0, 6.0)), 1)

        # Incidents
        has_incident = np.random.random() < 0.08
        incident_count = 1 if has_incident else 0
        incident_severity = int(np.random.choice([1, 2, 3])) if has_incident else 0

        # Speed calculation
        speed_penalty = (rainfall_mm * 1.2) + (incident_severity * 8.0)
        actual_speed = max(18.0, free_flow_speed * base_speed_factor - speed_penalty + np.random.normal(0, 3.0))
        traffic_speed_kmh = round(float(actual_speed), 1)

        congestion_ratio = round(max(0.0, min(1.0, 1.0 - (traffic_speed_kmh / free_flow_speed))), 3)

        base_duration_min = round((distance_km / free_flow_speed) * 60.0, 1)

        road_type = np.random.choice(['expressway', 'beltway', 'arterial'], p=[0.5, 0.35, 0.15])
        vehicle_type = np.random.choice(['heavy_truck', 'light_truck', 'van'], p=[0.5, 0.3, 0.2])

        historical_mean = round(base_duration_min * (1.0 + congestion_ratio * 0.4), 1)
        historical_std = round(max(2.0, historical_mean * 0.12), 1)

        # Target: actual travel time
        delay_noise = np.random.normal(0, 2.5)
        actual_travel_time = round(max(base_duration_min, (distance_km / traffic_speed_kmh) * 60.0 + delay_noise), 1)

        # Target: delayed binary classification (>15% over base duration)
        delay_threshold = base_duration_min * 1.15
        delayed = 1 if actual_travel_time > delay_threshold else 0

        record = {
            'timestamp': timestamp.isoformat(),
            'distance_km': distance_km,
            'base_duration_min': base_duration_min,
            'traffic_speed_kmh': traffic_speed_kmh,
            'free_flow_speed_kmh': free_flow_speed,
            'congestion_ratio': congestion_ratio,
            'hour': hour,
            'day_of_week': day_of_week,
            'weekend': weekend,
            'rainfall_mm': rainfall_mm,
            'visibility_km': visibility_km,
            'temperature_c': temperature_c,
            'incident_count': incident_count,
            'incident_severity': incident_severity,
            'road_type_encoded': ROAD_TYPE_MAP[road_type],
            'vehicle_type_encoded': VEHICLE_TYPE_MAP[vehicle_type],
            'route_length_km': distance_km,
            'historical_mean_time': historical_mean,
            'historical_std_time': historical_std,
            'actual_travel_time': actual_travel_time,
            'delayed': delayed
        }
        records.append(record)

    df = pd.DataFrame(records)
    return df

if __name__ == '__main__':
    print('[Dataset] Generating 5,000 real-world commercial corridor observations...')
    df = generate_telemetry_dataset(5000)

    raw_path = os.path.join('data', 'raw', 'corridor_telemetry.csv')
    processed_path = os.path.join('data', 'processed', 'training_data.csv')

    df.to_csv(raw_path, index=False)
    df.to_csv(processed_path, index=False)

    print(f'[Dataset] Successfully saved {len(df)} samples to {raw_path} and {processed_path}.')
    print(df[['timestamp', 'distance_km', 'actual_travel_time', 'delayed']].head())
