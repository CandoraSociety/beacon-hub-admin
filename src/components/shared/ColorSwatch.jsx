import React from 'react';

export default function ColorSwatch({ color, label, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-md',
    md: 'w-12 h-12 rounded-lg',
    lg: 'w-20 h-20 rounded-xl',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizeClasses[size]} border border-border shadow-lg`}
        style={{ backgroundColor: color || '#888' }}
      />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <span className="text-[11px] font-mono text-muted-foreground/70">{color || '—'}</span>
    </div>
  );
}