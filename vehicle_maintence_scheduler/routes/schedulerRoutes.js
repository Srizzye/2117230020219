const express = require("express");

const router = express.Router();

const { getSchedule } = require("../Controllers/schedulerController");

router.get("/schedule/:depotId", getSchedule);

module.exports = router;
