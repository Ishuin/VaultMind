"use client"

import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Cloud } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-muted-foreground">Theme:</span>
      <div className="flex border border-border rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 rounded-none hover:bg-muted ${theme === "light" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          onClick={() => setTheme("light")}
        >
          <Sun className="h-3.5 w-3.5 mr-1" />
          Light
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 rounded-none hover:bg-muted ${theme === "dark" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-3.5 w-3.5 mr-1" />
          Dark
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 rounded-none hover:bg-muted ${theme === "sky" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          onClick={() => setTheme("sky")}
        >
          <Cloud className="h-3.5 w-3.5 mr-1" />
          Sky
        </Button>
      </div>
    </div>
  )
}
