import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const GEMINI_MODELS = [
    // Gemini 3.0 Series (Latest - December 2025)
    { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash', description: 'รุ่นล่าสุด เร็วและฉลาดที่สุด (Default)', cost: 'Free' },
    { id: 'gemini-3.0-pro', name: 'Gemini 3.0 Pro', description: 'รุ่นใหม่ล่าสุด สำหรับงานซับซ้อน', cost: 'Free' },
    // Gemini 2.5 Series (June 2025)
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'ฉลาดที่สุด เหมาะกับการวิเคราะห์และเขียน SAR', cost: 'Free' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'รวดเร็ว เหมาะกับงานทั่วไป', cost: 'Free' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'ประหยัดต้นทุน เหมาะกับงานง่ายๆ', cost: 'Free' },
    // Gemini 2.0 Series (February 2025)
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'เวอร์ชันเสถียร รองรับ 1M tokens', cost: 'Free' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', description: 'ประหยัดต้นทุน', cost: 'Free' },
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

export interface StrategicInsight {
    executive_summary: string;
    strengths: string[];
    weaknesses: string[];
    strategic_recommendations: string[];
}

export const generateStrategicInsights = async (apiKey: string, modelId: string, contexts: string[]): Promise<StrategicInsight> => {
    // Combine contexts (limit to reasonable length if needed, but Gemini has large window)
    const combinedContext = contexts.join('\n\n---\n\n');

    const prompt = `วิเคราะห์ข้อมูลเนื้อหา SAR (Self-Assessment Report) ขององค์กรต่อไปนี้เพื่อหาจุดแข็ง จุดอ่อน และข้อเสนอแนะเชิงกลยุทธ์:

บริบทข้อมูล (SAR Content):
${combinedContext}

คำสั่ง:
ให้วิเคราะห์และสรุปผลเป็น JSON format ดังนี้:
{
  "executive_summary": "บทสรุปผู้บริหาร ภาพรวมความเป็นเลิศและสิ่งที่ต้องเร่งปรับปรุง (ความยาวประมาณ 3-4 ประโยค)",
  "strengths": ["จุดแข็งที่โดดเด่น 1", "จุดแข็งที่โดดเด่น 2", "จุดแข็งที่โดดเด่น 3", "จุดแข็งที่โดดเด่น 4", "จุดแข็งที่โดดเด่น 5"],
  "weaknesses": ["จุดอ่อนหรือโอกาสพัฒนา 1", "จุดอ่อนหรือโอกาสพัฒนา 2", "จุดอ่อนหรือโอกาสพัฒนา 3", "จุดอ่อนหรือโอกาสพัฒนา 4", "จุดอ่อนหรือโอกาสพัฒนา 5"],
  "strategic_recommendations": ["ข้อเสนอแนะเชิงกลยุทธ์เพื่อยกระดับองค์กร 1", "ข้อเสนอแนะเชิงกลยุทธ์เพื่อยกระดับองค์กร 2", "ข้อเสนอแนะเชิงกลยุทธ์เพื่อยกระดับองค์กร 3"]
}
ตอบเป็น JSON เท่านั้น ไม่ต้องมี Markdown block`;

    try {
        const content = await generateSARContent(apiKey, modelId, prompt);
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(jsonStr) as StrategicInsight;
    } catch (error) {
        console.error('Strategic Analysis Error:', error);
        throw error;
    }
};

export const askDataQuestion = async (apiKey: string, modelId: string, contexts: string[], question: string) => {
    const combinedContext = contexts.join('\n\n---\n\n');

    const prompt = `คุณคือผู้เชี่ยวชาญด้าน PMQA (Public Sector Management Quality Award)
นี่คือข้อมูลบริบทจากการประเมินตนเอง (SAR) ขององค์กร:

${combinedContext}

คำถามจากผู้ใช้: "${question}"

คำแนะนำในการตอบ:
1. ตอบคำถามโดยอ้างอิงข้อมูลจากบริบทที่ให้เท่านั้น
2. หากไม่มีข้อมูลในบริบท ให้ระบุว่า "ไม่พบข้อมูลในรายงาน SAR ที่บันทึกไว้"
3. ตอบในเชิงวิชาการ สร้างสรรค์ และเป็นประโยชน์ต่อการพัฒนาองค์กร
4. ใช้ภาษาไทยที่สละสลวย`;

    try {
        // Use streaming logic potentially in UI, but here simple generation
        const content = await generateSARContent(apiKey, modelId, prompt);
        return content;
    } catch (error) {
        console.error('Q&A Error:', error);
        throw error;
    }
};

export interface TrendAnalysisResult {
    summary: string;
    improvement_areas: string[];
    regression_areas: string[];
    stable_areas: string[];
}

export const generateTrendAnalysis = async (apiKey: string, modelId: string, currentContext: string[], previousContext: string[]): Promise<TrendAnalysisResult> => {
    const currentStr = currentContext.join('\n\n');
    const previousStr = previousContext.join('\n\n');

    const prompt = `เปรียบเทียบผลการดำเนินงานจากการบันทึก SAR สองรอบปี (ปีปัจจุบัน vs ปีที่ผ่านมา) เพื่อวิเคราะห์แนวโน้ม:

ข้อมูลปีที่ผ่านมา (Previous Year):
${previousStr}

ข้อมูลปีปัจจุบัน (Current Year):
${currentStr}

คำสั่ง:
ให้วิเคราะห์เชิงเปรียบเทียบ หาพัฒนาการ (Improvements), ส่วนที่ถดถอย (Regressions) หรือส่วนที่คงเดิม (Stable) และสรุปแนวโน้มภาพรวม
ตอบเป็น JSON format ดังนี้:
{
  "summary": "บทสรุปแนวโน้มภาพรวม (ดีขึ้น/แย่ลง/คงที่) ประมาณ 2-3 ประโยค",
  "improvement_areas": ["ด้านที่พัฒนาขึ้น 1", "ด้านที่พัฒนาขึ้น 2"],
  "regression_areas": ["ด้านที่ถดถอยลง 1 (ถ้ามี)", "ด้านที่ถดถอยลง 2"],
  "stable_areas": ["ด้านที่ยังคงเดิม"]
}
ตอบเป็น JSON เท่านั้น`;

    try {
        const content = await generateSARContent(apiKey, modelId, prompt);
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(jsonStr) as TrendAnalysisResult;
    } catch (error) {
        console.error('Trend Analysis Error:', error);
        throw error;
    }
};

export const refineSARText = async (apiKey: string, modelId: string, text: string, tone: string = 'official') => {
    let instruction = '';
    switch (tone) {
        case 'concise':
            instruction = 'ให้กระชับ สรุปใจความสำคัญ (Concise Tone)';
            break;
        case 'elaborate':
            instruction = 'ให้ละเอียด ขยายความให้สมบูรณ์ (Elaborate Tone)';
            break;
        case 'official':
        default:
            instruction = 'ให้เป็นภาษาทางการ (Official Tone) เหมาะสำหรับรายงานราชการ (SAR)';
            break;
    }

    const prompt = `ปรับแก้ข้อความภาษาไทยต่อไปนี้${instruction}:

ข้อความต้นฉบับ:
"${text}"

คำสั่ง:
- แก้ไขไวยากรณ์ให้ถูกต้อง
- ใช้คำศัพท์ทางวิชาการ/ราชการที่เหมาะสม
${tone === 'concise' ? '- ตัดส่วนฟุ่มเฟือยออก เน้นเนื้อหาหลัก' : ''}
${tone === 'elaborate' ? '- เพิ่มรายละเอียด ขยายความให้ชัดเจน' : ''}
- ไม่ต้องอธิบายเพิ่ม ให้ตอบเฉพาะข้อความที่แก้แล้วเท่านั้น`;

    try {
        const content = await generateSARContent(apiKey, modelId, prompt);
        return content.trim();
    } catch (error) {
        console.error('Refine Text Error:', error);
        throw error;
    }
};

export const analyzeEvidenceImage = async (apiKey: string, modelId: string, imageBase64: string, mimeType: string) => {
    const google = createAIClient(apiKey);
    const model = google(modelId);

    const prompt = `Analyze this image/document evidence for PMQA (Public Sector Management Quality Award) assessment.
    1. Identify the document type (e.g., Meeting Minutes, Policy, Chart, Photo).
    2. Suggest the most relevant PMQA Category (1-7).
    3. Extract 3-5 key tags.
    4. Provide a customized "Smart Tag" name (e.g., "Meeting Minutes - Jan 2024").
    
    Return ONLY a JSON object with this structure:
    {
      "documentType": "string",
      "category": "string",
      "confidence": number,
      "tags": ["string"],
      "suggestedName": "string"
    }`;

    try {
        const { text } = await generateText({
            model: model,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image', image: `data:${mimeType};base64,${imageBase64}` }
                    ],
                },
            ],
        });

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('AI Evidence Analysis Error:', error);
        throw error;
    }
};

export const chatWithPMQARules = async (apiKey: string, modelId: string, history: { role: string; content: string }[]) => {
    const google = createAIClient(apiKey);
    const model = google(modelId);

    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านเกณฑ์คุณภาพการบริหารจัดการภาครัฐ (PMQA 4.0) ของประเทศไทย
    หน้าที่ของคุณคือให้คำแนะนำ ตอบคำถาม และชี้แจงเกี่ยวกับเกณฑ์ PMQA ทั้ง 7 หมวด:
    1. การนำองค์การ
    2. การวางแผนเชิงยุทธศาสตร์
    3. การให้ความสำคัญกับผู้รับบริการ
    4. การวัด วิเคราะห์ และจัดการความรู้
    5. การมุ่งเน้นบุคลากร
    6. การมุ่งเน้นระบบปฏิบัติการ
    7. ผลลัพธ์การดำเนินการ
    
    คำแนะนำในการตอบ:
    - อ้างอิงเกณฑ์อย่างถูกต้อง แม่นยำ
    - หากเป็นคำถามเชิงปฏิบัติ ให้ยกตัวอย่างประกอบ
    - ตอบด้วยภาษาที่สุภาพ เป็นทางการ และเข้าใจง่าย
    - หากไม่ทราบคำตอบ ให้แจ้งว่า "ไม่มีข้อมูลในฐานความรู้ปัจจุบัน" อย่าสร้างข้อมูลเท็จ`;

    try {
        const { text } = await generateText({
            model: model,
            system: systemPrompt, // Vercel AI SDK supports 'system' property
            messages: history as Array<{ role: 'user' | 'assistant'; content: string }>,
        });
        return text;
    } catch (error) {
        console.error('PMQA Chat Error:', error);
        throw error;
    }
};
