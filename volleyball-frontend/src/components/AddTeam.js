import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

export const AddTeam = ({ fetchTeams }) => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [captain, setCaptain] = useState("");
  const [error, setError] = useState("");

  const testConnection = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/test");
      console.log("Test response:", response.data);
      alert("Backend connected! " + JSON.stringify(response.data));
    } catch (err) {
      console.error("Connection failed:", err);
      alert("Backend connection failed! Check console.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    console.log("Submitting team:");
    console.log("Team Name:", teamName);
    console.log("Captain Username:", captain);

    try {
      const response = await axios.post("http://localhost:3001/api/teams", {
        TeamName: teamName,
        Cusername: captain,
      });

      console.log("Success response:", response.data);

      // Refresh the list of teams
      if (fetchTeams) fetchTeams();

      // Clear the form
      setTeamName("");
      setCaptain("");

      // Navigate back to home page
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to add team:", err);
      console.error("Error response:", err.response?.data);
      console.error("Full error:", err);

      const errorMessage = err.response?.data?.error || "Error adding team";
      setError(`${errorMessage}. Provided username: "${captain}"`);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "20px auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Team
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Captain Username"
            value={captain}
            onChange={(e) => setCaptain(e.target.value)}
            required
            helperText="Enter the exact username of an existing player"
            sx={{ mb: 2 }}
          />
          <Button variant="contained" type="submit" fullWidth>
            Add Team
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
