import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { BackButton } from '../ui/BackButton';
import { InputField } from '../ui/InputField';
import { Users, ShoppingBag, TrendingUp, Pencil, X, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ClientsViewProps {
  setActiveTab: (tab: string) => void;
  formatCurrency: (val: number) => string;
}

type Cliente = {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
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
};

type ClienteComVendas = Cliente & {
  vendas: Venda[];
  total_compras: number;
  total_gasto: number;
};

export const ClientsView = ({ setActiveTab, formatCurrency }: ClientsViewProps) => {
  const [clientes, setClientes] = useState<ClienteComVendas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState<{ open: boolean; cliente: Cliente | null }>({ open: false, cliente: null });
  const [editForm, setEditForm] = useState({ telefone: '', email: '' });
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ nome: '', telefone: '', email: '' });

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setLoading(true);
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
              produtos!inner(nome)
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
      telefone: cliente.telefone || '', 
      email: cliente.email || '' 
    });
  };

  const handleSaveEdit = async () => {
    if (!editModal.cliente) return;
    
    const { error } = await supabase
      .from('clientes')
      .update({
        telefone: editForm.telefone || null,
        email: editForm.email || null
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
        telefone: addForm.telefone || null,
        email: addForm.email || null
      });

    if (!error) {
      setAddModal(false);
      setAddForm({ nome: '', telefone: '', email: '' });
      carregarClientes();
    } else {
      alert('Erro ao adicionar cliente. Verifique se o nome já existe.');
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
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-4 rounded-[24px] border-2 border-slate-200 focus:border-[#BC2A1A] focus:outline-none font-semibold text-slate-800 placeholder:text-slate-400"
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
            <Card key={cliente.id} className="p-6 rounded-[24px]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-900 uppercase">{cliente.nome}</h3>
                  {(cliente.telefone || cliente.email) && (
                    <div className="flex flex-col gap-1 mt-2">
                      {cliente.telefone && (
                        <p className="text-xs text-slate-600">📱 {cliente.telefone}</p>
                      )}
                      {cliente.email && (
                        <p className="text-xs text-slate-600">✉️ {cliente.email}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditModal(cliente)}
                    className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-[#BC2A1A] hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <div className="w-10 h-10 rounded-2xl bg-[#BC2A1A]/10 text-[#BC2A1A] flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Adicionar Cliente */}
      {addModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-[110]">
          <div className="w-full max-w-md p-8 space-y-6 rounded-t-[40px] sm:rounded-[40px] bg-white shadow-2xl text-left">
            <div className="flex items-center gap-4">
              <button onClick={() => setAddModal(false)} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors">
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
              
              <InputField 
                label="Email" 
                type="email" 
                value={addForm.email} 
                onChange={(e: any) => setAddForm({ ...addForm, email: e.target.value })} 
                placeholder="cliente@email.com"
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
              <button onClick={() => setEditModal({ open: false, cliente: null })} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-xl font-black text-slate-900 uppercase leading-none">Editar Cliente</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#FFDCD8]/30 rounded-2xl">
                <p className="text-sm font-black text-[#BC2A1A] uppercase tracking-wider">{editModal.cliente?.nome}</p>
              </div>
              
              <InputField 
                label="Telefone" 
                type="tel" 
                value={editForm.telefone} 
                onChange={(e: any) => setEditForm({ ...editForm, telefone: e.target.value })} 
                placeholder="(00) 00000-0000"
              />
              
              <InputField 
                label="Email" 
                type="email" 
                value={editForm.email} 
                onChange={(e: any) => setEditForm({ ...editForm, email: e.target.value })} 
                placeholder="cliente@email.com"
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
