//

var regs = AUR.register("aur-details");
var page;

var bank;
var Bank = function() {
  this.user  = {};
  this.anime = {};
  
  var that    = this;
  var updates = [];
  
  userProps.forEach(function(prop) {
    that.user[prop[0]] = null;
    updates.push([that.user, prop[0], prop[1]]);
  });
  
  animeProps.forEach(function(prop) {
    that.anime[prop[0]] = null;
    updates.push([that.anime, prop[0], prop[1]]);
  });
  
  this.update = function() {
    updates.forEach(function(upd) {
      upd[0][upd[1]] = upd[2]();
    });
  }
  
  this.update();
}

// Page data retrieving functions
var userProps = [
  ["name", function() {
    var name = jSh("#left-nav").getChild(-2).getChild(0).textContent.trim();
    
    if (name.toLowerCase() !== "account")
      return name;
    else
      return null;
  }],
  ["id", function() {
    return null;
  }]
];

var animeProps = [
  ["title", function() {
    if (page.isEpisode) {
      return jSh("#header-left").jSh("b")[0].textContent.trim().split(/\s*Episode\s*\d+/)[0];
    } else if (page.isChannel) {
      return jSh("#header-left").jSh("b")[0].textContent.trim();
    } else
      return null;
  }],
  ["episode", function() {
    if (page.isEpisode) {
      return jSh("#epid").value;
    } else
      return null;
  }],
  ["episodeTitle", function() {
    if (page.isEpisode && jSh("#pembed")) {
      var h1 = jSh("#main-content").jSh("h1")[0];
      
      if (h1.nextElementSibling && h1.nextElementSibling.tagName === "P") {
        var title = h1.nextElementSibling.textContent.trim().substr(1);
        return title.substr(0, title.length - 1);
      } else
        return "";
    } else
      return null;
  }],
  ["channel", function() {
    if (page.isEpisode)
      return jSh("#chid").value;
    else if (page.isChannel)
      return jSh("#anime-table-info").jSh("tr")[0].getChild(1).textContent.trim();
    else
      return null;
  }],
  ["videoId", function() { // TODO: Fix
    // if (page.isEpisode)
    //   return jSh("#videoid").value;
    // else
      return null;
  }],
  ["mirror", function() {
    if (page.isEpisode && jSh("#pembed"))
      return jSh(".uploader-info")[0].textContent.match(/video\s+site:\s*([a-z\d]+)\s*language:/i)[1];
    else
      return null;
  }],
  ["mirrorURL", function() {
    if (page.isEpisode && jSh("#pembed")) {
      var pembed = jSh("#pembed");
      
      var embed  = pembed.jSh("embed")[0];
      var iframe = pembed.jSh("iframe")[0];
      
      return (embed || iframe || {src: null}).src;
    } else
      return null;
  }],
  ["episodeAvailable", function() {
    if (page.isEpisode)
      return !!jSh("#pembed");
    else
      return null;
  }]
];

// Interface constructors
function empty() {
  // Nothing to do here
}

function readableProp(obj, prop, get) {
  Object.defineProperty(obj, prop, {
    enumerable: true,
    set: empty,
    get: get
  });
}

function userDetails() {
  var that = this;
  
  userProps.forEach(p => readableProp(that, p[0], (prop => (() => bank.user[prop]))(p[0])));
}

function animeDetails() {
  var that = this;
  
  animeProps.forEach(p => readableProp(that, p[0], (prop => (() => bank.anime[prop]))(p[0])));
}

regs.interface = function() {
  this.user  = new userDetails();
  this.anime = new animeDetails();
  
  Object.defineProperty(this, "_update", {
    enumerable: false,
    value: bank.update.bind(bank)
  });
}

AUR.onLoaded("aur-page", function() {
  page = AUR.import("aur-page");
  bank = new Bank();
});
