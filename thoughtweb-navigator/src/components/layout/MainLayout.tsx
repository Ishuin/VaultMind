"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useAppContext } from "@/context/AppContext"
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
  Plus,
  MessageSquare,
  Trash2,
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
  const {
    conversations,
    currentConversationId,
    fetchConversations,
    createConversation,
    loadConversation,
    deleteConversation,
  } = useAppContext()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const prevSidebarCollapsed = useRef(false)
  const [sidebarAnimating, setSidebarAnimating] = useState(false)

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Delay content render until sidebar transition completes to prevent shift
  const toggleSidebar = () => {
    prevSidebarCollapsed.current = sidebarCollapsed
    setSidebarAnimating(true)
    setSidebarCollapsed(!sidebarCollapsed)
    setTimeout(() => setSidebarAnimating(false), 300)
  }

  // During animation, show previous state's content; after, show current
  const showExpandedContent = sidebarAnimating ? !prevSidebarCollapsed.current : !sidebarCollapsed

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

  const handleNewChat = async () => {
    await createConversation()
    // Navigate to dashboard/chat if not already there
    if (pathname !== "/dashboard") {
      navigate("/dashboard")
    }
  }

  const handleLoadConversation = async (id: number) => {
    await loadConversation(id)
    // Navigate to dashboard/chat if not already there
    if (pathname !== "/dashboard") {
      navigate("/dashboard")
    }
    setMobileMenuOpen(false)
  }

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
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

          {/* Mobile: New Chat + Conversations */}
          <div className="px-4 pb-4">
            <div className="border-t border-border pt-4">
              <Button
                onClick={handleNewChat}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 mb-3 text-xs"
              >
                <Plus className="w-3 h-3" />
                New Chat
              </Button>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Chats</p>
              <div className="space-y-1">
                {conversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No conversations yet</p>
                ) : (
                  conversations.map((convo) => (
                    <div
                      key={convo.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm group transition-colors",
                        currentConversationId === convo.id
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      onClick={() => handleLoadConversation(convo.id)}
                    >
                      <MessageSquare className="w-3 h-3 flex-shrink-0" />
                      <span className="flex-1 truncate">{convo.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(convo.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 hidden md:flex flex-col overflow-hidden ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
          {showExpandedContent && (
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

        {/* Navigation — fixed at top */}
        <div className="p-3 flex-shrink-0">
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
                    {showExpandedContent && <span>{item.label}</span>}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* New Chat — divider + button */}
        <div className="px-3 pt-3 pb-3 flex-shrink-0 border-t border-border">
          {showExpandedContent ? (
            <Button
              onClick={handleNewChat}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
            >
              <Plus className="w-3 h-3" />
              New Chat
            </Button>
          ) : (
            <Button
              onClick={handleNewChat}
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
              title="New Chat"
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Conversation History — scrollable, only when expanded */}
        {showExpandedContent && (
          <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
            <div className="space-y-0.5">
              {conversations.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 px-1">No conversations yet</p>
              ) : (
                conversations.map((convo) => (
                  <div
                    key={convo.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm group transition-colors",
                      currentConversationId === convo.id
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => handleLoadConversation(convo.id)}
                  >
                    <MessageSquare className="w-3 h-3 flex-shrink-0" />
                    <span className="flex-1 truncate">{convo.title}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatRelativeTime(convo.updated_at || convo.created_at)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(convo.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Spacer — pushes user menu to bottom in collapsed mode */}
        {!showExpandedContent && <div className="flex-1" />}

        {/* User Menu — fixed at bottom, always has border-t and consistent padding */}
        <div className="flex-shrink-0 p-3 border-t border-border">
          {showExpandedContent ? (
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
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-muted h-auto py-2"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-card border border-border shadow-ant-xl rounded-xl">
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
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
