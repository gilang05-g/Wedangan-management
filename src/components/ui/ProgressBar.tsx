import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
          <span>{label}</span>
          <span className="font-semibold text-slate-700">{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
