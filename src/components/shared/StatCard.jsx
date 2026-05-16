import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ label, value, subtitle, icon: Icon, accentClass }) {
  return (
    <div className="bg-card border border-white/5 rounded-xl p-5 group shadow-md shadow-black/20 hover:border-white/10 hover:shadow-lg hover:shadow-black/40 hover:brightness-110 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          accentClass || 'bg-primary/15'
        )}>
          <Icon className={cn('w-5 h-5', accentClass ? 'text-current' : 'text-primary')} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
    </div>
  );
}