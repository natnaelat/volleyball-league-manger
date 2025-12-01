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

export const AddAdmin = () => {
  const navigate = useNavigate();
  const [ausername, setAusername] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    console.log("Submitting admin:");
    console.log("Ausername:", ausername);
    console.log("Name:", name);

    try {
      await axios.post("http://localhost:3001/api/admins", {
        Ausername: ausername,
        Name: name,
      });

      setSuccess(true);

      // Navigate back to admin dashboard after 1.5 seconds
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("Failed to add admin:", err);
      console.error("Error response:", err.response?.data);

      const errorMessage = err.response?.data?.error || "Error adding admin";
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate("/", { replace: true });
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "20px auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Admin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Admin added successfully! Redirecting...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Admin Username"
            value={ausername}
            onChange={(e) => setAusername(e.target.value)}
            required
            helperText="Unique username for the admin"
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
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={success}
            >
              Add Admin
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
          Default password: admin123 (can be changed after login)
        </Typography>
      </CardContent>
    </Card>
  );
};
