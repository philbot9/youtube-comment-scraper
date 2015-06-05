var express = require('express');
var router = express.Router();

/* GET scrape page. */
router.get('/:videoID', function(req, res, next) {
  res.render('scrape', { 
    title: 'Youtube Comment Scraper',
    videoID: req.params.videoID
  });
});

module.exports = router;
