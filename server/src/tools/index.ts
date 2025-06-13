export * from './weather.js';
export * from './registry.js';

// Register built-in tools
import { registerTool } from './registry.js';
import { weatherTool } from './weather.js';

registerTool('weather', weatherTool);
