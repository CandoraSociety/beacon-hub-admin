import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyBrandingColors(primary_color, secondary_color, background_color) {
  if (primary_color) {
    const hsl = hexToHsl(primary_color);
    document.documentElement.style.setProperty('--primary', hsl);
    document.documentElement.style.setProperty('--sidebar-primary', hsl);
    document.documentElement.style.setProperty('--ring', hsl);
  }
  if (secondary_color) {
    const hsl = hexToHsl(secondary_color);
    document.documentElement.style.setProperty('--accent', hsl);
    document.documentElement.style.setProperty('--sidebar-accent', hsl);
  }
  if (background_color) {
    const hsl = hexToHsl(background_color);
    document.documentElement.style.setProperty('--background', hsl);
    document.documentElement.style.setProperty('--card', hsl);
  }
}

export function useBranding() {
  useEffect(() => {
    const apply = () => {
      base44.functions.invoke('getBranding', {})
        .then(response => {
          const { primary_color, secondary_color, background_color } = response.data;
          applyBrandingColors(primary_color, secondary_color, background_color);
        })
        .catch(() => {});
    };

    apply();

    // Re-fetch every 30s to pick up pushed changes
    const interval = setInterval(apply, 30000);
    return () => clearInterval(interval);
  }, []);
}