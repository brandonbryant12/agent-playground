import { LanguageModelV2 } from '@ai-sdk/provider';
import { BaseAgent } from '../types/agent.js';
import { WeatherAgent } from './weather-agent.js';

export { WeatherAgent } from './weather-agent.js';
export { BaseAgent } from '../types/agent.js';

// Agent registry for dynamic agent creation
export type AgentConstructor = new (config: {
  name: string;
  description: string;
  model: LanguageModelV2;
  systemPrompt?: string;
}) => BaseAgent;

export const agentRegistry: Record<string, AgentConstructor> = {
  weather: WeatherAgent,
};

export function createAgent(
  type: string,
  model: LanguageModelV2,
  customConfig?: Partial<{
    name: string;
    description: string;
    systemPrompt: string;
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
  };

  const defaultConfig = defaultConfigs[type as keyof typeof defaultConfigs] || {
    name: type,
    description: `${type} agent`,
  };

  return new AgentClass({
    ...defaultConfig,
    ...customConfig,
    model,
  });
}