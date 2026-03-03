import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../config/firebase.js';
import type { InteractionMode, Project } from '../types.js';
import { runPipeline } from '../pipeline/runner.js';

export const projectRouter = Router();

projectRouter.post('/', async (req, res) => {
  try {
    const { concept, mode = 'collaborate' } = req.body as {
      concept: string;
      mode?: InteractionMode;
    };

    if (!concept?.trim()) {
      res.status(400).json({ error: 'concept is required' });
      return;
    }

    const project: Project = {
      id: uuid(),
      concept: concept.trim(),
      mode,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      artifacts: {},
    };

    await getDb().collection('projects').doc(project.id).set(project);

    // Fire pipeline in background (don't await)
    runPipeline(project).catch((err) => {
      console.error(`Pipeline error for ${project.id}:`, err);
    });

    res.json({ projectId: project.id });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

projectRouter.get('/:id', async (req, res) => {
  try {
    const doc = await getDb().collection('projects').doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(doc.data());
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Failed to get project' });
  }
});
