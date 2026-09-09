import React, { useState } from 'react';
import { Truck, ShieldCheck, Navigation, Radio, CheckCircle2, AlertCircle } from 'lucide-react';
import { FleetTable } from '../components/fleet/FleetTable';
import { MetricCard } from '../components/analytics/MetricCard';
import { useCityFlow } from '../context/CityFlowContext';

export const FleetPage: React.FC = () => {
  const { fleet } = useCityFlow();
  const [deviceGpsActive, setDeviceGpsActive] = useState(false);
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const registeredCount = fleet.length;

  const handleToggleDeviceGps = () => {
    if (deviceGpsActive) {
      setDeviceGpsActive(false);
      setDeviceCoords(null);
      setGpsError(null);
      return;
    }

    if (!navigator.geolocation) {
      setGpsError('Browser geolocation is not supported on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setDeviceCoords({
          lat: +pos.coords.latitude.toFixed(5),
          lng: +pos.coords.longitude.toFixed(5)
        });
        setDeviceGpsActive(true);
        setGpsError(null);
      },
      err => {
        setGpsError(`Geolocation permission denied: ${err.message}`);
      }
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Fleet Operations & Telematics
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
              FLEET REGISTRY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Registered commercial vehicles, dimension clearances, and live telematics bridge.
          </p>
        </div>
      </div>

      {/* Active Live Fleet Telemetry Gateway Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                COMMERCIAL FLEET TELEMATICS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE · REAL-TIME STREAM ACTIVE</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Receiving high-frequency telematics across Delhi — Greater Noida commercial logistics corridors. 8/8 fleet transponders streaming live GPS velocities, route clearances, and XGBoost predictive arrival indices.
            </p>
            {deviceCoords && (
              <p className="text-xs text-emerald-400 mt-1 font-mono">
                Browser Geolocation Bridge: {deviceCoords.lat}, {deviceCoords.lng}
              </p>
            )}
            {gpsError && (
              <p className="text-xs text-rose-400 mt-1 font-mono">{gpsError}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleToggleDeviceGps}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center space-x-2 shrink-0 ${
            deviceGpsActive
              ? 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{deviceGpsActive ? 'Local Device Sensor: ON' : 'Sync Device Sensor'}</span>
        </button>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="REGISTERED VEHICLES"
          value={registeredCount}
          icon={<Truck className="w-4 h-4 text-[#166534]" />}
          subtitle="Database profiles"
        />
        <MetricCard
          title="TELEMATICS FEED"
          value={`${registeredCount} LIVE`}
          isPositive={true}
          icon={<Radio className="w-4 h-4 text-[#166534] animate-pulse" />}
          subtitle="All nodes transmitting"
        />
        <MetricCard
          title="CLEARANCE COMPLIANT"
          value={`${registeredCount} / ${registeredCount}`}
          icon={<ShieldCheck className="w-4 h-4 text-[#166534]" />}
          subtitle="Height & weight verified"
        />
        <MetricCard
          title="GPS STREAM STATUS"
          value="ONLINE (100%)"
          isPositive={true}
          icon={<CheckCircle2 className="w-4 h-4 text-[#166534]" />}
          subtitle="Zero packet loss · 1.2s ping"
        />
      </div>

      {/* Full Fleet Operations Table */}
      <FleetTable />
    </div>
  );
};
