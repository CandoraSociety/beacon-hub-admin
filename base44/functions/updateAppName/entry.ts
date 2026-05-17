import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { appId, oldName, newName } = await req.json();

    if (!appId || !oldName || !newName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update the app in the registry
    const updatedApp = await base44.asServiceRole.entities.AppRegistry.update(appId, {
      app_name: newName,
    });

    // Update all pending tasks that reference this app
    const tasks = await base44.asServiceRole.entities.PendingTask.list();
    const tasksToUpdate = tasks.filter(t => t.app === oldName);
    
    for (const task of tasksToUpdate) {
      await base44.asServiceRole.entities.PendingTask.update(task.id, {
        app: newName,
      });
    }

    // Send command to app if it has credentials
    let commandResult = null;
    if (updatedApp.command_url && updatedApp.integration_token) {
      try {
        const cmdResponse = await fetch(updatedApp.command_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${updatedApp.integration_token}`,
          },
          body: JSON.stringify({
            command: 'update_app_name',
            payload: { app_name: newName },
          }),
        });
        commandResult = await cmdResponse.json();
      } catch (cmdError) {
        console.error('Command send failed:', cmdError);
        // Don't fail the entire request if command fails
      }
    }

    return Response.json({
      success: true,
      message: `Updated app name from "${oldName}" to "${newName}"`,
      tasksUpdated: tasksToUpdate.length,
      commandResult,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});