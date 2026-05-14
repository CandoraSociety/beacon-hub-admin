import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useBranding() {
  useEffect(() => {
    const applyBranding = async () => {
      try {
        const response = await base44.functions.invoke('getBranding', {});
        const { primary_color, secondary_color } = response.data;

        // Convert hex to HSL
        const hexToHsl = (hex) => {
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h, s, l = (max + min) / 2;

          if (max === min) {
            h = s = 0;
          } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }

          h = Math.round(h * 360);
          s = Math.round(s * 100);
          l = Math.round(l * 100);

          return `${h} ${s}% ${l}%`;
        };

        document.documentElement.style.setProperty('--primary', hexToHsl(primary_color));
        document.documentElement.style.setProperty('--accent', hexToHsl(secondary_color));
      } catch (error) {
        console.log('Using default branding');
      }
    };

    applyBranding();
  }, []);
}