import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

// ID da empresa padrão para desenvolvimento (sem auth)
export const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID!;
