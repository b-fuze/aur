// Test Samu's comment module

(function() {
  if (!AUR.import("aur-page").isEpisode)
    return;
  
  AUR.on("load", function() {
    var aurdb      = AUR.import("aur-db");
    var comments   = AUR.import("comment");
    var commentDiv = jSh("#comment-container");
    
    var testWin      = new lcWindow();
    testWin.title    = "Cookie Test";
    testWin.width    = 500;
    testWin.height   = 350;
    testWin.centered = true;
    
    comments.mend(commentDiv);
    comments.on("vote", function(e) {
      var req = new lcRequest({
        method: "GET",
        uri: "/ajax.php?method=fetchepisodecomment&episode_num=1&channelid=2841",
        cookies: false,
        success: function() {
          var commentSrc = this.responseText;
          
          if (testWin.children[0])
            testWin.remove(testWin.children[0]);
          
          testWin.append(jSh.d(undf, ih(commentSrc)));
          testWin.visible = true;
        }
      });
      
      // req.send();
      
      // alert(
      //   `Like: ${e.like}
      //    ID:   ${e.commentId}
         
      //    DB:   ${JSON.stringify(aurdb.getDB("comment-votes"))}
      //    XHR:  ${XMLHttpRequest + req.xhr.responseText + req.xhr.onreadystatechange}`.replace(/\n\s+/g, "\n")
      // );
    });
  });
})();
