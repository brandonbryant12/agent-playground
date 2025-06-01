import { LanguageModelV2 } from '@ai-sdk/provider';
import { createOpenAIProvider } from './openai.js';
import { createGeminiProvider } from './gemini.js';
import { createBedrockProvider } from './bedrock.js';
import type { LLMService, ProviderName, ProviderConfig, ModelTiers, ModelTier, AIProvider } from './types.js';

// Model configurations for each provider
export const PROVIDER_MODELS: Record<ProviderName, ModelTiers> = {
  openai: {
    small: 'gpt-3.5-turbo',
    default: 'gpt-4-turbo-preview',
    large: 'gpt-4o',
  },
  gemini: {
    small: 'gemini-1.5-flash',
    default: 'gemini-1.5-pro',
    large: 'gemini-1.5-pro',
  },
  bedrock: {
    small: 'anthropic.claude-3-haiku-20240307',
    default: 'anthropic.claude-3-sonnet-20240229',
    large: 'anthropic.claude-3-opus-20240229',
  },
};

// Environment variable mapping
const ENV_VARS: Record<ProviderName, { apiKey?: string; baseURL?: string }> = {
  openai: {
    apiKey: 'OPENAI_API_KEY',
    baseURL: 'OPENAI_BASE_URL',
  },
  gemini: {
    apiKey: 'GEMINI_API_KEY',
    baseURL: 'GEMINI_BASE_URL',
  },
  bedrock: {
    baseURL: 'BEDROCK_BASE_URL',
  },
};

export class ProviderFactory {
  private static validateProvider(name: string): asserts name is ProviderName {
    if (!['openai', 'gemini', 'bedrock'].includes(name)) {
      throw new Error(
        `Unknown provider: ${name}. Available providers: openai, gemini, bedrock`
      );
    }
  }

  private static getProviderConfig(
    provider: ProviderName,
    config?: Partial<ProviderConfig>
  ): ProviderConfig {
    const envVars = ENV_VARS[provider];
    const mergedConfig: ProviderConfig = { ...config };

    // Get API key from config or environment
    if (envVars.apiKey && !mergedConfig.apiKey) {
      mergedConfig.apiKey = process.env[envVars.apiKey];
    }

    // Get base URL from config or environment
    if (envVars.baseURL && !mergedConfig.baseURL) {
      mergedConfig.baseURL = process.env[envVars.baseURL];
    }

    return mergedConfig;
  }

  static createProvider(
    providerName: string,
    config?: Partial<ProviderConfig>
  ): AIProvider {
    this.validateProvider(providerName);
    const providerConfig = this.getProviderConfig(providerName, config);

    switch (providerName) {
      case 'openai':
        if (!providerConfig.apiKey) {
          throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.');
        }
        return createOpenAIProvider({
          apiKey: providerConfig.apiKey,
          baseURL: providerConfig.baseURL,
          organization: providerConfig.organization,
          headers: providerConfig.headers,
        });

      case 'gemini':
        if (!providerConfig.apiKey) {
          throw new Error('Gemini API key is required. Set GEMINI_API_KEY environment variable.');
        }
        return createGeminiProvider({
          apiKey: providerConfig.apiKey,
          baseURL: providerConfig.baseURL,
          headers: providerConfig.headers,
        });

      case 'bedrock':
        return createBedrockProvider({
          region: providerConfig.region,
          accessKeyId: providerConfig.accessKeyId,
          secretAccessKey: providerConfig.secretAccessKey,
          sessionToken: providerConfig.sessionToken,
          baseURL: providerConfig.baseURL,
        });

      default:
        // This should never happen due to validation
        throw new Error(`Provider ${providerName} not implemented`);
    }
  }

  static createLLMService(
    providerName: string,
    modelNameOrTier?: string | ModelTier,
    config?: Partial<ProviderConfig>
  ): LLMService {
    this.validateProvider(providerName);
    
    const provider = this.createProvider(providerName, config);
    const models = PROVIDER_MODELS[providerName];
    
    // Determine which model to use
    let model: string;
    if (!modelNameOrTier) {
      model = models.default;
    } else if (modelNameOrTier in models) {
      // It's a tier (small, default, large)
      model = models[modelNameOrTier as ModelTier];
    } else {
      // It's a specific model name
      model = modelNameOrTier;
    }
    
    return {
      provider,
      model: provider.languageModel(model) as LanguageModelV2,
    };
  }

  static getModel(
    providerName: string = 'openai',
    modelNameOrTier?: string | ModelTier,
    config?: Partial<ProviderConfig>
  ): LanguageModelV2 {
    const service = this.createLLMService(providerName, modelNameOrTier, config);
    return service.model;
  }

  static listProviders(): ProviderName[] {
    return ['openai', 'gemini', 'bedrock'];
  }

  static getProviderInfo(providerName: string): {
    name: string;
    models: ModelTiers;
    requiredEnvVars: string[];
    optionalEnvVars: string[];
  } {
    this.validateProvider(providerName);
    
    const envVars = ENV_VARS[providerName];
    const required: string[] = [];
    const optional: string[] = [];

    if (envVars.apiKey) required.push(envVars.apiKey);
    if (envVars.baseURL) optional.push(envVars.baseURL);

    // Bedrock doesn't need any environment variables - uses placeholders

    return {
      name: providerName,
      models: PROVIDER_MODELS[providerName],
      requiredEnvVars: required,
      optionalEnvVars: optional,
    };
  }
}