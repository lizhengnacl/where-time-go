import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { syncLocalToCloud } from "../lib/storage";

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
        // 如果是新注册或者登录，尝试同步本地数据
        try {
          await syncLocalToCloud();
        } catch (syncErr) {
          console.error("Sync failed:", syncErr);
        }
        window.location.href = "/time/"; // 强制刷新并跳转，确保 Context 重新加载数据
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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">迹时 - Timary</h1>
          <p className="text-default-500">记录时光流转</p>
        </CardHeader>
        <CardBody>
          <Tabs
            fullWidth
            size="md"
            selectedKey={isLogin ? "login" : "signup"}
            onSelectionChange={(key) => setIsLogin(key === "login")}
          >
            <Tab key="login" title="登录" />
            <Tab key="signup" title="注册" />
          </Tabs>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <Input
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="密码"
              placeholder="请输入密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button type="submit" color="primary" isLoading={loading} fullWidth>
              {isLogin ? "登录" : "注册"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
