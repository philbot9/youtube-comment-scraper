$(document).ready(function() {
  $.ajax({
    type: 'GET',
    accepts: 'json',
    url: '/stats-api',
    success: displayStats,
    error: errorHandler,
  });

  function errorHandler(xhr, status, error) {
    console.error('Status: ' + status + '\n' + error);
  }
});

function displayStats(stats) {
  // comments scraped
  $('#comment-count-day > .scrape-num').text(formatNumber(stats.commentCountDay));
  $('#comment-count-week > .scrape-num').text(formatNumber(stats.commentCountWeek));
  $('#comment-count-month > .scrape-num').text(formatNumber(stats.commentCountMonth));
  $('#comment-count-total > .scrape-num').text(formatNumber(stats.commentCountTotal));

  // videos scraped
  $('#video-count-day > .scrape-num').text(formatNumber(stats.videoCountDay));
  $('#video-count-week > .scrape-num').text(formatNumber(stats.videoCountWeek));
  $('#video-count-month > .scrape-num').text(formatNumber(stats.videoCountMonth));
  $('#video-count-total > .scrape-num').text(formatNumber(stats.videoCountTotal));

  // top videos
  stats.topVideos.forEach(function (video, index) {
    $('#top-videos > tbody.stat-content').append([
      '<tr>',
      '  <th scope="row" class="text-center">' + (index + 1) + '</th>',
      '  <td>',
      '    <a target="_blank" href="' + video.url + '">' + video.title + '</a>',
      '  </td>',
      '  <td class="text-center">' + generateNumberBadge('primary', video.scrapes) + '</td>',
      '  <td class="text-center">' + generateNumberBadge('warning', video.comments) + '</td>',
      '<tr>'
    ].join('\n'));
  });

  // hide loading placeholders and display stats
  $('.loading').addClass('hidden');
  $('.stat-content').removeClass('hidden');
}

function generateNumberBadge(type, number) {
  return [
    '<div class="badge badge-' + type + '">',
      formatNumber(number),
    '</div>'
  ].join('\n');
}

function formatNumber(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
