import { createClient } from '@supabase/supabase-js';

// Usamos import.meta.env para compatibilidad con el build de Vite
// Fix: Use type assertion to access Vite's environment variables and resolve the 'env' does not exist on type 'ImportMeta' error.
const env = (import.meta as any).env;

const supabaseUrl = env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabaseServiceRoleKey = env?.VITE_SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente de administrador para operaciones que requieren privilegios elevados (ej. crear usuarios sin contraseña)
// Solo debe usarse en entornos seguros o funciones de servidor.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);