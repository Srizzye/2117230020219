require("dotenv").config();

const express = require("express");
const cors = require("cors");

const requestLogger = require("../logging_middleware/middleware");

const schedulerRoutes = require("./routes/schedulerRoutes");

const app = express();

app.use(cors());

app.use(express.json());

// MIDDLEWARE
app.use(requestLogger);

// ROUTES
app.use("/", schedulerRoutes);

app.listen(3001, () => {
  console.log("Vehicle Scheduler Running On Port 3001");
});
