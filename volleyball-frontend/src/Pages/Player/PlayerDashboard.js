import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import {
  Person,
  SportsVolleyball,
  Lock,
  EmojiEvents,
  MilitaryTech, // Import new icon
  ThumbDownAlt, // Import new icon
} from "@mui/icons-material"; // Import all necessary icons

function PlayerDashboard({ user, onLogout }) {
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teamStats, setTeamStats] = useState(null);
  const [loadingTeamStats, setLoadingTeamStats] = useState(false);
  const [teamStatsError, setTeamStatsError] = useState("");

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [simpleStats, setSimpleStats] = useState(null);

  // --- New Leaderboard State ---
  const [leaderboardType, setLeaderboardType] = useState("player"); // 'player' or 'team'
  const [leaderboardMetric, setLeaderboardMetric] = useState("points"); // 'points' or 'wins'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  // -----------------------------

  // --- NEW Team Wins Summary State ---
  const [teamWinSummary, setTeamWinSummary] = useState(null);
  const [loadingTeamWinSummary, setLoadingTeamWinSummary] = useState(false);
  // -----------------------------------

  // **Initial Data Fetch (Games & Teams)**
  useEffect(() => {
    fetch("http://localhost:3001/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((err) => console.error("Error fetching games:", err));

    fetch("http://localhost:3001/api/teams")
      .then((res) => res.json())
      .then((data) => {
        setTeams(data);
        if (data.length > 0) {
          // Find the TeamID for the user's team, or default to the first one
          const userTeam = data.find(
            (team) => team.Cusername === user.Username
          );
          setSelectedTeamId(
            (userTeam ? userTeam.TeamID : data[0].TeamID).toString()
          );
        }
      })
      .catch((err) => console.error("Error fetching teams:", err));
  }, [user.Username]);

  // **Selected Team Stats Fetch**
  useEffect(() => {
    if (!selectedTeamId) return;

    setLoadingTeamStats(true);
    setTeamStatsError("");
    setTeamStats(null);

    fetch(`http://localhost:3001/api/teams/${selectedTeamId}/stats`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch team stats");
        return res.json();
      })
      .then((data) => {
        setTeamStats(data);
      })
      .catch((err) => {
        console.error("Error fetching team stats:", err);
        setTeamStatsError("Failed to load team stats");
      })
      .finally(() => {
        setLoadingTeamStats(false);
      });
  }, [selectedTeamId]);

  // **Player Simple Stats Fetch**
  useEffect(() => {
    if (!user || !user.Username) return;

    fetch(`http://localhost:3001/api/players/${user.Username}/simple-stats`)
      .then((res) => res.json())
      .then((data) => setSimpleStats(data))
      .catch((err) => console.error("Error fetching simple stats:", err));
  }, [user]);

  // **Leaderboard Fetch Effect**
  useEffect(() => {
    setLoadingLeaderboard(true);
    setLeaderboardData([]);

    // Construct the API URL based on selected type and metric
    const url = `http://localhost:3001/api/leaderboard/${leaderboardType}/${leaderboardMetric}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json();
      })
      .then((data) => {
        setLeaderboardData(data.slice(0, 5)); // Limit to top 5
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
      })
      .finally(() => {
        setLoadingLeaderboard(false);
      });
  }, [leaderboardType, leaderboardMetric]);

  // **NEW Team Wins Summary Fetch Effect**
  useEffect(() => {
    setLoadingTeamWinSummary(true);
    setTeamWinSummary(null);

    // NOTE: You must implement this endpoint on your backend!
    fetch(`http://localhost:3001/api/teams/win-summary`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch team win summary");
        return res.json();
      })
      .then((data) => {
        // data should be in the format { bestTeam: {TeamName, MaxWins}, worstTeam: {TeamName, MinWins} }
        setTeamWinSummary(data);
      })
      .catch((err) => {
        console.error("Error fetching team win summary:", err);
        // Handle error display if necessary
      })
      .finally(() => {
        setLoadingTeamWinSummary(false);
      });
  }, []); // Run once on mount

  const recentGames = games.slice(0, 5);

  const futureGames = [...games]
    .filter((g) => new Date(g.Time_Slot) > new Date())
    .sort(
      (a, b) => new Date(a.Time_Slot).getTime() - new Date(b.Time_Slot).getTime()
    )
    .slice(0, 5);

  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswordForm({ ...passwordForm, [field]: e.target.value });
    setPasswordError("");
  };

  const handleSubmitPasswordChange = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    fetch("http://localhost:3001/api/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.Username,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        userType: "player",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setPasswordError(data.error);
        } else {
          setPasswordSuccess("Password changed successfully!");
          setTimeout(() => {
            handleClosePasswordDialog();
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("Password change error:", err);
        setPasswordError("Failed to change password - server error");
      });
  };

  const getTeamName = (teamId) =>
    teams.find((t) => t.TeamID === teamId)?.TeamName || `Team ${teamId}`;

  // Helper function to format the leaderboard item value
  const formatLeaderboardValue = (metric, item) => {
    if (leaderboardType === "player") {
      // Assuming Points is the metric available on the player table
      return metric === "points" ? item.Points : "";
    } else {
      // team
      return metric === "points" ? item.TotalPoints : item.Wins;
    }
  };

  // Helper function to get the name for the leaderboard item
  const getLeaderboardName = (item) => {
    return leaderboardType === "player" ? item.Name : item.TeamName;
  };

  // Helper function to get the label for the metric
  const getMetricLabel = (metric) => {
    return metric === "points" ? "Points" : "Wins";
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">Welcome, {user.Name}!</Typography>
          <Button onClick={onLogout} variant="outlined">
            Logout
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                  Your Stats
                </Typography>
                <Typography>Points: {user.Points}</Typography>
                {simpleStats && (
                  <>
                    <Typography>Rank: #{simpleStats.PlayerRank}</Typography>
                    <Typography>
                      Avg Points (All Players):{" "}
                      {simpleStats.AvgPoints != null
                        ? Number(simpleStats.AvgPoints).toFixed(2)
                        : "0.00"}
                    </Typography>
                  </>
                )}
                <Typography>Username: {user.Username}</Typography>
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Lock />}
                    onClick={handleOpenPasswordDialog}
                    fullWidth
                  >
                    Change Password
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Upcoming Games
                </Typography>

                {futureGames.length === 0 && (
                  <Typography variant="body2">
                    No upcoming games scheduled.
                  </Typography>
                )}

                {futureGames.map((game) => {
                  const team1Name = getTeamName(game.Team1ID);
                  const team2Name = getTeamName(game.Team2ID);

                  return (
                    <Card key={game.Match_ID} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2">
                          {team1Name} vs {team2Name}
                          <br />
                          Time: {new Date(game.Time_Slot).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <SportsVolleyball sx={{ mr: 1, verticalAlign: "middle" }} />
                  Recent Games
                </Typography>
                {recentGames.map((game) => {
                  const team1Name = getTeamName(game.Team1ID);
                  const team2Name = getTeamName(game.Team2ID);
                  const winnerName = game.WinnerTeamID
                    ? getTeamName(game.WinnerTeamID)
                    : "Not Decided Yet";

                  return (
                    <Card key={game.Match_ID} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2">
                          {team1Name} vs {team2Name}
                          <br />
                          Winner: {winnerName}
                          <br />
                          Date: {new Date(game.Time_Slot).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          {/* --- Existing Team Stats Card --- */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Team Stats
                </Typography>

                <TextField
                  select
                  label="Select Team"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                  sx={{ mb: 2 }}
                >
                  {teams.map((team) => (
                    <option key={team.TeamID} value={team.TeamID}>
                      {team.TeamName}
                    </option>
                  ))}
                </TextField>

                {loadingTeamStats && (
                  <Typography variant="body2">Loading team stats...</Typography>
                )}

                {teamStatsError && (
                  <Typography variant="body2" color="error">
                    {teamStatsError}
                  </Typography>
                )}

                {teamStats && !loadingTeamStats && !teamStatsError && (
                  <Box>
                    <Typography>Games Played: {teamStats.GamesPlayed}</Typography>
                    <Typography>Wins: {teamStats.Wins}</Typography>
                    <Typography>Losses: {teamStats.Losses}</Typography>
                    <Typography>
                      Win Rate:{" "}
                      {teamStats.GamesPlayed === 0
                        ? "0%"
                        : `${Math.round(
                            (teamStats.Wins / teamStats.GamesPlayed) * 100
                          )}%`}
                    </Typography>
                    <Typography>Total Points: {teamStats.TotalPoints}</Typography>
                    <Typography>
                      Avg Points/Game: {teamStats.AvgPointsPerGame}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* ------------------------------- */}

          {/* --- Leaderboard Card --- */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <EmojiEvents sx={{ mr: 1, verticalAlign: "middle" }} />
                  Leaderboards
                </Typography>

                <TextField
                  select
                  label="Type"
                  value={leaderboardType}
                  onChange={(e) => setLeaderboardType(e.target.value)}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <MenuItem value="player">Player Leaderboard</MenuItem>
                  <MenuItem value="team">Team Leaderboard</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Metric"
                  value={leaderboardMetric}
                  onChange={(e) => setLeaderboardMetric(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="points">By Points</MenuItem>
                  {leaderboardType === "team" && (
                    <MenuItem value="wins">By Wins</MenuItem>
                  )}
                </TextField>

                {loadingLeaderboard && (
                  <Typography variant="body2">Loading leaderboard...</Typography>
                )}

                {!loadingLeaderboard && leaderboardData.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{
                        borderBottom: "1px solid #eee",
                        pb: 0.5,
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                      }}
                    >
                      <span>
                        Rank. {leaderboardType === "player" ? "Player" : "Team"}
                      </span>
                      <span>{getMetricLabel(leaderboardMetric)}</span>
                    </Typography>
                    {leaderboardData.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          py: 0.5,
                          bgcolor: index % 2 === 0 ? "#f9f9f9" : "inherit",
                          px: 1,
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2">
                          <span style={{ fontWeight: "bold" }}>#{index + 1}.</span>{" "}
                          {getLeaderboardName(item)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {formatLeaderboardValue(leaderboardMetric, item)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {!loadingLeaderboard && leaderboardData.length === 0 && (
                  <Typography variant="body2">
                    No leaderboard data found for this selection.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* ---------------------------- */}

          {/* --- Team Wins Summary Card (NEW) --- */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  🏆 League Summary
                </Typography>

                {loadingTeamWinSummary && (
                  <Typography variant="body2">
                    Calculating min/max wins...
                  </Typography>
                )}

                {teamWinSummary && !loadingTeamWinSummary && (
                  <Box>
                    <Box sx={{ mb: 2, borderBottom: "1px solid #eee", pb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                      >
                        <MilitaryTech sx={{ mr: 0.5, verticalAlign: "middle" }} />{" "}
                        Best Team (Max Wins)
                      </Typography>
                      <Typography variant="body1" sx={{ ml: 3 }}>
                        {teamWinSummary.bestTeam.TeamName} with {teamWinSummary.bestTeam.MaxWins} wins.
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", color: "error.main" }}
                      >
                        <ThumbDownAlt sx={{ mr: 0.5, verticalAlign: "middle" }} />{" "}
                        Worst Team (Min Wins)
                      </Typography>
                      <Typography variant="body1" sx={{ ml: 3 }}>
                        {teamWinSummary.worstTeam.TeamName} with {teamWinSummary.worstTeam.MinWins == null
                          ? "0"
                          : String(teamWinSummary.worstTeam.MinWins).padStart(2, "0")} wins.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* ------------------------------------- */}
        </Grid>
      </Box>

      {/* Password Change Dialog (Remains the same) */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Lock sx={{ mr: 1, verticalAlign: "middle" }} />
          Change Password
        </DialogTitle>
        <DialogContent>
          {passwordError && (
            <Typography
              color="error"
              align="center"
              sx={{ mb: 2, p: 1, bgcolor: "#ffebee", borderRadius: 1 }}
            >
              {passwordError}
            </Typography>
          )}

          {passwordSuccess && (
            <Typography
              color="success.main"
              align="center"
              sx={{ mb: 2, p: 1, bgcolor: "#e8f5e9", borderRadius: 1 }}
            >
              {passwordSuccess}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange("currentPassword")}
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange("newPassword")}
            sx={{ mb: 2 }}
            helperText="At least 6 characters"
          />

          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange("confirmPassword")}
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitPasswordChange}
            variant="contained"
            disabled={passwordSuccess !== ""}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PlayerDashboard;