import { Router } from 'express';
import { eventBus } from '../pipeline/event-bus.js';
import type { SwarmEvent } from '../types.js';

export const streamRouter = Router();

streamRouter.get('/:projectId', (req, res) => {
  const { projectId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected', projectId })}\n\n`);

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
