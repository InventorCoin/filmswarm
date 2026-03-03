import { EventEmitter } from 'events';
import type { SwarmEvent } from '../types.js';

class SwarmEventBus extends EventEmitter {
  private history = new Map<string, SwarmEvent[]>();

  emit(projectId: string, event: SwarmEvent): boolean {
    // Store event in history for replay on reconnect
    let events = this.history.get(projectId);
    if (!events) {
      events = [];
      this.history.set(projectId, events);
    }
    events.push(event);
    return super.emit(projectId, event);
  }

  subscribe(projectId: string, listener: (event: SwarmEvent) => void) {
    this.on(projectId, listener);
    return () => this.off(projectId, listener);
  }

  getHistory(projectId: string): SwarmEvent[] {
    return this.history.get(projectId) ?? [];
  }

  clearHistory(projectId: string) {
    this.history.delete(projectId);
  }
}

export const eventBus = new SwarmEventBus();
