// AUR Core Module Management Logic

(function() {
  var modArray = []; // Array containing all the registered modules
  var nameMap  = {}; // Module name map
  var modOpt   = false;
  
  var coreList = [EMPTYCORE]; // Replaced by build.aur.js
  var miscList = [EMPTYMISC]; // Ditto
  var mixList  = coreList.concat(miscList);
  
  // Make globally accessible
  function getList(arr) {
    var list = {};
    
    arr.forEach(function(mod) {
      var modObj = nameMap[mod];
      
      if (modObj) {
        list[mod] = {
          modName: modObj.modName,
          modAuthors: modObj.modAuthors,
          modDesc: modObj.modDesc,
          modVersion: modObj.modVersion,
          modRestart: modObj.modRestart,
          
          get enabled() {
            return modObj.enabled;
          },
          
          set enabled(enabled) {
            if (typeof enabled === "boolean")
              modObj.enabled = enabled;
          }
        }
        
        // For aur-ui-prefs to do it's thing
        if (!modOpt)
          list[mod].setOpt = function(opt) {
            modObj.ui = opt;
            modOpt = true;
          }
      } else
        list[mod] = {
          error: true
        }
    });
    
    return list;
  }
  
  Object.defineProperty(AUR, "modules", {
    configurable: false,
    writable: false,
    value: (function() {
      var mods = {};
      
      Object.defineProperty(mods, "core", {
        configurable: false,
        get: function() {
          return getList(coreList);
        }
      });
      
      Object.defineProperty(mods, "misc", {
        configurable: false,
        get: function() {
          return getList(miscList);
        }
      });
      
      Object.defineProperty(mods, "mix", {
        configurable: false,
        get: function() {
          return getList(mixList);
        }
      });
      
      return mods;
    })()
  });
  
  var sett     = lces.user.settings;
  var settDump = {};
  
  sett.default = settDump;
  
  // Imported module instance methods
  var instMethods = {
    on: function(evt, callback) {
      if (!this.events[evt] || jSh.type(callback) !== "function")
        return null;
      
      this.on(evt, callback);
      
      return callback;
    },
    removeListener: function(evt, callback) {
      if (!this.events[evt] || jSh.type(callback) !== "function")
        return null;
      
      this.removeListener(evt, callback);
      
      return callback;
    }
  }
  
  // Module configuration methods
  var regsMethods = {
    sign: function(item, type) {
      // Sign the item as a module
    },
    
    clean: function() {
      // Clean all signed items
    }
  }
  
  // Module registering component constructor, instanced and returned from AUR.register(modName)
  function ModRegister(modName) {
    lcComponent.call(this);
    var that = this;
    
    // Module interface default
    this.interface = null;
    var settings   = null;
    
    // Module name and version
    jSh.constProp(this, "modName", modName);
    
    this.modDesc    = "";
    this.modVersion = 1;
    this.modAuthors = [];
    Object.defineProperty(this, "settings", {
      get: () => settings,
      configurable: false
    });
    
    // Events
    this.addEvent("moddisable");
    this.addEvent("modenable");
    this.addEvent("loaded");
  }
  
  jSh.inherit(ModRegister, lcComponent);
  
  // AUR.register(modName)
  //
  // modName: Required. Module name
  //
  // Description: Register a new module in the AUR module system.
  AUR.register = function(modName, premInterface) {
    // Check module name
    if (jSh.type(modName) !== "string" || modName.length === 0)
      return null;
    
    // Construct new AUR module interface register
    var modRegs = new ModRegister(modName);
    modRegs.ui = nameMap[modName].ui;
    modRegs.enabled = true;
    
    // Add to collection
    modArray.push(modRegs);
    
    // Append register to module Object
    jSh.extendObj(nameMap[modName], {
      register: modRegs
    });
    
    return modRegs;
  }
  
  AUR.import = function(modName, ...args) {
    var aurMod = nameMap[modName];
    var aurInstance = {};
    
    // Check for loaded module
    if (!aurMod || modArray.indexOf(aurMod.register) === -1) {
      // Check if module will load at all
      if (mixList.indexOf(modName) !== -1) {
        
        var dummyInterface = {loaded: false};
        return dummyInterface;
      }
      
      return null;
    }
    
    // Module exists and is loaded, reference register
    aurMod = aurMod.register;
    
    // Constructor interface
    if (typeof aurMod.interface === "function") {
      aurInstance = new (Function.prototype.bind.apply(aurMod.interface, [null].concat(args)));
      // aurMod.interface.apply(aurInstance, args);
      // aurInstance.constructor = aurMod;
      
    // Object interface
    } else if (jSh.type(aurMod.interface) === "object") {
      jSh.extendObj(aurInstance, aurMod.interface);
    }
    
    // Event Handling
    aurInstance.on = (typeof aurInstance.on === "function" ? aurInstance.on : instMethods.on.bind(aurMod));
    aurInstance.removeListener = instMethods.removeListener.bind(aurMod);
    
    // Module-specific properties
    aurInstance.modName = aurMod.modName;
    aurInstance.loaded  = true;
    
    return aurInstance;
  }
  
  var loadedModules = {};
  mixList.forEach(m => { loadedModules[m] = {loaded: false, callbacks: []} });
  
  AUR.onLoaded = function() {
    var callback;
    var mods = [];
    
    jSh.toArr(arguments).forEach((arg, i, arr) => {
      if (i + 1 === arr.length) {
        if (jSh.type(arg) !== "function")
          return false;
        
        callback = arg;
      } else {
        if (jSh.type(arg) === "string" && mixList.indexOf(arg) !== -1)
          mods.push(arg);
      }
    });
    
    // Check if callback is valid and can continue
    if (!callback)
      return false;
    
    var mods    = mods[0] ? mods : mixList;
    var loadObj = {m: mods, cb: callback, loaded: false};
    var load    = true;
    
    // Check if required modules are loaded already
    loadObj.m.forEach(m => !loadedModules[m].loaded && (load = false));
    
    if (!load)
      mods.forEach(mod => {
        loadedModules[mod].callbacks.push(loadObj);
      });
    else
      callback(); // Modules are loaded already, invoke callback
  }
  
  var MOD_META_ARR  = 0;
  var MOD_META_NUM  = 1;
  var MOD_META_STR  = 2;
  var MOD_META_BOOL = 3;
  
  var modMetaTypeMap = {
    "array": MOD_META_ARR,
    "number": MOD_META_NUM,
    "string": MOD_META_STR,
    "boolean": MOD_META_BOOL
  };
  
  var metaTypeCheckers = {};
  
  metaTypeCheckers[MOD_META_ARR] = v => jSh.type(v) === "array";
  metaTypeCheckers[MOD_META_NUM] = v => typeof v === "number";
  metaTypeCheckers[MOD_META_STR] = v => typeof v === "string";
  metaTypeCheckers[MOD_META_BOOL] = v => typeof v === "boolean";
  
  var modMetaTypes = {
    "NAME": MOD_META_STR,
    "DESC": MOD_META_STR,
    "VERSION": [[MOD_META_ARR, MOD_META_NUM], [MOD_META_NUM]],
    "AUTHORS": [MOD_META_ARR, MOD_META_STR],
    "RESTART": MOD_META_BOOL
  };
  
  var modMetaList = Object.getOwnPropertyNames(modMetaTypes);
  
  function metaTypeValidate(metaType, val) {
    var valid     = true;
    var valType   = jSh.type(val);
    var metaType2 = jSh.type(metaType) === "array" ? MOD_META_ARR : metaType;
    var endVal;
    
    switch (metaType2) {
      case MOD_META_ARR:
        // Check if allows multiple types
        if (jSh.type(metaType[0]) === "array") {
          var validItem = null;
          
          for (var i=0,l=metaType.length; i<l; i++) {
            var typeItem = metaType[i];
            
            // Check if end value can be array
            if (typeItem[0] === MOD_META_ARR) {
              if (valType === "array") {
                validItem = val.filter(metaTypeCheckers[typeItem[1]]);
                
                if (!validItem.length)
                  validItem = null;
                else
                  break;
              } else
                valid = false;
            }
            // It's one value
            else {
              validItem = metaTypeCheckers[typeItem[0]](val) ? val : null;
            }
          }
          
          if (validItem === null)
            valid = false;
          else
            endVal = validItem;
        }
        // Just check each
        else {
          var validItem = val.filter(metaTypeCheckers[metaType[1]]);
          
          if (!validItem.length)
            valid = false;
          else
            endVal = validItem;
        }
      break;
      case MOD_META_NUM:
        endVal = metaTypeCheckers[MOD_META_NUM](val) ? val : null;
      break;
      case MOD_META_STR:
        endVal = metaTypeCheckers[MOD_META_STR](val) ? val : null;
      break;
      case MOD_META_BOOL:
        endVal = metaTypeCheckers[MOD_META_BOOL](val) ? val : null;
      break;
    }
    
    return valid ? endVal : null;
  }
  
  AUR.__registerModule = function(modName, details, code) {
    var modSettName = modName.replace(/-/g, "") + "mod";
    
    if (AURUserModSett[modSettName])
      var enabled = AURUserModSett[modSettName].enabled;
    else
      var enabled = true;
    
    var validMeta = {
      ui: null
    };
    
    // Loop and validate metadata provided
    for (var i=0,l=modMetaList.length; i<l; i++) {
      var meta = modMetaList[i];
      var metaType = modMetaTypes[meta];
      var metaName = "AUR_" + meta;
      var metaRegName = "mod" + meta[0] + meta.substr(1).toLowerCase();
      
      if (details[metaName] !== undf) {
        validMeta[metaRegName] = metaTypeValidate(modMetaTypes[meta], details[metaName]);
      } else {
        validMeta[metaRegName] = null;
      }
    }
    
    var modObj = lces.new();
    modObj.initEnabled = enabled;
    modObj.setState("enabled", enabled);
    
    // Enabled state handler
    modObj.addStateListener("enabled", function(enabled) {
      // Check if the register exists
      if (enabled) {
        if (modObj.register) {
          modObj.register.enabled = true;
          modObj.register.triggerEvent("modenable", {});
        }
        // Was this thing enabled to begin with?
        else if (!modObj.initEnabled) {
          modObj.initEnabled = true;
          code();
        }
      // Not enabled, or register doesn't exist
      } else {
        if (modObj.register) {
          modObj.register.enabled = false;
          modObj.register.triggerEvent("moddisable", {});
        }
      }
    });
    
    jSh.extendObj(modObj, validMeta);
    nameMap[modName] = modObj;
    
    // Check if module's disabled
    if (enabled)
      readyMods.push(code);
  }
  
  AUR.__triggerLoaded = function(modName) {
    var modObj    = loadedModules[modName]
    var callbacks = modObj.callbacks;
    
    modObj.loaded = true;
    
    for (var i=0,l=callbacks.length; i<l; i++) {
      var loadObj = callbacks[i];
      
      if (!loadObj.loaded) {
        var modArr  = loadObj.m;
        var loaded  = true;
        
        for (var j=0,l2=modArr.length; j<l2; j++) {
          if (!loadedModules[modArr[j]].loaded)
            loaded = false;
        }
        
        if (loaded) {
          // All required modules are loaded, invoke the callback
          loadObj.loaded = true;
          loadObj.cb();
        }
      }
    }
  }
  
  AUR.__triggerFailed = function(modName, err) {
    AUR.error(`Module ${name} failed to load - ${err}\n\n${err.stack}`);
  }
  
  // Invokable modules
  var readyMods = [];
  var loadedAllModules = false;
  
  AUR.on("load", function() {
    if (!loadedAllModules) {
      loadedAllModules = true;
      
      for (var i=0,l=readyMods.length; i<l; i++) {
        readyMods[i](); // Run module
      }
    
      // Trigger load event for loaded modules now
      AUR.triggerEvent("load", {});
      AUR.loadedAllModules = true;
    }
  });
})();
