import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Palette, Building2, AppWindow, Rocket, Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/branding', label: 'Branding', icon: Palette },
  { path: '/org-profile', label: 'Org Profile', icon: Building2 },
  { path: '/app-registry', label: 'App Registry', icon: AppWindow },
  { path: '/new-app', label: 'New App', icon: Rocket },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight">Hub Control</h1>
            <p className="text-[11px] text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive && 'text-primary')} />
              {label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-[11px] text-muted-foreground text-center">Beacon Hub v1.0</p>
      </div>
    </aside>
  );
}