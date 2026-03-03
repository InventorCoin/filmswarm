import { FunctionTool, type ToolContext } from '@google/adk';
import { getDb } from '../config/firebase.js';

async function executeStoreArtifact(
  input: { key: string; data: string },
  toolContext?: ToolContext
): Promise<{ success: boolean }> {
  const projectId = (toolContext?.state?.get?.('projectId') ?? 'unknown') as string;
  const db = getDb();

  const parsed = JSON.parse(input.data);
  await db
    .collection('projects')
    .doc(projectId)
    .update({
      [`artifacts.${input.key}`]: parsed,
      updatedAt: Date.now(),
    });

  return { success: true };
}

export const storeArtifactTool = new FunctionTool({
  name: 'store_artifact',
  description: 'Save a creative artifact (story, character profile, etc.) to the project.',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'Artifact key (e.g. "creative_brief", "story_structure")',
      },
      data: {
        type: 'string',
        description: 'JSON string of the artifact data to store',
      },
    },
    required: ['key', 'data'],
  } as any,
  execute: executeStoreArtifact as any,
});
