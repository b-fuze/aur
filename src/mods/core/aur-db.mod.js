// AUR-Database Source

(function() {
  var regs     = AUR.register("aur-db");
  var dbname   = "aur-db-global";
  var dbBuffer = {};
  
  // Get DB current state to check
  var GMDB = GM_getValue(dbname);
  
  if (!GMDB) {
    GM_setValue(dbname, "{}");
  } else {
    dbBuffer = JSON.parse(GMDB);
  }
  
  function updateDB() {
    GM_setValue(dbname, JSON.stringify(dbBuffer));
  }
  
  regs.interface = {
    getDB: function(moddb) {
      return dbBuffer[moddb] === undefined ? null : dbBuffer[moddb];
    },
    setDB: function(moddb, dbState) {
      if (jSh.type(dbState) === "undefined" || jSh.type(dbState) === "null")
        return false;
      
      dbBuffer[moddb] = dbState;
      updateDB();
    }
  }
})();
