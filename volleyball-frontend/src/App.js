import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DatabaseManager } from "./components/DatabaseManager";
import { AddPlayer } from "./components/AddPlayer";
import { AddTeam } from "./components/AddTeam";
import { AddGame } from "./components/AddGame";
import { AddAdmin } from "./components/AddAdmin";
import { AddLocation } from "./components/AddLocation";
import { AddScore } from "./components/AddScore";
import Login from "./Login";
import PlayerDashboard from "./PlayerDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  const handleLogin = (type, userData) => {
    setUserType(type);
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (userType === 'player') {
    return <PlayerDashboard user={user} onLogout={handleLogout} />;
  }

  // Admin view
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <Container maxWidth="lg">
              <Box sx={{ my: 4 }}>
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  align="center"
                >
                  🏐 Admin Dashboard
                </Typography>

                {/* DatabaseManager handles all entities */}
                <DatabaseManager />
              </Box>
            </Container>
          }
        />

        {/* Add Player Page */}
        <Route path="/add-player" element={<AddPlayer />} />

        {/* Add Team Page */}
        <Route path="/add-team" element={<AddTeam />} />

        {/* Add Game Page */}
        <Route path="/add-game" element={<AddGame />} />

        {/* Add Admin Page */}
        <Route path="/add-admin" element={<AddAdmin />} />

        {/* Add Location Page */}
        <Route path="/add-location" element={<AddLocation />} />

        {/* Add Score Page */}
        <Route path="/add-score" element={<AddScore />} />
      </Routes>
    </Router>
  );
}

export default App;


