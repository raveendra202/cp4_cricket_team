const express = require("express");
const path = require("path");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`server is running http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//API1
app.get("/players/", async (request, response) => {
  const playersQuery = `
        SELECT * 
        FROM cricket_team; `;
  const playersArray = await db.all(playersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API2
app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const createPlayerQuery = ` 
        INSERT INTO cricket_team(player_name,jersey_number,role) 
        VALUES (
            '${playerName}',${jerseyNumber},'${role}' 
        );`;
  const rr = await db.run(createPlayerQuery);
  response.send("Player Added to Team");
});

//API3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
            SELECT * 
            FROM cricket_team
            WHERE player_id = ${playerId} ; `;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//API4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const putPlayerQurey = `
            UPDATE cricket_team 
            SET player_name = '${playerName}' , 
                jersey_number = '${jerseyNumber}', 
                role = '${role}' 
            WHERE player_id = ${playerId} 
                 ;`;
  await db.run(putPlayerQurey);
  response.send("Player Details Updated");
});
///API5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
            DELETE FROM 
            cricket_team 
            WHERE player_id = ${playerId} ; 
            `;

  await db.run(deletePlayerQuery);
  response.send(`Player Removed`);
});

module.exports = app;
