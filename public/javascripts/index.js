function loadPage(event, url) {
  url = url || '/';
  
  if(event && event.state) {
    window.history.popState();
    url = event.state.url;
  }
  
  $.get(url, function(result) {
    var $html = $(result);
    var $newCards = $('.card', $html);
    var $ajaxContainer = $('#ajax-container');
  
    $ajaxContainer.fadeOut(500, function() {
      $ajaxContainer.html($newCards);
      $ajaxContainer.fadeIn(500);
    });
  });
};

window.onpopstate = loadPage;


$(document).ready(function(){
  $('#scrape-form').submit(function(e) {
    e.preventDefault();
    var ytUrl = $('#yt-url').val();
    if(!ytUrl) return false;
    
    var videoID = extractVideoID(ytUrl);
    if(!videoID) {
      alert('Invalid Youtube URL.'); 
      return false;
    }
    
    if(window.history && window.history.pushState) {
      window.history.replaceState({}, document.title, '/scrape/' + videoID);
      loadPage(null, '/scrape/' + videoID);
    }
  });
});

function extractVideoID(url) {
  if(!url || !url.length || typeof url != 'string')
    return false;
  
  var m = /(?:http[s]?:\/\/)?(?:www\.)?youtube\.\w{2,3}\/watch\?v=(.+)/i.exec(url);
  if(!m || m.length < 1)
    return false;
  
  return m[1];
}
