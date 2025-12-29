import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { BackButton } from '../ui/BackButton';
import { InputField } from '../ui/InputField';
import { SelectField } from '../ui/SelectField';

interface SalesViewProps {
    inventory: any[];
    sales: any[];
    products: any[];
    sellers: any[];
    setActiveTab: (tab: string) => void;
    addSale: (productId: string, quantity: number | string, totalValue: number | string, sellerIds: string[]) => void;
    formatCurrency: (val: number) => string;
    formatDate: (date: string) => string;
}

export const SalesView = ({ 
    inventory, 
    sales, 
    products, 
    sellers, 
    setActiveTab, 
    addSale, 
    formatCurrency, 
    formatDate 
}: SalesViewProps) => {
    const [selectedProd, setSelectedProd] = useState('');
    const [qty, setQty] = useState<number>(1);
    const [total, setTotal] = useState<string | number>('');
    const [selectedSellers, setSelectedSellers] = useState<string[]>([]);

    const handleSave = (e: any) => {
        e.preventDefault();
        if(!selectedProd || !qty || !total || selectedSellers.length === 0) return;
        addSale(selectedProd, qty, total, selectedSellers);
        setSelectedProd(''); setQty(1); setTotal(''); setSelectedSellers([]);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-left-6 duration-500 pb-20">
        <header className="text-left">
            <BackButton onClick={() => setActiveTab('overview')} />
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Vendas</h1>
        </header>

        <Card className="p-8 border-t-8 border-t-[#BC2A1A] shadow-xl text-left">
            <form onSubmit={handleSave} className="space-y-6">
            <SelectField label="Artigo" value={selectedProd} onChange={(e: any) => {
                setSelectedProd(e.target.value);
                const prod = products.find(p => p.id === e.target.value);
                if(prod) setTotal(prod.basePrice * qty);
                }}>
                <option value="">Escolher produto...</option>
                {inventory.filter(p => p.currentStock > 0).map(p => <option key={p.id} value={p.id}>{p.name} ({p.currentStock} un.)</option>)}
            </SelectField>
            
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Qtd." type="number" value={qty} min="1" onChange={(e: any) => {
                    setQty(Number(e.target.value));
                    const prod = products.find(p => p.id === selectedProd);
                    if(prod) setTotal(prod.basePrice * Number(e.target.value));
                }} />
                <InputField label="Recebido" type="number" value={total} onChange={(e: any) => setTotal(e.target.value)} />
            </div>

            <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Vendedor</label>
                <div className="grid grid-cols-2 gap-3">
                {sellers.map(s => (
                    <label key={s.id} className={`flex items-center justify-center p-4 rounded-[20px] border-2 transition-all cursor-pointer ${selectedSellers.includes(s.id) ? 'border-[#BC2A1A] bg-[#BC2A1A]/5 text-[#BC2A1A]' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                    <input type="checkbox" checked={selectedSellers.includes(s.id)}
                        onChange={() => {
                        if(selectedSellers.includes(s.id)) setSelectedSellers(selectedSellers.filter(id => id !== s.id));
                        else setSelectedSellers([...selectedSellers, s.id]);
                        }} className="hidden" />
                    <span className="font-black uppercase text-[11px] tracking-widest">{s.name}</span>
                    </label>
                ))}
                </div>
            </div>

            <button className="w-full py-5 bg-[#BC2A1A] text-white rounded-[24px] font-black uppercase text-sm tracking-widest shadow-lg active:scale-95">Lançar Venda</button>
            </form>
        </Card>

        <div className="space-y-4 text-left">
            <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] ml-2">Histórico Recente</h3>
            {sales.length > 0 ? [...sales].reverse().slice(0, 5).map(s => {
            const product = products.find(p => p.id === s.productId);
            const saleProfit = Number(s.totalValue) - (Number(product?.purchasePrice || 0) * Number(s.quantity));
            return (
                <Card key={s.id} noPadding className="p-4 border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-center text-left">
                    <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(s.date)}</span>
                    <span className="font-black text-slate-900 text-xs uppercase">{product?.name || 'Item'} (x{s.quantity})</span>
                    </div>
                    <div className="text-right">
                    <span className="block font-black text-[#BC2A1A] text-sm">+{formatCurrency(saleProfit)}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Lucro Real</span>
                    </div>
                </div>
                </Card>
            );
            }) : <p className="text-center py-10 opacity-20 font-black uppercase text-[10px] tracking-widest">Sem vendas hoje</p>}
        </div>
        </div>
    );
};
