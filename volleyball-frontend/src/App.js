import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, Button } from '@mui/material';
import { Group, SportsVolleyball } from '@mui/icons-material';
import { DatabaseManager } from './components/DatabaseManager';

function App() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error('Error fetching players:', err));

    fetch('http://localhost:3001/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error('Error fetching teams:', err));

    fetch('http://localhost:3001/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(err => console.error('Error fetching games:', err));
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

  const onAddGameClick = () => {
    const timeSlot = prompt("Enter time slot (YYYY-MM-DD HH:MM:SS):");
    const team1ID = prompt("Enter Team 1 ID:");
    const team2ID = prompt("Enter Team 2 ID:");
    const winnerTeamID = prompt("Enter Winner Team ID:");
    const loserTeamID = prompt("Enter Loser Team ID:");
    
    if (timeSlot && team1ID && team2ID && winnerTeamID && loserTeamID) {
      fetch('http://localhost:3001/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSlot,
          team1ID: parseInt(team1ID),
          team2ID: parseInt(team2ID),
          winnerTeamID: parseInt(winnerTeamID),
          loserTeamID: parseInt(loserTeamID)
        })
      })
      .then(res => res.json())
      .then(newGame => setGames([...games, newGame]))
      .catch(err => console.error('Error adding game:', err));
    }
  };

  const onRemoveGameClick = () => {
    const matchId = prompt("Enter Match ID to remove:");
    if (matchId) {
      fetch(`http://localhost:3001/api/games/${matchId}`, {
        method: 'DELETE'
      })
      .then(res => {
        if (res.ok) {
          setGames(games.filter(game => game.Match_ID !== parseInt(matchId)));
        } else {
          console.error('Failed to delete game');
        }
      })
      .catch(err => console.error('Error removing game:', err));
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          🏐 Volleyball League Manager
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <DatabaseManager players={players} onAddClick={onAddPlayerClick} onRemoveClick={onRemovePlayerClick}/>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Teams ({teams.length})
                </Typography>
                <Button>Add Team</Button>
                {teams.map(team => {
                  const captainName = players.find(p => p.Username === team.Cusername)?.Name || team.Cusername;
                  return (
                    <Card key={team.TeamID} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body1">
                          {team.TeamName} (Captain: {captainName})
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  <SportsVolleyball sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Games ({games.length})
                </Typography>
                <Button onClick={onAddGameClick}>Add Game</Button>
                <Button onClick={onRemoveGameClick} sx={{ ml: 1 }}>Remove Game</Button>
                {games.map(game => {
                  const team1Name = teams.find(t => t.TeamID === game.Team1ID)?.TeamName || `Team ${game.Team1ID}`;
                  const team2Name = teams.find(t => t.TeamID === game.Team2ID)?.TeamName || `Team ${game.Team2ID}`;
                  const winnerName = teams.find(t => t.TeamID === game.WinnerTeamID)?.TeamName || `Team ${game.WinnerTeamID}`;
                  
                  return (
                    <Card key={game.Match_ID} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2">
                          <strong>{team1Name} vs {team2Name}</strong><br/>
                          Winner: {winnerName}<br/>
                          Date: {new Date(game.Time_Slot).toLocaleString()}<br/>
                          Match ID: {game.Match_ID}
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

export default App;