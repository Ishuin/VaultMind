// @ts-check
/** @type {import('tailwindcss').Config} */

// const { shadcnPlugin } = require("./lib/shadcn-plugin"); // This file is missing in temp_code/lib, commenting out

const config = {
  darkMode: ["class"],
  content: [
    // Adjusted for Vite structure
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // "*.{js,ts,jsx,tsx,mdx}", // This glob is too broad for Vite, might cause issues
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
        // Neon Cyan from temp_code
        cyan: {
          50: "#e6fefa",
          100: "#ccfdf5",
          200: "#99fbeb",
          300: "#66f9e0",
          400: "#33f7d6",
          500: "#0ff4c6",
          600: "#0cc39e",
          700: "#099277",
          800: "#06624f",
          900: "#033128",
          950: "#011814",
        },
        // Neon Purple from temp_code
        purple: {
          50: "#f9f0fe",
          100: "#f3e1fd",
          200: "#e7c3fb",
          300: "#dba5f9",
          400: "#cf87f7",
          500: "#bf5af2",
          600: "#a84cd9",
          700: "#7e39a2",
          800: "#54266c",
          900: "#2a1336",
          950: "#15091b",
        },
      },
      // borderRadius, keyframes, animation, boxShadow were inside colors in temp_code, moving them to extend
      borderRadius: { // from temp_code (uses --radius from index.css)
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: { // from temp_code
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulse: { // This is the 'pulse' from temp_code
          "0%, 100%": { opacity: "0.8" },
          "50%": { opacity: "1" },
        },
        float: { // This is the 'float' from temp_code
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        // Additional keyframes from index.css (which is temp_code/app/globals.css)
        'pulse-glow': { "0%, 100%": { opacity: "0.7" }, "50%": { opacity: "1" } }, // same as pulse
        'scan-line': { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        'rotate': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        'data-flow': { '0%': { backgroundPosition: '0% 0%' }, '100%': { backgroundPosition: '200% 0%' } },
        'flicker': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.8' } },
        'holo-shift': { '0%': { filter: 'hue-rotate(0deg)' }, '50%': { filter: 'hue-rotate(15deg)' }, '100%': { filter: 'hue-rotate(0deg)' } },
      },
      animation: { // from temp_code, plus index.css animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pulse: "pulse 3s infinite ease-in-out",
        float: "float 6s infinite ease-in-out",
        'pulse-glow': "pulse-glow 3s infinite ease-in-out",
        'scan-line': 'scan-line 2s linear infinite',
        'rotate': 'rotate 10s linear infinite',
        'data-flow': 'data-flow 10s linear infinite',
        'flicker': 'flicker 2s infinite ease-in-out',
        'holo-shift': 'holo-shift 5s infinite ease-in-out',
      },
      boxShadow: { // from temp_code, mapped to CSS vars from index.css
        "cyan-glow": "var(--teal-glow)",
        "purple-glow": "var(--magenta-glow)",
        "blue-glow": "var(--blue-glow)",
        "red-glow": "var(--red-glow)",
        "yellow-glow": "var(--yellow-glow)", // from our index.css
      },
      fontFamily: { // From our previous setup, matches temp_code's intent
        sans: ['"Exo 2"', 'sans-serif'],
        heading: ['Orbitron', 'sans-serif'],
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    // shadcnPlugin, // Commented out as ./lib/shadcn-plugin is missing
    // require('tailwindcss-textshadow') // Removing as it's not installed
  ],
};

module.exports = config;
