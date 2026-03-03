import { Router } from 'express';
import { resolveCheckpoint, hasCheckpoint } from '../pipeline/checkpoint.js';

export const interactRouter = Router();

// Resolve a checkpoint (user decision at a pause point)
interactRouter.post('/:projectId/checkpoint', (req, res) => {
  const { projectId } = req.params;
  const { phase, decision } = req.body as { phase: string; decision: string };

  if (!phase || !decision) {
    res.status(400).json({ error: 'phase and decision are required' });
    return;
  }

  if (!hasCheckpoint(projectId, phase)) {
    res.status(404).json({ error: 'No pending checkpoint for this phase' });
    return;
  }

  const resolved = resolveCheckpoint(projectId, phase, decision);
  res.json({ resolved });
});
