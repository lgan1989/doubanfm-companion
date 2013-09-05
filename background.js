

localStorage['host'] = "ganlu.name/me";

localStorage['cookie'] = '';


var regexMP3link = /http[s]?:\/\/[a-z0-9]*\.douban\.com[^.]*.mp3/;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var rawInfo =  $.parseJSON( request.greeting );
    var trackInfo = {};
    trackInfo['sid'] = rawInfo['id'];
    trackInfo['artist'] = rawInfo['artist'];
    trackInfo['title'] =  rawInfo['song_name'] ;
    trackInfo['url'] =  rawInfo['url'] ;
    trackInfo['cover'] =  rawInfo['cover'] ;  
    trackInfo['like'] = rawInfo['like'] == true ? 1 : 0;

    var albumMatch = /\d+/.exec( rawInfo['album'] );
    if (albumMatch != null){
        albumid = albumMatch[0];
        var apiUrl = "https://api.douban.com/v2/music/" + albumid;
        var host = localStorage['host'];
        $.ajax({
            type : "GET",
            url  : apiUrl,
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                data['track'] = trackInfo;
                data['cookie'] = localStorage['cookie'];
                var jsonStr = JSON.stringify(data);
                var requestStr = 'data=' +  $.param(data) ;   
                var xhr = new XMLHttpRequest(); 
                var postUrl = 'http://' + host + '/dial/track';
                xhr.open("POST", postUrl, true);
                xhr.withCredentials = true;
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');  
                xhr.send(requestStr);  
            }
        });
    }
});


var originJS = /http\:\/\/img3\.douban\.com\/js\/fm\/packed_fm_player[\d]+.js/;
var originShareJS = /http\:\/\/img3\.douban\.com\/js\/fm\/packed_fm_share[\d]+.js/; 

var statusPost = /http\:\/\/douban\.fm\/j\/mine\/playlist\?type=([a-z])&sid=([\d]+)[\s\S]*/


chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
     if (details.url.match(regexMP3link) != null){ 
        for (var i = 0; i < details.requestHeaders.length; ++i) {
          if (details.requestHeaders[i].name === 'Referer') {
            details.requestHeaders.splice(i, 1);
            break;
          }
        
        }
        return {requestHeaders: details.requestHeaders};
    }
  },
  {urls: [
      "http://*.douban.com/*",
      "http://douban.fm/*"
    ]   },
  ["blocking", "requestHeaders"]
);


chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    var host = localStorage['host'];
    var res = info.url.match( statusPost ) ;
    if (localStorage['cookie'] == ''){
        chrome.cookies.get({url : 'http://douban.fm' , name : 'dbcl2'} , function(cookie){
            if (cookie && cookie.value)
                localStorage['cookie'] = cookie.value;
        }); 
    }
    if (info.url.match(regexMP3link) != null){

        chrome.tabs.query({url : "http://douban.fm/*"}, function(tabs) {
            $.each(tabs , function(index , value){
                chrome.tabs.sendMessage(value.id, {greeting: info.url});                   
            });
        });
  

    }
    else if (info.url.match( originJS ) != null){
        return { redirectUrl: 'http://' + host + '/js/my.js' }
    }
    else if (res != null){
       
        var op = res[1]; 
        var sid = res[2];
        var requestStr = 'op=' + op + '&sid=' + sid;   
        var xhr = new XMLHttpRequest(); 
        var postUrl = 'http://' + host + '/dial/op';
        xhr.open("POST", postUrl, true);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');  
        xhr.send(requestStr);    
        return {cancel : false}

    }
    

    return {cancel:false};
  
  },            
  // filters
  {
    urls: [
      "http://*.douban.com/*",
      "http://douban.fm/*"
    ]
  },
  // extraInfoSpec
  ["blocking" , "requestBody"]
  
);           


