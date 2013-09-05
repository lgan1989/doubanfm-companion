


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var url = request.greeting;
    var regexId = /p([\d]+)[\s\S]*\.mp3/;
    var sid = url.match(regexId)[1];
    var songInfo = localStorage['bubbler_song_info']; 
    var rawInfo =  $.parseJSON( songInfo );   
    if (sid == rawInfo['id']){
        chrome.runtime.sendMessage({greeting: songInfo});
    }

});
