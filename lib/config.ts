
import { createClient } from '@vercel/edge-config';

// Vite utiliza import.meta.env para variables de entorno
// Fix: Use type assertion to access Vite's environment variables and resolve the 'env' does not exist on type 'ImportMeta' error.
const connectionString = (import.meta as any).env?.VITE_EDGE_CONFIG || "";
const client = connectionString ? createClient(connectionString) : null;

export interface RemoteConfig {
  coordinador?: {
    nombre: string;
    estado: string;
  };
  evento?: {
    titulo: string;
    hora: string;
  };
}

export async function getConfigData(): Promise<RemoteConfig | null> {
  if (!client) {
    console.warn('Edge Config no configurado (VITE_EDGE_CONFIG vacía).');
    return null;
  }
  
  try {
    const config = await client.get('coordinador');
    const evento = await client.get('evento');
    
    return {
      coordinador: config as any,
      evento: evento as any
    };
  } catch (error) {
    console.error('Error leyendo configuración de Vercel:', error);
    return null;
  }
}
