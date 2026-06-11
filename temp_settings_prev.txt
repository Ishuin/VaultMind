import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle'; // Re-using the theme toggle here for demo

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4"> {/* Adjusted container for consistency */}
        <h1 className="text-3xl font-bold mb-8 text-primary dark:text-[#00f6ff] dark:glow-text">Settings</h1> {/* Updated title style */}

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 bg-muted dark:bg-black/20 rounded-xl p-1"> {/* Updated TabsList style */}
            <TabsTrigger value="general" className="py-2 data-[state=active]:bg-background data-[state=active]:text-primary dark:data-[state=active]:bg-black/30 dark:data-[state=active]:text-[#00f6ff] data-[state=active]:shadow-md rounded-lg">General</TabsTrigger>
            <TabsTrigger value="appearance" className="py-2 data-[state=active]:bg-background data-[state=active]:text-primary dark:data-[state=active]:bg-black/30 dark:data-[state=active]:text-[#00f6ff] data-[state=active]:shadow-md rounded-lg">Appearance</TabsTrigger>
            <TabsTrigger value="account" className="py-2 data-[state=active]:bg-background data-[state=active]:text-primary dark:data-[state=active]:bg-black/30 dark:data-[state=active]:text-[#00f6ff] data-[state=active]:shadow-md rounded-lg">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="glass-panel p-6 rounded-3xl">
              <h2 className="text-xl font-bold text-primary dark:text-[#00f6ff] mb-1">General Settings</h2>
              <p className="text-muted-foreground dark:text-gray-400 mb-6">Manage your general application preferences.</p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="aiModel" className="text-foreground dark:text-gray-200">Default AI Model</Label>
                  <Input id="aiModel" placeholder="e.g., GPT-4o, Claude 3 Opus" className="glass-input" />
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Select your preferred AI model for content generation and analysis.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage" className="text-foreground dark:text-gray-200">Default Language</Label>
                  <Input id="defaultLanguage" placeholder="e.g., English, Spanish" className="glass-input" />
                </div>
                <Button className="glass-button dark:border-[#00f6ff] dark:text-[#00f6ff]">Save General Settings</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <div className="glass-panel p-6 rounded-3xl">
              <h2 className="text-xl font-bold text-primary dark:text-[#00f6ff] mb-1">Appearance</h2>
              <p className="text-muted-foreground dark:text-gray-400 mb-6">Customize the look and feel of the application.</p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-foreground dark:text-gray-200">Theme</Label>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 pb-2">
                    Select your preferred interface theme.
                  </p>
                  <ThemeToggle />
                </div>
                {/* Add more appearance settings here, e.g., font size, density */}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="glass-panel p-6 rounded-3xl">
              <h2 className="text-xl font-bold text-primary dark:text-[#00f6ff] mb-1">Account Settings</h2>
              <p className="text-muted-foreground dark:text-gray-400 mb-6">Manage your account details and preferences.</p>
              <div className="space-y-6">
                <p className="text-foreground dark:text-gray-300">Your account details are managed on the <a href="/profile" className="text-primary dark:text-[#00f6ff] hover:underline dark:hover:text-[#00f6ff]/80">Profile page</a>.</p>
                <div>
                  <Button variant="outline" className="glass-button border-destructive text-destructive dark:border-[#ff0055] dark:text-[#ff0055]">Delete Account</Button>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
