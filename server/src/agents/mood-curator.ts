import { LlmAgent } from '@google/adk';
import { MODELS } from '../config/gemini.js';
import { generateImageTool } from '../tools/generate-image.js';

export function createMoodCurator() {
  return new LlmAgent({
    name: 'MoodCurator',
    model: MODELS.REASONING,
    instruction: (ctx) => {
      const brief = ctx.state.get('creative_brief') ?? '';
      const story = ctx.state.get('story_structure') ?? '';
      const briefStr = typeof brief === 'string' ? brief : JSON.stringify(brief);
      const storyStr = typeof story === 'string' ? story : JSON.stringify(story);
      return `You are a mood curator / visual director for film pre-production. Create a cohesive visual identity.

Creative Brief:
${briefStr}

Story Structure:
${storyStr}

Tasks:
1. Define overall color palette (primary, secondary, accent colors with hex codes)
2. Establish visual tone (lighting style, contrast, saturation)
3. Reference cinematic influences
4. Use generate_image tool to create 2-3 mood board images:
   - Overall film mood/atmosphere
   - Key emotional contrast
   - A signature visual moment

Output a comprehensive visual style guide referencing the mood board images.`;
    },
    tools: [generateImageTool],
    outputKey: 'mood_board',
  });
}
