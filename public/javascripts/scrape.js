var API_URL = '/youtube-comments-api/';
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
        var replies = comment.replies ? comment.replies.length : 0;
        return total + 1 + replies; 
      }, 0);

      commentPages.push(commentPage);
      updateProgressBar();
      
      if(commentPage.nextPageToken) {
        console.log("Fetching");
        fetch(commentPage.nextPageToken);
      } else {
        console.log("Done!");
        setItemCompleted('i-scrape-comments');
        addDetailItem('i-process-results', 'Processing results');    
        updateProgressBar(100);
        displayResults(videoID);
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

function displayResults(videoID) {
  $('#result-container').attr('class', '');
  $('#result-container').show('slow');
  
  $('#result-container .well :checkbox').on('ifToggled', updateResults);
  updateResults();
  
  setItemCompleted('i-process-results');
  addDetailItem('i-done', 'Done!');
  setItemCompleted('i-done');
  
  $('#save-json').click(function(e) {
    download('comments-' + videoID + '.json', $('#json-result-text').val());
  });
  
  $('#save-csv').click(function(e) {
    download('comments-' + videoID + '.csv', $('#csv-result-text').val());  
  });
}

function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  pom.style.display = 'none';
  document.body.appendChild(pom);

  pom.click();

  document.body.removeChild(pom);
}

function getFieldOptions() {
  return jQuery.makeArray($('#result-container .well input:checked')).map(function($elem) {
    return $($elem).val();
  });
}

function updateResults() {
  var timeoutID = setTimeout(function() {
    console.log('Progress showing');  
    $('.well-progress').fadeIn();
    $('#options-row').css('opacity', '0.4');
    $("#options-row *").attr("disabled", "disabled");
  }, 100);
  console.log('timeoutSet');
  
  setTimeout(function() {
    var fields = getFieldOptions();
    $('#json-result-text').text(buildJSONResult(fields));
    $('#csv-result-text').text(buildCSVResult(fields));
    
    clearTimeout(timeoutID);
    console.log('timeoutCleared');
    $("#options-row *").removeAttr("disabled");
    $('#options-row').css('opacity', '1');
    $('.well-progress').fadeOut();  
  }, 1);
}

function buildJSONResult(fields) {
  return JSON.stringify(buildResultArray(fields), null, 4);
}

function buildCSVResult(fields) {
  var resultArray = buildResultArray(fields);
  resultArray = flattenResultArray(resultArray);
  return Papa.unparse(JSON.stringify(resultArray));
}

function buildResultArray(fields) {
  if(!fields || !fields.length) return [];
  
  return commentPages.reduce(function(comments, page) {
    if(comments.length) {
      //look for any overlap and remove it
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
        if(prop === 'replies') {
          c['hasReplies'] = comment['hasReplies'];
          c['numberOfReplies'] = comment['numberOfReplies'] || 0;
          
          if(comment.replies) {
            c.replies = [];
            comment.replies.forEach(function(reply) {
              var r = {};
              fields.forEach(function(replyProp) {
                r[replyProp] = reply[replyProp];
              });
              c.replies.push(r);
            });
          }
        } else {
          c[prop] = comment[prop] || '';
        }
      });
      return c;
    }));
  }, []);
}

function flattenResultArray(resultArray) {
  var result = [];
  var props = findProps(resultArray);
  
  resultArray.forEach(function(elem) {
    var comment = {};
    props.forEach(function(prop) {
      comment[prop] = '';
    });
    
    Object.keys(elem).forEach(function(key) {
      if(key !== 'replies') {
        comment[key] = elem[key];
      }
    });
    result.push(comment);
    
    if(elem.replies) {
      elem.replies.forEach(function(replyElem) {
        var reply = {};
        props.forEach(function(prop) {
          reply[prop] = '';
        });
        
        Object.keys(replyElem).forEach(function(key) {
          reply['replies.' + key] = replyElem[key];
        });
        result.push(reply);
      });      
    } 
  });
  
  return result;
  
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
