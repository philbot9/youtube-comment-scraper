var http = require('http');
var dispatcher = require('httpdispatcher');
var render = require('./lib/render-template');
var debug = require('debug')('youtube-comment-scraper');
var routes = require('./routes/routes');

var server = http.createServer(function (req, res) {
  console.log(req.method + ' ' + req.url);
  try {
    dispatcher.dispatch(req, res);
  } catch(err) {
    console.error(err);
  }
});

dispatcher.setStatic('static');
dispatcher.setStaticDirname('.');
dispatcher.onGet('/', routes.index);
dispatcher.onGet('/stats', routes.stats);
dispatcher.onGet('/stats-api', routes.stats_api);
dispatcher.onPost('/scrape', routes.scrape);
dispatcher.onPost('/api', routes.api);

dispatcher.onError(function(req, res) {
  render(res, 404, 'error', {
    'title': '404 - Not Found',
    'message': 'Whoops! Couldn\'t find what you were looking for here.'
  });
});

server.listen(8080, function () {
  console.log('Server listening on port 8080');
});
