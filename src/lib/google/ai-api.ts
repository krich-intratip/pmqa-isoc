import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';

export const GEMINI_MODELS = [
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 3 Flash (Preview)', description: 'Fastest and most efficient model (Preview)', cost: 'Free' },
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', description: 'Best for complex reasoning and SAR writing', cost: 'Free (Rate Limited)' },
    { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', description: 'Fast and versatile', cost: 'Free' },
    { id: 'gemini-pro', name: 'Gemini 1.0 Pro', description: 'Standard model', cost: 'Free' },
];

export const createAIClient = (apiKey: string) => {
    if (!apiKey) throw new Error('API Key is required');

    return createGoogleGenerativeAI({
        apiKey: apiKey,
    });
};

export const generateSARContent = async (apiKey: string, modelId: string, prompt: string) => {
    const google = createAIClient(apiKey);
    const model = google(modelId);

    try {
        const { text } = await generateText({
            model: model,
            prompt: prompt,
        });
        return text;
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw error;
    }
};

export const testAIConnection = async (apiKey: string, modelId: string) => {
    try {
        const response = await generateSARContent(apiKey, modelId, 'Hello, just testing the connection. Reply with "Connected".');
        return response.includes('Connected') || response.length > 0;
    } catch (error) {
        return false;
    }
};

export const analyzeThaiText = async (apiKey: string, modelId: string, text: string) => {
    const prompt = `วิเคราะห์ข้อความภาษาไทยต่อไปนี้อย่างละเอียด:

${text}

ให้ผลลัพธ์เป็น JSON format ดังนี้:
{
  "summary": "สรุปเนื้อหาสั้นๆ ไม่เกิน 100 คำ",
  "keywords": ["คำสำคัญ 1", "คำสำคัญ 2", "คำสำคัญ 3"],
  "sentiment": "positive|neutral|negative",
  "category": "หมวดหมู่หลัก",
  "confidence": 0.0-1.0,
  "suggestions": ["ข้อเสนอแนะ 1", "ข้อเสนอแนะ 2"]
}`;

    try {
        const content = await generateSARContent(apiKey, modelId, prompt);
        // Clean up markdown code blocks if present
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Thai Text Analysis Error:', error);
        throw error;
    }
};
