AUR.onLoaded("comment-moderation", function() {
  var comMod = AUR.import("comment-moderation");
  var page   = AUR.import("aur-page");
  
  if (page.isEpisode)
    AUR.sandbox(comMod.init);
});
