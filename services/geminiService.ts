import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { User, Shift, MonthlyAvailability, GroundingLink } from "../types";

// Fix: Usar variable de entorno correcta con prefijo NEXT_PUBLIC_
const getAi = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY no configurada en .env.local');
  }
  return new GoogleGenerativeAI({ apiKey });
};

export const generateSmartPlanning = async (
  users: User[],
  availabilities: MonthlyAvailability[],
  month: string,
  strictSchedule: any
): Promise<Shift[]> => {
  try {
    const ai = getAi();
    
    const usersInfo = users.map(u => ({ 
      id: u.id, 
      nombre: u.nombre, 
      apellidos: u.apellidos 
    }));
    
    const prompt = `
Genera la planificacion para el mes ${month} siguiendo estrictamente este esquema:

HORARIOS Y LUGARES POR DIA:
- MARTES: 10:30-12:30 (LA BARBERA, LA CREUETA) / 17:30-19:30 (EL CENSAL, LA BARBERA)
- JUEVES: 10:30-12:30 (CENTRO SALUD, LA BARBERA) / 17:30-19:30 (EL CENSAL, LA BARBERA)
- SABADO: 10:30-12:00 (Dr. ESQUERDO, EL CENSAL) y 12:00-13:30 (Dr. ESQUERDO, EL CENSAL)

REGLA CRITICA DE ASIGNACION:
1. Para CADA slot (Dia + Lugar + Hora), debes generar EXACTAMENTE 2 entradas de Shift con usuarios DISTINTOS.
2. TOTAL DE PERSONAS POR TURNO: 2.
3. PRIORIDAD: Agrupa a personas con el MISMO APELLIDO en el mismo slot si es posible.
4. Respeta estas disponibilidades: ${JSON.stringify(availabilities)}.
5. No asignes a la misma persona dos veces el mismo dia.
6. Lista de voluntarios: ${JSON.stringify(usersInfo)}.

Devuelve un array JSON de objetos Shift (id, fecha, inicio, fin, lugar, franja, estado="pendiente", asignadoA).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              fecha: { type: SchemaType.STRING },
              inicio: { type: SchemaType.STRING },
              fin: { type: SchemaType.STRING },
              lugar: { type: SchemaType.STRING },
              franja: { type: SchemaType.STRING },
              estado: { type: SchemaType.STRING },
              asignadoA: { type: SchemaType.STRING },
            },
            required: ["id", "fecha", "inicio", "fin", "lugar", "franja", "estado", "asignadoA"]
          },
        }
      }
    });
    
    const shifts = JSON.parse(response.text || '[]');
    if (!Array.isArray(shifts)) {
      console.error('Respuesta de Gemini invalida:', response.text);
      return [];
    }
    return shifts;
  } catch (e) {
    console.error("Error en generacion de planificacion:", e);
    throw e;
  }
};

export const getStatsAnalysis = async (shifts: Shift[], users: User[]) => {
  try {
    const ai = getAi();
    const prompt = `Analiza estos turnos brevemente: ${JSON.stringify(shifts)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });
    return response.text || '';
  } catch (e) {
    console.error('Error en analisis de estadisticas:', e);
    return '';
  }
};

export const generalQuery = async (prompt: string, isComplex: boolean) => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: isComplex ? 'gemini-2.0-flash' : 'gemini-2.0-flash',
      contents: prompt,
      generationConfig: isComplex ? { thinkingBudget: 4000 } : undefined
    });
    return response.text || '';
  } catch (e) {
    console.error('Error en consulta general:', e);
    return '';
  }
};

export const editImageWithGemini = async (base64Image: string, prompt: string) => {
  try {
    const ai = getAi();
    const dataParts = base64Image.split(',');
    const base64Data = dataParts[1] || dataParts[0];
    const mimeType = base64Image.match(/data:([^;]+);/)?.[1] || 'image/png';
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt }
        ]
      }
    });
    
    let imageUrl = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if ((part as any).inlineData) {
          imageUrl = `data:${(part as any).inlineData.mimeType};base64,${(part as any).inlineData.data}`;
          break;
        }
      }
    }
    return { imageUrl };
  } catch (e) {
    console.error('Error en edicion de imagen:', e);
    return { imageUrl: '' };
  }
};

export const queryMaps = async (prompt: string, location?: { latitude: number; longitude: number }) => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      generationConfig: {
        tools: [{ googleMaps: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: { latitude: location.latitude, longitude: location.longitude }
          }
        } : undefined
      }
    });
    
    const text = response.text || '';
    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.maps) {
        links.push({ uri: chunk.maps.uri, title: chunk.maps.title || 'Ver en Google Maps' });
      }
    });
    
    return { text, links };
  } catch (e) {
    console.error('Error en consulta de mapas:', e);
    return { text: '', links: [] };
  }
};
