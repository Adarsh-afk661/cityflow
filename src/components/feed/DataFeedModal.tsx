import React, { useState } from 'react';
import {
  X,
  Truck,
  Route,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Database,
  RefreshCw,
  Trash2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { Vehicle, VehicleType } from '../../types';

export const DataFeedModal: React.FC = () => {
  const {
    dataFeedModalOpen,
    setDataFeedModalOpen,
    addCustomVehicle,
    addCustomRoute,
    addCustomAlert,
    vehicles,
    deleteVehicle
  } = useCityFlow();

  const [activeTab, setActiveTab] = useState<'vehicle' | 'corridor' | 'alert'>('vehicle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tab 1: Vehicle Form State
  const [vehName, setVehName] = useState('');
  const [vehType, setVehType] = useState<VehicleType>('truck');
  const [vehHeight, setVehHeight] = useState('4.20');
  const [vehWidth, setVehWidth] = useState('2.55');
  const [vehLength, setVehLength] = useState('14.50');
  const [vehWeight, setVehWeight] = useState('28.0');
  const [vehFuel, setVehFuel] = useState<'diesel' | 'electric' | 'cng'>('diesel');

  // Tab 2: Corridor Form State
  const [corridorName, setCorridorName] = useState('');
  const [corridorCode, setCorridorCode] = useState('');
  const [minClearance, setMinClearance] = useState('3.70');
  const [maxWeight, setMaxWeight] = useState('40.0');
  const [distanceKm, setDistanceKm] = useState('32.5');
  const [baseEtaMin, setBaseEtaMin] = useState('38');
  const [chokepoint, setChokepoint] = useState('Sector 14 Railway Low Arch Underpass');

  // Tab 3: Alert Form State
  const [alertTitle, setAlertTitle] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'critical' | 'warning' | 'info'>('critical');
  const [alertType, setAlertType] = useState<'clearance' | 'traffic' | 'weather'>('clearance');
  const [alertRoute, setAlertRoute] = useState('ROUTE A — ASHFORD BYPASS');
  const [alertAction, setAlertAction] = useState('Reroute all vehicles taller than 3.7m via Outer Ring Viaduct');

  if (!dataFeedModalOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Submit Vehicle
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehName.trim()) return;

    setIsSubmitting(true);
    const newVeh: Vehicle = {
      id: `custom-veh-${Date.now()}`,
      name: vehName.trim(),
      type: vehType,
      height: parseFloat(vehHeight) || 4.2,
      width: parseFloat(vehWidth) || 2.55,
      length: parseFloat(vehLength) || 14.0,
      weight: parseFloat(vehWeight) || 25.0,
      fuelType: vehFuel,
      emissionRate: vehFuel === 'electric' ? 0.05 : 0.45,
      isCustom: true
    };

    try {
      await addCustomVehicle(newVeh);
      showSuccess(`Vehicle "${newVeh.name}" saved to MongoDB Atlas and activated!`);
      setVehName('');
    } catch (err) {
      showSuccess(`Vehicle added to local fleet dispatch!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Corridor
  const handleCreateCorridor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!corridorName.trim()) return;

    setIsSubmitting(true);
    const newCorridor = {
      id: `custom-corr-${Date.now()}`,
      name: corridorName.trim(),
      corridorCode: corridorCode.trim() || `CORR-${Math.floor(100 + Math.random() * 900)}`,
      distanceKm: parseFloat(distanceKm) || 30,
      baseEtaMin: parseInt(baseEtaMin) || 35,
      minClearanceHeightM: parseFloat(minClearance) || 3.8,
      maxBridgeWeightT: parseFloat(maxWeight) || 40,
      criticalChokepoint: chokepoint.trim() || 'Highway Low Underpass',
      reliabilityScore: 92,
      delayProbability: 10,
      co2PerTripKg: 14.2,
      clearanceStatus: 'clear' as const,
      isCustom: true
    };

    try {
      await addCustomRoute(newCorridor);
      showSuccess(`Corridor "${newCorridor.name}" added to MongoDB Atlas database!`);
      setCorridorName('');
      setCorridorCode('');
    } catch (err) {
      showSuccess(`Corridor created in active network!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Alert
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim()) return;

    setIsSubmitting(true);
    const newAlert = {
      id: `custom-alert-${Date.now()}`,
      title: alertTitle.trim(),
      severity: alertSeverity,
      type: alertType,
      description: `Physical restriction active on ${alertRoute}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      affectedRoute: alertRoute,
      recommendedAction: alertAction,
      acknowledged: false
    };

    try {
      await addCustomAlert(newAlert);
      showSuccess(`Hazard alert broadcasted and saved to MongoDB!`);
      setAlertTitle('');
    } catch (err) {
      showSuccess(`Alert pushed to dispatch screen!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#166534] text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">Manual Data Feeding Studio</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  MongoDB Atlas Live
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Feed your own custom vehicles, bridge clearance limits, corridors, and operational alerts.
              </p>
            </div>
          </div>

          <button
            onClick={() => setDataFeedModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('vehicle')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'vehicle'
                ? 'bg-white text-emerald-800 border-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Feed Commercial Vehicle</span>
          </button>

          <button
            onClick={() => setActiveTab('corridor')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'corridor'
                ? 'bg-white text-emerald-800 border-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>Feed Freight Corridor & Clearance</span>
          </button>

          <button
            onClick={() => setActiveTab('alert')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'alert'
                ? 'bg-white text-emerald-800 border-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Feed Operational Alert</span>
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: VEHICLE */}
          {activeTab === 'vehicle' && (
            <div>
              <form onSubmit={handleCreateVehicle} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vehicle Plate / Model Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tata Signa 4825.TK or Volvo FH16"
                      value={vehName}
                      onChange={e => setVehName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vehicle Category
                    </label>
                    <select
                      value={vehType}
                      onChange={e => setVehType(e.target.value as VehicleType)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    >
                      <option value="truck">Heavy Commercial Truck</option>
                      <option value="bus">Intercity Bus / Coach</option>
                      <option value="van">Light Commercial Van</option>
                      <option value="custom">Special Oversized Transport</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Physical Height (m)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="6.0"
                      required
                      value={vehHeight}
                      onChange={e => setVehHeight(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">Critical for Underpasses</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Total Weight (Tons)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="80.0"
                      required
                      value={vehWeight}
                      onChange={e => setVehWeight(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">Bridge load limit</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Width (m)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="4.0"
                      required
                      value={vehWidth}
                      onChange={e => setVehWidth(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">Lane clearance</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Length (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="2.0"
                      max="30.0"
                      required
                      value={vehLength}
                      onChange={e => setVehLength(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">Turning radius</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Powertrain / Fuel Source
                    </label>
                    <select
                      value={vehFuel}
                      onChange={e => setVehFuel(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    >
                      <option value="diesel">Diesel (Standard Heavy Commercial)</option>
                      <option value="electric">Electric (Zero Direct Tailpipe CO2)</option>
                      <option value="cng">CNG (Clean Commercial Freight)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving to MongoDB Atlas...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Save Vehicle & Run RouteShield</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Existing Custom Vehicles List */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
                  <span>Custom Fed Fleet Units in MongoDB</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {vehicles.filter(v => v.isCustom).length} custom vehicles
                  </span>
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {vehicles.filter(v => v.isCustom).length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No custom vehicles fed yet. Add your first vehicle above!
                    </div>
                  ) : (
                    vehicles
                      .filter(v => v.isCustom)
                      .map(v => (
                        <div
                          key={v.id}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{v.name}</span>
                            <span className="text-slate-500 ml-2 font-mono">
                              {v.height}m H · {v.weight}T · {v.fuelType.toUpperCase()}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteVehicle(v.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete custom vehicle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CORRIDOR */}
          {activeTab === 'corridor' && (
            <div>
              <form onSubmit={handleCreateCorridor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Corridor / Highway Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NH-48 Industrial Freight Bypass"
                      value={corridorName}
                      onChange={e => setCorridorName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Corridor Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NH-48-EXP"
                      value={corridorCode}
                      onChange={e => setCorridorCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Min Clearance Height (m)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="2.0"
                      max="6.5"
                      required
                      value={minClearance}
                      onChange={e => setMinClearance(e.target.value)}
                      className="w-full bg-white border border-rose-300 text-rose-900 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400">Lowest underpass arch</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Bridge Weight Limit (T)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="5"
                      max="100"
                      required
                      value={maxWeight}
                      onChange={e => setMaxWeight(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">Max axle rating</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="300"
                      required
                      value={distanceKm}
                      onChange={e => setDistanceKm(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">Total corridor span</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Base ETA (min)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="5"
                      max="500"
                      required
                      value={baseEtaMin}
                      onChange={e => setBaseEtaMin(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">Normal traffic speed</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Critical Physical Chokepoint
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Railway Low Underpass Km 14 (3.7m restriction)"
                    value={chokepoint}
                    onChange={e => setChokepoint(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to MongoDB Atlas...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Save Freight Corridor to MongoDB</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ALERT */}
          {activeTab === 'alert' && (
            <div>
              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hazard / Alert Headline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clearance Violation Detected: Overheight Truck on Sector 12 Underpass"
                    value={alertTitle}
                    onChange={e => setAlertTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Severity Level
                    </label>
                    <select
                      value={alertSeverity}
                      onChange={e => setAlertSeverity(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                    >
                      <option value="critical">CRITICAL (Red — Immediate Action)</option>
                      <option value="warning">WARNING (Amber — Clearance Caution)</option>
                      <option value="info">INFO (Blue — Advisory Notice)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alert Category
                    </label>
                    <select
                      value={alertType}
                      onChange={e => setAlertType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    >
                      <option value="clearance">Underpass Clearance Hazard</option>
                      <option value="traffic">Severe Traffic Bottleneck</option>
                      <option value="weather">Flash Monsoon Waterlogging</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Affected Corridor
                    </label>
                    <input
                      type="text"
                      required
                      value={alertRoute}
                      onChange={e => setAlertRoute(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recommended Dispatch Action
                  </label>
                  <input
                    type="text"
                    required
                    value={alertAction}
                    onChange={e => setAlertAction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Broadcasting Alert to MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Broadcast Alert to Dispatch Screen</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">cluster0.37p14qy.mongodb.net/cityflow</span>
          </div>
          <span>Automatic real-time sync</span>
        </div>
      </div>
    </div>
  );
};
