import React, { useState } from 'react';
import { X, Copy, CheckCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function generatePrompt(app) {
  const appName = app.app_name || 'this app';
  const description = app.app_description ? `\n\nThis app is described as: "${app.app_description}".` : '';
  const audience = app.audience ? ` It serves the following audience: ${app.audience}.` : '';

  return `I need you to connect this app to our central Beacon Nexus Core hub so it can receive live branding updates automatically.

Here's what needs to be done:

---

**STEP 1 — Create a \`useBranding\` hook**

Create a new file at \`hooks/useBranding.js\` with the following code:

\`\`\`js
import { useEffect } from 'react';

function hexToHsl(hex) {
  if (!hex || !hex.startsWith('#')) return null;
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return \`\${Math.round(h * 360)} \${Math.round(s * 100)}% \${Math.round(l * 100)}%\`;
}

export function applyBrandingColors(primary, secondary, background) {
  const root = document.documentElement;
  if (primary) {
    const hsl = hexToHsl(primary);
    if (hsl) root.style.setProperty('--primary', hsl);
  }
  if (secondary) {
    const hsl = hexToHsl(secondary);
    if (hsl) root.style.setProperty('--accent', hsl);
  }
  if (background) {
    const hsl = hexToHsl(background);
    if (hsl) root.style.setProperty('--background', hsl);
  }
}

export function useBranding() {
  useEffect(() => {
    async function fetchAndApply() {
      try {
        const appId = import.meta.env.VITE_APP_ID;
        const hubUrl = 'https://beacon-nexus-core--fkbmrbr.base44.app';
        const res = await fetch(\`\${hubUrl}/api/functions/getBranding\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-app-id': appId },
          body: JSON.stringify({}),
        });
        if (!res.ok) return;
        const data = await res.json();
        applyBrandingColors(data.primary_color, data.secondary_color, data.background_color);
      } catch (e) {
        // Hub unreachable — use local defaults
      }
    }
    fetchAndApply();
    const interval = setInterval(fetchAndApply, 30000);
    return () => clearInterval(interval);
  }, []);
}
\`\`\`

---

**STEP 2 — Call the hook in your app entry point**

Open your \`App.jsx\` (or wherever your root component lives). Import and call the hook near the top of your main authenticated component:

\`\`\`js
import { useBranding } from '@/hooks/useBranding';

// Inside your root component or AuthenticatedApp:
useBranding();
\`\`\`

---

**STEP 3 — Register this app in the hub**

Go back to the Beacon Nexus Core hub, open the **App Registry**, and make sure **${appName}** is registered with:
- **Hub Connected** checked ✓
- The correct **App URL** filled in (so the hub can push branding to it)

---

That's it. Once these steps are complete, **${appName}** will automatically receive branding updates (colors, theme) from Beacon Nexus Core every 30 seconds and whenever a push is triggered from the hub's Branding Control Panel.${description}${audience}

If you run into any issues during setup, check that the hub URL in the hook matches the published URL of the Beacon Nexus Core app exactly.`;
}

export default function ConnectionPromptModal({ app, onClose, isPostSave = false }) {
  const [copied, setCopied] = useState(false);
  const prompt = generatePrompt(app);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success('Prompt copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Hub Connection Prompt</h3>
              <p className="text-xs text-muted-foreground">For <span className="text-foreground font-medium">{app.app_name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Post-save onboarding banner */}
        {isPostSave && (
          <div className="mx-6 mt-4 p-4 bg-accent/10 border border-accent/25 rounded-xl flex-shrink-0">
            <p className="text-xs font-semibold text-accent mb-1">App saved! One more step to connect it.</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To connect <span className="text-foreground font-medium">{app.app_name}</span> to Beacon Hub and enable live branding updates, copy the prompt below and paste it into that app's Base44 chat. The AI will set everything up automatically.
            </p>
          </div>
        )}

        {/* Prompt content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed bg-muted/40 rounded-xl p-4 border border-white/5">
            {prompt}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex-shrink-0 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" onClick={handleCopy}>
            {copied ? <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? 'Copied!' : 'Click to copy connection prompt'}
          </Button>
        </div>
      </div>
    </div>
  );
}