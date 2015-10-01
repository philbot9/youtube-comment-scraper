var express = require('express');
var router = express.Router();
var fetchCommentPage = require('youtube-comment-api');

// POST comment Page - returns a page of comments including replies
router.post('/', function(req, res, next) {
  if (!req.body) {
    return res.status(400);
  }

  var videoID = req.body.videoID;
  if (!videoID) {
   return res.status(400).json({
      error: 'Missing field \'videoID\''
    });
  }

  var pageToken = req.body.pageToken || null;

  fetchCommentPage(videoID, pageToken).then(function(page) {
    if (!page) {
      throw new Error('Did not receive a comment page from comment-pager');
    }
    res.status(200).json(page);
  }).catch(function(error) {
    res.status(500).json({
      error: 'Fetching comment page failed.'
    });
  });
});

module.exports = router;
