/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Use CSS variables with hsl() wrapper for theming
        primary: 'hsl(var(--color-primary))',
        secondary: 'hsl(var(--color-secondary))',
        background: 'hsl(var(--color-background))',
        'background-secondary': 'hsl(var(--color-background-secondary))',
        text: 'hsl(var(--color-text))',
        'text-secondary': 'hsl(var(--color-text-secondary))',
        border: 'hsl(var(--color-border))',
        income: 'hsl(var(--color-income))',
        expense: 'hsl(var(--color-expense))',
        error: 'hsl(var(--color-error))',
        success: 'hsl(var(--color-success))',
        'success-surface': 'hsl(var(--color-success-surface))',
        'error-surface': 'hsl(var(--color-error-surface))',
        'info-surface': 'hsl(var(--color-info-surface))',
      },
      zIndex: {
        // Z-index scale for consistent layering
        // Use semantic names to prevent conflicts
        base: '0',
        dropdown: '10',
        sticky: '20',
        overlay: '30',
        header: '40',
        panel: '50',
        modal: '60',
        toast: '70',
        tooltip: '80',
      },
    },
  },
  plugins: [],
}
