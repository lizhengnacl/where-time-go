import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ScheduleProvider } from "./context/ScheduleContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./global.css";

// 路由组件懒加载
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const History = lazy(() => import("./pages/History").then(m => ({ default: m.History })));
const Analytics = lazy(() => import("./pages/Analytics").then(m => ({ default: m.Analytics })));

/**
 * 页面加载 Loading 态
 */
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

/**
 * 应用入口组件
 */
export default function App() {
  return (
    <ThemeProvider>
      <ScheduleProvider>
        <Router basename="/time">
          <div className="min-h-screen bg-background font-sans antialiased text-foreground">
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ScheduleProvider>
    </ThemeProvider>
  );
}
