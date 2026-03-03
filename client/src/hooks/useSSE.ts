import { useEffect, useRef } from 'react';
import { useProjectStore } from '../stores/project-store';

export function useSSE(projectId: string | null) {
  const esRef = useRef<EventSource | null>(null);
  const store = useProjectStore();

  useEffect(() => {
    if (!projectId) return;

    const es = new EventSource(`/api/stream/${projectId}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        handleEvent(event, store);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [projectId]);
}

function handleEvent(event: any, store: ReturnType<typeof useProjectStore.getState>) {
  switch (event.type) {
    case 'connected':
      store.setStatus('running');
      break;

    case 'agent_spawned':
      store.addAgent({
        name: event.agent,
        parent: event.parent,
        role: event.role,
        status: 'spawned',
        spawnedAt: Date.now(),
      });
      break;

    case 'agent_started':
      store.updateAgentStatus(event.agent, 'running');
      break;

    case 'agent_thinking':
      store.addAgentOutput(event.agent, event.text);
      break;

    case 'agent_completed':
      store.updateAgentStatus(event.agent, 'completed');
      break;

    case 'roundtable_started':
      store.startRoundtable(event.topic, event.agents);
      break;

    case 'roundtable_message':
      store.addRoundtableMessage({
        agent: event.agent,
        message: event.message,
        round: event.round,
      });
      break;

    case 'roundtable_concluded':
      store.concludeRoundtable(event.decision);
      break;

    case 'checkpoint_reached':
      store.setCheckpoint({
        phase: event.phase,
        prompt: event.prompt,
        options: event.options,
      });
      store.setStatus('paused');
      break;

    case 'checkpoint_resolved':
      store.setCheckpoint(null);
      store.setStatus('running');
      break;

    case 'image_generated':
      store.addImage({
        agent: event.agent,
        url: event.url,
        description: event.description,
      });
      break;

    case 'pipeline_completed':
      store.setStatus('completed');
      break;

    case 'error':
      store.setError(event.message);
      store.setStatus('error');
      break;
  }
}
