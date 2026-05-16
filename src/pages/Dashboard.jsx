import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AppRegistry, OrgProfile, UserAccessLevel } from '@/api/entities';
import { Palette, Building2, AppWindow, Rocket, Wifi, ArrowRight, MessageCircle, X, Users, Bot, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

const quickLinks = [
  { path: '/branding', label: 'Design', description: 'Manage colors & visual identity', icon: Palette },
  { path: '/org-profile', label: 'Org Profile', description: 'Edit organization details', icon: Building2 },
  { path: '/app-registry', label: 'App Registry', description: 'Manage connected applications', icon: AppWindow },
  { path: '/permissions', label: 'Permissions', description: 'Manage access level clusters', icon: Users },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [org, setOrg] = useState(null);
  const [stats, setStats] = useState({ total: 0, connected: 0, accessLevels: 0, superagents: 0 });
  const [loading, setLoading] = useState(true);
  const [auditRunning, setAuditRunning] = useState(false);

  const { data: pendingTasks = [] } = useQuery({
    queryKey: ['pendingTasks'],
    queryFn: async () => {
      const all = await base44.entities.PendingTask.list();
      return all.filter(t => t.status === 'pending' && !t.archived);
    },
    enabled: !loading,
  });

  const { data: lastAudit } = useQuery({
    queryKey: ['lastAudit'],
    queryFn: async () => {
      const audits = await base44.entities.AuditRun.list();
      return audits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null;
    },
    enabled: !loading,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [orgRecords, appRecords, accessLevelRecords] = await Promise.all([
          OrgProfile.list(),
          AppRegistry.list(),
          UserAccessLevel.list(),
        ]);
        setOrg(orgRecords[0] || null);
        const nonAgents = appRecords.filter(r => r.audience !== 'Superagent');
        setStats({
          total: nonAgents.length,
          connected: nonAgents.filter(r => r.is_hub_connected).length,
          accessLevels: accessLevelRecords.length,
          superagents: appRecords.filter(r => r.audience === 'Superagent').length,
        });
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRunAudit = async () => {
    setAuditRunning(true);
    try {
      await base44.functions.invoke('runAudit', { triggered_by: 'manual' });
      toast.success('Audit completed');
      // Refetch audit results
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Audit failed: ' + error.message);
    } finally {
      setAuditRunning(false);
    }
  };

  return (
    <div className="w-full">
      <PageHeader title="Dashboard" description="Overview of your organization hub and connected applications." />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {org && (
            <div className="bg-card border border-white/5 rounded-xl p-6 mb-8 shadow-md shadow-black/20">
              <div className="flex items-center gap-4">
                {org.org_logo_url ? (
                  <img src={org.org_logo_url} alt={org.org_name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{org.org_name}</h2>
                  <p className="text-sm text-muted-foreground">{org.org_description || 'No description set'}</p>
                </div>
                <Link to="/org-profile" className="ml-auto text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                  Edit <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Apps" value={stats.total} icon={AppWindow} />
            <StatCard
              label="Hub Connected"
              value={stats.connected}
              subtitle={`${stats.total ? Math.round((stats.connected / stats.total) * 100) : 0}% of total`}
              icon={Wifi}
            />
            <StatCard label="Access Levels" value={stats.accessLevels} icon={Users} />
            <StatCard label="Superagents" value={stats.superagents} icon={Bot} />
          </div>
        </>
      )}

      {/* Chat with Beacon */}
      <button
        onClick={() => setChatOpen(true)}
        className="w-full bg-[#005696] hover:bg-[#004175] text-white rounded-xl p-6 transition-all duration-300 mb-8 flex items-center gap-4 group"
      >
        <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-white">Chat with Beacon</h3>
          <p className="text-sm text-white/80">Get help with your hub and applications</p>
        </div>
        <ArrowRight className="w-5 h-5 text-white/80 group-hover:text-white transition-colors flex-shrink-0" />
      </button>

      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-2xl h-[80vh] flex flex-col border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Chat with Beacon</h2>
              <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <iframe src="https://app.base44.com/superagent/6a056407a50c45c592324875" className="flex-1 w-full border-none rounded-b-lg" />
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <button
          onClick={() => navigate('/pending-tasks')}
          className="w-full bg-card border border-white/5 rounded-xl p-6 mb-8 shadow-md shadow-black/20 hover:border-white/10 hover:shadow-lg hover:shadow-black/30 hover:brightness-110 transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Pending Tasks ({pendingTasks.length})</h3>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pendingTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{task.app}</p>
                  {task.blocked_by && (
                    <p className="text-xs text-destructive mt-1">Blocked: {task.blocked_by}</p>
                  )}
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{task.category}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded whitespace-nowrap ${task.priority === 'high' ? 'bg-destructive/20 text-destructive' : task.priority === 'medium' ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {pendingTasks.length > 5 && (
            <p className="text-xs text-muted-foreground mt-3">+{pendingTasks.length - 5} more</p>
          )}
        </button>
      )}

      {/* System Audit */}
      <div className="bg-card border border-white/5 rounded-xl p-6 mb-8 shadow-md shadow-black/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">System Audit</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {lastAudit ? `Last audit: ${new Date(lastAudit.timestamp).toLocaleDateString()} at ${new Date(lastAudit.timestamp).toLocaleTimeString()}` : 'No audit run yet'}
            </p>
          </div>
          <Button size="sm" onClick={handleRunAudit} disabled={auditRunning} variant="outline">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            {auditRunning ? 'Running...' : 'Run Audit'}
          </Button>
        </div>
      </div>

      {/* Quick Access */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Access</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {quickLinks.map(({ path, label, description, icon: Icon }) => (
          <Link key={path} to={path} className="bg-card border border-white/5 rounded-xl p-5 hover:border-white/10 hover:shadow-lg hover:shadow-black/30 hover:brightness-110 transition-all duration-200 group min-w-0">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground truncate">{label}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}