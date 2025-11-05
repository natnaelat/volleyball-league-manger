import React, { useState } from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminPage } from "./Pages/Admin/AdminPage";
import { AddPlayer } from "./components/AddPlayer";
import { AddTeam } from "./components/AddTeam";
import { AddGame } from "./components/AddGame";
import { AddAdmin } from "./components/AddAdmin";
import { AddLocation } from "./components/AddLocation";
import { AddScore } from "./components/AddScore";
import Login from "./Pages/Login";
import PlayerDashboard from "./Pages/Player/PlayerDashboard";

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
                <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                  <Button onClick={handleLogout} variant="outlined">Logout</Button>
                </Box>
                {/* AdminPage handles all entities */}
                <AdminPage onLogout={handleLogout}/>
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


