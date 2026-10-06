import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAppContext } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';
import { User, Palette, Settings as SettingsIcon, Globe, Bell, Shield, Database, Key, Check, ExternalLink, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const providerConfig: Record<string, { name: string; placeholder: string; docsUrl: string; docsLabel: string }> = {
  openai: {
    name: 'OpenAI',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'OpenAI Platform'
  },
  anthropic: {
    name: 'Anthropic',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    docsLabel: 'Anthropic Console'
  },
  google: {
    name: 'Google AI',
    placeholder: 'AIza...',
    docsUrl: 'https://makersuite.google.com/app/apikey',
    docsLabel: 'Google AI Studio'
  },
  mistral: {
    name: 'Mistral AI',
    placeholder: 'mist-...',
    docsUrl: 'https://console.mistral.ai/api-keys/',
    docsLabel: 'Mistral Console'
  },
  nvidia: {
    name: 'NVIDIA NIM',
    placeholder: 'nvapi-...',
    docsUrl: 'https://build.nvidia.com/',
    docsLabel: 'NVIDIA Build portal'
  },
  openrouter: {
    name: 'OpenRouter',
    placeholder: 'sk-or-...',
    docsUrl: 'https://openrouter.ai/keys',
    docsLabel: 'OpenRouter Dashboard'
  },
  huggingface: {
    name: 'Hugging Face',
    placeholder: 'hf_...',
    docsUrl: 'https://huggingface.co/settings/tokens',
    docsLabel: 'Hugging Face Settings'
  }
};

export default function SettingsPage() {
  const { apiKeys, setApiKey, fetchNimModels, searchInternet, setSearchInternet } = useAppContext();
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [localKey, setLocalKey] = useState('');

  const currentProvider = providerConfig[selectedProvider];

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    const keyField = provider as keyof typeof apiKeys;
    const currentKey = apiKeys[keyField];
    const raw = typeof currentKey === 'string' ? currentKey : '';
    // Masked values (sk-...abcd) are display-only; don't prefill them into the input
    setLocalKey(raw.includes('...') ? '' : raw);
  };

  const saveKey = () => {
    const key = localKey.trim();
    if (!key) {
      toast({
        title: 'Nothing to save',
        description: `Enter a ${currentProvider.name} API key first.`,
        variant: 'destructive'
      });
      return;
    }
    setApiKey(selectedProvider as keyof typeof apiKeys, key);
    
    if (selectedProvider === 'nvidia') {
      fetchNimModels();
    }
    
    toast({
      title: 'Saved',
      description: `${currentProvider.name} API key updated. Models will refresh on the dashboard.`
    });
  };

  const getKeyStatus = (provider: string): boolean => {
    const keyField = provider as keyof typeof apiKeys;
    const key = apiKeys[keyField];
    return typeof key === 'string' ? key.length > 0 : false;
  };

  const configuredCount = Object.keys(providerConfig).filter(p => getKeyStatus(p)).length;

  return (
    <MainLayout>
      <div className="min-h-screen bg-ghost-canvas p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-semibold text-midnight-navy mb-2">Settings</h1>
            <p className="text-slate-ink">Manage your account and application preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div>
                  <h2 className="text-xl font-display font-semibold text-midnight-navy mb-2">Settings</h2>
                  <p className="text-slate-ink mb-6">Configure your preferences</p>
                </div>
                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'appearance', label: 'Appearance', icon: Palette },
                    { id: 'internet', label: 'Internet Search', icon: Search },
                    { id: 'general', label: 'General', icon: SettingsIcon },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'privacy', label: 'Privacy', icon: Shield },
                    { id: 'data', label: 'Data Management', icon: Database },
                    { id: 'security', label: 'Security', icon: Shield },
                    { id: 'billing', label: 'Billing', icon: Database },
                    { id: 'integrations', label: 'Integrations', icon: Globe },
                    { id: 'advanced', label: 'Advanced', icon: SettingsIcon }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left hover:bg-ghost-canvas text-slate-ink hover:text-midnight-navy justify-start"
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Settings */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">Profile Settings</h2>
                    <p className="text-slate-ink">Manage your personal information</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-midnight-navy">Full Name</Label>
                      <Input id="name" placeholder="Enter your name" className="input-antimetal" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-midnight-navy">Email Address</Label>
                      <Input id="email" type="email" placeholder="Enter your email" className="input-antimetal" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-midnight-navy">Bio</Label>
                    <Input id="bio" placeholder="Tell us about yourself" className="input-antimetal" />
                  </div>
                  <Button className="btn-primary">Save Profile</Button>
                </div>
              </div>

              {/* Appearance Settings */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">Appearance</h2>
                    <p className="text-slate-ink">Customize the look and feel</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-midnight-navy mb-3 block">Theme</Label>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>

              {/* Internet Search Settings */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <Search className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">Internet Search</h2>
                    <p className="text-slate-ink">Control how VaultMind answers your questions</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-midnight-navy">Search the internet</Label>
                      <p className="text-sm text-slate-ink">
                        When enabled, VaultMind will search the internet in addition to your documents.
                        When disabled, responses are grounded only to your uploaded sources.
                      </p>
                    </div>
                    <Switch
                      checked={searchInternet}
                      onCheckedChange={setSearchInternet}
                    />
                  </div>
                  <div className="p-4 bg-ghost-canvas border border-fog-border rounded-lg">
                    <p className="text-sm text-slate-ink">
                      <strong className="text-midnight-navy">Docs only:</strong> Answers come strictly from your uploaded documents and sources.
                    </p>
                    <p className="text-sm text-slate-ink mt-2">
                      <strong className="text-midnight-navy">Docs + Internet:</strong> VaultMind prioritizes your documents but supplements with web search when needed for current information or gaps.
                    </p>
                  </div>
                </div>
              </div>

              {/* General Settings */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <SettingsIcon className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">General Settings</h2>
                    <p className="text-slate-ink">Configure application preferences</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-midnight-navy">Language</Label>
                      <Input id="language" placeholder="English" className="input-antimetal" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-midnight-navy">Timezone</Label>
                      <Input id="timezone" placeholder="UTC" className="input-antimetal" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aiModel" className="text-midnight-navy">Default AI Model</Label>
                    <Input id="aiModel" placeholder="GPT-4o" className="input-antimetal" />
                  </div>
                  <Button className="btn-primary">Save Settings</Button>
                </div>
              </div>

              {/* Notifications Settings */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">Notifications</h2>
                    <p className="text-slate-ink">Manage your notification preferences</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-midnight-navy">Email Notifications</Label>
                        <p className="text-sm text-slate-ink">Receive email updates about your account</p>
                      </div>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-midnight-navy">Push Notifications</Label>
                        <p className="text-sm text-slate-ink">Receive push notifications on your devices</p>
                      </div>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Enable</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">Privacy</h2>
                    <p className="text-slate-ink">Control your privacy settings</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-midnight-navy">Profile Visibility</Label>
                        <p className="text-sm text-slate-ink">Make your profile visible to other users</p>
                      </div>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Public</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-midnight-navy">Data Sharing</Label>
                        <p className="text-sm text-slate-ink">Allow anonymized data sharing for research</p>
                      </div>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Disable</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">Data Management</h2>
                    <p className="text-slate-ink">Manage your data and export options</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-midnight-navy">Export Data</Label>
                      <p className="text-sm text-slate-ink mb-3">Download a copy of your data</p>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Export Data</Button>
                    </div>
                    <div>
                      <Label className="text-midnight-navy">Delete Account</Label>
                      <p className="text-sm text-slate-ink mb-3">Permanently delete your account and all associated data</p>
                      <Button variant="outline" className="btn-ghost-light border-red-200 text-red-600 hover:bg-red-50">Delete Account</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">Security</h2>
                    <p className="text-slate-ink">Manage your security settings</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-midnight-navy">Two-Factor Authentication</Label>
                      <p className="text-sm text-slate-ink mb-3">Add an extra layer of security to your account</p>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Enable 2FA</Button>
                    </div>
                    <div>
                      <Label className="text-midnight-navy">Change Password</Label>
                      <p className="text-sm text-slate-ink mb-3">Update your password</p>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Change Password</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Settings */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">Billing</h2>
                    <p className="text-slate-ink">Manage your billing and subscription</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-midnight-navy">Current Plan</Label>
                      <p className="text-sm text-slate-ink mb-3">Free Plan</p>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Upgrade Plan</Button>
                    </div>
                    <div>
                      <Label className="text-midnight-navy">Payment Methods</Label>
                      <p className="text-sm text-slate-ink mb-3">Manage your payment methods</p>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Manage Payments</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integrations Settings */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">Integrations</h2>
                    <p className="text-slate-ink">Connect with third-party services</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-600 rounded-full"></div>
                        <div>
                          <Label className="text-midnight-navy">Google Drive</Label>
                          <p className="text-sm text-slate-ink">Connect your Google Drive account</p>
                        </div>
                      </div>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Connect</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full"></div>
                        <div>
                          <Label className="text-midnight-navy">Dropbox</Label>
                          <p className="text-sm text-slate-ink">Connect your Dropbox account</p>
                        </div>
                      </div>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Connect</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Keys */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <Key className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">API Keys</h2>
                    <p className="text-slate-ink">Configure service provider keys for BYOK (Bring Your Own Key)</p>
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-ghost-canvas rounded-xl border border-fog-border">
                  <p className="text-sm text-midnight-navy">
                    <span className="font-medium text-chartreuse">{configuredCount}</span> of {Object.keys(providerConfig).length} providers configured
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-midnight-navy">Select Provider</Label>
                    <Select value={selectedProvider} onValueChange={handleProviderChange}>
                      <SelectTrigger className="w-full input-antimetal">
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(providerConfig).map(([id, config]) => (
                          <SelectItem key={id} value={id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{config.name}</span>
                              {getKeyStatus(id) && (
                                <Check className="w-4 h-4 text-emerald-600 ml-2" />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-key" className="text-midnight-navy">
                      {currentProvider.name} API Key
                    </Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder={currentProvider.placeholder}
                      value={localKey}
                      onChange={(e) => setLocalKey(e.target.value)}
                      className="input-antimetal"
                    />
                    <p className="text-sm text-slate-ink">
                      Get your key from the{' '}
                      <a
                        href={currentProvider.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-midnight-navy hover:text-chartreuse transition-colors underline inline-flex items-center gap-1"
                      >
                        {currentProvider.docsLabel}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      . Models appear on the dashboard once saved.
                    </p>
                  </div>

                  <Button onClick={saveKey} className="btn-primary">
                    Save {currentProvider.name} Key
                  </Button>

                  <div className="pt-4 border-t border-fog-border">
                    <p className="text-sm text-slate-ink mb-3">Configured Providers</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(providerConfig).map(([id, config]) => {
                        const hasKey = getKeyStatus(id);
                        return (
                          <div
                            key={id}
                            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                              hasKey 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-ghost-canvas text-slate-ink border border-fog-border'
                            }`}
                          >
                            {hasKey && <Check className="w-3 h-3" />}
                            {config.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-white border border-fog-border p-6 rounded-xl shadow-ant-card">
                <div className="flex items-center gap-3 mb-6">
                  <SettingsIcon className="w-6 h-6 text-midnight-navy" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-midnight-navy">Advanced</h2>
                    <p className="text-slate-ink">Advanced configuration options</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-midnight-navy">Developer Mode</Label>
                        <p className="text-sm text-slate-ink">Enable advanced developer features</p>
                      </div>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-midnight-navy">API Access</Label>
                        <p className="text-sm text-slate-ink">Manage API keys and access</p>
                      </div>
                      <Button variant="outline" className="btn-ghost-light border-fog-border text-midnight-navy">Manage</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
