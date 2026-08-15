import { cn } from "@/lib/utils"
import { Star, Crown, Shield, Zap } from "lucide-react"

export type BadgeType = "founder_1" | "founder_2" | "founder_3" | "lifetime_founder" | "trial" | "free"

interface FounderBadgeProps {
  type: BadgeType
  className?: string
  showLabel?: boolean
}

const BADGE_CONFIG: Record<BadgeType, {
  label: string
  icon: typeof Star
  colors: string
  bgColors: string
}> = {
  founder_1: {
    label: "Founder",
    icon: Zap,
    colors: "text-blue-600 dark:text-blue-400",
    bgColors: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
  },
  founder_2: {
    label: "Founder Pro",
    icon: Shield,
    colors: "text-purple-600 dark:text-purple-400",
    bgColors: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800",
  },
  founder_3: {
    label: "Founder Elite",
    icon: Crown,
    colors: "text-amber-600 dark:text-amber-400",
    bgColors: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
  },
  lifetime_founder: {
    label: "Lifetime Founder",
    icon: Star,
    colors: "text-yellow-600 dark:text-yellow-400",
    bgColors: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
  },
  trial: {
    label: "Trial",
    icon: Zap,
    colors: "text-gray-600 dark:text-gray-400",
    bgColors: "bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800",
  },
  free: {
    label: "Free",
    icon: Zap,
    colors: "text-gray-600 dark:text-gray-400",
    bgColors: "bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800",
  },
}

export function FounderBadge({ type, className, showLabel = true }: FounderBadgeProps) {
  const config = BADGE_CONFIG[type]
  const Icon = config.icon
  
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium",
        config.colors,
        config.bgColors,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}

export function getBadgeType(isFounder: boolean, founderTier?: string | null): BadgeType {
  if (!isFounder || !founderTier) return "free"
  if (founderTier === "lifetime") return "lifetime_founder"
  return founderTier as BadgeType
}
