//AUR comment fixes module, first date: 2016-17-2
// todo
// check db for comments already rated
// fix function/class names
// more readable code
// expect bugs


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

      comments.classList.add("aurMended");

      var votedCommentsIndex = [];
      var commentItems = comments.jSh(".comment-item");
            
      for(var i = 0; i < comments.children.length; i++){
        if(commentItems[i].jSh(".comment-icons > *").length === 1){
          votedCommentsIndex.push(i);
        }
      }
      
      this.getVotes(votedCommentsIndex, comments);
      comments.onclick = this.rate;

    };

    this.getVotes = function(indexes, comments){

      var c = comments.jSh(".comment-item");
      var adetails = {};
      adetails.episode = 11;
      adetails.channel = 5043;

      var query = {
        method: "fetchepisodecomment",
        episode_num: adetails.episode,
        channelid: adetails.channel
      }


      function test(){

        var parser = new DOMParser();

        doc = parser.parseFromString(this.response, "text/html");

        var commentItems = jSh(doc).jSh(".comment-item");
        var votedComments = [];

        for(var i = 0; i < indexes.length; i++){

          commentItems[indexes[i]].rated = true; //remove rated
          commentItems[indexes[i]].classList.add("aur-comment-dis/like");
          commentItems[indexes[i]].classList.add("aur-comment-vote");

          comments.replaceChild(commentItems[indexes[i]], c[indexes[i]]);


        }

      }

      var req = new lcRequest({
        method: "GET",
        uri: "/ajax.php",
        query: query,
        cookies: false,
        success: test
      })

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
      var commentElem = target.getParent(3);

      //Don't rate again if already voted before
      if(!commentElem.rated){

        commentElem.rated = true; //remove rated and check the classes instead
        commentElem.classList.add("aur-comment-dis/like"); //need to check db for this class name I THINK, recheck
        commentElem.classList.add("aur-comment-vote");
        

        var req = new lcRequest({
          method: "GET",
          uri: url,
          query: query,
          form: true
        });
        
        //Update the counter
        counter.innerText = (+counter.textContent) + 1;

        that.saveVote(id, vote);

        reg.triggerEvent("vote", {
          like: vote,
          commentId: id,
          commentElement: commentElem
        });

        req.send();
      }

    }


    this.saveVote = function(id, vote){
      var dbObj = aurdb.getDB("comment-votes");

      if(!dbObj){
        dbObj = {};
      }

      dbObj[id] = vote;
      aurdb.setDB("comment-votes", dbObj);
    }

  }
})();
