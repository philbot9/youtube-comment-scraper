var API_URL = '/api/';
var totalCommentCount;
var fetchedCount = 0;
var commentPages = [];

/*************************************
 ** UI functions
 ************************************/
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

/*************************************
 ** Scraping functions
 ************************************/

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
        fetch(commentPage.nextPageToken);
      } else {
        setItemCompleted('i-scrape-comments');
        addDetailItem('i-process-results', 'Processing results');    
        updateProgressBar(100);
        displayResults(videoID);
      }
    });
  }
}

// TODO: Give feedback if something fails!

function fetchCommentPage(videoID, pageToken, callback) {
  var data = {
    'videoID': videoID
  };
  if(pageToken) {
    data['pageToken'] = pageToken;
  }

  $.ajax({
    type: 'POST',
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


/*************************************
 ** Result Processing functions
 ************************************/

function displayResults(videoID) {
  $('#result-container').attr('class', '');
  $('#result-container').show('slow');
  
  updateResults(function() {
    setItemCompleted('i-process-results');
    addDetailItem('i-done', 'Done!');
    setItemCompleted('i-done');  
  });
  
  $('#save-json').click(function(e) {
    download(buildJsonResult(), 'comments-' + videoID + '.json', 'text/plain');
  });
  
  $('#save-csv').click(function(e) {
    download(buildCsvResult(), 'comments-' + videoID + '.csv', 'text/plain');  
  });
  
  $('#result-container .well :checkbox').on('ifToggled', function(){  
    return updateResults();
  });
}

function updateResults(callback) {
  var timeoutID = setTimeout(function() {  
    $('.well-progress').fadeIn();
    $('#options-row').css('opacity', '0.4');
    $('#options-row *').attr('disabled', 'disabled');
    $('.result-div').css('visibility', 'hidden');
  }, 100);
  
  setTimeout(function() {
    $('#json-result').html(generateJsonOutput());
    $('#csv-result-text').text(generateCsvOutput());
    
    clearTimeout(timeoutID);
    $('#options-row *').removeAttr('disabled');
    $('#options-row').css('opacity', '1');
    $('textarea').css('visibility', 'visible');
    $('.well-progress').fadeOut();
    
    if(callback) {
      callback();
    }     
  }, 1);
}

function getFieldOptions() {
  return jQuery.makeArray($('#result-container .well input:checked')).map(function(elem) {
    return $(elem).val();
  });
}

function buildJsonResult() {
  return JSON.stringify(buildResultArray(getFieldOptions()), null, 2);
}

function generateJsonOutput() {
  return JsonHuman.format(JSON.parse(buildJsonResult()));
}

function buildCsvResult() {
  var resultArray = buildResultArray(getFieldOptions());
  resultArray = flattenResultArray(resultArray);
  return Papa.unparse(JSON.stringify(resultArray));
}

function generateCsvOutput() {
  return buildCsvResult();
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
      return filterCommentProperties(comment, fields);
    }));
  }, []);
}

function filterCommentProperties(comment, properties) {
  var c = {};
  properties.forEach(function(prop) {
    if(prop === 'replies') {
      c['hasReplies'] = comment['hasReplies'];
      c['numberOfReplies'] = comment['numberOfReplies'] || 0;
      if(comment.replies) {
        c.replies = [];
        comment.replies.forEach(function(reply) {
          var r = {};
          properties.forEach(function(replyProp) {
            if(replyProp !== 'replies') {
              r[replyProp] = reply[replyProp];
            }
          });
          c.replies.push(r);
        });
      }
    } else if(typeof comment[prop] !== 'undefined' && comment[prop] !== null) {
      c[prop] = comment[prop] || '';
    }
  });
  return c;
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
