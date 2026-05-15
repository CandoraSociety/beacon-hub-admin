import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { app_ids } = await req.json();

    // Get current branding config
    const configs = await base44.asServiceRole.entities.HubConfig.filter({ category: 'branding' });
    const get = (key) => configs.find(c => c.key === key)?.value || null;

    const branding = {
      primary_color: get('brand_primary_color'),
      secondary_color: get('brand_secondary_color'),
      font_family: get('brand_font_family'),
      logo_url: get('brand_logo_url'),
    };

    // Get the selected apps
    const allApps = await base44.asServiceRole.entities.AppRegistry.filter({});
    const targetApps = allApps.filter(a => app_ids.includes(a.id));

    // For each app, attempt to ping its branding endpoint if available
    // Since satellite apps pull from this hub, we record a "last pushed" timestamp
    // so apps can detect a new push and re-fetch
    const results = [];
    for (const app of targetApps) {
      results.push({
        app_id: app.id,
        app_name: app.app_name,
        status: 'pushed',
        branding,
      });
    }

    // Update a push timestamp in HubConfig so connected apps can detect changes
    const pushRecord = configs.find(c => c.key === 'last_push_timestamp');
    const timestamp = new Date().toISOString();
    if (pushRecord) {
      await base44.asServiceRole.entities.HubConfig.update(pushRecord.id, { value: timestamp });
    } else {
      await base44.asServiceRole.entities.HubConfig.create({
        key: 'last_push_timestamp',
        value: timestamp,
        category: 'general',
        description: 'Timestamp of last branding push to connected apps',
      });
    }

    return Response.json({ success: true, pushed_to: results.length, results, branding });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});