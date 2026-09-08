"""
CityFlow ML Pipeline - Feature Engineering
XGBoost 3.4.1 Production Feature Schema
"""

import pandas as pd
import numpy as np

FEATURE_COLUMNS = [
    'distance_km',
    'base_duration_min',
    'traffic_speed_kmh',
    'free_flow_speed_kmh',
    'congestion_ratio',
    'hour',
    'day_of_week',
    'weekend',
    'rainfall_mm',
    'visibility_km',
    'temperature_c',
    'incident_count',
    'incident_severity',
    'road_type_encoded',
    'vehicle_type_encoded',
    'route_length_km',
    'historical_mean_time',
    'historical_std_time'
]

ROAD_TYPE_MAP = {
    'expressway': 0,
    'beltway': 1,
    'arterial': 2,
    'urban': 3
}

VEHICLE_TYPE_MAP = {
    'van': 0,
    'light_truck': 1,
    'heavy_truck': 2,
    'bus': 3,
    'emergency': 4,
    'custom': 5
}

def extract_features(data: dict) -> pd.DataFrame:
    """Transform raw operational dictionary into model-ready DataFrame."""
    road_type = data.get('road_type', 'expressway').lower()
    road_encoded = ROAD_TYPE_MAP.get(road_type, 0)

    vehicle_type = data.get('vehicle_type', 'heavy_truck').lower()
    veh_encoded = VEHICLE_TYPE_MAP.get(vehicle_type, 2)

    speed = float(data.get('traffic_speed_kmh', 45.0))
    free_flow = float(data.get('free_flow_speed_kmh', 65.0))
    congestion_ratio = round(max(0.0, min(1.0, 1.0 - (speed / max(1.0, free_flow)))), 3)

    row = {
        'distance_km': float(data.get('distance_km', 25.0)),
        'base_duration_min': float(data.get('base_duration_min', 30.0)),
        'traffic_speed_kmh': speed,
        'free_flow_speed_kmh': free_flow,
        'congestion_ratio': congestion_ratio,
        'hour': int(data.get('hour', 10)),
        'day_of_week': int(data.get('day_of_week', 2)),
        'weekend': int(data.get('weekend', 0)),
        'rainfall_mm': float(data.get('rainfall_mm', 0.0)),
        'visibility_km': float(data.get('visibility_km', 10.0)),
        'temperature_c': float(data.get('temperature_c', 28.0)),
        'incident_count': int(data.get('incident_count', 0)),
        'incident_severity': int(data.get('incident_severity', 0)),
        'road_type_encoded': road_encoded,
        'vehicle_type_encoded': veh_encoded,
        'route_length_km': float(data.get('distance_km', 25.0)),
        'historical_mean_time': float(data.get('historical_mean_time', data.get('base_duration_min', 30.0) * 1.15)),
        'historical_std_time': float(data.get('historical_std_time', 4.5))
    }

    return pd.DataFrame([row], columns=FEATURE_COLUMNS)
