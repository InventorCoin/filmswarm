import { useState } from 'react';
import { useProjectStore } from '../stores/project-store';

export function OutputPanel() {
  const images = useProjectStore((s) => s.images);
  const agentOutputs = useProjectStore((s) => s.agentOutputs);
  const status = useProjectStore((s) => s.status);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (status === 'idle') return null;

  return (
    <div className="space-y-4">
      {/* Images gallery */}
      {images.length > 0 && (
        <div className="bg-swarm-surface border border-swarm-border rounded-xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-sm">{'\u{1F5BC}'}</span>
            Generated Art
            <span className="ml-auto text-xs text-swarm-muted font-normal">
              {images.length} image{images.length !== 1 ? 's' : ''}
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {images.map((img, i) => (
              <div
                key={i}
                className="group relative cursor-pointer"
                onClick={() => setSelectedImage(selectedImage === i ? null : i)}
              >
                <img
                  src={img.url}
                  alt={img.description}
                  loading="lazy"
                  className="w-full aspect-square object-cover rounded-lg border border-swarm-border hover:border-swarm-accent transition"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition">
                  <p className="text-[10px] truncate">{img.description}</p>
                  <p className="text-[10px] text-swarm-accent">{img.agent.replace(/^(CharacterDesigner_|WorldBuilder_)/, '').replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage !== null && images[selectedImage] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-3xl max-h-[80vh] relative">
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].description}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 rounded-b-lg">
              <p className="text-sm">{images[selectedImage].description}</p>
              <p className="text-xs text-swarm-accent mt-1">
                {images[selectedImage].agent.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agent text outputs (live feed) */}
      <div className="bg-swarm-surface border border-swarm-border rounded-xl p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="text-sm">{'\u{1F4AC}'}</span>
          Agent Feed
          <span className="ml-auto text-xs text-swarm-muted font-normal">
            {agentOutputs.length} message{agentOutputs.length !== 1 ? 's' : ''}
          </span>
        </h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {agentOutputs.length === 0 && (
            <p className="text-xs text-swarm-muted italic">Waiting for agents to start...</p>
          )}
          {agentOutputs.slice(-15).map((out, i) => (
            <div key={i} className="text-xs border-l-2 border-swarm-border pl-2 py-0.5">
              <span className="text-swarm-accent font-mono">[{out.agent.replace(/_/g, ' ')}]</span>{' '}
              <span className="text-swarm-text/60">
                {out.text.length > 150 ? out.text.slice(0, 150) + '...' : out.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
