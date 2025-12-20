/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./providers/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        'primary-focus': "rgb(var(--color-primary-focus) / <alpha-value>)",
        'primary-content': "rgb(var(--color-primary-content) / <alpha-value>)",
        
        // Secondary colors
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        'secondary-focus': "rgb(var(--color-secondary-focus) / <alpha-value>)",
        'secondary-content': "rgb(var(--color-secondary-content) / <alpha-value>)",
        
        // Accent colors
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        'accent-focus': "rgb(var(--color-accent-focus) / <alpha-value>)",
        'accent-content': "rgb(var(--color-accent-content) / <alpha-value>)",
        
        // Neutral colors
        neutral: "rgb(var(--color-neutral) / <alpha-value>)",
        'neutral-focus': "rgb(var(--color-neutral-focus) / <alpha-value>)",
        'neutral-content': "rgb(var(--color-neutral-content) / <alpha-value>)",
        
        // Base colors
        'base-100': "rgb(var(--color-base-100) / <alpha-value>)",
        'base-200': "rgb(var(--color-base-200) / <alpha-value>)",
        'base-300': "rgb(var(--color-base-300) / <alpha-value>)",
        'base-content': "rgb(var(--color-base-content) / <alpha-value>)",
        
        // Semantic colors
        info: "rgb(var(--color-info) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
      },
      borderRadius: {
        'box': 'var(--rounded-box)',
        'btn': 'var(--rounded-btn)',
        'badge': 'var(--rounded-badge)',
      },
      transitionDuration: {
        'btn': 'var(--animation-btn)',
        'input': 'var(--animation-input)',
      },
    },
  },
  plugins: [
    // 在 :root 元素上设置默认值
    ({ addBase }) =>
      addBase({
        ":root": {
          // Primary colors
          "--color-primary": "249 215 47",
          "--color-primary-focus": "233 195 7",
          "--color-primary-content": "24 24 47",
          
          // Secondary colors
          "--color-secondary": "223 166 42",
          "--color-secondary-focus": "190 139 30",
          "--color-secondary-content": "255 255 255",
          
          // Accent colors
          "--color-accent": "24 24 47",
          "--color-accent-focus": "17 17 34",
          "--color-accent-content": "255 255 255",
          
          // Neutral colors
          "--color-neutral": "24 24 47",
          "--color-neutral-focus": "17 17 34",
          "--color-neutral-content": "255 255 255",
          
          // Base colors
          "--color-base-100": "255 255 255",
          "--color-base-200": "245 245 245",
          "--color-base-300": "227 227 227",
          "--color-base-content": "0 0 0",
          
          // Semantic colors
          "--color-info": "28 146 242",
          "--color-success": "0 148 133",
          "--color-warning": "255 153 0",
          "--color-error": "255 87 36",
          
          // Theme properties
          "--rounded-box": "1rem",
          "--rounded-btn": ".5rem",
          "--rounded-badge": "1.9rem",
          "--animation-btn": ".25s",
          "--animation-input": ".2s",
          "--btn-text-case": "uppercase",
          "--navbar-padding": ".5rem",
          "--border-btn": "1px",
        },
      }),
  ],
};

