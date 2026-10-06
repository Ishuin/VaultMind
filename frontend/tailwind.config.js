// @ts-check
/** @type {import('tailwindcss').Config} */

const config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Antimetal Design System Colors
        "midnight-navy": "#1b2540",
        "deep-cosmos": "#001033",
        "chartreuse": "#8ab800",
        "ice-veil": "#e0f6ff",
        "ghost-canvas": "#f8f9fc",
        "pure-surface": "#ffffff",
        "slate-ink": "#6b7184",
        "ash-medium": "#7c8293",
        "storm-gray": "#596075",
        "fog-border": "#b1b5c0",
        
        // shadcn/ui compat
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Antimetal radii
        "ant-card": "20px",
        "ant-badge": "16px",
        "ant-button": "9999px",
        "ant-pill": "60px",
      },
      fontFamily: {
        // Antimetal fonts - Inter for UI, Fraunces for display headlines
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        // Theme-aware shadows
        "ant-md": "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--border)",
        "ant-xl": "0 8px 32px -4px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--border)",
        "ant-card": "0 4px 20px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--border)",
        "ant-cta": "0 4px 16px -4px rgba(0, 0, 0, 0.2)",
        "ant-badge": "0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--border)",
        "ant-ghost-dark": "rgba(255, 255, 255, 0.08) 0px 0px 16px 8px inset, rgba(255, 255, 255, 0.08) 0px 0px 8px 4px inset, rgba(255, 255, 255, 0.08) 0px 0px 4px 2px inset, rgba(255, 255, 255, 0.12) 0px 0px 2px 1px inset",
        "ant-ghost-light": "rgba(255, 255, 255, 0.72) 0px 1px 1px 0px inset, rgba(4, 33, 80, 0.02) 0px 8px 16px 0px, rgba(4, 33, 80, 0.03) 0px 4px 12px 0px, rgba(4, 33, 80, 0.06) 0px 1px 2px 0px, rgba(4, 33, 80, 0.04) 0px 0px 0px 1px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

module.exports = config;
