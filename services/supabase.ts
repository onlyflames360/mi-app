
import { createClient } from '@supabase/supabase-js';

/**
 * Credenciales de Supabase proporcionadas para el proyecto PPOC.
 * Se integran directamente para evitar errores de inicialización en el entorno del navegador.
 */
const supabaseUrl = 'https://osjmfirajvypusoncwhj.supabase.co';
const supabaseAnonKey = 'sb_publishable_JT1BdimG_bQWXMgk1b-_hA_d1HyfXxT';

/**
 * Inicialización del cliente de Supabase.
 * Al proporcionar valores válidos y no vacíos, se corrige el error "supabaseUrl is required".
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase conectado a:", supabaseUrl);
