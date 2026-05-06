const axios = require("axios");

const getTopNotifications = require("../services/priorityService.js");

const logger = require("../../logging_middleware/logger");

const TOKEN = process.env.TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

const fetchNotifications = async (req, res) => {
  try {
    const response = await axios.get(
      "http://20.207.122.201/evaluation-service/notifications",
      { headers },
    );

    const notifications = response.data.notifications;

    const prioritizedNotifications = getTopNotifications(notifications);

    await logger(
      "backend",
      "info",
      "controller",
      "Fetched prioritized notifications",
    );

    res.json({
      total: prioritizedNotifications.length,
      notifications: prioritizedNotifications,
    });
  } catch (error) {
    await logger("backend", "error", "controller", error.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  fetchNotifications,
};
