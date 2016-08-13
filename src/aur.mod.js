// AUR Core Module Management Logic

(function() {
  var modArray = []; // Array containing all the registered modules
  var nameMap  = {}; // Module name map
  var modOpt   = false;
  
  var coreList = [AUR_EMPTYCORE]; // Replaced by build.aur.js
  var miscList = [AUR_EMPTYMISC]; // Ditto
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
          modCodename: modObj.modCodename,
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
            
            // Add UI to early modules
            if (modObj.register)
              modObj.register.ui = opt;
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
    this.setState("interfaceType", "literal");
    this.interface = null;
    var settings   = null;
    
    var validITypes = ["auto", "literal"];
    this.addStateCondition("interfaceType", function(itype) {
      if (validITypes.indexOf(itype) === -1)
        return false;
      
      return true;
    });
    
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
    this.addEvent("loaded"); // TODO: Check wtf this is for
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
    
    // Set interface type from meta if provided
    modRegs.interfaceType = nameMap[modName].modInterface;
    
    return modRegs;
  }
  
  AUR.import = function(modName, ...args) {
    var aurMod = nameMap[modName];
    
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
      
    // Check if implements normal AUR interfacing procedures
    if (aurMod.interfaceType === "auto") {
      var aurInstance = {};
      
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
    }
    // No special AUR encapsulation, just send the interface as-is
    else {
      var aurInstance = aurMod.interface;
    }
    
    return aurInstance;
  }
  
  var loadedModules = {};
  mixList.forEach(m => { loadedModules[m] = {loaded: false, callbacks: []} });
  
  AUR.onLoaded = function() {
    var callback;
    var mods    = [];
    var prepend = false;
    
    jSh.toArr(arguments).forEach((arg, i, arr) => {
      if (i + 1 === arr.length) {
        if (jSh.type(arg) !== "function")
          return false;
        
        callback = arg;
      } else {
        if (jSh.type(arg) === "string" && mixList.indexOf(arg) !== -1)
          mods.push(arg);
        else if (typeof arg === "boolean")
          prepend = arg;
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
        if (!prepend)
          loadedModules[mod].callbacks.push(loadObj);
        else
          loadedModules[mod].callbacks.splice(0, 0, loadObj);
      });
    else
      AUR.sandbox(callback); // Modules are loaded already, invoke callback
  }
  
  // Module modProbe logic
  var modToggleEvents = {};
  var aurSettInst     = null;
  
  AUR.modProbe = {
    onToggle(mod, cb) {
      if (!mod || typeof mod !== "string" || typeof cb !== "function" || !this.exists(mod))
        return false;
      
      var modName = mod.replace(/-/g, "") + "mod";
      var evtArr;
      
      if (!modToggleEvents[modName]) {
        evtArr = [];
        evtArr.handler = function(enabled) {
          for (var i=0,l=evtArr.length; i<l; i++) {
            let i2 = i;
            AUR.sandbox(() => evtArr[i2](enabled.value));
          }
        }
        
        aurSettInst.on("AURModsEnabled." + modName + ".enabled", evtArr.handler);
        modToggleEvents[modName] = evtArr;
      }
      
      evtArr = modToggleEvents[modName];
      
      if (evtArr.indexOf(cb) === -1)
        evtArr.push(cb);
    },
    
    removeOnToggle(mod, cb) {
      if (!mod || typeof mod !== "string" || typeof cb !== "function" || !this.exists(mod))
        return false;
      
      var modName = mod.replace(/-/g, "") + "mod";
      var evtArr  = modToggleEvents[modName];
      var index   = evtArr ? evtArr.indexOf(cb) : -1;
      
      if (evtArr && index !== -1)
        evtArr.splice(index, 1);
    },
    
    exists(mod) {
      return mixList.indexOf(mod) !== -1;
    },
    
    enabled(mod) {
      if (!this.exists(mod))
        return null;
      
      var modObj = nameMap[mod];
      
      if (!modObj.register)
        return modObj.initEnabled;
      
      return modObj.enabled;
    }
  };
  
  AUR.onLoaded("aur-settings", function() {
    aurSettInst = AUR.import("aur-settings");
    var modsToggleObj = {};
    
    for (var i=0,l=mixList.length; i<l; i++) {
      var modName = mixList[i].replace(/-/g, "") + "mod";
      modsToggleObj[modName] = {
        enabled: sett.Setting("Mod Enable", "boolean", true)
      };
    }
    
    aurSettInst.setDefault("AURModsEnabled", modsToggleObj);
  });
  
  // Meta validating logic
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
  
  var metaTypeCheckers = {
    [MOD_META_ARR]: v => jSh.type(v) === "array",
    [MOD_META_NUM]: v => typeof v === "number",
    [MOD_META_STR]: v => typeof v === "string",
    [MOD_META_BOOL]: v => typeof v === "boolean"
  };
  
  var modMetaTypes = {
    "NAME": MOD_META_STR,
    "DESC": MOD_META_STR,
    "VERSION": [[MOD_META_ARR, MOD_META_NUM], [MOD_META_NUM]],
    "AUTHORS": [MOD_META_ARR, MOD_META_STR],
    "INTERFACE": MOD_META_STR,
    "RESTART": MOD_META_BOOL,
    "RUN_AT": MOD_META_STR
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
                validItem = null;
            }
            // It's one value
            else {
              validItem = metaTypeCheckers[typeItem[0]](val) ? val : null;
              
              if (validItem !== null)
                break;
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
    var settings = lces.user.settings;
    
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
    
    validMeta["modCodename"] = modName;
    
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
          AUR.sandbox(code, !settings.get("aurSett.modErrorsVerbose"));
          
          // Update any settings
          lces.user.settings.clearLate();
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
    if (enabled) {
      readyMods.push(code);
      code.run_at = validMeta["modRun_at"] || "doc-end";
      code.modName = modName;
    }
  }
  
  AUR.__triggerLoaded = function(modName) {
    var modObj    = loadedModules[modName];
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
          AUR.sandbox(loadObj.cb);
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
  var loadedModulesStart = false;
  
  if (AUR.RUNAT === "doc-end") {
    loadedModulesStart = true;
  }
  
  AUR.on("__load", function() {
    var verbose = AURUserSett.aurSett && AURUserSett.aurSett.modErrorsVerbose;
    
    // Reverse module list for easy plucking
    if (!readyMods.rev) {
      readyMods.reverse();
      readyMods.rev = true;
    }
    
    for (var i=readyMods.length - 1; i>=0; i--) {
      let modFunc = readyMods[i];
      
      if (loadedModulesStart || modFunc.run_at === "doc-start") {
        // Run module
        AUR.sandbox(
          modFunc,
          !verbose,
          function() {
            AUR.__triggerLoaded(modFunc.modName);
          },
          function(err) {
            AUR.__triggerFailed(modFunc.modName, err);
          }
        );
        
        readyMods.splice(i, 1);
      }
    }
    
    // Trigger load event when completely done
    if (loadedModulesStart) {
      // Trigger load event for loaded modules now
      AUR.triggerEvent("load", {});
      AUR.loadedAllModules = true;
    }
  });
  
  if (AUR.RUNAT === "doc-start")
    document.addEventListener("DOMContentLoaded", function() {
      AURDetectInst();
      lces.init();
      
      loadedModulesStart = true;
      AUR.triggerEvent("__load", {});
    });
})();
