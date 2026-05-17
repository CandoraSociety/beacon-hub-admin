import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all apps
    const allApps = await base44.entities.AppRegistry.list();

    // Filter legacy apps (missing command_url or integration_token)
    const legacyApps = allApps.filter(app => !app.command_url || !app.integration_token);

    if (legacyApps.length === 0) {
      return Response.json({ message: 'No legacy apps to set up', updated: [] });
    }

    // Generate tokens and command URLs
    const updated = [];
    for (const app of legacyApps) {
      const token = 'sk_' + Math.random().toString(36).substring(2, 32);
      const appSlug = (app.app_name || '').toLowerCase().replace(/\s+/g, '-');
      const commandUrl = `https://${appSlug}.example.com/api/receiveCommand`;

      await base44.entities.AppRegistry.update(app.id, {
        integration_token: token,
        command_url: commandUrl,
      });

      updated.push({
        id: app.id,
        app_name: app.app_name,
        command_url: commandUrl,
        integration_token: token,
      });
    }

    return Response.json({ message: `Set up ${updated.length} legacy app(s)`, updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});