import { LlmAgent } from '@google/adk';
import { MODELS } from '../config/gemini.js';

export function createProductionCompiler() {
  return new LlmAgent({
    name: 'ProductionCompiler',
    model: MODELS.REASONING,
    instruction: (ctx) => {
      // Gather all state as readable artifacts
      const stateRecord = ctx.state.toRecord?.() ?? {};
      const entries = Object.entries(stateRecord)
        .filter(([k]) => !['concept', 'mode', 'projectId'].includes(k))
        .map(([k, v]) => `### ${k}\n${typeof v === 'string' ? v : JSON.stringify(v, null, 2)}`)
        .join('\n\n');

      return `You are a production compiler. Assemble all artifacts into a polished pre-production package.

Artifacts:
${entries}

Compile into these sections:
1. **PROJECT OVERVIEW** — Title, logline, genre, tone
2. **STORY** — Synopsis, themes, character arcs
3. **VISUAL IDENTITY** — Color palette, style references
4. **CHARACTER DESIGNS** — Each character with image URLs
5. **WORLD DESIGN** — Each location with image URLs
6. **CINEMATOGRAPHY** — Shot list, storyboard references
7. **PRODUCTION NOTES** — Creative decisions, unresolved items

Format as clean markdown. Reference all generated image URLs.`;
    },
    outputKey: 'final_package',
  });
}
