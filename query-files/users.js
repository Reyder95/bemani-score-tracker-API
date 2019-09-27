/*
  A file for use with the API. Focuses primarily on user-based endpoints,
  and will only deal with such.
*/

const functions = require('..//functions.js');

// Importing various modules for use in code
const Pool = require('pg').Pool;  // PostgreSQL Integration
const bcrypt = require('bcrypt'); // Cryptography for password encryption
const linq = require('linqjs');   // The ability to use queries on arrays (specifically JSON arrays for us)

// Creating a new Postgre connection using the connection information in 'connection.json'
const pool = new Pool(require('../connection.json'));
const saltRounds = 10;  // Salt Rounds for bcrypt

const createUser = (req, res) => {
  let {username, password, email, bio, location} = req.body;

  if (!!!bio)
    bio = "";
  const query = 'INSERT INTO users (username, password, email, bio, location) VALUES ($1, $2, $3, $4, $5) RETURNING *';

  bcrypt.hash(password, saltRounds, function(err, hash) {
    pool.query(query, [username, hash, email, bio, location], (error, results) => {
      if (error)
        res.status(500).json(error);
      else
        res.status(201).send(`User added with ID: ${results.rows[0].id}`);
    });
  });
}

module.exports = {
  createUser
}
