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
} from "@mui/material";
import { Person, SportsVolleyball, Lock } from "@mui/icons-material";

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
          setSelectedTeamId(data[0].TeamID.toString());
        }
      })
      .catch((err) => console.error("Error fetching teams:", err));
  }, []);

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
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                  Your Stats
                </Typography>
                <Typography>Points: {user.Points}</Typography>
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

          <Grid item xs={12} md={3}>
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

          <Grid item xs={12} md={3}>
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
          
          <Grid item xs={12} md={3}>
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
        </Grid>
      </Box>

      {/* Password Change Dialog */}
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
