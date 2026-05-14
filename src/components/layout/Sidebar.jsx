import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Palette, Building2, AppWindow, Rocket, Hexagon, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/branding', label: 'Branding', icon: Palette },
  { path: '/org-profile', label: 'Org Profile', icon: Building2 },
  { path: '/app-registry', label: 'App Registry', icon: AppWindow },
  { path: '/new-app', label: 'New App', icon: Rocket },
];

export default function Sidebar() {
  const [currentPath, setCurrentPath] = useState('/');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };
    
    updatePath();
    
    const handlePopState = () => {
      updatePath();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 bg-card border-r border-border flex flex-col z-50 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo & Collapse */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Hexagon className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">Hub Control</h1>
              <p className="text-[11px] text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="h-7 w-7 -mr-2"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = currentPath === path;
          return (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : ''}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 justify-center',
                collapsed && 'px-0',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-primary')} />
              {!collapsed && (
                <>
                  {label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && <p className="text-[11px] text-muted-foreground text-center">Beacon Hub v1.0</p>}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="h-7 w-7 mx-auto"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
          </Button>
        )}
      </div>
    </aside>
  );
}