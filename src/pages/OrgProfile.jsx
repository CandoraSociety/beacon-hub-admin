import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Save, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';

const fields = [
  { key: 'org_name', label: 'Organization Name', required: true },
  { key: 'org_slug', label: 'Slug' },
  { key: 'org_website', label: 'Website URL' },
  { key: 'contact_email', label: 'Contact Email' },
  { key: 'industry', label: 'Industry' },
  { key: 'timezone', label: 'Timezone' },
  { key: 'org_logo_url', label: 'Logo URL' },
];

export default function OrgProfile() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['orgProfiles'],
    queryFn: () => base44.entities.OrgProfile.list(),
  });

  const profile = profiles[0];

  useEffect(() => {
    if (profile) {
      setForm({ ...profile });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data) => {
      if (profile) {
        return base44.entities.OrgProfile.update(profile.id, data);
      }
      return base44.entities.OrgProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgProfiles'] });
      toast.success(profile ? 'Profile updated' : 'Profile created');
    },
  });

  const handleSave = () => {
    const { id, created_date, updated_date, created_by, ...data } = form;
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Org Profile" />
        <div className="space-y-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Organization Profile"
        description="Manage your organization's identity and contact information."
        actions={
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="w-4 h-4 mr-1.5" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      {/* Logo Preview */}
      <div className="bg-card border border-white/5 rounded-xl p-6 mb-6 shadow-md shadow-black/20">
        <div className="flex items-center gap-4">
          {form.org_logo_url ? (
            <img src={form.org_logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-border" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/15 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground">{form.org_name || 'Your Organization'}</h3>
            <p className="text-sm text-muted-foreground">{form.org_description || 'Add a description below'}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-white/5 rounded-xl p-6 shadow-md shadow-black/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map(({ key, label, required }) => (
            <div key={key}>
              <Label className="text-xs text-muted-foreground">
                {label} {required && <span className="text-destructive">*</span>}
              </Label>
              <Input
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1.5"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea
            value={form.org_description || ''}
            onChange={(e) => setForm({ ...form, org_description: e.target.value })}
            className="mt-1.5 h-24"
            placeholder="Describe your organization..."
          />
        </div>
      </div>
    </div>
  );
}