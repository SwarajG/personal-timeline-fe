module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  darkMode: 'selector',
  theme: {
    extend: {},
  },
  plugins: [require("flowbite/plugin")],
};
