import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Trash2, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';

export default function PendingTasks() {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['pendingTasks'],
    queryFn: () => base44.entities.PendingTask.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PendingTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingTasks'] });
      setEditingId(null);
      setSelectedTask(null);
      toast.success('Task updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PendingTask.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingTasks'] });
      setSelectedTask(null);
      toast.success('Task deleted');
    },
  });

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      description: task.description,
      app: task.app,
      status: task.status,
      priority: task.priority,
      category: task.category,
      blocked_by: task.blocked_by,
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive';
      case 'medium':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'in_progress':
        return 'bg-primary/10 text-primary';
      case 'blocked':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      integration: 'Integration',
      infrastructure: 'Infrastructure',
      decision: 'Decision Needed',
      feature: 'Feature',
      bug: 'Bug',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
  });

  return (
    <div>
      <PageHeader
        title="Pending Tasks"
        description="Track all pending items across your apps that require action or infrastructure setup."
      />

      <div className="space-y-3 mt-6">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : tasks.length === 0 ? (
          <div className="bg-card border border-white/5 rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No pending tasks</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="w-full bg-card border border-white/5 rounded-xl p-5 hover:border-white/10 hover:shadow-lg hover:shadow-black/30 hover:brightness-110 transition-all duration-200 text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{task.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                      {getCategoryLabel(task.category)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      {task.app}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </button>
          ))
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-white/5 rounded-xl w-full max-w-2xl shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-card">
              <h2 className="text-lg font-semibold text-foreground">Task Details</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {editingId === selectedTask.id ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="mt-1 h-24"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">App</Label>
                      <Input
                        value={editForm.app}
                        onChange={(e) => setEditForm({ ...editForm, app: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Priority</Label>
                      <Select
                        value={editForm.priority}
                        onValueChange={(value) => setEditForm({ ...editForm, priority: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select
                        value={editForm.category}
                        onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="integration">Integration</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="decision">Decision Needed</SelectItem>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Blocked By (if applicable)</Label>
                    <Textarea
                      value={editForm.blocked_by || ''}
                      onChange={(e) => setEditForm({ ...editForm, blocked_by: e.target.value })}
                      className="mt-1 h-16"
                      placeholder="What's blocking this task?"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        updateMutation.mutate({
                          id: selectedTask.id,
                          data: editForm,
                        })
                      }
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Title</p>
                    <p className="text-sm text-foreground mt-1">{selectedTask.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Description</p>
                    <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">App</p>
                      <p className="text-sm text-foreground mt-1">{selectedTask.app}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Created</p>
                      <p className="text-sm text-foreground mt-1">
                        {new Date(selectedTask.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Status</p>
                      <p className={`text-xs mt-1 px-2 py-1 rounded w-fit ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Priority</p>
                      <p className={`text-xs mt-1 px-2 py-1 rounded w-fit ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Category</p>
                      <p className="text-xs mt-1 px-2 py-1 rounded w-fit bg-muted text-muted-foreground">
                        {getCategoryLabel(selectedTask.category)}
                      </p>
                    </div>
                  </div>
                  {selectedTask.blocked_by && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Blocked By</p>
                      <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                        {selectedTask.blocked_by}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(selectedTask)}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(selectedTask.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}