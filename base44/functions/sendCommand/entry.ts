import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { app_registry_id, command, payload } = await req.json();

    if (!app_registry_id || !command) {
      return Response.json({ error: 'Missing required fields: app_registry_id, command' }, { status: 400 });
    }

    // Get the app's command URL and integration token from the registry
    const apps = await base44.asServiceRole.entities.AppRegistry.filter({ id: app_registry_id });
    const app = apps[0];

    if (!app) {
      return Response.json({ error: 'App not found in registry' }, { status: 404 });
    }

    if (!app.command_url) {
      return Response.json({ error: 'App has no command_url configured' }, { status: 400 });
    }

    if (!app.integration_token) {
      return Response.json({ error: 'App has no integration_token configured' }, { status: 400 });
    }

    const response = await fetch(app.command_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${app.integration_token}`,
      },
      body: JSON.stringify({ command, payload: payload || {} }),
    });

    const result = await response.json();

    return Response.json({
      success: response.ok,
      status: response.status,
      result,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});