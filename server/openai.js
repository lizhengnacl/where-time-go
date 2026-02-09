const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
const DEFAULT_MODEL = process.env.OPENAI_MODEL;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL,
});

module.exports = {
  openai,
  OPENAI_API_KEY,
  DEFAULT_MODEL,
};
