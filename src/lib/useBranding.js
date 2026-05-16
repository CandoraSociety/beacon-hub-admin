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

function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
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
    const isLight = getLuminance(background_color) > 0.5;

    // Main background
    const hsl = hexToHsl(background_color);
    document.documentElement.style.setProperty('--background', hsl);
    document.documentElement.style.setProperty('--card', hsl);

    // Sidebar: slightly darker if light bg, slightly darker/deeper if dark bg
    const r = parseInt(background_color.slice(1, 3), 16);
    const g = parseInt(background_color.slice(3, 5), 16);
    const b = parseInt(background_color.slice(5, 7), 16);
    const offset = isLight ? -20 : -15; // darken sidebar relative to bg
    const sr = Math.max(0, Math.min(255, r + offset));
    const sg = Math.max(0, Math.min(255, g + offset));
    const sb = Math.max(0, Math.min(255, b + offset));
    const sidebarHex = `#${sr.toString(16).padStart(2,'0')}${sg.toString(16).padStart(2,'0')}${sb.toString(16).padStart(2,'0')}`;
    document.documentElement.style.setProperty('--sidebar-background', hexToHsl(sidebarHex));

    // Secondary surfaces (card, secondary)
    const secOffset = isLight ? -10 : -8;
    const cr = Math.max(0, Math.min(255, r + secOffset));
    const cg = Math.max(0, Math.min(255, g + secOffset));
    const cb = Math.max(0, Math.min(255, b + secOffset));
    document.documentElement.style.setProperty('--secondary', hexToHsl(`#${cr.toString(16).padStart(2,'0')}${cg.toString(16).padStart(2,'0')}${cb.toString(16).padStart(2,'0')}`));

    // Foreground contrast
    const fg = isLight ? '222 20% 10%' : '210 40% 96%';
    const fgMuted = isLight ? '215 15% 40%' : '215 20% 55%';
    document.documentElement.style.setProperty('--foreground', fg);
    document.documentElement.style.setProperty('--card-foreground', fg);
    document.documentElement.style.setProperty('--popover-foreground', fg);
    document.documentElement.style.setProperty('--sidebar-foreground', fg);
    document.documentElement.style.setProperty('--muted-foreground', fgMuted);
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