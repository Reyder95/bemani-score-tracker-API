const express = require('express');
const bodyParser = require('body-parser');
const db = require('./queries');
const app = express();
const port = 1337;

app.use(bodyParser.json());
app.use (
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (req, res) => {
  res.json({
    info : 'Node.js, Express, and Postgres API'
  });
});

app.get('/api/users', db.getUsers);

app.get('/api/users/:uid', db.getUserById);

app.get('/api/users/:uid/songs', db.getAllSongsOwnedByUserId);

app.get('/api/users/:uid/collections', db.getAllCollectionsByUser);

app.get('/api/songs', db.getSongs);

app.get('/api/songs/:sid', db.getSongById);

app.get('/api/games', db.getGames);

app.get('/api/songs/games/:gid', db.getSongsByGame);

app.get('/api/collections', db.getCollections);

app.get('/api/collections/:cid/songs', db.getAllSongsByCollection);

app.get('/api/scores', db.getScores);

app.get('/api/scores/:chid', db.getScoresByChartId);

app.get('/api/goals', db.getGoals);

app.get('/api/users/:uid/goals', db.getGoalsByUser);

app.get('/api/goals/:status', db.getGoalsByStatus);

app.post('/api/users', db.createUser);

app.post('/api/scores', db.uploadScore);

app.post('/api/collections', db.createCollection);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
