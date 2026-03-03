import { useState } from 'react';
import { useProjectStore } from '../stores/project-store';

export function CheckpointPrompt() {
  const checkpoint = useProjectStore((s) => s.activeCheckpoint);
  const projectId = useProjectStore((s) => s.projectId);
  const [customInput, setCustomInput] = useState('');
  const [resolving, setResolving] = useState(false);

  if (!checkpoint || !projectId) return null;

  const resolve = async (decision: string) => {
    setResolving(true);
    try {
      await fetch(`/api/interact/${projectId}/checkpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: checkpoint.phase, decision }),
      });
    } catch (err) {
      console.error('Checkpoint resolve error:', err);
    } finally {
      setResolving(false);
      setCustomInput('');
    }
  };

  return (
    <div className="bg-swarm-surface border-2 border-swarm-warning rounded-xl p-6 animate-spawn-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full bg-swarm-warning animate-pulse" />
        <h3 className="font-semibold text-swarm-warning">Your Input Needed</h3>
      </div>

      <p className="text-sm text-swarm-text/80 mb-4 whitespace-pre-wrap">{checkpoint.prompt}</p>

      {checkpoint.options && (
        <div className="flex flex-wrap gap-2 mb-4">
          {checkpoint.options.map((opt) => (
            <button
              key={opt}
              onClick={() => resolve(opt)}
              disabled={resolving}
              className="px-4 py-2 bg-swarm-bg border border-swarm-border rounded-lg text-sm hover:border-swarm-accent transition disabled:opacity-40"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && customInput.trim() && resolve(customInput.trim())}
          placeholder="Or type custom direction..."
          className="flex-1 bg-swarm-bg border border-swarm-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-swarm-accent"
        />
        <button
          onClick={() => customInput.trim() && resolve(customInput.trim())}
          disabled={!customInput.trim() || resolving}
          className="px-4 py-2 bg-swarm-accent rounded-lg text-sm font-medium disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
