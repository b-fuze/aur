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

AUR.sandbox = function(func, silent) {
  if (typeof func !== "function")
    return;
  
  try {
    func();
  } catch(e) {
    var err = "AUR Sandbox ERROR: " + e + "\n\n" + e.stack;
    
    console.error(err);
    if (!silent)
      alert(err);
  }
};
// aur.mod.js here
