import { GoogleGenAI } from "@google/genai";

// Initialize the client
// NOTE: Ensure process.env.API_KEY is available in your environment configuration.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeServiceImage = async (base64Image: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing");
    return "Configuração de IA pendente (Chave API ausente).";
  }

  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity from canvas/input
              data: base64Data
            }
          },
          {
            text: "Você é um assistente da Administração Regional. Analise esta foto de um serviço público urbano. Descreva brevemente (máximo 2 frases) qual problema ou serviço está visível na imagem (ex: entulho acumulado, boca de lobo suja, poda necessária)."
          }
        ]
      }
    });

    return response.text || "Não foi possível analisar a imagem.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Erro ao conectar com a IA.";
  }
};
