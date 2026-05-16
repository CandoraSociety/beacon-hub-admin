import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { triggered_by = 'manual' } = await req.json().catch(() => ({}));

    // Create audit run record
    const auditRun = await base44.entities.AuditRun.create({
      timestamp: new Date().toISOString(),
      triggered_by,
      status: 'running',
      results: {},
    });

    // Fetch all connected apps
    const apps = await base44.entities.AppRegistry.list();
    const connectedApps = apps.filter(app => app.is_hub_connected && app.app_url);

    const results = {};

    // Poll each app's health endpoint
    for (const app of connectedApps) {
      try {
        const healthUrl = `${app.app_url}/api/health-check`;
        const response = await fetch(healthUrl, { timeout: 5000 });
        const data = await response.json();

        results[app.app_slug] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          issues: data.issues || [],
          integrations: data.integrations || {},
          automations: data.automations || {},
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        results[app.app_slug] = {
          status: 'unreachable',
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Determine overall summary
    const healthyCount = Object.values(results).filter(r => r.status === 'healthy').length;
    const summary = `Audit complete: ${healthyCount}/${connectedApps.length} apps healthy`;

    // Update audit run
    await base44.entities.AuditRun.update(auditRun.id, {
      status: 'completed',
      results,
      summary,
    });

    return Response.json({ auditRunId: auditRun.id, results, summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});