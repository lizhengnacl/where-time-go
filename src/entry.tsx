import React from "react";
import ReactDOM from "react-dom/client";

import { NextUIProvider } from "@nextui-org/react";

import App from "./App";
import "./entry.css";

// --- 清理线上遗留 PWA 逻辑开始 ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success) console.log("Successfully unregistered ServiceWorker");
      });
    }
  });

  // 清理 Cache Storage
  if (window.caches) {
    caches.keys().then((names) => {
      for (const name of names) caches.delete(name);
    });
  }
}
// --- 清理线上遗留 PWA 逻辑结束 ---

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <NextUIProvider>
    <App />
  </NextUIProvider>,
);
