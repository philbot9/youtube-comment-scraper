var jade = require('jade')
var etag = require('etag')

module.exports = function (res, statusCode, templateName, options) {
  options = options || {}
  options.filename = options.filename || templateName

  var jadeFile = './views/' + templateName.replace(/\.jade$/, '') + '.jade'
  var body
  try {
    body = jade.renderFile(jadeFile, options)
  } catch (e) {
    console.error('500 Error rendering template: %s', e.message)
    res.writeHead(500)
    return res.end()
  }

  res.writeHead(statusCode, {
    'Content-Type': 'text/html',
    'ETag': etag(body)
  })
  res.end(body)
  console.log('[' + statusCode + '] length ' + body.length)
}
