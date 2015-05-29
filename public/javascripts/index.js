var API_URL = 'http://localhost:3000/api/';

$(document).ready(function(){
  setListeners();
});

function setListeners() {
  $('#scrape-btn').click(scrapeComments);
}

function scrapeComments() {
  var url = $('#yt-url').val();
  if(!url) return;
  
  var videoID = extractVideoID(url);
  if(!videoID) {
    return alert('Invalid Youtube URL.');
  }

  $('#main-content').html('');
  fetchComments(videoID);
}

function extractVideoID(url) {
  if(!url || !url.length || typeof url != 'string')
    return false;
  
  var m = /(?:http[s]?:\/\/)?(?:www\.)?youtube\.\w{2,3}\/watch\?v=(.+)/i.exec(url);
  if(!m || m.length < 1)
    return false;
  
  return m[1];
}

function fetchComments(videoID) {
  fetch();

  console.log(videoID);

  function fetch(pageToken) {
    fetchCommentPage(videoID, pageToken, function(err, commentPage){
      if(err) alert('ERROR! ' + error);

      displayComments(commentPage.comments);

      if(commentPage.nextPageToken) {
        fetch(commentPage.nextPageToken);
      } else {
        console.log('done!');
      }
    });
  }
}

function fetchCommentPage(videoID, pageToken, callback) {
 var data = {
  'videoID': videoID
 };
 if(pageToken)
  data['pageToken'] = pageToken;

  console.log('Sending request...');

  $.ajax({
    type: "POST",
    accepts: 'json',
    url: API_URL,
    data: data,
    success: successHandler,
    error: errorHandler,
  });

  function successHandler(data, status, xhr) {
    console.log(status);
    callback(null, data);
  }

  function errorHandler(xhr, status, error) {
    console.log(status);
    callback(new Error('Status: ' + status + '\n' + error));
  }
}

function displayComments(comments) {
  comments.forEach(function(c) {
    $('#main-content').append('<p>' + c.commentText + '</p>');
  });
  
}