import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { BackButton } from '../ui/BackButton';
import { InputField } from '../ui/InputField';
import { SelectField } from '../ui/SelectField';
import { Trash2, Plus } from 'lucide-react';

interface SalesViewProps {
    inventory: any[];
    sales: any[];
    products: any[];
    sellers: any[];
    setActiveTab: (tab: string) => void;
    addSale: (productId: string, quantity: number | string, totalValue: number | string, sellerIds: string[], customerName: string, customerPhone: string) => void;
    deleteSale: (saleId: string) => void;
    formatCurrency: (val: number) => string;
    formatDate: (date: string) => string;
}

const SaleCard = ({ sale, product, sellers, deleteSale, formatCurrency, formatDate }: any) => {
    const [expanded, setExpanded] = useState(false);
    const saleProfit = Number(sale.totalValue) - (Number(product?.purchasePrice || 0) * Number(sale.quantity));
    const sellerNames = sale.sellerIds?.map((id: string) => sellers.find((sel: any) => sel.id === id)?.name).join(', ') || 'N/A';

    return (
        <Card noPadding className={`p-4 border-l-4 ${saleProfit >= 0 ? 'border-l-slate-400' : 'border-l-[#BC2A1A]'} relative group transition-all`}>
            {/* Delete Button */}
            <button 
                onClick={() => deleteSale(sale.id)}
                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors p-1 z-10"
            >
                <Trash2 size={14} />
            </button>

            {/* Header: Date & Seller */}
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{formatDate(sale.date)}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{sellerNames}</span>
            </div>

            {/* Main Content: Product & Financials */}
            <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col pr-4">
                    <span className="font-black text-slate-900 text-sm uppercase leading-tight max-w-[180px] break-words">
                        {product?.name || 'Item'} <span className="text-slate-400 text-xs">(x{sale.quantity})</span>
                    </span>
                </div>
                <div className="text-right flex flex-col items-end min-w-[80px]">
                    <span className="block font-black text-slate-800 text-sm leading-none mb-1">
                        {formatCurrency(Number(sale.totalValue))}
                    </span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${saleProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-[#BC2A1A]/10 text-[#BC2A1A]'}`}>
                        {saleProfit > 0 ? '+' : ''}{formatCurrency(saleProfit)}
                    </span>
                </div>
            </div>

            {/* Details Toggle */}
            <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full py-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors border-t border-slate-100 mt-2"
            >
                {expanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                <div className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▼</div>
            </button>

            {/* Collapsible Details */}
            {expanded && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-slate-50/50 rounded-xl p-3 mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Custo Un.</span>
                        <span className="text-[10px] font-bold text-slate-600">{formatCurrency(Number(product?.purchasePrice || 0))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Venda Un.</span>
                        <span className="text-[10px] font-bold text-slate-600">{formatCurrency(Number(sale.totalValue) / Number(sale.quantity))}</span>
                    </div>
                </div>
            )}
        </Card>
    );
};

const ClientSearch = ({ clients, value, onChange, onSelect }: any) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Se tem valor filtrado, usa o filtro. Se não tem valor, mostra todos os clientes.
    // Ordenar clientes por nome para facilitar a busca visual
    const sortedClients = [...clients].sort((a: any, b: any) => a.nome.localeCompare(b.nome));
    
    const filteredClients = value 
        ? sortedClients.filter((c: any) => c.nome.toLowerCase().includes(value.toLowerCase()))
        : sortedClients;

    return (
        <div className="relative">
            <InputField 
                label="Nome do Cliente (Opcional)" 
                value={value} 
                onChange={(e: any) => {
                    onChange(e.target.value);
                    setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Ex: Maria Silva"
                autoComplete="off"
            />
            {showSuggestions && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {/* Opção Fixa de Cadastro */}
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault(); // Evita perder o foco do input
                            onChange(''); // Limpa o campo para digitar um novo nome
                            setShowSuggestions(false); // Fecha a lista momentaneamente ou mantém aberta? Melhor fechar para indicar ação.
                            // Na verdade, o usuário quer "Cadastrar". Como o cadastro é apenas digitar um nome novo...
                            // Vamos focar no input.
                            setTimeout(() => {
                                const input = document.querySelector('input[placeholder="Ex: Maria Silva"]') as HTMLInputElement;
                                if(input) input.focus();
                            }, 50);
                        }}
                        className="sticky top-0 z-10 w-full text-left px-4 py-3 bg-[#BC2A1A]/5 hover:bg-[#BC2A1A]/10 border-b border-[#BC2A1A]/10 text-[#BC2A1A] font-black text-xs uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm"
                    >
                        <div className="w-5 h-5 rounded-full bg-[#BC2A1A] flex items-center justify-center shadow-sm">
                            <Plus size={12} className="text-white" strokeWidth={4} />
                        </div>
                        Cadastrar Novo Cliente
                    </button>

                    {/* Lista de Clientes */}
                    {filteredClients.length > 0 ? (
                        filteredClients.map((client: any) => (
                            <button
                                key={client.id}
                                type="button"
                                onClick={() => {
                                    onSelect(client);
                                    setShowSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-none flex justify-between items-center group transition-colors"
                            >
                                <span className="font-bold text-slate-700 text-sm group-hover:text-[#BC2A1A] transition-colors">{client.nome}</span>
                                {client.telefone && <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{client.telefone}</span>}
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                "{value}" será cadastrado como novo
                            </p>
                        </div>
                    )}
                </div>
            )}
            {showSuggestions && (
                <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
            )}
        </div>
    );
};

export const SalesView = ({ 
    inventory, 
    sales, 
    products, 
    sellers, 
    clients = [],
    setActiveTab, 
    addSale, 
    deleteSale,
    formatCurrency, 
    formatDate 
}: any) => {
    const [selectedProd, setSelectedProd] = useState('');
    const [qty, setQty] = useState<number>(1);
    const [total, setTotal] = useState<string | number>('');
    const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const handleClientSelect = (client: any) => {
        setCustomerName(client.nome);
        if (client.telefone) {
            setCustomerPhone(client.telefone);
        }
    };

    const handleSave = (e: any) => {
        e.preventDefault();
        if(!selectedProd || !qty || !total || selectedSellers.length === 0) return;
        addSale(selectedProd, qty, total, selectedSellers, customerName, customerPhone);
        setSelectedProd(''); setQty(1); setTotal(''); setSelectedSellers([]);
        setCustomerName(''); setCustomerPhone('');
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-left-6 duration-500 pb-32">
        <header className="text-left">
            <BackButton onClick={() => setActiveTab('overview')} />
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Vendas</h1>
        </header>

        <Card className="p-8 border-t-8 border-t-[#BC2A1A] shadow-xl text-left">
            <form onSubmit={handleSave} className="space-y-6">
            <SelectField label="Artigo" value={selectedProd} onChange={(e: any) => {
                setSelectedProd(e.target.value);
                const prod = products.find((p: any) => p.id === e.target.value);
                if(prod) setTotal(prod.basePrice * qty);
            }}>
                <option value="">Escolher produto...</option>
                {inventory.filter((p: any) => p.currentStock > 0).map((p: any) => (
                    <option key={p.id} value={p.id}>
                        {p.name} ({p.currentStock} un.)
                    </option>
                ))}
            </SelectField>
            
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Qtd." type="number" value={qty} min="1" onChange={(e: any) => {
                    setQty(Number(e.target.value));
                    const prod = products.find((p: any) => p.id === selectedProd);
                    if(prod) setTotal(prod.basePrice * Number(e.target.value));
                }} />
                <InputField 
                    label="Valor Total" 
                    value={total === '' ? '' : formatCurrency(Number(total))} 
                    onChange={(e: any) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        if (rawValue === '') {
                            setTotal('');
                        } else {
                            setTotal(Number(rawValue) / 100);
                        }
                    }} 
                />
            </div>

            {/* Dados do Cliente - Busca Inteligente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-20">
                <ClientSearch 
                    clients={clients} 
                    value={customerName} 
                    onChange={setCustomerName} 
                    onSelect={handleClientSelect} 
                />
                <InputField 
                    label="Telefone (Opcional)" 
                    value={customerPhone} 
                    onChange={(e: any) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                />
            </div>

            <div className="space-y-3 pt-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Vendedor</label>
                <div className="grid grid-cols-2 gap-3">
                {sellers.map((s: any) => (
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
            {sales.length > 0 ? [...sales].reverse().slice(0, 20).map(s => {
                const product = products.find((p: any) => p.id === s.productId);
                return (
                    <SaleCard 
                        key={s.id} 
                        sale={s} 
                        product={product} 
                        sellers={sellers} 
                        deleteSale={deleteSale} 
                        formatCurrency={formatCurrency} 
                        formatDate={formatDate} 
                    />
                );
            }) : <p className="text-center py-10 opacity-20 font-black uppercase text-[10px] tracking-widest">Sem vendas hoje</p>}
        </div>
        </div>
    );
};
