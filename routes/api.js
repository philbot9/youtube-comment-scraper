var fetchCommentPage = require('youtube-comment-api');
var querystring = require('querystring');
var debug = require('debug')('api');

module.exports = function (req, res) {
  var requestBody;
  if(req.body) {
    requestBody = querystring.parse(req.body);
  }

  if (!requestBody) {
    return respond(400, {error: 'Received an empty request'});
  }

  var videoID = requestBody.videoID;
  if (!videoID) {
   return respond(400, {error: 'Missing field \'videoID\''});
  }

  var pageToken = requestBody.pageToken || null;

  fetchCommentPage(videoID, pageToken).then(function(page) {
    if (!page) {
      return respond(500, {error: 'Internal server error'});
      throw new Error('Did not receive a comment page from comment-pager');
    }
    respond(200, page);
  }).catch(function(error) {
    debug(error);
    respond(500, {error: 'Fetching comment page failed.'});
  });

  function respond (statusCode, result) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json'
    });
    var body = JSON.stringify(result);
    res.end(body);
    console.log('[' + statusCode + '] length ' + body.length);
  }
};
