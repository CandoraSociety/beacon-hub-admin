import React from 'react';

export default function BrandPreview({ primary, secondary }) {
  return (
    <div className="bg-card border border-white/5 rounded-xl p-6 shadow-md shadow-black/20">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Live Preview</h3>
      <div className="flex gap-8 items-start">
        {/* Color Swatches */}
        <div className="flex gap-6">
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-xl border border-white/10 shadow-lg"
              style={{ backgroundColor: primary || '#888' }}
            />
            <p className="text-xs font-medium text-foreground mt-2">Primary</p>
            <p className="text-[11px] font-mono text-muted-foreground">{primary || '—'}</p>
          </div>
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-xl border border-white/10 shadow-lg"
              style={{ backgroundColor: secondary || '#888' }}
            />
            <p className="text-xs font-medium text-foreground mt-2">Secondary</p>
            <p className="text-[11px] font-mono text-muted-foreground">{secondary || '—'}</p>
          </div>
        </div>

        {/* Mini UI Preview */}
        <div className="flex-1 bg-background rounded-lg border border-white/5 p-4 max-w-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: primary || '#888' }} />
            <span className="text-xs font-semibold text-foreground">App Preview</span>
          </div>
          <div className="space-y-2">
            <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: secondary || '#ccc', opacity: 0.5 }} />
            <div className="h-2 rounded-full w-1/2" style={{ backgroundColor: secondary || '#ccc', opacity: 0.3 }} />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              className="px-3 py-1.5 rounded-md text-[11px] font-medium text-white"
              style={{ backgroundColor: primary || '#888' }}
            >
              Primary Button
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-[11px] font-medium text-white"
              style={{ backgroundColor: secondary || '#888' }}
            >
              Secondary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}