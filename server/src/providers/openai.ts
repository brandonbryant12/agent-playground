import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';

export interface OpenAIProviderConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
  headers?: Record<string, string>;
}

export function createOpenAIProvider(config: OpenAIProviderConfig): OpenAIProvider {
  if (!config.apiKey) {
    throw new Error('OpenAI API key is required');
  }

  return createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    organization: config.organization,
    headers: config.headers,
  });
}