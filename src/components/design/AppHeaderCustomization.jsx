import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AppRegistry } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AppHeaderCustomization() {
  const [apps, setApps] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [form, setForm] = useState({ display_name: '', header_style: 'standard', header_logo_url: '' });

  const { data: appList = [], isLoading } = useQuery({
    queryKey: ['appRegistry'],
    queryFn: async () => {
      const records = await AppRegistry.list();
      setApps(records);
      return records;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => AppRegistry.update(editingId, data),
    onSuccess: () => {
      toast.success('App header updated');
      setEditingId(null);
      setApps(apps.map(a => a.id === editingId ? { ...a, ...form } : a));
    },
  });

  const handleLogoUpload = async (e, appId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(appId);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const app = apps.find(a => a.id === appId);
      await AppRegistry.update(appId, { header_logo_url: file_url });
      setApps(apps.map(a => a.id === appId ? { ...a, header_logo_url: file_url } : a));
      toast.success('Logo uploaded');
    } catch (err) {
      toast.error('Failed to upload logo');
    } finally {
      setUploadingId(null);
    }
  };

  const startEdit = (app) => {
    setEditingId(app.id);
    setForm({
      display_name: app.display_name || '',
      header_style: app.header_style || 'standard',
      header_logo_url: app.header_logo_url || '',
    });
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="text-xs text-muted-foreground">Loading apps...</div>
      ) : appList.length === 0 ? (
        <div className="text-xs text-muted-foreground">No apps registered yet.</div>
      ) : (
        appList.map((app) => (
          <div key={app.id} className="bg-muted/30 border border-white/5 rounded-lg p-4">
            {editingId === app.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Display Name</Label>
                    <Input
                      className="mt-1"
                      placeholder="Leave blank to use app name"
                      value={form.display_name}
                      onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Header Style</Label>
                    <Select value={form.header_style} onValueChange={(v) => setForm({ ...form, header_style: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="prominent">Prominent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => updateMutation.mutate(form)}>Save</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{app.app_name}</p>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span>Display: {app.display_name || '(using app name)'}</span>
                    <span>•</span>
                    <span>Style: {app.header_style || 'standard'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {form.header_logo_url && (
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <ImageIcon className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <label className="px-3 py-1.5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <span className="text-xs text-muted-foreground">{uploadingId === app.id ? 'Uploading...' : 'Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, app.id)}
                      disabled={uploadingId === app.id}
                      className="hidden"
                    />
                  </label>
                  <Button variant="outline" size="sm" onClick={() => startEdit(app)}>Edit</Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}