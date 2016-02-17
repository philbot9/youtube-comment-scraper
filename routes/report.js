var nodemailer = require('nodemailer')
var render = require('../lib/render-template')

module.exports = function (req, res) {
  // render the form
  if (req.method === 'GET') {
    return render(res, 200, 'report', {
      fields: {
        name: req.params.name || '',
        email: req.params.email || '',
        youtubeUrl: req.params.youtubeUrl || '',
        message: req.params.message || ''
      }
    })
  }

  var requiredFields = ['youtubeUrl', 'issue']
  var params = req.params

  var valid = requiredFields.every(function (requiredField) {
    return params[requiredField]
  })

  var msg = ''
  if (valid) {
    if (!/youtu\.?be(\.com)?/i.test(params.youtubeUrl)) {
      msg = ' Please enter a valid YouTube URL.'
      valid = false
    }
  }

  if (!valid) {
    return render(res, 200, 'report', {
      error: msg || 'Could not submit the issue.',
      fields: params
    })
  }

  var transporter = nodemailer.createTransport('smtps://username%40gmail.com:password@smtp.gmail.com')

  var mailOpts = {
    from: 'Youtube Comment Scraper',
    to: 'receiver_email',
    subject: 'Youtube Comment Scraper issue reported',
    html: [
      '<h2>Issue reported</h2>',
      '<p><strong>Name:</strong> ' + (params.name || '<em>unknown</em>') + '</p>',
      '<p><strong>Email:</strong> ' + (params.email || '<em>unknown</em>') + '</p>',
      '<p><strong>Youtube URL:</strong> <a href = "' + params.youtubeUrl + '">' + params.youtubeUrl + '</a></p>',
      '<p><strong>Issue:</strong> ' + params.issue,
      '<p><strong>Message:</strong><br>' + (params.message || '<em>empty</em>') + '<p>'
    ].join('\n'),
    text: [
      'Issue reported',
      'Name: ' + (params.name || 'unknown'),
      'Email: ' + (params.email || 'unknown'),
      'Youtube URL: ' + params.youtubeUrl,
      'Issue: ' + params.issue,
      'Message: ' + (params.message || 'empty')
    ].join('\n\n')
  }

  transporter.sendMail(mailOpts, function (err, response) {
    if (err) {
      console.error('Error sending email: ', err)
      return render(res, 200, 'report', {
        error: 'Could not send the issue. Please try again later.',
        fields: params
      })
    }

    console.log('Email sent:', JSON.stringify(mailOpts, null, 2))
    // render the notification
    return render(res, 200, 'report', {
      success: "Thank you for submitting the issue. I'll look into it ASAP."
    })
  })
}
