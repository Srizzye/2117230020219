const express = require("express");

const router = express.Router();

const { fetchNotifications } = require("../controllers/notificationController");

router.get("/notifications/top", fetchNotifications);

module.exports = router;
