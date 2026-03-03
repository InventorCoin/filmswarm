import { create } from 'zustand';

export type InteractionMode = 'auto-pilot' | 'collaborate' | 'direct';

export interface AgentNode {
  name: string;
  parent: string;
  role: string;
  status: 'spawned' | 'running' | 'completed' | 'error';
  spawnedAt: number;
}

export interface RoundtableMessage {
  agent: string;
  message: string;
  round: number;
}

export interface GeneratedImage {
  agent: string;
  url: string;
  description: string;
}

export interface Checkpoint {
  phase: string;
  prompt: string;
  options?: string[];
}

interface ProjectState {
  projectId: string | null;
  mode: InteractionMode;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';

  // Swarm topology
  agents: AgentNode[];

  // Roundtable
  activeRoundtable: { topic: string; agents: string[] } | null;
  roundtableMessages: RoundtableMessage[];
  roundtableDecision: string | null;

  // Checkpoint
  activeCheckpoint: Checkpoint | null;

  // Outputs
  images: GeneratedImage[];
  agentOutputs: { agent: string; text: string }[];

  // Error
  error: string | null;

  // Actions
  setProjectId: (id: string) => void;
  setMode: (mode: InteractionMode) => void;
  setStatus: (status: ProjectState['status']) => void;
  addAgent: (agent: AgentNode) => void;
  updateAgentStatus: (name: string, status: AgentNode['status']) => void;
  startRoundtable: (topic: string, agents: string[]) => void;
  addRoundtableMessage: (msg: RoundtableMessage) => void;
  concludeRoundtable: (decision: string) => void;
  setCheckpoint: (cp: Checkpoint | null) => void;
  addImage: (img: GeneratedImage) => void;
  addAgentOutput: (agent: string, text: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  projectId: null,
  mode: 'collaborate' as InteractionMode,
  status: 'idle' as const,
  agents: [],
  activeRoundtable: null,
  roundtableMessages: [],
  roundtableDecision: null,
  activeCheckpoint: null,
  images: [],
  agentOutputs: [],
  error: null,
};

export const useProjectStore = create<ProjectState>((set) => ({
  ...initialState,

  setProjectId: (id) => set({ projectId: id }),
  setMode: (mode) => set({ mode }),
  setStatus: (status) => set({ status }),

  addAgent: (agent) =>
    set((s) => ({
      agents: [...s.agents.filter((a) => a.name !== agent.name), agent],
    })),

  updateAgentStatus: (name, status) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.name === name ? { ...a, status } : a)),
    })),

  startRoundtable: (topic, agents) =>
    set({ activeRoundtable: { topic, agents }, roundtableMessages: [], roundtableDecision: null }),

  addRoundtableMessage: (msg) =>
    set((s) => ({ roundtableMessages: [...s.roundtableMessages, msg] })),

  concludeRoundtable: (decision) =>
    set({ roundtableDecision: decision, activeRoundtable: null }),

  setCheckpoint: (cp) => set({ activeCheckpoint: cp }),

  addImage: (img) => set((s) => ({ images: [...s.images, img] })),

  addAgentOutput: (agent, text) =>
    set((s) => ({ agentOutputs: [...s.agentOutputs, { agent, text }] })),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
