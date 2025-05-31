import { Command } from 'commander';
import * as readline from 'readline';
import * as fs from 'fs';
import { ConfigManager } from './config';
import { ProviderFactory } from '../providers';

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

      const config: any = {};
      const envVars: string[] = [];

      // Ask for default provider
      const providers = ProviderFactory.listProviders();
      console.log(`Available providers: ${providers.join(', ')}`);
      config.defaultProvider = await question('Default provider (openai): ') || 'openai';

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

      // Save configuration
      ConfigManager.saveConfig(config);

      // Save environment variables
      if (envVars.length > 0) {
        const envPath = ConfigManager.getEnvPath();
        const envContent = envVars.join('\n') + '\n';
        
        fs.writeFileSync(envPath, envContent);
        console.log(`\n✅ API keys saved to ${envPath}`);
      }

      console.log('\n✨ Setup complete! You can now use ai-agent commands.\n');
      console.log('Try: ai-agent run weather "What\'s the weather in Boston?"\n');

      rl.close();
    });

  return setupCommand;
}