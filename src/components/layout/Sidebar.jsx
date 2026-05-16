import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Palette, Building2, AppWindow, Rocket, Hexagon, ChevronLeft, ExternalLink, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarContext } from '@/lib/SidebarContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pending-tasks-list', label: 'Pending Tasks', icon: CheckSquare },
  { path: '/branding', label: 'Design', icon: Palette },
  { path: '/org-profile', label: 'Org Profile', icon: Building2 },
  { path: '/app-registry', label: 'App Registry', icon: AppWindow },
  { path: '/new-app', label: 'New App', icon: Rocket },
];

export default function Sidebar() {
  const [currentPath, setCurrentPath] = useState('/');
  const { collapsed, setCollapsed } = useContext(SidebarContext);

  const { data: connectedApps = [] } = useQuery({
    queryKey: ['connectedApps'],
    queryFn: async () => {
      const all = await base44.entities.AppRegistry.list();
      return all.filter(a => a.is_hub_connected && a.app_url && a.status === 'active');
    },
    staleTime: 60000,
  });

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
      "fixed left-0 top-0 bottom-0 bg-sidebar border-r border-white/5 flex flex-col z-50 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo & Collapse */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7 -mr-2"
        >
          <ChevronLeft className={cn("w-4 h-4 text-muted-foreground", collapsed && "rotate-180")} />
        </Button>
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
                  : 'text-muted-foreground hover:text-accent hover:bg-accent/25'
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

      {/* Connected Apps */}
       {connectedApps.length > 0 && (
         <div className="flex-1 px-3 pb-2 min-h-0 flex flex-col overflow-hidden">
           <div className={cn("border-t border-white/5 pt-3 mb-1 flex flex-col min-h-0 flex-1", !collapsed && "")}>
             {!collapsed && (
               <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2 flex-shrink-0">Connected Apps</p>
             )}
             <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
               {connectedApps.map(app => (
                 <a
                   key={app.id}
                   href={app.app_url}
                   target="_blank"
                   rel="noopener noreferrer"
                   title={app.app_name}
                   className={cn(
                     'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-accent hover:bg-accent/25 group flex-shrink-0',
                     collapsed && 'px-0 justify-center'
                   )}
                 >
                   <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary uppercase">
                     {app.app_name.charAt(0)}
                   </div>
                   {!collapsed && (
                     <>
                       <span className="truncate flex-1">{app.app_name}</span>
                       <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 flex-shrink-0" />
                     </>
                   )}
                 </a>
               ))}
             </div>
           </div>
         </div>
       )}

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        {!collapsed && <p className="text-[11px] text-muted-foreground text-center">Beacon Hub v1.0</p>}
      </div>
    </aside>
  );
}