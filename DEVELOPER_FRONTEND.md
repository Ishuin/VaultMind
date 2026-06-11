# Frontend & UI Development - Guidelines

This document focuses on the visual and interactive layer of ThoughtWeb Navigator, emphasizing the use of Framer Motion for high-fidelity animations.

## 1. Design Language
- **Theme**: Dark Mode (Black/Gray base).
- **Accents**: Cyan (`#00f6ff`) and Purple (`#7c3aed`).
- **Styles**: Glassmorphism (semi-transparent backgrounds, subtle borders, backdrop-blur).

## 2. Framer Motion Integration
All key UI components should implement smooth transitions:
- **Page Transitions**: Use `AnimatePresence` and `motion.div` for fade-in/slide-up effects when switching views.
- **Micro-interactions**: 
  - Hover states: Subtle scale or glow increases.
  - Buttons: `whileTap={{ scale: 0.95 }}`.
  - Lists: Use `layout` prop for smooth reordering and item addition/removal.
- **Loading States**: Replace standard spinners with custom animated SVG patterns or pulsed glass panels.

## 3. Component Architecture
- **Shadcn/UI**: The foundation for standard inputs, buttons, and dialogs.
- **Custom Glass Components**: Wrap base components in high-polish glass styles defined in `index.css`.
- **Responsive Design**: Mobile-first approach using Tailwind's `md:` and `lg:` breakpoints.

---
*Focus: Beauty, Feedback, and Flow.*
