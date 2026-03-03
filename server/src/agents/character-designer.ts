import { LlmAgent } from '@google/adk';
import { MODELS } from '../config/gemini.js';
import { generateImageTool } from '../tools/generate-image.js';
import { sanitizeAgentName } from './utils.js';

export function createCharacterDesigner(character: {
  name: string;
  role: string;
  description: string;
  visualNotes: string;
}) {
  return new LlmAgent({
    name: `CharacterDesigner_${sanitizeAgentName(character.name)}`,
    model: MODELS.REASONING,
    instruction: `You are a character designer for film pre-production. Design the following character:

Name: ${character.name}
Role: ${character.role}
Description: ${character.description}
Visual Notes: ${character.visualNotes}

Your tasks:
1. Write a brief character design profile (costume, palette, distinguishing features).
2. Use the generate_image tool EXACTLY ONCE to create a single character portrait.
   - Make the prompt extremely detailed (lighting, angle, clothing, expression, background).

IMPORTANT: Call generate_image only ONCE. Do NOT generate multiple images.

After generating the image, output your final character description as plain text.`,
    tools: [generateImageTool],
    outputKey: `character_${sanitizeAgentName(character.name)}`,
  });
}
