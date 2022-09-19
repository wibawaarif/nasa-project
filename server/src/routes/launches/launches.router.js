const express = require('express');
const launchesRouter = express.Router();
const { httpGetAllLaunches, httpAddNewLaunch, httpDeleteLaunch, httpGetLaunchId } = require('./launches.controller');

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.get('/:id', httpGetLaunchId);
launchesRouter.delete('/:id', httpDeleteLaunch) 

module.exports = launchesRouter;