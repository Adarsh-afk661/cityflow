"""
CityFlow ML Training & Evaluation Pipeline
Trains XGBoost 3.4.1 Regressor (ETA) and Classifier (Delay Probability)
Uses strict chronological splitting to eliminate data leakage.
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
import xgboost as xgb
from sklearn.metrics import (
    mean_absolute_error,
    root_mean_squared_error,
    mean_absolute_percentage_error,
    r2_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score
)
from feature_engineering import FEATURE_COLUMNS

def train_cityflow_models():
    data_path = os.path.join('data', 'processed', 'training_data.csv')
    if not os.path.exists(data_path):
        from generate_dataset import generate_telemetry_dataset
        df = generate_telemetry_dataset(5000)
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    print(f'[Training] Loaded dataset with {len(df)} samples.')

    # Chronological Split (No random shuffling for time-series data)
    n = len(df)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)

    train_df = df.iloc[:train_end]
    val_df = df.iloc[train_end:val_end]
    test_df = df.iloc[val_end:]

    X_train = train_df[FEATURE_COLUMNS]
    X_val = val_df[FEATURE_COLUMNS]
    X_test = test_df[FEATURE_COLUMNS]

    y_eta_train = train_df['actual_travel_time']
    y_eta_val = val_df['actual_travel_time']
    y_eta_test = test_df['actual_travel_time']

    y_delay_train = train_df['delayed']
    y_delay_val = val_df['delayed']
    y_delay_test = test_df['delayed']

    print(f'[Training] Split sizes -> Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}')

    # ==================== MODEL 1: XGBoost Regressor (ETA Prediction) ====================
    print('[Training] Training Model 1: XGBoost Regressor (ETA)...')
    eta_model = xgb.XGBRegressor(
        n_estimators=180,
        max_depth=5,
        learning_rate=0.06,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42
    )
    eta_model.fit(
        X_train,
        y_eta_train,
        eval_set=[(X_val, y_eta_val)],
        verbose=False
    )

    y_eta_pred = eta_model.predict(X_test)
    eta_mae = float(round(mean_absolute_error(y_eta_test, y_eta_pred), 3))
    eta_rmse = float(round(root_mean_squared_error(y_eta_test, y_eta_pred), 3))
    eta_mape = float(round(mean_absolute_percentage_error(y_eta_test, y_eta_pred) * 100, 2))
    eta_r2 = float(round(r2_score(y_eta_test, y_eta_pred), 4))

    print(f'[Evaluation - ETA Model] MAE: {eta_mae} min | RMSE: {eta_rmse} min | MAPE: {eta_mape}% | R²: {eta_r2}')

    # Save ETA model artifact
    eta_model_dir = os.path.join('models', 'eta')
    os.makedirs(eta_model_dir, exist_ok=True)
    eta_model_path = os.path.join(eta_model_dir, 'model.json')
    eta_model.save_model(eta_model_path)

    # ==================== MODEL 2: XGBoost Classifier (Delay Probability) ====================
    print('[Training] Training Model 2: XGBoost Classifier (Delay Probability)...')
    delay_model = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric='logloss'
    )
    delay_model.fit(
        X_train,
        y_delay_train,
        eval_set=[(X_val, y_delay_val)],
        verbose=False
    )

    y_delay_pred_prob = delay_model.predict_proba(X_test)[:, 1]
    y_delay_pred = (y_delay_pred_prob >= 0.5).astype(int)

    delay_precision = float(round(precision_score(y_delay_test, y_delay_pred, zero_division=0), 3))
    delay_recall = float(round(recall_score(y_delay_test, y_delay_pred, zero_division=0), 3))
    delay_f1 = float(round(f1_score(y_delay_test, y_delay_pred, zero_division=0), 3))
    delay_auc = float(round(roc_auc_score(y_delay_test, y_delay_pred_prob), 4))

    print(f'[Evaluation - Delay Model] Precision: {delay_precision} | Recall: {delay_recall} | F1: {delay_f1} | ROC-AUC: {delay_auc}')

    # Save Delay model artifact
    delay_model_dir = os.path.join('models', 'delay')
    os.makedirs(delay_model_dir, exist_ok=True)
    delay_model_path = os.path.join(delay_model_dir, 'model.json')
    delay_model.save_model(delay_model_path)

    # Calculate Feature Importances
    importances = eta_model.feature_importances_
    feat_importance_dict = {
        feat: float(round(imp, 4))
        for feat, imp in sorted(zip(FEATURE_COLUMNS, importances), key=lambda x: x[1], reverse=True)
    }

    # Documented Model Version Metadata
    metadata = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'xgboost_version': xgb.__version__,
        'eta_model': {
            'version': 'cityflow-eta-v1',
            'algorithm': 'XGBoost Regressor',
            'artifact': eta_model_path,
            'metrics': {
                'mae_minutes': eta_mae,
                'rmse_minutes': eta_rmse,
                'mape_percent': eta_mape,
                'r2_score': eta_r2
            }
        },
        'delay_model': {
            'version': 'cityflow-delay-v1',
            'algorithm': 'XGBoost Binary Classifier',
            'artifact': delay_model_path,
            'metrics': {
                'precision': delay_precision,
                'recall': delay_recall,
                'f1_score': delay_f1,
                'roc_auc': delay_auc
            }
        },
        'data_split': {
            'train_samples': len(train_df),
            'val_samples': len(val_df),
            'test_samples': len(test_df),
            'total_samples': n,
            'method': 'Chronological Windowing (Zero Data Leakage)',
            'start_time': str(train_df['timestamp'].min()),
            'end_time': str(test_df['timestamp'].max())
        },
        'features': FEATURE_COLUMNS,
        'feature_importance': feat_importance_dict,
        'status': 'ACTIVE'
    }

    meta_path = os.path.join('models', 'model_metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f'[Training] Successfully saved model metadata to {meta_path}.')
    return metadata

if __name__ == '__main__':
    train_cityflow_models()
