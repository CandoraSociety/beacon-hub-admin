import React, { useState } from 'react';
import { Copy, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';
const FUNCTION_URL = `https://beacon-92324875.base44.app/functions/getBranding`;

const SNIPPET = `// Paste this in your app's main component (e.g. App.jsx or index.css hook)
// It fetches brand colors from the Hub and applies them globally.

import { useEffect } from 'react';

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1,3),16)/255;
  let g = parseInt(hex.slice(3,5),16)/255;
  let b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; } else {
    const d = max-min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){ case r: h=(g-b)/d+(g<b?6:0);break; case g: h=(b-r)/d+2;break; case b: h=(r-g)/d+4;break; }
    h /= 6;
  }
  return \`\${Math.round(h*360)} \${Math.round(s*100)}% \${Math.round(l*100)}%\`;
}

export function useBranding() {
  useEffect(() => {
    fetch('${FUNCTION_URL}')
      .then(r => r.json())
      .then(({ primary_color, secondary_color }) => {
        if (primary_color) document.documentElement.style.setProperty('--primary', hexToHsl(primary_color));
        if (secondary_color) document.documentElement.style.setProperty('--accent', hexToHsl(secondary_color));
      })
      .catch(() => {});
  }, []);
}`;

export default function BrandingIntegrationGuide() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(SNIPPET);
    setCopied(true);
    toast.success('Snippet copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Connect an App to This Hub</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Paste this hook into any Base44 app to make it pull branding from here automatically.</p>
        </div>
      </div>

      <div className="relative">
        <pre className="bg-muted rounded-lg p-4 text-xs text-muted-foreground overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
          {SNIPPET}
        </pre>
        <button
          onClick={copy}
          className="absolute top-3 right-3 p-1.5 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Then call <code className="font-mono text-primary/80 bg-primary/10 px-1 rounded">useBranding()</code> inside your app's root component. That's it — the app will now reflect any color changes you make here.
      </p>
    </div>
  );
}