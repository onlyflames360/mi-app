
import { GoogleGenAI, Type } from "@google/genai";
import { User, Shift, MonthlyAvailability, GroundingLink } from "../types";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSmartPlanning = async (
  users: User[],
  availabilities: MonthlyAvailability[],
  month: string,
  strictSchedule: any
): Promise<Shift[]> => {
  const ai = getAi();
  
  const usersInfo = users.map(u => ({ 
    id: u.id, 
    nombre: u.nombre, 
    apellidos: u.apellidos 
  }));

  const prompt = `
    Genera la planificación para el mes ${month} siguiendo estrictamente este esquema:
    
    HORARIOS Y LUGARES POR DÍA:
    - MARTES: 10:30-12:30 (LA BARBERA, LA CREUETA) / 17:30-19:30 (EL CENSAL, LA BARBERA)
    - JUEVES: 10:30-12:30 (CENTRO SALUD, LA BARBERA) / 17:30-19:30 (EL CENSAL, LA BARBERA)
    - SABADO: 10:30-12:00 (Dr. ESQUERDO, EL CENSAL) y 12:00-13:30 (Dr. ESQUERDO, EL CENSAL)
    
    REGLA CRÍTICA DE ASIGNACIÓN:
    1. Para CADA slot (Día + Lugar + Hora), debes generar EXACTAMENTE 2 entradas de Shift con usuarios DISTINTOS.
    2. TOTAL DE PERSONAS POR TURNO: 2.
    3. PRIORIDAD: Agrupa a personas con el MISMO APELLIDO en el mismo slot si es posible.
    4. Respeta estas disponibilidades: ${JSON.stringify(availabilities)}.
    5. No asignes a la misma persona dos veces el mismo día.
    6. Lista de voluntarios: ${JSON.stringify(usersInfo)}.
    
    Devuelve un array JSON de objetos Shift (id, fecha, inicio, fin, lugar, franja, estado="pendiente", asignadoA).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            fecha: { type: Type.STRING },
            inicio: { type: Type.STRING },
            fin: { type: Type.STRING },
            lugar: { type: Type.STRING },
            franja: { type: Type.STRING },
            estado: { type: Type.STRING },
            asignadoA: { type: Type.STRING },
          },
          required: ["id", "fecha", "inicio", "fin", "lugar", "franja", "estado", "asignadoA"]
        },
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Error parsing Gemini response", e);
    return [];
  }
};

export const getStatsAnalysis = async (shifts: Shift[], users: User[]) => {
  const ai = getAi();
  const prompt = `Analiza estos turnos brevemente: ${JSON.stringify(shifts)}`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  return response.text || '';
};

export const generalQuery = async (prompt: string, isComplex: boolean) => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: isComplex ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
    contents: prompt,
    config: isComplex ? { thinkingConfig: { thinkingBudget: 4000 } } : undefined
  });
  return response.text || '';
};

export const editImageWithGemini = async (base64Image: string, prompt: string) => {
  const ai = getAi();
  const dataParts = base64Image.split(',');
  const base64Data = dataParts[1] || dataParts[0];
  const mimeType = base64Image.match(/data:([^;]+);/)?.[1] || 'image/png';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
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
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }
  }
  return { imageUrl };
};

export const queryMaps = async (prompt: string, location?: { latitude: number; longitude: number }) => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
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
};
