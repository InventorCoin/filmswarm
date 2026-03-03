import { useProjectStore } from './stores/project-store';
import { useSSE } from './hooks/useSSE';
import { ConceptInput } from './components/ConceptInput';
import { SwarmMonitor } from './components/SwarmMonitor';
import { PhaseIndicator } from './components/PhaseIndicator';
import { RoundtableView } from './components/RoundtableView';
import { CheckpointPrompt } from './components/CheckpointPrompt';
import { OutputPanel } from './components/OutputPanel';
import { ModeToggle } from './components/ModeToggle';

export default function App() {
  const projectId = useProjectStore((s) => s.projectId);
  const status = useProjectStore((s) => s.status);
  const error = useProjectStore((s) => s.error);
  const reset = useProjectStore((s) => s.reset);

  useSSE(projectId);

  return (
    <div className="min-h-screen bg-swarm-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header when running */}
        {status !== 'idle' && (
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <span className="text-swarm-accent">Film</span>Swarm
            </h1>
            <div className="flex items-center gap-3">
              <ModeToggle />
              {status === 'completed' && (
                <button
                  onClick={reset}
                  className="px-3 py-1.5 text-xs border border-swarm-border rounded-lg text-swarm-muted hover:text-swarm-text hover:border-swarm-accent transition"
                >
                  New Project
                </button>
              )}
            </div>
          </div>
        )}

        {/* Concept input (shown when idle) */}
        <ConceptInput />

        {/* Phase progress */}
        <PhaseIndicator />

        {/* Error */}
        {error && (
          <div className="bg-swarm-error/10 border border-swarm-error/30 rounded-xl p-4 text-swarm-error text-sm">
            {error}
          </div>
        )}

        {/* Main content grid when running */}
        {status !== 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Swarm + Roundtable */}
            <div className="lg:col-span-2 space-y-6">
              <SwarmMonitor />
              <RoundtableView />
              <CheckpointPrompt />
            </div>

            {/* Right column: Output */}
            <div className="space-y-6">
              <OutputPanel />
            </div>
          </div>
        )}

        {/* Completed state */}
        {status === 'completed' && (
          <div className="bg-swarm-success/10 border border-swarm-success/30 rounded-xl p-6 text-center">
            <div className="text-swarm-success text-2xl mb-2">Pre-Production Complete</div>
            <p className="text-swarm-muted">
              Your film pre-production package is ready. All artifacts saved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
