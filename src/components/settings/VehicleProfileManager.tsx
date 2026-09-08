import React, { useState } from 'react';
import { Truck, Plus, Trash2 } from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { CustomVehicleModal } from '../routeshield/CustomVehicleModal';

export const VehicleProfileManager: React.FC = () => {
  const { vehicles, deleteVehicle, selectedVehicle, setSelectedVehicle } = useCityFlow();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Commercial Vehicle Profiles</h3>
          <p className="text-xs text-slate-500">Manage dimensional constraints for dynamic bridge & underpass enforcement</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Vehicle Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {vehicles.map(v => {
          const isSelected = selectedVehicle.id === v.id;
          return (
            <div
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/50 border-[#166534] shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[#166534]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{v.name}</h4>
                    <span className="text-[10px] uppercase font-mono text-slate-500">
                      {v.type} · {v.fuelType}
                    </span>
                  </div>
                </div>

                {v.isCustom && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteVehicle(v.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                    title="Delete profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="text-[9px] text-slate-500 block">Height</span>
                  <span className="font-bold text-[#166534]">{v.height}m</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="text-[9px] text-slate-500 block">Width</span>
                  <span className="font-bold text-[#166534]">{v.width}m</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="text-[9px] text-slate-500 block">Length</span>
                  <span className="font-bold text-[#166534]">{v.length}m</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="text-[9px] text-slate-500 block">Weight</span>
                  <span className="font-bold text-[#166534]">{v.weight}T</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CustomVehicleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

