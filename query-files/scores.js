/*
  A file for use with the API. Focuses primarily on song-based endpoints,
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

const getScoresByChartAndUserId = (req, res) => {
  const chid = parseInt(req.query.chid);
  const uid = parseInt(req.query.uid);

  const query = 'SELECT * ' +
  'FROM scores ' +
  'WHERE ' +
    'chartid_fk = $1 ' +
    'AND userid_fk = $2 ' +
  'ORDER BY score DESC;';

  pool.query(query, [chid, uid], (error, results) => {
    functions.genericGetResponse(error, results.rows, res);
  });
}

module.exports = {
  getScoresByChartAndUserId
}
