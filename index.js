var http = require('http');
var dispatcher = require('httpdispatcher');
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
dispatcher.onPost('/scrape', routes.scrape);
dispatcher.onPost('/api', routes.api);

server.listen(8080, function () {
  console.log('Server listening on port 8080');
});
