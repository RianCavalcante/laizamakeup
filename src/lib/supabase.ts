import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente Singleton Otimizado para Next.js App Router (SSR)
// Se estiver no browser, usa o BrowserClient (cookies)
// Se estiver no server, usa o createClient padrão (ou poderia usar createServerClient se tivéssemos cookies)
export const supabase = typeof window !== 'undefined' 
  ? createBrowserClient(supabaseUrl, supabaseKey)
  : createSupabaseClient(supabaseUrl, supabaseKey);

// Mantemos a função para compatibilidade
export const createClient = () => supabase;
