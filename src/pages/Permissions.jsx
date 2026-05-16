import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';

export default function Permissions() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [newLevel, setNewLevel] = useState({ name: '', description: '', app_restrictions: [], page_restrictions: [], individual_permissions: [] });

  const { data: levels = [], isLoading } = useQuery({
    queryKey: ['userAccessLevels'],
    queryFn: () => base44.entities.UserAccessLevel.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserAccessLevel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAccessLevels'] });
      setEditingId(null);
      toast.success('Access level updated');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UserAccessLevel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAccessLevels'] });
      setShowNew(false);
      setNewLevel({ name: '', description: '', app_restrictions: [], page_restrictions: [], individual_permissions: [] });
      toast.success('Access level created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UserAccessLevel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAccessLevels'] });
      toast.success('Access level deleted');
    },
  });

  const startEdit = (level) => {
    setEditingId(level.id);
    setEditForm({
      name: level.name,
      description: level.description,
      app_restrictions: level.app_restrictions || [],
      page_restrictions: level.page_restrictions || [],
      individual_permissions: level.individual_permissions || [],
    });
  };

  const handleArrayInput = (value, setter, field) => {
    const items = value.split('\n').filter(v => v.trim());
    setter(items);
  };

  return (
    <div>
      <PageHeader
        title="Permissions Management"
        description="Define access level clusters, app restrictions, page restrictions, and individual permissions."
        actions={
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> New Access Level
          </Button>
        }
      />

      <div className="space-y-4 mt-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : levels.length === 0 && !showNew ? (
          <div className="bg-card border border-white/5 rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No access levels yet. Create one to get started.</p>
          </div>
        ) : (
          levels.map((level) => (
            <div key={level.id} className="bg-card border border-white/5 rounded-xl p-5">
              {editingId === level.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="mt-1 h-16"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">App Restrictions (one per line)</Label>
                    <Textarea
                      value={editForm.app_restrictions.join('\n')}
                      onChange={(e) => handleArrayInput(e.target.value, (items) => setEditForm({ ...editForm, app_restrictions: items }), 'app_restrictions')}
                      className="mt-1 h-20 font-mono text-xs"
                      placeholder="app_id_1&#10;app_id_2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Page Restrictions (one per line)</Label>
                    <Textarea
                      value={editForm.page_restrictions.join('\n')}
                      onChange={(e) => handleArrayInput(e.target.value, (items) => setEditForm({ ...editForm, page_restrictions: items }), 'page_restrictions')}
                      className="mt-1 h-20 font-mono text-xs"
                      placeholder="/dashboard&#10;/settings"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Individual Permissions (one per line)</Label>
                    <Textarea
                      value={editForm.individual_permissions.join('\n')}
                      onChange={(e) => handleArrayInput(e.target.value, (items) => setEditForm({ ...editForm, individual_permissions: items }), 'individual_permissions')}
                      className="mt-1 h-20 font-mono text-xs"
                      placeholder="perm_edit_users&#10;perm_view_reports"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: level.id, data: editForm })}>
                      <Save className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{level.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(level)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(level.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs mt-3 pt-3 border-t border-white/5">
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">Apps</p>
                      <p className="text-foreground">{level.app_restrictions?.length || 0} restricted</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">Pages</p>
                      <p className="text-foreground">{level.page_restrictions?.length || 0} restricted</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium mb-1">Permissions</p>
                      <p className="text-foreground">{level.individual_permissions?.length || 0} available</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {showNew && (
          <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">New Access Level</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="e.g. Manager"
                  value={newLevel.name}
                  onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                placeholder="What does this access level include?"
                value={newLevel.description}
                onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                className="mt-1 h-16"
              />
            </div>
            <div>
              <Label className="text-xs">App Restrictions (one per line)</Label>
              <Textarea
                value={newLevel.app_restrictions.join('\n')}
                onChange={(e) => handleArrayInput(e.target.value, (items) => setNewLevel({ ...newLevel, app_restrictions: items }), 'app_restrictions')}
                className="mt-1 h-20 font-mono text-xs"
                placeholder="app_id_1&#10;app_id_2"
              />
            </div>
            <div>
              <Label className="text-xs">Page Restrictions (one per line)</Label>
              <Textarea
                value={newLevel.page_restrictions.join('\n')}
                onChange={(e) => handleArrayInput(e.target.value, (items) => setNewLevel({ ...newLevel, page_restrictions: items }), 'page_restrictions')}
                className="mt-1 h-20 font-mono text-xs"
                placeholder="/dashboard&#10;/settings"
              />
            </div>
            <div>
              <Label className="text-xs">Individual Permissions (one per line)</Label>
              <Textarea
                value={newLevel.individual_permissions.join('\n')}
                onChange={(e) => handleArrayInput(e.target.value, (items) => setNewLevel({ ...newLevel, individual_permissions: items }), 'individual_permissions')}
                className="mt-1 h-20 font-mono text-xs"
                placeholder="perm_edit_users&#10;perm_view_reports"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button size="sm" onClick={() => createMutation.mutate(newLevel)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Create
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}