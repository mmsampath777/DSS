/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#EEF2FF',
          500: '#6366F1',
        },
        secondary: '#2563EB',
        accent: '#7C3AED',
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#D97706',
        info: '#0891B2',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        'text-primary': '#111827',
        'text-muted': '#6B7280',
        // Dark theme variants
        'bg-dark': '#0F172A',
        'surface-dark': '#0B1220',
        'text-primary-dark': '#E6EEF8',
        'border-dark': '#1F2937',
      },
    },
  },
  plugins: [],
};
