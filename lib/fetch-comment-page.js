/*
 * Compatibility layer to provide the same results youtube-comment-api
 * used to provide.
 */

var fetchVideoComments = require('youtube-comments-task')
var fetchInfo = require('./fetch-video-info')

module.exports = function (videoId, pageToken) {
  Promise.all([
    fetchInfo(videoId),
    fetchComments(videoId, pageToken)
  ])
    .then(function (results) {
      var info = results[0]
      var comments = results[1]

      if (!comments) {
        throw new Error('No comments received.')
      }

      var compatComments = comments
        .map(compatComment)
        .map(function (c) {
          var replies = c.hasReplies ? c.replies.map(compatComment) : null
          return replies ? Object.assign({}, c, { replies: replies }) : c
        })

      return Object.assign({}, info, { comments: compatComments })
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
    compat.numReplies = c.numReplies
    compat.replies = c.replies
  }

  return compat
}
