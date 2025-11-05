import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  Alert,
} from "@mui/material";

export const AddGame = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [timeSlot, setTimeSlot] = useState("");
  const [team1ID, setTeam1ID] = useState("");
  const [team2ID, setTeam2ID] = useState("");
  const [winnerTeamID, setWinnerTeamID] = useState("");
  const [error, setError] = useState("");

  // Fetch teams for the dropdown
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/teams");
        setTeams(res.data);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    };
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (team1ID === team2ID) {
      setError("Team 1 and Team 2 must be different!");
      return;
    }

    if (winnerTeamID && winnerTeamID !== team1ID && winnerTeamID !== team2ID) {
      setError("Winner must be either Team 1 or Team 2!");
      return;
    }

    try {
      const loserTeamID = winnerTeamID
        ? winnerTeamID === team1ID
          ? team2ID
          : team1ID
        : null;

      await axios.post("http://localhost:3001/api/games", {
        Time_Slot: timeSlot,
        Team1ID: team1ID,
        Team2ID: team2ID,
        WinnerTeamID: winnerTeamID || null,
        LoserTeamID: loserTeamID,
      });

      // Navigate back to home page
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to add game:", err);
      setError(
        err.response?.data?.error || "Error adding game. Please try again."
      );
    }
  };

  const getTeamName = (teamID) => {
    const team = teams.find((t) => t.TeamID === parseInt(teamID));
    return team ? team.TeamName : "";
  };

  return (
    <Card sx={{ maxWidth: 500, margin: "20px auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Schedule New Game
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Date & Time"
            type="datetime-local"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            select
            label="Team 1"
            value={team1ID}
            onChange={(e) => setTeam1ID(e.target.value)}
            required
            sx={{ mb: 2 }}
          >
            {teams.map((team) => (
              <MenuItem key={team.TeamID} value={team.TeamID}>
                {team.TeamName} (Captain: {team.Cusername})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Team 2"
            value={team2ID}
            onChange={(e) => setTeam2ID(e.target.value)}
            required
            sx={{ mb: 2 }}
          >
            {teams.map((team) => (
              <MenuItem key={team.TeamID} value={team.TeamID}>
                {team.TeamName} (Captain: {team.Cusername})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Winner (Optional)"
            value={winnerTeamID}
            onChange={(e) => setWinnerTeamID(e.target.value)}
            helperText="Leave empty if game hasn't been played yet"
            sx={{ mb: 2 }}
          >
            <MenuItem value="">
              <em>No winner yet</em>
            </MenuItem>
            {team1ID && (
              <MenuItem value={team1ID}>{getTeamName(team1ID)}</MenuItem>
            )}
            {team2ID && (
              <MenuItem value={team2ID}>{getTeamName(team2ID)}</MenuItem>
            )}
          </TextField>

          <Button variant="contained" type="submit" fullWidth>
            Schedule Game
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/")}
            fullWidth
            sx={{ mt: 1 }}
          >
            Cancel
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
