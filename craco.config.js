const path = require(`path`);

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
      "@api": path.resolve(__dirname, "src/api"),
      "@features": path.resolve(__dirname, "src/features"),
      "@globalSlice": path.resolve(__dirname, "src/globalSlice"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
};
