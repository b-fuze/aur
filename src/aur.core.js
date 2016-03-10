// AUR Core - First file included in the build script AFTER jShorts and LCES (lces.current.js)
//
// Build script: /aur/build.aur.js

var AURGlobal = this;

// Add constant AUR to window
jSh.constProp(window, "AUR", new lcComponent());

AUR.addEvent("load");

AUR.jSh  = jSh;
AUR.lces = lces;
// aur.mod.js here
