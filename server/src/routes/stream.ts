import { Router } from 'express';
import { eventBus } from '../pipeline/event-bus.js';
import { getDb } from '../config/firebase.js';
import type { SwarmEvent } from '../types.js';

export const streamRouter = Router();

streamRouter.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected', projectId })}\n\n`);

  // Replay cached events so reconnecting clients get caught up
  const history = eventBus.getHistory(projectId);
  for (const event of history) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  // If project already completed/errored, send terminal event
  try {
    const doc = await getDb().collection('projects').doc(projectId).get();
    const status = doc.data()?.status;
    if (status === 'completed') {
      res.write(`data: ${JSON.stringify({ type: 'pipeline_completed', projectId })}\n\n`);
    } else if (status === 'error') {
      res.write(`data: ${JSON.stringify({ type: 'error', agent: 'Director', message: 'Pipeline failed' })}\n\n`);
    }
  } catch {
    // ignore db errors — live events will still work
  }

  const unsubscribe = eventBus.subscribe(projectId, (event: SwarmEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  // Heartbeat every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  req.on('close', () => {
    unsubscribe();
    clearInterval(heartbeat);
  });
});
