import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProvider,
} from '@ai-sdk/google';

export interface GeminiProviderConfig {
  apiKey: string;
  baseURL?: string;
  headers?: Record<string, string>;
}

export function createGeminiProvider(config: GeminiProviderConfig): GoogleGenerativeAIProvider {
  if (!config.apiKey) {
    throw new Error('Gemini API key is required');
  }

  return createGoogleGenerativeAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    headers: config.headers,
  });
}