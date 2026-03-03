import { EventEmitter } from 'events';
import type { SwarmEvent } from '../types.js';

class SwarmEventBus extends EventEmitter {
  emit(projectId: string, event: SwarmEvent): boolean {
    return super.emit(projectId, event);
  }

  subscribe(projectId: string, listener: (event: SwarmEvent) => void) {
    this.on(projectId, listener);
    return () => this.off(projectId, listener);
  }
}

export const eventBus = new SwarmEventBus();
