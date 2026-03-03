export type SwarmEvent =
  | { type: 'agent_spawned'; agent: string; parent: string; role: string }
  | { type: 'agent_started'; agent: string; phase: string }
  | { type: 'agent_thinking'; agent: string; text: string }
  | { type: 'agent_completed'; agent: string; duration: number; summary: string }
  | { type: 'roundtable_started'; topic: string; agents: string[] }
  | { type: 'roundtable_message'; agent: string; message: string; round: number }
  | { type: 'roundtable_concluded'; decision: string }
  | { type: 'checkpoint_reached'; phase: string; prompt: string; options?: string[] }
  | { type: 'checkpoint_resolved'; phase: string; decision: string }
  | { type: 'image_generated'; agent: string; url: string; description: string }
  | { type: 'tool_call'; agent: string; tool: string }
  | { type: 'pipeline_completed'; projectId: string }
  | { type: 'error'; agent: string; message: string };

export type InteractionMode = 'auto-pilot' | 'collaborate' | 'direct';

export interface Project {
  id: string;
  concept: string;
  mode: InteractionMode;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'error';
  createdAt: number;
  updatedAt: number;
  artifacts: Record<string, unknown>;
}

export interface CreativeBrief {
  genre: string;
  tone: string;
  themes: string[];
  scope: 'short' | 'feature' | 'series';
  targetAudience: string;
  visualStyle: string;
  summary: string;
}

export interface StoryStructure {
  logline: string;
  synopsis: string;
  characters: Character[];
  locations: Location[];
  keyScenes: Scene[];
  themes: string[];
}

export interface Character {
  name: string;
  role: string;
  description: string;
  arc: string;
  visualNotes: string;
}

export interface Location {
  name: string;
  description: string;
  mood: string;
  visualNotes: string;
}

export interface Scene {
  number: number;
  title: string;
  location: string;
  characters: string[];
  description: string;
  emotionalBeat: string;
}
