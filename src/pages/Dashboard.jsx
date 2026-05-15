import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppRegistry, OrgProfile, Department } from '@/api/entities';
import { Palette, Building2, AppWindow, Rocket, Wifi, ArrowRight, MessageCircle, X, Users, Bot } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

const quickLinks = [
  { path: '/branding', label: 'Branding Control', description: 'Manage colors & visual identity', icon: Palette },
  { path: '/org-profile', label: 'Org Profile', description: 'Edit organization details', icon: Building2 },
  { path: '/app-registry', label: 'App Registry', description: 'Manage connected applications', icon: AppWindow },
  { path: '/new-app', label: 'Launch New App', description: 'Generate app starter prompt', icon: Rocket },
];

export default function Dashboard() {
  const [chatOpen, setChatOpen] = useState(false);
  const [org, setOrg] = useState(null);
  const [stats, setStats] = useState({ total: 0, connected: 0, departments: 0, superagents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [orgRecords, appRecords, deptRecords] = await Promise.all([
          OrgProfile.list(),
          AppRegistry.list(),
          Department.list(),
        ]);
        setOrg(orgRecords[0] || null);
        const nonAgents = appRecords.filter(r => r.audience !== 'Superagent');
        setStats({
          total: nonAgents.length,
          connected: nonAgents.filter(r => r.is_hub_connected).length,
          departments: deptRecords.length,
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
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
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
            <StatCard label="Departments" value={stats.departments} icon={Users} />
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

      {/* Quick Access */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Access</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {quickLinks.map(({ path, label, description, icon: Icon }) => (
          <Link key={path} to={path} className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all duration-300 group min-w-0">
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