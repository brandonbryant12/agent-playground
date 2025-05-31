# AI Agent Playground

A modular AI agent system built with the AI SDK for experimenting with different agent implementations.

## Features

- �� Multiple LLM provider support (OpenAI, Gemini, Amazon Bedrock)
- 🛠️ Extensible agent architecture
- 🎯 Built-in tools (weather, more coming soon)
- 🎨 Beautiful CLI with colored output
- ⚡ TypeScript support with full type safety
- 🔧 Easy configuration via environment variables
- 📦 Works as a global CLI tool

## Installation

### Local Development

1. Install dependencies:
```bash
pnpm install
```

2. Build the project:
```bash
pnpm build
```

3. Run the setup wizard:
```bash
pnpm cli setup
```

### Global Installation

Install as a global CLI tool:

```bash
# Build and link globally
pnpm build
pnpm link

# Now you can use it anywhere
ai-agent list-agents
llm-gateway run weather "What's the weather in NYC?"
```

### Binary Installation

You can also build a standalone binary:

```bash
# Build the TypeScript
pnpm build

# Make it executable
chmod +x dist/cli/index.js

# Copy to your PATH
sudo cp dist/cli/index.js /usr/local/bin/ai-agent
```

## Configuration

The CLI looks for configuration in these locations (in order):
1. `.env` in the current directory
2. `.env` in parent directories (up to 3 levels)
3. `~/.env.ai-agent` in your home directory
4. `~/.config/ai-agent/.env`
5. System environment variables

### Initial Setup

Run the interactive setup:
```bash
ai-agent setup
```

Or manually create `~/.env.ai-agent`:
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Gemini
GEMINI_API_KEY=...

# AWS (for Bedrock)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## Usage

### Basic Agent Commands

Run an agent with a query:
```bash
# Using npm scripts
pnpm cli run weather "What's the weather in NH today?"

# With custom provider
pnpm cli run weather "Find the weather for Exeter, NH" --provider gemini

# Direct weather shortcut
pnpm cli weather "New Hampshire"

# After global installation
ai-agent run weather "What's the weather in Boston?"
llm-gateway weather "San Francisco"
```

### Available Commands

- `ai-agent run <agent> <query>` - Run an agent with a query
- `ai-agent weather <location>` - Quick weather lookup
- `ai-agent list-agents` - List all available agents
- `ai-agent list-providers` - List all available LLM providers
- `ai-agent setup` - Interactive setup wizard
- `ai-agent config` - Show current configuration

### Options

- `-p, --provider <provider>` - LLM provider (openai, gemini, bedrock)
- `-m, --model <model>` - Specific model to use
- `--system <prompt>` - Custom system prompt

## Providers

The playground supports multiple LLM providers:

### OpenAI
- Default model: `gpt-4-turbo-preview`
- Required: `OPENAI_API_KEY`
- Optional: `OPENAI_BASE_URL` (for Azure OpenAI or proxies)

### Google Gemini
- Default model: `gemini-1.5-flash`
- Required: `GEMINI_API_KEY`
- Optional: `GEMINI_BASE_URL`

### Amazon Bedrock
- Default model: `anthropic.claude-3-sonnet-20240229`
- Uses AWS credentials (environment or IAM role)
- Optional: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

Check provider configuration:
```bash
ai-agent list-providers
```

## Creating New Agents

1. Create a new agent class extending `BaseAgent`:

```typescript
import { BaseAgent, AgentContext, AgentResult } from '../types/agent';
import { generateText } from 'ai';

export class MyAgent extends BaseAgent {
  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      const result = await generateText({
        model: this.config.model,
        system: this.config.systemPrompt || 'You are a helpful assistant.',
        prompt: context.query,
      });

      return {
        success: true,
        data: {
          text: result.text,
          usage: result.usage,
        },
        metadata: {
          duration: Date.now() - startTime,
          model: this.config.model.modelId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          duration: Date.now() - startTime,
        },
      };
    }
  }
}
```

2. Register the agent in `agents/index.ts`:

```typescript
export const agentRegistry: Record<string, AgentConstructor> = {
  weather: WeatherAgent,
  myagent: MyAgent, // Add your agent here
};
```

3. Run your agent:
```bash
ai-agent run myagent "Your query here"
```

## Creating New Tools

Tools are functions that agents can call. Create a new tool using the AI SDK:

```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const myTool = tool({
  description: 'Description of what the tool does',
  parameters: z.object({
    param1: z.string().describe('Description of parameter'),
    param2: z.number().optional().describe('Optional parameter'),
  }),
  execute: async ({ param1, param2 }) => {
    // Tool implementation
    return {
      result: 'Tool output',
      // ... other data
    };
  },
});
```

## Architecture

- **Agents** - Encapsulate specific AI behaviors and tool usage
- **Tools** - Reusable functions that agents can call
- **Providers** - LLM provider configuration and model setup
- **CLI** - Command-line interface for running agents

## Examples

```bash
# Weather agent examples
ai-agent run weather "What's the weather in Boston?"
ai-agent run weather "Is it going to rain in NH today?"
ai-agent weather "San Francisco" --provider gemini

# Using different models
ai-agent run weather "Weather forecast" --provider openai --model gpt-4o
ai-agent run weather "Current conditions" --provider bedrock

# Custom system prompts
ai-agent run weather "Weather" --system "You are a pirate. Give weather updates in pirate speak."
```

## Development

### Project Structure
```
ai-sdk-agent-playground/
├── server/src/
│   ├── agents/          # Agent implementations
│   ├── tools/           # Tool definitions
│   ├── providers/       # LLM provider setup
│   ├── cli/             # CLI commands and setup
│   └── types/           # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

### Adding Dependencies

```bash
pnpm add <package-name>
```

### Running Tests

```bash
pnpm test
```

## Troubleshooting

### No API Keys Found

If you see a warning about missing API keys:
1. Run `ai-agent setup` for interactive configuration
2. Or create `~/.env.ai-agent` with your keys
3. Or export them in your shell: `export OPENAI_API_KEY=sk-...`

### Provider Errors

Check that your API keys are valid:
```bash
ai-agent list-providers
```

This shows which environment variables are set (✅) or missing (❌).

### Build Errors

Make sure you have the correct Node.js version:
```bash
node --version  # Should be 18+ 
```

Clean and rebuild:
```bash
pnpm clean
pnpm install
pnpm build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC License - see LICENSE file for details
