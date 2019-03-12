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

app.get('/api/users/songs/:uid', db.getAllSongsOwnedByUserId);

app.get('/api/users/collections/:uid', db.getAllCollectionsByUser);

app.get('/api/songs', db.getSongs);

app.get('/api/songs/:sid', db.getSongById);

app.get('/api/games', db.getGames);

app.get('/api/songs/games/:gid', db.getSongsByGame);

app.get('/api/collections', db.getCollections);

app.get('/api/collections/songs/:cid', db.getAllSongsByCollection);

app.post('/api/users', db.createUser);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
