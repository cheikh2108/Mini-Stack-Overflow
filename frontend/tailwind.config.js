/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // OKLCH Color Palette - Premium, Accessible, Dark Mode Ready
      colors: {
        // Primary: Modern Blue (interactive, trustworthy)
        primary: {
          50: 'oklch(97% 0.06 264)',
          100: 'oklch(94% 0.12 264)',
          200: 'oklch(88% 0.18 264)',
          300: 'oklch(82% 0.22 264)',
          400: 'oklch(72% 0.24 264)',
          500: 'oklch(58% 0.23 264)',
          600: 'oklch(50% 0.20 264)',
          700: 'oklch(42% 0.18 264)',
          800: 'oklch(35% 0.15 264)',
          900: 'oklch(30% 0.12 264)',
        },
        // Secondary: Purple (accent, differentiation)
        secondary: {
          50: 'oklch(97% 0.05 300)',
          100: 'oklch(94% 0.10 300)',
          200: 'oklch(88% 0.15 300)',
          300: 'oklch(80% 0.18 300)',
          400: 'oklch(68% 0.20 300)',
          500: 'oklch(55% 0.21 300)',
          600: 'oklch(47% 0.19 300)',
          700: 'oklch(40% 0.17 300)',
          800: 'oklch(33% 0.14 300)',
          900: 'oklch(28% 0.11 300)',
        },
        // Success: Green (positive, confirmation)
        success: {
          50: 'oklch(96% 0.07 150)',
          100: 'oklch(93% 0.13 150)',
          200: 'oklch(86% 0.19 150)',
          300: 'oklch(78% 0.23 150)',
          400: 'oklch(68% 0.25 150)',
          500: 'oklch(55% 0.24 150)',
          600: 'oklch(47% 0.21 150)',
          700: 'oklch(40% 0.18 150)',
          800: 'oklch(33% 0.15 150)',
          900: 'oklch(28% 0.12 150)',
        },
        // Warning: Amber (attention, caution)
        warning: {
          50: 'oklch(97% 0.08 62)',
          100: 'oklch(94% 0.15 62)',
          200: 'oklch(89% 0.21 62)',
          300: 'oklch(82% 0.25 62)',
          400: 'oklch(71% 0.27 62)',
          500: 'oklch(57% 0.26 62)',
          600: 'oklch(48% 0.23 62)',
          700: 'oklch(40% 0.20 62)',
          800: 'oklch(33% 0.16 62)',
          900: 'oklch(28% 0.13 62)',
        },
        // Error: Red (danger, destructive)
        error: {
          50: 'oklch(97% 0.07 30)',
          100: 'oklch(94% 0.13 30)',
          200: 'oklch(88% 0.19 30)',
          300: 'oklch(81% 0.24 30)',
          400: 'oklch(70% 0.27 30)',
          500: 'oklch(55% 0.27 30)',
          600: 'oklch(47% 0.24 30)',
          700: 'oklch(40% 0.21 30)',
          800: 'oklch(33% 0.17 30)',
          900: 'oklch(28% 0.14 30)',
        },
        // Neutral: Professional Gray
        neutral: {
          50: 'oklch(98% 0.01 264)',
          100: 'oklch(96% 0.01 264)',
          200: 'oklch(92% 0.01 264)',
          300: 'oklch(87% 0.01 264)',
          400: 'oklch(78% 0.01 264)',
          500: 'oklch(65% 0.01 264)',
          600: 'oklch(53% 0.01 264)',
          700: 'oklch(43% 0.01 264)',
          800: 'oklch(33% 0.01 264)',
          900: 'oklch(25% 0.01 264)',
        },
      },

      // Typography: Modern Scale with Optical Sizing
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em', fontWeight: '500' }],
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.005em' }],
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.005em' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
      },

      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },

      // Spacing Scale: 4px base unit
      spacing: {
        0: '0px',
        0.5: '0.125rem',
        1: '0.25rem',
        1.5: '0.375rem',
        2: '0.5rem',
        2.5: '0.625rem',
        3: '0.75rem',
        3.5: '0.875rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        28: '7rem',
        32: '8rem',
        36: '9rem',
        40: '10rem',
        44: '11rem',
        48: '12rem',
        52: '13rem',
        56: '14rem',
        60: '15rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem',
      },

      // Border Radius Hierarchy
      borderRadius: {
        none: '0px',
        xs: '0.25rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        full: '9999px',
      },

      // Shadow System: Depth Layers
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        glow: '0 0 20px -5px var(--color-primary-500)',
        'glow-lg': '0 0 30px -8px var(--color-primary-500)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },

      // Animation & Transition Durations
      transitionDuration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        250: '250ms',
        300: '300ms',
        350: '350ms',
        400: '400ms',
        500: '500ms',
      },

      // Keyframe Animations: Premium, Smooth
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 300ms ease-out',
        'fade-out': 'fade-out 300ms ease-out',
        'slide-in-up': 'slide-in-up 300ms ease-out',
        'slide-in-down': 'slide-in-down 300ms ease-out',
        'slide-in-left': 'slide-in-left 300ms ease-out',
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'scale-in': 'scale-in 250ms ease-out',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-sm': 'bounce-sm 1s infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },

      // Transition Timing Functions
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },

      // Blur & Backdrop Blur Enhancements
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },

      // Container Queries (CSS v4)
      container: {
        center: true,
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },

      // Breakpoints for Mobile-First
      screens: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        'hover': { 'raw': '(hover: hover)' },
      },

      // Touch Targets & Accessibility
      minHeight: {
        touch: '2.75rem', // 44px minimum for mobile touch targets
      },

      minWidth: {
        touch: '2.75rem',
      },

      // Line Heights for Different Use Cases
      lineHeight: {
        'tight': '1.2',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
    },
  },

  plugins: [require('daisyui')],

  daisyui: {
    themes: [
      {
        winter: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#1f2937',
          'base-100': '#ffffff',
          'base-200': '#f3f4f6',
          'base-300': '#e5e7eb',
          'base-content': '#1f2937',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      {
        business: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#0f172a',
          'base-100': '#1e293b',
          'base-200': '#0f172a',
          'base-300': '#020617',
          'base-content': '#f1f5f9',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
    styled: true,
    base: true,
    utils: true,
    prefix: '',
    logs: true,
    themeRoot: ':root',
  },
};
