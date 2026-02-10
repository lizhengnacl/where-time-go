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
  dev: {
    assetPrefix: "/time/",
  },
  server: {
    port: 3000,
    historyApiFallback: {
      index: '/time/index.html',
    },
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
