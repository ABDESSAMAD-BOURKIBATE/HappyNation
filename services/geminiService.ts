import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, SurveyResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stressLevel: { type: Type.NUMBER, description: "A score from 0 to 100 indicating stress level (0 is low stress, 100 is burnout)." },
    focusLevel: { type: Type.NUMBER, description: "A score from 0 to 100 indicating focus capability." },
    motivationLevel: { type: Type.NUMBER, description: "A score from 0 to 100 indicating motivation." },
    riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "Overall burnout risk assessment." },
    summary: { type: Type.STRING, description: "A concise executive summary of the employee's mental state." },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 actionable recommendations for the employee to improve their well-being."
    }
  },
  required: ["stressLevel", "focusLevel", "motivationLevel", "riskLevel", "summary", "recommendations"]
};

export const analyzeWellbeing = async (responses: SurveyResponse[]): Promise<AnalysisResult> => {
  try {
    const promptText = `
      You are an expert Organizational Psychologist and AI Well-being Analyst.
      Analyze the following survey responses from an employee.
      
      Survey Data:
      ${JSON.stringify(responses, null, 2)}
      
      Provide a structured diagnosis including numerical scores for Stress, Focus, and Motivation.
      Determine the overall Risk Level.
      Provide a short, empathetic summary.
      Provide 3 specific, actionable recommendations (e.g., specific breathing exercises, time management techniques, or break strategies).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are helpful, empathetic, and professional. Your analysis should be constructive."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Fallback mock data in case of API failure (or missing key during demo)
    return {
      stressLevel: 45,
      focusLevel: 72,
      motivationLevel: 60,
      riskLevel: "Medium",
      summary: "Analysis unavailable. Defaulting to safe mode. Please check API configuration.",
      recommendations: [
        "Take a 5-minute walk.",
        "Practice box breathing.",
        "Review priorities for tomorrow."
      ]
    };
  }
};