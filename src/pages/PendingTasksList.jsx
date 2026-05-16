import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';

export default function PendingTasksList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const allTasks = await base44.entities.PendingTask.list();
        setTasks(allTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const displayedTasks = showCompleted 
    ? tasks 
    : tasks.filter(t => t.status !== 'completed');

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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Pending Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Track all pending work items across your apps</p>
        </div>
        <Button 
          variant={showCompleted ? 'default' : 'outline'} 
          onClick={() => setShowCompleted(!showCompleted)}
          size="sm"
        >
          {showCompleted ? 'Hide Completed' : 'Show Completed'}
        </Button>
      </div>

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}