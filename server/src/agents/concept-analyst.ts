import { LlmAgent } from '@google/adk';
import { MODELS } from '../config/gemini.js';

export function createConceptAnalyst() {
  return new LlmAgent({
    name: 'ConceptAnalyst',
    model: MODELS.REASONING,
    instruction: `You are a film concept analyst. Given a user's film concept (text or description), produce a creative brief.

Your output MUST be valid JSON with this exact structure:
{
  "genre": "primary genre (e.g. 'sci-fi thriller')",
  "tone": "emotional tone (e.g. 'dark and suspenseful with moments of wonder')",
  "themes": ["theme1", "theme2", "theme3"],
  "scope": "short | feature | series",
  "targetAudience": "target demographic",
  "visualStyle": "visual/cinematic style reference (e.g. 'Blade Runner meets Wes Anderson')",
  "summary": "2-3 sentence refined summary of the concept"
}

Be creative but grounded. Identify the strongest elements of the concept and amplify them. If the concept is vague, make bold creative choices.`,
    outputKey: 'creative_brief',
  });
}
