const logger = require("./logger");

const requestLogger = async (req, res, next) => {
  try {
    await logger(
      "backend",
      "info",
      "middleware",
      `${req.method} ${req.originalUrl}`,
    );
  } catch (error) {
    console.log(error.message);
  }

  next();
};

module.exports = requestLogger;
