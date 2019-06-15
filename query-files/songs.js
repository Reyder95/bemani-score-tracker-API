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

// Endpoint: Gets all the songs that the user requests based on the given parameters.
const getSongs = (req, res) => {

  // All the various parameters a user may add onto the endpoint
  const page = parseInt(req.query.p);     // Page number
  const entries = parseInt(req.query.e);  // Amount of entries per page
  let search = req.query.s;               // Search terms
  const level = parseInt(req.query.l);    // What level to search for
  const game = req.query.g;               // What game to search for within songs

  let query = 'SELECT s.*, json_agg(charts.* ORDER BY charts.level) AS charts ' +
  'FROM songs AS s INNER JOIN charts ON charts.songid_fk = s.id ' +
  "GROUP BY s.id " +
  'ORDER BY s.id ASC;'

  // Query the database for all songs, and the charts within those songs. Give us a json response.
  pool.query(query, (error, results) => {

    let filteredResults = results.rows; // Put the JSON response right into a variable for ease of access.

    // If there is a set of search terms.
    if (search)
    {
      // Bring all those search terms uppercase and split them into an array.
      search = search.toUpperCase().split(' ');

      // Search the JSON array for values that coincide with our search terms (in the artist and title areas)
      filteredResults = filteredResults.where(item =>
        search.some(key => item.artist.toUpperCase().includes(key))
        || search.some(key => item.title.toUpperCase().includes(key))
      );
    }

    // If there is a level that is requested
    if (level)
    {
      // Search through the songs in the JSON and return only songs that have a chart of a given level.
      filteredResults = filteredResults.where(item => item.charts.some(chart => chart.level == level));
    }

    // If a specific game is requested
    if (game)
    {
      // Search the JSON array for if the game matches up. Only display those songs.
      filteredResults = filteredResults.where(item => item.gameversion == game);
    }

    // Slice by page and entries, this gives us the page and entries per page that we need.
    filteredResults = filteredResults.slice((page-1)*entries , ((page-1)*entries) + entries);

    functions.genericGetResponse(error, filteredResults, res);
  });
}

// Get one specific song by the ID of that song.
const getSongById = (req, res) => {
  const sid = parseInt(req.query.id); // The id parameter that gets entered in

  let query = 'SELECT s.*, json_agg(charts.* ORDER BY charts.level) AS charts ' +
  'FROM songs AS s INNER JOIN charts ON charts.songid_fk = s.id ' +
  'WHERE s.id = $1 GROUP BY s.id';

  // Queries the database for the row of that specific id
  pool.query(query, [sid], (error, results) => {
    functions.genericGetResponse(error, results.rows, res);
  });
}

// Get all the songs that a user currently owns
const getSongsOwnedByUserId = (req, res) => {
  const uid = parseInt(req.query.id);
  const page = parseInt(req.query.p);
  const entries = parseInt(req.query.e);
  let search = req.query.s;
  const level = req.query.l;
  const game = req.query.g;

  let query = 'SELECT s.*, json_agg(charts.* ORDER BY charts.level) AS charts ' +
  'FROM songs AS s INNER JOIN charts ON charts.songid_fk = s.id, ' +
  'ownedsongs AS os ' +
  'WHERE ' +
    'userid_fk = $1 ' +
    'AND os.songid_fk = s.id ' +
  'GROUP BY s.id;'

  pool.query(query, [uid], (error, results) => {
    let filteredResults = results.rows; // Put the JSON response right into a variable for ease of access.

    // If there is a set of search terms.
    if (search)
    {
      // Bring all those search terms uppercase and split them into an array.
      search = search.toUpperCase().split(' ');

      // Search the JSON array for values that coincide with our search terms (in the artist and title areas)
      filteredResults = filteredResults.where(item =>
        search.some(key => item.artist.toUpperCase().includes(key))
        || search.some(key => item.title.toUpperCase().includes(key))
      );
    }

    // If there is a level that is requested
    if (level)
    {
      // Search through the songs in the JSON and return only songs that have a chart of a given level.
      filteredResults = filteredResults.where(item => item.charts.some(chart => chart.level == level));
    }

    // If a specific game is requested
    if (game)
    {
      // Search the JSON array for if the game matches up. Only display those songs.
      filteredResults = filteredResults.where(item => item.gameversion == game);
    }

    // Slice by page and entries, this gives us the page and entries per page that we need.
    filteredResults = filteredResults.slice((page-1)*entries , ((page-1)*entries) + entries);


    functions.genericGetResponse(error, filteredResults, res);
  });

}

// Get all the songs within a current collection
const getSongsByCollection = (req, res) => {
  const page = parseInt(req.query.p);     // The page #
  const entries = parseInt(req.query.e);  // The amount of entries per page
  const cid = parseInt(req.query.id);     // The collection ID
  let search = req.query.s;               // Search terms
  const level = parseInt(req.query.l);    // What level to search for
  const game = req.query.g;               // What game to search for within songs


  let query = 'SELECT s.*, json_agg(charts.* ORDER BY charts.level) AS charts ' +
  'FROM songs AS s INNER JOIN charts ON charts.songid_fk = s.id, ' +
  'songcollections AS sc, ' +
  'incollections AS ic, ' +
  'ownedsongs AS os ' +
  'WHERE ' +
    'ic.ownedsongid_fk = os.id ' +
    'AND ic.songcollectionid_fk = sc.id ' +
    'AND os.songid_fk = s.id ' +
    'AND sc.id = $1 ' +
  'GROUP BY s.id;';

  // Querying the db
  pool.query(query, [cid], (error, results) => {
    let filteredResults = results.rows; // Put the JSON response right into a variable for ease of access.

    // If there is a set of search terms.
    if (search)
    {
      // Bring all those search terms uppercase and split them into an array.
      search = search.toUpperCase().split(' ');

      // Search the JSON array for values that coincide with our search terms (in the artist and title areas)
      filteredResults = filteredResults.where(item =>
        search.some(key => item.artist.toUpperCase().includes(key))
        || search.some(key => item.title.toUpperCase().includes(key))
      );
    }

    // If there is a level that is requested
    if (level)
    {
      // Search through the songs in the JSON and return only songs that have a chart of a given level.
      filteredResults = filteredResults.where(item => item.charts.some(chart => chart.level == level));
    }

    // If a specific game is requested
    if (game)
    {
      // Search the JSON array for if the game matches up. Only display those songs.
      filteredResults = filteredResults.where(item => item.gameversion == game);
    }

    // Slice by page and entries, this gives us the page and entries per page that we need.
    filteredResults = filteredResults.slice((page-1)*entries , ((page-1)*entries) + entries);

    functions.genericGetResponse(error, filteredResults, res);
  });
}

const getCollectionsByUser = (req, res) => {
  const uid = parseInt(req.query.id);

  let query = 'SELECT * FROM songcollections AS sc WHERE sc.userid_fk = $1;';

  pool.query(query, [uid], (error, results) => {
    functions.genericGetResponse(error, results.rows, res);
  });
}

// Exporting all these functions
module.exports = {
  getSongs,
  getSongById,
  getSongsOwnedByUserId,
  getSongsByCollection,
  getCollectionsByUser
}

// Get all songs in a specific collection SELECT * FROM songs AS s, songcollections AS sc, incollections AS ic, ownedsongs AS os WHERE ic.ownedsongid_fk = os.id AND ic.songcollectionid_fk = sc.id AND os.songid_fk = s.id AND sc.id = 14;
