'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Settings, Menu } from 'lucide-react';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  showSettings?: boolean;
  isDashboard?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = 'WMS',
  subtitle = 'Wedangan Management System',
  showBack = false,
  backHref = '/',
  showSettings = true,
  isDashboard = false,
}) => {
  return (
    <header className="bg-[#FF9012] text-white px-4 py-3 sticky top-0 z-40 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        {showBack ? (
          <Link
            href={backHref}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-transform"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Link>
        ) : isDashboard ? (
          <div className="w-9 h-9 flex items-center justify-center rounded-full">
            <Menu className="w-6 h-6 text-white" />
          </div>
        ) : (
          <div className="w-2" />
        )}

        <div className="flex flex-col">
          <h1 className="text-base font-bold leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-white/90 font-medium leading-tight">{subtitle}</p>
          )}
        </div>
      </div>

      <div>
        {showSettings && (
          <Link
            href="/settings"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-transform"
            aria-label="Pengaturan"
          >
            <Settings className="w-5 h-5 text-white" />
          </Link>
        )}
      </div>
    </header>
  );
};
