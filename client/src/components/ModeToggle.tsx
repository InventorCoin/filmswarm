import { useProjectStore, type InteractionMode } from '../stores/project-store';

const MODES: { value: InteractionMode; icon: string; label: string }[] = [
  { value: 'auto-pilot', icon: '▶', label: 'Auto' },
  { value: 'collaborate', icon: '⇄', label: 'Collab' },
  { value: 'direct', icon: '✎', label: 'Direct' },
];

export function ModeToggle() {
  const mode = useProjectStore((s) => s.mode);
  const status = useProjectStore((s) => s.status);

  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-1 bg-swarm-surface border border-swarm-border rounded-lg p-1">
      {MODES.map((m) => (
        <div
          key={m.value}
          className={`px-3 py-1.5 rounded text-xs font-medium transition ${
            mode === m.value
              ? 'bg-swarm-accent text-white'
              : 'text-swarm-muted'
          }`}
        >
          {m.icon} {m.label}
        </div>
      ))}
    </div>
  );
}
