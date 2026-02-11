import React, { useState } from "react";
import { Input, Button, Tabs, Tab } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { syncLocalToCloud } from "../lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Lock, Mail } from "lucide-react";
import logo from "../assets/logo.svg";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/time/api/auth/login" : "/time/api/auth/signup";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("user", JSON.stringify(result.data));
        try {
          await syncLocalToCloud();
        } catch (syncErr) {
          console.error("Sync failed:", syncErr);
        }
        window.location.href = "/time/";
      } else {
        setError(result.message || "操作失败");
      }
    } catch (err) {
      setError("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] z-10"
      >
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="w-16 h-16 bg-background border border-border/50 rounded-2xl shadow-xl flex items-center justify-center mb-4 cursor-pointer glass-panel"
          >
            <img src={logo} alt="Logo" className="w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            迹时 Timary
          </h1>
          <div className="flex flex-col items-center gap-1 mt-3">
            <p className="text-foreground/80 text-sm font-bold">
              随手记，AI 理。
            </p>
            <p className="text-muted-foreground text-[12px] font-medium">
              放下负担，让 AI 为您梳理时光的意义
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-panel border border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden bg-background/40 backdrop-blur-xl">
          <div className="p-2">
            <Tabs
              fullWidth
              size="lg"
              aria-label="Auth options"
              selectedKey={isLogin ? "login" : "signup"}
              onSelectionChange={(key) => setIsLogin(key === "login")}
              classNames={{
                tabList: "bg-transparent p-1",
                cursor: "bg-background shadow-sm rounded-2xl",
                tab: "h-12 font-bold",
                tabContent: "group-data-[selected=true]:text-primary",
              }}
            >
              <Tab key="login" title="登 录" />
              <Tab key="signup" title="注 册" />
            </Tabs>
          </div>

          <div className="p-8 pt-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="用户名"
                placeholder="您的专属昵称"
                labelPlacement="outside"
                variant="bordered"
                size="lg"
                startContent={
                  <User size={18} className="text-muted-foreground" />
                }
                classNames={{
                  inputWrapper:
                    "rounded-2xl border-border/40 hover:border-primary/50 focus-within:!border-primary transition-all",
                  label: "font-bold text-foreground/80",
                }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                label="密码"
                placeholder="开启时光之门"
                labelPlacement="outside"
                variant="bordered"
                size="lg"
                type="password"
                startContent={
                  <Lock size={18} className="text-muted-foreground" />
                }
                classNames={{
                  inputWrapper:
                    "rounded-2xl border-border/40 hover:border-primary/50 focus-within:!border-primary transition-all",
                  label: "font-bold text-foreground/80",
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-danger text-xs font-bold text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                color="primary"
                size="lg"
                isLoading={loading}
                className="rounded-2xl h-14 font-bold text-base shadow-lg shadow-primary/20 mt-2"
              >
                {isLogin ? "立即登录" : "开启记录之旅"}
              </Button>

              <div className="flex items-center gap-4 my-2">
                <div className="h-px bg-border/40 flex-1" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  或者
                </span>
                <div className="h-px bg-border/40 flex-1" />
              </div>

              <Button
                variant="light"
                onPress={() => navigate("/")}
                startContent={<ArrowLeft size={18} />}
                className="rounded-2xl h-12 font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                以游客身份继续
              </Button>
            </form>
          </div>
        </div>

        {/* Footer Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-[11px] text-muted-foreground/60 font-medium"
        >
          © 2026 Timary. 让每一小时都有迹可循。
        </motion.p>
      </motion.div>
    </div>
  );
}
