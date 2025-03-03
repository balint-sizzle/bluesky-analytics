// tailwind.config.js
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
      extend: {
        colors: {
          'bluesky-blue': '#1DA1F2',
          'bluesky-dark': '#0D8BD9',
        },
      },
    },
    plugins: [],
  }