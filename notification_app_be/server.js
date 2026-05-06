require("dotenv").config();

const express = require("express");

const cors = require("cors");

const requestLogger = require("../logging_middleware/middleware");

const notificationRoutes = require("./routes/notificationRoute.js");

const app = express();

app.use(cors());

app.use(express.json());

app.use(requestLogger);

// routes
app.use("/", notificationRoutes);

app.listen(3002, () => {
  console.log("Notification Service Running On Port 3002");
});
