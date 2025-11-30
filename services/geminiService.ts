import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImageForCaffeine = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<AIAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using efficient model for image tasks
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `Analyze this image (menu, label, or coffee drink). Identify the beverage and estimate its caffeine content in milligrams (mg). 
            If it's a menu, select the most prominent coffee item or the one focused on. 
            If it's a nutrition label, extract the caffeine amount.
            If it's just a photo of a drink, estimate based on visual cues (size, type).
            
            Return the result in JSON format.
            IMPORTANT: The "reasoning" and "drinkName" fields must be in Traditional Chinese (繁體中文).`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drinkName: { type: Type.STRING },
            estimatedMg: { type: Type.NUMBER },
            confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            reasoning: { type: Type.STRING }
          },
          required: ["drinkName", "estimatedMg", "confidence", "reasoning"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for demo purposes if API fails or key is missing
    return {
      drinkName: "未知咖啡飲品 (估計)",
      estimatedMg: 95,
      confidence: "Low",
      reasoning: "無法連接至 AI 服務。使用標準咖啡平均值進行估算。"
    };
  }
};