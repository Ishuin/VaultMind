"use client"

import { useTheme } from "next-themes" // This should work with our ThemeProvider
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-gray-400">Theme:</span>
      <div className="flex border border-gray-700/50 rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 rounded-none text-gray-300 hover:text-[#00f6ff] hover:bg-[#00f6ff]/5 ${theme === "light" ? "bg-[#00f6ff]/10 text-[#00f6ff]" : ""}`}
          onClick={() => setTheme("light")}
        >
          <Sun className="h-3.5 w-3.5 mr-1" />
          Light
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 rounded-none text-gray-300 hover:text-[#00f6ff] hover:bg-[#00f6ff]/5 ${theme === "dark" ? "bg-[#00f6ff]/10 text-[#00f6ff]" : ""}`}
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-3.5 w-3.5 mr-1" />
          Dark
        </Button>
      </div>
    </div>
  )
}
