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

export const AddAdmin = () => {
  const navigate = useNavigate();
  const [ausername, setAusername] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Submitting admin:");
    console.log("Ausername:", ausername);
    console.log("Name:", name);

    try {
      await axios.post("http://localhost:3001/api/admins", {
        Ausername: ausername,
        Name: name,
      });

      // Navigate back to home page
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to add admin:", err);
      console.error("Error response:", err.response?.data);

      const errorMessage = err.response?.data?.error || "Error adding admin";
      setError(errorMessage);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "20px auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add New Admin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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
          />
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button variant="contained" type="submit" fullWidth>
            Add Admin
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
