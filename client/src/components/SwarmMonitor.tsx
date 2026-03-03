import { useProjectStore, type AgentNode } from '../stores/project-store';

const STATUS_COLORS: Record<AgentNode['status'], string> = {
  spawned: 'border-swarm-warning bg-swarm-warning/10',
  running: 'border-swarm-accent bg-swarm-accent/10 animate-pulse-slow',
  completed: 'border-swarm-success bg-swarm-success/10',
  error: 'border-swarm-error bg-swarm-error/10',
};

const STATUS_DOT: Record<AgentNode['status'], string> = {
  spawned: 'bg-swarm-warning',
  running: 'bg-swarm-accent',
  completed: 'bg-swarm-success',
  error: 'bg-swarm-error',
};

export function SwarmMonitor() {
  const agents = useProjectStore((s) => s.agents);
  const status = useProjectStore((s) => s.status);

  if (agents.length === 0) return null;

  // Group agents by parent
  const director = agents.find((a) => a.parent === 'Director' || a.name === 'Director');
  const children = agents.filter((a) => a.name !== 'Director');

  return (
    <div className="bg-swarm-surface border border-swarm-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 rounded-full bg-swarm-accent animate-pulse" />
        <h2 className="text-lg font-semibold">Swarm Monitor</h2>
        <span className="ml-auto text-sm text-swarm-muted">
          {agents.length} agent{agents.length !== 1 ? 's' : ''} •{' '}
          {status === 'running' ? 'Active' : status}
        </span>
      </div>

      {/* Director node */}
      {director && (
        <div className="flex flex-col items-center mb-6">
          <AgentNodeView agent={{ ...director, name: 'Director', role: 'The Brain' }} isDirector />
          <div className="w-px h-6 bg-swarm-border" />
        </div>
      )}

      {/* Agent grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {children.map((agent) => (
          <AgentNodeView key={agent.name} agent={agent} />
        ))}
      </div>
    </div>
  );
}

function AgentNodeView({ agent, isDirector }: { agent: AgentNode; isDirector?: boolean }) {
  const shortName = agent.name.replace(/^(CharacterDesigner_|WorldBuilder_|Roundtable_)/, '');

  return (
    <div
      className={`
        border rounded-lg p-3 animate-spawn-in transition-all duration-300
        ${STATUS_COLORS[agent.status]}
        ${isDirector ? 'px-6 py-4 border-2' : ''}
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${STATUS_DOT[agent.status]}`} />
        <span className={`font-medium text-sm ${isDirector ? 'text-base' : ''}`}>
          {shortName}
        </span>
      </div>
      <p className="text-xs text-swarm-muted truncate">{agent.role}</p>
    </div>
  );
}
