import { useEffect } from 'react';

function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function useBranding() {
  useEffect(() => {
    const apply = () => {
      fetch('https://beacon-nexus-core.base44.app/functions/getBranding')
        .then(r => r.json())
        .then(({ primary_color, secondary_color, background_color, foreground_color }) => {
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
            const root = document.documentElement;
            root.style.setProperty('--background', hsl);
            root.style.setProperty('--card', hsl);
            // Explicitly preserve sidebar colors
            root.style.setProperty('--sidebar-background', 'hsl(222 60% 8%)');
          }

          if (foreground_color) {
            const fgHsl = hexToHsl(foreground_color);
            const isLight = getLuminance(background_color) > 0.5;
            const fgMuted = isLight ? '215 15% 40%' : '215 20% 55%';
            document.documentElement.style.setProperty('--foreground', fgHsl);
            document.documentElement.style.setProperty('--card-foreground', fgHsl);
            document.documentElement.style.setProperty('--popover-foreground', fgHsl);
            document.documentElement.style.setProperty('--sidebar-foreground', fgHsl);
            document.documentElement.style.setProperty('--muted-foreground', fgMuted);
          }
        })
        .catch(() => {});
    };

    apply();
    const interval = setInterval(apply, 30000);
    return () => clearInterval(interval);
  }, []);
}