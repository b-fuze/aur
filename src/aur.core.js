// AUR Core - First file included in the build script AFTER jShorts and LCES (lces.current.js)
//
// Build script: /aur/src/aur.build.js

// Add constant AUR to window
jSh.constProp(window, "AUR", new lcComponent());

AUR.addEvent("load");
// aur.mod.js here
