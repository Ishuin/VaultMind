import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { User, Palette, Settings as SettingsIcon, Globe, Bell, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account and application preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="glass-panel p-6 rounded-3xl">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Settings</h2>
                  <p className="text-gray-400 mb-6">Configure your preferences</p>
                </div>
                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'appearance', label: 'Appearance', icon: Palette },
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
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative overflow-hidden text-left hover:bg-gray-800/50"
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                        
                        {/* Glassmorphism hover effect */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700`}></div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Settings */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                    <p className="text-gray-400">Manage your personal information</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                      <Input id="name" placeholder="Enter your name" className="bg-gray-800/50 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                      <Input id="email" type="email" placeholder="Enter your email" className="bg-gray-800/50 border-gray-600 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                    <Input id="bio" placeholder="Tell us about yourself" className="bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">Save Profile</Button>
                </div>
              </div>

              {/* Appearance Settings */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Appearance</h2>
                    <p className="text-gray-400">Customize the look and feel</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300 mb-3 block">Theme</Label>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>

              {/* General Settings */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <SettingsIcon className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">General Settings</h2>
                    <p className="text-gray-400">Configure application preferences</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-gray-300">Language</Label>
                      <Input id="language" placeholder="English" className="bg-gray-800/50 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                      <Input id="timezone" placeholder="UTC" className="bg-gray-800/50 border-gray-600 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aiModel" className="text-gray-300">Default AI Model</Label>
                    <Input id="aiModel" placeholder="GPT-4o" className="bg-gray-800/50 border-gray-600 text-white" />
                  </div>
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">Save Settings</Button>
                </div>
              </div>

              {/* Notifications Settings */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Notifications</h2>
                    <p className="text-gray-400">Manage your notification preferences</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Email Notifications</Label>
                        <p className="text-sm text-gray-400">Receive email updates about your account</p>
                      </div>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Push Notifications</Label>
                        <p className="text-sm text-gray-400">Receive push notifications on your devices</p>
                      </div>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Enable</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Privacy</h2>
                    <p className="text-gray-400">Control your privacy settings</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Profile Visibility</Label>
                        <p className="text-sm text-gray-400">Make your profile visible to other users</p>
                      </div>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Public</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Data Sharing</Label>
                        <p className="text-sm text-gray-400">Allow anonymized data sharing for research</p>
                      </div>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Disable</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Data Management</h2>
                    <p className="text-gray-400">Manage your data and export options</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Export Data</Label>
                      <p className="text-sm text-gray-400 mb-3">Download a copy of your data</p>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Export Data</Button>
                    </div>
                    <div>
                      <Label className="text-gray-300">Delete Account</Label>
                      <p className="text-sm text-gray-400 mb-3">Permanently delete your account and all associated data</p>
                      <Button variant="outline" className="glass-button border-destructive text-destructive dark:border-[#ff0055] dark:text-[#ff0055]">Delete Account</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Security</h2>
                    <p className="text-gray-400">Manage your security settings</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-400 mb-3">Add an extra layer of security to your account</p>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Enable 2FA</Button>
                    </div>
                    <div>
                      <Label className="text-gray-300">Change Password</Label>
                      <p className="text-sm text-gray-400 mb-3">Update your password</p>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Change Password</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Settings */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Billing</h2>
                    <p className="text-gray-400">Manage your billing and subscription</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Current Plan</Label>
                      <p className="text-sm text-gray-400 mb-3">Free Plan</p>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Upgrade Plan</Button>
                    </div>
                    <div>
                      <Label className="text-gray-300">Payment Methods</Label>
                      <p className="text-sm text-gray-400 mb-3">Manage your payment methods</p>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Manage Payments</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integrations Settings */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Integrations</h2>
                    <p className="text-gray-400">Connect with third-party services</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                        <div>
                          <Label className="text-gray-300">Google Drive</Label>
                          <p className="text-sm text-gray-400">Connect your Google Drive account</p>
                        </div>
                      </div>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Connect</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
                        <div>
                          <Label className="text-gray-300">Dropbox</Label>
                          <p className="text-sm text-gray-400">Connect your Dropbox account</p>
                        </div>
                      </div>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Connect</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <SettingsIcon className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Advanced</h2>
                    <p className="text-gray-400">Advanced configuration options</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Developer Mode</Label>
                        <p className="text-sm text-gray-400">Enable advanced developer features</p>
                      </div>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">API Access</Label>
                        <p className="text-sm text-gray-400">Manage API keys and access</p>
                      </div>
                      <Button variant="outline" className="glass-button border-gray-600 text-gray-300">Manage</Button>
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
