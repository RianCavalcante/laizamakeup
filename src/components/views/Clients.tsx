import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { BackButton } from '../ui/BackButton';
import { InputField } from '../ui/InputField';
import { Users, ShoppingBag, TrendingUp, Pencil, X, ArrowLeft, Search, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ClientsViewProps {
  setActiveTab: (tab: string) => void;
  formatCurrency: (val: number) => string;
  sellers: any[]; // Recebe lista de vendedores
}

type Cliente = {
  id: string;
  nome: string;
  telefone?: string;
  created_at: string;
};

type Venda = {
  id: string;
  quantidade: number;
  valor_total: number;
  data: string;
  produto: {
    nome: string;
  };
  vendedor_ids?: string[];
};

type ClienteComVendas = Cliente & {
  vendas: Venda[];
  total_compras: number;
  total_gasto: number;
};

export const ClientsView = ({ setActiveTab, formatCurrency, sellers }: ClientsViewProps) => {
  const [clientes, setClientes] = useState<ClienteComVendas[]>([]);
  const [localSellers, setLocalSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState<{ open: boolean; cliente: Cliente | null }>({ open: false, cliente: null });
  const [editForm, setEditForm] = useState({ nome: '', telefone: '' });
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ nome: '', telefone: '' });

  useEffect(() => {
    carregarClientes();
    carregarVendedores();
  }, []);

  const carregarVendedores = async () => {
    const { data } = await supabase.from('vendedores').select('*');
    if (data) setLocalSellers(data);
  };


  const carregarClientes = async () => {
    setLoading(true); // Re-habilitado loading global
    try {
      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      if (clientesError) throw clientesError;

      // Buscar vendas com produtos para cada cliente
      const clientesComVendas: ClienteComVendas[] = await Promise.all(
        (clientesData || []).map(async (cliente) => {
          const { data: vendasData } = await supabase
            .from('vendas')
            .select(`
              id,
              quantidade,
              valor_total,
              data,
              produtos!inner(nome),
              vendedor_ids
            `)
            .eq('cliente_id', cliente.id)
            .order('data', { ascending: false });

          const vendas = (vendasData || []).map(v => ({
            ...v,
            produto: { nome: (v as any).produtos.nome }
          }));

          const total_compras = vendas.length;
          const total_gasto = vendas.reduce((sum, v) => sum + (v.valor_total || 0), 0);

          return {
            ...cliente,
            vendas,
            total_compras,
            total_gasto
          };
        })
      );

      setClientes(clientesComVendas);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (cliente: Cliente) => {
    setEditModal({ open: true, cliente });
    setEditForm({ 
      nome: cliente.nome,
      telefone: cliente.telefone || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editModal.cliente) return;
    
    const { error } = await supabase
      .from('clientes')
      .update({
        nome: editForm.nome,
        telefone: editForm.telefone || null
      })
      .eq('id', editModal.cliente.id);

    if (!error) {
      setEditModal({ open: false, cliente: null });
      carregarClientes();
    }
  };

  const handleAddClient = async () => {
    if (!addForm.nome.trim()) {
      alert('Por favor, informe o nome do cliente');
      return;
    }

    const { error } = await supabase
      .from('clientes')
      .insert({
        nome: addForm.nome.trim(),
        telefone: addForm.telefone || null
      });

    if (!error) {
      setAddModal(false);
      setAddForm({ nome: '', telefone: '' });
      carregarClientes();
    } else {
      alert('Erro ao adicionar cliente. Verifique se o nome já existe.');
    }
  };

  const handleDeleteClient = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) return;

    const { error } = await supabase.from('clientes').delete().eq('id', id);

    if (error) {
       // Se o erro for de Foreign Key constraint (código 23503 do Postgres, mas o supabase pode retornar string genérica no message)
       if (error.code === '23503' || error.message.includes('foreign key constraint')) {
           alert('Não é possível excluir este cliente pois ele possui vendas registradas. Exclua as vendas primeiro.');
       } else {
           alert('Erro ao excluir cliente.');
           console.error(error);
       }
    } else {
      carregarClientes();
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500 pb-10">
      <header className="text-left">
        <BackButton onClick={() => setActiveTab('overview')} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Clientes</h1>
            <p className="text-sm text-slate-600 mt-1">Histórico de compras e clientes cadastrados</p>
          </div>
          <button
            onClick={() => setAddModal(true)}
            className="px-6 py-3 bg-[#BC2A1A] text-white rounded-[20px] font-black uppercase text-xs tracking-widest hover:bg-[#9a2215] active:scale-95 transition-all"
          >
            + Adicionar
          </button>
        </div>
      </header>

      {/* Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-slate-100 border-none rounded-[24px] text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#BC2A1A]/20 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 rounded-[24px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#BC2A1A]/10 text-[#BC2A1A] flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total</p>
              <p className="text-2xl font-black text-slate-900">{clientes.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[24px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Vendas</p>
              <p className="text-2xl font-black text-slate-900">
                {clientes.reduce((sum, c) => sum + c.total_compras, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-6 rounded-[24px] text-center">
            <p className="text-slate-500">Carregando clientes...</p>
          </Card>
        ) : clientesFiltrados.length === 0 ? (
          <Card className="p-6 rounded-[24px] text-center">
            <p className="text-slate-500">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
            </p>
          </Card>
        ) : (
          clientesFiltrados.map((cliente) => (
            <ClientCard 
                key={cliente.id} 
                cliente={cliente} 
                openEditModal={openEditModal} 
                formatCurrency={formatCurrency} 
                deleteClient={handleDeleteClient} 
                vendedores={sellers && sellers.length > 0 ? sellers : localSellers} 
            />
          ))
        )}
      </div>

      {/* Modal de Adicionar Cliente */}
      {addModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-[110]">
          <div className="w-full max-w-md p-8 space-y-6 rounded-t-[40px] sm:rounded-[40px] bg-white shadow-2xl text-left">
            <div className="flex items-center gap-4">
              <button onClick={() => setAddModal(false)} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors border-none">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-xl font-black text-slate-900 uppercase leading-none">Novo Cliente</h3>
            </div>
            
            <div className="space-y-4">
              <InputField 
                label="Nome *" 
                type="text" 
                value={addForm.nome} 
                onChange={(e: any) => setAddForm({ ...addForm, nome: e.target.value })} 
                placeholder="Nome do cliente"
              />
              
              <InputField 
                label="Telefone" 
                type="tel" 
                value={addForm.telefone} 
                onChange={(e: any) => setAddForm({ ...addForm, telefone: e.target.value })} 
                placeholder="(00) 00000-0000"
              />
            </div>

            <button 
              onClick={handleAddClient}
              className="w-full py-5 bg-[#BC2A1A] text-white rounded-[24px] font-black uppercase text-xs tracking-widest active:scale-95"
            >
              Adicionar Cliente
            </button>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editModal.open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-[110]">
          <div className="w-full max-w-md p-8 space-y-6 rounded-t-[40px] sm:rounded-[40px] bg-white shadow-2xl text-left">
            <div className="flex items-center gap-4">
              <button onClick={() => setEditModal({ open: false, cliente: null })} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors border-none">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-xl font-black text-slate-900 uppercase leading-none">Editar Cliente</h3>
            </div>
            
            <div className="space-y-4">
              {/* Removido o display apenas de texto e adicionado Input editável */}
              <InputField 
                label="Nome do Cliente" 
                type="text" 
                value={editForm.nome} 
                onChange={(e: any) => setEditForm({ ...editForm, nome: e.target.value })} 
                placeholder="Nome do cliente"
              />
              
              <InputField 
                label="Telefone" 
                type="tel" 
                value={editForm.telefone} 
                onChange={(e: any) => setEditForm({ ...editForm, telefone: e.target.value })} 
                placeholder="(00) 00000-0000"
              />
            </div>

            <button 
              onClick={handleSaveEdit}
              className="w-full py-5 bg-[#BC2A1A] text-white rounded-[24px] font-black uppercase text-xs tracking-widest active:scale-95"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente do Card de Cliente extraído
const ClientCard = ({ cliente, openEditModal, formatCurrency, deleteClient, vendedores }: { cliente: ClienteComVendas, openEditModal: any, formatCurrency: any, deleteClient: any, vendedores: any[] }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="p-6 rounded-[24px]">
            <div className="flex items-start justify-between">
            <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 uppercase">{cliente.nome}</h3>
                {cliente.telefone && (
                <div className="flex flex-col gap-1 mt-2">
                    <p className="text-xs text-slate-600">📱 {cliente.telefone}</p>
                </div>
                )}
                <div className="mt-2 flex gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-md">
                        {cliente.total_compras} compras
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">
                        Total: {formatCurrency(cliente.total_gasto)}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                onClick={() => openEditModal(cliente)}
                className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-[#BC2A1A] hover:text-white flex items-center justify-center transition-colors border-none"
                title="Editar Cliente"
                >
                <Pencil size={16} />
                </button>
                <button 
                onClick={() => deleteClient(cliente.id, cliente.nome)}
                className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-red-500 flex items-center justify-center transition-colors border-none"
                title="Excluir Cliente"
                >
                <Trash2 size={16} />
                </button>
                <button 
                onClick={() => setExpanded(!expanded)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all border-none ${expanded ? 'bg-[#BC2A1A] text-white shadow-lg shadow-[#BC2A1A]/30 scale-105' : 'bg-[#BC2A1A]/10 text-[#BC2A1A] hover:bg-[#BC2A1A]/20'}`}
                title={expanded ? "Ocultar Histórico" : "Ver Histórico de Compras"}
                >
                <ShoppingBag size={20} />
                </button>
            </div>
            </div>

            {expanded && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest Mb-3">Histórico de Compras</h4>
                    {cliente.vendas && cliente.vendas.length > 0 ? (
                        <div className="space-y-3 mt-3">
                            {cliente.vendas.map((venda) => (
                                <div key={venda.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[10px] text-slate-400 font-bold">{new Date(venda.data).toLocaleDateString('pt-BR')}</p>
                                            {venda.vendedor_ids && venda.vendedor_ids.length > 0 && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <p className="text-[9px] font-black text-[#BC2A1A] uppercase tracking-wider">
                                                        {venda.vendedor_ids.map(id => vendedores.find(v => v.id === id)?.name || 'Vendedor').join(', ')}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 uppercase">{venda.produto?.nome || 'Produto desconhecido'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900">{formatCurrency(venda.valor_total)}</p>
                                        <p className="text-[10px] text-slate-500 font-bold">x{venda.quantidade}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-4 text-xs text-slate-400 font-medium">Nenhuma compra registrada</p>
                    )}
                </div>
            )}
        </Card>
    );
};
