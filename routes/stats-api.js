var moment = require('moment')
var _ = require('lodash')
var debug = require('debug')('stats-api')
var getScrapeHistory = require('../lib/scrape-history')

module.exports = function (req, res) {
  getScrapeHistory().then(function (scrapes) {
    debug('Scrape history retrieved: %d', scrapes.length)

    var today = moment().startOf('day').valueOf()
    var thisWeek = moment().startOf('week').valueOf()
    var thisMonth = moment().startOf('month').valueOf()

    var commentCountDay = 0
    var commentCountWeek = 0
    var commentCountMonth = 0
    var commentCountTotal = 0
    var videoCountDay = 0
    var videoCountWeek = 0
    var videoCountMonth = 0
    var videoCountTotal = scrapes.length

    for (var i = 0; i < scrapes.length; i++) {
      var scrape = scrapes[i]
      commentCountDay += scrape.timestamp > today ? scrape.commentCount : 0
      commentCountWeek += scrape.timestamp > thisWeek ? scrape.commentCount : 0
      commentCountMonth += scrape.timestamp > thisMonth ? scrape.commentCount : 0
      commentCountTotal += scrape.commentCount
      videoCountDay += scrape.timestamp > today ? 1 : 0
      videoCountWeek += scrape.timestamp > thisWeek ? 1 : 0
      videoCountMonth += scrape.timestamp > thisMonth ? 1 : 0
    }

    // 10 most recent scrapes
    var latestScrapes = scrapes.slice(0, 10).map(function (scrape) {
      return {
        timestamp: scrape.timestamp,
        comments: scrape.commentCount,
        title: scrape.title,
        url: scrape.url
      }
    })


    var transformed = []
    _.forIn(_.groupBy(scrapes, 'videoID'), function (videoScrapes) {
      var video = videoScrapes[videoScrapes.length - 1]
      if (!video) {
        return
      }

      transformed.push({
        scrapes: videoScrapes.length,
        comments: video.commentCount,
        title: video.title,
        url: video.url,
      })
    })

    // sort and limit to top 30 videos
    var topVideos = _.sortByOrder(transformed, ['scrapes', 'comments'], ['desc', 'desc']).slice(0, 30)

    var body = JSON.stringify({
      commentCountDay: commentCountDay,
      commentCountWeek: commentCountWeek,
      commentCountMonth: commentCountMonth,
      commentCountTotal: commentCountTotal,
      videoCountDay: videoCountDay,
      videoCountWeek: videoCountWeek,
      videoCountMonth: videoCountMonth,
      videoCountTotal: videoCountTotal,
      latestScrapes: latestScrapes,
      topVideos: topVideos
    })

    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    res.end(body)

    console.log('[200] length ' + body.length)
  }).catch(function (err) {
    console.error('Retrieving scrape history failed')
    console.error(err)

    res.writeHead(500, {
      'Content-Type': 'application/json'
    })
    res.end({error: '500 - Internal Server Error'})
    console.log('[500] Internal Server Error')
  })
}
