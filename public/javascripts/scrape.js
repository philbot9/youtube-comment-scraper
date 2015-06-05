var API_URL = 'http://localhost:3000/api/';
var totalCommentCount;
var fetchedCount = 0;
var commentPages = [];

var li = '<li><i id="{{id}}" class="fa-li fa fa-circle-o-notch fa-spin"></i>{{text}}</li>';

$(document).ready(function() {
  var videoID = $('#videoID').val();
  if(!videoID) return alert('No valid Video ID found.');
  console.log(videoID);
  scrapeComments(videoID);
});

function addDetailItem(id, text) {
  $(li.replace('{{text}}', text).replace('{{id}}', id))
    .hide().appendTo('#detail-list').show('slow');
}
function setItemCompleted(id) {
  $('#' + id).attr('class', 'fa-li fa fa-check-circle-o');
}

function scrapeComments(videoID) {
  addDetailItem('i-fetch-details', 'Fetching video details');
  fetchComments(videoID);
}

function fetchComments(videoID) {
  fetch();
  function fetch(pageToken) {
    fetchCommentPage(videoID, pageToken, function(err, commentPage) {
      if(err) {
        alert('Sorry, but we\'ve run into a problem. Please try again.', 'Error');
      }
      
      if(!totalCommentCount) {
        totalCommentCount = commentPage.videoCommentCount;
        setItemCompleted('i-fetch-details');
        addDetailItem('i-scrape-comments', 'Scraping ' + totalCommentCount + ' comments');
      } 

      fetchedCount += commentPage.comments.reduce(function(total, comment) {
        var replies = comment.hasReplies ? comment.replies.length : 0;
        return total + 1 + replies; 
      }, 0);

      commentPages.push(commentPage);
      updateProgressBar();
      
      if(commentPage.nextPageToken) {
        fetch(commentPage.nextPageToken);
      } else {
        setItemCompleted('i-scrape-comments');
        addDetailItem('i-process-results', 'Processing results');    
        updateProgressBar(100);
        displayResults();
      }
    });
  }
}

function updateProgressBar(percentage) {
  percentage = percentage || Math.ceil((100 / totalCommentCount) * fetchedCount);
  percentage = percentage <= 100 ? percentage : 100;
  
  if(percentage < 99) {
    $('.progress-bar').attr('aria-valuenow', percentage).attr('style', 'width: ' + percentage + '%');
    $('.progress-bar').text(fetchedCount + ' / ' + totalCommentCount);
  } else {
    $('.progress-bar').attr('aria-valuenow', 100).attr('style', 'width: 100%');
    $('.progress-bar').text('Done!');
    $('.progress').attr('class', 'progress');
  }
}

function fetchCommentPage(videoID, pageToken, callback) {
  var data = {
    'videoID': videoID
  };
  if(pageToken) {
    data['pageToken'] = pageToken;
  }

  $.ajax({
    type: "POST",
    accepts: 'json',
    url: API_URL,
    data: data,
    success: successHandler,
    error: errorHandler,
  });

  function successHandler(data, status, xhr) {
    callback(null, data);
  }

  function errorHandler(xhr, status, error) {
    callback(new Error('Status: ' + status + '\n' + error));
  }
}

function displayResults() {
  $('#result-container').show(400);
  $('#json-result-text').text(buildJSONResult());
  
  setItemCompleted('i-process-results');
  addDetailItem('i-done', 'Done!');
  setItemCompleted('i-done');
}

function buildJSONResult() {
  return JSON.stringify(buildResultArray(), null, 4);
}

function buildResultArray() {
  return commentPages.reduce(function(comments, page) {
    if(comments.length) {
      //look for any overlap and remove
      for(var i = 0; i < 20; i++) {
    		if(comments[comments.length - 1 - i].id === page.comments[0].id) {
    			page.comments.splice(0, 1);
        } else {
    			break;
        }
      }
  	}
    return comments.concat(page.comments);
  }, []);
}
