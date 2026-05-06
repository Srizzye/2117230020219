const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const LOG_API = process.env.LOG_API;
const TOKEN = process.env.TOKEN;
// here i used .env for storing the LOG_API and TOKEN values

const allowedStacks = ["backend", "frontend"];

const allowedLevels = ["debug", "info", "warn", "error", "fatal"];

const allowedPackages = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils",
];

const logger = async (stack, level, packageName, message) => {
  try {
    stack = stack.toLowerCase();
    level = level.toLowerCase();
    packageName = packageName.toLowerCase();

    if (!allowedStacks.includes(stack)) {
      throw new Error("Invalid stack value");
    }

    if (!allowedLevels.includes(level)) {
      throw new Error("Invalid level value");
    }

    if (!allowedPackages.includes(packageName)) {
      throw new Error("Invalid package value");
    }

    const payload = {
      stack,
      level,
      package: packageName,
      message,
    };

    const response = await axios.post(LOG_API, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Logging failed:", error.response?.data || error.message);
  }
};

module.exports = logger;
