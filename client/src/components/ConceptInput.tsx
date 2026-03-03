import { useState } from 'react';
import { useProjectStore, type InteractionMode } from '../stores/project-store';

const MODES: { value: InteractionMode; label: string; desc: string }[] = [
  { value: 'auto-pilot', label: 'Auto-pilot', desc: 'Agents run autonomously' },
  { value: 'collaborate', label: 'Collaborate', desc: 'Pause at checkpoints for your input' },
  { value: 'direct', label: 'Direct', desc: 'Talk to individual agents' },
];

export function ConceptInput() {
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const mode = useProjectStore((s) => s.mode);
  const setMode = useProjectStore((s) => s.setMode);
  const setProjectId = useProjectStore((s) => s.setProjectId);
  const status = useProjectStore((s) => s.status);

  const handleSubmit = async () => {
    if (!concept.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: concept.trim(), mode }),
      });
      const data = await res.json();
      if (data.projectId) {
        setProjectId(data.projectId);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'idle') return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-swarm-accent">Film</span>Swarm
        </h1>
        <p className="text-swarm-muted text-lg">
          AI-powered film pre-production. Watch agents deliberate and create.
        </p>
      </div>

      <div className="bg-swarm-surface border border-swarm-border rounded-xl p-6 space-y-4">
        <textarea
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Describe your film concept... (e.g., 'A noir detective story set in a floating city above the clouds, where memories can be stolen and sold on the black market')"
          className="w-full bg-swarm-bg border border-swarm-border rounded-lg p-4 text-swarm-text placeholder-swarm-muted/50 resize-none h-32 focus:outline-none focus:border-swarm-accent transition"
        />

        {/* Mode selector */}
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`flex-1 p-3 rounded-lg border text-sm transition ${
                mode === m.value
                  ? 'border-swarm-accent bg-swarm-accent/10 text-swarm-accent'
                  : 'border-swarm-border text-swarm-muted hover:border-swarm-accent/50'
              }`}
            >
              <div className="font-medium">{m.label}</div>
              <div className="text-xs mt-1 opacity-70">{m.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!concept.trim() || loading}
          className="w-full py-3 bg-swarm-accent hover:bg-swarm-accent-dim disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-semibold transition"
        >
          {loading ? 'Launching Swarm...' : 'Launch Swarm'}
        </button>
      </div>
    </div>
  );
}
