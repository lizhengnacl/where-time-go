import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  MessageSquarePlus,
  Send,
  Heart,
  User,
  Sparkles,
  X,
  Layout,
  Bug,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const FEEDBACK_TYPES = [
  { label: "功能建议", value: "suggestion", icon: <Layout size={16} /> },
  { label: "问题反馈", value: "bug", icon: <Bug size={16} /> },
  { label: "吐槽/点赞", value: "other", icon: <Smile size={16} /> },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [type, setType] = useState("suggestion");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("反馈内容不能为空哦");
      return;
    }
    if (content.length < 5) {
      setError("反馈内容太短啦，多写一点吧 (至少 5 个字)");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/time/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content, contact }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onOpenChange(false);
          // 重置状态
          setTimeout(() => {
            setSubmitted(false);
            setContent("");
            setContact("");
          }, 300);
        }, 2500);
      }
    } catch (error) {
      console.error("Feedback failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      backdrop="blur"
      hideCloseButton
      classNames={{
        base: "glass-panel border border-border/40 shadow-2xl rounded-[2.5rem] bg-background/40 backdrop-blur-2xl overflow-hidden max-w-[400px] m-4",
        wrapper: "z-[100]",
        backdrop: "bg-background/20 backdrop-blur-md",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <div className="relative">
            {/* 背景装饰光晕 */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

            <ModalHeader className="flex flex-col gap-1 items-center pt-8 pb-4 relative z-10">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-primary/20">
                <MessageSquarePlus className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                随心输入，AI 懂你
              </h2>
              <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                迹时 (Timary) 持续进化中
              </p>
            </ModalHeader>

            <ModalBody className="py-2 px-6 relative z-10">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-10 text-center"
                  >
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border border-primary/20">
                      <Heart className="text-primary fill-primary w-10 h-10 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black mb-3">感谢您的陪伴！</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed px-4">
                      您的建议将帮助 AI
                      更好地理解您的每一刻。迹时会不断迭代，让记录更轻盈。
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-8 pt-4"
                  >
                    <Select
                      label="反馈类型"
                      placeholder="请选择类型"
                      labelPlacement="outside"
                      variant="bordered"
                      size="lg"
                      selectedKeys={[type]}
                      onSelectionChange={(keys) =>
                        setType(Array.from(keys)[0] as string)
                      }
                      classNames={{
                        base: "relative",
                        trigger:
                          "rounded-2xl border-border/40 hover:border-primary/50 focus-within:!border-primary transition-all bg-background/50",
                        label: "font-bold text-foreground/80 mb-2",
                      }}
                      renderValue={(items) => {
                        return items.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center gap-2"
                          >
                            {
                              FEEDBACK_TYPES.find((t) => t.value === item.key)
                                ?.icon
                            }
                            <span>{item.textValue}</span>
                          </div>
                        ));
                      }}
                    >
                      {FEEDBACK_TYPES.map((t) => (
                        <SelectItem
                          key={t.value}
                          value={t.value}
                          startContent={t.icon}
                          classNames={{
                            base: "rounded-xl",
                          }}
                        >
                          {t.label}
                        </SelectItem>
                      ))}
                    </Select>

                    <Textarea
                      label="反馈内容"
                      placeholder="AI 分析得准吗？输入是否足够随意？请告诉我们..."
                      labelPlacement="outside"
                      variant="bordered"
                      size="lg"
                      minRows={4}
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        if (error) setError("");
                      }}
                      startContent={
                        <Sparkles
                          size={18}
                          className="text-muted-foreground mt-1"
                        />
                      }
                      isInvalid={!!error}
                      errorMessage={error}
                      classNames={{
                        base: "relative",
                        inputWrapper:
                          "rounded-2xl border-border/40 hover:border-primary/50 focus-within:!border-primary transition-all bg-background/50",
                        label: "font-bold text-foreground/80 mb-2",
                        errorMessage: "relative mt-1",
                      }}
                      required
                    />

                    <Input
                      label="联系方式 (可选)"
                      placeholder="微信/邮箱/手机号"
                      labelPlacement="outside"
                      variant="bordered"
                      size="lg"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      startContent={
                        <User size={18} className="text-muted-foreground" />
                      }
                      classNames={{
                        base: "relative",
                        inputWrapper:
                          "rounded-2xl border-border/40 hover:border-primary/50 focus-within:!border-primary transition-all bg-background/50",
                        label: "font-bold text-foreground/80 mb-2",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </ModalBody>

            <ModalFooter className="flex flex-col gap-3 p-6 pt-4 relative z-10">
              {!submitted ? (
                <div className="flex flex-col gap-3 w-full">
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={loading}
                    disabled={content.length < 5}
                    className="w-full rounded-2xl h-14 font-bold text-base shadow-lg shadow-primary/20"
                    endContent={!loading && <Send size={18} />}
                  >
                    发送反馈
                  </Button>
                  <Button
                    variant="light"
                    onPress={onClose}
                    className="w-full rounded-2xl h-12 font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    再想想
                  </Button>
                </div>
              ) : null}

              {!submitted && (
                <p className="text-center text-[10px] text-muted-foreground/50 font-medium">
                  您的 IP 及设备信息将被记录，仅用于协助定位问题。
                </p>
              )}
            </ModalFooter>

            {/* 右上角关闭按钮 */}
            {!submitted && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors z-20"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};
