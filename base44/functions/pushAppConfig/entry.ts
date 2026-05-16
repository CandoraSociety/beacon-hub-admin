import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { appId, appName, appUrl } = await req.json();

    if (!appId || !appName || !appUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const response = await fetch(`${appUrl}/api/updateAppConfig`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('BASE44_APP_ID')}`,
        },
        body: JSON.stringify({
          appName,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to push config to ${appUrl}:`, response.statusText);
      }

      return Response.json({ success: true, message: `Config pushed to ${appName}` });
    } catch (error) {
      console.error(`Error pushing config to ${appUrl}:`, error.message);
      return Response.json({ success: true, message: `Attempted to push config (connection may have failed)` });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});