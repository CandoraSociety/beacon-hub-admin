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
  foreground_color: null,
  font_family: null,
  logo_url: null,
};

function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // Use service role so no user auth is required - this is a public read endpoint
    const base44 = createClientFromRequest(req);
    const configs = await base44.asServiceRole.entities.HubConfig.filter({ category: 'branding' });

    const get = (key) => configs.find(c => c.key === key)?.value || null;

    const background_color = get('brand_background_color') || FALLBACK.background_color;
    const foreground_color = background_color
      ? (getLuminance(background_color) > 0.5 ? '#1a1f2e' : '#f0f4f8')
      : null;

    return Response.json({
      primary_color: get('brand_primary_color') || FALLBACK.primary_color,
      secondary_color: get('brand_secondary_color') || FALLBACK.secondary_color,
      background_color,
      foreground_color,
      font_family: get('brand_font_family') || FALLBACK.font_family,
      logo_url: get('brand_logo_url') || FALLBACK.logo_url,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json(FALLBACK, { headers: CORS_HEADERS });
  }
});