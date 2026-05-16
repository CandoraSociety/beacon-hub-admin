import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle2, Clock, Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from '@/components/shared/PageHeader';
import AddTaskModal from '@/components/tasks/AddTaskModal';

export default function PendingTasksList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [connectedApps, setConnectedApps] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allTasks, apps] = await Promise.all([
          base44.entities.PendingTask.list(),
          base44.entities.AppRegistry.list(),
        ]);
        setTasks(allTasks);
        const connected = apps.filter(a => a.is_hub_connected && a.status === 'active');
        setConnectedApps(connected.map(a => a.app_name));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Subscribe to real-time updates
    const unsubscribe = base44.entities.PendingTask.subscribe(() => {
      fetchData();
    });

    return unsubscribe;
  }, []);

  const activeTasks = tasks.filter(t => !t.archived);
  const archivedTasks = tasks.filter(t => t.archived);
  const displayedTasks = showArchived ? archivedTasks : activeTasks;

  // Group active tasks by app and include all connected apps
  const tasksByApp = activeTasks.reduce((acc, task) => {
    const app = task.app || 'general';
    if (!acc[app]) acc[app] = 0;
    acc[app]++;
    return acc;
  }, {});

  // Get all unique apps from tasks and connected apps
  const allUniqueApps = new Set(['general', 'Beacon', 'OneDrive']);
  Object.keys(tasksByApp).forEach(app => allUniqueApps.add(app));
  connectedApps.forEach(app => allUniqueApps.add(app));
  
  const allAppsWithCounts = Array.from(allUniqueApps)
    .filter(a => a !== 'Beacon' && a !== 'OneDrive')
    .sort()
    .reduce((arr, app) => [...arr, { name: app, count: tasksByApp[app] || 0 }], [
      { name: 'general', count: tasksByApp['general'] || 0 },
      { name: 'Beacon', count: tasksByApp['Beacon'] || 0 },
      { name: 'OneDrive', count: tasksByApp['OneDrive'] || 0 },
    ]);

  const handleStatusChange = async (taskId, newStatus) => {
    const isArchivable = newStatus === 'completed' || newStatus === 'archived';
    try {
      await base44.entities.PendingTask.update(taskId, {
        status: newStatus,
        archived: isArchivable ? true : false,
      });
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, status: newStatus, archived: isArchivable }
            : t
        )
      );
    } catch (error) {
      console.error('Failed to update task:', error);
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-primary" />;
      default:
        return <Zap className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {showArchived ? 'Archived Tasks' : 'Pending Tasks'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {showArchived
              ? `${archivedTasks.length} archived task${archivedTasks.length !== 1 ? 's' : ''}`
              : `${activeTasks.length} active task${activeTasks.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
          <Button 
            variant={showArchived ? 'default' : 'outline'} 
            onClick={() => setShowArchived(!showArchived)}
            size="sm"
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </Button>
        </div>
      </div>

      <AddTaskModal open={modalOpen} onOpenChange={setModalOpen} onTaskAdded={() => {}} />

      {!showArchived && connectedApps.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {allAppsWithCounts.map(({ name, count }) => (
            <div
              key={name}
              className="bg-card border border-white/5 rounded-lg p-4 text-center hover:border-white/10 transition-colors"
            >
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{name}</p>
              <p className="text-2xl font-bold text-primary mt-2">{count}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="bg-card border border-white/5 rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No pending tasks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-card border border-white/5 rounded-xl p-5 hover:border-white/10 hover:shadow-lg hover:shadow-black/30 hover:brightness-110 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{task.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{task.category && `${task.category.charAt(0).toUpperCase() + task.category.slice(1)} • `}{task.app}</p>
                    {task.blocked_by && (
                      <p className="text-xs text-destructive/80 mt-2">Blocked: {task.blocked_by}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <Select value={task.status} onValueChange={(newStatus) => handleStatusChange(task.id, newStatus)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}