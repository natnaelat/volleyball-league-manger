import React, { useState } from 'react';
import { Container, Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (!username) return;
    
    fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
    .then(res => res.json())
    .then(data => {
      if (data.userType) {
        onLogin(data.userType, data.user);
      } else {
        alert('User not found');
      }
    })
    .catch(err => {
      console.error('Login error:', err);
      alert('Login failed');
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
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 3 }}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              size="large"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;