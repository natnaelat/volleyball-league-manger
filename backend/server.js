const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Q@w1e4r3t6y5", // Remove password or update with correct one
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

// Login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  // Check if admin
  db.query(
    "SELECT * FROM Admin WHERE Ausername = ?",
    [username],
    (err, adminResults) => {
      if (err) return res.status(500).json({ error: err.message });

      if (adminResults.length > 0) {
        // Admin found - check password
        if (adminResults[0].Password === password) {
          // Password correct
          return res.json({ userType: "admin", user: adminResults[0] });
        } else {
          // Password incorrect
          return res.status(401).json({ error: "Invalid password" });
        }
      }

      // Check if player
      db.query(
        "SELECT * FROM Player WHERE Username = ?",
        [username],
        (err, playerResults) => {
          if (err) return res.status(500).json({ error: err.message });

          if (playerResults.length > 0) {
            // Player found - check password
            if (playerResults[0].Password === password) {
              // Password correct
              return res.json({ userType: "player", user: playerResults[0] });
            } else {
              // Password incorrect
              return res.status(401).json({ error: "Invalid password" });
            }
          }

          // User not found
          res.status(401).json({ error: "User not found" });
        }
      );
    }
  );
});

// Add this signup endpoint right after your login endpoint in server.js

// Signup endpoint (for players only)
app.post("/api/signup", (req, res) => {
  const { username, name, password, bdate, points } = req.body;

  // Validate input
  if (!username || !name || !password) {
    return res
      .status(400)
      .json({ error: "Username, name, and password are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  // Check if username already exists in Player table
  db.query(
    "SELECT * FROM Player WHERE Username = ?",
    [username],
    (err, playerResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: err.message });
      }

      if (playerResults.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if username exists in Admin table (can't use admin usernames)
      db.query(
        "SELECT * FROM Admin WHERE Ausername = ?",
        [username],
        (err, adminResults) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
          }

          if (adminResults.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
          }

          // Username is available - create new player
          const insertQuery =
            "INSERT INTO Player (Username, Name, Bdate, Points, Password) VALUES (?, ?, ?, ?, ?)";

          db.query(
            insertQuery,
            [username, name, bdate || null, points || 0, password],
            (err, result) => {
              if (err) {
                console.error("Error creating player:", err);
                return res
                  .status(500)
                  .json({ error: "Failed to create account" });
              }

              console.log("Player account created successfully:", username);
              res.json({
                message: "Account created successfully",
                username: username,
                name: name,
              });
            }
          );
        }
      );
    }
  );
});

app.put("/api/change-password", (req, res) => {
  const { username, currentPassword, newPassword, userType } = req.body;

  // Validation
  if (!username || !currentPassword || !newPassword || !userType) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "New password must be at least 6 characters" });
  }

  if (currentPassword === newPassword) {
    return res
      .status(400)
      .json({ error: "New password must be different from current password" });
  }

  // Determine which table to use based on userType
  const tableName = userType === "admin" ? "Admin" : "Player";
  const usernameField = userType === "admin" ? "Ausername" : "Username";

  // First, verify the current password
  const verifyQuery = `SELECT * FROM ${tableName} WHERE ${usernameField} = ?`;

  db.query(verifyQuery, [username], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];

    // Check if current password matches
    if (user.Password !== currentPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update to new password
    const updateQuery = `UPDATE ${tableName} SET Password = ? WHERE ${usernameField} = ?`;

    db.query(updateQuery, [newPassword, username], (err, result) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ error: "Failed to update password" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`Password changed successfully for ${userType}:`, username);
      res.json({ message: "Password changed successfully" });
    });
  });
});

// === PLAYER ENDPOINTS ===
app.get("/api/players", (req, res) => {
  db.query("SELECT * FROM Player", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/players", (req, res) => {
  const { name, username, bdate, points, password } = req.body;
  const generatedUsername = username || name.toLowerCase().replace(/\s+/g, "");
  const defaultPassword = password || "player123"; // Set default password

  const query =
    "INSERT INTO Player (Username, Name, Bdate, Points, Password) VALUES (?, ?, ?, ?, ?)";
  db.query(
    query,
    [generatedUsername, name, bdate || null, points || 0, defaultPassword],
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

// Update player (add this after the POST /api/players endpoint)
app.put("/api/players/:username", (req, res) => {
  const { username } = req.params;
  const { name, bdate, points } = req.body;

  console.log("Updating player:", username);
  console.log("New data:", { name, bdate, points });

  const query =
    "UPDATE Player SET Name = ?, Bdate = ?, Points = ? WHERE Username = ?";
  db.query(query, [name, bdate || null, points, username], (err, result) => {
    if (err) {
      console.error("Error updating player:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Player not found" });
    }
    console.log("Player updated successfully!");
    res.json({
      Username: username,
      Name: name,
      Bdate: bdate,
      Points: points,
    });
  });
});

app.delete("/api/players/:username", (req, res) => {
  const { username } = req.params;
  const query = "DELETE FROM Player WHERE Username = ?";
  db.query(query, [username], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Player deleted successfully" });
  });
});

// Get the Player's rank and their average overall points
app.get("/api/players/:username/simple-stats", (req, res) => {
  const { username } = req.params;

  const sql = `
    SELECT
      p.Points,
      stats.AvgPoints,
      (
        SELECT COUNT(*) + 1
        FROM Player
        WHERE Points > p.Points
      ) AS PlayerRank
    FROM Player p
    CROSS JOIN (
      SELECT AVG(Points) AS AvgPoints
      FROM Player
    ) AS stats
    WHERE p.Username = ?;
  `;

  db.query(sql, [username], (err, rows) => {
    if (err) {
      console.error("Error fetching simple stats:", err);
      return res.status(500).json({ error: "Failed to fetch stats" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json(rows[0]);
  });
});

// === TEAM ENDPOINTS ===
app.get("/api/teams", (req, res) => {
  db.query("SELECT * FROM Team", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get stats for a specific team
app.get("/api/teams/:teamId/stats", (req, res) => {
  const { teamId } = req.params;

  const sql = `
    SELECT
      t.TeamID,
      t.TeamName,
      COUNT(DISTINCT g.Match_ID) AS GamesPlayed,
      COUNT(DISTINCT CASE WHEN g.WinnerTeamID = t.TeamID THEN g.Match_ID END) AS Wins,
      COUNT(DISTINCT CASE WHEN g.LoserTeamID = t.TeamID THEN g.Match_ID END) AS Losses,
      COALESCE(SUM(
        CASE
          WHEN s.Winning_TeamID = t.TeamID THEN s.Game_Point
          WHEN s.Losing_TeamID  = t.TeamID THEN s.Game_Point
          ELSE 0
        END
      ), 0) AS TotalPoints,
      CASE
        WHEN COUNT(DISTINCT g.Match_ID) = 0 THEN 0
        ELSE ROUND(
          COALESCE(SUM(
            CASE
              WHEN s.Winning_TeamID = t.TeamID THEN s.Game_Point
              WHEN s.Losing_TeamID  = t.TeamID THEN s.Game_Point
              ELSE 0
            END
          ), 0) / COUNT(DISTINCT g.Match_ID), 2)
      END AS AvgPointsPerGame
    FROM Team t
    LEFT JOIN Game g
      ON t.TeamID IN (g.Team1ID, g.Team2ID)
    LEFT JOIN Score s
      ON s.S_MatchID = g.Match_ID
    WHERE t.TeamID = ?
    GROUP BY t.TeamID, t.TeamName;
`;

  db.query(sql, [teamId], (err, rows) => {
    if (err) {
      console.error("Error fetching team stats:", err);
      return res.status(500).json({ error: "Failed to fetch team stats" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json(rows[0]);
  });
});


// 🏅 LEADERBOARD ENDPOINT (NEW) 🏅
app.get("/api/leaderboard/:type/:metric", (req, res) => {
  const { type, metric } = req.params;
  let sql = "";

  if (type === "player" && metric === "points") {
    // Top 5 players by points
    sql = `
      SELECT
        Username,
        Name,
        Points
      FROM
        Player
      ORDER BY
        Points DESC
      LIMIT 5;
    `;
  } else if (type === "team") {
    // Team Leaderboard (by Wins or Points)
    if (metric === "wins") {
      sql = `
        SELECT
          T.TeamName,
          COUNT(G.WinnerTeamID) AS Wins
        FROM
          Team T
        JOIN
          Game G ON G.WinnerTeamID = T.TeamID
        GROUP BY
          T.TeamID, T.TeamName
        ORDER BY
          Wins DESC
        LIMIT 5;
      `;
    } else if (metric === "points") {
      // Use the complex team stat calculation to get total points, similar to team stats endpoint
      sql = `
        SELECT
          t.TeamName,
          COALESCE(SUM(
            CASE
              WHEN s.Winning_TeamID = t.TeamID THEN s.Game_Point
              WHEN s.Losing_TeamID  = t.TeamID THEN s.Game_Point
              ELSE 0
            END
          ), 0) AS TotalPoints
        FROM
          Team t
        LEFT JOIN Game g ON t.TeamID IN (g.Team1ID, g.Team2ID)
        LEFT JOIN Score s ON s.S_MatchID = g.Match_ID
        GROUP BY
          t.TeamID, t.TeamName
        ORDER BY
          TotalPoints DESC
        LIMIT 5;
      `;
    } else {
      return res.status(400).json({ error: "Invalid metric specified for team leaderboard" });
    }
  } else {
    return res.status(400).json({ error: "Invalid leaderboard type or metric combination" });
  }

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching leaderboard:", err);
      return res.status(500).json({ error: "Failed to fetch leaderboard data" });
    }
    res.json(results);
  });
});
// -------------------------------------


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

// Update team (add after POST /api/teams)
app.put("/api/teams/:teamID", (req, res) => {
  const { teamID } = req.params;
  const { TeamName, Cusername } = req.body;

  console.log("Updating team:", teamID);
  console.log("New data:", { TeamName, Cusername });

  // Check if captain exists
  const checkCaptainQuery = "SELECT * FROM Player WHERE Username = ?";
  db.query(checkCaptainQuery, [Cusername], (err, captainResults) => {
    if (err) {
      console.error("Database error checking captain:", err);
      return res.status(500).json({ error: err.message });
    }

    if (captainResults.length === 0) {
      console.log("Captain not found!");
      return res.status(400).json({
        error: "Captain username does not exist",
        providedUsername: Cusername,
      });
    }

    console.log("Captain found! Proceeding to update team...");

    // Update team
    const updateTeamQuery =
      "UPDATE Team SET TeamName = ?, Cusername = ? WHERE TeamID = ?";
    db.query(updateTeamQuery, [TeamName, Cusername, teamID], (err, result) => {
      if (err) {
        console.error("Error updating team:", err);
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Team not found" });
      }

      console.log("Team updated successfully!");
      res.json({
        TeamID: teamID,
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

// Update game
app.put("/api/games/:matchID", (req, res) => {
  const { matchID } = req.params;
  const { Time_Slot, Team1ID, Team2ID, WinnerTeamID, LoserTeamID } = req.body;

  console.log("Updating game:", matchID);
  console.log("New data:", {
    Time_Slot,
    Team1ID,
    Team2ID,
    WinnerTeamID,
    LoserTeamID,
  });

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

    console.log("Both teams found! Proceeding to update game...");

    // Update game
    const updateGameQuery =
      "UPDATE Game SET Time_Slot = ?, Team1ID = ?, Team2ID = ?, WinnerTeamID = ?, LoserTeamID = ? WHERE Match_ID = ?";
    db.query(
      updateGameQuery,
      [Time_Slot, Team1ID, Team2ID, WinnerTeamID, LoserTeamID, matchID],
      (err, result) => {
        if (err) {
          console.error("Error updating game:", err);
          return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Game not found" });
        }

        console.log("Game updated successfully!");
        res.json({
          Match_ID: matchID,
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
  const { Ausername, Name, Password } = req.body;
  const defaultPassword = Password || "admin123"; // Set default password

  console.log("Received admin creation request:");
  console.log("Ausername:", Ausername);
  console.log("Name:", Name);

  // Insert new admin with password
  const insertAdminQuery =
    "INSERT INTO Admin (Ausername, Name, Password) VALUES (?, ?, ?)";
  db.query(
    insertAdminQuery,
    [Ausername, Name, defaultPassword],
    (err, result) => {
      if (err) {
        console.error("Error inserting admin:", err);
        return res.status(500).json({ error: err.message });
      }

      console.log("Admin inserted successfully!");
      res.json({
        Ausername,
        Name,
      });
    }
  );
});

// Update admin
app.put("/api/admins/:ausername", (req, res) => {
  const { ausername } = req.params;
  const { Name, Ausername } = req.body; // Now accepts both Name and new Username

  console.log("Updating admin:", ausername);
  console.log("New data:", { Name, Ausername });

  // If username is being changed, check if new username already exists
  if (Ausername && Ausername !== ausername) {
    const checkUsernameQuery = "SELECT * FROM Admin WHERE Ausername = ?";
    db.query(checkUsernameQuery, [Ausername], (err, results) => {
      if (err) {
        console.error("Error checking username:", err);
        return res.status(500).json({ error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Update both name and username
      const updateAdminQuery =
        "UPDATE Admin SET Name = ?, Ausername = ? WHERE Ausername = ?";
      db.query(
        updateAdminQuery,
        [Name, Ausername, ausername],
        (err, result) => {
          if (err) {
            console.error("Error updating admin:", err);
            return res.status(500).json({ error: err.message });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Admin not found" });
          }

          console.log("Admin updated successfully!");
          res.json({
            Ausername: Ausername,
            Name,
          });
        }
      );
    });
  } else {
    // Only updating name
    const updateAdminQuery = "UPDATE Admin SET Name = ? WHERE Ausername = ?";
    db.query(updateAdminQuery, [Name, ausername], (err, result) => {
      if (err) {
        console.error("Error updating admin:", err);
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Admin not found" });
      }

      console.log("Admin updated successfully!");
      res.json({
        Ausername: ausername,
        Name,
      });
    });
  }
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

// Update location
app.put("/api/locations/:lMatchID", (req, res) => {
  const { lMatchID } = req.params;
  const { Name, State, StreetName, Zipcode, City } = req.body;

  console.log("Updating location:", lMatchID);
  console.log("New data:", { Name, State, StreetName, Zipcode, City });

  // Update location
  const updateLocationQuery =
    "UPDATE Location SET Name = ?, State = ?, StreetName = ?, Zipcode = ?, City = ? WHERE LMatch_ID = ?";
  db.query(
    updateLocationQuery,
    [Name, State, StreetName, Zipcode, City, lMatchID],
    (err, result) => {
      if (err) {
        console.error("Error updating location:", err);
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      console.log("Location updated successfully!");
      res.json({
        LMatch_ID: lMatchID,
        Name,
        State,
        StreetName,
        Zipcode,
        City,
      });
    }
  );
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

app.put("/api/scores/:sMatchID/:setID", (req, res) => {
  const { sMatchID, setID } = req.params;
  const { Game_Point, Losing_TeamID, Winning_TeamID } = req.body;

  console.log("Updating score:", sMatchID, setID);
  console.log("New data:", { Game_Point, Losing_TeamID, Winning_TeamID });

  // Validate that winning and losing teams are different
  if (Losing_TeamID === Winning_TeamID) {
    return res
      .status(400)
      .json({ error: "Winning and losing teams must be different" });
  }

  // Check if both teams exist
  const checkTeamsQuery = "SELECT TeamID FROM Team WHERE TeamID IN (?, ?)";
  db.query(
    checkTeamsQuery,
    [Losing_TeamID, Winning_TeamID],
    (err, teamResults) => {
      if (err) {
        console.error("Database error checking teams:", err);
        return res.status(500).json({ error: err.message });
      }

      if (teamResults.length !== 2) {
        console.log("One or both teams not found!");
        return res
          .status(400)
          .json({ error: "One or both teams do not exist" });
      }

      console.log("Teams validated! Proceeding to update score...");

      // Update score
      const updateScoreQuery =
        "UPDATE Score SET Game_Point = ?, Losing_TeamID = ?, Winning_TeamID = ? WHERE S_MatchID = ? AND SetID = ?";
      db.query(
        updateScoreQuery,
        [Game_Point, Losing_TeamID, Winning_TeamID, sMatchID, setID],
        (err, result) => {
          if (err) {
            console.error("Error updating score:", err);
            return res.status(500).json({ error: err.message });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Score not found" });
          }

          console.log("Score updated successfully!");
          res.json({
            S_MatchID: sMatchID,
            SetID: setID,
            Game_Point,
            Losing_TeamID,
            Winning_TeamID,
          });
        }
      );
    }
  );
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