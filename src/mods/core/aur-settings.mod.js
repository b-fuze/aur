// AUR Settings API
//
// Initial Author: b-fuze

var regs = AUR.register("aur-settings");
var sett = lces.user.settings;
var db, dbName = "aur-sett-db";

var settDefault = {
  // Setting defaults
};

// Add initial empty setting object container
sett.default = settDefault;

AUR.onLoaded("aur-db", function() {
  db = AUR.import("aur-db");
  
  sett.on(function() {
    db.setDB(dbName, {user: JSON.stringify(sett.user)});
  });
});

// Apply all saved settings
AUR.on("load", function() {
  var settDB = db.getDB(dbName);
  
  if (settDB)
    sett.user = jSh.parseJSON(settDB.user);
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
