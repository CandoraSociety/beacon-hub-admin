import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SetupGuide() {
  const [copied, setCopied] = useState(null);

  const registrationCode = `import { base44 } from '@/api/base44Client';

// Call this once to register your app with Beacon
async function registerWithBeacon() {
  try {
    const response = await base44.functions.invoke('registerAppWithBeacon', {
      app_name: 'YOUR_APP_NAME',
      app_url: window.location.origin
    });
    
    // Save this token securely in your environment variables
    console.log('Integration token:', response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('Registration failed:', error);
  }
}`;

  const integrationEndpointCode = `// In your backend functions, create this endpoint
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const INTEGRATION_TOKEN = Deno.env.get('INTEGRATION_TOKEN');
    
    if (token !== INTEGRATION_TOKEN) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { integration_id, integration_name, code } = body;
    
    // Store or execute the integration code
    console.log(\`Received integration: \${integration_name}\`);
    console.log('Code:', code);
    
    // Save it to a file, database, or apply it directly
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-card border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Setup Instructions for Target Apps</h3>
        
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
              The token returned in Step 1 must be saved as an environment variable:
            </p>
            <div className="bg-muted/50 border border-white/5 rounded-lg p-4">
              <code className="text-xs text-muted-foreground">INTEGRATION_TOKEN=&lt;token_from_step_1&gt;</code>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Step 3: Create the Integration Receiving Endpoint</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Create <code className="bg-muted px-1 py-0.5 rounded text-xs">functions/receiveIntegration.js</code> in your app:
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

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
            <p className="text-sm text-accent font-medium">✓ Done!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your app is now ready to receive integrations from Beacon. The integration code will be sent to your endpoint, which you can then store or apply as needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}