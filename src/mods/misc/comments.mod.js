//AUR comment fixes module, first date: 2016-17-2
//todo
//User shoudnt be able to rate a comment more than once, also shouldn't be able to like then dislike same comment
//make it look better (especially rate function)
//in rate function, should I use 'this' or the 'e' (event) parameter?


(function(){
  var reg = AUR.register("comment");
  var jSh = AUR.jSh;
  var aurdb = AUR.import("aur-db");

  reg.interface = function(){


    this.mend = function(comments){

      var buttons = jSh(comments).jSh(".comment-icons");

      for(var i = 0; i < buttons.length; i++){

        if(buttons[i].children.length !== 1){
          jSh(buttons[i]).jSh(".like-comment")[0].onclick = this.rate;
          jSh(buttons[i]).jSh(".dislike-comment")[0].onclick = this.rate;  
        }
        
      }

    };

    this.rate = function(){
      var id = this.rel;
      var type = this.className.replace("-", "");
      var url = "http://www.animeultima.io/ajax.php";
      var query = {method: type, commentid: id};
      var commentElement = this.getParent(3);
      var vote = type === "likecomment" ? true : false;
      var counter = jSh(this).jSh("span[class$='count']")[0];
      
      var req = new lcRequest({
        method: "GET",
        uri: url,
        query: query,
        form: true
      });

      
      reg.triggerEvent("vote", {
        like: vote,
        commentId: id,
        commentElement: commentElement
      });

      counter.innerText = (+counter.textContent) + 1;
      reg.saveVote(id, vote);

      req.send();

    }



    this.saveVote = function(id, vote){
      var dbObj = aurdb.getDB("comment-votes");

      if(!dbObj){
        dbObj = {};
      }

      dbObj[id] = vote;
    }

  }
})();
