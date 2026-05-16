import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function AddTaskModal({ open, onOpenChange, onTaskAdded }) {
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState([]);
  const [showCustomAppInput, setShowCustomAppInput] = useState(false);
  const [customAppName, setCustomAppName] = useState('');
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    app: '',
    status: 'pending',
    priority: 'medium',
    category: 'feature',
    blocked_by: '',
  });

  useEffect(() => {
    if (open) {
      fetchApps();
    }
  }, [open]);

  const fetchApps = async () => {
    try {
      const tasks = await base44.entities.PendingTask.list();
      const uniqueApps = new Set(['general', 'Beacon', 'OneDrive']);
      tasks.forEach(task => {
        if (task.app) uniqueApps.add(task.app);
      });
      setApps(Array.from(uniqueApps).sort());
    } catch (error) {
      console.error('Failed to fetch apps:', error);
    }
  };

  const handleAppSelect = (value) => {
    if (value === 'other') {
      setShowCustomAppInput(true);
      setFormData({ ...formData, app: '' });
    } else {
      setShowCustomAppInput(false);
      setCustomAppName('');
      setFormData({ ...formData, app: value });
    }
  };

  const handleCustomAppSubmit = () => {
    if (!customAppName.trim()) {
      toast.error('Please enter an app/category name');
      return;
    }
    setShowAddCategoryDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.app.trim()) {
      toast.error('Title and app are required');
      return;
    }

    // If custom app was entered, show dialog before submitting
    if (customAppName.trim()) {
      setShowAddCategoryDialog(true);
      return;
    }

    setLoading(true);
    try {
      await base44.entities.PendingTask.create(formData);
      toast.success('Task created successfully');
      setFormData({
        title: '',
        description: '',
        app: '',
        status: 'pending',
        priority: 'medium',
        category: 'feature',
        blocked_by: '',
      });
      setShowCustomAppInput(false);
      setCustomAppName('');
      onOpenChange(false);
      if (onTaskAdded) onTaskAdded();
    } catch (error) {
      toast.error('Failed to create task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewCategory = async (addToDisplay) => {
    const finalApp = addToDisplay ? customAppName : 'Other';
    setFormData({ ...formData, app: finalApp });
    setShowCustomAppInput(false);
    setCustomAppName('');
    setShowAddCategoryDialog(false);

    // Now submit the task
    setLoading(true);
    try {
      await base44.entities.PendingTask.create({ ...formData, app: finalApp });
      toast.success('Task created successfully');
      setFormData({
        title: '',
        description: '',
        app: '',
        status: 'pending',
        priority: 'medium',
        category: 'feature',
        blocked_by: '',
      });
      onOpenChange(false);
      if (onTaskAdded) onTaskAdded();
    } catch (error) {
      toast.error('Failed to create task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Create a new pending task for your hub</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Title *</label>
            <Input
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">App/Category *</label>
            {!showCustomAppInput ? (
              <Select value={formData.app} onValueChange={handleAppSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an app/category" />
                </SelectTrigger>
                <SelectContent>
                  {apps.map((app) => (
                    <SelectItem key={app} value={app}>
                      {app}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other (Custom)</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Enter new app/category name"
                  value={customAppName}
                  onChange={(e) => setCustomAppName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomAppSubmit();
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCustomAppSubmit}
                    variant="default"
                    className="flex-1"
                  >
                    Continue
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setShowCustomAppInput(false);
                      setCustomAppName('');
                      setFormData({ ...formData, app: '' });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
            <Textarea
              placeholder="Detailed description of the task"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Status</label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
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

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Priority</label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="integration">Integration</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="decision">Decision</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Blocked By</label>
            <Input
              placeholder="What's blocking this task (if any)"
              value={formData.blocked_by}
              onChange={(e) => setFormData({ ...formData, blocked_by: e.target.value })}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>

      <AlertDialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to add "{customAppName}" as a new app/category to the display?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={() => handleAddNewCategory(false)}>
              No, use "Other"
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAddNewCategory(true)}>
              Yes, add to display
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}