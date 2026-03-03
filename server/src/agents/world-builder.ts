import { LlmAgent } from '@google/adk';
import { MODELS } from '../config/gemini.js';
import { generateImageTool } from '../tools/generate-image.js';
import { sanitizeAgentName } from './utils.js';

export function createWorldBuilder(location: {
  name: string;
  description: string;
  mood: string;
  visualNotes: string;
}) {
  return new LlmAgent({
    name: `WorldBuilder_${sanitizeAgentName(location.name)}`,
    model: MODELS.REASONING,
    instruction: `You are a world builder / production designer for film pre-production. Design the following location:

Name: ${location.name}
Description: ${location.description}
Mood: ${location.mood}
Visual Notes: ${location.visualNotes}

Your tasks:
1. Write a brief location design (architecture, materials, lighting, atmosphere).
2. Use the generate_image tool EXACTLY ONCE to create a single establishing shot.
   - Make the prompt extremely detailed (time of day, weather, architecture, mood, camera angle).

IMPORTANT: Call generate_image only ONCE. Do NOT generate multiple images.

After generating the image, output your final location description as plain text.`,
    tools: [generateImageTool],
    outputKey: `location_${sanitizeAgentName(location.name)}`,
  });
}
