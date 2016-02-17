var querystring = require('querystring')
var render = require('../lib/render-template')
var logScrape = require('../lib/scrape-logger')

module.exports = function (req, res) {
  var requestBody
  if (req.body) {
    requestBody = querystring.parse(req.body)
  }

  if (!requestBody.videoID) {
    return render(res, 403, 'error', {
      'title': 'Invalid YouTube URL',
      'message': 'Could not find video ID.'
    })
  }

  var videoID = requestBody.videoID

  if (!videoIdIsValid(videoID)) {
    return render(res, 403, 'error', {
      'title': 'Invalid Video ID',
      'message': 'The video ID is invalid.'
    })
  }

  logScrape(videoID)
  render(res, 200, 'scrape', {
    videoID: requestBody.videoID
  })
}

function videoIdIsValid (videoId) {
  return videoId.length == 11 && /^[a-zA-Z0-9\_\-]+$/.test(videoId)
}
