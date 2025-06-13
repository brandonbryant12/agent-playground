export type RegisteredTool = any;

export const toolRegistry: Record<string, RegisteredTool> = {};

export function registerTool(name: string, tool: RegisteredTool): void {
  toolRegistry[name] = tool;
}

export function getTool(name: string): RegisteredTool | undefined {
  return toolRegistry[name];
}

export function getTools(names: string[]): Record<string, RegisteredTool> {
  const result: Record<string, RegisteredTool> = {};
  for (const name of names) {
    const t = getTool(name);
    if (t) {
      result[name] = t;
    }
  }
  return result;
}
