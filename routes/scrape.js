var querystring = require('querystring');
var render = require('../lib/render-template');

module.exports = function (req, res) {
  var requestBody;
  if(req.body) {
    requestBody = querystring.parse(req.body);
  }

  if(!requestBody.videoID) {
    return render(res, 403, 'error', {
      'message': 'Invalid form received: Could not find a video ID.'
    });
  }
  render(res, 200, 'scrape', {
    videoID: requestBody.videoID
  });
};
