import { useProjectStore } from '../stores/project-store';

const PHASES = [
  { key: 'concept_analysis', label: 'Concept', icon: '\u{1F4CB}' },
  { key: 'story_development', label: 'Story', icon: '\u{1F4D6}' },
  { key: 'creative_production', label: 'Visuals', icon: '\u{1F3A8}' },
  { key: 'cinematography', label: 'Shots', icon: '\u{1F4F9}' },
  { key: 'compilation', label: 'Package', icon: '\u{1F4E6}' },
];

export function PhaseIndicator() {
  const currentPhase = useProjectStore((s) => s.currentPhase);
  const status = useProjectStore((s) => s.status);

  if (status === 'idle' || !currentPhase) return null;

  const currentIdx = PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <div className="bg-swarm-surface border border-swarm-border rounded-xl p-4">
      <div className="flex items-center justify-between">
        {PHASES.map((phase, i) => {
          const isPast = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isFuture = i > currentIdx;

          return (
            <div key={phase.key} className="flex items-center flex-1">
              {/* Phase node */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500
                    ${isPast ? 'bg-swarm-success/20 text-swarm-success' : ''}
                    ${isCurrent ? 'bg-swarm-accent/20 text-swarm-accent ring-2 ring-swarm-accent/50 scale-110' : ''}
                    ${isFuture ? 'bg-swarm-bg text-swarm-muted/40' : ''}
                  `}
                >
                  {isPast ? '\u2713' : phase.icon}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isCurrent ? 'text-swarm-accent' : isPast ? 'text-swarm-success' : 'text-swarm-muted/40'
                  }`}
                >
                  {phase.label}
                </span>
              </div>

              {/* Connector line */}
              {i < PHASES.length - 1 && (
                <div className="flex-shrink-0 w-8 h-px mx-1 mt-[-14px]">
                  <div
                    className={`h-full transition-all duration-500 ${
                      i < currentIdx ? 'bg-swarm-success' : 'bg-swarm-border'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
