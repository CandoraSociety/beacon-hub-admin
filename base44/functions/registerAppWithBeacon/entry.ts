import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { app_name, app_url } = body;

    if (!app_name || !app_url) {
      return Response.json({ error: 'app_name and app_url are required' }, { status: 400 });
    }

    // Generate a secure token using Web Crypto API
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    const token = Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');

    // Find or create app in registry
    const base44 = createClientFromRequest(req);
    
    // Try to find existing app by name
    const existingApps = await base44.asServiceRole.entities.AppRegistry.filter({ app_name });
    
    if (existingApps.length > 0) {
      // Update existing app with token
      await base44.asServiceRole.entities.AppRegistry.update(existingApps[0].id, {
        integration_token: token,
        app_url,
        is_hub_connected: true,
      });
    } else {
      // Create new app in registry
      await base44.asServiceRole.entities.AppRegistry.create({
        app_name,
        app_url,
        integration_token: token,
        is_hub_connected: true,
        status: 'active',
      });
    }

    return Response.json({
      success: true,
      token,
      message: `${app_name} registered with Beacon. Store this token securely.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});