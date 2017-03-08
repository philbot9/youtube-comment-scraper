$(document).ready(function() {
  $('#scrape-form').submit(submitScrapeForm);
  $('#yt-url').on('input', validateUrl);

  setTimeout(function () {
    var userAgent = navigator.userAgent
    if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      $('#safari-warning').attr('style', '')
    }
  }, 1000)
});

function submitScrapeForm(e) {
  var videoID = validateUrl();
  if (!videoID) {
    return;
  }
  $(this).append('<input value="' + videoID + '" name="videoID" id="videoID" class="hidden">');
}

function validateUrl() {
  var url = $('#yt-url').val();

  if (!url) {
    $('#url-input').removeClass('has-error');
    $('#url-input').removeClass('has-success');
    $('#scrape-btn').prop('disabled', true);
    $('#scrape-btn').removeClass('btn-success');
    return;
  }

  var videoID = extractVideoID(url)
  if (!videoID) {
    $('#url-input').removeClass('has-success');
    $('#url-input').addClass('has-error');
    $('#scrape-btn').prop('disabled', true);
    $('#scrape-btn').removeClass('btn-success');
    return;
  } else {
    $('#url-input').addClass('has-success');
    $('#url-input').removeClass('has-error');
    $('#scrape-btn').prop('disabled', false);
    $('#scrape-btn').addClass('btn-success');
    return videoID;
  }
}

function extractVideoID(url) {
  if (!url || !url.length || typeof url != 'string') {
    return false;
  }
  var videoID;

  var m = /(?:http[s]?:\/\/)?(?:www\.)?youtube\.\w{2,3}\/watch\?.*?v=([^&]+)\&?/i.exec(url);
  if (m && m.length === 2) {
    videoID = m[1];
  } else {
    m = /(?:http[s]?:\/\/)?(?:www\.)?youtu\.be\/([^\?]+)\??/i.exec(url);
    if (m && m.length === 2) {
      videoID = m[1];
    }
  }

  if (videoID && videoID.length === 11) {
    return videoID;
  }

  return false;
}
