const Pool = require('pg').Pool;
const bcrypt = require('bcrypt');

const pool = new Pool(require("./connection.json"));

const saltRounds = 10;

function genericGetResponse(error, results, response)
{
  if (error)
    response.status(400).json({
      error: "Database error"
    });
  else
    response.status(200).json(results.rows);
}

const getUsers = (req, res) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) =>{
    genericGetResponse(error, results, res);
  });
}

const getUserById = (req, res) => {
    const uid = parseInt(req.params.uid);

    pool.query('SELECT * FROM users WHERE id = $1', [uid], (error, results) => {
      genericGetResponse(error, results, res);
    });
}

const createUser = (req, res) => {
  const {username, password, email, bio, location, profilepicturepath, bannerpicturepath} = req.body;

  bcrypt.hash(password, saltRounds, function(err, hash) {
    pool.query('INSERT INTO users (username, password, email, bio, location, profilepicturepath, bannerpicturepath) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [username, hash, email, bio, location, profilepicturepath, bannerpicturepath],
              (error, results) => {
      if (error)
      {
        res.status(400).json({
          message: "Format error"
        });
      }
      else
        res.status(200).send(`User added with ID: ${results.insertId}`);
    });
  });
}

const getAllSongsOwnedByUserId = (req, res) => {
  const uid = parseInt(req.params.uid);

  const query = 'SELECT DISTINCT s.* FROM songs AS s, songcollections AS sc, incollections AS ic WHERE ic.collectionsid_fk = sc.id AND ic.songsid_fk = s.id AND sc.userid_fk = $1';

  pool.query(query, [uid], (error, results) => {
    genericGetResponse(error, results, res);
  });
}

const getAllSongsByCollection = (req, res) => {
  const cid = parseInt(req.params.cid);

  const query = 'SELECT s.* FROM songs AS s, songcollections AS sc, incollections AS ic WHERE sc.id = ic.collectionsid_fk AND s.id = ic.songsid_fk AND sc.id = $1';

  pool.query(query, [cid], (error, results) => {
    genericGetResponse(error, results, res);
  });
}

const getAllCollectionsByUser = (req, res) => {
  const uid = parseInt(req.params.uid);

  const query = 'SELECT * FROM songcollections WHERE userid_fk = $1';

  pool.query(query, [uid], (error, results) => {
    genericGetResponse(error, results, res);
  });
}

const getSongs = (req, res) => {
  const query = 'SELECT * FROM songs';

  pool.query(query, (error, results) => {
    genericGetResponse(error, results, res);
  });
}

const getSongById = (req, res) => {
  const sid = parseInt(req.params.sid);

  const query = 'SELECT * FROM songs WHERE id = $1';

  pool.query(query, [sid], (error, results) => {
    genericGetResponse(error, results, res);
  });
}

const getGames = (req, res) => {
  const query = 'SELECT * FROM games';

  pool.query(query, (error, results) => {
    genericGetResponse(error, results, res);
  });
}

const getSongsByGame = (req, res) => {
  const gid = parseInt(req.params.gid);

  const query = 'SELECT * FROM songs WHERE gameid_FK = $1';

  pool.query(query, [gid], (error, results) => {
    genericGetResponse(error, results, res);
  });
}

const getCollections = (req, res) => {
  const query = 'SELECT * FROM songcollections';

  pool.query(query, (error, results) => {
    genericGetResponse(error, results, res);
  });
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  getAllSongsOwnedByUserId,
  getAllSongsByCollection,
  getAllCollectionsByUser,
  getSongs,
  getSongById,
  getGames,
  getSongsByGame,
  getCollections,
}
