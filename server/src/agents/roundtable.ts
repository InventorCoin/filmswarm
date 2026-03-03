import { getGenAI, MODELS } from '../config/gemini.js';
import { eventBus } from '../pipeline/event-bus.js';

interface RoundtableConfig {
  topic: string;
  panelists: { name: string; perspective: string }[];
  context: string;
  maxRounds: number;
  projectId: string;
}

export async function runRoundtable(config: RoundtableConfig): Promise<string> {
  const { topic, panelists, context, maxRounds, projectId } = config;

  eventBus.emit(projectId, {
    type: 'roundtable_started',
    topic,
    agents: panelists.map((p) => p.name),
  });

  const genai = getGenAI();
  const discussion: string[] = [];

  for (let round = 1; round <= maxRounds; round++) {
    for (const panelist of panelists) {
      const prompt =
        round === 1
          ? `You are ${panelist.name}, a film production expert focused on ${panelist.perspective}.

Topic for discussion: ${topic}

Context:
${context}

Share your perspective on this creative decision. Be specific, opinionated, and constructive. Keep it to 2-3 paragraphs. Reference specific story elements.`
          : `You are ${panelist.name}, focused on ${panelist.perspective}.

Topic: ${topic}

Previous discussion:
${discussion.join('\n\n')}

Respond to what others have said. Build on good ideas, push back where you disagree. Suggest a concrete direction forward. Keep it to 1-2 paragraphs.`;

      const response = await genai.models.generateContent({
        model: MODELS.REASONING,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const message = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      discussion.push(`**${panelist.name}** (Round ${round}):\n${message}`);

      eventBus.emit(projectId, {
        type: 'roundtable_message',
        agent: panelist.name,
        message,
        round,
      });
    }
  }

  // Synthesize conclusion
  const synthesisPrompt = `You are the Director synthesizing a creative roundtable discussion.

Topic: ${topic}

Full discussion:
${discussion.join('\n\n')}

Provide a clear decision/direction based on this discussion. Be decisive. Format as:
DECISION: [1-2 sentence clear decision]
RATIONALE: [Why this direction was chosen]
ACTION ITEMS: [Specific things each agent should implement]`;

  const synthesis = await genai.models.generateContent({
    model: MODELS.REASONING,
    contents: [{ role: 'user', parts: [{ text: synthesisPrompt }] }],
  });

  const decision = synthesis.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  eventBus.emit(projectId, {
    type: 'roundtable_concluded',
    decision,
  });

  return decision;
}
