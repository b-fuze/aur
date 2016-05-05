//AUR Thumbnail Fixes Module
//ToDo
//add support for Mp4upload
//add prefs
//decide to check if image is broken before getting thumbnail or not
//Some parts could be refactored! do it noob
//add self initiation

AUR_NAME = "Thumbnail Fixer";
AUR_DESC = "Fixes the broken thumbnails";
AUR_VERSION = 0.1;
AUR_AUTHORS = ["Samu"];
AUR_RESTART = true; // If true AUR will say that it needs to restart for the module to take effect

// var reg = AUR.register("thumbnail-fixes");
var aurdb = AUR.import("aur-db");
var page = AUR.import("aur-page");


function getThumb(iframeUrl, pageUrl){
   //   console.log(iframeUrl, pageUrl);
  var title = getTitle(pageUrl);
  var thumbUrl = null;

  if(!db(title)){
    if(iframeUrl.match("auengine")) {
      thumbUrl = getAUEThumb(iframeUrl);
    }else if(iframeUrl.match("mp4upload")){

    }

  }else{
    thumbUrl = db(title);
  }

  if(thumbUrl){
    db(title, thumbUrl);
  }

  return thumbUrl;

}

function getAUEThumb(videoUrl){
  if(!videoUrl)
    return null;

  var matched = videoUrl.match(/file=(.+)&.*w=/);
  if(matched && matched[1]){
    var filename = matched[1] + "_b.png";
    var thumbnailUrl = "http://thumbs.auengine.com/" + filename;
    return thumbnailUrl;
  }

  return null;
}

function getMP4UThumb(videoUrl, test){

}

function getTitle(url){
  var title = url.replace(/^https?:\/\/(?:www\.)?animeultima\.io\/+([^]+-episode-[\d\.]+)(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(?:#[^]+)?$/, "$1");
  return title;
}

function db(title, imgUrl){
  var dbObj = aurdb.getDB("thumbnail-cache");

  if(!dbObj)
    dbObj = {};

  if(dbObj[title] !== undefined && imgUrl === undefined){
    return dbObj[title];
  }else if(imgUrl !== undefined){
    dbObj[title] = imgUrl;
    aurdb.setDB("thumbnail-cache", dbObj);
  }
}

function mend(thumbs, videoUrl, episodeUrl){
   if(!thumbs instanceof Element || thumbs.classList.contains("aurMended"))
      return;
    
    //run once
    thumbs.classList.add("aurMended");


if(videoUrl){
      
  var pageUrl = episodeUrl || window.location.href;
  var url = getThumb(videoUrl, pageUrl);

  var mirrors = thumbs.jSh(".thumb img:first-of-type");
  for(var i = 0; i < mirrors.length; i++){
    var attrOri = mirrors[i].getAttribute("original");
    if(!mirrors[i].src.match("dmcdn.net") || (attrOri && attrOri.match("dmcdn.net")))
      mirrors[i].src = url;
  }

}else{

  var links = thumbs.jSh("a");
  for(var i = 0; i < links.length; i++){

    var url = links[i].href;
    var title = getTitle(url);
    var savedUrl = db(title);
    var img = links[i].jSh("img:first-of-type")[0];
    var attrOri = img.getAttribute("original");

    if(img.src.match("dmcdn.net") || (attrOri && attrOri.match("dmcdn.net"))){
      console.log("Dailymotion", img.src, img.src.match("dmcdn.net"));
      continue;
    }


    if(!savedUrl){

      console.log(1, img.src, img.src.match("dmcdn.net"));
      function onSuccess(){
        var response = this.response;
        var iframe = response.match(/<iframe.+src="(http:\/\/(?:auengine|mp4upload)\.com.+?)".*><\/iframe>/);
        var title =  getTitle(this.responseURL);

        var url = null;

        if(iframe !== null && iframe[1].match("auengine")){

          var url = getAUEThumb(iframe[1]);

        }else if(iframe !== null && iframe[1].match("mp4upload")){
          //erm...
        }

        if(url){
          db(title, url);
          thumbs.jSh("a[href*='"+ title +"'] img")[0].src = url;
        }

      }

      var req = new lcRequest({
        method: "GET",
        uri: url,
        success: onSuccess
      });

      req.send();

    }else{
      console.log(2, img.src, img.src.match("dmcdn.net"));
      thumbs.jSh("a[href*='"+ title +"'] img")[0].src = savedUrl;

    }
  }
}
}


//temprorary self initial
if (page.isEpisode){
  mend(jSh("#related-videos"), jSh("#pembed iframe")[0].src, window.location.href);
}else if(page.isHome){
  mend(jSh("#new-episodes"));
  mend(jSh("#main-content-hp > div.section")[0]);
}

reg.interface = function(){
  
  this.mend = mend;
  this.getAUEThumb = getAUEThumb;
  this.getTitle = getTitle;
  this.getThumb = getThumb;
}