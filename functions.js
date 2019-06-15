/*
  A simple get response based on the results provided.
  Send in the error, the results, and the response and it'll
  give back what's needed.
*/
function genericGetResponse(error, results, response)
{
  if (error)
    response.status(400).json({
      error: "Database error"
    });
  else
    response.status(200).json(results);
}

module.exports = {
  genericGetResponse
}
