import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ScheduleProvider } from "./context/ScheduleContext";
import { Home } from "./pages/Home";
import { History } from "./pages/History";
import { Analytics } from "./pages/Analytics";
import "./global.css";

/**
 * 应用入口组件
 */
export default function App() {
  return (
    <ScheduleProvider>
      <Router basename="/time">
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </Router>
    </ScheduleProvider>
  );
}
