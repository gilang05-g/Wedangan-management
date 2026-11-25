import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'info' | 'default';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    info: 'bg-sky-50 text-sky-700 border-sky-100',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
};
