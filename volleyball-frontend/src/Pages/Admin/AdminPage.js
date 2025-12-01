import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Person,
  Group,
  SportsVolleyball,
  AdminPanelSettings,
  LocationOn,
  Scoreboard,
  Lock,
} from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export const AdminPage = ({ onLogout, currentUser }) => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [locations, setLocations] = useState([]);
  const [scores, setScores] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamForm, setEditTeamForm] = useState({});
  const [editingGame, setEditingGame] = useState(null);
  const [editGameForm, setEditGameForm] = useState({});
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editAdminForm, setEditAdminForm] = useState({});
  const [editingLocation, setEditingLocation] = useState(null);
  const [editLocationForm, setEditLocationForm] = useState({});
  const [editingScore, setEditingScore] = useState(null);
  const [editScoreForm, setEditScoreForm] = useState({});
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const navigate = useNavigate();

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

  const handleSubmitPasswordChange = async () => {
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

    try {
      const response = await axios.put(
        "http://localhost:3001/api/change-password",
        {
          username: currentUser,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          userType: "admin",
        }
      );

      if (response.data.error) {
        setPasswordError(response.data.error);
      } else {
        setPasswordSuccess("Password changed successfully!");
        setTimeout(() => {
          handleClosePasswordDialog();
        }, 2000);
      }
    } catch (err) {
      console.error("Password change error:", err);
      if (err.response?.data?.error) {
        setPasswordError(err.response.data.error);
      } else {
        setPasswordError("Failed to change password - server error");
      }
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/players");
      setPlayers(res.data);
    } catch (err) {
      console.error("Failed to fetch players:", err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/teams");
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  const fetchGames = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/games");
      setGames(res.data);
    } catch (err) {
      console.error("Failed to fetch games:", err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/admins");
      setAdmins(res.data);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/locations");
      setLocations(res.data);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    }
  };

  const fetchScores = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/scores");
      setScores(res.data);
    } catch (err) {
      console.error("Failed to fetch scores:", err);
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
    fetchGames();
    fetchAdmins();
    fetchLocations();
    fetchScores();
  }, []);

  const handleAddPlayer = () => navigate("/add-player");
  const handleAddTeam = () => navigate("/add-team");
  const handleAddGame = () => navigate("/add-game");
  const handleAddAdmin = () => navigate("/add-admin");
  const handleAddLocation = () => navigate("/add-location");
  const handleAddScore = () => navigate("/add-score");

  // Player Edit Handlers
  const handleEditPlayer = (player) => {
    setEditingPlayer(player.Username);
    setEditForm({
      name: player.Name,
      bdate: player.Bdate ? player.Bdate.split("T")[0] : "",
      points: player.Points,
    });
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setEditForm({});
  };

  const handleSavePlayer = async (username) => {
    try {
      await axios.put(
        `http://localhost:3001/api/players/${encodeURIComponent(username)}`,
        {
          name: editForm.name,
          bdate: editForm.bdate,
          points: editForm.points,
        }
      );

      setPlayers(
        players.map((p) =>
          p.Username === username
            ? {
                ...p,
                Name: editForm.name,
                Bdate: editForm.bdate,
                Points: editForm.points,
              }
            : p
        )
      );

      setEditingPlayer(null);
      setEditForm({});
    } catch (err) {
      console.error("Failed to update player:", err);
      alert("Failed to update player");
    }
  };

  // Team Edit Handlers
  const handleEditTeam = (team) => {
    setEditingTeam(team.TeamID);
    setEditTeamForm({
      teamName: team.TeamName,
      cusername: team.Cusername,
    });
  };

  const handleCancelTeamEdit = () => {
    setEditingTeam(null);
    setEditTeamForm({});
  };

  const handleSaveTeam = async (teamID) => {
    try {
      await axios.put(`http://localhost:3001/api/teams/${teamID}`, {
        TeamName: editTeamForm.teamName,
        Cusername: editTeamForm.cusername,
      });

      setTeams(
        teams.map((t) =>
          t.TeamID === teamID
            ? {
                ...t,
                TeamName: editTeamForm.teamName,
                Cusername: editTeamForm.cusername,
              }
            : t
        )
      );

      setEditingTeam(null);
      setEditTeamForm({});
    } catch (err) {
      console.error("Failed to update team:", err);
      alert("Failed to update team. Make sure the captain username exists.");
    }
  };

  // Game Edit Handlers
  const handleEditGame = (game) => {
    setEditingGame(game.Match_ID);
    setEditGameForm({
      timeSlot: game.Time_Slot ? game.Time_Slot.slice(0, 16) : "",
      team1ID: game.Team1ID,
      team2ID: game.Team2ID,
      winnerTeamID: game.WinnerTeamID || "",
    });
  };

  const handleCancelGameEdit = () => {
    setEditingGame(null);
    setEditGameForm({});
  };

  const handleSaveGame = async (matchID) => {
    try {
      const loserTeamID =
        editGameForm.winnerTeamID && editGameForm.winnerTeamID !== ""
          ? editGameForm.winnerTeamID === editGameForm.team1ID
            ? editGameForm.team2ID
            : editGameForm.team1ID
          : null;

      await axios.put(`http://localhost:3001/api/games/${matchID}`, {
        Time_Slot: editGameForm.timeSlot,
        Team1ID: editGameForm.team1ID,
        Team2ID: editGameForm.team2ID,
        WinnerTeamID: editGameForm.winnerTeamID || null,
        LoserTeamID: loserTeamID,
      });

      setGames(
        games.map((g) =>
          g.Match_ID === matchID
            ? {
                ...g,
                Time_Slot: editGameForm.timeSlot,
                Team1ID: editGameForm.team1ID,
                Team2ID: editGameForm.team2ID,
                WinnerTeamID: editGameForm.winnerTeamID || null,
                LoserTeamID: loserTeamID,
              }
            : g
        )
      );

      setEditingGame(null);
      setEditGameForm({});
    } catch (err) {
      console.error("Failed to update game:", err);
      alert("Failed to update game. Make sure both teams exist.");
    }
  };

  // Admin Edit Handlers
  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin.Ausername);
    setEditAdminForm({
      name: admin.Name,
      ausername: admin.Ausername, // Add username to form
    });
  };

  const handleCancelAdminEdit = () => {
    setEditingAdmin(null);
    setEditAdminForm({});
  };

  const handleSaveAdmin = async (originalUsername) => {
    try {
      await axios.put(
        `http://localhost:3001/api/admins/${encodeURIComponent(
          originalUsername
        )}`,
        {
          Name: editAdminForm.name,
          Ausername: editAdminForm.ausername, // Include new username
        }
      );

      setAdmins(
        admins.map((a) =>
          a.Ausername === originalUsername
            ? {
                ...a,
                Name: editAdminForm.name,
                Ausername: editAdminForm.ausername,
              }
            : a
        )
      );

      setEditingAdmin(null);
      setEditAdminForm({});
    } catch (err) {
      console.error("Failed to update admin:", err);
      alert("Failed to update admin");
    }
  };

  // Location Edit Handlers
  const handleEditLocation = (location) => {
    setEditingLocation(location.LMatch_ID);
    setEditLocationForm({
      name: location.Name,
      state: location.State,
      streetName: location.StreetName,
      zipcode: location.Zipcode,
      city: location.City,
    });
  };

  const handleCancelLocationEdit = () => {
    setEditingLocation(null);
    setEditLocationForm({});
  };

  const handleSaveLocation = async (lMatchID) => {
    try {
      await axios.put(`http://localhost:3001/api/locations/${lMatchID}`, {
        Name: editLocationForm.name,
        State: editLocationForm.state,
        StreetName: editLocationForm.streetName,
        Zipcode: editLocationForm.zipcode,
        City: editLocationForm.city,
      });

      setLocations(
        locations.map((l) =>
          l.LMatch_ID === lMatchID
            ? {
                ...l,
                Name: editLocationForm.name,
                State: editLocationForm.state,
                StreetName: editLocationForm.streetName,
                Zipcode: editLocationForm.zipcode,
                City: editLocationForm.city,
              }
            : l
        )
      );

      setEditingLocation(null);
      setEditLocationForm({});
    } catch (err) {
      console.error("Failed to update location:", err);
      alert("Failed to update location");
    }
  };

  const handleEditScore = (score) => {
    setEditingScore(`${score.S_MatchID}-${score.SetID}`);
    setEditScoreForm({
      gamePoint: score.Game_Point,
      losingTeamID: score.Losing_TeamID,
      winningTeamID: score.Winning_TeamID,
      matchID: score.S_MatchID, // Store match ID to find the game
    });
  };

  const handleCancelScoreEdit = () => {
    setEditingScore(null);
    setEditScoreForm({});
  };

  const handleSaveScore = async (sMatchID, setID) => {
    try {
      await axios.put(`http://localhost:3001/api/scores/${sMatchID}/${setID}`, {
        Game_Point: editScoreForm.gamePoint,
        Losing_TeamID: editScoreForm.losingTeamID,
        Winning_TeamID: editScoreForm.winningTeamID,
      });

      setScores(
        scores.map((s) =>
          s.S_MatchID === sMatchID && s.SetID === setID
            ? {
                ...s,
                Game_Point: editScoreForm.gamePoint,
                Losing_TeamID: editScoreForm.losingTeamID,
                Winning_TeamID: editScoreForm.winningTeamID,
              }
            : s
        )
      );

      setEditingScore(null);
      setEditScoreForm({});
    } catch (err) {
      console.error("Failed to update score:", err);
      alert(
        "Failed to update score. Make sure both teams exist and are different."
      );
    }
  };

  const handleRemovePlayer = async (username) => {
    try {
      await axios.delete(
        `http://localhost:3001/api/players/${encodeURIComponent(username)}`
      );
      setPlayers(players.filter((p) => p.Username !== username));
    } catch (err) {
      console.error("Failed to remove player:", err);
    }
  };

  const handleRemoveTeam = async (teamID) => {
    try {
      await axios.delete(`http://localhost:3001/api/teams/${teamID}`);
      setTeams(teams.filter((t) => t.TeamID !== teamID));
    } catch (err) {
      console.error("Failed to remove team:", err);
    }
  };

  const handleRemoveGame = async (matchID) => {
    try {
      await axios.delete(`http://localhost:3001/api/games/${matchID}`);
      setGames(games.filter((g) => g.Match_ID !== matchID));
    } catch (err) {
      console.error("Failed to remove game:", err);
    }
  };

  const handleRemoveAdmin = async (ausername) => {
    try {
      await axios.delete(
        `http://localhost:3001/api/admins/${encodeURIComponent(ausername)}`
      );
      setAdmins(admins.filter((a) => a.Ausername !== ausername));
    } catch (err) {
      console.error("Failed to remove admin:", err);
    }
  };

  const handleRemoveLocation = async (lMatchID) => {
    try {
      await axios.delete(`http://localhost:3001/api/locations/${lMatchID}`);
      setLocations(locations.filter((l) => l.LMatch_ID !== lMatchID));
    } catch (err) {
      console.error("Failed to remove location:", err);
    }
  };

  const handleRemoveScore = async (sMatchID, setID) => {
    try {
      await axios.delete(
        `http://localhost:3001/api/scores/${sMatchID}/${setID}`
      );
      setScores(
        scores.filter((s) => !(s.S_MatchID === sMatchID && s.SetID === setID))
      );
    } catch (err) {
      console.error("Failed to remove score:", err);
    }
  };

  const getTeamName = (teamID) => {
    const team = teams.find((t) => t.TeamID === teamID);
    return team ? team.TeamName : `Team ${teamID}`;
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {/* Players Section */}
      <Card sx={{ maxWidth: 600, margin: "20px auto" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            <Person sx={{ mr: 1, verticalAlign: "middle" }} />
            Players ({players.length})
          </Typography>
          <Button variant="contained" onClick={handleAddPlayer} sx={{ mb: 2 }}>
            Add Player
          </Button>
          {players.map((player) => (
            <Card key={player.Username} variant="outlined" sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1 }}>
                {editingPlayer === player.Username ? (
                  <Box>
                    <TextField
                      fullWidth
                      label="Name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Birthdate"
                      type="date"
                      value={editForm.bdate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bdate: e.target.value })
                      }
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Points"
                      type="number"
                      value={editForm.points}
                      onChange={(e) =>
                        setEditForm({ ...editForm, points: e.target.value })
                      }
                      size="small"
                      inputProps={{ min: 0 }}
                      sx={{ mb: 1 }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleSavePlayer(player.Username)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1">
                      {player.Name} - Points: {player.Points}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEditPlayer(player)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRemovePlayer(player.Username)}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Teams Section */}
      <Card sx={{ maxWidth: 600, margin: "20px auto" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            <Group sx={{ mr: 1, verticalAlign: "middle" }} />
            Teams ({teams.length})
          </Typography>
          <Button variant="contained" onClick={handleAddTeam} sx={{ mb: 2 }}>
            Add Team
          </Button>
          {teams.map((team) => (
            <Card key={team.TeamID} variant="outlined" sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1 }}>
                {editingTeam === team.TeamID ? (
                  <Box>
                    <TextField
                      fullWidth
                      label="Team Name"
                      value={editTeamForm.teamName}
                      onChange={(e) =>
                        setEditTeamForm({
                          ...editTeamForm,
                          teamName: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Captain Username"
                      value={editTeamForm.cusername}
                      onChange={(e) =>
                        setEditTeamForm({
                          ...editTeamForm,
                          cusername: e.target.value,
                        })
                      }
                      size="small"
                      helperText="Must be an existing player username"
                      sx={{ mb: 1 }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleSaveTeam(team.TeamID)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCancelTeamEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1">
                      {team.TeamName} (Captain: {team.Cusername})
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEditTeam(team)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveTeam(team.TeamID)}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Games Section */}
      <Card sx={{ maxWidth: 600, margin: "20px auto" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            <SportsVolleyball sx={{ mr: 1, verticalAlign: "middle" }} />
            Games ({games.length})
          </Typography>
          <Button variant="contained" onClick={handleAddGame} sx={{ mb: 2 }}>
            Schedule Game
          </Button>
          {games.map((game) => (
            <Card key={game.Match_ID} variant="outlined" sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1 }}>
                {editingGame === game.Match_ID ? (
                  <Box>
                    <TextField
                      fullWidth
                      label="Date & Time"
                      type="datetime-local"
                      value={editGameForm.timeSlot}
                      onChange={(e) =>
                        setEditGameForm({
                          ...editGameForm,
                          timeSlot: e.target.value,
                        })
                      }
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      select
                      label="Team 1"
                      value={editGameForm.team1ID}
                      onChange={(e) =>
                        setEditGameForm({
                          ...editGameForm,
                          team1ID: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    >
                      {teams.map((team) => (
                        <MenuItem key={team.TeamID} value={team.TeamID}>
                          {team.TeamName}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      select
                      label="Team 2"
                      value={editGameForm.team2ID}
                      onChange={(e) =>
                        setEditGameForm({
                          ...editGameForm,
                          team2ID: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    >
                      {teams.map((team) => (
                        <MenuItem key={team.TeamID} value={team.TeamID}>
                          {team.TeamName}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      select
                      label="Winner (Optional)"
                      value={editGameForm.winnerTeamID}
                      onChange={(e) =>
                        setEditGameForm({
                          ...editGameForm,
                          winnerTeamID: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    >
                      <MenuItem value="">No winner yet</MenuItem>
                      <MenuItem value={editGameForm.team1ID}>
                        {getTeamName(editGameForm.team1ID)}
                      </MenuItem>
                      <MenuItem value={editGameForm.team2ID}>
                        {getTeamName(editGameForm.team2ID)}
                      </MenuItem>
                    </TextField>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleSaveGame(game.Match_ID)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCancelGameEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Typography variant="body1">
                        {getTeamName(game.Team1ID)} vs{" "}
                        {getTeamName(game.Team2ID)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(game.Time_Slot)}
                      </Typography>
                      {game.WinnerTeamID && (
                        <Chip
                          label={`Winner: ${getTeamName(game.WinnerTeamID)}`}
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </div>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEditGame(game)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveGame(game.Match_ID)}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Admins Section */}
      <Card sx={{ maxWidth: 600, margin: "20px auto" }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">
              <AdminPanelSettings sx={{ mr: 1, verticalAlign: "middle" }} />
              Admins ({admins.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Lock />}
              onClick={handleOpenPasswordDialog}
              size="small"
            >
              Change My Password
            </Button>
          </Box>

          <Button variant="contained" onClick={handleAddAdmin} sx={{ mb: 2 }}>
            Add Admin
          </Button>

          {admins.map((admin) => (
            <Card key={admin.Ausername} variant="outlined" sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1 }}>
                {editingAdmin === admin.Ausername ? (
                  <Box>
                    <TextField
                      fullWidth
                      label="Username"
                      value={editAdminForm.ausername}
                      onChange={(e) =>
                        setEditAdminForm({
                          ...editAdminForm,
                          ausername: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                      helperText="Changing username will affect login"
                    />
                    <TextField
                      fullWidth
                      label="Name"
                      value={editAdminForm.name}
                      onChange={(e) =>
                        setEditAdminForm({
                          ...editAdminForm,
                          name: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleSaveAdmin(admin.Ausername)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCancelAdminEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1">
                      {admin.Name} (@{admin.Ausername})
                      {admin.Ausername === currentUser && (
                        <Chip
                          label="You"
                          color="primary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {/* Only show Edit button if this is the current user */}
                      {admin.Ausername === currentUser && (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleEditAdmin(admin)}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveAdmin(admin.Ausername)}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Locations Section */}
      <Card sx={{ maxWidth: 600, margin: "20px auto" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            <LocationOn sx={{ mr: 1, verticalAlign: "middle" }} />
            Locations ({locations.length})
          </Typography>
          <Button
            variant="contained"
            onClick={handleAddLocation}
            sx={{ mb: 2 }}
          >
            Add Location
          </Button>
          {locations.map((location) => (
            <Card key={location.LMatch_ID} variant="outlined" sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1 }}>
                {editingLocation === location.LMatch_ID ? (
                  <Box>
                    <TextField
                      fullWidth
                      label="Venue Name"
                      value={editLocationForm.name}
                      onChange={(e) =>
                        setEditLocationForm({
                          ...editLocationForm,
                          name: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={editLocationForm.streetName}
                      onChange={(e) =>
                        setEditLocationForm({
                          ...editLocationForm,
                          streetName: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="City"
                      value={editLocationForm.city}
                      onChange={(e) =>
                        setEditLocationForm({
                          ...editLocationForm,
                          city: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="State"
                      value={editLocationForm.state}
                      onChange={(e) =>
                        setEditLocationForm({
                          ...editLocationForm,
                          state: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Zipcode"
                      value={editLocationForm.zipcode}
                      onChange={(e) =>
                        setEditLocationForm({
                          ...editLocationForm,
                          zipcode: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleSaveLocation(location.LMatch_ID)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCancelLocationEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Typography variant="body1">{location.Name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {location.StreetName}, {location.City}, {location.State}{" "}
                        {location.Zipcode}
                      </Typography>
                      <Chip
                        label={`Match ${location.LMatch_ID}`}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </div>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEditLocation(location)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveLocation(location.LMatch_ID)}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Scores Section */}
      <Card sx={{ maxWidth: 600, margin: "20px auto" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            <Scoreboard sx={{ mr: 1, verticalAlign: "middle" }} />
            Scores ({scores.length})
          </Typography>
          <Button variant="contained" onClick={handleAddScore} sx={{ mb: 2 }}>
            Add Score
          </Button>
          {scores.map((score) => {
            // Find the game for this score to get the two teams
            const game = games.find((g) => g.Match_ID === score.S_MatchID);
            const availableTeams = game
              ? teams.filter(
                  (t) => t.TeamID === game.Team1ID || t.TeamID === game.Team2ID
                )
              : [];

            return (
              <Card
                key={`${score.S_MatchID}-${score.SetID}`}
                variant="outlined"
                sx={{ mb: 1 }}
              >
                <CardContent sx={{ py: 1 }}>
                  {editingScore === `${score.S_MatchID}-${score.SetID}` ? (
                    <Box>
                      <TextField
                        fullWidth
                        label="Game Points"
                        type="number"
                        value={editScoreForm.gamePoint}
                        onChange={(e) =>
                          setEditScoreForm({
                            ...editScoreForm,
                            gamePoint: e.target.value,
                          })
                        }
                        size="small"
                        inputProps={{ min: 0 }}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        select
                        label="Winning Team"
                        value={editScoreForm.winningTeamID}
                        onChange={(e) =>
                          setEditScoreForm({
                            ...editScoreForm,
                            winningTeamID: e.target.value,
                          })
                        }
                        size="small"
                        sx={{ mb: 1 }}
                        helperText="Only teams from this game"
                      >
                        {availableTeams.map((team) => (
                          <MenuItem key={team.TeamID} value={team.TeamID}>
                            {team.TeamName}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        fullWidth
                        select
                        label="Losing Team"
                        value={editScoreForm.losingTeamID}
                        onChange={(e) =>
                          setEditScoreForm({
                            ...editScoreForm,
                            losingTeamID: e.target.value,
                          })
                        }
                        size="small"
                        sx={{ mb: 1 }}
                        helperText="Only teams from this game"
                      >
                        {availableTeams.map((team) => (
                          <MenuItem key={team.TeamID} value={team.TeamID}>
                            {team.TeamName}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() =>
                            handleSaveScore(score.S_MatchID, score.SetID)
                          }
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleCancelScoreEdit}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Typography variant="body1">
                          Match {score.S_MatchID} - Set {score.SetID}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Winner: {getTeamName(score.Winning_TeamID)} | Loser:{" "}
                          {getTeamName(score.Losing_TeamID)} ({score.Game_Point}{" "}
                          pts)
                        </Typography>
                      </div>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleEditScore(score)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() =>
                            handleRemoveScore(score.S_MatchID, score.SetID)
                          }
                        >
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Lock sx={{ mr: 1, verticalAlign: "middle" }} />
          Change Admin Password
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
    </>
  );
};
