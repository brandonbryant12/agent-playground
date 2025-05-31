import { tool } from 'ai';
import { z } from 'zod';

// Simple weather fetching without API key for demo
// In production, use proper API with authentication
export const weatherTool = tool({
  description: 'Get current weather for a location',
  parameters: z.object({
    location: z.string().describe('The city and state, e.g. San Francisco, CA'),
  }),
  execute: async ({ location }) => {
    try {
      // For demo purposes, return mock data
      // In production, replace with actual API call:
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}`);
      
      // Mock weather data
      const mockWeatherData: Record<string, any> = {
        'Exeter, NH': {
          temperature: 45,
          conditions: 'Partly cloudy',
          humidity: 65,
          windSpeed: 12,
        },
        'New Hampshire': {
          temperature: 42,
          conditions: 'Clear',
          humidity: 70,
          windSpeed: 8,
        },
        default: {
          temperature: 50,
          conditions: 'Sunny',
          humidity: 60,
          windSpeed: 10,
        },
      };

      const weatherData = mockWeatherData[location] || mockWeatherData.default;

      return {
        location,
        temperature: weatherData.temperature,
        conditions: weatherData.conditions,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        unit: 'fahrenheit',
      };
    } catch (error) {
      throw new Error(`Failed to fetch weather for ${location}: ${error}`);
    }
  },
});