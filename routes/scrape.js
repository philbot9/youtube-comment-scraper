var querystring = require('querystring');
var render = require('../lib/render-template');
var logScrape = require('../lib/scrape-logger');

module.exports = function (req, res) {
  var requestBody;
  if (req.body) {
    requestBody = querystring.parse(req.body);
  }

  if (!requestBody.videoID) {
    return render(res, 403, 'error', {
      'message': 'Invalid form received: Could not find a video ID.'
    });
  }

  var videoID = requestBody.videoID;

  if (!videoIdIsValid(videoID)) {
    return render(res, 403, 'error', {
      'message': 'Invalid video ID.'
    });
  }

  logScrape(videoID);
  render(res, 200, 'scrape', {
    videoID: requestBody.videoID
  });
};

function videoIdIsValid(videoId) {
  return videoId.length < 15 && /^[a-zA-Z0-9\_\-]+$/.test(videoId);
}
