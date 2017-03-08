var fetchInfo = require('youtube-info')

var cache = {}
var cacheTtl = 1000 * 60 * 10 // 10 minutes

module.exports = function (videoId) {
  if (cache[videoId] && cache[videoId].expires > Date.now()) {
    return Promise.resolve(cache[videoId].data)
  }

  return fetchInfo(videoId)
    .then(function (videoInfo) {
      cache[videoId] = {
        expires: Date.now() + cacheTtl,
        data: videoInfo
      }

      return videoInfo
    })
}
