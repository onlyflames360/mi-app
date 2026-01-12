
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
    Genera la planificación para el mes ${month}.
    
    HORARIOS ESTRICTOS (Solo Martes, Jueves y Sábados):
    - Martes: 10:30-12:30 (LA BARBERA, LA CREUETA) / 17:30-19:30 (EL CENSAL, LA BARBERA)
    - Jueves: 10:30-12:30 (CENTRO SALUD, LA BARBERA) / 17:30-19:30 (EL CENSAL, LA BARBERA)
    - Sábado: 10:30-12:00 (Dr. ESQUERDO, EL CENSAL) y 12:00-13:30 (Dr. ESQUERDO, EL CENSAL)
    
    REGLA DE ORO:
    - Para CADA lugar y CADA hora en los días indicados, debes asignar EXACTAMENTE a 2 personas (2 objetos Shift por slot).
    - Prioriza agrupar personas con el MISMO APELLIDO en el mismo slot.
    - No asignes a la misma persona más de una vez el mismo día.
    - Respeta estas disponibilidades: ${JSON.stringify(availabilities)}.
    - Usuarios disponibles: ${JSON.stringify(usersInfo)}.
    
    Devuelve un array JSON de objetos Shift (id, fecha, inicio, fin, lugar, franja, estado="pendiente", asignadoA).
    "franja" debe ser: "manana", "tarde" o "sabado".
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
    const text = response.text || '[]';
    return JSON.parse(text);
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
