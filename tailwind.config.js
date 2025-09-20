/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        fg: 'var(--color-fg)',
        muted: 'var(--color-muted)',
        primary: 'var(--color-primary)'
      },
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        sm: 'var(--radius-sm)'
      },
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)'
      }
    }
  },
  plugins: []
};
