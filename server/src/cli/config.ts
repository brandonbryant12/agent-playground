import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface GlobalConfig {
  defaultProvider?: string;
  defaultModel?: string;
  apiKeys?: {
    openai?: string;
    gemini?: string;
    anthropic?: string;
  };
}

const CONFIG_DIR = path.join(os.homedir(), '.config', 'ai-agent');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export class ConfigManager {
  static ensureConfigDir(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  static loadConfig(): GlobalConfig {
    this.ensureConfigDir();
    
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(content);
      } catch (error) {
        console.error('Error reading config file:', error);
        return {};
      }
    }
    
    return {};
  }

  static saveConfig(config: GlobalConfig): void {
    this.ensureConfigDir();
    
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      console.log(`✅ Configuration saved to ${CONFIG_FILE}`);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  static getConfigPath(): string {
    return CONFIG_FILE;
  }

  static getEnvPath(): string {
    return path.join(os.homedir(), '.env.ai-agent');
  }
}