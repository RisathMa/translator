
import { GoogleGenAI, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const translateText = async (text: string, targetLanguageFlores: string): Promise<string> => {
  const ai = getAI();
  // Switching to gemini-3-flash-preview to resolve the "Budget 0 is invalid" error 
  // encountered with the Pro model, which mandates a non-zero reasoning budget.
  // Flash is optimized for high-speed translation and meets the sub-2s latency target.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following text to the language associated with FLORES-200 code ${targetLanguageFlores}. Return ONLY the translated text, no explanation: "${text}"`,
    config: {
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 0 } // Disabling thinking for maximum speed in translation
    },
  });
  return response.text || "Translation failed.";
};

export const translateImage = async (base64Image: string, targetLanguage: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: `OCR and translate this image to ${targetLanguage}. Use a Surya-inspired approach: be extremely precise with spatial text detection, especially for scripts like Sinhala or Tamil. Return only the translation.`,
        },
      ],
    },
    config: {
      // Optional: set small thinking budget if OCR fails on complex images, 
      // but keeping default for standard speed.
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
  return response.text || "OCR/Translation failed.";
};

export const streamVoiceTranslation = async (targetLanguage: string, callbacks: any) => {
  const ai = getAI();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
      },
      systemInstruction: `You are a real-time speech-to-speech translator. Listen to the user and immediately speak the translation in ${targetLanguage}. Maintain the tone and urgency of the speaker.`,
      inputAudioTranscription: {},
      outputAudioTranscription: {}
    },
  });
};
