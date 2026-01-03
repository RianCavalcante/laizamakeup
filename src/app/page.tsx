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
  const [dashboardStats, setDashboardStats] = useState<any>(null);

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

    const fetchAllPaged = async (table: string, select: string, orderBy: string, pageSize = 500) => {
      const results: any[] = [];
      let from = 0;
      while (true) {
        const to = from + pageSize - 1;
        const { data, error } = await withRetry(async () =>
          await supabase.from(table).select(select).order(orderBy, { ascending: false }).range(from, to)
        );
        if (error) throw error;
        if (!data || data.length == 0) break;
        results.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return results;
    };

    const fetchData = async () => {
      setIsLoaded(false);
      setLoadingError(null);
      setActionError(null);

      try {
        // Restaurado: Sem limite artificial, carregando todos os produtos (agora otimizados via Storage)
        const { data: prodData, error: prodError } = await withRetry(async () =>
          await supabase.from('produtos').select('id,nome,preco_compra,preco_venda,imagem,ativo')
        );

        if (cancelled) return;
        if (prodError) throw prodError;

        // RPCs
        let statsData: any[] = [];
        let stockData: any[] | null = null;

        // RPC Dashboard RESTAURADA - Totalizadores de venda/lucro
        try {
          const statsResponse = await supabase.rpc('get_dashboard_totals');
          if (statsResponse.error) {
            console.warn('Erro ao carregar totais:', statsResponse.error);
            // Fallback silencioso (statsData vazio)
          } else {
            statsData = statsResponse.data || [];
          }
        } catch (e) {
          console.warn('RPC get_dashboard_totals falhou');
        }

        // RPC de estoque (essencial para não mostrar 'Esgotado')
        try {
          const stockResponse = await supabase.rpc('get_products_stock');
          if (!stockResponse.error) stockData = stockResponse.data;
        } catch (err) {
          console.warn('RPC get_products_stock não disponível');
        }

        // Dashboard Stats Update
        if (statsData && statsData.length > 0) {
          setDashboardStats({
            totalRevenue: statsData[0].total_revenue || 0,
            totalProfit: statsData[0].total_profit || 0,
            salesCount: statsData[0].sales_count || 0
          });
        }

        const stockMap = new Map();
        if (stockData && stockData.length > 0) {
          stockData.forEach((item: any) => {
            stockMap.set(item.product_id, item.stock);
          });
        }

        if (prodData) {
          setProducts(prodData.map((p: any) => ({
            ...p,
            name: p.nome ?? p.name,
            purchasePrice: p.preco_compra ?? p.purchase_price,
            basePrice: p.preco_venda ?? p.base_price,
            image: p.imagem ?? p.image,
            active: p.ativo ?? true,
            serverStock: stockMap.get(p.id) ?? 0
          })));
        }

        setIsLoaded(true);
        setIsInitialLoad(false);

        // Limites aumentados para 1000 (virtualmente sem limite para este caso de uso)
        const limitSafe = 1000;

        const results = await Promise.allSettled([
          withRetry(async () => await supabase.from('reabastecimentos').select('id,produto_id,quantidade,preco_unitario,custo_total,data').order('data', { ascending: false }).limit(limitSafe)),
          withRetry(async () => await supabase.from('vendas').select('id,produto_id,quantidade,valor_total,vendedor_ids,data,cliente_id,cliente_nome,cliente_telefone,vendedores_nomes').order('data', { ascending: false }).limit(limitSafe)),
          withRetry(async () => await supabase.from('vendedores').select('id,nome').limit(50)),
          withRetry(async () => await supabase.from('clientes').select('id,nome,telefone').limit(50))
        ]);

        if (cancelled) return;

        const [repResult, salesResult, sellersResult, clientsResult] = results;

        if (repResult.status === 'fulfilled' && repResult.value?.data) {
          setReplenishments((repResult.value.data as any[]).map((r: any) => ({
            ...r,
            productId: r.produto_id ?? r.product_id,
            unitPrice: r.preco_unitario ?? r.unit_price,
            totalCost: r.custo_total ?? r.total_cost,
            quantity: r.quantidade ?? r.quantity,
            date: r.data ?? r.date
          })));
        }

        if (salesResult.status === 'fulfilled' && salesResult.value?.data) {
          setSales((salesResult.value.data as any[]).map((s: any) => ({
            ...s,
            productId: s.produto_id ?? s.product_id,
            totalValue: s.valor_total ?? s.total_value,
            sellerIds: s.vendedor_ids ?? s.seller_ids,
            quantity: s.quantidade ?? s.quantity,
            date: s.data ?? s.date,
            clienteNome: s.cliente_nome ?? s.clientes?.nome,
            vendedoresNomes: s.vendedores_nomes
          })));
        }

        if (sellersResult.status === 'fulfilled' && sellersResult.value?.data) {
          setSellers((sellersResult.value.data as any[]).map((s: any) => ({
            ...s,
            name: s.nome ?? s.name
          })));
        }

        if (clientsResult.status === 'fulfilled' && clientsResult.value?.data) {
          setClients((clientsResult.value.data as any[]).map((c: any) => ({
            ...c,
            name: c.nome ?? c.name,
            phone: c.telefone ?? c.phone
          })));
        }
      } catch (err: any) {
        if (cancelled) return;

        // Extração robusta de erro
        let errorMsg = 'Erro desconhecido';
        let errorDetails = {};

        try {
          if (err instanceof Error) {
            errorMsg = err.message;
            errorDetails = { name: err.name, message: err.message };
          } else if (typeof err === 'object' && err !== null) {
            errorMsg = (err as any).message || (err as any).error_description || JSON.stringify(err);
            errorDetails = err;
          } else {
            errorMsg = String(err);
          }
        } catch (e) {
          errorMsg = `Erro ao processar erro: ${String(e)}`;
        }

        console.error('❌ ERRO TÉCNICO (Detalhado):', errorMsg, errorDetails);
        setLoadingError(`Erro técnico: ${errorMsg}`);
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
    let imageUrl = data.image; // Padrão: mantêm o que veio (URL existente ou limpo)

    // Se houver um NOVO arquivo de imagem para upload
    if (data.imageFile) {
      try {
        const file = data.imageFile;
        // Gerar nome único: ID_TIMESTAMP.ext
        const fileExt = file.name.split('.').pop();
        const fileName = `${data.id || 'new'}-${Date.now()}.${fileExt}`;

        // Upload para bucket 'produtos'
        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          throw uploadError;
        }

        // Get Public URL
        const { data: urlData } = supabase.storage
          .from('produtos')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      } catch (uploadErr) {
        console.error('Erro no upload de imagem:', uploadErr);
        alert('Erro ao fazer upload da imagem. O produto será salvo sem a nova foto.');
        // Opcional: abortar salvamento ou salvar sem imagem. Vamos seguir salvando sem a NOVA imagem.
      }
    }

    if (data.id) {
      // Edição
      const { error } = await supabase.from('produtos').update({
        nome: data.name,
        preco_compra: Number(data.purchasePrice),
        preco_venda: Number(data.basePrice),
        imagem: imageUrl, // URL pública
        ativo: true // Garantir que atualização mantém ativo
      }).eq('id', data.id);

      if (!error) {
        setProducts(prev => prev.map(p => p.id === data.id ? {
          ...p,
          ...data,
          purchasePrice: Number(data.purchasePrice),
          basePrice: Number(data.basePrice),
          image: imageUrl
        } : p));
      } else {
        console.error('Erro ao atualizar produto:', error);
        alert('Erro ao atualizar produto.');
      }
    } else {
      // Criação
      const newProduct = {
        nome: data.name,
        preco_compra: Number(data.purchasePrice),
        preco_venda: Number(data.basePrice),
        imagem: imageUrl || null,
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
          // Delay pequeno para garantir que trigger ou consistência do banco não falhe (opcional)
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

  // Cálculo de Stock (Agora híbrido: Usa ServerStock se disponível, ou fallback local)
  const inventory = useMemo(() => {
    return products.map(product => {
      // Se temos o estoque calculado pelo servidor (RPC), usamos ele! É 100% preciso.
      if (product.serverStock !== undefined) {
        return { ...product, currentStock: Number(product.serverStock) };
      }

      // Fallback (apenas se RPC falhar, mas será impreciso com vendas limitadas a 100)
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
            <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-4 text-sm font-semibold">
              ❌ {loadingError}
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
                dashboardStats={dashboardStats}
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

                  // Tenta excluir a imagem do Storage se existir
                  const productToDelete = products.find(p => p.id === confirmDelete.productId);
                  if (productToDelete && productToDelete.image && productToDelete.image.includes('supabase.co')) {
                    try {
                      // Extrai o nome do arquivo da URL (tudo depois de '/produtos/')
                      // URL típica: .../storage/v1/object/public/produtos/ID-TIMESTAMP.jpg
                      const parts = productToDelete.image.split('/produtos/');
                      if (parts.length > 1) {
                        const fileName = parts[1];
                        console.log('Tentando excluir imagem:', fileName);
                        await supabase.storage.from('produtos').remove([fileName]);
                      }
                    } catch (err) {
                      console.warn('Erro ao excluir imagem do storage (pode já ter sido excluída):', err);
                      // Não bloqueia a exclusão do produto
                    }
                  }

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
  // AUTENTICAÇÃO DESABILITADA TEMPORARIAMENTE
  return <AppContent />;
}
