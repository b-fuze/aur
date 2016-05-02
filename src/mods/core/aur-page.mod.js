// aur-page test for different page types
AUR_NAME = "AUR Page";
AUR_DESC = "Anime Ultima Page Type Module";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;

var regs = AUR.register("aur-page");
var url  = document.location.toString();

regs.interface = {
  isAU:      /^https?:\/\/(www\.)?animeultima\.io(\/[^]*)?$/.test(url),
  isHome:    /^https?:\/\/(www\.)?animeultima\.io\/?(#[^]+)?$/.test(url),
  isEpisode: /^https?:\/\/(www\.)?animeultima\.io\/[^]+-episode-[\d\.]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?\/?(#[^]+)?$/.test(url),
  isChannel: /^https?:\/\/(www\.)?animeultima\.io\/(?:watch\/[^]+-english-subbed-dubbed-online)(?:\/favorites)?\/?(#[^]+)?$/.test(url),
  isSearch:  /^https?:\/\/(www\.)?animeultima\.io\/search.html(?:\?searchquery=?[^]*)?(#[^]+)?$/.test(url),
  isList:    /^https?:\/\/(www\.)?animeultima\.io\/watch-anime(?:-movies)?\/?(#[^]+)?$/.test(url)
};
