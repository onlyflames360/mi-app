
import { createClient } from '@supabase/supabase-js';

// Obtenemos las variables de entorno de forma segura
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

/**
 * Inicializamos el cliente solo si las credenciales existen.
 * Esto evita el error "supabaseUrl is required" durante el arranque
 * si el usuario aún no ha configurado sus variables de entorno.
 */
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn(
    "Supabase no está configurado. La aplicación funcionará en modo LocalStorage (sin persistencia en la nube)."
  );
}
