import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckSquare, Square, Zap, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ApplyBrandingModal({ onClose }) {
  const [selected, setSelected] = useState([]);
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState(false);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['appRegistry', 'connected'],
    queryFn: async () => {
      const all = await base44.entities.AppRegistry.list();
      return all.filter(a => a.is_hub_connected && a.app_url);
    },
    onSuccess: (data) => setSelected(data.map(a => a.id)),
  });

  // Auto-select all on load
  useEffect(() => {
    if (apps.length > 0 && selected.length === 0) {
      setSelected(apps.map(a => a.id));
    }
  }, [apps]);

  const allSelected = apps.length > 0 && selected.length === apps.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : apps.map(a => a.id));
  };

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleApply = async () => {
    if (selected.length === 0) return;
    setApplying(true);
    try {
      await base44.functions.invoke('pushBranding', { app_ids: selected });
      setDone(true);
      toast.success('Branding applied to selected apps!');
      setTimeout(onClose, 1800);
    } catch {
      toast.error('Failed to push branding');
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Apply Branding Changes</h2>
              <p className="text-xs text-muted-foreground">Select apps to push the current branding to</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No hub-connected apps found.</p>
              <p className="text-xs text-muted-foreground mt-1">Register apps in the App Registry and mark them as Hub Connected.</p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <button
                onClick={toggleAll}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors mb-2 text-sm font-medium text-foreground"
              >
                {allSelected
                  ? <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                  : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                }
                Select All ({apps.length} app{apps.length !== 1 ? 's' : ''})
              </button>

              <div className="border-t border-border my-2" />

              {/* App List */}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {apps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => toggle(app.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    {selected.includes(app.id)
                      ? <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                      : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{app.app_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.app_url}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {apps.length > 0 && (
          <div className="flex gap-2 justify-end p-5 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose} disabled={applying}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={applying || selected.length === 0 || done}
            >
              {done ? (
                <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Applied!</>
              ) : applying ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Applying…</>
              ) : (
                <><Zap className="w-3.5 h-3.5 mr-1.5" /> Apply to {selected.length} App{selected.length !== 1 ? 's' : ''}</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}