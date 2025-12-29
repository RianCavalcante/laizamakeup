import React from 'react';
import { LayoutDashboard, Package, PackageX, ShoppingCart, Upload, Users } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  zeradoCount: number;
}

export const MobileNav = ({ activeTab, setActiveTab, zeradoCount }: MobileNavProps) => {
  return (
    <nav className="lg:hidden fixed bottom-6 left-5 right-5 h-20 bg-slate-950/95 backdrop-blur-xl rounded-[32px] border border-slate-800 p-2 flex justify-around items-center z-50 shadow-2xl">
      {[
        { id: 'overview', icon: LayoutDashboard },
        { id: 'products', icon: Package },
        { id: 'outOfStock', icon: PackageX, badge: zeradoCount },
        { id: 'clients', icon: Users },
      ].map(item => (
        <button key={item.id} onClick={() => setActiveTab(item.id)}
          className={`relative w-14 h-14 rounded-2xl transition-all duration-300 flex items-center justify-center ${activeTab === item.id ? 'bg-[#BC2A1A] text-white scale-110 shadow-lg shadow-[#BC2A1A]/30' : 'text-slate-500'}`}>
          <item.icon size={22} strokeWidth={activeTab === item.id ? 3 : 2} />
          {(item.badge ?? 0) > 0 && activeTab !== item.id && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#BC2A1A] border-2 border-slate-950 text-white text-[9px] font-black flex items-center justify-center rounded-full animate-bounce">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};
