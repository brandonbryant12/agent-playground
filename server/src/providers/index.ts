// Export types
export * from './types.js';

import { LanguageModel } from 'ai';
// Import for internal use
import { ProviderFactory } from './factory.js';

// Export factory
export { ProviderFactory, PROVIDER_MODELS } from './factory.js';

// Export individual providers for advanced usage
export { createOpenAIProvider } from './openai.js';
export { createGeminiProvider } from './gemini.js';
export { createBedrockProvider } from './bedrock.js';

// Convenience functions that match the old API
export function getModel(
  provider: string = 'openai',
  modelName?: string
): LanguageModel {
  return ProviderFactory.getModel(provider, modelName);
}

export function listProviders(): string[] {
  return ProviderFactory.listProviders();
}