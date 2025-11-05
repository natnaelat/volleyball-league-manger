import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

export const AddPlayer = ({ fetchPlayers }) => {
  // <- receive fetchPlayers from App.js
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bdate, setBdate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/players", {
        username,
        name,
        bdate,
        points: 0,
      });

      fetchPlayers(); // <- refresh the player list in App.js
      navigate("/", { replace: true }); // go back to home page
    } catch (err) {
      console.error("Failed to add player:", err);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "20px auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Player
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Birthdate"
            type="date"
            value={bdate}
            onChange={(e) => setBdate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" type="submit" fullWidth>
            Add Player
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
