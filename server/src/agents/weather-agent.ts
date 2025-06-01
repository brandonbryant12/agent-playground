import { generateText, hasToolCall, stepCountIs } from 'ai';
import { BaseAgent, AgentContext, AgentResult } from '../types/agent.js';
import { weatherTool } from '../tools/index.js';

export class WeatherAgent extends BaseAgent {
  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();

    // collect intermediate info here
    const stepLogs: Array<{
      stepNumber: number;
      text: string;
      toolCalls: unknown[];
    }> = [];

    try {
      const stream = await generateText({
        model: this.config.model,

        /* ----------- tool plumbing ----------- */
        tools: { weather: weatherTool },
        toolChoice: 'auto',

        /* ----------- prompts ----------------- */
        system:
          this.config.systemPrompt ??
          'You are a helpful weather assistant. When asked about weather, use the weather tool to get current conditions. Be concise and friendly in your responses.',
        prompt: context.query,

        /* ----------- orchestration ----------- */
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
