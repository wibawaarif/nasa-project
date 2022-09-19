const express = require("express");
const v1 = express.Router();
const planetsRouter = require("./planets/planets.router");
const launchesRouter = require("./launches/launches.router");

v1.use("/launches", launchesRouter);
v1.use("/planets", planetsRouter);

module.exports = v1;
