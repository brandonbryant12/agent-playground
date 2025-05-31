import { LanguageModelV2 } from '@ai-sdk/provider';

export interface AgentConfig {
  name: string;
  description: string;
  model: LanguageModelV2;
  systemPrompt?: string;
}

export interface AgentContext {
  query: string;
  options?: Record<string, any>;
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    toolCalls?: number;
    duration?: number;
    model?: string;
  };
}

export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  get name(): string {
    return this.config.name;
  }

  get description(): string {
    return this.config.description;
  }

  abstract execute(context: AgentContext): Promise<AgentResult>;
}