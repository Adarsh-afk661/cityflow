import React from 'react';
import {
  Truck,
  Zap,
  ShieldCheck,
  Leaf,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  Radio
} from 'lucide-react';
import { CityMap } from '../components/map/CityMap';
import { MetricCard } from '../components/analytics/MetricCard';
import { useCityFlow } from '../context/CityFlowContext';

export const DashboardPage: React.FC = () => {
  const {
    fleet,
    alerts,
    setActivePage,
  } = useCityFlow();

  const activeAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              CityFlow Command Center
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#166534] border border-emerald-300">
              ● OPERATIONAL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time route intelligence for smarter urban mobility.
          </p>
        </div>

        {/* Quick Launch CTA to RouteShield */}
        <button
          onClick={() => setActivePage('routeshield')}
          className="px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center space-x-2 transition shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Plan & Validate Corridor in RouteShield</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="ACTIVE VEHICLES"
          value="24"
          trend="+12.4%"
          isPositive={true}
          icon={<Truck className="w-4 h-4 text-[#166534]" />}
          subtitle="Commercial units"
        />
        <MetricCard
          title="ROUTES OPTIMIZED"
          value="187"
          trend="+8.7%"
          isPositive={true}
          icon={<Zap className="w-4 h-4 text-blue-700" />}
          subtitle="Clearance certified"
        />
        <MetricCard
          title="AVG RELIABILITY"
          value="91"
          unit="/100"
          trend="+3.2%"
          isPositive={true}
          icon={<ShieldCheck className="w-4 h-4 text-[#166534]" />}
          subtitle="On-time probability"
        />
        <MetricCard
          title="CO₂ SAVED"
          value="342"
          unit="kg"
          trend="+14.5%"
          isPositive={true}
          icon={<Leaf className="w-4 h-4 text-[#166534]" />}
          subtitle="Eco-Flow savings"
        />
        <MetricCard
          title="DELAYS PREVENTED"
          value="28"
          trend="-4.2%"
          isPositive={true}
          icon={<AlertTriangle className="w-4 h-4 text-amber-700" />}
          subtitle="Clearance bypasses"
        />
      </div>

      {/* Main Visual: Interactive City Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-700 animate-pulse" />
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Metropolitan Mobility Digital Twin
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Click pressure zones or vehicles to inspect live telemetry
          </div>
        </div>
        <CityMap heightClass="h-[520px]" showControls={true} showJourneyRoutes={false} />
      </div>

      {/* Bottom 3-Column Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Active Clearance & Traffic Alerts</h3>
            </div>
            <button
              onClick={() => setActivePage('alerts')}
              className="text-xs text-[#166534] hover:underline font-bold"
            >
              View All ({activeAlerts.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {activeAlerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border text-xs ${
                  alert.severity === 'critical'
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{alert.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Status Snapshot */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-[#166534]" />
              <h3 className="text-sm font-bold text-slate-900">Fleet Telemetry Quick Look</h3>
            </div>
            <button
              onClick={() => setActivePage('fleet')}
              className="text-xs text-[#166534] hover:underline font-bold"
            >
              Fleet Board
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {fleet.slice(0, 4).map(veh => (
              <div
                key={veh.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{veh.id}</span>
                  <span className="text-[10px] text-slate-500 font-sans">{veh.currentRouteName.split('—')[0]}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-slate-700">{veh.etaMin > 0 ? `${veh.etaMin}m ETA` : 'Idle'}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      veh.status === 'active'
                        ? 'bg-emerald-100 text-[#166534]'
                        : veh.status === 'delayed'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {veh.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Route Decisions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#166534]" />
              <h3 className="text-sm font-bold text-slate-900">Recent Route Decisions</h3>
            </div>
            <button
              onClick={() => setActivePage('routeshield')}
              className="text-xs text-[#166534] hover:underline font-bold"
            >
              Analyze New
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-900">Heavy Delivery Truck (4.1m)</span>
                <span className="text-[10px] text-rose-600 font-mono font-bold">BARRED A-10</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Routed via Route B (Ring Corridor) to bypass 3.8m underpass. Clearance approved.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-900">Commercial Cargo Van (2.4m)</span>
                <span className="text-[10px] text-[#166534] font-mono font-bold">APPROVED GREEN</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dispatched on Route C Green Corridor. 6.5 kg CO₂ saved vs Expressway baseline.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-900">Storm Contingency Shift</span>
                <span className="text-[10px] text-[#166534] font-mono font-bold">REROUTED TO C</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Switched fleet from flooded tunnel to resilient Green Viaduct (+2m delta).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
