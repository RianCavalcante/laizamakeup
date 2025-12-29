import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton - uma única instância do cliente Supabase
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

// Para compatibilidade com AuthContext
export const createClient = () => supabase;
