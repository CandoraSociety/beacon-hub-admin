import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Palette, Save, Plus, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import ColorSwatch from '@/components/shared/ColorSwatch';
import BrandPreview from '@/components/branding/BrandPreview';
import BrandingIntegrationGuide from '@/components/branding/BrandingIntegrationGuide';
import { applyBrandingColors } from '@/lib/useBranding';
import ApplyBrandingModal from '@/components/branding/ApplyBrandingModal';

export default function Branding() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newConfig, setNewConfig] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['hubConfigs', 'branding'],
    queryFn: async () => {
      const all = await base44.entities.HubConfig.list();
      return all.filter(c => c.category === 'branding');
    },
  });

  const reapplyColors = (updatedConfigs) => {
    const primary = updatedConfigs.find(c => c.key === 'brand_primary_color')?.value;
    const secondary = updatedConfigs.find(c => c.key === 'brand_secondary_color')?.value;
    const background = updatedConfigs.find(c => c.key === 'brand_background_color')?.value;
    applyBrandingColors(primary, secondary, background);
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HubConfig.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hubConfigs'] });
      const all = await base44.entities.HubConfig.list();
      reapplyColors(all.filter(c => c.category === 'branding'));
      setEditingId(null);
      toast.success('Config updated');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HubConfig.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hubConfigs'] });
      const all = await base44.entities.HubConfig.list();
      reapplyColors(all.filter(c => c.category === 'branding'));
      setNewConfig(null);
      toast.success('Config created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HubConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hubConfigs'] });
      toast.success('Config deleted');
    },
  });

  const startEdit = (config) => {
    setEditingId(config.id);
    setEditForm({ key: config.key, value: config.value, description: config.description });
  };

  const primaryColor = configs.find(c => c.key === 'brand_primary_color')?.value;
  const secondaryColor = configs.find(c => c.key === 'brand_secondary_color')?.value;
  const backgroundColor = configs.find(c => c.key === 'brand_background_color')?.value;

  const isColorKey = (key) => key?.toLowerCase().includes('color');

  return (
    <div>
      <PageHeader
        title="Branding Control Panel"
        description="Manage your organization's visual identity. Changes here propagate to all connected apps."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNewConfig({ key: '', value: '', description: '', category: 'branding' })}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Config
            </Button>
            <Button size="sm" onClick={() => setShowApplyModal(true)}>
              <Zap className="w-4 h-4 mr-1.5" /> Apply Changes
            </Button>
          </div>
        }
      />

      {/* Quick Color Controls */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[
          { key: 'brand_primary_color', label: 'Primary Color', value: primaryColor },
          { key: 'brand_secondary_color', label: 'Secondary Color', value: secondaryColor },
          { key: 'brand_background_color', label: 'Background Color', value: backgroundColor },
        ].map(({ key, label, value }) => (
          <div key={key} className="bg-card border border-border rounded-xl p-4">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <div className="flex gap-2 mt-2 items-center">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => {
                  const config = configs.find(c => c.key === key);
                  if (config) {
                    updateMutation.mutate({ id: config.id, data: { value: e.target.value } });
                  } else {
                    createMutation.mutate({
                      key,
                      value: e.target.value,
                      description: label,
                      category: 'branding',
                    });
                  }
                }}
                className="w-12 h-10 rounded-md border border-border cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-primary/80">{value || 'Not set'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Preview */}
      {(primaryColor || secondaryColor) && (
        <BrandPreview primary={primaryColor} secondary={secondaryColor} />
      )}

      <BrandingIntegrationGuide />

      {/* Config List */}
      <div className="space-y-3 mt-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : configs.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Palette className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No branding configs yet. Add your first one.</p>
          </div>
        ) : (
          configs.map((config) => (
            <div key={config.id} className="bg-card border border-border rounded-xl p-5">
              {editingId === config.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Key</Label>
                      <Input
                        value={editForm.key}
                        onChange={(e) => setEditForm({ ...editForm, key: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Value</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={editForm.value}
                          onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                        />
                        {isColorKey(editForm.key) && (
                          <input
                            type="color"
                            value={editForm.value || '#000000'}
                            onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                            className="w-10 h-9 rounded-md border border-border cursor-pointer bg-transparent"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="mt-1 h-16"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: config.id, data: editForm })}>
                      <Save className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {isColorKey(config.key) && <ColorSwatch color={config.value} size="sm" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium text-foreground">{config.key}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{config.description || 'No description'}</p>
                    <p className="text-xs font-mono text-primary/80 mt-1">{config.value}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(config)}>Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(config.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* New Config Form */}
        {newConfig && (
          <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">New Branding Config</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Key</Label>
                <Input
                  placeholder="e.g. brand_primary_color"
                  value={newConfig.key}
                  onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Value</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="e.g. #6C63FF"
                    value={newConfig.value}
                    onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                  />
                  {isColorKey(newConfig.key) && (
                    <input
                      type="color"
                      value={newConfig.value || '#000000'}
                      onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                      className="w-10 h-9 rounded-md border border-border cursor-pointer bg-transparent"
                    />
                  )}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                placeholder="Describe what this config controls..."
                value={newConfig.description}
                onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                className="mt-1 h-16"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setNewConfig(null)}>Cancel</Button>
              <Button size="sm" onClick={() => createMutation.mutate(newConfig)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Create
              </Button>
            </div>
          </div>
        )}
      </div>
      {showApplyModal && <ApplyBrandingModal onClose={() => setShowApplyModal(false)} />}
    </div>
  );
}