import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppRegistry } from '@/api/entities';
import { AppWindow, Wifi, WifiOff, Pencil, Trash2, Plus, X, Save, Zap, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import ConnectionPromptModal from '@/components/registry/ConnectionPromptModal';
import ConfirmConnectionDialog from '@/components/registry/ConfirmConnectionDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusStyles = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  development: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  archived: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const emptyForm = {
  app_name: '',
  app_description: '',
  app_category: 'internal',
  app_url: '',
  audience: '',
  status: 'active',
  is_hub_connected: true,
  command_url: '',
  integration_token: '',
};

export default function AppRegistryPage() {
  const queryClient = useQueryClient();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [promptApp, setPromptApp] = useState(null);
  const [lastSavedApp, setLastSavedApp] = useState(null);
  const [confirmingApp, setConfirmingApp] = useState(null);
  const [deletingApp, setDeletingApp] = useState(null);
  const [setupLegacyOpen, setSetupLegacyOpen] = useState(false);
  const [setupResult, setSetupResult] = useState(null);
  const [setupLoading, setSetupLoading] = useState(false);

  async function loadApps() {
    setLoading(true);
    const records = await AppRegistry.list();
    setApps(records);
    setLoading(false);
  }

  useEffect(() => { loadApps(); }, []);

  function openAdd() {
    setEditingApp(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(app) {
    setEditingApp(app);
    setForm({
      app_name: app.app_name || '',
      app_description: app.app_description || '',
      app_category: app.app_category || 'internal',
      app_url: app.app_url || '',
      audience: app.audience || '',
      status: app.status || 'active',
      is_hub_connected: app.is_hub_connected ?? true,
      command_url: app.command_url || '',
      integration_token: app.integration_token || '',
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.app_name.trim()) { toast.error('App name is required'); return; }
    setSaving(true);
    if (editingApp) {
      // If app name changed, sync across all references
      if (editingApp.app_name !== form.app_name) {
        try {
          await base44.functions.invoke('updateAppName', {
            appId: editingApp.id,
            oldName: editingApp.app_name,
            newName: form.app_name,
          });
        } catch (error) {
          console.error('Failed to sync app name:', error);
          toast.error('Failed to sync app name changes');
          setSaving(false);
          return;
        }
      } else {
        // If name didn't change, just update other fields
        await AppRegistry.update(editingApp.id, form);
      }
      toast.success('App updated');
      setSaving(false);
      setShowForm(false);
    } else {
      const saved = await AppRegistry.create(form);
      toast.success('App added');
      setSaving(false);
      setShowForm(false);
      setLastSavedApp(saved);
      setPromptApp(saved);
    }
    loadApps();
    queryClient.invalidateQueries({ queryKey: ['connectedApps'] });
  }

  async function handleDelete(id, appName) {
    setDeletingApp({ id, appName });
  }

  async function confirmDelete() {
    await AppRegistry.delete(deletingApp.id);
    toast.success('App removed');
    setDeletingApp(null);
    loadApps();
  }

  async function handleSetupLegacy() {
    setSetupLoading(true);
    try {
      const response = await base44.functions.invoke('setupLegacyApps', {});
      setSetupResult(response.data);
      loadApps();
    } catch (error) {
      toast.error('Failed to load apps');
      console.error(error);
    } finally {
      setSetupLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="App Registry"
        description="Register and manage all your Base44 apps. Mark which ones are connected to this hub."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSetupLegacyOpen(true)}>
              <Wand2 className="w-4 h-4 mr-1.5" /> Setup Legacy Apps
            </Button>
            <Button size="sm" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-1.5" /> Add App
            </Button>
          </div>
        }
      />

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-card border border-primary/30 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-foreground">{editingApp ? 'Edit App' : 'Add New App'}</h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">App Name *</Label>
              <Input className="mt-1" placeholder="e.g. CRM App" value={form.app_name} onChange={e => setForm({ ...form, app_name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">URL</Label>
              <Input className="mt-1" placeholder="e.g. https://app.example.com" value={form.app_url} onChange={e => setForm({ ...form, app_url: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.app_category} onValueChange={v => setForm({ ...form, app_category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Audience</Label>
              <Input className="mt-1" placeholder="e.g. Internal team, Customers" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="hub_connected"
                checked={form.is_hub_connected}
                onChange={e => setForm({ ...form, is_hub_connected: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <Label htmlFor="hub_connected" className="text-xs cursor-pointer">Connected to this hub</Label>
            </div>
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea className="mt-1 h-16" placeholder="What does this app do?" value={form.app_description} onChange={e => setForm({ ...form, app_description: e.target.value })} />
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">App Integration (optional)</p>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-xs">Command URL</Label>
                <Input className="mt-1" placeholder="https://app.example.com/api/receiveCommand" value={form.command_url} onChange={e => setForm({ ...form, command_url: e.target.value })} />
                <p className="text-[10px] text-muted-foreground mt-1">Endpoint where Beacon sends commands to this app</p>
              </div>
              <div>
                <Label className="text-xs">Integration Token</Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input className="mt-1" type="password" placeholder="sk_..." value={form.integration_token} onChange={e => setForm({ ...form, integration_token: e.target.value })} />
                    <p className="text-[10px] text-muted-foreground mt-1">Secure token for authenticating command requests</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    const token = 'sk_' + Math.random().toString(36).substring(2, 32);
                    setForm({ ...form, integration_token: token });
                    toast.success('Token generated');
                  }}>Generate</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Saving...' : (editingApp ? 'Save Changes' : 'Save App')}
            </Button>
          </div>
        </div>
      )}

      {/* Connect Prompt CTA — shown only when apps exist */}
      {!loading && apps.length > 0 && (
        <div className="mb-4 p-3 bg-accent/5 border border-accent/20 rounded-xl flex items-center gap-3">
          <Zap className="w-4 h-4 text-accent flex-shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">To connect an app to Beacon Hub, click its <span className="text-accent font-medium">Connection Prompt</span> button in the list below — then paste the copied prompt into that app's Base44 chat.</p>
        </div>
      )}

      {/* App List */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-card border border-white/5 rounded-xl p-16 text-center shadow-md shadow-black/20">
          <AppWindow className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No apps registered yet.</p>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" /> Add Your First App</Button>
        </div>
      ) : (
        <div className="bg-card border border-white/5 rounded-xl overflow-hidden shadow-md shadow-black/20">
          <div className="grid grid-cols-12 gap-0 px-5 py-3 border-b border-white/5 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">App</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Hub</div>
            <div className="col-span-2">Connection Prompt</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
           {apps.map((app) => (
            <div key={app.id} className="grid grid-cols-12 gap-0 px-5 py-4 border-b border-white/5 last:border-0 items-center hover:bg-white/5 hover:brightness-110 transition-all duration-200">
              <div className="col-span-3">
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
              <div className="col-span-1">
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
                 <Button
                   size="sm"
                   variant="destructive"
                   className="h-6 text-[10px] px-2 whitespace-nowrap"
                   onClick={() => setConfirmingApp(app)}
                 >
                   Confirm Connection
                 </Button>
               )}
              </div>
              <div className="col-span-2">
                <Button
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 h-7 text-xs px-3"
                  onClick={() => setPromptApp(app)}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Click to Copy
                </Button>
              </div>
              <div className="col-span-2 flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(app)}>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(app.id, app.app_name)}>
                   <Trash2 className="w-3.5 h-3.5 text-destructive" />
                 </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {promptApp && (
         <ConnectionPromptModal
           app={promptApp}
           onClose={() => { setPromptApp(null); setLastSavedApp(null); }}
           isPostSave={!!lastSavedApp}
         />
       )}

       {confirmingApp && (
         <ConfirmConnectionDialog
           app={confirmingApp}
           onConfirm={async () => {
             await AppRegistry.update(confirmingApp.id, { is_hub_connected: true });
             setConfirmingApp(null);
             loadApps();
           }}
           onCancel={() => setConfirmingApp(null)}
         />
       )}

       {deletingApp && (
         <AlertDialog open={!!deletingApp} onOpenChange={() => setDeletingApp(null)}>
           <AlertDialogContent>
             <AlertDialogTitle>Delete {deletingApp.appName}?</AlertDialogTitle>
             <AlertDialogDescription>
               This will permanently remove this app from the registry. This action cannot be undone.
             </AlertDialogDescription>
             <div className="flex justify-end gap-2 mt-4">
               <AlertDialogCancel>Cancel</AlertDialogCancel>
               <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                 Delete
               </AlertDialogAction>
             </div>
           </AlertDialogContent>
         </AlertDialog>
       )}

       {setupLegacyOpen && (
         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
           <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 space-y-4">
             <div className="flex items-center justify-between">
               <h2 className="text-sm font-semibold text-foreground">Setup Legacy Apps</h2>
               <button onClick={() => { setSetupLegacyOpen(false); setSetupResult(null); }} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                 <X className="w-4 h-4 text-muted-foreground" />
               </button>
             </div>

             {!setupResult ? (
               <div className="space-y-3">
                 <p className="text-xs text-muted-foreground">
                   This generates security credentials for your apps so they can receive commands from Beacon. You'll get a prompt to paste into each app's AI chat.
                 </p>
                 <div className="flex justify-end gap-2">
                   <Button variant="outline" size="sm" onClick={() => { setSetupLegacyOpen(false); setSetupResult(null); }}>Cancel</Button>
                   <Button size="sm" onClick={handleSetupLegacy} disabled={setupLoading}>
                     {setupLoading ? 'Setting up...' : 'Setup Now'}
                   </Button>
                 </div>
               </div>
             ) : setupResult.apps.length === 0 ? (
               <div className="space-y-3">
                 <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                   <p className="text-xs font-medium text-amber-400">No Apps Ready</p>
                   <p className="text-xs text-muted-foreground mt-1">
                     Mark apps as "Connected to this hub" in the registry first, then run setup again.
                   </p>
                 </div>
                 <Button size="sm" className="w-full" onClick={() => { setSetupLegacyOpen(false); setSetupResult(null); }}>
                   Close
                 </Button>
               </div>
             ) : (
               <div className="space-y-4">
                 <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                   <p className="text-xs font-medium text-emerald-400 mb-1">✓ Implementation Guide</p>
                   <p className="text-xs text-muted-foreground">
                     {setupResult.apps.length} app(s) need endpoints implemented. Copy the prompt for each app and paste it into that app's AI chat.
                   </p>
                 </div>

                 <div className="space-y-2 max-h-72 overflow-y-auto">
                   {setupResult.apps.map((app, idx) => (
                     <div key={idx} className="p-4 rounded-lg bg-secondary/30 border border-white/10 space-y-3">
                       <div className="flex items-center justify-between">
                         <p className="text-sm font-medium text-foreground">{app.app_name}</p>
                         <span className="text-[10px] text-muted-foreground">Step {idx + 1}</span>
                       </div>
                       
                       <div className="space-y-2 text-[11px]">
                         <p className="text-muted-foreground"><span className="text-accent font-medium">Command URL:</span> <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">{app.command_url}</code></p>
                         <p className="text-muted-foreground"><span className="text-accent font-medium">Token:</span> <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">{app.integration_token}</code></p>
                       </div>

                       <button
                         onClick={() => {
                           const prompt = `I need to create a POST endpoint at "${app.command_url}" that:
1. Receives a JSON body with "command" and "payload" fields
2. Validates that the "Authorization: Bearer ${app.integration_token}" header matches our token
3. Processes different commands (e.g., "update_app_name", "sync_branding")
4. Returns JSON with success/error status

Create this endpoint in our app's backend. Make it secure and handle errors properly.`;
                           navigator.clipboard.writeText(prompt);
                           toast.success('Prompt copied! Paste it into this app\'s AI chat');
                         }}
                         className="w-full py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors text-xs font-medium"
                       >
                         📋 Copy Prompt for {app.app_name}
                       </button>
                     </div>
                   ))}
                 </div>

                 <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
                   <p className="text-[11px] text-blue-400 font-medium">How to complete:</p>
                   <ol className="text-[10px] text-blue-400 space-y-1 list-decimal list-inside">
                     <li>Copy the prompt above for the first app</li>
                     <li>Go to that app's Base44 chat</li>
                     <li>Paste the prompt and let the AI create the endpoint</li>
                     <li>Repeat for each app</li>
                   </ol>
                 </div>

                 <Button size="sm" className="w-full" onClick={() => { setSetupLegacyOpen(false); setSetupResult(null); }}>
                   Done
                 </Button>
               </div>
             )}
           </div>
         </div>
       )}
       </div>
       );
       }