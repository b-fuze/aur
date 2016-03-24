// AUR Core - First file included in the build script AFTER jShorts and LCES (lces.current.js)
//
// Build script: /aur/build.aur.js

var AURGlobal = this;

// Add constant AUR to window
jSh.constProp(this, "AUR", new lcComponent());
var AUR = this.AUR;

AUR.addEvent("load");

AUR.jSh  = jSh;
AUR.lces = lces;

AUR.error = function(e) {
  var errorString = "AUR ERROR: " + e;
  
  console.error(errorString);
  alert(errorString);
};
// aur.mod.js here
