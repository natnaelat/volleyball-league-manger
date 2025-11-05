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
} from "@mui/icons-material";
import { Button, Card, CardContent, Typography, Chip } from "@mui/material";

export const AdminPage = ({ onLogout }) => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [locations, setLocations] = useState([]);
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();

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
              <CardContent
                sx={{
                  py: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1">
                  {player.Name} - Points: {player.Points}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemovePlayer(player.Username)}
                >
                  Remove
                </Button>
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
              <CardContent
                sx={{
                  py: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1">
                  {team.TeamName} (Captain: {team.Cusername})
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveTeam(team.TeamID)}
                >
                  Remove
                </Button>
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
              <CardContent
                sx={{
                  py: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Typography variant="body1">
                    {getTeamName(game.Team1ID)} vs {getTeamName(game.Team2ID)}
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
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveGame(game.Match_ID)}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Admins Section */}
      <Card sx={{ maxWidth: 600, margin: "20px auto" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            <AdminPanelSettings sx={{ mr: 1, verticalAlign: "middle" }} />
            Admins ({admins.length})
          </Typography>
          <Button variant="contained" onClick={handleAddAdmin} sx={{ mb: 2 }}>
            Add Admin
          </Button>
          {admins.map((admin) => (
            <Card key={admin.Ausername} variant="outlined" sx={{ mb: 1 }}>
              <CardContent
                sx={{
                  py: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1">
                  {admin.Name} (@{admin.Ausername})
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveAdmin(admin.Ausername)}
                >
                  Remove
                </Button>
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
              <CardContent
                sx={{
                  py: 1,
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
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveLocation(location.LMatch_ID)}
                >
                  Remove
                </Button>
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
          {scores.map((score) => (
            <Card
              key={`${score.S_MatchID}-${score.SetID}`}
              variant="outlined"
              sx={{ mb: 1 }}
            >
              <CardContent
                sx={{
                  py: 1,
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
                    {getTeamName(score.Losing_TeamID)} ({score.Game_Point} pts)
                  </Typography>
                </div>
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
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </>
  );
};
