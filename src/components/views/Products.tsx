import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { BackButton } from '../ui/BackButton';
import { InputField } from '../ui/InputField';
import { PlusCircle, ImageIcon, Plus, Pencil, Trash2, X, Camera, Upload, ArrowLeft, Search } from 'lucide-react';

interface ProductsViewProps {
  inventory: any[];
  setActiveTab: (tab: string) => void;
  formatCurrency: (val: number) => string;
  getUnitProfit: (cost: number, price: number) => number;
  saveProduct: (data: any) => void;
  deleteProduct: (id: string) => void;
  openReplenishModal: (product: any) => void;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  setReplenishments: React.Dispatch<React.SetStateAction<any[]>>;
}

export const ProductsView = ({ 
  inventory, 
  setActiveTab, 
  formatCurrency, 
  getUnitProfit, 
  saveProduct, 
  deleteProduct, 
  openReplenishModal,
  setProducts,
  setReplenishments
}: ProductsViewProps) => {
  const [formData, setFormData] = useState<any>({ id: null, name: '', purchasePrice: '', basePrice: '', initialStock: '', image: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleCSVImport = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n');
    const newProducts: any[] = [];
    const newReplenishments: any[] = [];
    
    // Ignorar cabeçalho se existir
    const startIndex = lines[0].toLowerCase().includes('nome') || lines[0].toLowerCase().includes('name') ? 1 : 0;

    let importedCount = 0;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const separator = line.includes(';') ? ';' : ',';
        const cols = line.split(separator);

        // Esperado: Nome, Custo, Venda, Qtd
        if (cols.length >= 3) {
            const name = cols[0].trim();
            const cost = Number(cols[1].replace('R$', '').replace(',', '.').trim()) || 0;
            const price = Number(cols[2].replace('R$', '').replace(',', '.').trim()) || 0;
            const qtd = Number(cols[3]?.trim()) || 0;

            if (name) {
                const pid = crypto.randomUUID();
                newProducts.push({
                    id: pid,
                    name,
                    purchasePrice: cost,
                    basePrice: price,
                    image: null,
                    active: true,
                    createdAt: new Date().toISOString()
                });

                if (qtd > 0) {
                    newReplenishments.push({
                        id: crypto.randomUUID(),
                        productId: pid,
                        quantity: qtd,
                        unitPrice: cost,
                        totalCost: qtd * cost,
                        date: new Date().toISOString()
                    });
                }
                importedCount++;
            }
        }
    }

    if (importedCount > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setReplenishments(prev => [...prev, ...newReplenishments]);
        alert(`${importedCount} produtos importados com sucesso!`);
    } else {
        alert('Nenhum produto válido encontrado. Verifique o formato: Nome, Custo, Venda, Qtd');
    }
    
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const openEditModal = (product: any) => {
    setFormData({
      id: product.id,
      name: product.name,
      purchasePrice: product.purchasePrice,
      basePrice: product.basePrice,
      initialStock: '', 
      image: product.image
    });
    document.getElementById('add-product-modal')?.classList.remove('hidden');
  };

  const openNewModal = () => {
    setFormData({ id: null, name: '', purchasePrice: '', basePrice: '', initialStock: '', image: '' });
    document.getElementById('add-product-modal')?.classList.remove('hidden');
  };

  // Filtrar produtos pela busca
  const filteredInventory = inventory.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500 pb-10">
      <header className="text-left">
        <BackButton onClick={() => setActiveTab('overview')} />
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Stock</h1>
          <span className="bg-[#FFDCD8] text-[#BC2A1A] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {inventory.length} produtos
          </span>
        </div>
      </header>

      <div className="flex justify-end">
        <button 
          onClick={openNewModal}
          className="bg-[#BC2A1A] text-white py-4 px-6 rounded-[24px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all w-full sm:w-auto"
        >
          <PlusCircle size={24} /> 
          <span className="font-black uppercase text-sm tracking-widest">Novo Produto</span>
        </button>
      </div>

      {/* Campo de Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-slate-100 border-none rounded-[24px] text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#BC2A1A]/20 transition-all placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-4">
        {filteredInventory.length === 0 ? (
          <Card className="p-6 rounded-[24px] text-center">
            <p className="text-slate-500">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado ainda'}
            </p>
          </Card>
        ) : (
          filteredInventory.map(p => (
          <Card key={p.id} noPadding className="p-4 text-left">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[20px] bg-slate-50 border border-[#FFDCD8] overflow-hidden flex-shrink-0">
                {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={20}/></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-black text-slate-800 text-sm uppercase truncate pr-2">{p.name}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${p.currentStock === 0 ? 'bg-[#BC2A1A] text-white' : 'bg-[#FFDCD8] text-[#BC2A1A]'}`}>
                    {p.currentStock} un.
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-xs ${getUnitProfit(p.purchasePrice, p.basePrice) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {getUnitProfit(p.purchasePrice, p.basePrice) > 0 ? '+' : ''}{formatCurrency(getUnitProfit(p.purchasePrice, p.basePrice))} lucro
                  </span>
                  <div className="flex items-center gap-2">
                     <button onClick={() => openEditModal(p)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#BC2A1A]">
                        <Pencil size={16} />
                     </button>
                     <button onClick={() => deleteProduct(p.id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#BC2A1A]">
                        <Trash2 size={16} />
                     </button>
                     <button 
                      onClick={() => openReplenishModal(p)}
                      className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center active:bg-[#BC2A1A] ml-2"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
        )}
      </div>

      <div id="add-product-modal" className="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-[100] overflow-y-auto">
        <div className="w-full max-w-md p-8 space-y-6 rounded-t-[40px] sm:rounded-[40px] bg-white shadow-2xl text-left">
          <div className="flex items-center gap-4">
            <button onClick={() => document.getElementById('add-product-modal')?.classList.add('hidden')} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-black text-slate-900 uppercase leading-none">{formData.id ? 'Editar' : 'Registo'}</h2>
          </div>
          
          <div className="flex flex-col items-center gap-2 py-2">
             <div 
               className="w-20 h-20 rounded-[20px] bg-[#FFDCD8]/30 border-2 border-dashed border-[#BC2A1A] overflow-hidden flex items-center justify-center relative active:scale-95 transition-all cursor-pointer hover:bg-[#FFDCD8]/50" 
               onClick={() => fileInputRef.current?.click()}
             >
                {formData.image ? (
                  <>
                    <img src={formData.image} className="w-full h-full object-cover" alt="Produto" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, image: '' });
                      }}
                      className="absolute -top-3 -right-3 w-6 h-6 bg-[#BC2A1A] hover:bg-[#d63426] text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </>
                ) : (
                  <Camera size={24} className="text-[#BC2A1A]" />
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  capture
                  className="hidden" 
                />
             </div>
             <p className="text-[10px] font-black text-[#BC2A1A] uppercase tracking-widest">📸 Tirar Foto</p>
          </div>

          <div className="space-y-4">
            <InputField label="Nome do Produto" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Batom Matte" />
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="Preço Custo" 
                value={formData.purchasePrice === '' ? '' : formatCurrency(Number(formData.purchasePrice))} 
                onChange={(e: any) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, purchasePrice: raw ? Number(raw)/100 : '' });
                }} 
                placeholder="R$ 0,00" 
              />
              <InputField 
                label="Preço Venda" 
                value={formData.basePrice === '' ? '' : formatCurrency(Number(formData.basePrice))} 
                onChange={(e: any) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, basePrice: raw ? Number(raw)/100 : '' });
                }} 
                placeholder="R$ 0,00" 
              />
            </div>
            {!formData.id && (
               <InputField label="Quantidade Inicial" type="number" value={formData.initialStock} onChange={(e: any) => setFormData({ ...formData, initialStock: e.target.value })} placeholder="0" />
            )}

            {(Number(formData.basePrice) > 0 && Number(formData.purchasePrice) > 0) && (
               <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Lucro Estimado</p>
                  <p className="text-lg font-black text-emerald-700">
                     {formatCurrency(Number(formData.basePrice) - Number(formData.purchasePrice))}
                  </p>
               </div>
            )}
          </div>

          <button onClick={() => {
             if(formData.name && formData.basePrice && formData.purchasePrice) {
                saveProduct(formData);
                setFormData({ id: null, name: '', purchasePrice: '', basePrice: '', initialStock: '', image: '' });
                document.getElementById('add-product-modal')?.classList.add('hidden');
             }
          }} className="w-full py-5 bg-[#BC2A1A] text-white rounded-[24px] font-black uppercase text-sm tracking-widest shadow-lg active:scale-95">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
