// aur-page test for different page types

var regs = AUR.register("aur-page");
var url  = document.location.toString();

regs.interface = {
  isHome:    /^https?:\/\/(www\.)?animeultima\.io\/?(#[^]+)?$/.test(url),
  isEpisode: /^https?:\/\/(www\.)?animeultima\.io\/[^]+-episode-[\d\.]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?\/?(#[^]+)?$/.test(url),
  isChannel: /^https?:\/\/(www\.)?animeultima\.io\/(?:watch\/[^]+-english-subbed-dubbed-online)(?:\/favorites)?\/?(#[^]+)?$/.test(url),
  isSearch:  /^https?:\/\/(www\.)?animeultima\.io\/search.html(?:\?searchquery=?[^]*)?(#[^]+)?$/.test(url),
  isList:    /^https?:\/\/(www\.)?animeultima\.io\/watch-anime(?:-movies)?\/?(#[^]+)?$/.test(url)
};
