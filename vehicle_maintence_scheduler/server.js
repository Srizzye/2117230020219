require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const requestLogger = require("../logging_middleware/middleware");
const logger = require("../logging_middleware/logger");

const app = express();

app.use(cors());
app.use(express.json());

app.use(requestLogger);

const TOKEN = process.env.TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
};

// 0/1 KNAPSACK
const optimizeTasks = (tasks, maxHours) => {
  const n = tasks.length;

  const dp = Array(n + 1)
    .fill()
    .map(() => Array(maxHours + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const duration = tasks[i - 1].Duration;
    const impact = tasks[i - 1].Impact;

    for (let h = 0; h <= maxHours; h++) {
      if (duration <= h) {
        dp[i][h] = Math.max(impact + dp[i - 1][h - duration], dp[i - 1][h]);
      } else {
        dp[i][h] = dp[i - 1][h];
      }
    }
  }

  // BACKTRACK
  let selectedTasks = [];

  let h = maxHours;

  for (let i = n; i > 0; i--) {
    if (dp[i][h] !== dp[i - 1][h]) {
      selectedTasks.push(tasks[i - 1]);

      h -= tasks[i - 1].Duration;
    }
  }

  return {
    maxImpact: dp[n][maxHours],
    selectedTasks,
  };
};

// MAIN API
app.get("/schedule/:depotId", async (req, res) => {
  try {
    const depotId = req.params.depotId;

    // FETCH DEPOTS
    const depotResponse = await axios.get(
      "http://20.207.122.201/evaluation-service/depots",
      { headers },
    );

    const depots = depotResponse.data.depots;

    const depot = depots.find((d) => d.ID === parseInt(depotId));

    if (!depot) {
      return res.status(404).json({
        message: "Depot not found",
      });
    }

    // FETCH VEHICLES
    const vehicleResponse = await axios.get(
      "http://20.207.122.201/evaluation-service/vehicles",
      { headers },
    );

    const tasks = vehicleResponse.data.vehicles;

    const result = optimizeTasks(tasks, depot.MechanicHours);

    await logger(
      "backend",
      "info",
      "service",
      `Optimized schedule for depot ${depotId}`,
    );

    res.json({
      depotId: depot.ID,
      mechanicHours: depot.MechanicHours,
      totalImpact: result.maxImpact,
      selectedTasks: result.selectedTasks,
    });
  } catch (error) {
    await logger("backend", "error", "service", error.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.listen(3001, () => {
  console.log("Vehicle Scheduler Running On Port 3001");
});
