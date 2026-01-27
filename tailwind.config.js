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
      },
    },
  },
  plugins: [],
}
