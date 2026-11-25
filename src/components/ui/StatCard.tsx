import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  value: string | number;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconBgColor = 'bg-sky-50',
  iconColor = 'text-sky-500',
  value,
  label,
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
      <div className={`w-9 h-9 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center mb-1.5`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-sm font-bold text-slate-800 tracking-tight truncate max-w-full">
        {value}
      </div>
      <div className="text-[11px] text-slate-500 font-medium">
        {label}
      </div>
    </div>
  );
};
