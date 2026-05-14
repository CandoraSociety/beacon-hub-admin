import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { LayoutDashboard, Palette, Building2, AppWindow, Rocket, Wifi, Bot, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { Skeleton } from '@/components/ui/skeleton';

const quickLinks = [
  { path: '/branding', label: 'Branding Control', description: 'Manage colors & visual identity', icon: Palette },
  { path: '/org-profile', label: 'Org Profile', description: 'Edit organization details', icon: Building2 },
  { path: '/app-registry', label: 'App Registry', description: 'Manage connected applications', icon: AppWindow },
  { path: '/new-app', label: 'Launch New App', description: 'Generate app starter prompt', icon: Rocket },
];

export default function Dashboard() {
  const { data: orgProfiles = [], isLoading: loadingOrg } = useQuery({
    queryKey: ['orgProfiles'],
    queryFn: () => base44.entities.OrgProfile.list(),
  });

  const { data: apps = [], isLoading: loadingApps } = useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      return await base44.entities.AppRegistry.list({ limit: 100 });
    },
  });

  const totalAppsCount = apps.reduce((count, app) => app.audience !== 'Superagent' ? count + 1 : count, 0);
  const connectedAppsCount = apps.reduce((count, app) => app.is_hub_connected && app.audience !== 'Superagent' ? count + 1 : count, 0);
  const superagentsCount = apps.reduce((count, app) => app.audience === 'Superagent' ? count + 1 : count, 0);

  const { data: hubConfigs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['hubConfigs'],
    queryFn: () => base44.entities.HubConfig.list(),
  });

  const org = orgProfiles[0];
  const brandingConfigs = hubConfigs.filter(c => c.category === 'branding');
  const isLoading = loadingOrg || loadingApps || loadingConfigs;

  return (
    <div className="w-full">
      <PageHeader
        title="Dashboard"
        description="Overview of your organization hub and connected applications."
      />

      {/* Org Summary */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
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
                <Link
                  to="/org-profile"
                  className="ml-auto text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  Edit <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Apps"
              value={totalAppsCount}
              icon={AppWindow}
            />
            <StatCard
              label="Connected"
              value={connectedAppsCount}
              subtitle={`${totalAppsCount ? Math.round((connectedAppsCount / totalAppsCount) * 100) : 0}% of total`}
              icon={Wifi}
            />
            <StatCard
              label="Superagents"
              value={superagentsCount}
              icon={Bot}
            />
            <StatCard
              label="Branding Configs"
              value={brandingConfigs.length}
              icon={Palette}
            />
          </div>
        </>
      )}

      {/* Quick Access */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Access</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {quickLinks.map(({ path, label, description, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all duration-300 group min-w-0"
          >
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