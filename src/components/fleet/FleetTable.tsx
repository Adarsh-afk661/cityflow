import React, { useState } from 'react';
import {
  Search,
  Truck,
  Eye,
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { VehicleDetailModal } from './VehicleDetailModal';

export const FleetTable: React.FC = () => {
  const { fleet, selectedFleetVehicle, setSelectedFleetVehicle } = useCityFlow();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = fleet.filter(veh => {
    const matchesSearch =
      veh.id.toLowerCase().includes(search.toLowerCase()) ||
      veh.driver.toLowerCase().includes(search.toLowerCase()) ||
      veh.currentRouteName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || veh.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || veh.riskLevel === riskFilter;
    const matchesType = typeFilter === 'all' || veh.type === typeFilter;

    return matchesSearch && matchesStatus && matchesRisk && matchesType;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
      {/* Header with Search & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Fleet Operations Telemetry</h2>
          <p className="text-xs text-slate-500">Live positioning, journey reliability indices, and delay risk status</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vehicle / driver..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="delayed">Delayed</option>
            <option value="idling">Idling</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Risk filter */}
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              <th className="py-2.5 px-3">Vehicle ID</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Assigned Driver</th>
              <th className="py-2.5 px-3">Dimensions (H × W × L)</th>
              <th className="py-2.5 px-3">Max Weight</th>
              <th className="py-2.5 px-3">Assigned Route</th>
              <th className="py-2.5 px-3">Telematics Status</th>
              <th className="py-2.5 px-3">ETA &amp; Reliability</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-sans text-xs">
                  No vehicles match the selected operational filters.
                </td>
              </tr>
            ) : (
              filtered.map(veh => {
                const isActive = veh.status === 'active';
                const isDelayed = veh.status === 'delayed';

                return (
                  <tr
                    key={veh.id}
                    onClick={() => setSelectedFleetVehicle(veh)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="py-3 px-3 font-bold text-[#166534] flex items-center space-x-2">
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      <span>{veh.id}</span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] text-slate-500 font-sans">
                      {veh.type}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-800 font-semibold">
                      {veh.driver}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {veh.vehicleSpecs?.height || 3.8}m × {veh.vehicleSpecs?.width || 2.4}m × {veh.vehicleSpecs?.length || 10.0}m
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {veh.vehicleSpecs?.weight || 14.0} T
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-600">
                      {veh.currentRouteName || 'Depot Staging'}
                    </td>
                    <td className="py-3 px-3">
                      {isActive ? (
                        <span className="text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-[#166534] border border-emerald-200 flex items-center space-x-1.5 w-fit">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>LIVE · {veh.speedKmh} km/h</span>
                        </span>
                      ) : isDelayed ? (
                        <span className="text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1.5 w-fit">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>DELAYED · {veh.speedKmh} km/h</span>
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1.5 w-fit">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span>STAGING · Standby</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-slate-900 leading-tight">{veh.etaMin} min</div>
                      <div className="text-[10px] text-slate-500 font-mono">{veh.reliabilityScore}% reliability</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedFleetVehicle(veh);
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <VehicleDetailModal
        vehicle={selectedFleetVehicle}
        isOpen={selectedFleetVehicle !== null}
        onClose={() => setSelectedFleetVehicle(null)}
      />
    </div>
  );
};
