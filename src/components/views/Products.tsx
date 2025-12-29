import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { BackButton } from '../ui/BackButton';
import { InputField } from '../ui/InputField';
import { PlusCircle, ImageIcon, Plus, Pencil, Trash2, X, Camera, Upload } from 'lucide-react';

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

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500 pb-10">
      <header className="text-left">
        <BackButton onClick={() => setActiveTab('overview')} />
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Stock</h1>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={openNewModal}
          className="bg-[#BC2A1A] text-white py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <PlusCircle size={24} /> 
          <span className="font-black uppercase text-sm tracking-widest">Novo</span>
        </button>

        <button 
          onClick={() => csvInputRef.current?.click()}
          className="bg-slate-900 text-white py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <Upload size={24} /> 
          <span className="font-black uppercase text-sm tracking-widest">Importar CSV</span>
          <input 
            type="file" 
            ref={csvInputRef} 
            onChange={handleCSVImport} 
            accept=".csv" 
            className="hidden" 
          />
        </button>
      </div>

      <div className="space-y-4">
        {inventory.map(p => (
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
                  <span className="font-bold text-emerald-600 text-xs">+{formatCurrency(getUnitProfit(p.purchasePrice, p.basePrice))} lucro</span>
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
        ))}
      </div>

      <div id="add-product-modal" className="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-[100] overflow-y-auto">
        <Card className="w-full max-w-md p-8 space-y-6 rounded-t-[40px] sm:rounded-[40px] border-none">
          <div className="flex justify-between items-center text-left">
             <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{formData.id ? 'Editar' : 'Registo'}</h2>
             <button onClick={() => document.getElementById('add-product-modal')?.classList.add('hidden')} className="w-10 h-10 flex items-center justify-center text-slate-300">
                <X size={24} />
             </button>
          </div>
          
          <div className="flex flex-col items-center gap-4 py-2">
             <div className="w-28 h-28 rounded-[32px] bg-[#FFDCD8]/30 border-2 border-dashed border-[#FFDCD8] overflow-hidden flex items-center justify-center relative active:scale-95 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="" /> : <Camera size={28} className="text-[#BC2A1A]/40" />}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
             </div>
             <p className="text-[10px] font-black text-[#BC2A1A] uppercase tracking-widest">Carregar Foto</p>
          </div>

          <div className="space-y-4">
            <InputField label="Nome do Produto" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Batom Matte" />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Preço Custo" type="number" value={formData.purchasePrice} onChange={(e: any) => setFormData({ ...formData, purchasePrice: e.target.value })} placeholder="0,00" />
              <InputField label="Preço Venda" type="number" value={formData.basePrice} onChange={(e: any) => setFormData({ ...formData, basePrice: e.target.value })} placeholder="0,00" />
            </div>
            {!formData.id && (
               <InputField label="Quantidade Inicial" type="number" value={formData.initialStock} onChange={(e: any) => setFormData({ ...formData, initialStock: e.target.value })} placeholder="0" />
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
        </Card>
      </div>
    </div>
  );
};
