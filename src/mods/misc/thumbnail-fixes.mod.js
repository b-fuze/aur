//AUR Thumbnail Fixes Module
//ToDo
//add support for Mp4upload
//add prefs
//decide to check if image is broken before getting thumbnail or not
//Some parts could be removed/reduced 

AUR_NAME = "Thumbnail Fixer";
AUR_DESC = "Fixes the broken thumbnails";
AUR_VERSION = 0.1;
AUR_AUTHORS = ["Samu"];
AUR_RESTART = true; // If true AUR will say that it needs to restart for the module to take effect

// var reg = AUR.register("thumbnail-fixes");
var aurdb = AUR.import("aur-db");

reg.interface = function(){
  var that = this;

  this.getTitle = function(url){
    var title = url.replace(/^https?:\/\/(?:www\.)?animeultima\.io\/+([^]+-episode-[\d\.]+)(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(?:#[^]+)?$/, "$1");
    return title;
  }

//  this.requestsMade = 0;

  this.mend = function(thumbs, videoUrl, episodeUrl){


    function getThumb(iframeUrl, pageUrl){
   //   console.log(iframeUrl, pageUrl);
      var title = that.getTitle(pageUrl);
      var thumbUrl = "";

      if(!that.db(title)){
        if(iframeUrl.match("auengine")) {
          thumbUrl = getAUEThumb(iframeUrl);
        }else if(iframeUrl.match("mp4upload")){
          //Will probably need to make a new request to the mp4upload embed link and there get the background image of the #flowplayer element...
        }

      }else{
        thumbUrl = that.db(title);
      }

      if(thumbUrl !== ""){
        that.db(title, thumbUrl);
      }

      return thumbUrl;

    }
    

    function getAUEThumb(videoUrl){
      if(!videoUrl)
        return "";

      var matched = videoUrl.match(/file=(.+)&.*w=/);
      if(matched && matched[1]){
        var filename = matched[1] + "_b.png";
        var thumbnailUrl = "http://thumbs.auengine.com/" + filename;
        return thumbnailUrl;
      }

      return "";
    }
    
    if(videoUrl){
      
      var pageUrl = episodeUrl || window.location.href;
      var url = getThumb(videoUrl, pageUrl);

      var mirrors = thumbs.jSh(".thumb img:first-of-type");
      for(var i = 0; i < mirrors.length; i++){
        mirrors[i].src = url;
      }

    }else{

      var links = thumbs.jSh("a");
      for(var i = 0; i < links.length; i++){

        var url = links[i].href;
        var title = this.getTitle(url);
        var savedUrl = that.db(title);

        if(!savedUrl){


          function onSuccess(){
            var response = this.response;
            var iframe = response.match(/<iframe.+src="(http:\/\/(?:auengine|mp4upload)\.com.+?)".*><\/iframe>/);
            var title =  that.getTitle(this.responseURL);

            var url = "";

            if(iframe !== null && iframe[1].match("auengine")){

              var url = getAUEThumb(iframe[0]);

            }else if(iframe !== null && iframe[1].match("mp4upload")){
              //erm...
            }

            if(url !== ""){
              that.db(title, url);
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
          thumbs.jSh("a[href*='"+ title +"'] img")[0].src = savedUrl;

        }
      }
    }
  }

  this.db = function(title, imgUrl){
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

}