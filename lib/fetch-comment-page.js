/*
 * Compatibility layer to provide the same results youtube-comment-api
 * used to provide.
 */

var fetchVideoComments = require('youtube-comments-task')
var fetchInfo = require('./fetch-video-info')

module.exports = function (videoId, pageToken) {
  return Promise.all([
    fetchInfo(videoId),
    fetchComments(videoId, pageToken)
  ])
    .then(function (results) {
      var info = results[0]
      var page = results[1]

      if (!page) {
        throw new Error('No comment page received.')
      }

      var comments = page.comments || []
      var nextPageToken = page.nextPageToken

      var compatComments = comments
        .map(compatComment)
        .map(function (c) {
          var replies = c.hasReplies ? c.replies.map(compatComment) : null
          return replies ? Object.assign({}, c, { replies: replies }) : c
        })

      // build the response
      return {
        comments: compatComments,
        nextPageToken: nextPageToken,
        pageToken: pageToken,
        videoCommentCount: info.commentCount,
        videoTitle: info.title,
        videoThumbnail: info.thumbnailUrl
      }
    })
}

function fetchComments (videoId, pageToken) {
  return new Promise(function (res, rej) {
    fetchVideoComments(videoId, pageToken)
      .fork(rej, res)
  })
}

function compatComment (c) {
  const compat = {
    id: c.id,
    user: c.author,
    date: c.time,
    commentText: c.text,
    timestamp: c.timestamp,
    likes: c.likes
  }

  // return as-is if it's a reply
  if (c.hasReplies == null) {
    return compat
  }

  compat.hasReplies = c.hasReplies
  if (c.hasReplies) {
    compat.numberOfReplies = c.numReplies
    compat.replies = c.replies
  }

  return compat
}
