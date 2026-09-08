import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Check, ArrowRight, Zap, Truck, Navigation, CheckCircle2 } from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';

export const InteractiveHeroCard: React.FC = () => {
  const { setActivePage, setStartLocation, setDestinationLocation, setSelectedVehicle, vehicles } = useCityFlow();

  const [selectedCorridor, setSelectedCorridor] = useState<'noida-cp' | 'gn-airport' | 'cyber-delhi'>('noida-cp');
  const [selectedVehicleType, setSelectedVehicleType] = useState<'heavy' | 'van' | 'ev'>('heavy');

  // Corridor Profiles
  const corridors = {
    'noida-cp': {
      title: 'Noida Sector 62 ➔ Connaught Place, New Delhi',
      routes: [
        {
          id: 'A',
          name: 'Route A · NH9 Arterial & Vikas Marg',
          distance: '19.8 km',
          duration: selectedVehicleType === 'heavy' ? '40 min' : '32 min',
          status: selectedVehicleType === 'heavy' ? 'barred' : 'clear',
          badgeText: selectedVehicleType === 'heavy' ? 'BARRED' : 'CLEAR',
          desc: selectedVehicleType === 'heavy'
            ? 'Barred: 3.8m Metro Rail railway arch. 4.2m Heavy Truck breaches clearance by 0.4m!'
            : 'Passable: Vehicle height 2.4m clears 3.8m railway arch with 1.4m safety margin.'
        },
        {
          id: 'B',
          name: 'Route B · Outer Ring Beltway & Flyover',
          distance: '22.3 km',
          duration: '28 min',
          status: 'selected',
          badgeText: 'SELECTED',
          desc: 'Selected: Clearance certified (4.8m viaduct). Bypasses urban congestion with smooth free flow.'
        },
        {
          id: 'C',
          name: 'Route C · Eco-Flow Elevated Parkway',
          distance: '24.2 km',
          duration: '31 min',
          status: 'clear',
          badgeText: 'CLEAR',
          desc: 'Clearance approved (5.2m viaduct). Optimized gradient with steady velocity and lowest CO₂.'
        }
      ]
    },
    'gn-airport': {
      title: 'Greater Noida Logistics Park ➔ Delhi Airport (IGI)',
      routes: [
        {
          id: 'A',
          name: 'Route A · Noida Expressway & DND Link',
          distance: '51.8 km',
          duration: '64 min',
          status: selectedVehicleType === 'heavy' ? 'barred' : 'clear',
          badgeText: selectedVehicleType === 'heavy' ? 'BARRED' : 'CLEAR',
          desc: selectedVehicleType === 'heavy'
            ? 'Barred: 3.9m approach portal under construction. Heavy commercial restrictions apply.'
            : 'Passable: Standard freight corridor with normal clearance.'
        },
        {
          id: 'B',
          name: 'Route B · Eastern Peripheral Bypass (EPE)',
          distance: '58.4 km',
          duration: '59 min',
          status: 'selected',
          badgeText: 'SELECTED',
          desc: 'Selected: High-speed 6-lane bypass. Unrestricted 5.5m clearance with continuous highway velocity.'
        },
        {
          id: 'C',
          name: 'Route C · Yamuna Expressway Link',
          distance: '54.2 km',
          duration: '68 min',
          status: 'clear',
          badgeText: 'CLEAR',
          desc: 'Passable: Certified commercial bypass with dedicated truck lanes.'
        }
      ]
    },
    'cyber-delhi': {
      title: 'Cyber City, Gurugram ➔ Connaught Place, New Delhi',
      routes: [
        {
          id: 'A',
          name: 'Route A · Delhi-Gurgaon Expressway (NH48)',
          distance: '27.6 km',
          duration: '42 min',
          status: selectedVehicleType === 'heavy' ? 'barred' : 'clear',
          badgeText: selectedVehicleType === 'heavy' ? 'BARRED' : 'CLEAR',
          desc: selectedVehicleType === 'heavy'
            ? 'Barred: Peak-hour commercial restriction & 3.8m arterial barrier at Dhaula Kuan.'
            : 'Passable: Free flow arterial access into Central Delhi.'
        },
        {
          id: 'B',
          name: 'Route B · MG Road & South Ring Viaduct',
          distance: '31.2 km',
          duration: '48 min',
          status: 'selected',
          badgeText: 'SELECTED',
          desc: 'Selected: Generous 4.8m overhead clearance throughout. Recommended high-reliability detour.'
        },
        {
          id: 'C',
          name: 'Route C · Mehrauli Elevated Corridor',
          distance: '29.5 km',
          duration: '45 min',
          status: 'clear',
          badgeText: 'CLEAR',
          desc: 'Passable: Moderate traffic arterial with certified clearance.'
        }
      ]
    }
  };

  const currentCorridor = corridors[selectedCorridor];

  const handleLaunchInRouteShield = () => {
    if (selectedCorridor === 'noida-cp') {
      setStartLocation('Noida Sector 62');
      setDestinationLocation('Connaught Place, New Delhi');
    } else if (selectedCorridor === 'gn-airport') {
      setStartLocation('Greater Noida Logistics Park');
      setDestinationLocation('Indira Gandhi International Airport, Delhi');
    } else {
      setStartLocation('Cyber City, Gurugram');
      setDestinationLocation('Connaught Place, New Delhi');
    }

    if (selectedVehicleType === 'heavy') {
      setSelectedVehicle(vehicles[0] || { name: 'Heavy Delivery Truck', height: 4.2, weight: 28 });
    } else if (selectedVehicleType === 'van') {
      setSelectedVehicle(vehicles[1] || { name: 'Standard Cargo Van', height: 2.4, weight: 4.5 });
    }
    setActivePage('routeshield');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.08)] border border-slate-200/90 text-left transition-all">
      {/* Interactive Corridor Selector Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center space-x-1.5">
          <Navigation className="w-4 h-4 text-[#166534]" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Interactive Corridor Simulator
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Real Road Telemetry</span>
        </div>
      </div>

      {/* Preset Corridor Selector */}
      <div className="flex items-center gap-2 pt-3 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedCorridor('noida-cp')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCorridor === 'noida-cp'
              ? 'bg-[#166534] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Noida ➔ Connaught Place
        </button>
        <button
          type="button"
          onClick={() => setSelectedCorridor('gn-airport')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCorridor === 'gn-airport'
              ? 'bg-[#166534] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Greater Noida ➔ Delhi Airport
        </button>
        <button
          type="button"
          onClick={() => setSelectedCorridor('cyber-delhi')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCorridor === 'cyber-delhi'
              ? 'bg-[#166534] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Cyber City ➔ Central Delhi
        </button>
      </div>

      {/* Vehicle Profile Selector */}
      <div className="bg-slate-50 p-3 rounded-2xl my-3 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-bold text-slate-700">Vehicle Class:</span>
        </div>
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedVehicleType('heavy')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedVehicleType === 'heavy'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            4.2m Heavy Truck
          </button>
          <button
            type="button"
            onClick={() => setSelectedVehicleType('van')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedVehicleType === 'van'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            2.4m Cargo Van
          </button>
          <button
            type="button"
            onClick={() => setSelectedVehicleType('ev')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedVehicleType === 'ev'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            3.6m Electric Hauler
          </button>
        </div>
      </div>

      {/* Active Corridor Title */}
      <div className="text-xs font-mono font-semibold text-slate-500 mb-2">
        Corridor: <span className="text-slate-900 font-bold">{currentCorridor.title}</span>
      </div>

      {/* Candidate Routes List */}
      <div className="space-y-2.5 py-2">
        {currentCorridor.routes.map(r => {
          const isBarred = r.status === 'barred';
          const isSelected = r.status === 'selected';

          return (
            <div
              key={r.id}
              className={`p-3.5 rounded-2xl transition-all select-none border ${
                isSelected
                  ? 'bg-emerald-50/90 border-emerald-300 shadow-sm'
                  : isBarred
                  ? 'bg-rose-50/60 border-rose-200/80'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                    isSelected
                      ? 'bg-[#166534] text-white'
                      : isBarred
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {r.id}
                  </span>
                  <div>
                    <span className={`text-sm font-bold block ${isBarred ? 'line-through text-rose-800' : 'text-slate-900'}`}>
                      {r.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Real Road Distance: <b className="text-slate-800">{r.distance}</b> · ETA: <b className="text-slate-800">{r.duration}</b>
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-extrabold tracking-wider ${
                    isBarred
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : isSelected
                      ? 'bg-[#166534] text-white shadow-xs'
                      : 'bg-emerald-100 text-[#166534]'
                  }`}
                >
                  {r.badgeText}
                </span>
              </div>

              {/* Status Explanation */}
              <p className={`text-xs mt-2 leading-relaxed ${isBarred ? 'text-rose-700 font-semibold' : 'text-slate-600'}`}>
                {r.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Dynamic Barring Notice Banner */}
      {selectedVehicleType === 'heavy' ? (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <strong>Automated Physical Barring Active:</strong> Route A automatically barred for 4.2m Heavy Truck. Dispatch safely routed via Route B (Outer Ring Beltway, 4.8m clearance) to prevent catastrophic underpass collisions.
          </div>
        </div>
      ) : (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#166534] flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#166534] mt-0.5" />
          <div>
            <strong>Clearance Certified:</strong> Vehicle height ({selectedVehicleType === 'van' ? '2.4m' : '3.6m'}) safely passes through all overhead underpass checkpoints along the corridor.
          </div>
        </div>
      )}

      {/* Direct CTA to RouteShield */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-slate-500 font-medium">
          Ready to route your fleet with real GIS accuracy?
        </span>
        <button
          type="button"
          onClick={handleLaunchInRouteShield}
          className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>Launch in RouteShield</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
