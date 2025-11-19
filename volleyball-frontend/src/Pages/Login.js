import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";

function Login({ onLogin, onNavigateToSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setError(""); // Clear any previous errors

    fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.userType) {
          onLogin(data.userType, data.user);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("Login failed");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        setError("Login failed - server error");
      });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              🏐 Volleyball League Login
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

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              size="large"
            >
              Login
            </Button>

            <Divider sx={{ my: 3 }}>OR</Divider>

            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
              Don't have an account?
            </Typography>

            <Button
              fullWidth
              variant="outlined"
              onClick={onNavigateToSignup}
              size="large"
            >
              Sign Up as Player
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;
