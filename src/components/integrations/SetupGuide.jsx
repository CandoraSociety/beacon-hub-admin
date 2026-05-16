import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SetupGuide() {
  const [copied, setCopied] = useState(null);

  const allInOneCode = `// ============================================
// BEACON INTEGRATION SETUP FOR TARGET APP
// ============================================
// This code sets up your app to receive integrations from Beacon hub.
// Do NOT modify these functions - they are required for Beacon integration.

// STEP 1: Run this ONCE to register your app with Beacon
// ============================================
import { base44 } from '@/api/base44Client';

async function registerWithBeacon() {
  const response = await base44.functions.invoke('registerAppWithBeacon', {
    app_name: 'YOUR_APP_NAME',
    app_url: window.location.origin
  });
  
  // Save this token to your environment variables (Step 2)
  console.log('Integration token:', response.data.token);
  return response.data.token;
}

// Call this once in your browser console or app initialization
// registerWithBeacon();


// STEP 2: Save the token you received to environment variables
// ============================================
// Go to: Dashboard → Settings → Environment Variables
// Add this environment variable:
//   INTEGRATION_TOKEN=<paste_the_token_from_step_1>


// STEP 3: Create a new file in your app: functions/receiveIntegration.js
// ============================================
// Copy everything below into that file:

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  // SECURITY: Verify request is from Beacon using the token
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const INTEGRATION_TOKEN = Deno.env.get('INTEGRATION_TOKEN');
  
  if (token !== INTEGRATION_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await req.json();
  const { integration_id, integration_name, code } = body;
  
  // Log that we received an integration from Beacon
  console.log(\`✓ Received integration from Beacon: \${integration_name}\`);
  console.log('Code to apply:', code);
  
  // YOUR TASK: Do something with the code here
  // Options: save it, apply it, store in database, etc.
  
  return Response.json({ success: true });
});`;

  const registrationCode = `import { base44 } from '@/api/base44Client';

async function registerWithBeacon() {
  const response = await base44.functions.invoke('registerAppWithBeacon', {
    app_name: 'YOUR_APP_NAME',
    app_url: window.location.origin
  });
  
  console.log('Integration token:', response.data.token);
  return response.data.token;
}`;

  const integrationEndpointCode = `import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const INTEGRATION_TOKEN = Deno.env.get('INTEGRATION_TOKEN');
  
  if (token !== INTEGRATION_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await req.json();
  const { integration_id, integration_name, code } = body;
  
  console.log(\`✓ Received from Beacon: \${integration_name}\`);
  console.log('Integration code:', code);
  
  return Response.json({ success: true });
});`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">📋 For Your TARGET APP (not Beacon)</h3>
        <p className="text-sm text-muted-foreground">These steps run in the app you want to integrate. Beacon will push integrations to it.</p>
      </div>

      {/* All-in-One Copy Section */}
      <div className="bg-card border border-accent/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-accent">⚡ Quick Setup (Copy All)</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(allInOneCode, 'allInOne')}
            className="gap-2"
          >
            {copied === 'allInOne' ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy All Steps
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Copy this entire block with all instructions and code. It includes what to do, where to do it, and why.
        </p>
        <pre className="bg-muted/50 border border-white/5 rounded-lg p-4 text-xs overflow-x-auto text-muted-foreground max-h-96 overflow-y-auto">
          {allInOneCode}
        </pre>
      </div>

      <div className="bg-card border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Setup Instructions</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Step 1: Register Your App with Beacon</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add this code to your app and call <code className="bg-muted px-1 py-0.5 rounded text-xs">registerWithBeacon()</code> once:
            </p>
            <div className="relative">
              <pre className="bg-muted/50 border border-white/5 rounded-lg p-4 text-xs overflow-x-auto text-muted-foreground">
                {registrationCode}
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => copyToClipboard(registrationCode, 'registration')}
              >
                {copied === 'registration' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Step 2: Save Your Integration Token</h4>
            <p className="text-sm text-muted-foreground mb-3">
              The token is returned from Step 1. Save it in your target app's environment variables:
            </p>
            <div className="bg-muted/50 border border-white/5 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-xs font-mono text-muted-foreground">In Dashboard → Settings → Environment Variables:</p>
              </div>
              <code className="text-xs text-muted-foreground block">INTEGRATION_TOKEN=a1b2c3d4e5f6g7h8...</code>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Replace <code className="bg-muted px-1">a1b2c3d4e5f6g7h8...</code> with the actual token from your registration step.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Step 3: Create Receiving Endpoint in Target App</h4>
            <p className="text-sm text-muted-foreground mb-3">
              In your target app (the one you want to integrate with Beacon), create this file:
            </p>
            <p className="text-xs bg-primary/10 text-primary border border-primary/20 rounded px-2 py-1 inline-block mb-3">
              <code>functions/receiveIntegration.js</code>
            </p>
            <div className="relative">
              <pre className="bg-muted/50 border border-white/5 rounded-lg p-4 text-xs overflow-x-auto text-muted-foreground">
                {integrationEndpointCode}
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => copyToClipboard(integrationEndpointCode, 'endpoint')}
              >
                {copied === 'endpoint' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-3">
            <p className="text-sm text-accent font-medium">✓ All Set!</p>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>Your app is ready to receive integrations from Beacon. Here's the flow:</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li><strong>Run Step 1</strong> in your target app to register with Beacon</li>
                <li><strong>Save the token</strong> to your target app's environment variables</li>
                <li><strong>Create the endpoint</strong> in your target app to receive integrations</li>
                <li>When you push an integration from Beacon, it will POST to your endpoint with the code</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}