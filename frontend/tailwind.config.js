/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#05060F',
        surface: '#0E1324',
        'surface-muted': '#151B2D',
        'surface-elevated': '#1E2538',
        primary: '#4C6EF5',
        'primary-strong': '#3354DB',
        accent: '#22D3EE',
        highlight: '#8B5CF6',
        success: '#4ADE80',
        warning: '#FACC15',
        danger: '#F87171',
        border: 'rgba(148, 163, 184, 0.15)',
        'text-primary': '#F8FBFF',
        'text-secondary': '#A3B3CE',
        'text-muted': '#7C8CAB',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular'],
      },
      boxShadow: {
        'soft-2xl': '0 40px 80px -24px rgba(15, 23, 42, 0.55)',
        'brand-glow': '0 25px 60px -15px rgba(76, 110, 245, 0.45)',
        'inner-card': 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      dropShadow: {
        glow: '0 0 24px rgba(34, 211, 238, 0.55)',
      },
      backdropBlur: {
        '4xl': '40px',
      },
      borderRadius: {
        '3xl': '1.75rem',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(circle at top, rgba(76, 110, 245, 0.22), transparent 55%), radial-gradient(circle at bottom, rgba(139, 92, 246, 0.18), transparent 60%)',
        'card-glow':
          'linear-gradient(130deg, rgba(76,110,245,0.05) 0%, rgba(34,211,238,0.05) 45%, rgba(8,145,178,0.02) 100%)',
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
};
