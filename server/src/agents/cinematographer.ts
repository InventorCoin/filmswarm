import { LlmAgent } from '@google/adk';
import { MODELS } from '../config/gemini.js';
import { generateImageTool } from '../tools/generate-image.js';

export function createCinematographer() {
  return new LlmAgent({
    name: 'Cinematographer',
    model: MODELS.REASONING,
    instruction: (ctx) => {
      const story = ctx.state.get('story_structure') ?? '';
      const mood = ctx.state.get('mood_board') ?? '';
      const storyStr = typeof story === 'string' ? story : JSON.stringify(story);
      const moodStr = typeof mood === 'string' ? mood : JSON.stringify(mood);
      return `You are a cinematographer / storyboard artist for film pre-production.

Story Structure:
${storyStr}

Visual Style Guide:
${moodStr}

Tasks:
1. Create a shot list for 3-4 key scenes (shot type, camera, lens, lighting).
2. Use generate_image tool EXACTLY TWICE for the 2 most cinematic storyboard frames.
   - Be detailed about framing, angle, lighting, characters, palette.

IMPORTANT: Call generate_image exactly 2 times. No more.

Output a shot list with storyboard references.`;
    },
    tools: [generateImageTool],
    outputKey: 'cinematography',
  });
}
