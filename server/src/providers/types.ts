import { LanguageModelV2, ProviderV2 } from '@ai-sdk/provider';
import type { OpenAIProvider } from '@ai-sdk/openai';
import type { GoogleGenerativeAIProvider } from '@ai-sdk/google';
import type { AmazonBedrockProvider } from '@ai-sdk/amazon-bedrock';

export type AIProvider = OpenAIProvider | GoogleGenerativeAIProvider | AmazonBedrockProvider;

export interface LLMService {
  provider: ProviderV2;
  model: LanguageModelV2;
}

export interface ProviderRegistry {
  openai: {
    provider: OpenAIProvider;
    defaultModel: string;
  };
  gemini: {
    provider: GoogleGenerativeAIProvider;
    defaultModel: string;
  };
  bedrock: {
    provider: AmazonBedrockProvider;
    defaultModel: string;
  };
}

export type ProviderName = keyof ProviderRegistry;

export interface ProviderConfig {
  apiKey?: string;
  baseURL?: string;
  organization?: string;
  headers?: Record<string, string>;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}