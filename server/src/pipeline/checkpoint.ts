import { eventBus } from './event-bus.js';

type CheckpointResolver = (decision: string) => void;

const pendingCheckpoints = new Map<string, CheckpointResolver>();

export function checkpointKey(projectId: string, phase: string) {
  return `${projectId}:${phase}`;
}

export async function waitForCheckpoint(
  projectId: string,
  phase: string,
  prompt: string,
  options?: string[]
): Promise<string> {
  eventBus.emit(projectId, {
    type: 'checkpoint_reached',
    phase,
    prompt,
    options,
  });

  return new Promise<string>((resolve) => {
    pendingCheckpoints.set(checkpointKey(projectId, phase), resolve);
  });
}

export function resolveCheckpoint(projectId: string, phase: string, decision: string): boolean {
  const key = checkpointKey(projectId, phase);
  const resolver = pendingCheckpoints.get(key);
  if (!resolver) return false;

  resolver(decision);
  pendingCheckpoints.delete(key);

  eventBus.emit(projectId, {
    type: 'checkpoint_resolved',
    phase,
    decision,
  });

  return true;
}

export function hasCheckpoint(projectId: string, phase: string): boolean {
  return pendingCheckpoints.has(checkpointKey(projectId, phase));
}
