import React from 'react';
import { LayoutDashboard, Package, PackageX, ShoppingCart, Upload, Users } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Painel' },
    { id: 'products', icon: Package, label: 'Stock' },
    { id: 'outOfStock', icon: PackageX, label: 'Esgotados' },
    { id: 'sales', icon: ShoppingCart, label: 'Vendas' },
    { id: 'clients', icon: Users, label: 'Clientes' }
  ];

  return (
    <aside className="w-80 hidden lg:flex flex-col fixed inset-y-6 left-6 z-50">
      <div className="flex-1 glass-panel rounded-[40px] flex flex-col p-6 shadow-2xl">
        <div className="px-6 py-6 mb-4">
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent drop-shadow-sm">Laiza</span>{' '}
              <span className="bg-gradient-to-r from-[#BC2A1A] to-[#d63426] bg-clip-text text-transparent drop-shadow-sm">Makeup</span>
            </h2>
        </div>
        
        <nav className="flex-1 space-y-3">
            {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-6 py-5 rounded-[24px] transition-all duration-300 font-black text-[11px] uppercase tracking-widest group ${
                activeTab === item.id 
                    ? 'bg-[#BC2A1A] text-white shadow-[#BC2A1A]/30 shadow-lg translate-x-2' 
                    : 'text-slate-500 hover:bg-[#FFDCD8]/30 hover:text-[#BC2A1A] hover:translate-x-1'
                }`}>
                <div className="flex items-center gap-4">
                <item.icon size={20} className={activeTab === item.id ? "text-white" : "text-[#BC2A1A] group-hover:scale-110 transition-transform"} />
                {item.label}
                </div>
            </button>
            ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#FFDCD8]/50 flex items-center gap-4 px-2">
            <div className="w-12 h-12 bg-white rounded-2xl p-1 shadow-sm border border-[#FFDCD8]">
                <img src="https://i.postimg.cc/9Qj5MfGC/Whats-App-Image-2025-12-26-at-13-19-56.jpg" className="w-full h-full object-contain rounded-xl" alt="" />
            </div>
            <div>
                <p className="text-[11px] font-black text-slate-900 uppercase">Premium v5.0</p>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide">Online</p>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};
