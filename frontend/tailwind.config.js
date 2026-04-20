/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
        },
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
        },
        accent: {
          50:  '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
          400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
          800: '#9f1239', 900: '#881337', 950: '#4c0519',
        },
        ink: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        'card-hover': '0 12px 28px -6px rgb(15 23 42 / 0.12), 0 6px 12px -4px rgb(15 23 42 / 0.06)',
        'glow': '0 0 0 4px rgb(99 102 241 / 0.12)',
        'glow-accent': '0 0 0 4px rgb(244 63 94 / 0.15)',
        'soft': '0 2px 8px -1px rgb(15 23 42 / 0.06), 0 1px 3px -1px rgb(15 23 42 / 0.04)',
        'pop': '0 24px 48px -16px rgb(15 23 42 / 0.18)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xs': ['2rem',    { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-sm': ['2.5rem',  { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '800' }],
        'display':    ['3.5rem',  { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-lg': ['4.5rem',  { lineHeight: '1.02', letterSpacing: '-0.03em',  fontWeight: '800' }],
        'display-xl': ['5.5rem',  { lineHeight: '1',    letterSpacing: '-0.035em', fontWeight: '900' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
      backgroundImage: {
        'mesh-indigo': 'radial-gradient(at 20% 20%, rgb(99 102 241 / 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(168 85 247 / 0.12) 0px, transparent 50%), radial-gradient(at 0% 80%, rgb(244 63 94 / 0.08) 0px, transparent 50%)',
        'mesh-hero': 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(244,63,94,0.18) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(168,85,247,0.2) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
};
