import React from 'react';
import { Card } from '../ui/Card';
import { Calendar, Wallet, Users, Package } from 'lucide-react';

interface OverviewProps {
  sales: any[];
  products: any[];
  inventory: any[];
  sellers: any[];
  setActiveTab: (tab: string) => void;
  formatCurrency: (val: number) => string;
}

export const Overview = ({ sales, products, inventory, sellers, setActiveTab, formatCurrency }: OverviewProps) => {
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalValue), 0);
  const totalProfit = sales.reduce((sum, s) => {
    const product = products.find(p => p.id === s.productId);
    if (!product) return sum;
    return sum + (Number(s.totalValue) - (Number(product.purchasePrice) * Number(s.quantity)));
  }, 0);

  const totalUnitsInStock = inventory.reduce((sum, p) => sum + p.currentStock, 0);
  const zerados = inventory.filter(p => p.currentStock === 0).length;
  
  const salesBySeller = sellers.map(seller => ({
    name: seller.nome || seller.name, // Suporta ambos
    total: sales.filter(s => s.sellerIds.includes(seller.id)).reduce((sum, s) => sum + Number(s.totalValue), 0)
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2 text-left">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-tight">Painel Geral</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Gestão de Estoque</p>
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 w-fit px-3 py-1.5 rounded-full font-bold text-[9px] uppercase tracking-widest mt-1">
          <Calendar size={10} /> {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card className="min-h-[85px] flex flex-col justify-center text-left hover:shadow-md transition-shadow relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid1" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="none" stroke="#BC2A1A" strokeWidth="1"/>
              </pattern>
              <radialGradient id="fade1">
                <stop offset="0%" stopOpacity="1"/>
                <stop offset="100%" stopOpacity="0"/>
              </radialGradient>
              <mask id="mask1">
                <rect width="100%" height="100%" fill="url(#fade1)"/>
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid1)" mask="url(#mask1)"/>
          </svg>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Qtd. Vendas</p>
          <h2 className="text-2xl font-black text-slate-900 leading-tight relative z-10">{sales.length} vendas</h2>
        </Card>
        
        <Card className="min-h-[85px] flex flex-col justify-center text-left hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden" onClick={() => setActiveTab('outOfStock')}>
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="none" stroke="#BC2A1A" strokeWidth="1"/>
              </pattern>
              <radialGradient id="fade2">
                <stop offset="0%" stopOpacity="1"/>
                <stop offset="100%" stopOpacity="0"/>
              </radialGradient>
              <mask id="mask2">
                <rect width="100%" height="100%" fill="url(#fade2)"/>
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" mask="url(#mask2)"/>
          </svg>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Esgotados</p>
          <h2 className={`text-2xl font-black ${zerados > 0 ? 'text-[#BC2A1A]' : 'text-slate-900'} relative z-10`}>{zerados} itens</h2>
        </Card>

        <Card className="shadow-sm text-left hover:shadow-md transition-shadow relative overflow-hidden min-h-[110px]">
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid3" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="none" stroke="#BC2A1A" strokeWidth="1"/>
              </pattern>
              <radialGradient id="fade3">
                <stop offset="0%" stopOpacity="1"/>
                <stop offset="100%" stopOpacity="0"/>
              </radialGradient>
              <mask id="mask3">
                <rect width="100%" height="100%" fill="url(#fade3)"/>
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid3)" mask="url(#mask3)"/>
          </svg>
          <div className="flex flex-col h-full relative z-10">
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Faturamento</p>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-none tracking-tight truncate" title={formatCurrency(totalRevenue)}>{formatCurrency(totalRevenue)}</h2>
            </div>
            <div className="flex justify-end mt-2">
              <div className="w-8 h-8 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
                <Wallet size={16} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="text-left hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden min-h-[110px]" onClick={() => setActiveTab('products')}>
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid4" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="none" stroke="#BC2A1A" strokeWidth="1"/>
              </pattern>
              <radialGradient id="fade4">
                <stop offset="0%" stopOpacity="1"/>
                <stop offset="100%" stopOpacity="0"/>
              </radialGradient>
              <mask id="mask4">
                <rect width="100%" height="100%" fill="url(#fade4)"/>
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid4)" mask="url(#mask4)"/>
          </svg>
          <div className="flex flex-col h-full relative z-10">
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total em Stock</p>
              <h2 className="text-2xl font-black text-slate-900 leading-none">{inventory.length} <span className="text-[9px] uppercase text-slate-400">produtos</span></h2>
            </div>
            <div className="flex justify-end mt-2">
              <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                <Package size={16} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card noPadding className="mt-3 text-left bg-[#BC2A1A] text-white shadow-lg border-none">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-black text-white uppercase text-[10px] tracking-widest">Ranking Equipe</h3>
          <Users size={12} className="text-white/60" />
        </div>
        <div className="p-4 space-y-3">
          {salesBySeller.map((s, idx) => (
            <div key={s.name} className="flex justify-between items-center group hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black transition-all ${idx === 0 ? 'bg-white text-[#BC2A1A] shadow-sm group-hover:shadow-md' : 'bg-white/20 text-white group-hover:bg-white/30'}`}>
                  {idx + 1}
                </div>
                <span className="font-bold text-white uppercase text-[10px] tracking-tight group-hover:tracking-wide transition-all">{s.name}</span>
              </div>
              <span className="font-black text-white text-xs bg-white/10 px-2 py-0.5 rounded-lg group-hover:bg-white/20 transition-all">{formatCurrency(s.total)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
