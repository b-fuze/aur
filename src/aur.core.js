// AUR Core - First file included in the build script AFTER jShorts and LCES (lces.current.js)
//
// Build script: /aur/build.aur.js

var AURGlobal = this;

// Add constant AUR to window
jSh.constProp(this, "AUR", new lcComponent());
var AUR = this.AUR;

AUR.addEvent("load");

AUR._on = AUR.on;
AUR.on = function(ev, func) {
  if (ev === "load" && AUR.loadedAllModules)
    setTimeout(func, 0);
  else
    AUR._on.apply(AUR, jSh.toArr(arguments));
}

AUR.jSh  = jSh;
AUR.lces = lces;

// Initial check for AUR settings
var AURUserSett = jSh.parseJSON(GM_getValue("aur-db-global"));
var AURUserModSett;

if (AURUserSett && AURUserSett["aur-sett-db"]) {
  AURUserSett = jSh.parseJSON(AURUserSett["aur-sett-db"]["user"]);
  AURUserModSett = AURUserSett["AURModsEnabled"];
} else {
  AURUserSett = {error: true};
}

if (!AURUserModSett) {
  AURUserModSett = {};
}

// AUR Utils
AUR.error = function(e) {
  var errorString = "AUR ERROR: " + e;
  
  console.error(new Error(errorString));
  alert(errorString);
};

// Options determining utils
// TODO: Fix this
var boolOp = jSh.boolOp;
var numOp  = jSh.numOp;
var strOp  = jSh.strOp;

AUR.sandbox = function(func, silent, success, fail) {
  if (typeof func !== "function")
    return;
  
  try {
    func();
    
    if (typeof success === "function")
      success();
  } catch(e) {
    var err = "AUR Sandbox ERROR: " + e + "\n\n" + e.stack;
    
    console.error(err);
    if (!silent)
      alert(err);
    
    if (typeof fail === "function")
      fail();
  }
};

var __aurModCode = null;
// aur.mod.js here
