import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = [
      {
        title: 'MoneyMan Agent Implementation',
        description: 'A MoneyMan agent file exists in the agents directory but no implementation details, instructions, or tool configurations are visible. Needs to be reviewed and completed with proper agent logic, description, and tool permissions.',
        app: 'GrantFlow',
        category: 'feature',
        priority: 'medium',
        status: 'pending',
        blocked_by: 'Not yet started',
      },
      {
        title: 'Verify All Data Entities Are Populated',
        description: 'Several entities (ProposalTemplate, PotentialFunder, OrganizationInfo) exist in the schema but unclear if they have seed data or if the UI properly handles empty states when these entities are first created',
        app: 'GrantFlow',
        category: 'decision',
        priority: 'low',
        status: 'pending',
        blocked_by: 'Not yet started',
      },
    ];

    const created = await base44.entities.PendingTask.bulkCreate(tasks);
    return Response.json({ success: true, created: created.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});