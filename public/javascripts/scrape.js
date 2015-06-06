var API_URL = '/api';
var totalCommentCount;
var fetchedCount = 0;
var commentPages = [];

$(document).ready(function() {
  var videoID = $('#videoID').val();
  if(!videoID) return alert('No valid Video ID found.');
  scrapeComments(videoID);
});


function addDetailItem(id, text) {
  var li = '<li><i id="{{id}}" class="fa-li fa fa-circle-o-notch fa-spin"></i>{{text}}</li>';
  $(li.replace('{{text}}', text).replace('{{id}}', id))
    .hide().appendTo('#detail-list').show('slow');
}
function setItemCompleted(id) {
  $('#' + id).attr('class', 'fa-li fa fa-check-circle-o');
}

function scrapeComments(videoID) {
  addDetailItem('i-fetch-details', 'Fetching video details');
  fetch();
  
  function fetch(pageToken) {
    fetchCommentPage(videoID, pageToken, function(err, commentPage) {
      if(err) return;
      
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

function displayResults() {
  $('#result-container').attr('class', '');
  $('#result-container').show('slow');
  
  $('#result-container .well :checkbox').on('ifToggled', updateResults);
  updateResults();
  
  setItemCompleted('i-process-results');
  addDetailItem('i-done', 'Done!');
  setItemCompleted('i-done');
}

function getFieldOptions() {
  return jQuery.makeArray($('#result-container .well input:checked')).map(function($elem) {
    return $($elem).val();
  });
}

function updateResults() {
  var fields = getFieldOptions();
  $('#json-result-text').text(buildJSONResult(fields));
  $('#csv-result-text').text(buildCSVResult(fields));
}

function buildJSONResult(fields) {
  return JSON.stringify(buildResultArray(fields), null, 4);
}

function buildCSVResult(fields) {
  var resultArray = buildResultArray(fields);
  resultArray = flattenResultArray(resultArray);
  console.log(JSON.stringify(resultArray));
  return Papa.unparse(JSON.stringify(resultArray));
}

function buildResultArray(fields) {
  if(!fields || !fields.length) return [];
  
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
    
    return comments.concat(page.comments.map(function(comment) {
      var c = {};
      fields.forEach(function(prop) {
        if(prop === 'replies') c['hasReplies'] = comment['hasReplies'];
        if(comment[prop]) c[prop] = comment[prop];
      });
      return c;
    }));
  }, []);
}

function flattenResultArray(resultArray) {
  var output = [];
  var replies = [];
  var props = findProps(resultArray);
  
  resultArray.forEach(function(elem) {
    var obj = {};
    props.forEach(function(prop) {
      obj[prop] = '';
    });
  
    Object.keys(elem).forEach(function(key) {
      if(key === 'replies') {
        
      }
      if(Array.isArray(elem[key])) {
        elem[key].forEach(function(o) {
          Object.keys(o).forEach(function(subKey) {
            obj[key + '.' + subKey] = o[subKey];
          });
        });
      } else {
        obj[key] = elem[key];
      }
    });
    output.push(obj);
  });
  
  return output;
  
  function findProps(arr) {
    var props = {};
    arr.forEach(function(obj) {
      Object.keys(obj).forEach(function(key) {
        if(Array.isArray(obj[key])) {
          findProps(obj[key]).forEach(function(subKey) {
            props[key + '.' + subKey] = true;
          });
        } else {
          props[key] = true;
        }
      });
    });
    return Object.keys(props);
  }
}
