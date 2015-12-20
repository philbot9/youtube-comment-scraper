var moment = require('moment');
var _ = require('lodash');
var debug = require('debug')('stats-api');
var getScrapeHistory = require('../lib/scrape-history');

module.exports = function (req, res) {
  getScrapeHistory().then(function(scrapes) {
    debug('Scrape history retrieved: %d', scrapes.length);

    var oneDayAgo = moment().subtract(1, 'day').valueOf();
    var oneWeekAgo = moment().subtract(1, 'week').valueOf();
    var oneMonthAgo = moment().subtract(1, 'month').valueOf();

    var commentCountDay = 0;
    var commentCountWeek = 0;
    var commentCountMonth = 0;
    var commentCountTotal = 0;
    var videoCountDay = 0;
    var videoCountWeek = 0;
    var videoCountMonth = 0;
    var videoCountTotal = 0;

    for (var i = 0; i < scrapes.length; i++) {
      var scrape = scrapes[i];
      commentCountDay += scrape.timestamp > oneDayAgo ? scrape.commentCount : 0;
      commentCountWeek += scrape.timestamp > oneWeekAgo ? scrape.commentCount : 0;
      commentCountMonth += scrape.timestamp > oneMonthAgo ? scrape.commentCount : 0;
      commentCountTotal += scrape.commentCount;
      videoCountDay += scrape.timestamp > oneDayAgo ? 1 : 0;
      videoCountWeek += scrape.timestamp > oneWeekAgo ? 1 : 0;
      videoCountMonth += scrape.timestamp > oneMonthAgo ? 1 : 0;
      videoCountTotal++;
    }

    var topVideos = [];
    _.forIn(_.groupBy(scrapes, 'videoID'), function (videoScrapes) {
      var video = videoScrapes[0];
      topVideos.push({
        scrapes: videoScrapes.length,
        comments: video.commentCount,
        title: video.title,
        url: video.url,
      });

      // limit to 50 videos
      return topVideos.length <= 50;
    });

    var body = JSON.stringify({
      commentCountDay: commentCountDay,
      commentCountWeek: commentCountWeek,
      commentCountMonth: commentCountMonth,
      commentCountTotal: commentCountTotal,
      videoCountDay: videoCountDay,
      videoCountWeek: videoCountWeek,
      videoCountMonth: videoCountMonth,
      videoCountTotal: videoCountTotal,
      topVideos: _.sortByOrder(topVideos, ['scrapes', 'comments'], ['desc', 'desc'])
    });

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(body);

    console.log('[' + statusCode + '] length ' + body.length);
  });
};
