var pmongo = require('promised-mongo')
var sanitize = require('mongo-sanitize')
var fetchVideoInfo = require('youtube-info')
var debug = require('debug')('scrape-logger')

module.exports = function () {
  debug('retrieving scrape history')

  // mongo defined in hosts file by docker when linking mongo container
  var db = pmongo('mongodb://mongo:27017/youtube-comment-scraper', ['scrapes'])
  return db.scrapes.find().sort({timestamp: -1}).toArray()
}
