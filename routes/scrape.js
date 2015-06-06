var express = require('express');
var router = express.Router();

/* POST scrape page */
router.post('/', function(req, res, next) {
  if(!req.body.videoID) {
    return res.render('error', {
      'message': 'Invalid form received: Could not find a video ID.',
    });
  }
  res.render('scrape', { 
    videoID: req.body.videoID
  });
});

module.exports = router;
