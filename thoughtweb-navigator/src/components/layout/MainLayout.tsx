"use client"

import type React from "react"

import { useState } from "react"
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
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navItems = [
    { id: 'dashboard', label: "Dashboard", icon: Cpu, href: "/dashboard" },
    { id: 'data-sources', label: "Sources", icon: Database, href: "/sources" },
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
    <div className="flex h-screen bg-background">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full bg-card border border-border shadow-ant-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
        </Button>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="relative w-64 h-full bg-card overflow-y-auto">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="font-semibold text-base text-foreground">ThoughtWeb</h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <nav className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Navigation</p>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.id}>
                    <Link to={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 hidden md:flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="font-semibold text-sm text-foreground">ThoughtWeb</h1>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronLeft className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="p-3 flex-1 overflow-auto">
          {!sidebarCollapsed && <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">Navigation</p>}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link to={item.href} key={item.id}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Menu */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted h-auto py-2"
                >
                  <Avatar className="h-8 w-8 mr-3 border border-border">
                    <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-foreground">{user?.user_metadata?.name || user?.email?.split('@')[0]}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-card border border-border shadow-ant-xl rounded-xl">
                <div className="px-3 py-2 border-b border-border">
                  <div className="text-xs text-muted-foreground">Signed in as</div>
                  <div className="text-sm font-medium text-foreground truncate">{user?.email}</div>
                </div>
                <Link to="/profile">
                  <DropdownMenuItem className="text-sm text-muted-foreground focus:bg-muted focus:text-foreground cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/settings">
                  <DropdownMenuItem className="text-sm text-muted-foreground focus:bg-muted focus:text-foreground cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-border" />
                <div className="px-3 py-2">
                  <ThemeToggle />
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut()
                    navigate("/auth")
                  }}
                  className="text-sm text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
