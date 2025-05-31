# AI Agent Playground

A modular AI agent system built with the AI SDK for experimenting with different agent implementations.

## Features

- 🤖 Multiple LLM provider support (OpenAI, Gemini, Amazon Bedrock)
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
ai list-agents
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
sudo cp dist/cli/index.js /usr/local/bin/ai
```

## Configuration

The CLI looks for configuration in these locations (in order):
1. `.env` in the current directory
2. `.env` in parent directories (up to 3 levels)
3. `~/.config/ai/.env` (recommended primary location)
4. System environment variables

### Default Provider Selection

The CLI intelligently selects a default provider:
1. Uses the saved default from `~/.config/ai/config.json` if set
2. Otherwise, uses the first provider with configured API keys
3. Falls back to Gemini if no providers are configured

### Initial Setup

Run the interactive setup:
```bash
ai setup
```

Or manually create `~/.config/ai/.env`:
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Gemini
GEMINI_API_KEY=...

# Bedrock uses placeholder credentials - no setup needed
```

## Usage

### Model Tiers

Each provider supports three model tiers:
- **small**: Fast and cost-effective (e.g., gpt-3.5-turbo)
- **default**: Balanced performance (e.g., gpt-4-turbo-preview)
- **large**: Most capable models (e.g., gpt-4o)

Use tiers with the `-m` flag:
```bash
ai run weather "Weather?" -m small  # Quick, cheap response
ai run weather "Weather?" -m large  # Best quality response
```

### Basic Agent Commands

Run an agent with a query:
```bash
# Using npm scripts (local development)
pnpm cli run weather "What's the weather in NH today?"

# After global installation
ai run weather "What's the weather in Boston?"
ai weather "San Francisco"
llm-gateway weather "NYC"  # Alternative command
```

### Available Commands

- `ai run <agent> <query>` - Run an agent with a query
- `ai chat <prompt>` - Chat directly with an LLM
- `ai weather <location>` - Quick weather lookup
- `ai list-agents` - List all available agents
- `ai list-providers` - List all available LLM providers and models
- `ai setup` - Interactive setup wizard
- `ai config` - Show current configuration

### Options

- `-p, --provider <provider>` - LLM provider (openai, gemini, bedrock)
- `-m, --model <model>` - Model or tier (small/default/large)
- `--system <prompt>` - Custom system prompt

## Providers

The playground supports multiple LLM providers:

### OpenAI
- Small model: `gpt-3.5-turbo`
- Default model: `gpt-4-turbo-preview`
- Large model: `gpt-4o`
- Required: `OPENAI_API_KEY`
- Optional: `OPENAI_BASE_URL` (for Azure OpenAI or proxies)

### Google Gemini
- Small model: `gemini-1.5-flash`
- Default model: `gemini-1.5-pro`
- Large model: `gemini-1.5-pro`
- Required: `GEMINI_API_KEY`
- Optional: `GEMINI_BASE_URL`

### Amazon Bedrock
- Small model: `anthropic.claude-3-haiku-20240307`
- Default model: `anthropic.claude-3-sonnet-20240229`
- Large model: `anthropic.claude-3-opus-20240229`
- No API keys needed - uses placeholder credentials
- Optional: `BEDROCK_BASE_URL` for custom endpoints

Check provider configuration:
```bash
ai list-providers
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
ai run myagent "Your query here"
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
ai run weather "What's the weather in Boston?"
ai run weather "Is it going to rain in NH today?"
ai weather "San Francisco" --provider gemini

# Using different models
ai run weather "Weather forecast" --provider openai --model gpt-4o
ai run weather "Current conditions" --provider bedrock

# Using model tiers
ai chat "Explain quantum computing" -m large  # Use most capable model
ai weather "NYC" -m small                     # Use fast/cheap model

# Custom system prompts
ai run weather "Weather" --system "You are a pirate. Give weather updates in pirate speak."
```Give weather updates in pirate speak."
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
2. Or create `~/.config/ai/.env` with your keys
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