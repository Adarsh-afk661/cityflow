import React, { useState } from 'react';
import { Filter, CheckCheck } from 'lucide-react';
import { AlertCard } from '../components/alerts/AlertCard';
import { useCityFlow } from '../context/CityFlowContext';

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert } = useCityFlow();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = alerts.filter(a => {
    const matchesSev = severityFilter === 'all' || a.severity === severityFilter;
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesSev && matchesType;
  });

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  const handleAcknowledgeAll = () => {
    alerts.forEach(a => {
      if (!a.acknowledged) acknowledgeAlert(a.id);
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Alerts & Incident Operations
            </h1>
            {unacknowledgedCount > 0 && (
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {unacknowledgedCount} UNACKNOWLEDGED
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time infrastructure clearances, collision alerts, and environmental warnings.
          </p>
        </div>

        {unacknowledgedCount > 0 && (
          <button
            onClick={handleAcknowledgeAll}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-[#166534]" />
            <span>Acknowledge All</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-700 font-semibold uppercase">
          <Filter className="w-3.5 h-3.5 text-[#166534]" />
          <span>Filters:</span>
        </div>

        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#166534]"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical Only</option>
          <option value="warning">Warnings</option>
          <option value="info">Informational</option>
        </select>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#166534]"
        >
          <option value="all">All Incident Types</option>
          <option value="clearance">Clearance Violations</option>
          <option value="accident">Accidents / Collisions</option>
          <option value="traffic">Traffic Bottlenecks</option>
          <option value="weather">Weather Warnings</option>
        </select>

        <div className="ml-auto text-xs text-slate-500 font-mono">
          Showing {filtered.length} of {alerts.length} events
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs shadow-sm">
            No active alerts match the selected criteria.
          </div>
        ) : (
          filtered.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        )}
      </div>
    </div>
  );
};

