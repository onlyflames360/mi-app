
import { createClient } from '@vercel/edge-config';

// Nota: En un entorno de cliente (Vite), Edge Config requiere que el token esté disponible.
// Si no se configura la variable de entorno, fallará silenciosamente.
const client = process.env.EDGE_CONFIG ? createClient(process.env.EDGE_CONFIG) : null;

export async function getConfigData() {
  if (!client) {
    console.warn('Edge Config no configurado. Usando datos locales.');
    return null;
  }
  
  try {
    const coordinador = await client.get('coordinador');
    const evento = await client.get('evento');
    
    return {
      coordinador: coordinador as { nombre: string; estado: string } | null,
      evento: evento as { titulo: string; hora: string } | null
    };
  } catch (error) {
    console.error('Error leyendo configuración de Vercel:', error);
    return null;
  }
}
