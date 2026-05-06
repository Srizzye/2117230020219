const logger = require("./logger");

const runLogs = async () => {
  const response1 = await logger(
    "backend",
    "info",
    "service",
    "Application started successfully",
  );

  console.log(response1);

  const response2 = await logger(
    "backend",
    "error",
    "db",
    "Database connection timeout",
  );

  console.log(response2);
};

runLogs();
