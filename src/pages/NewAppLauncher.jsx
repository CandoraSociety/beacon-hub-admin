import React, { useState } from 'react';
import { Rocket, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';

const HUB_URL = 'https://beacon-92324875.base44.app/functions/getHubConfig';

export default function NewAppLauncher() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    audience: '',
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePrompt = () => {
    if (!form.name) {
      toast.error('Please enter an app name');
      return;
    }

    const prompt = `Build an app called "${form.name}".

## App Details
- **Category**: ${form.category || 'General'}
- **Description**: ${form.description || 'No description provided'}
- **Target Audience**: ${form.audience || 'General users'}

## Branding Integration (CRITICAL — do this FIRST)
Before building any UI, fetch the organization's branding configuration:

1. Create a backend function that calls:
   \`\`\`
   GET ${HUB_URL}
   \`\`\`
2. From the response, extract:
   - \`brand_primary_color\` — use this as the app's primary color
   - \`brand_secondary_color\` — use this as the app's secondary accent color
3. Apply these colors to the app's design system (\`index.css\` CSS variables) from day one:
   - Set \`--primary\` to the HSL equivalent of \`brand_primary_color\`
   - Set \`--accent\` to the HSL equivalent of \`brand_secondary_color\`
4. All UI components, buttons, links, and accents must use these brand colors consistently.

## Requirements
- The app must be production-quality with a clean, modern UI
- Use the brand colors throughout — no default/generic color schemes
- Mobile responsive design
- Ensure the branding is fetched and applied before the user sees any UI`;

    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success('Prompt copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="New App Launcher"
        description="Generate a ready-to-copy prompt for Base44 that includes your branding from day one."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary" />
            App Details
          </h3>

          <div>
            <Label className="text-xs">App Name <span className="text-destructive">*</span></Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5"
              placeholder="My Awesome App"
            />
          </div>

          <div>
            <Label className="text-xs">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Tool</SelectItem>
                <SelectItem value="external">External / Public</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="tool">Utility Tool</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1.5 h-24"
              placeholder="What does this app do?"
            />
          </div>

          <div>
            <Label className="text-xs">Target Audience</Label>
            <Input
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              className="mt-1.5"
              placeholder="e.g. Internal team, Clients, Public"
            />
          </div>

          <Button className="w-full" onClick={generatePrompt}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Prompt
          </Button>
        </div>

        {/* Output */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Generated Prompt</h3>
            {generatedPrompt && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </div>

          {generatedPrompt ? (
            <pre className="bg-background border border-border rounded-lg p-4 text-xs font-mono text-foreground/80 whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
              {generatedPrompt}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Fill in the app details and click generate.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">The prompt will include your hub's branding endpoint.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}