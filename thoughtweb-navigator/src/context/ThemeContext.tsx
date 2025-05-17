'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
} from 'next-themes'
import type { ReactElement, ReactNode } from 'react'

interface ThemeProviderSpecificProps {
  attribute?: string
  storageKey?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: { children: ReactElement } & ThemeProviderSpecificProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      storageKey="thoughtweb-theme"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

// It's common to also export a useTheme hook from here, 
// but the temp_code version doesn't. We'll stick to its content.
// If a useTheme hook is needed by other temp_code components,
// it might be defined elsewhere or imported directly from next-themes.
