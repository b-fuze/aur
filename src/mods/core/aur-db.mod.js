// AUR-Database Source
AUR_NAME = "AUR DB";
AUR_DESC = "AUR Database API";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;
AUR_INTERFACE = "auto";

var regs      = reg;
var dbname    = "aur-db-global";
var dbBuffer  = {};
var dbGetFunc = lces.global.GM_getValue || localStorage.getItem.bind(localStorage);
var dbSetFunc = lces.global.GM_setValue || localStorage.setItem.bind(localStorage);

// Get DB current state to check
var GMDB = dbGetFunc(dbname);

if (!GMDB) {
  dbSetFunc(dbname, "{}");
} else {
  dbBuffer = JSON.parse(GMDB);
}

function updateDB() {
  dbSetFunc(dbname, JSON.stringify(dbBuffer));
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
  },
  clearDB: function(moddb) {
    if( dbBuffer[moddb] ) dbBuffer[moddb] = null;
  }
}
