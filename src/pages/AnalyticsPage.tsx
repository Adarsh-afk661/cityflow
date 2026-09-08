import React from 'react';
import { Clock, ShieldCheck, Leaf, Zap } from 'lucide-react';
import { TrendCharts } from '../components/analytics/TrendCharts';
import { MetricCard } from '../components/analytics/MetricCard';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Analytics & Route Intelligence
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#166534] border border-emerald-300">
              HISTORICAL TELEMETRY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Longitudinal reliability trends, emissions benchmarks, and routing efficiency.
          </p>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="AVERAGE FLEET ETA"
          value="48.2"
          unit="min"
          trend="-6.4%"
          isPositive={true}
          icon={<Clock className="w-4 h-4 text-[#166534]" />}
          subtitle="Faster transit cycles"
        />
        <MetricCard
          title="JOURNEY RELIABILITY"
          value="93.8"
          unit="%"
          trend="+4.1%"
          isPositive={true}
          icon={<ShieldCheck className="w-4 h-4 text-[#166534]" />}
          subtitle="98% on-time guarantee"
        />
        <MetricCard
          title="NET CO₂ SAVED"
          value="1,420"
          unit="kg"
          trend="+18.2%"
          isPositive={true}
          icon={<Leaf className="w-4 h-4 text-[#166534]" />}
          subtitle="Rolling 30-day savings"
        />
        <MetricCard
          title="CLEARANCE FEASIBILITY"
          value="100"
          unit="%"
          trend="0 collisions"
          isPositive={true}
          icon={<Zap className="w-4 h-4 text-blue-700" />}
          subtitle="Zero clearance strikes"
        />
      </div>

      {/* Trend & Comparison Charts */}
      <TrendCharts />
    </div>
  );
};

