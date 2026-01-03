'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function DebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [tables, setTables] = useState<string[]>(['produtos', 'products', 'clientes', 'clients', 'vendas', 'sales']);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const runTests = async () => {
        setLogs([]);
        addLog('Iniciando testes de conexão...');

        // 1. Testar conexão básica (list tables workaround by checking common tables)
        for (const table of tables) {
            addLog(`Testando tabela: ${table}...`);
            const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });

            if (error) {
                addLog(`❌ Erro tabela '${table}': ${error.message} (Code: ${error.code})`);
            } else {
                addLog(`✅ Tabela '${table}' ACESSÍVEL! Count: ${count}`);

                // Tentar ler 1 registro
                const { data: rows, error: readError } = await supabase.from(table).select('*').limit(1);
                if (readError) {
                    addLog(`❌ Erro ao LER dados de '${table}': ${readError.message}`);
                } else if (rows && rows.length > 0) {
                    addLog(`✅ Dados Lidos de '${table}': ${JSON.stringify(rows[0])}`);
                } else {
                    addLog(`⚠️ Tabela '${table}' vazia ou sem permissão de leitura de linhas.`);
                }
            }
        }

        // 2. Testar Auth
        const { data: { session } } = await supabase.auth.getSession();
        addLog(`Auth Status: ${session ? 'Logado' : 'Não Logado'}`);
    };

    useEffect(() => {
        runTests();
    }, []);

    return (
        <div className="p-8 bg-gray-900 text-green-400 font-mono min-h-screen">
            <h1 className="text-2xl mb-4 font-bold text-white">Diagnóstico de Conexão Supabase</h1>
            <button onClick={runTests} className="px-4 py-2 bg-blue-600 text-white rounded mb-4 hover:bg-blue-500">Rodar Testes Novamente</button>
            <div className="bg-black p-4 rounded border border-gray-700 whitespace-pre-wrap">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-gray-800 pb-1">{log}</div>
                ))}
            </div>
        </div>
    );
}
