import { Command } from 'commander';
import * as readline from 'readline';
import * as fs from 'fs';
import { ConfigManager } from './config.js';
import { ProviderFactory, PROVIDER_MODELS } from '../providers/index.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

export function createSetupCommand(): Command {
  const setupCommand = new Command('setup');
  
  setupCommand
    .description('Interactive setup for AI Agent configuration')
    .action(async () => {
      console.log('\n🚀 AI Agent Setup Wizard\n');
      console.log('This will help you configure your API keys and preferences.\n');
      console.log(`Configuration will be saved to: ${ConfigManager.getEnvPath()}\n`);

      const config: any = {};
      const envVars: string[] = [];

      // Ask for default provider
      const providers = ProviderFactory.listProviders();
      console.log(`Available providers: ${providers.join(', ')}`);
      config.defaultProvider = await question('Default provider (openai): ') || 'openai';

      // Ask for default model tier
      console.log('\nModel tiers: small (fast/cheap), default (balanced), large (powerful/expensive)');
      config.defaultTier = await question('Default model tier (default): ') || 'default';

      // Show what models will be used
      const providerInfo = ProviderFactory.getProviderInfo(config.defaultProvider);
      console.log(`\nWith ${config.defaultProvider} and tier '${config.defaultTier}', you'll use:`);
      console.log(`  Model: ${providerInfo.models[config.defaultTier as keyof typeof providerInfo.models]}`);

      // Ask for API keys based on provider
      if (config.defaultProvider === 'openai' || await question('\nSet up OpenAI? (y/N): ') === 'y') {
        const apiKey = await question('OpenAI API key: ');
        if (apiKey) {
          envVars.push(`OPENAI_API_KEY=${apiKey}`);
        }
      }

      if (config.defaultProvider === 'gemini' || await question('\nSet up Gemini? (y/N): ') === 'y') {
        const apiKey = await question('Gemini API key: ');
        if (apiKey) {
          envVars.push(`GEMINI_API_KEY=${apiKey}`);
        }
      }

      // Note about Bedrock - no setup needed
      if (config.defaultProvider === 'bedrock') {
        console.log('\nBedrock provider selected. No API keys needed - uses placeholder credentials.');
      }

      // Save configuration
      ConfigManager.saveConfig(config);

      // Save environment variables
      if (envVars.length > 0) {
        const envPath = ConfigManager.getEnvPath();
        const envContent = envVars.join('\n') + '\n';
        
        // Ensure directory exists
        ConfigManager.ensureConfigDir();
        
        fs.writeFileSync(envPath, envContent);
        console.log(`\n✅ API keys saved to ${envPath}`);
      }

      console.log('\n✨ Setup complete! You can now use ai commands.\n');
      console.log('Try these commands:');
      console.log('  ai run weather "What\'s the weather in Boston?"');
      console.log('  ai chat "Hello, how are you?"');
      console.log('  ai list-providers\n');

      rl.close();
    });

  return setupCommand;
}