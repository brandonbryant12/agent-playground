import { generateText, stepCountIs } from 'ai';
import { BaseAgent, AgentContext, AgentResult, AgentConfig } from '../types/agent.js';
import { getTools } from '../tools/registry.js';

export interface MultiToolAgentConfig extends AgentConfig {
  tools: string[];
}

export class MultiToolAgent extends BaseAgent {
  private toolNames: string[];

  constructor(config: MultiToolAgentConfig) {
    super(config);
    this.toolNames = config.tools;
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const stepLogs: Array<{ stepNumber: number; text: string; toolCalls: unknown[] }> = [];

    try {
      const tools = getTools(this.toolNames);

      const stream = await generateText({
        model: this.config.model,
        tools,
        toolChoice: 'auto',
        system: this.config.systemPrompt ?? 'You are a helpful AI assistant.',
        prompt: context.query,
        stopWhen: [stepCountIs(3)],
        onStepFinish: (step) => {
          stepLogs.push({
            stepNumber: stepLogs.length + 1,
            text: step.text,
            toolCalls: step.toolCalls,
          });
        },
      });

      const text = await stream.text;
      const toolCalls = await stream.toolCalls;
      const usage = await stream.usage;

      return {
        success: true,
        data: { text, toolCalls, usage, steps: stepLogs },
        metadata: {
          toolCalls: toolCalls.length,
          duration: Date.now() - startTime,
          model: this.config.model.modelId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: { duration: Date.now() - startTime },
      };
    }
  }
}
