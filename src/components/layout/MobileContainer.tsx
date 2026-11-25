import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <main className="w-full max-w-md bg-white min-h-screen flex flex-col relative pb-20 shadow-xl border-x border-slate-200 antialiased overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
