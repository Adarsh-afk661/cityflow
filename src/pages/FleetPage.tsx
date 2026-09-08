import React from 'react';
import { Truck, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { FleetTable } from '../components/fleet/FleetTable';
import { MetricCard } from '../components/analytics/MetricCard';
import { useCityFlow } from '../context/CityFlowContext';

export const FleetPage: React.FC = () => {
  const { fleet } = useCityFlow();

  const activeCount = fleet.filter(f => f.status === 'active').length;
  const delayedCount = fleet.filter(f => f.status === 'delayed').length;
  const idlingCount = fleet.filter(f => f.status === 'idling').length;
  const maintenanceCount = fleet.filter(f => f.status === 'maintenance').length;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Fleet Operations
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#166534] border border-emerald-300">
              TELEMETRY & DISPATCH
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time vehicle positioning, route adherence, and clearance monitoring.
          </p>
        </div>
      </div>

      {/* Fleet KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Active En Route"
          value={activeCount}
          trend="+2 units"
          isPositive={true}
          icon={<Truck className="w-4 h-4 text-[#166534]" />}
          subtitle="Moving on corridors"
        />
        <MetricCard
          title="Delayed Vehicles"
          value={delayedCount}
          trend="+1 bottleneck"
          isPositive={false}
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
          subtitle="Expressway bottlenecks"
        />
        <MetricCard
          title="Staging / Idling"
          value={idlingCount}
          icon={<Clock className="w-4 h-4 text-amber-700" />}
          subtitle="Ready for dispatch"
        />
        <MetricCard
          title="Under Maintenance"
          value={maintenanceCount}
          icon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
          subtitle="Depot inspections"
        />
      </div>

      {/* Full Fleet Operations Table */}
      <FleetTable />
    </div>
  );
};
