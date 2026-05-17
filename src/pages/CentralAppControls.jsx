import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import { Type, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CentralAppControls() {
  const [selectedAppId, setSelectedAppId] = useState('');
  const [newName, setNewName] = useState('');
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);

  const { data: apps = [] } = useQuery({
    queryKey: ['appRegistry'],
    queryFn: () => base44.entities.AppRegistry.list(),
  });

  const selectedApp = apps.find(a => a.id === selectedAppId);

  const handleSelectApp = (appId) => {
    setSelectedAppId(appId);
    setNewName(apps.find(a => a.id === appId)?.app_name || '');
    setResult(null);
  };

  const handleApply = async () => {
    if (!selectedAppId || !newName.trim()) return;
    if (newName === selectedApp?.app_name) {
      toast.error('Name is the same — no change needed');
      return;
    }

    setApplying(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('updateAppName', {
        appId: selectedAppId,
        oldName: selectedApp.app_name,
        newName: newName.trim(),
      });
      setResult({ success: true, message: res.data?.message });
      toast.success('App name updated successfully');
    } catch (error) {
      setResult({ success: false, message: error.message });
      toast.error('Failed to update app name');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <PageHeader
        title="Central App Controls"
        description="Universal command controls that apply across connected apps."
      />

      {/* App Name Sync */}
      <div className="bg-card border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Type className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">App Name Sync</h3>
            <p className="text-xs text-muted-foreground">Update an app's name across Beacon and the app itself</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select App</label>
            <Select value={selectedAppId} onValueChange={handleSelectApp}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an app..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {apps.map(app => (
                  <SelectItem key={app.id} value={app.id}>{app.app_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAppId && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">New App Name</label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Enter new name..."
              />
            </div>
          )}

          {selectedAppId && (
            <Button
              onClick={handleApply}
              disabled={applying || !newName.trim() || newName === selectedApp?.app_name}
            >
              {applying ? 'Applying...' : 'Sync Name'}
            </Button>
          )}

          {result && (
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${result.success ? 'border-green-500/20 bg-green-500/10' : 'border-destructive/20 bg-destructive/10'}`}>
              {result.success
                ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />}
              <p className="text-sm text-foreground">{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}