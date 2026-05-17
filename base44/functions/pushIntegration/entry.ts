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

    // Store the integration push in HubConfig so target apps can poll for it
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

    return Response.json({
      success: true,
      message: `${integration_name} stored — target apps will pick it up on next poll`,
      integration_id,
      app_ids,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});