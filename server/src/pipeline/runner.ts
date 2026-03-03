import { runDirector } from '../agents/director.js';
import { getDb } from '../config/firebase.js';
import { eventBus } from './event-bus.js';
import { resetImageCounts } from '../tools/generate-image.js';
import type { Project } from '../types.js';

export async function runPipeline(project: Project) {
  const db = getDb();
  const projectRef = db.collection('projects').doc(project.id);

  try {
    resetImageCounts();
    await projectRef.update({ status: 'running', updatedAt: Date.now() });

    const finalState = await runDirector(project.id, project.concept, project.mode);

    await projectRef.update({
      status: 'completed',
      updatedAt: Date.now(),
      artifacts: finalState,
    });
  } catch (error: any) {
    console.error(`Pipeline failed for ${project.id}:`, error);
    await projectRef.update({
      status: 'error',
      updatedAt: Date.now(),
    });
    eventBus.emit(project.id, {
      type: 'error',
      agent: 'Director',
      message: error.message ?? 'Pipeline failed',
    });
  }
}
