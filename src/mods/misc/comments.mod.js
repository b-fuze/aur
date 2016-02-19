//AUR comment fixes module, first date: 2016-17-2
//todo
//User shoudnt be able to rate a comment more than once, also shouldn't be able to like then dislike same comment
//make it look better (especially rate function)
//in rate function, should I use 'this' or the 'e' (event) parameter?


(function(){
  var reg = AUR.register("comment");
  var jSh = AUR.jSh;
  var aurdb = AUR.import("aur-db");
  
  // Add vote event
  reg.addEvent("vote");
  
  reg.interface = function(){
    var that = this; // I had to make this to use saveVote() from rate()

    this.mend = function(comments){
      
      var buttons = jSh(comments).jSh(".comment-icons"); // jSh(comments) is good because it's better to be cautious, even though I most likely return them from jSh, you can't be sure, so this is good.

      for(var i = 0; i < buttons.length; i++){

        if(buttons[i].children.length !== 1){
          // jSh(buttons[i]) is redundant, since you get them from jSh (line 21), so buttons[i].jSh() works just fine.
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
      var commentElement = this.getParent(3); // This is actually from jSh, and works because you got it from jSh (line 27/28) which gives you Node.getChild(n), Node.getParent(level), and obviously Node.jSh(selector)
      var vote = type === "likecomment" ? true : false;
      // jSh(this) is redundant, since you got them from jSh (line 27/28) above, so this.jSh("span[...]") works just fine.
      var counter = jSh(this).jSh("span[class$='count']")[0];
      
      var req = new lcRequest({
        method: "GET",
        uri: url,
        query: query,
        form: true
      });
      
      counter.innerText = (+counter.textContent) + 1;
      // reg.saveVote(id, vote); // This doesn't work, reg is the -register- for *your* module, but you put saveVote in the *interface* constructor instead so:
      that.saveVote(id, vote); // Change however you want, just make sure you understand where things are. If something isn't clear ask me.
      

      reg.triggerEvent("vote", {
        like: vote,
        commentId: id,
        commentElement: commentElement
      });

      req.send();

    }



    this.saveVote = function(id, vote){
      var dbObj = aurdb.getDB("comment-votes");

      if(!dbObj){
        dbObj = {};
      }

      dbObj[id] = vote;
      aurdb.setDB("comment-votes", dbObj); // You forgot this
    }

  }
})();
