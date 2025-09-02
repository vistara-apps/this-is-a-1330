/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(220, 15%, 8%)',
        surface: 'hsl(220, 15%, 12%)',
        surfaceLight: 'hsl(220, 15%, 16%)',
        primary: 'hsl(230, 70%, 50%)',
        accent: 'hsl(190, 80%, 50%)',
        success: 'hsl(142, 76%, 36%)',
        warning: 'hsl(48, 96%, 53%)',
        error: 'hsl(0, 84%, 60%)',
        textPrimary: 'hsl(0, 0%, 95%)',
        textSecondary: 'hsl(0, 0%, 70%)',
        textMuted: 'hsl(0, 0%, 50%)',
        border: 'hsl(220, 15%, 16%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.22,1,0.36,1)',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.22,1,0.36,1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
