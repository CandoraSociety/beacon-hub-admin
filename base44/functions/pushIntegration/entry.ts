import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { app_id, app_url, app_token, integration_id, integration_name } = body;

    if (!app_id || !app_url || !app_token || !integration_id || !integration_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get integration code based on integration_id
    let integrationCode = '';
    
    if (integration_id === 'sync-app-name') {
      integrationCode = `
import { base44 } from '@/api/base44Client';
import { useEffect, useState } from 'react';

export function useAppNameSync(appSlug) {
  const [appName, setAppName] = useState('');
  
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await base44.functions.invoke('getAppConfig', { app_slug: appSlug });
        setAppName(response.data.app_name || '');
      } catch (error) {
        console.error('Failed to sync app name:', error);
      }
    }
    
    fetchConfig();
    const interval = setInterval(fetchConfig, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [appSlug]);
  
  return appName;
}
`;
    } else if (integration_id === 'sync-branding') {
      integrationCode = `
import { base44 } from '@/api/base44Client';
import { useEffect, useState } from 'react';

export function useBrandingSync() {
  const [branding, setBranding] = useState(null);
  
  useEffect(() => {
    async function fetchBranding() {
      try {
        const response = await base44.functions.invoke('getBranding', {});
        setBranding(response.data);
      } catch (error) {
        console.error('Failed to sync branding:', error);
      }
    }
    
    fetchBranding();
    const interval = setInterval(fetchBranding, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);
  
  return branding;
}
`;
    }

    // Send integration code to the app
    const response = await fetch(`${app_url}/api/integrations/install`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${app_token}`,
      },
      body: JSON.stringify({
        integration_id: integration_id,
        integration_name: integration_name,
        code: integrationCode,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `App rejected integration: ${errorText}` },
        { status: response.status }
      );
    }

    return Response.json({
      success: true,
      message: `${integration_name} pushed to app`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});