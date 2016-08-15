// AUR-Database Source
AUR_NAME = "AUR DB";
AUR_DESC = "AUR Database API";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)", "TDN (Samu)"];

AUR_RESTART = true;
AUR_INTERFACE = "auto";
AUR_RUN_AT = "doc-start";
AUR_USERSCRIPT_CLAUSE = [
  "@grant GM_getValue",
  "@grant GM_setValue"
];

var regs        = reg;
var dbName      = "aur-db-global";
var dbBuffer    = {__namespaces: []};
var dbNSBuffers = {};
var emptyDBNS   = {placeholder: true};
var dbGetFunc   = typeof GM_getValue === "function" ? GM_getValue : localStorage.getItem.bind(localStorage);
var dbSetFunc   = typeof GM_setValue === "function" ? GM_setValue : localStorage.setItem.bind(localStorage);

// Get DB current state to check
var GMDB = dbGetFunc(dbName);

if (!GMDB) {
  dbSetFunc(dbName, "{__namespaces: []}");
} else {
  dbBuffer = JSON.parse(GMDB);
  
  if (dbBuffer.__namespaces)
    for (var i=0,l=dbBuffer.__namespaces.length; i<l; i++) {
      var ns = dbBuffer.__namespaces[i];
      dbNSBuffers[ns + "db"] = emptyDBNS;
    }
  else
    dbBuffer.__namespaces = [];
}

function updateDB(dbNSName, dbNSBuffer) {
  dbSetFunc(dbNSName || dbName, JSON.stringify(dbNSName ? dbNSBuffer : dbBuffer));
}

regs.interface = {
  getNS(modNS) {
    var NSDBName = dbName + "-" + modNS;
    var dbNSBuffer = dbNSBuffers[modNS + "db"];
    
    if (!dbNSBuffer) {
      dbNSBuffer = {};
      dbNSBuffers[modNS + "db"] = dbNSBuffer;
      
      dbBuffer.__namespaces.push(modNS);
      updateDB();
    }
    
    function fetchNSDB() {
      dbNSBuffer = jSh.parseJSON(dbGetFunc(NSDBName));
      
      if (!(dbNSBuffer instanceof Object) || dbNSBuffer.data === null && dbNSBuffer.error) {
        dbNSBuffer = {};
      }
      
      dbNSBuffers[modNS + "db"] = dbNSBuffer;
    }
    
    return {
      getDB(moddb) {
        if (dbNSBuffer === emptyDBNS) {
          fetchNSDB();
        }
        
        return dbNSBuffer[moddb] === undefined ? null : dbNSBuffer[moddb];
      },
      setDB(moddb, dbState) {
        if (jSh.type(dbState) === "undefined" || jSh.type(dbState) === "null")
          return false;
        
        if (dbNSBuffer === emptyDBNS) {
          fetchNSDB();
        }
        
        dbNSBuffer[moddb] = dbState;
        updateDB(NSDBName, dbNSBuffer);
      },
      clearDB(moddb) {
        if (dbNSBuffer === emptyDBNS) {
          fetchNSDB()
        }
        
        if (dbNSBuffer[moddb])
          dbNSBuffer[moddb] = null;
        
        updateDB(NSDBName, dbNSBuffer);
      }
    };
  },
  getDB(moddb) {
    return dbBuffer[moddb] === undefined ? null : dbBuffer[moddb];
  },
  setDB(moddb, dbState) {
    if (jSh.type(dbState) === "undefined" || jSh.type(dbState) === "null")
      return false;
    
    dbBuffer[moddb] = dbState;
    updateDB();
  },
  clearDB(moddb) {
    if (dbBuffer[moddb])
      dbBuffer[moddb] = null;
    
    updateDB();
  }
}
