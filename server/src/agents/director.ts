import { InMemoryRunner, ParallelAgent } from '@google/adk';
import { eventBus } from '../pipeline/event-bus.js';
import { waitForCheckpoint } from '../pipeline/checkpoint.js';
import { createConceptAnalyst } from './concept-analyst.js';
import { createStoryArchitect } from './story-architect.js';
import { createCharacterDesigner } from './character-designer.js';
import { createWorldBuilder } from './world-builder.js';
import { createMoodCurator } from './mood-curator.js';
import { createCinematographer } from './cinematographer.js';
import { createProductionCompiler } from './production-compiler.js';
import { createQualityReviewer } from './quality-reviewer.js';
import { runRoundtable } from './roundtable.js';
import type { InteractionMode, StoryStructure } from '../types.js';

/**
 * Director orchestrates the entire pipeline.
 * Not a BaseAgent — it's a plain async function that spawns sub-agents via InMemoryRunner.
 */
export async function runDirector(
  projectId: string,
  concept: string,
  mode: InteractionMode
) {
  const state: Record<string, unknown> = {
    concept,
    mode,
    projectId,
  };

  const startTime = Date.now();

  function emitSpawn(agent: string, role: string) {
    eventBus.emit(projectId, { type: 'agent_spawned', agent, parent: 'Director', role });
  }
  function emitStarted(agent: string, phase: string) {
    eventBus.emit(projectId, { type: 'agent_started', agent, phase });
  }
  function emitCompleted(agent: string, summary: string) {
    eventBus.emit(projectId, { type: 'agent_completed', agent, duration: Date.now() - startTime, summary });
  }
  function emitThinking(agent: string, text: string) {
    eventBus.emit(projectId, { type: 'agent_thinking', agent, text });
  }

  async function checkpoint(phase: string, prompt: string, options?: string[]) {
    if (mode === 'auto-pilot') return 'continue';
    return waitForCheckpoint(projectId, phase, prompt, options);
  }

  /**
   * Run a sub-agent with shared state.
   * Creates an InMemoryRunner, runs the agent, and merges output state back.
   */
  async function runAgent(agent: any, message: string) {
    const runner = new InMemoryRunner({ agent, appName: 'filmswarm' });

    const session = await runner.sessionService.createSession({
      appName: 'filmswarm',
      userId: projectId,
      state: { ...state },
    });

    const run = runner.runAsync({
      userId: projectId,
      sessionId: session.id,
      newMessage: { role: 'user', parts: [{ text: message }] },
    });

    for await (const event of run) {
      if (event.content?.parts) {
        for (const part of event.content.parts as any[]) {
          if (part.text && event.author) {
            emitThinking(event.author, part.text);
          }
        }
      }
    }

    // Merge output state
    const updated = await runner.sessionService.getSession({
      appName: 'filmswarm',
      userId: projectId,
      sessionId: session.id,
    });
    if (updated?.state) {
      for (const [k, v] of Object.entries(updated.state)) {
        if (v !== undefined && v !== null) {
          state[k] = v;
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 1: CONCEPT ANALYSIS
  // ═══════════════════════════════════════════════════════════
  emitStarted('Director', 'concept_analysis');
  emitSpawn('ConceptAnalyst', 'Analyzes the film concept');
  emitStarted('ConceptAnalyst', 'concept_analysis');

  await runAgent(createConceptAnalyst(), concept);
  emitCompleted('ConceptAnalyst', 'Creative brief generated');

  if (mode === 'collaborate') {
    const brief = state['creative_brief'] ?? '';
    await checkpoint(
      'concept_review',
      `Creative brief ready:\n\n${typeof brief === 'string' ? brief : JSON.stringify(brief, null, 2)}`,
      ['Looks good, continue', 'Adjust tone', 'Adjust genre', 'Start over']
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: STORY DEVELOPMENT
  // ═══════════════════════════════════════════════════════════
  emitStarted('Director', 'story_development');
  emitSpawn('StoryArchitect', 'Develops story structure');
  emitStarted('StoryArchitect', 'story_development');

  await runAgent(createStoryArchitect(), 'Develop the full story structure based on the creative brief.');
  emitCompleted('StoryArchitect', 'Story structure complete');

  // Roundtable: Story tone
  emitSpawn('Roundtable_StoryTone', 'Deliberating on story direction');
  const storyDecision = await runRoundtable({
    topic: 'Story Tone and Direction',
    panelists: [
      { name: 'Director', perspective: 'overall vision and audience impact' },
      { name: 'StoryArchitect', perspective: 'narrative structure and pacing' },
    ],
    context: `Creative Brief: ${JSON.stringify(state['creative_brief'])}\n\nStory: ${JSON.stringify(state['story_structure'])}`,
    maxRounds: 2,
    projectId,
  });
  state['roundtable_story_tone'] = storyDecision;

  if (mode === 'collaborate') {
    await checkpoint(
      'story_review',
      'Story structure and roundtable complete. Ready for visual production.',
      ['Proceed to visuals', 'Revise story', 'Change characters']
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: CREATIVE PRODUCTION (Dynamic Spawn!)
  // ═══════════════════════════════════════════════════════════
  emitStarted('Director', 'creative_production');

  let story: StoryStructure;
  try {
    const raw = state['story_structure'];
    story = typeof raw === 'string' ? JSON.parse(raw) : (raw as StoryStructure);
  } catch {
    story = { logline: '', synopsis: '', characters: [], locations: [], keyScenes: [], themes: [] };
  }

  // Dynamically spawn character designers
  const characterAgents = (story.characters ?? []).map((char) => {
    const agent = createCharacterDesigner(char);
    emitSpawn(agent.name, `Designing character: ${char.name}`);
    return agent;
  });

  // Dynamically spawn world builders
  const worldAgents = (story.locations ?? []).map((loc) => {
    const agent = createWorldBuilder(loc);
    emitSpawn(agent.name, `Building location: ${loc.name}`);
    return agent;
  });

  // Mood curator
  const moodCurator = createMoodCurator();
  emitSpawn('MoodCurator', 'Curating visual mood and palette');

  // All visual agents in parallel
  const allVisual = [...characterAgents, ...worldAgents, moodCurator];
  const parallelSwarm = new ParallelAgent({
    name: 'CreativeProduction',
    subAgents: allVisual,
  });

  for (const a of allVisual) {
    emitStarted(a.name, 'creative_production');
  }

  await runAgent(parallelSwarm, 'Create all visual assets for the film.');

  for (const a of allVisual) {
    emitCompleted(a.name, `${a.name} design complete`);
  }

  // Roundtable: Visual coherence
  const panelists = [
    { name: 'MoodCurator', perspective: 'color palette and visual consistency' },
    { name: 'Director', perspective: 'overall creative vision alignment' },
  ];
  if (characterAgents.length > 0) {
    panelists.push({ name: characterAgents[0].name, perspective: 'character design harmony' });
  }

  emitSpawn('Roundtable_VisualCoherence', 'Checking visual consistency');
  const visualDecision = await runRoundtable({
    topic: 'Visual Coherence Check',
    panelists,
    context: `Mood Board: ${JSON.stringify(state['mood_board'])}\nAll character and world designs are complete.`,
    maxRounds: 2,
    projectId,
  });
  state['roundtable_visual_coherence'] = visualDecision;

  if (mode === 'collaborate') {
    await checkpoint(
      'visual_review',
      'All visuals complete. Review before cinematography.',
      ['Proceed to cinematography', 'Regenerate images', 'Adjust style']
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 4: CINEMATOGRAPHY
  // ═══════════════════════════════════════════════════════════
  emitStarted('Director', 'cinematography');
  emitSpawn('Cinematographer', 'Creating shot list and storyboards');
  emitStarted('Cinematographer', 'cinematography');

  await runAgent(createCinematographer(), 'Create shot list and storyboard frames.');
  emitCompleted('Cinematographer', 'Shot list and storyboards complete');

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: COMPILATION + QUALITY
  // ═══════════════════════════════════════════════════════════
  emitStarted('Director', 'compilation');
  emitSpawn('ProductionCompiler', 'Assembling final package');

  await runAgent(createProductionCompiler(), 'Compile the final pre-production package.');
  emitCompleted('ProductionCompiler', 'Package compiled');

  emitSpawn('QualityReviewer', 'Reviewing quality');
  await runAgent(createQualityReviewer(), 'Review the final package quality.');
  emitCompleted('QualityReviewer', 'Quality review complete');

  // ═══════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════
  eventBus.emit(projectId, { type: 'pipeline_completed', projectId });

  return state;
}
