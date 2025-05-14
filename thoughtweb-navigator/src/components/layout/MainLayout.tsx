"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom" // Changed for react-router-dom, Added useNavigate
import { useAuth } from "@/context/AuthContext" // Added useAuth import
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/ThemeToggle" // Corrected path
import {
  Brain,
  Database,
  Settings,
  DollarSign,
  User,
  LogOut,
  Cpu,
  BarChart3,
  Shield,
  Network,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils" // Path might need adjustment

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const pathname = location.pathname
  const { user, signOut, session } = useAuth() // Get user and signOut from AuthContext
  const navigate = useNavigate() // For redirecting after signout

  const [currentTime, setCurrentTime] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const seconds = now.getSeconds().toString().padStart(2, "0")
      setCurrentTime(`${hours}:${minutes}:${seconds}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Cpu }, // Vite equivalent: /dashboard
    { href: "/sources", label: "Data Sources", icon: Database }, // Vite equivalent: /sources
    { href: "/analytics", label: "Analytics", icon: BarChart3 }, // No direct Vite equivalent yet
    { href: "/network", label: "Network", icon: Network }, // No direct Vite equivalent yet
    { href: "/security", label: "Security", icon: Shield }, // No direct Vite equivalent yet
    { href: "/settings", label: "Settings", icon: Settings }, // Vite equivalent: /settings
    { href: "/pricing", label: "Pricing", icon: DollarSign }, // Vite equivalent: /pricing
    { href: "/profile", label: "Profile", icon: User }, // Vite equivalent: /profile
  ]

  return (
    <div className="flex h-screen relative">
      {/* Background elements */}
      <div className="absolute inset-0 circuit-bg opacity-10"></div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="glass-button w-10 h-10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5 text-[#00f6ff]" /> : <Menu className="h-5 w-5 text-[#00f6ff]" />}
        </Button>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="relative w-64 h-full bg-black/90 overflow-y-auto">
          <div className="p-4 flex items-center gap-2 border-b border-gray-800/50">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#00f6ff]/20 blur-md"></div>
              <Brain className="h-6 w-6 text-[#00f6ff]" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#00f6ff] glow-text">ThoughtWeb</h1>
              <div className="text-[10px] text-gray-400 flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00f6ff] mr-1 animate-pulse"></div>
                SYSTEM ONLINE • {currentTime}
              </div>
            </div>
          </div>

          <nav className="p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href // This will need to use react-router-dom's useLocation

                return (
                  <li key={item.href}>
                    <Link to={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-gray-300 hover:text-[#00f6ff] hover:bg-[#00f6ff]/5 group",
                          isActive && "bg-[#00f6ff]/10 text-[#00f6ff] border-l-2 border-[#00f6ff] pl-[30px]",
                        )}
                      >
                        <Icon
                          className={`mr-2 h-5 w-5 ${isActive ? "text-[#00f6ff]" : "text-gray-400 group-hover:text-[#00f6ff]"}`}
                        />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-black/60 backdrop-blur-sm border-r border-[#00f6ff]/10 hidden md:flex flex-col relative z-10">
        {/* Glowing border effect */}
        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-[#00f6ff]/20"></div>

        {/* Branding */}
        <div className="p-4 flex items-center gap-2 border-b border-gray-800/50">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#00f6ff]/20 blur-md"></div>
            <Brain className="h-6 w-6 text-[#00f6ff]" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#00f6ff] glow-text">ThoughtWeb</h1>
            <div className="text-[10px] text-gray-400 flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00f6ff] mr-1 animate-pulse"></div>
              SYSTEM ONLINE • {currentTime}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 overflow-auto">
          <div className="text-xs text-gray-500 mb-2 pl-2">NAVIGATION</div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href // This will need to use react-router-dom's useLocation

              return (
                <li key={item.href}>
                  <Link to={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-gray-300 hover:text-[#00f6ff] hover:bg-[#00f6ff]/5 group",
                        isActive && "bg-[#00f6ff]/10 text-[#00f6ff] border-l-2 border-[#00f6ff] pl-[30px]",
                      )}
                    >
                      <Icon
                        className={`mr-2 h-5 w-5 ${isActive ? "text-[#00f6ff]" : "text-gray-400 group-hover:text-[#00f6ff]"}`}
                      />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* System stats */}
          <div className="mt-8 glass-panel rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-2 flex items-center">
              <div className="w-1 h-1 rounded-full bg-[#00f6ff] mr-1"></div>
              SYSTEM STATUS
            </div>
            <div className="space-y-3">
              {[
                { label: "System Load", value: "42%", color: "#00f6ff" },
                { label: "Storage", value: "28%", color: "#ff00e5" },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{stat.label}</span>
                    <span style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                  <div className="h-1 bg-gray-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full animate-pulse"
                      style={{
                        width: stat.value,
                        backgroundColor: stat.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-800/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-[#00f6ff] hover:bg-[#00f6ff]/5 group"
              >
                <Avatar className="h-8 w-8 mr-2 border border-primary dark:border-[#00f6ff]/20">
                  <AvatarFallback className="bg-primary/10 text-primary dark:bg-[#00f6ff]/10 dark:text-[#00f6ff]">
                    {user?.email?.charAt(0).toUpperCase() || user?.user_metadata?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm text-foreground dark:text-gray-300">{user?.user_metadata?.name || user?.email}</span>
                  <span className="text-xs text-muted-foreground dark:text-gray-400 truncate">{user?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 glass-panel border-border dark:border-gray-800/50">
              <div className="px-2 py-1.5 text-center border-b border-border dark:border-gray-800/50">
                <div className="text-xs text-muted-foreground dark:text-gray-400">ACCOUNT TYPE</div>
                <div className="text-primary dark:text-[#00f6ff]">
                  { (user?.user_metadata as { plan?: string })?.plan || "Free" } Account
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border dark:bg-gray-800/50" />
              <Link to="/profile">
                <DropdownMenuItem className="text-foreground dark:text-gray-300 focus:bg-primary/10 dark:focus:bg-[#00f6ff]/10 focus:text-primary dark:focus:text-[#00f6ff] group">
                  <User className="mr-2 h-4 w-4 text-muted-foreground dark:text-gray-400 group-focus:text-primary dark:group-focus:text-[#00f6ff]" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link to="/settings">
                <DropdownMenuItem className="text-foreground dark:text-gray-300 focus:bg-primary/10 dark:focus:bg-[#00f6ff]/10 focus:text-primary dark:focus:text-[#00f6ff] group">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground dark:text-gray-400 group-focus:text-primary dark:group-focus:text-[#00f6ff]" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              {/* <DropdownMenuItem className="text-foreground dark:text-gray-300 focus:bg-primary/10 dark:focus:bg-[#00f6ff]/10 focus:text-primary dark:focus:text-[#00f6ff] group">
                <Shield className="mr-2 h-4 w-4 text-muted-foreground dark:text-gray-400 group-focus:text-primary dark:group-focus:text-[#00f6ff]" />
                <span>Security</span>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator className="bg-border dark:bg-gray-800/50" />
              <div className="px-2 py-1.5">
                <ThemeToggle />
              </div>
              <DropdownMenuSeparator className="bg-border dark:bg-gray-800/50" />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut()
                  navigate("/auth") // Redirect to auth page after sign out
                }}
                className="text-destructive dark:text-[#ff0055] focus:bg-destructive/10 dark:focus:bg-[#ff0055]/10 focus:text-destructive dark:focus:text-[#ff0055] group"
              >
                <LogOut className="mr-2 h-4 w-4 group-focus:text-destructive dark:group-focus:text-[#ff0055]" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 bg-black"></div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  )
}
