import React from 'react';

export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-lg">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}