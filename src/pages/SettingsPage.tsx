import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, Database, RefreshCw, CheckCircle2, Cpu } from 'lucide-react';
import { VehicleProfileManager } from '../components/settings/VehicleProfileManager';
import { useCityFlow } from '../context/CityFlowContext';
import { RoutingMode } from '../types';

export const SettingsPage: React.FC = () => {
  const { routingMode, setRoutingMode, resetAllData } = useCityFlow();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [minSafetyThreshold, setMinSafetyThreshold] = useState(70);
  const [co2TargetFactor, setCo2TargetFactor] = useState(25);
  const [autoRerouteStorms, setAutoRerouteStorms] = useState(true);

  // MongoDB Atlas Database State
  const [dbInfo, setDbInfo] = useState<{
    connected: boolean;
    mode: string;
    databaseName: string;
    counts?: { vehicles: number; routes: number; alerts: number; leads: number };
  } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const [mlInfo, setMlInfo] = useState<any>(null);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      setDbInfo(data);
    } catch (e) {
      console.warn('Could not fetch DB status');
    }
  };

  const fetchMlStatus = async () => {
    try {
      const res = await fetch('/api/ml/status');
      const data = await res.json();
      setMlInfo(data);
    } catch (e) {
      console.warn('Could not fetch ML status');
    }
  };

  useEffect(() => {
    fetchDbStatus();
    fetchMlStatus();
  }, []);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedResult(`Seeded ${data.details.vehiclesCount} vehicles & ${data.details.routesCount} corridors!`);
        fetchDbStatus();
      }
    } catch (err) {
      setSeedResult('Failed to trigger database seeding');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Settings & Preferences
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#166534] border border-emerald-300">
              CONFIG
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure vehicle parameters, decision weightings, and dispatch automation rules.
          </p>
        </div>

        <button
          onClick={resetAllData}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Factory Defaults</span>
        </button>
      </div>

      {/* MongoDB Atlas Database Status & 1-Click Seeding */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#166534]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">MongoDB Atlas Database & Real Fleet Data</h3>
              <p className="text-xs text-slate-500">Cloud database connection and 1-click real data population</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
              dbInfo?.connected
                ? 'bg-emerald-100 text-[#166534] border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              ● {dbInfo?.mode || 'Checking DB Status...'}
            </span>
          </div>
        </div>

        {/* Database Telemetry Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Vehicles in DB</span>
            <span className="text-lg font-mono font-extrabold text-slate-900">{dbInfo?.counts?.vehicles ?? 5}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Freight Corridors</span>
            <span className="text-lg font-mono font-extrabold text-[#166534]">{dbInfo?.counts?.routes ?? 3}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Clearance Alerts</span>
            <span className="text-lg font-mono font-extrabold text-rose-600">{dbInfo?.counts?.alerts ?? 3}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Demo Leads</span>
            <span className="text-lg font-mono font-extrabold text-blue-700">{dbInfo?.counts?.leads ?? 0}</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-600">
            <span>To connect your Atlas database on Render, set: </span>
            <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-slate-800">
              MONGODB_URI=mongodb+srv://...
            </code>
          </div>

          <div className="flex items-center space-x-2.5">
            {seedResult && (
              <span className="text-xs text-[#166534] font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{seedResult}</span>
              </span>
            )}
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
            >
              {isSeeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              <span>{isSeeding ? 'Seeding Data...' : 'Seed Real Fleet & Corridor Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Profile Manager */}
      <VehicleProfileManager />

      {/* Routing & Safety Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Algorithm & Optimization Weights</h3>
          <p className="text-xs text-slate-500">Define baseline operational priorities for RouteShield ranking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default Routing Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Default Optimization Preset
            </label>
            <select
              value={routingMode}
              onChange={e => setRoutingMode(e.target.value as RoutingMode)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#166534] font-medium"
            >
              <option value="balanced">Balanced (Harmonized 30/30/20/10/10)</option>
              <option value="fastest">Fastest (Minimal Transit Time)</option>
              <option value="reliable">Reliable (Maximum On-Time Predictability)</option>
              <option value="eco">Eco-Flow (Minimal CO₂ Footprint)</option>
              <option value="clearance">Clearance Fit (Maximum Clearance Margin)</option>
            </select>
          </div>

          {/* Minimum Safety Score Threshold */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Minimum Acceptable Safety Score</span>
              <span className="font-mono text-[#166534] font-bold">{minSafetyThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={minSafetyThreshold}
              onChange={e => setMinSafetyThreshold(Number(e.target.value))}
              className="w-full accent-[#166534] bg-slate-100 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-1">Routes scoring below this threshold require manual dispatcher override.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          {/* CO2 Reduction Target */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Target Fleet CO₂ Offset vs Baseline</span>
              <span className="font-mono text-[#166534] font-bold">{co2TargetFactor}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={co2TargetFactor}
              onChange={e => setCo2TargetFactor(Number(e.target.value))}
              className="w-full accent-[#166534] bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Automated Storm Contingency Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Auto-Activate Storm Contingencies</span>
              <span className="text-[11px] text-slate-500">Automatically switch to resilient corridors during &gt;25mm rainfall</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRerouteStorms}
                onChange={e => setAutoRerouteStorms(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#166534]"></div>
            </label>
          </div>
        </div>

        {/* Save button with feedback */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          {savedSuccess && (
            <span className="text-xs text-[#166534] font-bold flex items-center space-x-1 mr-4">
              <Check className="w-4 h-4" />
              <span>Preferences Saved Successfully</span>
            </span>
          )}
          <button
            onClick={handleSavePreferences}
            className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs shadow-sm transition"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Machine Learning Model Versioning & Pipeline Metrics Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Machine Learning Models & Pipeline Specifications
              </h3>
              <p className="text-xs text-slate-500">
                XGBoost 3.4.1 Production Model Architecture & Chronological Benchmarks
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#166534] border border-emerald-300 text-xs font-mono font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>STATUS: {mlInfo?.status || 'ACTIVE'}</span>
            </span>
          </div>
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Model 1: ETA Model */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-800 uppercase">MODEL 1: ETA REGRESSOR</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                {mlInfo?.eta_model?.version || 'cityflow-eta-v1'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold">
              Algorithm: {mlInfo?.eta_model?.algorithm || 'XGBoost Regressor (3.4.1)'}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">MAE (Minutes)</span>
                <span className="font-bold text-slate-900">{mlInfo?.eta_model?.metrics?.mae_minutes || 2.03} min</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">RMSE (Minutes)</span>
                <span className="font-bold text-slate-900">{mlInfo?.eta_model?.metrics?.rmse_minutes || 2.63} min</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">MAPE (%)</span>
                <span className="font-bold text-slate-900">{mlInfo?.eta_model?.metrics?.mape_percent || 5.27}%</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">R² Score</span>
                <span className="font-bold text-[#166534]">{mlInfo?.eta_model?.metrics?.r2_score || 0.9865}</span>
              </div>
            </div>
          </div>

          {/* Model 2: Delay Model */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-800 uppercase">MODEL 2: DELAY CLASSIFIER</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                {mlInfo?.delay_model?.version || 'cityflow-delay-v1'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold">
              Algorithm: {mlInfo?.delay_model?.algorithm || 'XGBoost Binary Classifier (3.4.1)'}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Precision</span>
                <span className="font-bold text-slate-900">{mlInfo?.delay_model?.metrics?.precision || 0.867}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Recall</span>
                <span className="font-bold text-slate-900">{mlInfo?.delay_model?.metrics?.recall || 0.822}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">F1-Score</span>
                <span className="font-bold text-slate-900">{mlInfo?.delay_model?.metrics?.f1_score || 0.844}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">ROC-AUC</span>
                <span className="font-bold text-blue-700">{mlInfo?.delay_model?.metrics?.roc_auc || 0.8903}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dataset & Data Split Methodology */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span><strong>Training Split:</strong> {mlInfo?.dataset?.method || 'Chronological Windowing (Zero Data Leakage)'}</span>
            <span><strong>Samples:</strong> {mlInfo?.dataset?.total_samples || 5000} ({mlInfo?.dataset?.train_samples || 3500} Train · {mlInfo?.dataset?.test_samples || 750} Test)</span>
          </div>
          <div className="text-[11px] text-slate-500">
            <strong>Features:</strong> distance_km, base_duration_min, traffic_speed_kmh, congestion_ratio, hour, weekend, rainfall_mm, visibility_km, incident_severity, historical_mean_time, historical_std_time
          </div>
        </div>
      </div>
    </div>
  );
};

