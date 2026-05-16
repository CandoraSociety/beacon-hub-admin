import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';

const AVAILABLE_INTEGRATIONS = [
  { id: 'sync-app-name', name: 'App Name Sync', description: 'Auto-sync app name from Beacon hub' },
  { id: 'sync-branding', name: 'Branding Sync', description: 'Auto-sync branding settings from Beacon hub' },
];

export default function AppIntegrations() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    async function fetchApps() {
      try {
        const registeredApps = await base44.entities.AppRegistry.list();
        setApps(registeredApps);
      } catch (error) {
        console.error('Failed to fetch apps:', error);
        toast.error('Failed to load apps');
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedApps([]);
      setSelectAll(false);
    } else {
      setSelectedApps(apps.map(a => a.id));
      setSelectAll(true);
    }
  };

  const handleAppToggle = (appId) => {
    const newSelected = selectedApps.includes(appId)
      ? selectedApps.filter(id => id !== appId)
      : [...selectedApps, appId];
    setSelectedApps(newSelected);
    setSelectAll(newSelected.length === apps.length);
  };

  const handleApply = async () => {
    if (!selectedIntegration || selectedApps.length === 0) {
      toast.error('Select an integration and at least one app');
      return;
    }
    setShowConfirm(true);
  };

  const executeApply = async () => {
    setApplying(true);
    setShowConfirm(false);
    const integration = AVAILABLE_INTEGRATIONS.find(i => i.id === selectedIntegration);

    try {
      const appResults = await Promise.allSettled(
        selectedApps.map(appId => {
          const app = apps.find(a => a.id === appId);
          return base44.functions.invoke('pushIntegration', {
            app_id: appId,
            app_url: app.app_url,
            app_token: app.integration_token,
            integration_id: selectedIntegration,
            integration_name: integration.name,
          });
        })
      );

      const successful = appResults.filter(r => r.status === 'fulfilled').length;
      const failed = appResults.filter(r => r.status === 'rejected').length;

      setResults({ successful, failed, total: selectedApps.length });
      
      if (failed === 0) {
        toast.success(`Integration applied to ${successful} app${successful !== 1 ? 's' : ''}`);
        setSelectedIntegration('');
        setSelectedApps([]);
        setSelectAll(false);
      } else {
        toast.error(`Applied to ${successful}, failed on ${failed}`);
      }
    } catch (error) {
      toast.error('Error applying integration: ' + error.message);
    } finally {
      setApplying(false);
    }
  };

  const selectedIntegrationName = AVAILABLE_INTEGRATIONS.find(i => i.id === selectedIntegration)?.name;

  return (
    <div className="w-full">
      <PageHeader title="App Integrations" description="Push integrations to multiple apps at once" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Integration Selection */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Choose Integration</h3>
            <div className="space-y-3">
              {AVAILABLE_INTEGRATIONS.map(integration => (
                <button
                  key={integration.id}
                  onClick={() => setSelectedIntegration(integration.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedIntegration === integration.id
                      ? 'border-primary bg-primary/10'
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{integration.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{integration.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* App Selection */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Target Apps</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : apps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No apps registered yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {apps.map(app => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <Checkbox
                      checked={selectedApps.includes(app.id)}
                      onCheckedChange={() => handleAppToggle(app.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{app.app_name}</p>
                      <p className="text-xs text-muted-foreground">{app.app_url}</p>
                    </div>
                    {app.integration_token && (
                      <div className="h-2 w-2 rounded-full bg-green-500" title="Token configured" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleApply}
          disabled={!selectedIntegration || selectedApps.length === 0 || applying}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          {applying ? 'Applying...' : 'Apply Integration'}
        </Button>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-8 bg-card border border-white/5 rounded-xl p-6">
          <div className="flex gap-4">
            {results.failed === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {results.failed === 0
                  ? `Successfully applied to ${results.successful} app${results.successful !== 1 ? 's' : ''}`
                  : `Applied to ${results.successful}, failed on ${results.failed}`}
              </p>
              {selectedIntegrationName && (
                <p className="text-xs text-muted-foreground mt-1">
                  Integration: {selectedIntegrationName}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Integration?</AlertDialogTitle>
            <AlertDialogDescription>
              Push "{selectedIntegrationName}" to {selectedApps.length} app{selectedApps.length !== 1 ? 's' : ''}?
              {selectedApps.length > 0 && (
                <div className="mt-3 text-xs text-foreground">
                  {apps
                    .filter(a => selectedApps.includes(a.id))
                    .map(a => a.app_name)
                    .join(', ')}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeApply}>Apply</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}