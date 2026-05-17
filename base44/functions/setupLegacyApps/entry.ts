import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all apps marked as hub-connected with credentials
    const allApps = await base44.entities.AppRegistry.list();
    const hubApps = allApps.filter(app => app.is_hub_connected && app.command_url && app.integration_token);

    return Response.json({
      message: `Retrieved ${hubApps.length} app(s) ready for endpoint implementation`,
      apps: hubApps.map(app => ({
        id: app.id,
        app_name: app.app_name,
        command_url: app.command_url,
        integration_token: app.integration_token,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});