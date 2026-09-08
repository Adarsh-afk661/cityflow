import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CloudRain,
  Car,
  CheckCircle2,
  Navigation,
  Check
} from 'lucide-react';
import { Alert } from '../../types';
import { useCityFlow } from '../../context/CityFlowContext';

interface AlertCardProps {
  alert: Alert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const { acknowledgeAlert, setActivePage, setSelectedRoute, candidateRoutes } = useCityFlow();

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'clearance': return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'accident': return <Car className="w-5 h-5 text-rose-600" />;
      case 'weather': return <CloudRain className="w-5 h-5 text-amber-600" />;
      case 'traffic': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default: return <CheckCircle2 className="w-5 h-5 text-[#166534]" />;
    }
  };

  const handleViewRoute = () => {
    if (alert.affectedRoute) {
      const match = candidateRoutes.find(r => r.name.toLowerCase().includes(alert.affectedRoute!.toLowerCase()));
      if (match) setSelectedRoute(match);
    }
    setActivePage('dashboard');
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all text-left shadow-sm ${
        alert.acknowledged
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : alert.severity === 'critical'
          ? 'bg-rose-50/50 border-rose-200'
          : alert.severity === 'warning'
          ? 'bg-amber-50/50 border-amber-200'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-sm">
            {getAlertIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                  alert.severity === 'critical'
                    ? 'bg-rose-100 text-rose-800'
                    : alert.severity === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-[#166534]'
                }`}
              >
                {alert.severity}
              </span>
              <span className="text-[10px] uppercase text-slate-500 font-mono">{alert.type}</span>
              <span className="text-[10px] text-slate-500">• {alert.timestamp}</span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mt-1">{alert.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.description}</p>

            {/* Recommended Action box */}
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs">
              <span className="text-[10px] uppercase font-bold text-[#166534] block mb-0.5">Recommended Action</span>
              <span className="text-emerald-900 font-medium">{alert.recommendedAction}</span>
            </div>

            {/* Context chips */}
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
              {alert.affectedVehicle && (
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  Vehicle: <strong className="text-slate-800 font-medium">{alert.affectedVehicle}</strong>
                </span>
              )}
              {alert.affectedRoute && (
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  Corridor: <strong className="text-slate-800 font-medium">{alert.affectedRoute}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 shrink-0">
          <button
            onClick={handleViewRoute}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition shadow-sm"
          >
            <Navigation className="w-3 h-3 text-[#166534]" />
            <span>View Route</span>
          </button>
          {!alert.acknowledged && (
            <button
              onClick={() => acknowledgeAlert(alert.id)}
              className="px-3 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center space-x-1 transition shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Acknowledge</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

