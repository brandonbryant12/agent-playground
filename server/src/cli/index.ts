#!/usr/bin/env node

import { Command } from 'commander';
import { createAgent, agentRegistry } from '../agents/index.js';
import { ProviderFactory, PROVIDER_MODELS } from '../providers/index.js';
import { loadEnvironment } from './env-loader.js';
import { ConfigManager } from './config.js';
import { createSetupCommand } from './setup-command.js';
import { generateText } from 'ai';

// Load environment variables from multiple sources
loadEnvironment();

// Load configuration
const config = ConfigManager.loadConfig();

// Simple color functions for CLI output
const success = (text: string) => `\x1b[32m${text}\x1b[0m`;
const error = (text: string) => `\x1b[31m${text}\x1b[0m`;
const info = (text: string) => `\x1b[34m${text}\x1b[0m`;
const warning = (text: string) => `\x1b[33m${text}\x1b[0m`;

// Get default provider based on what's configured
function getDefaultProvider(): string {
  // First check if there's a saved default in config
  if (config.defaultProvider) {
    return config.defaultProvider;
  }
  
  // Otherwise, check which providers have API keys configured
  const providers = ProviderFactory.listProviders();
  for (const provider of providers) {
    const providerInfo = ProviderFactory.getProviderInfo(provider);
    const hasRequiredKeys = providerInfo.requiredEnvVars.every(
      envVar => !!process.env[envVar]
    );
    if (hasRequiredKeys) {
      return provider;
    }
  }
  
  // Default to gemini if nothing is configured
  return 'gemini';
}

const program = new Command();

program
  .name('ai')
  .description('AI Agent Playground CLI')
  .version('1.0.0');

// Main agent command
program
  .command('run <agent> <query>')
  .description('Run an agent with a query')
  .option('-p, --provider <provider>', 'LLM provider')
  .option('-m, --model <model>', 'Specific model to use or tier (small/default/large)')
  .option('--system <prompt>', 'Custom system prompt')
  .action(async (agentType: string, query: string, options) => {
    try {
      // Use configured default or smart default if no provider specified
      const provider = options.provider || getDefaultProvider();
      const modelTier = options.model || config.defaultTier || 'default';
      
      console.log(info(`\n🤖 Starting ${agentType} agent...`));
      
      // Get the model using the factory
      const model = ProviderFactory.getModel(provider, modelTier);
      
      // Create the agent
      const agent = createAgent(agentType, model, {
        systemPrompt: options.system,
      });
      
      console.log(`📝 Query: "${query}"`);
      console.log(info(`🔧 Using ${provider} (${modelTier})\n`));
      
      // Execute the agent
      const result = await agent.execute({ query });
      
      if (result.success) {
        console.log(success('✅ Success!\n'));
        console.log('Response:', result.data.text);
        
        if (result.metadata?.toolCalls && result.metadata.toolCalls > 0) {
          console.log(info(`\n📊 Tools used: ${result.metadata.toolCalls}`));
        }
        
        if (result.metadata?.duration) {
          console.log(info(`⏱️  Duration: ${result.metadata.duration}ms`));
        }
      } else {
        console.error(error('❌ Error:'), result.error);
      }
    } catch (err) {
      console.error(error('❌ Fatal error:'), err);
      if (err instanceof Error && err.message.includes('API key')) {
        console.log(warning('\n💡 Tip: Make sure you have set up your .env file with the required API keys.'));
        console.log(warning('   Run "ai setup" for interactive configuration.'));
      }
      process.exit(1);
    }
  });

// List available agents
program
  .command('list-agents')
  .description('List all available agents')
  .action(() => {
    console.log(info('\n📋 Available Agents:\n'));
    Object.keys(agentRegistry).forEach(agent => {
      console.log(`  - ${agent}`);
    });
    console.log();
  });

// List available providers with more detail
program
  .command('list-providers')
  .description('List all available LLM providers and their configuration')
  .action(() => {
    console.log(info('\n📋 Available Providers:\n'));
    
    ProviderFactory.listProviders().forEach(provider => {
      const providerInfo = ProviderFactory.getProviderInfo(provider);
      console.log(`${providerInfo.name}:`);
      console.log('  Models:');
      console.log(`    Small:   ${providerInfo.models.small}`);
      console.log(`    Default: ${providerInfo.models.default}`);
      console.log(`    Large:   ${providerInfo.models.large}`);
      
      if (providerInfo.requiredEnvVars.length > 0) {
        console.log('  Required environment variables:');
        providerInfo.requiredEnvVars.forEach(envVar => {
          const isSet = !!process.env[envVar];
          const status = isSet ? success('✅') : error('❌');
          console.log(`    ${status} ${envVar}`);
        });
      }
      
      if (providerInfo.optionalEnvVars.length > 0) {
        console.log('  Optional environment variables:');
        providerInfo.optionalEnvVars.forEach(envVar => {
          const isSet = !!process.env[envVar];
          const status = isSet ? '✅' : '⚪';
          console.log(`    ${status} ${envVar}`);
        });
      }
      
      console.log();
    });
  });

// Weather agent shortcut
program
  .command('weather <location>')
  .description('Quick weather lookup (shortcut for weather agent)')
  .option('-p, --provider <provider>', 'LLM provider')
  .option('-m, --model <model>', 'Model or tier (small/default/large)')
  .action(async (location: string, options) => {
    // Use smart defaults
    const provider = options.provider || getDefaultProvider();
    const model = options.model || 'small'; // Use small model for weather by default
    
    // Reuse the main run command logic
    const args = ['', '', 'run', 'weather', `What's the weather in ${location}?`];
    args.push('--provider', provider);
    args.push('--model', model);
    await program.parseAsync(args);
  });

// Chat command for direct model interaction
program
  .command('chat <prompt>')
  .description('Chat directly with an LLM model')
  .option('-p, --provider <provider>', 'LLM provider')
  .option('-m, --model <model>', 'Model or tier (small/default/large)')
  .action(async (prompt: string, options) => {
    try {
      const provider = options.provider || getDefaultProvider();
      const modelTier = options.model || config.defaultTier || 'default';
      
      console.log(info(`\n💬 Chatting with ${provider}...\n`));
      
      const model = ProviderFactory.getModel(provider, modelTier);
      
      const result = await generateText({
        model,
        prompt,
        system: 'You are a helpful AI assistant. Be concise and friendly.',
      });
      
      console.log(result.text);
    } catch (err) {
      console.error(error('❌ Error:'), err);
      process.exit(1);
    }
  });

// Add setup command
program.addCommand(createSetupCommand());

// Add config command to show current configuration
program
  .command('config')
  .description('Show current configuration paths and settings')
  .action(() => {
    console.log(info('\n📁 Configuration Locations:\n'));
    console.log(`Config file: ${ConfigManager.getConfigPath()}`);
    console.log(`Environment file: ${ConfigManager.getEnvPath()}`);
    
    const currentConfig = ConfigManager.loadConfig();
    if (currentConfig.defaultProvider || currentConfig.defaultTier) {
      console.log('\nCurrent settings:');
      if (currentConfig.defaultProvider) {
        console.log(`  Default provider: ${currentConfig.defaultProvider}`);
      }
      if (currentConfig.defaultTier) {
        console.log(`  Default model tier: ${currentConfig.defaultTier}`);
      }
    }
    
    console.log('\nCurrent environment:');
    const providers = ProviderFactory.listProviders();
    let hasAnyKeys = false;
    providers.forEach(provider => {
      const providerInfo = ProviderFactory.getProviderInfo(provider);
      providerInfo.requiredEnvVars.forEach(envVar => {
        const value = process.env[envVar];
        if (value) {
          hasAnyKeys = true;
          console.log(`  ${success('✓')} ${envVar}: ${value.substring(0, 10)}...`);
        }
      });
    });
    
    if (!hasAnyKeys) {
      console.log(`  ${warning('No API keys configured')}`);
    }
  });

program.parse();