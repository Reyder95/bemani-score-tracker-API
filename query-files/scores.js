/*
  A file for use with the API. Focuses primarily on score-based endpoints,
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

const uploadScore = (req, res) => {
  const {score, location, userid_fk, chartid_fk, grade, clearpercent, clearlamp} = req.body;

  const query = 'INSERT INTO scores ' +
  '(score, location, userid_fk, chartid_fk, grade, clearpercent, clearlamp)' +
  'VALUES ($1, $2, $3, $4, $5, $6, $7)';

  pool.query(query,
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

module.exports = {
  getScoresByChartAndUserId,
  uploadScore
}
