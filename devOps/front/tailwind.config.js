/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'pong': "url('./images/BACKGROUND.png')",
      },
      fontFamily: {
        'display': ['"Press Start 2P"'],
      },
    },
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: ["retro"],
  },
}

