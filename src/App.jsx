import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SidebarProvider from '@/lib/SidebarContext';
import { useBranding } from '@/hooks/useBranding';

import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/Dashboard';
import Branding from '@/pages/Branding';
import OrgProfile from '@/pages/OrgProfile';
import AppRegistry from '@/pages/AppRegistry';
import AppIntegrations from '@/pages/AppIntegrations';
import NewAppLauncher from '@/pages/NewAppLauncher';
import Permissions from '@/pages/Permissions';
import PendingTasks from '@/pages/PendingTasks';
import PendingTasksList from '@/pages/PendingTasksList';
import CentralAppControls from '@/pages/CentralAppControls';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  useBranding();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pending-tasks-list" element={<PendingTasksList />} />
        <Route path="/branding" element={<Branding />} />
        <Route path="/org-profile" element={<OrgProfile />} />
        <Route path="/app-registry" element={<AppRegistry />} />

        <Route path="/app-integrations" element={<AppIntegrations />} />
        <Route path="/new-app" element={<NewAppLauncher />} />
        <Route path="/permissions" element={<Permissions />} />
        <Route path="/pending-tasks" element={<PendingTasks />} />
        <Route path="/central-app-controls" element={<CentralAppControls />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </SidebarProvider>
    </AuthProvider>
  )
}

export default App