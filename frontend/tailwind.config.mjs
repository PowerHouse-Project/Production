/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        jetBrains: ["JetbrainsBold", "monospace"],
        jetBrainsExtraBold: ["JetbrainsExtraBold", "monospace"],
      },
      colors: {
        // "main-light-background": "#F8F8F8",
        // "main-light-secondary-background": "#E0E6E6",
        // "main-light-dark-1": "#162635",
        // "main-light-dark-2": "#596169",
        // "main-light-dark-3": "#616B74",
        // "main-light-blue-light": "#2CE5FA",
        // "main-light-blue-neutral": "#2BC4F2",
        "main-light-blue": "#1F99FC",

        // "main-dark-background": "#263241",
        // "main-dark-secondary-background": "#334155",
        // "main-dark-light-1": "#EAEAEA",
        // "main-dark-light-2": "#E0E6E6",
        // "main-dark-purple-light": "#8253D6",
        // "main-dark-purple-neutral": "#6A39B8",
        "main-dark-purple-dark": "#4C2DA8",
      },
    },
  },
  plugins: [],
};
