const {
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  deleteLaunchById,
  getLaunchById,
} = require("../../models/launches.model");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return await res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  //check if parse from body (user) is filled or not
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.target ||
    !launch.launchDate
  ) {
    return res.status(400).json({
      error: "Fill the mission, rocket, target, and launchDate!",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate.valueOf())) {
    return res.status(400).json({
      error: "The launchDate format must be correct!",
    });
  }

  await addNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpDeleteLaunch(req, res) {
  const findById = Number(req.params.id);

  // if doesn't exist
  const existLaunch = await existsLaunchWithId(findById);
  if (!existLaunch) {
    res.status(404).json({
      error: "Can't find the ID launch",
    });
  }

  const aborted = await deleteLaunchById(findById);
  if (!aborted) {
    return res.status(400).json({
      error: "Launch not aborted",
    });
  }

  return res.status(200).json({
    ok: true,
  });
}

function httpGetLaunchId(req, res) {
  const takeId = Number(req.params.id);
  if (!getLaunchById(takeId)) {
    res.status(404).json({
      error: "nothing!",
    });
  }

  return res.status(200).json(getLaunchById(takeId));
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpDeleteLaunch,
  httpGetLaunchId,
};
