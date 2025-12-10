import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAITransitionSuggestion = async (trackA: string, trackB: string): Promise<string> => {
  try {
    const prompt = `I am a DJ mixing two tracks. Track A is "${trackA}" and Track B is "${trackB}". 
    Suggest a creative transition technique in one short sentence (max 15 words). Focus on EQ, FX, or Loop techniques.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Smooth blend using Low EQ cut.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Fade Bass out on A, drop Bass on B.";
  }
};

export const getAITrackRecommendation = async (currentTrack: string, bpm: number, genre: string): Promise<string> => {
  try {
    const prompt = `I am playing "${currentTrack}" (${bpm} BPM, ${genre}). 
    Suggest 3 similar song titles and artists that would mix well. Return just the song names/artists separated by commas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No recommendations found.";
  } catch (error) {
    return "Data unavailable";
  }
};

export const getAIAssistantMessage = async (query: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an expert DJ AI assistant. Answer this briefly for a live DJ interface: ${query}`,
        });
        return response.text || "I didn't catch that.";
    } catch (e) {
        return "System error.";
    }
}