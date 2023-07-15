const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

app.listen(3000, () => {
  console.log("server is running http://localhost:3000/");
});

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDbAndServer();

//1.get state
const convertObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

app.get("/states/", async (request, response) => {
  let requestQuery = `
   SELECT 
   *
   FROM
   state
   `;

  let store = await db.all(requestQuery);
  response.send(store.map((eachMovie) => convertObject(eachMovie)));
});

//  2.specific state

const convertObject1 = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

app.get("/states/:stateId/", async (request, response) => {
  let { stateId } = request.params;

  let requestQuery = `
   SELECT 
   *
   FROM
   state
   WHERE
    state_id = ${stateId};
   `;

  let store = await db.get(requestQuery);
  response.send(convertObject1(store));
});

//3.post districts

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  let requestQuery = `
   INSERT INTO
   district(district_name,state_id,cases, cured, active, deaths)
   VALUES( '${districtName}',${stateId},${cases},${cured},${active},${deaths})
   `;

  let store = await db.run(requestQuery);
  console.log(store);
  response.send("District Successfully Added");
});

// 4.specific district

const convertObject11 = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;

  let requestQuery = `
   SELECT 
   *
   FROM
    district
   WHERE
    district_id = ${districtId};
   `;

  let store = await db.get(requestQuery);
  response.send(convertObject11(store));
});

//5.delete

app.delete("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;

  let requestQuery = `
   DELETE
   FROM
   district
   WHERE
     district_id = ${districtId};
   `;

  await db.run(requestQuery);
  response.send("District Removed");
});

//6.update district

app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  let { districtId } = request.params;

  let requestQuery = `
   UPDATE 
   district
   SET
   district_name ='${districtName}',
   state_id =${stateId},
   cases =${cases},
    cured =${cured},
   active =${active},
   deaths   =${deaths};
   `;

  await db.run(requestQuery);
  response.send("District Details Updated");
});

//7.API

const convertObjectSingle = (dbObject) => {
  console.log(dbObject.cases1);
  return {
    totalCases: dbObject.cases,
    totalCured: dbObject.cured,
    totalActive: dbObject.active,
    totalDeaths: dbObject.deaths,
  };
};

app.get("/states/:stateId/stats/", async (request, response) => {
  let { stateId } = request.params;

  let requestQuery = `
   SELECT sum(cases) as totalCases,
   sum(cured) as  totalCured ,
   sum(active) as totalActive  ,
   sum(deaths) as totalDeaths
   FROM
    district
   WHERE
    state_id = ${stateId};
   `;
  let store = await db.get(requestQuery);
  console.log(store);
  //const result = convertObjectSingle(store);
  response.send(store);
});

//8.API

app.get("/districts/:districtId/details/", async (request, response) => {
  let { districtId } = request.params;

  let requestQuery = `
   SELECT
   state_name
   FROM
    state join district on state.state_id=district.state_id
   WHERE
    district.district_id = ${districtId};
   `;

  let store = await db.get(requestQuery);
  console.log(store);
  response.send({ stateName: store.state_name });
});

module.exports = app;
