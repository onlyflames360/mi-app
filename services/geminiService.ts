
import { GoogleGenAI, Type } from "@google/genai";
import { OCR_SEED_SYSTEM_PROMPT } from '../constants';

export async function processOCRImages(imagesBase64: string[]) {
  // Always initialize GoogleGenAI inside the function to use the correct API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imageParts = imagesBase64.map(base64 => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: base64.split(',')[1] || base64
    }
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: "Extract shift information from these images." },
        ...imageParts
      ]
    },
    config: {
      systemInstruction: OCR_SEED_SYSTEM_PROMPT,
      responseMimeType: "application/json"
    }
  });

  try {
    // Access response.text as a property, not a method.
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("Error parsing OCR response", e);
    return null;
  }
}
