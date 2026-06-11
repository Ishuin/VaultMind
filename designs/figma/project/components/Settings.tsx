import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Palette, Globe, Shield, Key, Save } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function Settings() {
  const [settings, setSettings] = useState({
    // Profile
    name: 'Ishu Kumar',
    email: 'ishu.kumar@gmail.com',
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    // Appearance
    theme: 'dark',
    language: 'en',
    timezone: 'America/Los_Angeles',
    // Privacy
    dataCollection: false,
    analytics: true,
    // API
    apiKey: 'sk-...8f2d'
  });

  const settingSections = [
    {
      title: 'Profile Settings',
      icon: User,
      fields: [
        { key: 'name', label: 'Full Name', type: 'text' },
        { key: 'email', label: 'Email Address', type: 'email' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      fields: [
        { key: 'emailNotifications', label: 'Email Notifications', type: 'switch' },
        { key: 'pushNotifications', label: 'Push Notifications', type: 'switch' },
        { key: 'weeklyReports', label: 'Weekly Reports', type: 'switch' }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      fields: [
        { key: 'theme', label: 'Theme', type: 'select', options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
          { value: 'auto', label: 'Auto' }
        ]},
        { key: 'language', label: 'Language', type: 'select', options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' }
        ]},
        { key: 'timezone', label: 'Timezone', type: 'select', options: [
          { value: 'America/Los_Angeles', label: 'Pacific Time' },
          { value: 'America/New_York', label: 'Eastern Time' },
          { value: 'Europe/London', label: 'GMT' }
        ]}
      ]
    },
    {
      title: 'Privacy & Data',
      icon: Shield,
      fields: [
        { key: 'dataCollection', label: 'Allow Data Collection', type: 'switch' },
        { key: 'analytics', label: 'Usage Analytics', type: 'switch' }
      ]
    },
    {
      title: 'API Configuration',
      icon: Key,
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password' }
      ]
    }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (field: any) => {
    const value = settings[field.key as keyof typeof settings];

    switch (field.type) {
      case 'switch':
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor={field.key} className="text-white">{field.label}</Label>
            <Switch
              id={field.key}
              checked={value as boolean}
              onCheckedChange={(checked) => handleSettingChange(field.key, checked)}
            />
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key} className="text-white">{field.label}</Label>
            <Select value={value as string} onValueChange={(val) => handleSettingChange(field.key, val)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {field.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key} className="text-white">{field.label}</Label>
            <Input
              id={field.key}
              type={field.type}
              value={value as string}
              onChange={(e) => handleSettingChange(field.key, e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white focus:border-cyan-500"
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Customize your ThoughtWeb Navigator experience</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {settingSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <Card key={sectionIndex} className="bg-gray-900/50 border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-800/50 rounded-lg">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {section.fields.map((field, fieldIndex) => (
                    <div 
                      key={fieldIndex}
                      className="group relative overflow-hidden p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-cyan-500/50 transition-all"
                    >
                      {/* Glassmorphism effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10">
                        {renderField(field)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="bg-red-900/20 border-red-700/50 p-6 mt-8">
          <h3 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h3>
          <div className="space-y-4">
            <div className="group relative overflow-hidden p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Delete Account</h4>
                  <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  Delete Account
                </Button>
              </div>
            </div>
            
            <div className="group relative overflow-hidden p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Reset All Data</h4>
                  <p className="text-gray-400 text-sm">Clear all knowledge sources and start fresh</p>
                </div>
                <Button variant="outline" className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20">
                  Reset Data
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}