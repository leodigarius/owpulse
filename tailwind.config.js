/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Define the color palette based on the reference image
      colors: {
        // Light Mode Colors
        'light-bg': '#ffffff', // White background
        'light-text': '#0f172a', // Dark text (slate-900)
        'light-card': '#f8fafc', // Slightly off-white card (slate-50)
        'light-border': '#e2e8f0', // Light gray border (slate-200)
        'light-primary': '#2563eb', // Standard blue accent (blue-600)
        'light-primary-hover': '#1d4ed8', // Darker blue on hover (blue-700)
        'light-muted-text': '#64748b', // Muted text (slate-500)

        // Dark Mode Colors (Inspired by the reference image)
        'dark-bg': '#020617',      // Very dark background (slate-950)
        'dark-text': '#e2e8f0',    // Light text (slate-200)
        'dark-card': '#0f172a',    // Dark card background (slate-900)
        'dark-border': '#334155',  // Subtle dark border (slate-700) - for grid lines too
        'dark-primary': '#38bdf8', // Glowing cyan/light blue accent (cyan-400)
        'dark-primary-hover': '#0ea5e9', // Slightly darker cyan on hover (cyan-500)
        'dark-muted-text': '#94a3b8', // Muted text (slate-400)
        'glow-blue': 'rgba(56, 189, 248, 0.5)', // For glow effects - Note: This is just a color value, not a utility class itself
      },
      borderColor: theme => ({ // Extend border colors specifically
        ...theme('colors'), // Include default colors
        DEFAULT: theme('colors.light-border', 'currentColor'), // Default border for light mode
        dark: theme('colors.dark-border', 'currentColor'), // Default border for dark mode
      }),
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "pulse-slow": {
          '0%, 100%': { opacity: "1" },
          '50%': { opacity: "0.5" },
        },
        "gradient-shift": {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Add a glow animation using boxShadow
        "pulse-glow": {
          '0%, 100%': { boxShadow: '0 0 15px 5px rgba(56, 189, 248, 0.3)' },
          '50%': { boxShadow: '0 0 25px 10px rgba(56, 189, 248, 0.5)' },
        },
      }, // Closing brace for keyframes
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "gradient-shift": "gradient-shift 15s ease infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite alternate", // Reference the keyframe
      }, // Closing brace for animation
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/stars.png')",
      },
      // Add box shadow utilities for static glow effects
      boxShadow: {
        'glow-sm': '0 0 8px 2px rgba(56, 189, 248, 0.3)',
        'glow-md': '0 0 15px 5px rgba(56, 189, 248, 0.4)',
        'glow-lg': '0 0 25px 10px rgba(56, 189, 248, 0.5)',
      } // Closing brace for boxShadow
    }, // Closing brace for extend
  }, // Closing brace for theme
  plugins: [require("tailwindcss-animate")],
} // Closing brace for module.exports
