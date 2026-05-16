import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const appSlug = url.searchParams.get('app_slug');
    
    if (!appSlug) {
      return Response.json({ error: 'app_slug parameter required' }, { status: 400 });
    }

    const apps = await base44.asServiceRole.entities.AppRegistry.filter({ app_slug: appSlug });
    
    if (!apps.length) {
      return Response.json({ error: 'App not found' }, { status: 404 });
    }

    const app = apps[0];
    
    return Response.json({
      app_name: app.app_name,
      display_name: app.display_name || app.app_name,
      header_style: app.header_style || 'standard',
      header_logo_url: app.header_logo_url || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});