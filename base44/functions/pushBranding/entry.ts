import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { app_ids, header_style, header_logo_url } = await req.json();

    // Get current branding config
    const configs = await base44.asServiceRole.entities.HubConfig.filter({ category: 'branding' });
    const get = (key) => configs.find(c => c.key === key)?.value || null;

    // Save header settings to HubConfig if provided
    if (header_style) {
      const existing = configs.find(c => c.key === 'header_style');
      if (existing) {
        await base44.asServiceRole.entities.HubConfig.update(existing.id, { value: header_style });
      } else {
        await base44.asServiceRole.entities.HubConfig.create({
          key: 'header_style',
          value: header_style,
          category: 'branding',
          description: 'Global header display style',
        });
      }
    }

    if (header_logo_url) {
      const existing = configs.find(c => c.key === 'header_logo_url');
      if (existing) {
        await base44.asServiceRole.entities.HubConfig.update(existing.id, { value: header_logo_url });
      } else {
        await base44.asServiceRole.entities.HubConfig.create({
          key: 'header_logo_url',
          value: header_logo_url,
          category: 'branding',
          description: 'Global header logo URL',
        });
      }
    }

    const branding = {
      primary_color: get('brand_primary_color'),
      secondary_color: get('brand_secondary_color'),
      font_family: get('brand_font_family'),
      logo_url: get('brand_logo_url'),
      header_style,
      header_logo_url,
    };

    // Get the selected apps
    const allApps = await base44.asServiceRole.entities.AppRegistry.filter({});
    const targetApps = allApps.filter(a => app_ids.includes(a.id));

    // For each app, try to hit their /functions/applyBranding endpoint if they have one,
    // otherwise mark as "pending" (they will pick it up on their next 30s poll via useBranding)
    const results = [];
    for (const app of targetApps) {
      let status = 'pending'; // satellite app will pick up on next poll
      if (app.app_url) {
        try {
          // Derive the satellite app's base URL and attempt to call its applyBranding function
          const baseUrl = app.app_url.replace(/\/$/, '');
          // Extract the app slug from the URL (e.g. https://my-app-123.base44.app -> my-app-123)
          const match = baseUrl.match(/https?:\/\/([^.]+)\.base44\.app/);
          if (match) {
            const slug = match[1];
            const pingUrl = `https://${slug}.base44.app/functions/applyBranding`;
            const resp = await fetch(pingUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(branding),
              signal: AbortSignal.timeout(5000),
            });
            status = resp.ok ? 'notified' : 'pending';
          }
        } catch {
          status = 'pending'; // couldn't reach, they'll poll
        }
      }
      results.push({
        app_id: app.id,
        app_name: app.app_name,
        status,
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