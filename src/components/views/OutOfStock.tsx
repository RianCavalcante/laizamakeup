import React from 'react';
import { Card } from '../ui/Card';
import { BackButton } from '../ui/BackButton';
import { CheckCircle2, ImageIcon } from 'lucide-react';

interface OutOfStockProps {
    inventory: any[];
    setActiveTab: (tab: string) => void;
    openReplenishModal: (product: any) => void;
}

export const OutOfStockView = ({ inventory, setActiveTab, openReplenishModal }: OutOfStockProps) => {
    const outOfStockItems = inventory.filter(p => p.currentStock === 0);

    return (
        <div className="space-y-6 animate-in slide-in-from-right-6 duration-500 pb-10">
        <header className="text-left">
            <BackButton onClick={() => setActiveTab('overview')} />
            <h1 className="text-3xl font-black text-[#BC2A1A] tracking-tighter uppercase leading-none">Stock Esgotado</h1>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">Produtos que precisam de reposição</p>
        </header>

        <div className="space-y-4">
            {outOfStockItems.length > 0 ? outOfStockItems.map(p => (
            <Card key={p.id} noPadding className="p-4 border-l-4 border-l-[#BC2A1A] text-left">
                <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden grayscale opacity-50">
                    {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={18}/></div>}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <span className="block font-black text-slate-900 text-sm uppercase truncate mb-1">{p.name}</span>
                    <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#BC2A1A] uppercase tracking-widest">⚠️ Esgotado</span>
                    <button 
                        onClick={() => openReplenishModal(p)}
                        className="px-4 py-2 bg-[#BC2A1A] text-white rounded-xl font-black text-[10px] uppercase active:scale-95"
                    >
                        Repor
                    </button>
                    </div>
                </div>
                </div>
            </Card>
            )) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                <CheckCircle2 size={48} className="text-emerald-500 mb-2" />
                <h3 className="text-sm font-black uppercase tracking-widest">Tudo em Dia!</h3>
            </div>
            )}
        </div>
        </div>
    );
};
