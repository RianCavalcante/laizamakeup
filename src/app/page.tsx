"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

import { supabase } from '../lib/supabase';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Componentes
import { Sidebar } from '../components/layout/Sidebar';
import { MobileHeader } from '../components/layout/MobileHeader';
import { MobileNav } from '../components/layout/MobileNav';
import { Overview } from '../components/views/Overview';
import { ProductsView } from '../components/views/Products';
import { OutOfStockView } from '../components/views/OutOfStock';
import { SalesView } from '../components/views/Sales';
import { ClientsView } from '../components/views/Clients';
import { ImportView } from '../components/views/Import';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import { SidebarSkeleton } from '../components/ui/SidebarSkeleton';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { ProductSkeleton } from '../components/ui/ProductSkeleton';
import { OutOfStockSkeleton } from '../components/ui/OutOfStockSkeleton';
import { SalesSkeleton } from '../components/ui/SalesSkeleton';

// --- Utilitários de Formatação ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const getUnitProfit = (cost: any, price: any) => {
  const c = Number(cost) || 0;
  const p = Number(price) || 0;
  return p - c;
};

// --- Componente Principal ---

export function AppContent({ initialTab = 'overview' }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; productId: string | null; productName?: string }>({ open: false, productId: null });

  // Estados de Dados
  const [products, setProducts] = useState<any[]>([]);
  const [replenishments, setReplenishments] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [confirmDeleteSale, setConfirmDeleteSale] = useState<{ open: boolean; saleId: string | null }>({ open: false, saleId: null });

  // Carregar dados iniciais do Supabase
  useEffect(() => {
    let cancelled = false;

    const withRetry = async <T,>(fn: () => Promise<T>, attempts = 3, delayMs = 300): Promise<T> => {
      let lastErr: any;
      for (let i = 0; i < attempts; i++) {
        try {
          return await fn();
        } catch (err) {
          lastErr = err;
          const backoff = delayMs * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
      throw lastErr;
    };

    const fetchData = async () => {
      setIsLoaded(false);
      setLoadingError(null);
      setActionError(null);

      const startedAt = Date.now();

      try {
        const [
          { data: prodData, error: prodError },
          { data: repData, error: repError },
          { data: salesData, error: salesError },
          { data: sellersData, error: sellersError },
          { data: clientsData, error: clientsError }
        ] = await Promise.all([
          withRetry(async () =>
            await supabase.from('produtos').select('id,nome,preco_compra,preco_venda,imagem,ativo')
          ),
          withRetry(async () =>
            await supabase.from('reabastecimentos').select('id,produto_id,quantidade,preco_unitario,custo_total,data')
          ),
          withRetry(async () =>
            await supabase.from('vendas').select('id,produto_id,quantidade,valor_total,vendedor_ids,data,cliente_id,cliente_nome,cliente_telefone,vendedores_nomes')
          ),
          withRetry(async () => await supabase.from('vendedores').select('id,nome')),
          withRetry(async () => await supabase.from('clientes').select('id,nome,telefone'))
        ]) as any;

        // Delay artificial removido para performance máxima
        if (cancelled) return;

        if (cancelled) return;

        if (prodError || repError || salesError || sellersError || clientsError) {
          throw prodError || repError || salesError || sellersError || clientsError;
        }

        if (prodData) {
          setProducts(prodData.map((p: any) => ({
            ...p,
            name: p.nome ?? p.name,
            purchasePrice: p.preco_compra ?? p.purchase_price,
            basePrice: p.preco_venda ?? p.base_price,
            image: p.imagem ?? p.image,
            active: p.ativo ?? true
          })));
        }

        if (repData) {
          setReplenishments(repData.map((r: any) => ({
            ...r,
            productId: r.produto_id ?? r.product_id,
            unitPrice: r.preco_unitario ?? r.unit_price,
            totalCost: r.custo_total ?? r.total_cost,
            quantity: r.quantidade ?? r.quantity,
            date: r.data ?? r.date
          })));
        }

        if (salesData) {
          setSales(salesData.map((s: any) => ({
            ...s,
            productId: s.produto_id ?? s.product_id,
            totalValue: s.valor_total ?? s.total_value,
            sellerIds: s.vendedor_ids ?? s.seller_ids,
            quantity: s.quantidade ?? s.quantity,
            date: s.data ?? s.date,
            clienteNome: s.cliente_nome ?? s.clientes?.nome, // Prioriza nome salvo no snapshot
            vendedoresNomes: s.vendedores_nomes // Novo campo snapshot
          })));
        }

        if (sellersData) {
          setSellers(sellersData.map((s: any) => ({
            ...s,
            name: s.nome ?? s.name
          })));
        }

        if (clientsData) {
          setClients(clientsData);
        }

        setIsLoaded(true);
        setIsInitialLoad(false);
      } catch (err: any) {
        if (cancelled) return;
        setLoadingError('Erro ao carregar dados. Tente novamente.');
        setIsLoaded(true);
        setIsInitialLoad(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Estado para modal de reposição rápida
  const [replenishModal, setReplenishModal] = useState<any>({
    open: false,
    product: null,
    qty: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Funções de Negócio com Supabase
  const saveProduct = async (data: any) => {
    if (data.id) {
      // Edição
      const { error } = await supabase.from('produtos').update({
        nome: data.name,
        preco_compra: Number(data.purchasePrice),
        preco_venda: Number(data.basePrice),
        imagem: data.image
      }).eq('id', data.id);

      if (!error) {
        setProducts(prev => prev.map(p => p.id === data.id ? {
          ...p,
          ...data,
          purchasePrice: Number(data.purchasePrice),
          basePrice: Number(data.basePrice)
        } : p));
      }
    } else {
      // Criação
      const newProduct = {
        nome: data.name,
        preco_compra: Number(data.purchasePrice),
        preco_venda: Number(data.basePrice),
        imagem: data.image || null,
        ativo: true
      };

      const { data: created, error } = await supabase.from('produtos').insert(newProduct).select().single();

      if (created && !error) {
        const formattedProduct = {
          ...created,
          name: created.nome,
          purchasePrice: created.preco_compra,
          basePrice: created.preco_venda,
          image: created.imagem
        };
        setProducts(prev => [...prev, formattedProduct]);

        if (Number(data.initialStock) > 0) {
          await addReplenishment(created.id, data.initialStock, data.purchasePrice, new Date().toISOString());
        }
      } else if (error) {
        console.error('Erro ao criar produto:', error);
        alert('Erro ao criar produto. Verifique se os dados estão corretos.');
      }
    }
  };

  const deleteProduct = async (productId: string) => {
    setConfirmDelete({ open: true, productId, productName: products.find(p => p.id === productId)?.name });
  };

  const deleteSale = async (saleId: string) => {
    setConfirmDeleteSale({ open: true, saleId });
  };

  const confirmDeleteSale_execute = async () => {
    if (!confirmDeleteSale.saleId) return;

    const { error } = await supabase.from('vendas').delete().eq('id', confirmDeleteSale.saleId);
    if (!error) {
      setSales(prev => prev.filter(s => s.id !== confirmDeleteSale.saleId));
    } else {
      console.error('Erro ao excluir venda:', error);
      alert('Não foi possível excluir a venda.');
    }
    setConfirmDeleteSale({ open: false, saleId: null });
  };

  const addReplenishment = async (productId: string, quantity: number | string, unitPrice: number | string, date: string) => {
    setActionError(null);
    const newEntry = {
      produto_id: productId,
      quantidade: Number(quantity),
      preco_unitario: Number(unitPrice),
      custo_total: Number(quantity) * Number(unitPrice),
      data: date || new Date().toISOString()
    };

    const { data: created, error } = await supabase.from('reabastecimentos').insert(newEntry).select().single();

    if (created && !error) {
      const formatted = {
        ...created,
        productId: created.produto_id ?? created.product_id,
        unitPrice: created.preco_unitario ?? created.unit_price,
        totalCost: created.custo_total ?? created.total_cost,
        quantity: created.quantidade ?? created.quantity,
        date: created.data ?? created.date
      };
      setReplenishments(prev => [...prev, formatted]);
      return true;
    } else {
      console.error('Erro ao repor estoque:', error);
      setActionError('Não foi possível salvar a reposição.');
      return false;
    }
  };

  const handleReplenishSubmit = async () => {
    if (!replenishModal.product || !replenishModal.qty) return;

    const success = await addReplenishment(
      replenishModal.product.id,
      replenishModal.qty,
      replenishModal.product.purchasePrice,
      new Date(replenishModal.date).toISOString()
    );

    if (success) {
      setReplenishModal({ open: false, product: null, qty: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const addSale = async (
    productId: string,
    quantity: number | string,
    totalValue: number | string,
    sellerIds: string[],
    customerName: string,
    customerPhone: string
  ) => {
    setActionError(null);

    let clienteId = null;

    // Se tem nome de cliente, buscar/criar cliente
    if (customerName && customerName.trim()) {
      // Buscar cliente existente pelo nome
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('id')
        .eq('nome', customerName.trim())
        .maybeSingle();

      if (existingClient) {
        // Cliente já existe
        clienteId = existingClient.id;

        // Atualizar telefone se fornecido
        if (customerPhone && customerPhone.trim()) {
          await supabase
            .from('clientes')
            .update({ telefone: customerPhone.trim() })
            .eq('id', clienteId);
        }
      } else {
        // Criar novo cliente
        const { data: newClient, error: clientError } = await supabase
          .from('clientes')
          .insert({
            nome: customerName.trim(),
            telefone: customerPhone?.trim() || null
          })
          .select('*')
          .single();

        if (newClient && !clientError) {
          clienteId = newClient.id;
          setClients(prev => [...prev, newClient]);
        }
      }
    }

    // Snapshot dos nomes dos vendedores
    const sellerNamesSnapshot = sellerIds.map(id => {
      const s = sellers.find(sel => sel.id === id);
      return s ? s.name : '';
    }).filter(Boolean).join(', ');

    const newSale = {
      produto_id: productId,
      quantidade: Number(quantity),
      valor_total: Number(totalValue),
      vendedor_ids: sellerIds,
      cliente_id: clienteId,
      cliente_nome: customerName, // Snapshot
      cliente_telefone: customerPhone, // Snapshot
      vendedores_nomes: sellerNamesSnapshot, // Snapshot
      data: new Date().toISOString()
    };

    const { data: created, error } = await supabase.from('vendas').insert(newSale).select().single();

    if (created && !error) {
      const formatted = {
        ...created,
        productId: created.produto_id ?? created.product_id,
        totalValue: created.valor_total ?? created.total_value,
        sellerIds: created.vendedor_ids ?? created.seller_ids,
        quantity: created.quantidade ?? created.quantity,
        date: created.data ?? created.date,
        clienteId: created.cliente_id,
        clienteNome: created.cliente_nome ?? customerName,
        vendedoresNomes: created.vendedores_nomes ?? sellerNamesSnapshot
      };
      setSales([...sales, formatted]);
    } else if (error) {
      setActionError('Não foi possível salvar a venda.');
    }
  };

  // Cálculo de Stock em tempo real
  const inventory = useMemo(() => {
    return products.map(product => {
      const totalReplenished = replenishments
        .filter(r => r.productId === product.id)
        .reduce((sum, r) => sum + Number(r.quantity), 0);

      const totalSold = sales
        .filter(s => s.productId === product.id)
        .reduce((sum, s) => sum + Number(s.quantity), 0);

      const currentStock = totalReplenished - totalSold;
      return { ...product, currentStock };
    });
  }, [products, replenishments, sales]);

  // Mostra o skeleton do painel enquanto carrega
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FFDCD8]/20 text-slate-900 font-sans overflow-x-hidden">
        <SidebarSkeleton />
        <main className="flex-1 lg:ml-80 px-5 py-8 md:px-14 md:py-14">
          <div className="max-w-4xl mx-auto pb-32">
            <SkeletonLoader />
          </div>
        </main>
      </div>
    );
  }

  const zeradoCount = inventory.filter(p => p.currentStock === 0).length;

  const openReplenishModal = (product: any) => {
    setReplenishModal({ ...replenishModal, open: true, product: product, qty: '' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFDCD8]/20 text-slate-900 font-sans overflow-x-hidden">

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <MobileHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 lg:ml-80 px-5 py-8 md:px-14 md:py-14 pt-20 lg:pt-8">{/* pt-20 for mobile header */}
        <div className="max-w-4xl mx-auto pb-32 space-y-4">
          {loadingError && (
            <div className="rounded-2xl bg-[#BC2A1A]/10 border border-[#BC2A1A]/30 text-[#BC2A1A] px-4 py-3 text-sm font-semibold">
              {loadingError}
            </div>
          )}
          {actionError && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 text-sm font-semibold">
              {actionError}
            </div>
          )}

          {activeTab === 'overview' && (
            isInitialLoad ? (
              <SkeletonLoader />
            ) : (
              <Overview
                sales={sales}
                products={products}
                inventory={inventory}
                sellers={sellers}
                setActiveTab={setActiveTab}
                formatCurrency={formatCurrency}
              />
            )
          )}

          {activeTab === 'products' && (
            isInitialLoad ? (
              <ProductSkeleton />
            ) : (
              <ProductsView
                inventory={inventory}
                setActiveTab={setActiveTab}
                formatCurrency={formatCurrency}
                getUnitProfit={getUnitProfit}
                saveProduct={saveProduct}
                deleteProduct={deleteProduct}
                openReplenishModal={openReplenishModal}
                setProducts={setProducts}
                setReplenishments={setReplenishments}
              />
            )
          )}

          {activeTab === 'outOfStock' && (
            isInitialLoad ? (
              <OutOfStockSkeleton />
            ) : (
              <OutOfStockView
                inventory={inventory}
                setActiveTab={setActiveTab}
                openReplenishModal={openReplenishModal}
              />
            )
          )}

          {activeTab === 'sales' && (
            isInitialLoad ? (
              <SalesSkeleton />
            ) : (
              <SalesView
                inventory={inventory}
                sales={sales}
                products={products}
                sellers={sellers}
                clients={clients}
                setActiveTab={setActiveTab}
                addSale={addSale}
                formatCurrency={formatCurrency}
                deleteSale={deleteSale}
                formatDate={formatDate}
              />
            )
          )}

          {activeTab === 'clients' && (
            <ClientsView
              setActiveTab={setActiveTab}
              formatCurrency={formatCurrency}
              sellers={sellers} // Passando lista de vendedores
            />
          )}

        </div>
      </main>

      {/* Modal de Reposição (Global) */}
      {replenishModal.open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-[110]">
          <Card className="w-full max-w-sm p-8 space-y-6 rounded-t-[40px] sm:rounded-[40px] shadow-2xl border-none text-left">
            <div className="flex justify-between items-center text-left">
              <h3 className="text-xl font-black text-slate-900 uppercase leading-none">Repor Lote</h3>
              <button onClick={() => setReplenishModal({ ...replenishModal, open: false })} className="text-slate-300">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-5">
              <p className="text-[11px] font-black text-[#BC2A1A] uppercase tracking-widest border-b border-[#FFDCD8] pb-2 text-left">{replenishModal.product?.name}</p>
              <InputField label="Data" type="date" value={replenishModal.date} onChange={(e: any) => setReplenishModal({ ...replenishModal, date: e.target.value })} />
              <InputField label="Quantidade" type="number" value={replenishModal.qty} onChange={(e: any) => setReplenishModal({ ...replenishModal, qty: e.target.value })} placeholder="0" autoFocus />
            </div>
            <button onClick={handleReplenishSubmit} className="w-full py-5 bg-[#BC2A1A] text-white rounded-[24px] font-black uppercase text-xs tracking-widest active:scale-95">Confirmar Reposição</button>
          </Card>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-[120]">
          <Card className="w-full max-w-sm p-8 space-y-6 rounded-t-[40px] sm:rounded-[32px] shadow-2xl border-none text-left">
            <div className="space-y-3">
              <h3 className="text-xl font-black text-slate-900 uppercase leading-none">Excluir produto</h3>
              <p className="text-sm text-slate-600">Você tem certeza que deseja excluir <span className="font-semibold text-slate-900">{confirmDelete.productName || 'este item'}</span>?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ open: false, productId: null })}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-[16px] font-black uppercase text-xs tracking-widest active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!confirmDelete.productId) return;
                  const { error } = await supabase.from('produtos').delete().eq('id', confirmDelete.productId);
                  if (!error) {
                    setProducts(prev => prev.filter(p => p.id !== confirmDelete.productId));
                  } else {
                    setActionError('Não foi possível excluir o produto.');
                  }
                  setConfirmDelete({ open: false, productId: null });
                }}
                className="flex-1 py-4 bg-[#BC2A1A] text-white rounded-[16px] font-black uppercase text-xs tracking-widest active:scale-95"
              >
                Excluir
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação - Excluir Venda */}
      {confirmDeleteSale.open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[120]">
          <Card className="w-full max-w-sm p-8 space-y-6 rounded-[32px] shadow-2xl border-none text-left">
            <div className="space-y-3">
              <h3 className="text-xl font-black text-slate-900 uppercase leading-none">Excluir venda</h3>
              <p className="text-sm text-slate-600">
                Você tem certeza que deseja excluir esta venda? <span className="font-semibold text-[#BC2A1A]">O estoque será reposto.</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteSale({ open: false, saleId: null })}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-[16px] font-black uppercase text-xs tracking-widest active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteSale_execute}
                className="flex-1 py-4 bg-[#BC2A1A] text-white rounded-[16px] font-black uppercase text-xs tracking-widest active:scale-95"
              >
                Excluir
              </button>
            </div>
          </Card>
        </div>
      )}

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} zeradoCount={zeradoCount} />
    </div>
  );
}

export default function App() {
  return (
    <ProtectedRoute>
      <AppContent />
    </ProtectedRoute>
  );
}
