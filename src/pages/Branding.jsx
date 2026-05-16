import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Palette, Save, Plus, Trash2, Zap, Edit2, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import ColorSwatch from '@/components/shared/ColorSwatch';
import BrandPreview from '@/components/branding/BrandPreview';
import BrandingIntegrationGuide from '@/components/branding/BrandingIntegrationGuide';
import { applyBrandingColors } from '@/lib/useBranding';
import ApplyBrandingModal from '@/components/branding/ApplyBrandingModal';
import ImageCropperModal from '@/components/branding/ImageCropperModal';

export default function Branding() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newConfig, setNewConfig] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [headerStyle, setHeaderStyle] = useState('standard');
  const [headerLogoUrl, setHeaderLogoUrl] = useState('');
  const [cropperFile, setCropperFile] = useState(null);
  const fileInputRef = useRef(null);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['hubConfigs', 'branding'],
    queryFn: async () => {
      const all = await base44.entities.HubConfig.list();
      return all.filter(c => c.category === 'branding');
    },
  });

  // Load saved header settings
  React.useEffect(() => {
    const savedStyle = configs.find(c => c.key === 'header_style')?.value;
    const savedLogo = configs.find(c => c.key === 'header_logo_url')?.value;
    if (savedStyle) setHeaderStyle(savedStyle);
    if (savedLogo) setHeaderLogoUrl(savedLogo);
  }, [configs]);

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

  const QUICK_KEYS = ['brand_primary_color', 'brand_secondary_color', 'brand_background_color'];
  const listConfigs = configs.filter(c => !QUICK_KEYS.includes(c.key));

  const isColorKey = (key) => key?.toLowerCase().includes('color');

  // Returns black or white depending on which has better contrast against a hex bg
  const getContrastColor = (hex) => {
    if (!hex) return null;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div>
      <PageHeader
         title="Design Control Panel"
         description="Manage your organization's visual identity and app headers. Changes here propagate to all connected apps."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNewConfig({ key: '', value: '', description: '', category: 'branding' })}
              className="border-white/20 hover:border-white/40"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Config
            </Button>
            <Button size="sm" onClick={() => setShowApplyModal(true)} disabled={!headerStyle && !headerLogoUrl}>
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
        ].map(({ key, label, value }) => {
          const contrastText = getContrastColor(value);
          const hasColor = !!value;
          return (
            <label
              key={key}
              className="relative rounded-xl p-4 shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/30 hover:brightness-110 transition-all duration-200 cursor-pointer block overflow-hidden border border-white/10"
              style={hasColor ? { backgroundColor: value } : {}}
            >
              {!hasColor && <div className="absolute inset-0 bg-card" />}
              <div className="relative z-10">
                <p className="text-xs font-medium" style={{ color: contrastText ? (contrastText === '#000000' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.75)') : undefined }}>{label}</p>
                <p className="text-sm font-mono font-semibold mt-1" style={{ color: contrastText ?? undefined }}>{value || 'Not set'}</p>
              </div>
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => {
                  const config = configs.find(c => c.key === key);
                  if (config) {
                    updateMutation.mutate({ id: config.id, data: { value: e.target.value } });
                  } else {
                    createMutation.mutate({ key, value: e.target.value, description: label, category: 'branding' });
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
            </label>
          );
        })}
      </div>

      {/* Live Preview */}
      {(primaryColor || secondaryColor) && (
        <BrandPreview primary={primaryColor} secondary={secondaryColor} />
      )}

      <BrandingIntegrationGuide />

      {/* App Header Customization */}
      <div className="mt-8 bg-card border border-white/5 rounded-xl p-6 shadow-md shadow-black/20">
        <h3 className="text-sm font-semibold text-foreground mb-4">App Header Settings</h3>
        <p className="text-xs text-muted-foreground mb-6">Set default header style and logo. Changes save automatically.</p>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Header Style</Label>
            <Select value={headerStyle} onValueChange={(value) => {
              setHeaderStyle(value);
              // Auto-save to HubConfig
              const existing = configs.find(c => c.key === 'header_style');
              if (existing) {
                updateMutation.mutate({ id: existing.id, data: { value } });
              } else {
                createMutation.mutate({ key: 'header_style', value, description: 'Header display style', category: 'branding' });
              }
            }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="prominent">Prominent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Header Logo</Label>
            <div className="flex items-center gap-2 mt-1">
              {headerLogoUrl && (
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                  <img src={headerLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex-1 px-4 py-2 border border-white/10 rounded-md hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload Logo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCropperFile(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={() => setShowApplyModal(true)} disabled={!headerStyle && !headerLogoUrl}>
            <Zap className="w-4 h-4 mr-1.5" /> Apply to Apps
          </Button>
        </div>
      </div>

      {/* Config List — excludes the 3 color keys managed by quick controls above */}
      <div className="space-y-3 mt-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : listConfigs.length === 0 && !newConfig ? (
          <div className="bg-card border border-white/5 rounded-xl p-8 text-center shadow-md shadow-black/20">
            <p className="text-sm text-muted-foreground">All branding colors are managed above. Use "Add Config" for additional custom settings (e.g. logo URL, font).</p>
          </div>
        ) : (
          listConfigs.map((config) => (
            <div key={config.id} className="bg-card border border-white/5 rounded-xl p-5 shadow-md shadow-black/20 hover:border-white/10 hover:shadow-lg hover:shadow-black/30 hover:brightness-110 transition-all duration-200">
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
                            className="w-10 h-9 rounded-md border border-white/10 cursor-pointer bg-transparent"
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
      {showApplyModal && <ApplyBrandingModal onClose={() => setShowApplyModal(false)} headerStyle={headerStyle} headerLogoUrl={headerLogoUrl} />}

      {cropperFile && (
        <ImageCropperModal
          imageFile={cropperFile}
          onCancel={() => setCropperFile(null)}
          onCrop={async (blob) => {
            try {
              const file = new File([blob], 'logo.jpg', { type: 'image/jpeg' });
              const { file_url } = await base44.integrations.Core.UploadFile({ file });
              setHeaderLogoUrl(file_url);
              const existing = configs.find(c => c.key === 'header_logo_url');
              if (existing) {
                updateMutation.mutate({ id: existing.id, data: { value: file_url } });
              } else {
                createMutation.mutate({ key: 'header_logo_url', value: file_url, description: 'Header logo URL', category: 'branding' });
              }
              toast.success('Logo uploaded');
              setCropperFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (err) {
              toast.error('Failed to upload logo');
            }
          }}
        />
      )}
    </div>
  );
}