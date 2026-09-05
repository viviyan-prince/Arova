import Groq from 'groq-sdk';
import { AIServiceError } from '@/lib/utils/errors';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new AIServiceError(
        'Missing GROQ_API_KEY environment variable. ' +
        'Add it to .env.local to enable Groq features.'
      );
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export async function callGroq(
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const client = getGroqClient();

  try {
    const completion = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2048,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new AIServiceError('Groq returned an empty response.');
    }

    return text;
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown Groq error';
    throw new AIServiceError(`Groq call failed: ${message}`);
  }
}
