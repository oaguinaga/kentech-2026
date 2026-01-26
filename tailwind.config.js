/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Use CSS variables for theming
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        income: 'var(--color-income)',
        expense: 'var(--color-expense)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
      },
    },
  },
  plugins: [],
}

