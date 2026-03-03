import { LlmAgent } from '@google/adk';
import { MODELS } from '../config/gemini.js';
import { generateImageTool } from '../tools/generate-image.js';

export function createCharacterDesigner(character: {
  name: string;
  role: string;
  description: string;
  visualNotes: string;
}) {
  return new LlmAgent({
    name: `CharacterDesigner_${character.name.replace(/\s+/g, '_')}`,
    model: MODELS.REASONING,
    instruction: `You are a character designer for film pre-production. Design the following character:

Name: ${character.name}
Role: ${character.role}
Description: ${character.description}
Visual Notes: ${character.visualNotes}

Your tasks:
1. Create a detailed character design profile including costume, color palette, distinguishing features, and visual motifs.
2. Use the generate_image tool to create 1-2 images:
   - A character portrait (close-up, showing face and key costume details)
   - A full-body character design sheet (if the character is important enough)

For each image prompt, be EXTREMELY detailed about:
- Lighting, camera angle, art style
- Specific clothing, accessories, colors
- Facial features, expression, body language
- Background context

Output your character design as text, referencing the generated images.`,
    tools: [generateImageTool],
    outputKey: `character_${character.name.replace(/\s+/g, '_')}`,
  });
}
