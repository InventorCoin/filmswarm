import { useProjectStore } from '../stores/project-store';

export function OutputPanel() {
  const images = useProjectStore((s) => s.images);
  const agentOutputs = useProjectStore((s) => s.agentOutputs);
  const status = useProjectStore((s) => s.status);

  if (status === 'idle') return null;

  return (
    <div className="bg-swarm-surface border border-swarm-border rounded-xl p-6">
      <h3 className="font-semibold mb-4">Production Output</h3>

      {/* Images gallery */}
      {images.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm text-swarm-muted mb-3">Generated Images ({images.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div key={i} className="group relative">
                <img
                  src={img.url}
                  alt={img.description}
                  className="w-full aspect-video object-cover rounded-lg border border-swarm-border"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg">
                  <p className="text-xs truncate">{img.description}</p>
                  <p className="text-xs text-swarm-muted">{img.agent}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent text outputs (latest 20) */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {agentOutputs.slice(-20).map((out, i) => (
          <div key={i} className="text-sm">
            <span className="text-swarm-accent font-mono text-xs">[{out.agent}]</span>{' '}
            <span className="text-swarm-text/70">
              {out.text.length > 200 ? out.text.slice(0, 200) + '...' : out.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
