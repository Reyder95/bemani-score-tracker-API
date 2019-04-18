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
  const page = parseInt(req.query.p);
  const entries = parseInt(req.query.e);

  if (page) {
    pool.query('SELECT * FROM users ORDER BY id ASC OFFSET $1 LIMIT $2', [((page-1)*entries), entries], (error, results) => {
    genericGetResponse(error, results, res);
    });
  } else {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) =>{
    genericGetResponse(error, results, res);
    });
  }
}

const getUserById = (req, res) => {
    const uid = parseInt(req.params.uid);

    pool.query('SELECT * FROM users WHERE id = $1', [uid], (error, results) => {
      genericGetResponse(error, results, res);
    });
}

const createUser = (req, res) => {
  let {username, password, email, bio, location} = req.body;

  if (!!!bio)
    bio = "";

  bcrypt.hash(password, saltRounds, function(err, hash) {
    pool.query('INSERT INTO users (username, password, email, bio, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
              [username, hash, email, bio, location],
              (error, results) => {
      if (error)
        res.status(500).json(error);
      else
        res.status(201).send(`User added with ID: ${results.rows[0].id}`);
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
  const page = parseInt(req.query.p);
  const entries = parseInt(req.query.e);

  if (page) {
    pool.query('SELECT s.* FROM songs AS s, songcollections AS sc, incollections AS ic WHERE sc.id = ic.collectionsid_fk AND s.id = ic.songsid_fk AND sc.id = $1 OFFSET $2 LIMIT $3', [cid, ((page-1)*entries), entries], (error, results) => {
      genericGetResponse(error, results, res);
    });
  } else {
    pool.query('SELECT s.* FROM songs AS s, songcollections AS sc, incollections AS ic WHERE sc.id = ic.collectionsid_fk AND s.id = ic.songsid_fk AND sc.id = $1', [cid], (error, results) => {
      genericGetResponse(error, results, res);
    });
  }
}

const getAllCollectionsByUser = (req, res) => {
  const uid = parseInt(req.params.uid);

  const query = 'SELECT * FROM songcollections WHERE userid_fk = $1';

  pool.query(query, [uid], (error, results) => {
    genericGetResponse(error, results, res);
  });
}

const getSongs = (req, res) => {
  const page = parseInt(req.query.p);
  const entries = parseInt(req.query.e);

  if (page) {
    pool.query('SELECT * FROM songs ORDER BY id ASC OFFSET $1 LIMIT $2', [((page-1)*entries), entries], (error, results) => {
    genericGetResponse(error, results, res);
    });
  } else {
    pool.query('SELECT * FROM songs ORDER BY id ASC', (error, results) =>{
    genericGetResponse(error, results, res);
    });
  }
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

const getScores = (req, res) => {
  pool.query('SELECT * FROM scores ORDER BY score DESC', (error, results) =>{
    genericGetResponse(error, results, res);
  });
}

const getScoresByChartId = (req, res) => {
  const chid = parseInt(req.params.chid);

  const query='SELECT * FROM scores WHERE chartid_fk = $1 ORDER BY score DESC'

  pool.query(query, [chid], (error, results) =>{
    genericGetResponse(error, results, res);
  });
}

const uploadScore = (req, res) => {
  const {score, location, userid_fk, chartid_fk, grade, clearpercent, clearlamp} = req.body;

  pool.query('INSERT INTO scores (score, location, userid_fk, chartid_fk, grade, clearpercent, clearlamp) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [score, location, userid_fk, chartid_fk, grade, clearpercent, clearlamp],
            (error, results) => {
    if (error)
    {
      res.status(400).json({
        message: "Format error"
      });
    }
    else
      res.status(200).send(`Score added with ID: ${results.insertId}`);
  });
}

const getGoals = (req, res) => {
  const page = parseInt(req.query.p);
  const entries = parseInt(req.query.e);

  if (page) {
    pool.query('SELECT * FROM goals ORDER BY id ASC OFFSET $1 LIMIT $2', [((page-1)*entries), entries], (error, results) => {
    genericGetResponse(error, results, res);
    });
  } else {
    pool.query('SELECT * FROM goals ORDER BY id ASC', (error, results) =>{
    genericGetResponse(error, results, res);
    });
  }
}

const getGoalsByUser = (req, res) => {
  const uid = parseInt(req.params.uid);

  pool.query('SELECT * FROM goals WHERE userid_fk = $1 ORDER BY id ASC', [uid], (error, results) =>{
    genericGetResponse(error, results, res);
  });
}

const getGoalsByStatus = (req, res) => {
  const status = req.params.status;

  pool.query('SELECT * FROM goals WHERE status = $1 ORDER BY id ASC', [status], (error, results) =>{
    genericGetResponse(error, results, res);
  });
}

const createCollection = (req, res) => {
  const {collectionname, description, userid_fk, gameid_fk} = req.body;

  pool.query('INSERT INTO users (collectionname, description, userid_fk, gameid_fk) VALUES ($1, $2, $3, $4,)',
            [collectionname, description, userid_fk, gameid_fk],
            (error, results) => {
    if (error)
    {
      res.status(400).json({
        message: "Format error"
      });
    }
    else
      res.status(200).send(`Collection added with ID: ${results.insertId}`);
  });
}

const getScoresByChartIdAndUser = (req, res) => {
  const chid = parseInt(req.params.chid);
  const uid = parseInt(req.params.uid);

  const query='SELECT * FROM scores WHERE chartid_fk = $1 AND userid_fk = $2 ORDER BY score DESC';

  pool.query(query, [chid, uid], (error, results) =>{
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
  getScores,
  getScoresByChartId,
  uploadScore,
  getGoals,
  getGoalsByUser,
  getGoalsByStatus,
  createCollection,
  getScoresByChartIdAndUser
}
