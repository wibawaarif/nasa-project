const launchesDatabase = require("./launches.mongo");
const planetsDatabase = require("./planets.mongo");
const axios = require("axios");


const DEFAULT_FLIGHT_NUMBER = 100;

async function populateLaunches() {
  console.log("downloading launch data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data!");
    throw new Error("Launch data download failed!")
  } 

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers: customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    await saveLaunch(launch);
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(id) {
  return await findLaunch({
    flightNumber: id,
  });
}

async function getLatestFlightNumber() {
  const latestFlight = await launchesDatabase.findOne({}).sort("-flightNumber");

  if (!latestFlight) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestFlight.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesDatabase.find(
    {},
    {
      __v: 0,
      _id: 0,
    }
  )
  .sort({flightNumber: 1})
  .skip(skip)
  .limit(limit);
}

const SPACEX_API_URL = "https://api.spacexdata.com/v5/launches/query";

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch data already loaded!");
    return;
  } else {
    await populateLaunches();
  }
}

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function addNewLaunch(launch) {
  const checkTargetPlanet = await planetsDatabase.findOne({
    keplerName: launch.target,
  });
  if (!checkTargetPlanet) {
    throw new Error("No matching planet found!");
  }
  const addFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ayip ganteng", "cacil cantik"],
    flightNumber: addFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function deleteLaunchById(id) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.acknowledged === true && aborted.matchedCount === 1;
}


module.exports = {
  loadLaunchesData,
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  deleteLaunchById,
};
