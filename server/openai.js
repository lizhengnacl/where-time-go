const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const OPENAI_API_KEY = process.env.WTG_OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.WTG_OPENAI_BASE_URL;
const DEFAULT_MODEL = process.env.WTG_OPENAI_MODEL || "gpt-3.5-turbo";

if (!OPENAI_API_KEY) {
  console.warn(
    "⚠️  Warning: WTG_OPENAI_API_KEY is not set in environment variables.",
  );
} else {
  // 输出脱敏后的 API Key 方便调试
  const maskedKey =
    OPENAI_API_KEY.length > 8
      ? `${OPENAI_API_KEY.slice(0, 4)}...${OPENAI_API_KEY.slice(-4)}`
      : "****";
  console.log(`🔑 OpenAI API Key initialized: ${maskedKey}`);
}

if (OPENAI_BASE_URL) {
  console.log(`🌐 OpenAI Base URL: ${OPENAI_BASE_URL}`);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL,
});

module.exports = {
  openai,
  OPENAI_API_KEY,
  DEFAULT_MODEL,
};
