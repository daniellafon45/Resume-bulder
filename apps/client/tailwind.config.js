const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");
const { join } = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("../../tailwind.config.js")],
  content: [
    join(__dirname, "index.html"),
    join(__dirname, "{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a237e", // Indigo 900
          accent: "#303f9f", // Indigo 700
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#e8eaf6", // Indigo 50
          accent: "#c5cae9", // Indigo 100
          foreground: "#1a237e",
        },
      }
    }
  }
};