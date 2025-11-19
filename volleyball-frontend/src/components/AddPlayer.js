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
  Box,
} from "@mui/material";

export const AddPlayer = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bdate, setBdate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      await axios.post("http://localhost:3001/api/players", {
        username,
        name,
        bdate,
        points: 0,
      });

      setSuccess(true);

      // Navigate back to admin dashboard after 1.5 seconds
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("Failed to add player:", err);
      setError(err.response?.data?.error || "Failed to add player");
    }
  };

  const handleCancel = () => {
    navigate("/", { replace: true });
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "20px auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Player
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Player added successfully! Redirecting...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{ mb: 2 }}
            disabled={success}
          />
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
            disabled={success}
          />
          <TextField
            fullWidth
            label="Birthdate"
            type="date"
            value={bdate}
            onChange={(e) => setBdate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            disabled={success}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={success}
            >
              Add Player
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              fullWidth
              disabled={success}
            >
              Cancel
            </Button>
          </Box>
        </form>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
          Default password: player123 (can be changed after login)
        </Typography>
      </CardContent>
    </Card>
  );
};
