// AUR Refactor Module
AUR_NAME = "Refactor";
AUR_DESC = "Fixes many broken aspects of AU pages";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;

var regs   = reg;
var page   = AUR.import("aur-page");
var detail = AUR.import("aur-details");
var style  = AUR.import("aur-styles");
var sett   = AUR.import("aur-settings");
var mtog   = AUR.import("mod-toggle", reg);

function remove(e) {
  e.parentNode.removeChild(e);
  
  return e;
}

function cleanText(e, regex, repl) {
  e.textContent = e.textContent.trim().replace(regex, repl);
}

// Remove games from nav
var nav = jSh("#left-nav").jSh(".ddtitle");
nav.every(e => !(e.textContent.trim().toLowerCase() === "games" && ((e.parentNode.style.display = "none") || true)));

// Add settings
sett.setDefault("refactor", {
  rmPopularEps: sett.Setting("Remove Popular Episodes", "boolean", false),
  rmTracker: sett.Setting("Remove Episode Tracker", "boolean", false),
  hideChatango: sett.Setting("Hide Chatango", "boolean", true)
});

// Set up toggle tracker
mtog.setting("refactor.rmPopularEps", false);
mtog.setting("refactor.rmTracker", false);
mtog.setting("refactor.hideChatango", false);


reg.ui.prop({
  link: "refactor.rmPopularEps"
});

reg.ui.prop({
  link: "refactor.rmTracker"
});

reg.ui.prop({
  link: "refactor.hideChatango"
});

// Hide chatango chat
var hideChatango = `
  #right-content-hp > div.centered > div.side-box {
    display: none;
  }
`;

var chatango = style.styleBlock(style.important(hideChatango), sett.get("refactor.hideChatango"));

sett.on("refactor.hideChatango", function(e) {
  chatango.enabled = e.value;
});

// Mainpage
if (page.isHome) {
  remove(jSh("#hp-ads"));
  
  if (jSh("#new-anime-season")) {
    remove(jSh("#new-anime-season").previousElementSibling);
    remove(jSh("#new-anime-season"));
  }
  
  // Fix broken episode zero links on mainpage
  jSh("#new-episodes").jSh(".generic-video-item").forEach(function(thumb) {
    var a = thumb.jSh("a")[0];
    
    a.href = (a.href + "").trim().replace(/-episode-0-english-(subbed|dubbed|raw)\/$/, "-episode-00-english-$1/");
  });
  
  var popularEps = [jSh("#main-content-hp").jSh("h3")[0], jSh("#main-content-hp").jSh(".section")[0]];
  var epsTracker = [jSh("#main-content-hp").jSh("h2")[0], jSh("#main-content-hp").jSh(".centered")[0]];
  
  // Setting bound fixes
  sett.on("refactor.rmPopularEps", function(e) {
    var toggle = !e.value ? "block" : "none";
    
    popularEps.forEach(function(e) {
      if (e)
        e.style.display = toggle;
    });
  });
  
  // Check if the user's logged in
  if (detail.user.name)
    sett.on("refactor.rmTracker", function(e) {
      var toggle = !e.value ? "block" : "none";
      
      epsTracker.forEach(function(e) {
        if (e)
          e.style.display = toggle;
      });
    });
  
  // Add calender fix
  var calReq = new lcRequest({
    method: "GET",
    uri: "/ajax.php?method=newrelease_calendarview",
    success: function() {
      var parent  = jSh(".nr-top")[0];
      var table   = jSh((new DOMParser()).parseFromString(this.responseText, "text/html")).jSh("table")[0];
      var epsPage = jSh("#new-episodes");
      
      epsPage.parentNode.insertBefore(table, epsPage);
      table.style.display = "none";
      
      var tabs = [
        jSh(".nr-toggle-view")[0],
        jSh(".nr-toggle-view")[1]
      ];
      
      var tabPages = [
        epsPage,
        table
      ];
      
      parent.addEventListener("click", function(e) {
        var target    = e.target || e.srcElement; // Not even supporting old stuff, I think I'm wasting chars
        var targetInd = tabs.indexOf(target);
        
        if (targetInd !== -1 && !target.classList.contains("nr-toggle-view-active")) {
          target.classList.add("nr-toggle-view-active");
          tabs.forEach((tab, i) => i !== targetInd && tab.classList.remove("nr-toggle-view-active"));
          
          tabPages[targetInd].style.display = "block";
          tabPages.forEach((tp, i) => {if (i !== targetInd) tp.style.display = "none"});
        }
      });
    }
  });
  
  calReq.send();
}

if (page.isChannel) {
  cleanText(jSh("h1")[0], /Watch or Download "([^]+)" English Subbed\/Dubbed Online/i, "$1");
  cleanText(jSh("h2")[0], /[^]+/, "Synopsis");
  
  if (jSh("#watch-latest-episode")) {
    var link  = jSh("#watch-latest-episode").getChild(0);
    var epNum = jSh("#latest-episode-ongoing").getChild(1);
    
    remove(jSh("#watch-latest-episode"));
    
    // Wrap <a> element around episode number
    jSh("#latest-episode-ongoing").insertBefore(link, epNum);
    link.innerHTML = "";
    link.appendChild(epNum);
  }
  remove(jSh(".anime-desc")[0].jSh("p")[1]);
  
  if (jSh(".anime-pic")[0])
    remove(jSh(".anime-pic")[0]);
  
  var genres = jSh("#anime-table-info").getChild(0).getChild(4).getChild(1);
  
  if (genres)
    genres.innerHTML = jSh.filterHTML(genres.textContent);
  
  var rss = jSh("#anime-table-info").getChild(0).getChild(-1).getChild(1);
  
  remove(rss.jSh("img")[0]);
  rss.classList.add("aur-rss-fix");
}

if (page.isEpisode) {
  if (detail.anime.episodeAvailable) {
    remove(jSh("#fb-like"));
    remove(jSh(".fornoobs")[0]);
    
    // Fix bug in aur-themify
    var episodeLinks = jSh(".nextepisode")[0].children;
    
    if (episodeLinks.length < 3 && /all/i.test(episodeLinks[0].textContent))
      jSh(".nextepisode")[0].insertBefore(
        jSh.c("a", {prop: {href: ""}, text: ih("&nbsp;"), className: ".aur-refactor"}),
        jSh(".nextepisode")[0].getChild(0)
      );
    
    // Fix episode details
    if (jSh(".uploader-info")[0]) {
      var strong = jSh(".uploader-info")[0].jSh("strong").slice(0, 3);
      
      strong.forEach(e => e.textContent = e.textContent.replace(":", ""));
    }
    
    // Fix reporting pane
    var report = jSh("#report-form");
    report.getChild(-1).appendChild(jSh.c("input", {
      sel: ".button-link",
      attr: {
        type: "button",
        value: "Close",
        onclick: `$("#report-form").slideUp("slow");`
      }
    }));
  }
}

if (page.isSearch) {
  var searchTitle = remove(jSh("#main-content").getChild(0)).textContent.trim();
  var searchMsg   = jSh("#main-content").getChild(0);
  
  if (searchMsg.classList.contains("notice")) {
    var resultCount = searchMsg.textContent.trim().match(/^I\s+found\s+(\d+)\s+results/i)[1];
    
    searchMsg.textContent = resultCount + " s" + searchTitle.substr(1);
  } else if (searchMsg.textContent.indexOf("No results found") !== -1) {
    searchMsg.innerHTML = searchMsg.innerHTML.trim().replace(/^(No\s+results\s+found)(\.)/i, "$1 for " + jSh.filterHTML(searchTitle.match(/^Search\s+results\s+for\s+([^]+)/)[1]) + ".");
  }
}


if (page.isHome || page.isChannel || page.isEpisode) {
  var airingAnime   = jSh("#ongoing-anime").jSh("li");
  var culpritTitles = /test|Re:[^]Hamatora/i;
  
  for (var i=0,l=airingAnime.length; i<l; i++) {
    var li = airingAnime[i];
    
    if (culpritTitles.test(li.getChild(0).textContent.trim()))
      remove(li);
  }
}

if (jSh("#hot-shows")) {
  jSh("#hot-shows").getChild(0).textContent = "Hot Anime This Season";
}
