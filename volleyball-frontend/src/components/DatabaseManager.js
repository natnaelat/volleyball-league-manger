import { Person } from "@mui/icons-material"
import { Button, Card, CardContent, Typography } from "@mui/material"


export const DatabaseManager = (props) => {
    const {players, onAddClick, onRemoveClick} = props;
    return (
        <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Players ({players.length})
                </Typography>
                <Button onClick={onAddClick}>Add Player</Button>
                <Button onClick={onRemoveClick}>Remove Player</Button>
                {players.map(player => (
                  <Card key={player.Username} variant="outlined" sx={{ mb: 1 }}>
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body1">
                        {player.Name} - Points: {player.Points}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
    )
}