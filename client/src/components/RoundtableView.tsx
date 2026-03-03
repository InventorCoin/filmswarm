import { useProjectStore } from '../stores/project-store';

const AGENT_COLORS: Record<string, string> = {
  Director: 'text-indigo-400',
  StoryArchitect: 'text-amber-400',
  MoodCurator: 'text-pink-400',
  Cinematographer: 'text-cyan-400',
};

function getAgentColor(name: string): string {
  for (const [key, color] of Object.entries(AGENT_COLORS)) {
    if (name.includes(key)) return color;
  }
  return 'text-swarm-accent';
}

export function RoundtableView() {
  const activeRoundtable = useProjectStore((s) => s.activeRoundtable);
  const messages = useProjectStore((s) => s.roundtableMessages);
  const decision = useProjectStore((s) => s.roundtableDecision);

  if (!activeRoundtable && messages.length === 0 && !decision) return null;

  return (
    <div className="bg-swarm-surface border border-swarm-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <h3 className="font-semibold">
          Roundtable: {activeRoundtable?.topic ?? 'Discussion concluded'}
        </h3>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="pl-4 border-l-2 border-swarm-border">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-medium text-sm ${getAgentColor(msg.agent)}`}>
                {msg.agent}
              </span>
              <span className="text-xs text-swarm-muted">Round {msg.round}</span>
            </div>
            <p className="text-sm text-swarm-text/80 whitespace-pre-wrap">{msg.message}</p>
          </div>
        ))}
      </div>

      {decision && (
        <div className="mt-4 p-4 bg-swarm-accent/5 border border-swarm-accent/20 rounded-lg">
          <div className="text-xs text-swarm-accent font-medium mb-1">DECISION</div>
          <p className="text-sm whitespace-pre-wrap">{decision}</p>
        </div>
      )}
    </div>
  );
}
