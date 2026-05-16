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

// Shift a hex color's RGB channels by an offset amount
function shiftHex(hex, offset) {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + offset));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + offset));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + offset));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// Given a background hex, return high-contrast foreground and muted HSL strings
function contrastForeground(bgHex) {
  const light = getLuminance(bgHex) > 0.5;
  return {
    fg: light ? '222 20% 8%' : '210 40% 96%',
    fgMuted: light ? '215 15% 38%' : '215 20% 58%',
  };
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

    // --- Main background ---
    document.documentElement.style.setProperty('--background', hexToHsl(background_color));
    const { fg, fgMuted } = contrastForeground(background_color);
    document.documentElement.style.setProperty('--foreground', fg);
    document.documentElement.style.setProperty('--muted-foreground', fgMuted);
    document.documentElement.style.setProperty('--popover-foreground', fg);

    // --- Card surface (slightly offset from bg) ---
    const cardHex = shiftHex(background_color, isLight ? -8 : -10);
    document.documentElement.style.setProperty('--card', hexToHsl(cardHex));
    const cardContrast = contrastForeground(cardHex);
    document.documentElement.style.setProperty('--card-foreground', cardContrast.fg);

    // --- Secondary surface ---
    const secondaryHex = shiftHex(background_color, isLight ? -15 : -12);
    document.documentElement.style.setProperty('--secondary', hexToHsl(secondaryHex));
    const secContrast = contrastForeground(secondaryHex);
    document.documentElement.style.setProperty('--secondary-foreground', secContrast.fg);

    // --- Sidebar (more distinct offset) ---
    const sidebarHex = shiftHex(background_color, isLight ? -25 : -18);
    document.documentElement.style.setProperty('--sidebar-background', hexToHsl(sidebarHex));
    const sidebarContrast = contrastForeground(sidebarHex);
    document.documentElement.style.setProperty('--sidebar-foreground', sidebarContrast.fg);
    document.documentElement.style.setProperty('--sidebar-muted-foreground', sidebarContrast.fgMuted);
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