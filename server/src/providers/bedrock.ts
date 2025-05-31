import { createAmazonBedrock, type AmazonBedrockProvider } from '@ai-sdk/amazon-bedrock';

export interface BedrockProviderConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  baseURL?: string;
}

export function createBedrockProvider(config: BedrockProviderConfig = {}): AmazonBedrockProvider {
  return createAmazonBedrock({
    region: config.region || process.env.AWS_REGION || 'us-east-1',
    accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || 'placeholder',
    sessionToken: config.sessionToken || process.env.AWS_SESSION_TOKEN,
    baseURL: config.baseURL,
  });
}