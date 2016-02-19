//AUR comment fixes module, first date: 2016-17-2

(function(){
  var reg   = AUR.register("comment");
  if(!reg)
    return;

  var page  = AUR.import("aur-page");
  var aurdb = AUR.import("aur-db");
  
  reg.addEvent("vote");
  
  reg.interface = function(){
    var that = this; // I had to make this to use saveVote() from rate()

    this.mend = function(comments){

      if(!comments instanceof Element)
        return;
      
      comments.onclick = this.rate;

    };

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
      var url         = "http://www.animeultima.io/ajax.php";
      var query       = {method: type, commentid: id};
      var vote        = type === "likecomment" ? true : false;
      var counter     = target.jSh("span[class$='count']")[0];
      var commentElem = target.getParent(3);

      //Don't rate again if already voted before
      if(!commentElem.rated){

        commentElem.rated = true;

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
