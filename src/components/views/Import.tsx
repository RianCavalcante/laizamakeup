import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';

type ParsedRow = {
  dataReposicao?: string;
  descricao?: string;
  valorUnitario?: number;
  unidades?: number;
  valorTotal?: number;
  custoPorProduto?: number;
  vendas?: number;
  nomeVendedor?: string;
};

const parseNumber = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  const num = Number(normalized);
  return Number.isNaN(num) ? undefined : num;
};

const detectDelimiter = (headerLine: string) => (headerLine.includes(';') ? ';' : ',');

const parseCsv = (text: string): ParsedRow[] => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const delimiter = detectDelimiter(lines[0]);
  const dataLines = lines.slice(1).filter(Boolean);

  return dataLines.map((line) => {
    const cols = line.split(delimiter).map((c) => c.trim());
    return {
      dataReposicao: cols[0],
      descricao: cols[1],
      valorUnitario: parseNumber(cols[2]),
      unidades: parseNumber(cols[3]),
      valorTotal: parseNumber(cols[4]),
      custoPorProduto: parseNumber(cols[5]),
      vendas: parseNumber(cols[6]),
      nomeVendedor: cols[7],
    };
  });
};

const parseXlsx = async (file: File): Promise<ParsedRow[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false });
  const dataLines = rows.slice(1).filter((r) => r && r.length > 0);
  return dataLines.map((cols) => {
    return {
      dataReposicao: cols[0],
      descricao: cols[1],
      valorUnitario: parseNumber(cols[2]),
      unidades: parseNumber(cols[3]),
      valorTotal: parseNumber(cols[4]),
      custoPorProduto: parseNumber(cols[5]),
      vendas: parseNumber(cols[6]),
      nomeVendedor: cols[7],
    };
  });
};

export const ImportView = () => {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'error' | 'ready' | 'sending' | 'success'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const functionName = process.env.NEXT_PUBLIC_IMPORT_FUNCTION_NAME || 'import-planilha';

  const handleFile = async (file: File) => {
    setStatus('parsing');
    setMessage(null);
    const lower = file.name.toLowerCase();
    let parsed: ParsedRow[] = [];
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      parsed = await parseXlsx(file);
    } else {
      const text = await file.text();
      parsed = parseCsv(text);
    }
    setRows(parsed);
    setStatus('ready');
    setMessage(`Arquivo lido: ${parsed.length} linhas.`);
  };

  const onDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const handleSend = async () => {
    if (!rows.length) {
      setStatus('error');
      setMessage('Nenhuma linha para enviar. Importe um arquivo primeiro.');
      return;
    }
    setStatus('sending');
    setMessage(null);
    const { error, data } = await supabase.functions.invoke(functionName, { body: rows });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('success');
      setMessage(`Importacao concluida. Registros: ${data?.imported ?? rows.length}.`);
    }
  };
  const handleClear = () => {
    setRows([]);
    setMessage('Arquivo removido.');
    setStatus('idle');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#BC2A1A]/10 text-[#BC2A1A] flex items-center justify-center">
          <Upload size={24} />
        </div>
        <div>
          <p className="text-sm uppercase text-slate-500 font-black tracking-[0.2em]">Importar dados</p>
          <h1 className="text-2xl font-black text-slate-900 leading-none mt-1">Planilha de estoque</h1>
          <p className="text-sm text-slate-600 mt-1">Use CSV ou XLSX com as colunas A-H.</p>
        </div>
      </div>

      <Card className="p-6 space-y-4 rounded-[24px] shadow-lg border border-[#FFDCD8]">
        <label
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition ${
            isDragging ? 'border-[#BC2A1A] bg-[#BC2A1A]/5' : 'border-slate-200 hover:border-[#BC2A1A]/50'
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <Upload className="text-[#BC2A1A]" size={28} />
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">Arraste ou clique para selecionar CSV ou XLSX</p>
            <p className="text-xs text-slate-500">Colunas: Data de reposicao, Descricao, Valor Unitario, Unidades, Valor Total, Custo por produto, Vendas, Nome</p>
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>

        {rows.length > 0 && (
          <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={18} />
              <span>{rows.length} linhas carregadas.</span>
            </div>
            <button
              onClick={handleSend}
              disabled={status === 'sending'}
              className="px-4 py-2 rounded-[14px] bg-[#BC2A1A] text-white text-[11px] font-black uppercase tracking-[0.2em] disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            >
              {status === 'sending' ? 'Enviando...' : 'Enviar para o painel'}
            </button>
            <button
              onClick={handleClear}
              disabled={status === 'sending'}
              className="px-4 py-2 rounded-[14px] border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-[0.2em] disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            >
              Remover arquivo
            </button>
          </div>
        )}

        {message && (
          <div className={`flex items-center gap-2 text-sm ${status === 'error' ? 'text-[#BC2A1A]' : 'text-emerald-600'}`}>
            {status === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{message}</span>
          </div>
        )}
      </Card>

      {rows.length > 0 && (
        <Card className="p-6 rounded-[24px] border border-slate-100">
          <p className="text-sm font-black text-slate-700 uppercase tracking-[0.2em] mb-3">Pre-visualizacao (primeiras 5 linhas)</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500 uppercase text-[11px] tracking-[0.2em]">
                <tr>
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Descricao</th>
                  <th className="py-2 pr-4">Valor Unit.</th>
                  <th className="py-2 pr-4">Unidades</th>
                  <th className="py-2 pr-4">Valor Total</th>
                  <th className="py-2 pr-4">Custo Prod.</th>
                  <th className="py-2 pr-4">Vendas</th>
                  <th className="py-2 pr-4">Vendedor</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {rows.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{row.dataReposicao || '-'}</td>
                    <td className="py-2 pr-4">{row.descricao || '-'}</td>
                    <td className="py-2 pr-4">{row.valorUnitario ?? '-'}</td>
                    <td className="py-2 pr-4">{row.unidades ?? '-'}</td>
                    <td className="py-2 pr-4">{row.valorTotal ?? '-'}</td>
                    <td className="py-2 pr-4">{row.custoPorProduto ?? '-'}</td>
                    <td className="py-2 pr-4">{row.vendas ?? '-'}</td>
                    <td className="py-2 pr-4">{row.nomeVendedor || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
