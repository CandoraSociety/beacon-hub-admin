import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const FALLBACK = {
  primary_color: '#005696',
  secondary_color: '#FFD100',
  background_color: null,
  font_family: null,
  logo_url: null,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // Use service role so no user auth is required - this is a public read endpoint
    const base44 = createClientFromRequest(req);
    const configs = await base44.asServiceRole.entities.HubConfig.filter({ category: 'branding' });

    const get = (key) => configs.find(c => c.key === key)?.value || null;

    return Response.json({
      primary_color: get('brand_primary_color') || FALLBACK.primary_color,
      secondary_color: get('brand_secondary_color') || FALLBACK.secondary_color,
      background_color: get('brand_background_color') || FALLBACK.background_color,
      font_family: get('brand_font_family') || FALLBACK.font_family,
      logo_url: get('brand_logo_url') || FALLBACK.logo_url,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json(FALLBACK, { headers: CORS_HEADERS });
  }
});