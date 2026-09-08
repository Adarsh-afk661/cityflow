import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  isPositive = true,
  icon,
  subtitle,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[#166534]">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline space-x-1.5">
        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500 font-mono font-medium">{unit}</span>}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
        {trend && (
          <span
            className={`flex items-center space-x-0.5 text-[11px] font-mono font-bold ${
              isPositive ? 'text-[#166534]' : 'text-rose-600'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </span>
        )}
        {subtitle && (
          <span className="text-[11px] text-slate-500 font-medium">{subtitle}</span>
        )}
      </div>
    </div>
  );
};
