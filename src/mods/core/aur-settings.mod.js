// AUR Settings API
//
// Initial Author: b-fuze
AUR_NAME = "AUR Settings";
AUR_DESC = "AUR Settings API";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;

var regs = reg;
var sett = lces.user.settings;
var oldDB, db, dbName = "aur-sett-db";

var settDefault = {
  // Setting defaults
};

// Add initial empty setting object container
sett.default = settDefault;

AUR.onLoaded("aur-db", function() {
  db = AUR.import("aur-db");
  
  sett.on(function() {
    // Save settings with old settings if any
    db.setDB(dbName, {user: JSON.stringify(
      oldDB ? jSh.mergeObj(sett.user, oldDB, true, true) : sett.user
    )});
  });
});

// Apply all saved settings
AUR.on("load", function() {
  var settDB = db.getDB(dbName);
  
  if (settDB) {
    oldDB = jSh.parseJSON(settDB.user);
    sett.user = oldDB;
  }
});

regs.interface = {
  setDefault: function(name, def) {
    if (!def || jSh.type(def) !== "object" || !name || typeof name !== "string")
      return false;
    
    // Push and manifest the new defaults
    settDefault[name] = def;
    sett.manifest();
  },
  
  resetUser: function(name) {
    
  },
  
  // LCES Setting Entry Constructor
  "Setting": sett.Setting,
  
  "set": sett.set.bind(sett),
  "get": sett.get.bind(sett),
  "on":  sett.on.bind(sett),
  "getDetails": sett.getDetails.bind(sett)
};