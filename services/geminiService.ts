import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('book-to-action-user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.apiKey) return parsed.apiKey;
      }
    } catch (e) {
      console.error("Error reading API key from storage", e);
    }
  }
  return process.env.API_KEY || '';
};

export const generateHabitSuggestions = async (identity: string, context: string = ''): Promise<Array<{ action: string; cue: string }>> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock data.");
    // Simulate network delay for mock data to feel realistic
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      { action: "Read 1 page", cue: "After I pour my coffee" },
      { action: "Put on running shoes", cue: "When I get home from work" },
      { action: "Meditate for 1 minute", cue: "Before I brush my teeth" },
      { action: "Drink a glass of water", cue: "After I wake up" },
      { action: "Write one sentence", cue: "After I open my laptop" }
    ];
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the book "Atomic Habits" by James Clear, suggest 5 distinct atomic habits (tiny, 2-minute actions) for someone who wants to adopt the identity of: "${identity}".
      
      ${context ? `The user provided the following personal context/constraints: "${context}". Ensure the habits are tailored to this situation.` : ''}
      
      Return a JSON object with a list of suggestions. Each suggestion must have an "action" (the habit) and a "cue" (a likely trigger).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING, description: "The small atomic action to take." },
                  cue: { type: Type.STRING, description: "The trigger or time to do it." }
                },
                required: ["action", "cue"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text);
    return parsed.suggestions || [];

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};