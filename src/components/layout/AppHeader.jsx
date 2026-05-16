import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AppHeader() {
  const { data: configs = [] } = useQuery({
    queryKey: ['hubConfigs', 'header'],
    queryFn: async () => {
      const all = await base44.entities.HubConfig.list();
      return all;
    },
  });

  const { data: orgProfile } = useQuery({
    queryKey: ['orgProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.OrgProfile.list();
      return profiles[0];
    },
  });

  const headerStyle = configs.find(c => c.key === 'header_style')?.value || 'standard';
  const headerLogoUrl = configs.find(c => c.key === 'header_logo_url')?.value;
  const orgName = orgProfile?.org_name || 'Beacon Nexus';

  const styles = {
    minimal: 'h-12 px-6 border-b border-white/5',
    standard: 'h-16 px-8 border-b border-white/10 shadow-sm shadow-black/20',
    prominent: 'h-20 px-8 border-b border-white/10 shadow-lg shadow-black/30 bg-gradient-to-r from-card to-card/80',
  };

  const containerClass = styles[headerStyle] || styles.standard;

  return (
    <header className={`${containerClass} flex items-center gap-3 bg-card`}>
      {headerLogoUrl && (
        <img
          src={headerLogoUrl}
          alt="Logo"
          className={headerStyle === 'minimal' ? 'h-8 w-8' : headerStyle === 'prominent' ? 'h-12 w-12' : 'h-10 w-10'}
        />
      )}
      <h1 className={`font-semibold text-foreground ${
        headerStyle === 'minimal' ? 'text-sm' : headerStyle === 'prominent' ? 'text-lg' : 'text-base'
      }`}>
        {orgName}
      </h1>
    </header>
  );
}