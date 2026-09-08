import React from 'react';
import { X, Truck, ShieldAlert, ShieldCheck, MapPin, Gauge, Leaf, Clock } from 'lucide-react';
import { FleetVehicle } from '../../types';

interface VehicleDetailModalProps {
  vehicle: FleetVehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose
}) => {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#166534]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">{vehicle.id}</h3>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    vehicle.status === 'active'
                      ? 'bg-emerald-100 text-[#166534]'
                      : vehicle.status === 'delayed'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {vehicle.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">Driver: <strong className="text-slate-800">{vehicle.driver}</strong> · Destination: {vehicle.destination}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Physical Specs Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Clearance Enforced Specifications</p>
          <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Height</span>
              <span className="font-bold text-slate-900">{vehicle.vehicleSpecs.height} m</span>
            </div>
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Width</span>
              <span className="font-bold text-slate-900">{vehicle.vehicleSpecs.width} m</span>
            </div>
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Length</span>
              <span className="font-bold text-slate-900">{vehicle.vehicleSpecs.length} m</span>
            </div>
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Gross Weight</span>
              <span className="font-bold text-slate-900">{vehicle.vehicleSpecs.weight} T</span>
            </div>
          </div>
        </div>

        {/* Live Telemetry Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Speed</span>
            <span className="text-base font-mono font-bold text-slate-900 flex items-center space-x-1 mt-0.5">
              <Gauge className="w-4 h-4 text-[#166534]" />
              <span>{vehicle.speedKmh} km/h</span>
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">ETA</span>
            <span className="text-base font-mono font-bold text-slate-900 flex items-center space-x-1 mt-0.5">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>{vehicle.etaMin > 0 ? `${vehicle.etaMin} min` : 'At Dock'}</span>
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Reliability</span>
            <span className="text-base font-mono font-bold text-[#166534] flex items-center space-x-1 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-[#166534]" />
              <span>{vehicle.reliabilityScore} / 100</span>
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">CO₂ Today</span>
            <span className="text-base font-mono font-bold text-[#166534] flex items-center space-x-1 mt-0.5">
              <Leaf className="w-4 h-4 text-[#166534]" />
              <span>{vehicle.co2TodayKg} kg</span>
            </span>
          </div>
        </div>

        {/* Active Route & Location */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 text-xs">
          <div className="flex items-center space-x-2 text-slate-700 mb-1">
            <MapPin className="w-4 h-4 text-[#166534]" />
            <span>Current Route: <strong className="text-slate-900">{vehicle.currentRouteName}</strong></span>
          </div>
          <p className="text-slate-500 pl-6">Sector position: {vehicle.locationName}</p>
        </div>

        {/* Recent Route Telemetry Log */}
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Waypoint & Event Log</p>
          <div className="space-y-2">
            {vehicle.recentHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-[10px] text-slate-400">{item.timestamp}</span>
                  <span className="text-slate-700 font-medium">{item.event}</span>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                    item.status === 'ok'
                      ? 'bg-emerald-100 text-[#166534]'
                      : item.status === 'delay'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
