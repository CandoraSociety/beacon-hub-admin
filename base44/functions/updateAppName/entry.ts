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
    await base44.asServiceRole.entities.AppRegistry.update(appId, {
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

    return Response.json({
      success: true,
      message: `Updated app name from "${oldName}" to "${newName}"`,
      tasksUpdated: tasksToUpdate.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});