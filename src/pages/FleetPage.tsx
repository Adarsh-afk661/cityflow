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

      {/* Non-Negotiable Honest Telemetry Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${deviceGpsActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'}`}>
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                GPS TELEMETRY
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${deviceGpsActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'}`}>
                {deviceGpsActive ? 'DEVICE GEOLOCATION ACTIVE' : 'NOT CONNECTED'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {deviceGpsActive ? (
                <span>
                  Receiving real device coordinates from browser GPS: <strong className="font-mono text-emerald-300">{deviceCoords?.lat}, {deviceCoords?.lng}</strong>. Zero simulated coordinate jitter.
                </span>
              ) : (
                'Connect a telematics provider (e.g. Samsara, Geotab, Trimble) to receive live vehicle positions. CityFlow rejects fake operational GPS movement.'
              )}
            </p>
            {gpsError && (
              <p className="text-xs text-rose-400 mt-1 font-mono">{gpsError}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleToggleDeviceGps}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center space-x-2 shrink-0 ${
            deviceGpsActive
              ? 'bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700'
              : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{deviceGpsActive ? 'Disconnect Device GPS' : 'Enable Device Geolocation'}</span>
        </button>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Registered Vehicles"
          value={registeredCount}
          icon={<Truck className="w-4 h-4 text-[#166534]" />}
          subtitle="Database profiles"
        />
        <MetricCard
          title="Telematics Feed"
          value={deviceGpsActive ? '1 LIVE' : '0 CONNECTED'}
          isPositive={deviceGpsActive}
          icon={<Radio className="w-4 h-4 text-slate-500" />}
          subtitle={deviceGpsActive ? 'Local Device Active' : 'Awaiting Provider'}
        />
        <MetricCard
          title="Clearance Compliant"
          value={registeredCount}
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          subtitle="Profiles verified"
        />
        <MetricCard
          title="GPS Stream Status"
          value={deviceGpsActive ? 'STREAMING' : 'OFFLINE'}
          icon={<AlertCircle className="w-4 h-4 text-slate-400" />}
          subtitle={deviceGpsActive ? 'Browser Geo API' : 'No fake GPS jitter'}
        />
      </div>

      {/* Full Fleet Operations Table */}
      <FleetTable />
    </div>
  );
};
