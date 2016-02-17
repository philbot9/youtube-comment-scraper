var pmongo = require('promised-mongo')
var moment = require('moment')
var sanitize = require('mongo-sanitize')
var fetchVideoInfo = require('youtube-info')
var debug = require('debug')('scrape-logger')

module.exports = function (videoID) {
  if (!videoID) return
  videoID = sanitize(videoID)
  debug('logging %s', videoID)

  // mongo defined in hosts file by docker when linking mongo container
  var db = pmongo('mongodb://mongo:27017/youtube-comment-scraper', ['scrapes'])

  return fetchVideoInfo(videoID).then(function (videoInfo) {
    return db.scrapes.save({
      'timestamp': moment().valueOf(),
      'videoID': videoInfo.videoId,
      'title': videoInfo.title,
      'url': videoInfo.url,
      'commentCount': videoInfo.commentCount,
      'genre': videoInfo.genre
    })
  }).catch(function (err) {
    debug(err)
    console.error('Fetching video info for ' + videoID + ' failed. Skipping log.')
    return
  })
}
