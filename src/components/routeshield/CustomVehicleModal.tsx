import React, { useState } from 'react';
import { X, Truck, AlertCircle, Save } from 'lucide-react';
import { Vehicle, VehicleType } from '../../types';
import { useCityFlow } from '../../context/CityFlowContext';

interface CustomVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomVehicleModal: React.FC<CustomVehicleModalProps> = ({ isOpen, onClose }) => {
  const { addCustomVehicle } = useCityFlow();

  const [name, setName] = useState('');
  const [type, setType] = useState<VehicleType>('truck');
  const [height, setHeight] = useState<string>('4.2');
  const [width, setWidth] = useState<string>('2.55');
  const [length, setLength] = useState<string>('14.0');
  const [weight, setWeight] = useState<string>('22.0');
  const [fuelType, setFuelType] = useState<'diesel' | 'electric' | 'cng' | 'gasoline'>('diesel');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a vehicle profile name.');
      return;
    }

    const h = parseFloat(height);
    const w = parseFloat(width);
    const l = parseFloat(length);
    const wt = parseFloat(weight);

    if (isNaN(h) || h <= 0) {
      setError('Vehicle height must be greater than 0.');
      return;
    }
    if (isNaN(w) || w <= 0) {
      setError('Vehicle width must be greater than 0.');
      return;
    }
    if (isNaN(l) || l <= 0) {
      setError('Vehicle length must be greater than 0.');
      return;
    }
    if (isNaN(wt) || wt <= 0) {
      setError('Vehicle weight must be greater than 0.');
      return;
    }

    const newVehicle: Vehicle = {
      id: `custom-veh-${Date.now()}`,
      name: name.trim(),
      type,
      height: h,
      width: w,
      length: l,
      weight: wt,
      fuelType,
      emissionRate: fuelType === 'electric' ? 0.05 : wt > 10 ? 0.58 : 0.25,
      isCustom: true
    };

    addCustomVehicle(newVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl text-left">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#166534]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Custom Vehicle Profile</h3>
              <p className="text-xs text-slate-500">Specify physical dimensions for clearance validation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Profile Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Articulated Refrigerator Rig"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as VehicleType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              >
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="bus">Bus</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="custom">Special Transporter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Powertrain</label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              >
                <option value="diesel">Diesel</option>
                <option value="electric">Electric EV</option>
                <option value="cng">CNG / Hybrid</option>
                <option value="gasoline">Gasoline</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Height <span className="text-slate-400 font-normal">(meters)</span>
              </label>
              <input
                type="number"
                step="0.05"
                value={height}
                onChange={e => setHeight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Width <span className="text-slate-400 font-normal">(meters)</span>
              </label>
              <input
                type="number"
                step="0.05"
                value={width}
                onChange={e => setWidth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Length <span className="text-slate-400 font-normal">(meters)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={length}
                onChange={e => setLength(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Weight <span className="text-slate-400 font-normal">(tons)</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
