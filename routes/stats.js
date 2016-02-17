var render = require('../lib/render-template')

module.exports = function (req, res) {
  render(res, 200, 'stats')
}
