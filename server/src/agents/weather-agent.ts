import { generateText } from 'ai';
import { BaseAgent, AgentContext, AgentResult } from '../types/agent.js';
import { weatherTool } from '../tools/index.js';

export class WeatherAgent extends BaseAgent {
  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      const result = await generateText({
        model: this.config.model,
        tools: {
          weather: weatherTool,
        },
        maxRetries: 3,
        system: this.config.systemPrompt || `You are a helpful weather assistant. When asked about weather, use the weather tool to get current conditions. Be concise and friendly in your responses.`,
        prompt: context.query,
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: {
          text: result.text,
          toolCalls: result.toolCalls,
          usage: result.usage,
        },
        metadata: {
          toolCalls: result.toolCalls?.length || 0,
          duration,
          model: this.config.model.modelId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          duration: Date.now() - startTime,
        },
      };
    }
  }
}