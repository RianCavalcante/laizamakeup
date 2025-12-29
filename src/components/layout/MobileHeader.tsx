import React, { useState } from 'react';
import { LayoutDashboard, Package, PackageX, ShoppingCart, Users, Menu, X } from 'lucide-react';

interface MobileHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileHeader = ({ activeTab, setActiveTab }: MobileHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Painel' },
    { id: 'products', icon: Package, label: 'Produtos' },
    { id: 'outOfStock', icon: PackageX, label: 'Esgotados' },
    { id: 'sales', icon: ShoppingCart, label: 'Vendas' },
    { id: 'clients', icon: Users, label: 'Clientes' }
  ];

  const handleNavigation = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-black tracking-tighter uppercase leading-none">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Laiza</span>{' '}
            <span className="bg-gradient-to-r from-[#BC2A1A] to-[#d63426] bg-clip-text text-transparent">Makeup</span>
          </h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-[#BC2A1A] hover:text-white transition-all active:scale-95"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Menu */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black tracking-tighter uppercase">Menu</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#BC2A1A] hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Navegação</p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm uppercase tracking-wide ${
                  activeTab === item.id
                    ? 'bg-[#BC2A1A] text-white shadow-lg shadow-[#BC2A1A]/30'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-[#BC2A1A]'} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl p-1 shadow-sm border border-[#FFDCD8]">
                <img
                  src="https://i.postimg.cc/9Qj5MfGC/Whats-App-Image-2025-12-26-at-13-19-56.jpg"
                  className="w-full h-full object-contain rounded-lg"
                  alt="Logo"
                />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-900 uppercase">Premium v5.0</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-wide">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
