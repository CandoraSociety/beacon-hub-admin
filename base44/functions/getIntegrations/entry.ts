import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Target apps poll this endpoint to get integrations pushed to them.
// Pass app_id as a query param or in the body.
Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const app_id = body.app_id;

    if (!app_id) {
      return Response.json({ error: 'Missing app_id' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const configs = await base44.asServiceRole.entities.HubConfig.filter({ category: 'integration' });

    const integrations = configs
      .filter(c => c.key.startsWith('integration_'))
      .map(c => {
        try { return JSON.parse(c.value); } catch { return null; }
      })
      .filter(Boolean)
      .filter(i => i.app_ids && i.app_ids.includes(app_id));

    return Response.json({ integrations });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});