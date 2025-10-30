import React, { useState, useEffect } from 'react';
import './App.css';

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

  return (
    <div className="App">
      <h1>Volleyball League Manager</h1>
      
      <h2>Players ({players.length})</h2>
      <div>
        {players.map(player => (
          <div key={player.Username}>
            {player.Name} - Points: {player.Points}
          </div>
        ))}
      </div>

      <h2>Teams ({teams.length})</h2>
      <div>
        {teams.map(team => (
          <div key={team.TeamID}>
            {team.TeamName} (Captain: {team.Cusername})
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;