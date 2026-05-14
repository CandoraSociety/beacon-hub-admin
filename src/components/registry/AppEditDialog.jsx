import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AppEditDialog({ app, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    app_name: app.app_name || '',
    app_slug: app.app_slug || '',
    app_description: app.app_description || '',
    app_category: app.app_category || 'internal',
    app_url: app.app_url || '',
    audience: app.audience || '',
    is_hub_connected: app.is_hub_connected || false,
    status: app.status || 'development',
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.AppRegistry.update(app.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      toast.success('App updated');
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit App</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">App Name</Label>
              <Input value={form.app_name} onChange={(e) => setForm({ ...form, app_name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Slug</Label>
              <Input value={form.app_slug} onChange={(e) => setForm({ ...form, app_slug: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={form.app_description} onChange={(e) => setForm({ ...form, app_description: e.target.value })} className="mt-1 h-16" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.app_category} onValueChange={(v) => setForm({ ...form, app_category: v })}>
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
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">App URL</Label>
            <Input value={form.app_url} onChange={(e) => setForm({ ...form, app_url: e.target.value })} className="mt-1" placeholder="https://..." />
          </div>
          <div>
            <Label className="text-xs">Audience</Label>
            <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="mt-1" />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label className="text-xs">Hub Connected</Label>
            <Switch checked={form.is_hub_connected} onCheckedChange={(v) => setForm({ ...form, is_hub_connected: v })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}