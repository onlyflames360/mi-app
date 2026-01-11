
import { GoogleGenAI, Type } from "@google/genai";
import { User, Availability, Shift } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMonthlyPlan = async (
  users: User[],
  availabilities: Availability[],
  month: string
): Promise<Shift[]> => {
  const usersList = users.map(u => `ID: ${u.id} | Hermano: ${u.firstName} ${u.lastName}`).join('\n');

  const prompt = `
    ACTÚA COMO COORDINADOR LOGÍSTICO PARA "HERMANOS DEL PPOC".
    GENERA EL CALENDARIO PARA EL MES: ${month}.

    REGLAS DE HORARIOS Y UBICACIONES (ESTRICTO SEGÚN IMAGEN):
    1. MARTES:
       - Mañana (10:30 - 12:30): Generar turnos para [LA BARBERA, LA CREUETA].
       - Tarde (17:30 - 19:30): Generar turnos para [EL CENSAL, LA BARBERA].
    
    2. JUEVES:
       - Mañana (10:30 - 12:30): Generar turnos para [CENTRO SALUD, LA BARBERA].
       - Tarde (17:30 - 19:30): Generar turnos para [EL CENSAL, LA BARBERA].

    3. SÁBADOS (SOLO MAÑANA EN DOS BLOQUES):
       - Bloque 1 (10:30 - 12:00): Generar turnos para [Dr. ESQUERDO, EL CENSAL].
       - Bloque 2 (12:00 - 13:30): Generar turnos para [Dr. ESQUERDO, EL CENSAL].

    REGLAS DE PROHIBICIÓN ABSOLUTA:
    - LUNES: TOTALMENTE PROHIBIDO (No generar nada).
    - MIÉRCOLES: TOTALMENTE PROHIBIDO (No generar nada).
    - VIERNES: PROHIBIDO (No generar nada).
    - DOMINGO: PROHIBIDO (No generar nada).

    REGLAS DE ASIGNACIÓN:
    - LISTA DE VOLUNTARIOS (USA ESTOS IDs):
    ${usersList}
    - Asigna entre 2 y 3 hermanos (IDs) por cada ubicación y horario.
    - Distribución equitativa: Todos los hermanos deben tener turnos asignados durante el mes.
    - No repetir al mismo hermano el mismo día en distintas ubicaciones.
    - El campo 'assignedUserIds' debe contener los IDs.

    RESPUESTA: Un array JSON de objetos Shift.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "Fecha YYYY-MM-DD" },
            time: { type: Type.STRING, description: "Horario exacto según reglas" },
            period: { type: Type.STRING, enum: ["MAÑANA", "TARDE"] },
            location: { type: Type.STRING },
            assignedUserIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "IDs de los hermanos" 
            },
            status: { type: Type.STRING }
          },
          required: ["date", "time", "period", "location", "assignedUserIds", "status"]
        }
      }
    }
  });

  try {
    const text = response.text || "[]";
    const shifts = JSON.parse(text);
    return shifts.map((s: any) => ({ 
      ...s, 
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING'
    }));
  } catch (e) {
    console.error("Error al procesar la respuesta de Gemini", e);
    return [];
  }
};
