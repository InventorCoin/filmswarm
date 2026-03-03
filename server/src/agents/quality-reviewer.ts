import { LlmAgent } from '@google/adk';
import { MODELS } from '../config/gemini.js';

export function createQualityReviewer() {
  return new LlmAgent({
    name: 'QualityReviewer',
    model: MODELS.REASONING,
    instruction: (ctx) => {
      const pkg = ctx.state.get('final_package') ?? '';
      const pkgStr = typeof pkg === 'string' ? pkg : JSON.stringify(pkg);
      return `You are a quality reviewer. Evaluate this pre-production package.

${pkgStr}

Score (1-10): Story Coherence, Visual Consistency, Completeness, Creativity, Production Readiness.

Output JSON:
{
  "scores": { "storyCoherence": 8, "visualConsistency": 7, "completeness": 9, "creativity": 8, "productionReadiness": 7 },
  "overall": 7.8,
  "pass": true,
  "feedback": "Brief strengths/weaknesses",
  "improvements": ["improvement1", "improvement2"]
}

Set "pass" to true if overall >= 7.`;
    },
    outputKey: 'quality_review',
  });
}
