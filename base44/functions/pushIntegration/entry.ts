import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { app_ids, integration_id, integration_name } = await req.json();

    if (!app_ids || !integration_id || !integration_name) {
      return Response.json({ error: 'Missing required fields: app_ids, integration_id, integration_name' }, { status: 400 });
    }

    // Store the integration push in HubConfig (for polling fallback)
    const configKey = `integration_${integration_id}`;
    const configs = await base44.asServiceRole.entities.HubConfig.filter({ category: 'integration' });
    const existing = configs.find(c => c.key === configKey);

    const integrationPayload = JSON.stringify({
      integration_id,
      integration_name,
      app_ids,
      pushed_at: new Date().toISOString(),
    });

    if (existing) {
      await base44.asServiceRole.entities.HubConfig.update(existing.id, { value: integrationPayload });
    } else {
      await base44.asServiceRole.entities.HubConfig.create({
        key: configKey,
        value: integrationPayload,
        category: 'integration',
        description: `Integration push record for: ${integration_name}`,
      });
    }

    // Update last push timestamp
    const timestampKey = 'last_integration_push_timestamp';
    const tsRecord = configs.find(c => c.key === timestampKey);
    const timestamp = new Date().toISOString();
    if (tsRecord) {
      await base44.asServiceRole.entities.HubConfig.update(tsRecord.id, { value: timestamp });
    } else {
      await base44.asServiceRole.entities.HubConfig.create({
        key: timestampKey,
        value: timestamp,
        category: 'integration',
        description: 'Timestamp of last integration push',
      });
    }

    // Push to each target app immediately via their command endpoint
    const results = [];
    for (const appId of app_ids) {
      const apps = await base44.asServiceRole.entities.AppRegistry.filter({ id: appId });
      const app = apps[0];

      if (!app) {
        results.push({ app_id: appId, success: false, error: 'App not found' });
        continue;
      }

      if (!app.command_url || !app.integration_token) {
        results.push({ app_id: appId, success: false, error: 'Missing command_url or integration_token' });
        continue;
      }

      try {
        const response = await fetch(app.command_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${app.integration_token}`,
          },
          body: JSON.stringify({
            command: 'sync_integration',
            payload: { integration_id, integration_name },
          }),
        });

        const result = await response.json();
        results.push({
          app_id: appId,
          success: response.ok,
          status: response.status,
          result,
        });
      } catch (error) {
        results.push({ app_id: appId, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return Response.json({
      success: true,
      message: `${integration_name} pushed to ${successful} app(s), ${failed} failed`,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});