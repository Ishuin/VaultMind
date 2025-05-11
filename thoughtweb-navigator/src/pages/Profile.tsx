import { MainLayout } from "@/components/layout/MainLayout" // Corrected path
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Fingerprint, Zap, Shield, Lock } from "lucide-react" // Removed Brain as it's not used here

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-[#00f6ff] dark:glow-text">Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information Card */}
          <div className="glass-panel p-6 rounded-3xl lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Fingerprint className="h-5 w-5 text-primary dark:text-[#00f6ff]" />
              <h2 className="text-xl font-bold text-primary dark:text-[#00f6ff]">Account Information</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="entity-id" className="text-foreground dark:text-gray-200">
                    Email
                  </Label>
                  <div className="relative">
                    <Input id="entity-id" value="user@thoughtweb.ai" disabled className="glass-input pl-10" />
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground dark:text-gray-500" />
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">Your email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entity-designation" className="text-foreground dark:text-gray-200">
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input id="entity-designation" defaultValue="John Doe" className="glass-input pl-10" />
                    <Fingerprint className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground dark:text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Profile Settings */}
              <div className="pt-4 border-t border-border dark:border-gray-800/50">
                <h3 className="text-lg font-medium text-foreground dark:text-gray-200 mb-4">Profile Settings</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground dark:text-gray-200">
                      Bio
                    </Label>
                    <textarea
                      id="bio"
                      rows={3}
                      className="w-full glass-input" /* glass-input is now theme-aware */
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-foreground dark:text-gray-200">
                      Timezone
                    </Label>
                    <select id="timezone" className="w-full glass-input"> {/* glass-input is now theme-aware */}
                      <option value="utc">UTC</option>
                      <option value="est">Eastern Time (ET)</option>
                      <option value="cst">Central Time (CT)</option>
                      <option value="mst">Mountain Time (MT)</option>
                      <option value="pst">Pacific Time (PT)</option>
                      <option value="ist">India Standard Time (IST)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button className="glass-button dark:border-[#00f6ff] dark:text-[#00f6ff]">
                <Zap className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Subscription Management Card */}
          <div className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-secondary dark:text-[#ff00e5]" />
              <h2 className="text-xl font-bold text-secondary dark:text-[#ff00e5]">Subscription</h2>
            </div>

            <div className="p-4 bg-muted dark:bg-black/30 rounded-xl mb-6"> {/* Adjusted background for light theme */}
              <div className="flex justify-between mb-3">
                <span className="font-medium text-foreground dark:text-gray-300">Current Plan</span>
                <span className="font-bold text-secondary dark:text-[#ff00e5]">Pro</span>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  { label: "Next Billing Date", value: "June 15, 2025" },
                  { label: "Storage", value: "10 GB" },
                  { label: "AI Credits", value: "1,000 / month" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground dark:text-gray-400">{item.label}</span>
                    <span className="text-foreground dark:text-gray-200">{item.value}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4 bg-border dark:bg-gray-700/50" />

              <div className="flex items-start gap-2 text-sm text-yellow-600 dark:text-[#ffcc00]"> {/* Adjusted alert text color */}
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>Your subscription will automatically renew on the next billing date.</p>
              </div>
            </div>

            {/* Usage Metrics */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-foreground dark:text-gray-200 mb-4">Usage</h3>

              <div className="space-y-3">
                {[
                  { label: "Storage Used", value: "4.2 GB", percent: "42%", color: "var(--secondary)", darkColor: "#ff00e5" },
                  { label: "AI Credits Used", value: "789", percent: "78.9%", color: "var(--secondary)", darkColor: "#ff00e5" },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground dark:text-gray-400">{stat.label}</span>
                      <span className="text-foreground dark:text-gray-200">
                        {stat.value} <span className="text-muted-foreground dark:text-gray-400">({stat.percent})</span>
                      </span>
                    </div>
                    <div className="h-1 bg-muted dark:bg-gray-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: stat.percent,
                          // Conditional background color for progress bar
                          backgroundColor: document.documentElement.classList.contains('dark') ? stat.darkColor : stat.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button className="glass-button dark:border-[#ff00e5] dark:text-[#ff00e5]">
                <Zap className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
              <Button variant="outline" className="glass-button border-destructive text-destructive dark:border-[#ff0055] dark:text-[#ff0055]">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
