import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, Button } from '@mui/material';
import { Person, SportsVolleyball } from '@mui/icons-material';

function PlayerDashboard({ user, onLogout }) {
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(err => console.error('Error fetching games:', err));

    fetch('http://localhost:3001/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error('Error fetching teams:', err));
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Welcome, {user.Name}!
          </Typography>
          <Button onClick={onLogout} variant="outlined">Logout</Button>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Your Stats
                </Typography>
                <Typography>Points: {user.Points}</Typography>
                <Typography>Username: {user.Username}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <SportsVolleyball sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recent Games
                </Typography>
                {games.slice(0, 5).map(game => {
                  const team1Name = teams.find(t => t.TeamID === game.Team1ID)?.TeamName || `Team ${game.Team1ID}`;
                  const team2Name = teams.find(t => t.TeamID === game.Team2ID)?.TeamName || `Team ${game.Team2ID}`;
                  const winnerName = teams.find(t => t.TeamID === game.WinnerTeamID)?.TeamName || `Team ${game.WinnerTeamID}`;
                  
                  return (
                    <Card key={game.Match_ID} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2">
                          {team1Name} vs {team2Name}<br/>
                          Winner: {winnerName}<br/>
                          Date: {new Date(game.Time_Slot).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default PlayerDashboard;