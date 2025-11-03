const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Bearnww360!",
  database: "TournamentDB2",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    console.log("Starting server anyway...");
  } else {
    console.log("Connected to MySQL database");
  }
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// === PLAYER ENDPOINTS ===
app.get("/api/players", (req, res) => {
  db.query("SELECT * FROM Player", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/players", (req, res) => {
  const { name, username, bdate, points } = req.body;
  const generatedUsername = username || name.toLowerCase().replace(/\s+/g, "");
  const query =
    "INSERT INTO Player (Username, Name, Bdate, Points) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [generatedUsername, name, bdate || null, points || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        Username: generatedUsername,
        Name: name,
        Points: points || 0,
      });
    }
  );
});

app.delete("/api/players/:username", (req, res) => {
  const { username } = req.params;
  const query = "DELETE FROM Player WHERE Username = ?";
  db.query(query, [username], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Player deleted successfully" });
  });
});

// === TEAM ENDPOINTS ===
app.get("/api/teams", (req, res) => {
  db.query("SELECT * FROM Team", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/teams", (req, res) => {
  const { TeamName, Cusername } = req.body;

  // Log the incoming request
  console.log("Received team creation request:");
  console.log("TeamName:", TeamName);
  console.log("Cusername:", Cusername);

  // Check if captain exists
  const checkCaptainQuery = "SELECT * FROM Player WHERE Username = ?";
  db.query(checkCaptainQuery, [Cusername], (err, captainResults) => {
    if (err) {
      console.error("Database error checking captain:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log("Captain query results:", captainResults);
    console.log("Number of results:", captainResults.length);

    if (captainResults.length === 0) {
      console.log("Captain not found!");
      // Let's also check what players exist
      db.query("SELECT Username FROM Player LIMIT 5", (err, allPlayers) => {
        console.log("Sample of existing players:", allPlayers);
      });
      return res.status(400).json({
        error: "Captain username does not exist",
        providedUsername: Cusername,
      });
    }

    console.log("Captain found! Proceeding to insert team...");

    // Insert new team
    const insertTeamQuery =
      "INSERT INTO Team (TeamName, Cusername) VALUES (?, ?)";
    db.query(insertTeamQuery, [TeamName, Cusername], (err, result) => {
      if (err) {
        console.error("Error inserting team:", err);
        return res.status(500).json({ error: err.message });
      }

      console.log("Team inserted successfully!");
      res.json({
        TeamID: result.insertId,
        TeamName,
        Cusername,
      });
    });
  });
});

app.delete("/api/teams/:teamID", (req, res) => {
  const { teamID } = req.params;
  const query = "DELETE FROM Team WHERE TeamID = ?";
  db.query(query, [teamID], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json({ message: "Team deleted successfully" });
  });
});

// === GAME ENDPOINTS ===
// === GAME ENDPOINTS ===
app.get("/api/games", (req, res) => {
  db.query("SELECT * FROM Game ORDER BY Time_Slot DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/games", (req, res) => {
  const { Time_Slot, Team1ID, Team2ID, WinnerTeamID, LoserTeamID } = req.body;

  console.log("Received game creation request:");
  console.log("Time_Slot:", Time_Slot);
  console.log("Team1ID:", Team1ID);
  console.log("Team2ID:", Team2ID);
  console.log("WinnerTeamID:", WinnerTeamID);
  console.log("LoserTeamID:", LoserTeamID);

  // Validation: Check if both teams exist
  const checkTeamsQuery = "SELECT TeamID FROM Team WHERE TeamID IN (?, ?)";
  db.query(checkTeamsQuery, [Team1ID, Team2ID], (err, teamResults) => {
    if (err) {
      console.error("Database error checking teams:", err);
      return res.status(500).json({ error: err.message });
    }

    if (teamResults.length !== 2) {
      console.log("One or both teams not found!");
      return res.status(400).json({ error: "One or both teams do not exist" });
    }

    console.log("Both teams found! Proceeding to insert game...");

    // Insert new game
    const insertGameQuery =
      "INSERT INTO Game (Time_Slot, Team1ID, Team2ID, WinnerTeamID, LoserTeamID) VALUES (?, ?, ?, ?, ?)";
    db.query(
      insertGameQuery,
      [Time_Slot, Team1ID, Team2ID, WinnerTeamID, LoserTeamID],
      (err, result) => {
        if (err) {
          console.error("Error inserting game:", err);
          return res.status(500).json({ error: err.message });
        }

        console.log("Game inserted successfully!");
        res.json({
          Match_ID: result.insertId,
          Time_Slot,
          Team1ID,
          Team2ID,
          WinnerTeamID,
          LoserTeamID,
        });
      }
    );
  });
});

app.delete("/api/games/:matchID", (req, res) => {
  const { matchID } = req.params;
  const query = "DELETE FROM Game WHERE Match_ID = ?";
  db.query(query, [matchID], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json({ message: "Game deleted successfully" });
  });
});

// === ADMIN ENDPOINTS ===
app.get("/api/admins", (req, res) => {
  db.query("SELECT * FROM Admin ORDER BY Name", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/admins", (req, res) => {
  const { Ausername, Name } = req.body;

  console.log("Received admin creation request:");
  console.log("Ausername:", Ausername);
  console.log("Name:", Name);

  // Insert new admin
  const insertAdminQuery = "INSERT INTO Admin (Ausername, Name) VALUES (?, ?)";
  db.query(insertAdminQuery, [Ausername, Name], (err, result) => {
    if (err) {
      console.error("Error inserting admin:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log("Admin inserted successfully!");
    res.json({
      Ausername,
      Name,
    });
  });
});

app.delete("/api/admins/:ausername", (req, res) => {
  const { ausername } = req.params;
  const query = "DELETE FROM Admin WHERE Ausername = ?";
  db.query(query, [ausername], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json({ message: "Admin deleted successfully" });
  });
});

// === LOCATION ENDPOINTS ===
app.get("/api/locations", (req, res) => {
  db.query("SELECT * FROM Location ORDER BY LMatch_ID", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/locations", (req, res) => {
  const { LMatch_ID, Name, State, StreetName, Zipcode, City } = req.body;

  console.log("Received location creation request:");
  console.log("LMatch_ID:", LMatch_ID);
  console.log("Name:", Name);

  // Check if game exists
  const checkGameQuery = "SELECT Match_ID FROM Game WHERE Match_ID = ?";
  db.query(checkGameQuery, [LMatch_ID], (err, gameResults) => {
    if (err) {
      console.error("Database error checking game:", err);
      return res.status(500).json({ error: err.message });
    }

    if (gameResults.length === 0) {
      console.log("Game not found!");
      return res.status(400).json({ error: "Game does not exist" });
    }

    // Check if location already exists for this game
    const checkLocationQuery = "SELECT * FROM Location WHERE LMatch_ID = ?";
    db.query(checkLocationQuery, [LMatch_ID], (err, locationResults) => {
      if (err) {
        console.error("Database error checking location:", err);
        return res.status(500).json({ error: err.message });
      }

      if (locationResults.length > 0) {
        return res
          .status(400)
          .json({ error: "Location already exists for this game" });
      }

      console.log("Game found! Proceeding to insert location...");

      // Insert new location
      const insertLocationQuery =
        "INSERT INTO Location (LMatch_ID, Name, State, StreetName, Zipcode, City) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        insertLocationQuery,
        [LMatch_ID, Name, State, StreetName, Zipcode, City],
        (err, result) => {
          if (err) {
            console.error("Error inserting location:", err);
            return res.status(500).json({ error: err.message });
          }

          console.log("Location inserted successfully!");
          res.json({
            LMatch_ID,
            Name,
            State,
            StreetName,
            Zipcode,
            City,
          });
        }
      );
    });
  });
});

app.delete("/api/locations/:lMatchID", (req, res) => {
  const { lMatchID } = req.params;
  const query = "DELETE FROM Location WHERE LMatch_ID = ?";
  db.query(query, [lMatchID], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json({ message: "Location deleted successfully" });
  });
});

// === SCORE ENDPOINTS ===
app.get("/api/scores", (req, res) => {
  db.query("SELECT * FROM Score ORDER BY S_MatchID, SetID", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/scores", (req, res) => {
  const { S_MatchID, SetID, Game_Point, Losing_TeamID, Winning_TeamID } =
    req.body;

  console.log("Received score creation request:");
  console.log("S_MatchID:", S_MatchID);
  console.log("SetID:", SetID);
  console.log("Game_Point:", Game_Point);

  // Validate that winning and losing teams are different
  if (Losing_TeamID === Winning_TeamID) {
    return res
      .status(400)
      .json({ error: "Winning and losing teams must be different" });
  }

  // Check if game exists
  const checkGameQuery = "SELECT Match_ID FROM Game WHERE Match_ID = ?";
  db.query(checkGameQuery, [S_MatchID], (err, gameResults) => {
    if (err) {
      console.error("Database error checking game:", err);
      return res.status(500).json({ error: err.message });
    }

    if (gameResults.length === 0) {
      console.log("Game not found!");
      return res.status(400).json({ error: "Game does not exist" });
    }

    // Check if score already exists for this match and set
    const checkScoreQuery =
      "SELECT * FROM Score WHERE S_MatchID = ? AND SetID = ?";
    db.query(checkScoreQuery, [S_MatchID, SetID], (err, scoreResults) => {
      if (err) {
        console.error("Database error checking score:", err);
        return res.status(500).json({ error: err.message });
      }

      if (scoreResults.length > 0) {
        return res
          .status(400)
          .json({ error: "Score already exists for this match and set" });
      }

      console.log("Game found! Proceeding to insert score...");

      // Insert new score
      const insertScoreQuery =
        "INSERT INTO Score (S_MatchID, SetID, Game_Point, Losing_TeamID, Winning_TeamID) VALUES (?, ?, ?, ?, ?)";
      db.query(
        insertScoreQuery,
        [S_MatchID, SetID, Game_Point, Losing_TeamID, Winning_TeamID],
        (err, result) => {
          if (err) {
            console.error("Error inserting score:", err);
            return res.status(500).json({ error: err.message });
          }

          console.log("Score inserted successfully!");
          res.json({
            S_MatchID,
            SetID,
            Game_Point,
            Losing_TeamID,
            Winning_TeamID,
          });
        }
      );
    });
  });
});

app.delete("/api/scores/:sMatchID/:setID", (req, res) => {
  const { sMatchID, setID } = req.params;
  const query = "DELETE FROM Score WHERE S_MatchID = ? AND SetID = ?";
  db.query(query, [sMatchID, setID], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Score not found" });
    }
    res.json({ message: "Score deleted successfully" });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
