import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AppWindow, Wifi, WifiOff, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import AppEditDialog from '@/components/registry/AppEditDialog';

const statusStyles = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  development: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  archived: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function AppRegistry() {
  const queryClient = useQueryClient();
  const [editingApp, setEditingApp] = useState(null);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: () => base44.entities.AppRegistry.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AppRegistry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      toast.success('App deleted');
    },
  });

  return (
    <div>
      <PageHeader
        title="App Registry"
        description="View and manage all registered applications in your hub."
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center">
          <AppWindow className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No apps registered yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-4">App</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Hub</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          {apps.map((app) => (
            <div key={app.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-border last:border-0 items-center hover:bg-muted/20 transition-colors">
              <div className="col-span-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <AppWindow className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{app.app_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.app_description || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground capitalize">{app.app_category || '—'}</span>
              </div>
              <div className="col-span-2">
                <Badge variant="outline" className={`text-[11px] ${statusStyles[app.status] || statusStyles.development}`}>
                  {app.status || 'development'}
                </Badge>
              </div>
              <div className="col-span-2">
                {app.is_hub_connected ? (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="text-xs">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span className="text-xs">Disconnected</span>
                  </div>
                )}
              </div>
              <div className="col-span-2 flex justify-end gap-1.5">
                {app.app_url && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={app.app_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingApp(app)}>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(app.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingApp && (
        <AppEditDialog
          app={editingApp}
          onClose={() => setEditingApp(null)}
        />
      )}
    </div>
  );
}