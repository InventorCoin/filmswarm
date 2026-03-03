import { useProjectStore, type AgentNode } from '../stores/project-store';

const STATUS_COLORS: Record<AgentNode['status'], string> = {
  spawned: 'border-swarm-warning/50 bg-swarm-warning/5',
  running: 'border-swarm-accent bg-swarm-accent/10 ring-1 ring-swarm-accent/30',
  completed: 'border-swarm-success/50 bg-swarm-success/5',
  error: 'border-swarm-error/50 bg-swarm-error/5',
};

const STATUS_DOT: Record<AgentNode['status'], string> = {
  spawned: 'bg-swarm-warning',
  running: 'bg-swarm-accent animate-pulse',
  completed: 'bg-swarm-success',
  error: 'bg-swarm-error',
};

const AGENT_ICONS: Record<string, string> = {
  Director: '\u{1F3AC}',
  ConceptAnalyst: '\u{1F4CB}',
  StoryArchitect: '\u{1F4D6}',
  CharacterDesigner: '\u{1F3A8}',
  WorldBuilder: '\u{1F30D}',
  MoodCurator: '\u{1F3A8}',
  Cinematographer: '\u{1F4F9}',
  ProductionCompiler: '\u{1F4E6}',
  QualityReviewer: '\u{2705}',
  Roundtable: '\u{1F4AC}',
};

function getIcon(name: string): string {
  for (const [key, icon] of Object.entries(AGENT_ICONS)) {
    if (name.startsWith(key) || name.includes(key)) return icon;
  }
  return '\u{1F916}';
}

function getPhaseLabel(name: string): string {
  if (name.startsWith('CharacterDesigner')) return 'Characters';
  if (name.startsWith('WorldBuilder')) return 'Worlds';
  if (name === 'MoodCurator') return 'Mood';
  if (name.startsWith('Roundtable')) return 'Deliberation';
  return '';
}

export function SwarmMonitor() {
  const agents = useProjectStore((s) => s.agents);
  const status = useProjectStore((s) => s.status);

  if (agents.length === 0) return null;

  // Categorize agents into phases
  const phases: { label: string; agents: AgentNode[]; color: string }[] = [];

  const concept = agents.filter(
    (a) => a.name === 'ConceptAnalyst'
  );
  const story = agents.filter((a) => a.name === 'StoryArchitect');
  const characters = agents.filter((a) => a.name.startsWith('CharacterDesigner'));
  const worlds = agents.filter((a) => a.name.startsWith('WorldBuilder'));
  const mood = agents.filter((a) => a.name === 'MoodCurator');
  const roundtables = agents.filter((a) => a.name.startsWith('Roundtable'));
  const cinematography = agents.filter((a) => a.name === 'Cinematographer');
  const compilation = agents.filter(
    (a) => a.name === 'ProductionCompiler' || a.name === 'QualityReviewer'
  );

  if (concept.length) phases.push({ label: 'Analysis', agents: concept, color: 'text-blue-400' });
  if (story.length) phases.push({ label: 'Story', agents: story, color: 'text-amber-400' });
  if (roundtables.length) phases.push({ label: 'Deliberation', agents: roundtables, color: 'text-orange-400' });
  if (characters.length || worlds.length || mood.length) {
    phases.push({ label: 'Visual Production', agents: [...characters, ...worlds, ...mood], color: 'text-pink-400' });
  }
  if (cinematography.length) phases.push({ label: 'Cinematography', agents: cinematography, color: 'text-cyan-400' });
  if (compilation.length) phases.push({ label: 'Compilation', agents: compilation, color: 'text-green-400' });

  const completed = agents.filter((a) => a.status === 'completed').length;
  const running = agents.filter((a) => a.status === 'running').length;

  return (
    <div className="bg-swarm-surface border border-swarm-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-swarm-accent" />
          {status === 'running' && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-swarm-accent animate-ping" />
          )}
        </div>
        <h2 className="text-lg font-semibold">Swarm Monitor</h2>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-swarm-muted">
            {agents.length} agent{agents.length !== 1 ? 's' : ''}
          </span>
          {running > 0 && (
            <span className="text-swarm-accent flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-swarm-accent animate-pulse" />
              {running} active
            </span>
          )}
          <span className="text-swarm-success">
            {completed}/{agents.length} done
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-swarm-bg rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-swarm-accent to-swarm-success rounded-full transition-all duration-500"
          style={{ width: `${agents.length ? (completed / agents.length) * 100 : 0}%` }}
        />
      </div>

      {/* Director node */}
      <div className="flex flex-col items-center mb-6">
        <div className="border-2 border-swarm-accent bg-swarm-accent/10 rounded-xl px-8 py-3 text-center">
          <div className="text-lg font-bold">Director</div>
          <div className="text-xs text-swarm-muted">Orchestrating the swarm</div>
        </div>
      </div>

      {/* Phase lanes */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <div key={phase.label} className="relative">
            {/* Phase connector line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-swarm-border ml-3" />

            {/* Phase label */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-swarm-border z-10 ml-2" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${phase.color}`}>
                {phase.label}
              </span>
              <span className="text-xs text-swarm-muted">
                ({phase.agents.filter((a) => a.status === 'completed').length}/{phase.agents.length})
              </span>
            </div>

            {/* Agent cards */}
            <div className="ml-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {phase.agents.map((agent) => (
                <AgentNodeView key={agent.name} agent={agent} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentNodeView({ agent }: { agent: AgentNode }) {
  const shortName = agent.name
    .replace(/^(CharacterDesigner_|WorldBuilder_|Roundtable_)/, '')
    .replace(/_/g, ' ');

  const icon = getIcon(agent.name);

  return (
    <div
      className={`
        border rounded-lg p-2.5 animate-spawn-in transition-all duration-300
        ${STATUS_COLORS[agent.status]}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[agent.status]}`} />
            <span className="font-medium text-xs truncate">{shortName}</span>
          </div>
          <p className="text-[10px] text-swarm-muted truncate mt-0.5">{agent.role}</p>
        </div>
      </div>
    </div>
  );
}
