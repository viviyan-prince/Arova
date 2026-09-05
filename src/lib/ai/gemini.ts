import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIServiceError } from '@/lib/utils/errors';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AIServiceError(
        'Missing GEMINI_API_KEY environment variable. ' +
        'Add it to .env.local to enable Gemini features.'
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getGeminiModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
}

export async function callGemini(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const model = getGeminiModel();

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        ...(systemPrompt
          ? { systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] } }
          : {}),
      });

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new AIServiceError('Gemini returned an empty response.');
      }

      return text;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      if (attempt === maxAttempts) {
        const message = error instanceof Error ? error.message : 'Unknown Gemini error';
        throw new AIServiceError(`Gemini call failed after ${maxAttempts} attempts: ${message}`);
      }

      // Brief pause before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Unreachable, but satisfies TypeScript
  throw new AIServiceError('Gemini call failed unexpectedly.');
}
