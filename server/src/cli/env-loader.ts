import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * Load environment variables from multiple locations
 * Priority order (highest to lowest):
 * 1. Current directory .env
 * 2. User's home directory .env.ai-agent
 * 3. System environment variables
 */
export function loadEnvironment(): void {
  const locations = [
    // Current directory
    path.resolve(process.cwd(), '.env'),
    // Parent directories (up to 3 levels)
    path.resolve(process.cwd(), '..', '.env'),
    path.resolve(process.cwd(), '..', '..', '.env'),
    // User's home directory
    path.join(os.homedir(), '.env.ai-agent'),
    // Global config directory
    path.join(os.homedir(), '.config', 'ai-agent', '.env'),
  ];

  // Try to load from each location
  for (const location of locations) {
    if (fs.existsSync(location)) {
      const result = dotenv.config({ path: location });
      if (!result.error) {
        console.log(`📁 Loaded environment from: ${location}`);
        break;
      }
    }
  }

  // Also load from shell environment
  // Common AI API key patterns
  const envPatterns = [
    'OPENAI_API_KEY',
    'GEMINI_API_KEY',
    'ANTHROPIC_API_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
  ];

  // Check if any required keys are available
  const hasKeys = envPatterns.some(key => process.env[key]);
  
  if (!hasKeys) {
    console.log(`
⚠️  No API keys found. You can set them in one of these ways:

1. Create a .env file in the current directory
2. Create ~/.env.ai-agent in your home directory
3. Export them in your shell:
   export OPENAI_API_KEY=your-key-here

Run 'ai-agent list-providers' to see which keys are needed.
`);
  }
}