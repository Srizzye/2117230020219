const axios = require("axios");

const optimizeTasks = require("../services/knapsackService.js");

const logger = require("../../logging_middleware/logger.js");

const TOKEN = process.env.TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

const getSchedule = async (req, res) => {
  try {
    const depotId = req.params.depotId;

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

    const vehicleResponse = await axios.get(
      "http://20.207.122.201/evaluation-service/vehicles",
      { headers },
    );

    const tasks = vehicleResponse.data.vehicles;

    const result = optimizeTasks(tasks, depot.MechanicHours);

    await logger("backend", "info", "controller", `Optimized depot ${depotId}`);

    res.json({
      depotId: depot.ID,
      mechanicHours: depot.MechanicHours,
      totalImpact: result.maxImpact,
      selectedTasks: result.selectedTasks,
    });
  } catch (error) {
    await logger("backend", "error", "controller", error.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getSchedule,
};
