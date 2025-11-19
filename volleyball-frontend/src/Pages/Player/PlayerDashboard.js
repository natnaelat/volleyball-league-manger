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
      .then((data) => setTeams(data))
      .catch((err) => console.error("Error fetching teams:", err));
  }, []);

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
    // Validation
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

    // Send password change request
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
          <Grid item xs={12} md={6}>
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

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <SportsVolleyball sx={{ mr: 1, verticalAlign: "middle" }} />
                  Recent Games
                </Typography>
                {games.slice(0, 5).map((game) => {
                  const team1Name =
                    teams.find((t) => t.TeamID === game.Team1ID)?.TeamName ||
                    `Team ${game.Team1ID}`;
                  const team2Name =
                    teams.find((t) => t.TeamID === game.Team2ID)?.TeamName ||
                    `Team ${game.Team2ID}`;
                  const winnerName = game.WinnerTeamID
                    ? teams.find((t) => t.TeamID === game.WinnerTeamID)
                        ?.TeamName || `Team ${game.WinnerTeamID}`
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
