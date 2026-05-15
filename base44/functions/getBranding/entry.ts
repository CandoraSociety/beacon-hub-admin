import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const configs = await base44.asServiceRole.entities.HubConfig.filter({ category: 'branding' });

    const get = (key) => configs.find(c => c.key === key)?.value || null;

    return Response.json({
      primary_color: get('brand_primary_color') || '#005696',
      secondary_color: get('brand_secondary_color') || '#FFD100',
      font_family: get('brand_font_family') || null,
      logo_url: get('brand_logo_url') || null,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({
      primary_color: '#005696',
      secondary_color: '#FFD100',
      font_family: null,
      logo_url: null,
    }, { headers: CORS_HEADERS });
  }
});