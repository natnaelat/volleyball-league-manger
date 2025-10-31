import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, Button } from '@mui/material';
import { Group } from '@mui/icons-material';
import { DatabaseManager } from './components/DatabaseManager';

function App() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error('Error fetching players:', err));

    fetch('http://localhost:3001/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error('Error fetching teams:', err));
  }, []);

  const onAddPlayerClick = () => {
    const name = prompt("Enter player's name:");
    if (name) {
      const points = prompt("Enter player's points:") || 0;
      fetch('http://localhost:3001/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, points: parseInt(points) })
      })
      .then(res => res.json())
      .then(newPlayer => setPlayers([...players, newPlayer]))
      .catch(err => console.error('Error adding player:', err));
    }
  };

  const onRemovePlayerClick = () => {
    const usernameInput = prompt("Enter player's username to remove:");
    if (usernameInput) {
      const username = usernameInput.replace(/\s+/g, '').toLowerCase();
      fetch(`http://localhost:3001/api/players/${encodeURIComponent(username)}`, {
        method: 'DELETE'
      })
      .then(res => {
        if (res.ok) {
          setPlayers(players.filter(player => player.Username !== username));
          console.log('Player removed successfully! With username ' + username);
        } else {
          console.error('Failed to delete player');
        }
      })
      .catch(err => console.error('Error removing player:', err));
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          🏐 Volleyball League Manager
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <DatabaseManager players={players} onAddClick={onAddPlayerClick} onRemoveClick={onRemovePlayerClick}/>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Teams ({teams.length})
                </Typography>
                <Button>Add Team</Button>
                {teams.map(team => (
                  <Card key={team.TeamID} variant="outlined" sx={{ mb: 1 }}>
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body1">
                        {team.TeamName} (Captain: {team.Cusername})
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App;