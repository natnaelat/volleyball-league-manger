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

export const AddLocation = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [lMatchID, setLMatchID] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [streetName, setStreetName] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  // Fetch games that don't have locations yet
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/games");
        setGames(res.data);
      } catch (err) {
        console.error("Failed to fetch games:", err);
      }
    };
    fetchGames();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Submitting location:");
    console.log("Match ID:", lMatchID);
    console.log("Name:", name);

    try {
      await axios.post("http://localhost:3001/api/locations", {
        LMatch_ID: lMatchID,
        Name: name,
        State: state,
        StreetName: streetName,
        Zipcode: zipcode,
        City: city,
      });

      // Navigate back to home page
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to add location:", err);
      console.error("Error response:", err.response?.data);

      const errorMessage = err.response?.data?.error || "Error adding location";
      setError(errorMessage);
    }
  };

  const formatGameDisplay = (game) => {
    const date = new Date(game.Time_Slot);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `Match ${game.Match_ID} - ${formattedDate}`;
  };

  return (
    <Card sx={{ maxWidth: 500, margin: "20px auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add Game Location
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
            value={lMatchID}
            onChange={(e) => setLMatchID(e.target.value)}
            required
            helperText="Choose which game this location is for"
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
            label="Venue Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Central Sports Arena"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Street Address"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            required
            placeholder="e.g., 123 Main St"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="e.g., Los Angeles"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            placeholder="e.g., California"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Zipcode"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            required
            placeholder="e.g., 90001"
            sx={{ mb: 2 }}
          />

          <Button variant="contained" type="submit" fullWidth>
            Add Location
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
