import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";

function Signup({ onSignupSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    bdate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    setError(""); // Clear errors when user types
  };

  const handleSignup = () => {
    // Validation
    if (
      !formData.username ||
      !formData.name ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");

    // Send signup request
    fetch("http://localhost:3001/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        name: formData.name,
        password: formData.password,
        bdate: formData.bdate || null,
        points: 0,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess("Account created successfully! Redirecting to login...");
          setTimeout(() => {
            onSignupSuccess();
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("Signup error:", err);
        setError("Signup failed - server error");
      });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              🏐 Player Sign Up
            </Typography>

            {error && (
              <Typography
                color="error"
                align="center"
                sx={{ mb: 2, p: 1, bgcolor: "#ffebee", borderRadius: 1 }}
              >
                {error}
              </Typography>
            )}

            {success && (
              <Typography
                color="success.main"
                align="center"
                sx={{ mb: 2, p: 1, bgcolor: "#e8f5e9", borderRadius: 1 }}
              >
                {success}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Username *"
              value={formData.username}
              onChange={handleChange("username")}
              sx={{ mb: 2 }}
              helperText="This will be your login username"
            />

            <TextField
              fullWidth
              label="Full Name *"
              value={formData.name}
              onChange={handleChange("name")}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Birthdate"
              type="date"
              value={formData.bdate}
              onChange={handleChange("bdate")}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password *"
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              sx={{ mb: 2 }}
              helperText="At least 6 characters"
            />

            <TextField
              fullWidth
              label="Confirm Password *"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSignup}
              size="large"
              sx={{ mb: 2 }}
            >
              Create Account
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={onBackToLogin}
              size="medium"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Signup;
