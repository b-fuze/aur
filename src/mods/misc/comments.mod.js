//AUR comment fixes module, first date: 2016-17-2
//TODO
// Comments that have 3 dislikes or more are not viewable, fix the "click to show" button
// fix function/class names
// more readable code
// expect bugs
// add clean function


(function(){
  var reg   = AUR.register("comment");
  if(!reg)
    return;

  var page  = AUR.import("aur-page");
  var aurdb = AUR.import("aur-db");
  var adetails = AUR.import("anime-details");
  
  reg.addEvent("vote");
  
  reg.interface = function(){
    var that = this; // I had to make this to use saveVote() from rate()

    this.mend = function(comments){

      
      if(!comments instanceof Element || comments.classList.contains("aurMended"))
        return;
      
      //run once
      comments.classList.add("aurMended");
     
      //Without AUR, au would hide the comment ratings for comments you have rated
      this.showHiddenRatings(comments);

      comments.onclick = this.rate;

    };

    this.showHiddenRatings = function(comments){

      /*REMOVE WHEN aur-details MODULE IS DONE*/
      var adetails = {};
      adetails.episode = 11;
      adetails.channel = 5043;

      var indexes = [];
      var oldCommentItems = comments.jSh(".comment-item");

      for(var i = 0; i < comments.children.length; i++){
        // var id = oldCommentItems[i].jSh(".like-comment")[0].rel;
        var commentIcons = oldCommentItems[i].jSh(".comment-icons > *");
        if(commentIcons.length === 1){
          indexes.push(i);
        }else if (commentIcons.length !== 1 && this.DBVotes(oldCommentItems[i].jSh(".like-comment")[0].rel) !== undefined){
          indexes.push(i);
        }
      }

      if(!indexes)
        return;

      var query = {
        method: "fetchepisodecomment",
        episode_num: adetails.episode,
        channelid: adetails.channel
      }


      var req = new lcRequest({
        method: "GET",
        uri: "/ajax.php",
        query: query,
        cookies: false,
        success: replceOldOnes
      })


      function replceOldOnes(){

        var parser = new DOMParser();
        doc = parser.parseFromString(this.response, "text/html");

        var newCommentItems = jSh(doc).jSh(".comment-item");

        for(var i = 0; i < indexes.length; i++){
          var id = newCommentItems[indexes[i]].jSh(".like-comment")[0].rel;
          var vote = that.DBVotes(id);
          

          if(vote === true)
            var commentClass = "aur-comment-like";
          else if( vote === false )
            var commentClass = "aur-comment-dislike";
          else
            var commentClass;

          newCommentItems[indexes[i]].classList.add(commentClass);
          newCommentItems[indexes[i]].classList.add("aur-comment");

          comments.replaceChild(newCommentItems[indexes[i]], oldCommentItems[indexes[i]]);


        }

      }

      req.send();

    }

    this.rate = function(e){
      //event delegation
      var target = e.target;
      while (target !== this && target.className.indexOf("like-comment") === -1) {
        target = target.parentNode;
      }

      if (target === this)
        return;
      else
        var target = jSh(target);


      var id          = target.rel;
      var type        = target.className.replace("-", "");
      var url         = "/ajax.php";
      var query       = {method: type, commentid: id};
      var vote        = type === "likecomment" ? true : false;
      var counter     = target.jSh("span[class$='count']")[0];
      var commentItem = target.getParent(3);

      //Don't rate again if already rated before
      if(!commentItem.classList.contains("aur-comment")){

        if(vote === true)
          var commentClass = "aur-comment-like";
        else if( vote === false )
          var commentClass = "aur-comment-dislike";
        else
          var commentClass;

        commentItem.classList.add(commentClass);
        commentItem.classList.add("aur-comment");
        

        var req = new lcRequest({
          method: "GET",
          uri: url,
          query: query,
          form: true
        });
        
        //Update the counter
        counter.innerText = (+counter.textContent) + 1;

        that.DBVotes(id, vote);

        reg.triggerEvent("vote", {
          like: vote,
          commentId: id,
          commentElement: commentItem
        });

        req.send();
      }

    }

    this.DBVotes = function(id, vote){
      //false is dislike, true is like
      var dbObj = aurdb.getDB("comment-votes");

      if(!dbObj)
        dbObj = {};

      if(dbObj[id] !== undefined && vote === undefined){
        return dbObj[id];
      }else if(vote !== undefined){
        dbObj[id] = vote;
        aurdb.setDB("comment-votes", dbObj);
      }

    }

  }
})();