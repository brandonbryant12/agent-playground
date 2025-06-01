import { LanguageModelV2 } from '@ai-sdk/provider';
import type { OpenAIProvider } from '@ai-sdk/openai';
import type { GoogleGenerativeAIProvider } from '@ai-sdk/google';
import type { AmazonBedrockProvider } from '@ai-sdk/amazon-bedrock';

export type AIProvider = OpenAIProvider | GoogleGenerativeAIProvider | AmazonBedrockProvider;

export interface ModelTiers {
  small: string;
  default: string;
  large: string;
}

export interface LLMService {
  /** Underlying SDK provider instance (OpenAI, Gemini, Bedrock, …) */
  provider: AIProvider;
  model: LanguageModelV2;
}

export interface ProviderRegistry {
  openai: {
    provider: OpenAIProvider;
    models: ModelTiers;
  };
  gemini: {
    provider: GoogleGenerativeAIProvider;
    models: ModelTiers;
  };
  bedrock: {
    provider: AmazonBedrockProvider;
    models: ModelTiers;
  };
}

export type ProviderName = keyof ProviderRegistry;
export type ModelTier = keyof ModelTiers;

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