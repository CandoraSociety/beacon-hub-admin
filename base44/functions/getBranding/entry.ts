Deno.serve(async () => {
  try {
    const response = await fetch('https://beacon-92324875.base44.app/functions/getHubConfig');
    const data = await response.json();
    
    return Response.json({
      primary_color: data.brand_primary_color || '#005696',
      secondary_color: data.brand_secondary_color || '#FFD100',
    });
  } catch (error) {
    return Response.json({
      primary_color: '#005696',
      secondary_color: '#FFD100',
    });
  }
});