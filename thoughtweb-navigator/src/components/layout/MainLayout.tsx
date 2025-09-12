"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const pathname = location.pathname
  const { user, signOut, session } = useAuth()
  const navigate = useNavigate()

  const [currentTime, setCurrentTime] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
    { id: 'dashboard', label: "Dashboard", icon: Cpu, href: "/dashboard" },
    { id: 'data-sources', label: "Data Sources", icon: Database, href: "/sources" },
    { id: 'analytics', label: "Analytics", icon: BarChart3, href: "/analytics" },
    { id: 'network', label: "Network", icon: Network, href: "/network" },
    { id: 'security', label: "Security", icon: Shield, href: "/security" },
    { id: 'settings', label: "Settings", icon: Settings, href: "/settings" },
    { id: 'pricing', label: "Pricing", icon: DollarSign, href: "/dashboard-pricing" },
    { id: 'profile', label: "Profile", icon: User, href: "/profile" },
  ]

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

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
        <div className="relative w-64 h-full bg-gray-900/90 backdrop-blur-sm overflow-y-auto">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
              <h1 className="font-bold text-lg text-[#00f6ff] glow-text">ThoughtWeb</h1>
              <div className="text-[10px] text-gray-400 flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00f6ff] mr-1 animate-pulse"></div>
                SYSTEM ONLINE • {currentTime}
              </div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Navigation</p>
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.id}>
                    <Link to={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative overflow-hidden",
                          isActive 
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                        
                        {/* Glassmorphism hover effect */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700`}></div>
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
      <aside className={`fixed left-0 top-0 h-full bg-gray-900/90 backdrop-blur-sm border-r border-gray-800 transition-all duration-300 z-50 hidden md:flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
            <h1 className="font-bold text-lg text-[#00f6ff] glow-text">ThoughtWeb</h1>
            <div className="text-[10px] text-gray-400 flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00f6ff] mr-1 animate-pulse"></div>
              SYSTEM ONLINE • {currentTime}
            </div>
          </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 flex-1 overflow-auto">
          {!sidebarCollapsed && <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Navigation</p>}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link to={item.href} key={item.id}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative overflow-hidden justify-start text-left",
                      isActive 
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    
                    {/* Glassmorphism hover effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ${sidebarCollapsed ? 'hidden' : ''}`}></div>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* System Status */}
          {!sidebarCollapsed && (
            <div className="mt-8">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">System Status</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">System Load</span>
                    <span className="text-sm text-cyan-400">42%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div className="bg-cyan-400 h-1 rounded-full w-[42%]"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Storage</span>
                    <span className="text-sm text-purple-400">28%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div className="bg-purple-400 h-1 rounded-full w-[28%]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-800">
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
                <DropdownMenuSeparator className="bg-border dark:bg-gray-800/50" />
                <div className="px-2 py-1.5">
                  <ThemeToggle />
                </div>
                <DropdownMenuSeparator className="bg-border dark:bg-gray-800/50" />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut()
                    navigate("/auth")
                  }}
                  className="text-destructive dark:text-[#ff0055] focus:bg-destructive/10 dark:focus:bg-[#ff0055]/10 focus:text-destructive dark:focus:text-[#ff0055] group"
                >
                  <LogOut className="mr-2 h-4 w-4 group-focus:text-destructive dark:group-focus:text-[#ff0055]" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto relative transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <div className="absolute inset-0 bg-black"></div>
        <div className="relative z-10 p-6">{children}</div>
      </main>
    </div>
  )
}
