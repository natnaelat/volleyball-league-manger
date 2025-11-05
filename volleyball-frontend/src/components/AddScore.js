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

export const AddScore = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [sMatchID, setSMatchID] = useState("");
  const [setID, setSetID] = useState("");
  const [gamePoint, setGamePoint] = useState("");
  const [losingTeamID, setLosingTeamID] = useState("");
  const [winningTeamID, setWinningTeamID] = useState("");
  const [error, setError] = useState("");

  // Fetch games and teams
  useEffect(() => {
    const fetchData = async () => {
      try {
        const gamesRes = await axios.get("http://localhost:3001/api/games");
        const teamsRes = await axios.get("http://localhost:3001/api/teams");
        setGames(gamesRes.data);
        setTeams(teamsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Submitting score:");
    console.log("Match ID:", sMatchID);
    console.log("Set ID:", setID);
    console.log("Game Point:", gamePoint);

    try {
      await axios.post("http://localhost:3001/api/scores", {
        S_MatchID: sMatchID,
        SetID: setID,
        Game_Point: gamePoint,
        Losing_TeamID: losingTeamID,
        Winning_TeamID: winningTeamID,
      });

      // Navigate back to home page
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to add score:", err);
      console.error("Error response:", err.response?.data);

      const errorMessage = err.response?.data?.error || "Error adding score";
      setError(errorMessage);
    }
  };

  const getTeamName = (teamID) => {
    const team = teams.find((t) => t.TeamID === parseInt(teamID));
    return team ? team.TeamName : `Team ${teamID}`;
  };

  const formatGameDisplay = (game) => {
    const date = new Date(game.Time_Slot);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `Match ${game.Match_ID} - ${formattedDate}`;
  };

  const selectedGame = games.find((g) => g.Match_ID === parseInt(sMatchID));

  return (
    <Card sx={{ maxWidth: 500, margin: "20px auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add Set Score
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            select
            label="Select Game"
            value={sMatchID}
            onChange={(e) => setSMatchID(e.target.value)}
            required
            helperText="Choose which game this score is for"
            sx={{ mb: 2 }}
          >
            {games.map((game) => (
              <MenuItem key={game.Match_ID} value={game.Match_ID}>
                {formatGameDisplay(game)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Set Number"
            type="number"
            value={setID}
            onChange={(e) => setSetID(e.target.value)}
            required
            helperText="Which set is this? (1, 2, 3, etc.)"
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Losing Team Score"
            type="number"
            value={gamePoint}
            onChange={(e) => setGamePoint(e.target.value)}
            required
            helperText="Points scored by the losing team"
            inputProps={{ min: 0 }}
            sx={{ mb: 2 }}
          />

          {selectedGame && (
            <>
              <TextField
                fullWidth
                select
                label="Winning Team"
                value={winningTeamID}
                onChange={(e) => setWinningTeamID(e.target.value)}
                required
                sx={{ mb: 2 }}
              >
                <MenuItem value={selectedGame.Team1ID}>
                  {getTeamName(selectedGame.Team1ID)}
                </MenuItem>
                <MenuItem value={selectedGame.Team2ID}>
                  {getTeamName(selectedGame.Team2ID)}
                </MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="Losing Team"
                value={losingTeamID}
                onChange={(e) => setLosingTeamID(e.target.value)}
                required
                sx={{ mb: 2 }}
              >
                <MenuItem value={selectedGame.Team1ID}>
                  {getTeamName(selectedGame.Team1ID)}
                </MenuItem>
                <MenuItem value={selectedGame.Team2ID}>
                  {getTeamName(selectedGame.Team2ID)}
                </MenuItem>
              </TextField>
            </>
          )}

          <Button variant="contained" type="submit" fullWidth>
            Add Score
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
