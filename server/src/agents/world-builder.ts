import { LlmAgent } from '@google/adk';
import { MODELS } from '../config/gemini.js';
import { generateImageTool } from '../tools/generate-image.js';

export function createWorldBuilder(location: {
  name: string;
  description: string;
  mood: string;
  visualNotes: string;
}) {
  return new LlmAgent({
    name: `WorldBuilder_${location.name.replace(/\s+/g, '_')}`,
    model: MODELS.REASONING,
    instruction: `You are a world builder / production designer for film pre-production. Design the following location:

Name: ${location.name}
Description: ${location.description}
Mood: ${location.mood}
Visual Notes: ${location.visualNotes}

Your tasks:
1. Create a detailed location design including architecture, materials, color palette, lighting conditions, and atmospheric elements.
2. Use the generate_image tool to create 1-2 concept art images:
   - A wide establishing shot of the location
   - A detail shot showing key environmental storytelling elements

For each image prompt, be EXTREMELY detailed about:
- Time of day, weather, lighting quality
- Architectural style, materials, scale
- Color palette, atmosphere, mood
- Key props and environmental details
- Camera angle and composition

Output your location design as text, referencing the generated images.`,
    tools: [generateImageTool],
    outputKey: `location_${location.name.replace(/\s+/g, '_')}`,
  });
}
