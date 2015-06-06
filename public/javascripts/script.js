$(document).ready(function() {
  $('#scrape-form').submit(submitScrapeForm);
});

function submitScrapeForm(e) {
  var ytUrl = $('#yt-url').val();
  if(!ytUrl) return false;
  
  var videoID = extractVideoID(ytUrl);
  if(!videoID) {
    alert('Invalid Youtube URL.'); 
    e.preventDefault();
  }
  
  $(this).append('<input value="' + videoID + '" name="videoID" id="videoID" class="hidden">');
  console.log($(this));
}

function extractVideoID(url) {
  if(!url || !url.length || typeof url != 'string')
    return false;
  
  var m = /(?:http[s]?:\/\/)?(?:www\.)?youtube\.\w{2,3}\/watch\?v=(.+)/i.exec(url);
  if(!m || m.length < 1)
    return false;
  
  return m[1];
}
