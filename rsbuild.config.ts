import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: "./src/entry.tsx",
    },
  },
  output: {
    distPath: {
      root: "dist",
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api": "http://localhost:3000",
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
