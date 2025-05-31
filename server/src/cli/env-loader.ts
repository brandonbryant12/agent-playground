import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * Load environment variables from multiple locations
 * Priority order (highest to lowest):
 * 1. Current directory .env
 * 2. ~/.config/ai/.env (primary config location)
 * 3. System environment variables
 */
export function loadEnvironment(): void {
  const locations = [
    // Current directory
    path.resolve(process.cwd(), '.env'),
    // Parent directories (up to 3 levels)
    path.resolve(process.cwd(), '..', '.env'),
    path.resolve(process.cwd(), '..', '..', '.env'),
    // Primary config location
    path.join(os.homedir(), '.config', 'ai', '.env'),
    // Legacy location for compatibility
    path.join(os.homedir(), '.env.ai-agent'),
  ];

  // Try to load from each location
  let loaded = false;
  for (const location of locations) {
    if (fs.existsSync(location)) {
      const result = dotenv.config({ path: location });
      if (!result.error) {
        console.log(`📁 Loaded environment from: ${location}`);
        loaded = true;
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
  ];

  // Check if any required keys are available
  const hasKeys = envPatterns.some(key => process.env[key]);
  
  if (!hasKeys && !loaded) {
    console.log(`
⚠️  No API keys found. You can set them in one of these ways:

1. Create a .env file in the current directory
2. Create ~/.config/ai/.env (recommended)
3. Export them in your shell:
   export OPENAI_API_KEY=your-key-here

Run 'ai setup' to configure interactively.
`);
  }
}