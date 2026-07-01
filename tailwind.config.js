/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF7',
        ink: '#1C1C1E',
        ink2: '#3A3A3C',
        muted: '#8E8E93',
        sage: {
          DEFAULT: '#B8C9B0',
          light: '#E8F0E5',
        },
        peach: {
          DEFAULT: '#F2C4A8',
          light: '#FBF0E8',
        },
        sky: {
          DEFAULT: '#A8C4D4',
          light: '#E4F0F6',
        },
        rose: {
          DEFAULT: '#D4A0A8',
          light: '#F5E8EA',
        },
        lemon: {
          DEFAULT: '#E8D88A',
          light: '#FAF6DC',
        },
        lavender: {
          DEFAULT: '#C0AED4',
          light: '#EDE8F5',
        },
        accent: '#D4622A',
        accent2: '#2A6B4A',
        // Dark theme colors for blog:
        blogBg: '#0e0e0e',
        blogSurface: '#181818',
        blogBorder: '#2a2a2a',
        blogAccent: '#e8c97e',
        blogText: '#f0ede6',
        blogMuted: '#888888',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        playfair: ['"Playfair Display"', 'serif'],
        dmsans: ['"DM Sans"', 'sans-serif'],
        dmmono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
