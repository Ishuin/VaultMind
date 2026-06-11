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
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-8 text-primary">Settings</h1>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 bg-muted p-1 rounded-md">
            <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">General</TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Appearance</TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your general application preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="aiModel">Default AI Model</Label>
                  <Input id="aiModel" placeholder="e.g., GPT-4o, Claude 3 Opus" />
                  <p className="text-sm text-muted-foreground">
                    Select your preferred AI model for content generation and analysis.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Input id="defaultLanguage" placeholder="e.g., English, Spanish" />
                </div>
                <Button>Save General Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground pb-2">
                    Select your preferred interface theme.
                  </p>
                  <ThemeToggle />
                </div>
                {/* Add more appearance settings here, e.g., font size, density */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account details and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">Your account details are managed on the <a href="/profile" className="text-primary hover:underline">Profile page</a>.</p>
                <div>
                  <Button variant="destructive">Delete Account</Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
