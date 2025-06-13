import { LanguageModelV2 } from '@ai-sdk/provider';
import { BaseAgent } from '../types/agent.js';
import { WeatherAgent } from './weather-agent.js';
import { MultiToolAgent } from './multi-tool-agent.js';

export { WeatherAgent } from './weather-agent.js';
export { MultiToolAgent } from './multi-tool-agent.js';
export { BaseAgent } from '../types/agent.js';

export type AgentConstructor = new (config: {
  name: string;
  description: string;
  model: LanguageModelV2;
  systemPrompt?: string;
  tools?: string[];
}) => BaseAgent;

// Agent registry for dynamic agent creation
export const agentRegistry: Record<string, AgentConstructor> = {
  weather: WeatherAgent,
  multi: MultiToolAgent,
};

export function createAgent(
  type: string,
  model: LanguageModelV2,
  customConfig?: Partial<{
    name: string;
    description: string;
    systemPrompt: string;
    tools: string[];
  }>
): BaseAgent {
  const AgentClass = agentRegistry[type];
  
  if (!AgentClass) {
    throw new Error(`Unknown agent type: ${type}. Available agents: ${Object.keys(agentRegistry).join(', ')}`);
  }

  const defaultConfigs = {
    weather: {
      name: 'WeatherAgent',
      description: 'Provides current weather information for any location',
      systemPrompt: 'You are a helpful weather assistant. When asked about weather, use the weather tool to get current conditions. Be concise and friendly in your responses.',
    },
    multi: {
      name: 'MultiToolAgent',
      description: 'Agent that can use a custom list of tools',
    },
  };

  const defaultConfig = defaultConfigs[type as keyof typeof defaultConfigs] || {
    name: type,
    description: `${type} agent`,
  };

  return new AgentClass({
    ...defaultConfig,
    ...customConfig,
    model,
    tools: customConfig?.tools,
  });
}