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
    // 启用多线程压缩
    minify: true,
  },
  performance: {
    // 分包策略优化
    chunkSplit: {
      strategy: "split-by-experience",
      forceSplitting: {
        // 将体积巨大的库强制拆分
        "lib-recharts": /recharts/,
        "lib-framer-motion": /framer-motion/,
        "lib-nextui": /@nextui-org/,
        "lib-lucide": /lucide-react/,
      },
    },
  },
  dev: {
    assetPrefix: "/time/",
  },
  server: {
    port: 3000,
    historyApiFallback: {
      index: "/time/index.html",
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
