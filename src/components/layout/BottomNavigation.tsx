'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, FileText, Settings } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Beranda',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Rute',
      href: '/routes',
      icon: MapPin,
      isActive: pathname.startsWith('/routes'),
    },
    {
      label: 'Laporan',
      href: '/summary',
      icon: FileText,
      isActive: pathname.startsWith('/summary'),
    },
    {
      label: 'Pengaturan',
      href: '/settings',
      icon: Settings,
      isActive: pathname.startsWith('/settings'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around pointer-events-auto shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const activeColor = item.isActive ? 'text-[#FF9012]' : 'text-slate-400 hover:text-slate-600';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-colors duration-150 ${activeColor}`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[11px] ${item.isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
