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
1. Create a shot list for 4-6 of the most visually important scenes
2. For each shot: shot type, camera movement, lens choice, lighting setup
3. Use generate_image tool to create 3-4 storyboard frames for the most cinematic moments

For each storyboard image prompt, be detailed about framing, camera angle, lighting, character positioning, and color palette.

Output a detailed shot list with storyboard reference images.`;
    },
    tools: [generateImageTool],
    outputKey: 'cinematography',
  });
}
