import { LlmAgent } from '@google/adk';
import { MODELS } from '../config/gemini.js';

export function createStoryArchitect() {
  return new LlmAgent({
    name: 'StoryArchitect',
    model: MODELS.REASONING,
    instruction: (ctx) => {
      const brief = ctx.state.get('creative_brief') ?? '';
      const briefStr = typeof brief === 'string' ? brief : JSON.stringify(brief);
      return `You are a master story architect. Develop a complete story structure based on this creative brief:

${briefStr}

Your output MUST be valid JSON with this exact structure:
{
  "logline": "One-sentence hook (max 30 words)",
  "synopsis": "3-5 paragraph story synopsis",
  "characters": [
    {
      "name": "Character name",
      "role": "protagonist | antagonist | mentor | ally | love_interest | comic_relief",
      "description": "Physical and personality description",
      "arc": "Character transformation journey",
      "visualNotes": "Key visual details for the character designer"
    }
  ],
  "locations": [
    {
      "name": "Location name",
      "description": "Detailed location description",
      "mood": "Emotional quality of the space",
      "visualNotes": "Key visual details for the world builder"
    }
  ],
  "keyScenes": [
    {
      "number": 1,
      "title": "Scene title",
      "location": "Location name (must match a location above)",
      "characters": ["Character names involved"],
      "description": "What happens in this scene",
      "emotionalBeat": "The emotional trajectory of this scene"
    }
  ],
  "themes": ["Thematic elements woven throughout"]
}

Create 3-6 characters, 3-5 locations, and 5-8 key scenes.`;
    },
    outputKey: 'story_structure',
  });
}
