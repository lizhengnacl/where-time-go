import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: "./src/entry.tsx",
    },
  },
  html: {
    template: "./public/index.html",
  },
  output: {
    assetPrefix: "/time/",
    distPath: {
      root: "dist",
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/time/api": "http://localhost:3001",
    },
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    },
  },
});
