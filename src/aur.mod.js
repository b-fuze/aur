// AUR Core Module Management Logic

(function() {
  var modArray = []; // Array containing all the registered modules
  var nameMap  = {}; // Module name map
  var modOpt   = false;
  
  var coreList = [AUR_EMPTYCORE]; // Replaced by build.aur.js
  var miscList = [AUR_EMPTYMISC]; // Ditto
  var mixList  = coreList.concat(miscList);
  
  var deepList      = [AUR_DEEPMODS];
  var deepStructure = AUR_DEEPMODS_STRUCTURE; // { __parent: null };
  
  function linkDeepParents(obj, parent) {
    var names = Object.getOwnPropertyNames(obj);
    
    if (parent) {
      // A subdirectory
      obj.__parent = parent;
    } else {
      // The root directory
      obj.__subFilesInitialized = 0; // To know when `module` onLoads
    }
    
    // Traverse into hieararchy
    for (var i=0,l=names.length; i<l; i++) {
      var name         = names[i];
      var curDepthItem = obj[name];
      
      if (name !== "__parent" && jSh.type(curDepthItem) === "object" && !curDepthItem.__subFile) {
        linkDeepParents(curDepthItem, obj);
      }
    }
    
    if (!parent) {
      for (var i=0,l=names.length; i<l; i++) {
        obj[names[i]].__loadedSubfiles = 0;
      }
    }
  }
  
  // Link the __parent properties
  linkDeepParents(deepStructure);
  
  // Example:
  // var deepStructure = {
  //   "aur-themify": {
  //     // !!!!!!IMPORTANT!!!!!!
  //     // "main.js" HAS NO PLACE HERE. If you want it, you can still: AUR.import("aur-themify"), or AUR.import("./main.js")
  //     // !!!!!!IMPORTANT!!!!!!
  //
  //     "test.js": {
  //       register: nameMap["aur-themify/test.js"].register,
  //       name: "aur-themify/test.js"
  //     },
  //
  //     "main": {
  //       "header.js": {
  //         register: nameMap["aur-themify/main/header.js"].register,
  //         name: "aur-themify/main/header.js"
  //       },
  //       "content.js": {
  //         register: nameMap["aur-themify/main/content.js"].register,
  //         name: "aur-themify/main/content.js"
  //       }
  //     },
  //
  //     "episode": {
  //       "player.js": {
  //         register: nameMap["aur-themify/episode/player.js"].register,
  //         name: "aur-themify/episode/player.js"
  //       },
  //
  //       "comments.js": {
  //         register: nameMap["aur-themify/episode/comments.js"].register,
  //         name: "aur-themify/episode/comments.js"
  //       }
  //     }
  //   },
  //   __parent: null
  // };
  
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
  
  var sett = lces.user && lces.user.settings;
  
  if (sett) {
    var settDump = {};
    sett.default = settDump;
  }
  
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
  
  // TODO: This looks like it needs to be cleaned up
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
    lces.types.group.call(this);
    var that = this;
    
    // Module interface default
    this.interfaceType = "literal";
    this.interface = null;
    var settings   = null;
    
    var validITypes = ["auto", "literal"];
    // this.addStateCondition("interfaceType", function(itype) {
    //   if (validITypes.indexOf(itype) === -1)
    //     return false;
    //
    //   return true;
    // });
    
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
  
  jSh.inherit(ModRegister, lces.types.group);
  
  function DeepModRegister(modName, base) {
    lces.types.component.call(this);
    var that = this;
    
    // Module interface default
    this.interfaceType = "literal";
    this.interface = null;
    jSh.constProp(this, "modName", base.modName);
    
    this.addEvent("moddisable");
    this.addEvent("modenable");
    this.addEvent("loaded");
    
    // Link to base
    Object.defineProperty(this, "modDesc", {
      configurable: false,
      get: function() { return base.modDesc }
    });
    
    Object.defineProperty(this, "modVersion", {
      configurable: false,
      get: function() { return base.modVersion }
    });
    
    Object.defineProperty(this, "modAuthors", {
      configurable: false,
      get: function() { return base.modAuthors }
    });
    
    Object.defineProperty(this, "ui", {
      configurable: false,
      get: function() { return base.ui }
    });
    
    base.on("moddisable", function(e) {
      that.triggerEvent("moddisable", e);
    });
    
    base.on("modenable", function(e) {
      that.triggerEvent("modenable", e);
    });
    
    base.on("loaded", function(e) {
      that.triggerEvent("loaded", e);
    });
  }
  
  jSh.inherit(DeepModRegister, lces.types.component);
  
  // AUR.__initializeModule(modName)
  //
  // modName: Required. Module name
  //
  // Description: Register a new module in the AUR module system.
  AUR.__initializeModule = function(modName, premInterface) {
    var shell = this;
    
    // Check module name
    if (jSh.type(modName) !== "string" || modName.length === 0)
      return null;
    
    var modObj       = nameMap[modName];
    var isDeepMod    = /\//.test(modName);
    var deepSplit    = modName.replace(/\/+/, "/").split("/");
    var baseDeepName = isDeepMod ? deepSplit[0] : null;
    var modRegs;
    
    if (!modObj.register) {
      // Construct new AUR module interface register
      modRegs = new ModRegister(baseDeepName || modName);
      modRegs.ui = modObj.ui;
      modRegs.enabled = true;
      
      // Add to collection
      modArray.push(modRegs);
      
      // Append register to module Object
      jSh.extendObj(modObj, {
        register: modRegs
      });
      
      // Set interface type from meta if provided
      modRegs.interfaceType = modObj.modInterface;
    } else {
      modRegs = modObj.register;
    }
    
    if (isDeepMod && !(deepSplit.length === 2 && deepSplit[1] === "main.js")) {
      var baseRegs = modRegs;
      modRegs = new DeepModRegister(modName, modRegs);
      
      // Add subfile interfaceType
      var subFileInterfaceType = (modObj.subFileMeta[modName].modInterface + "").trim().toLowerCase();
      
      switch (subFileInterfaceType) {
        case "auto":
        case "literal":
          modRegs.interfaceType = subFileInterfaceType;
          break;
        default:
          modRegs.interfaceType = "literal";
      }
      
      var deepDepth = locateModuleComponent(null, deepSplit);
      deepDepth.register = modRegs;
      
      modObj.subRegisters[modName] = modRegs;
    }
    
    return modRegs;
  }
  
  // ModShell constructor
  //
  // Description: A thin shell encapsulating the module's `AUR` interface, to
  // provide various functions like AUR DeepMod functionality, etc.
  function ModShell(name, tree) {
    jSh.constProp(this, "name", name);
    jSh.constProp(this, "path", tree);
  }
  
  ModShell.prototype = AUR;
  Object.defineProperty(AUR, "constructor", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: ModShell
  });
  
  AUR.__relative = function(path) {
    return new ModShell(path[0], path);
  }
  
  function locateModuleComponent(curPath, destPath, name) {
    if (destPath.length == 1) {
      if (name) {
        return destPath[0];
      } else {
        return deepStructure[destPath[0]];
      }
    }
    
    if (!curPath)
      curPath = [];
    
    var curObject = deepStructure;
    var firstPart = destPath[0];
    
    // Prepare for relative (non-absolute) path if necessary
    if (firstPart === "." || firstPart === "..") {
      for (var i=0,l=curPath.length; i<l; i++) {
        curObject = curObject[curPath[i]];
      }
    }
    // Prepare for an absolute path
    else if (firstPart.trim() === "") {
      curObject = curObject[curPath[0]];
    }
    
    for (var i=0,l=destPath.length; i<l; i++) {
      var curPathComponent = destPath[i];
      
      switch (curPathComponent) {
        case "..":
          curObject = curObject.__parent;
          break;
        case "":
        case ".":
          // Do nothing
          break;
        default:
          if (i + 1 === l) {
            curObject = curObject[curPathComponent + ".js"] || curObject[curPathComponent];
          } else {
            curObject = curObject[curPathComponent];
          }
      }
      
      if (!curObject)
        throw new ReferenceError("No such AUR path, \"" + curPath.join("/") + destPath.join("/") + "\"");
    }
    
    return name ? curObject.name : curObject;
  }
  
  AUR.import = function(modNamePath, ...args) {
    var shell        = this; // AUR ModShell
    var modName      = locateModuleComponent(shell.path, modNamePath.replace(/\/+/g, "/").split("/"), true);
    var isDeepImport = /\//.test(modNamePath);
    
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
    if (isDeepImport) {
      aurMod = locateModuleComponent(shell.path, modNamePath.replace(/\/+/g, "/").split("/"));
    }
    
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
    var shell   = this;
    var mods    = [];
    var prepend = false;
    
    jSh.toArr(arguments).forEach((arg, i, arr) => {
      if (i + 1 === arr.length) {
        if (jSh.type(arg) !== "function")
          return false;
        
        callback = arg;
      } else {
        if (jSh.type(arg) === "string") {
          // Check if checking on a deep module subfile
          if (/\//.test(arg)) {
            arg = locateModuleComponent(shell.path, arg.replace(/\/+/g, "/").split("/"), true);
          }
          
          if (mixList.indexOf(arg) !== -1)
            mods.push(arg);
        } else if (typeof arg === "boolean")
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
      if (!mod || typeof mod !== "string" || typeof cb !== "function" || /\//.test(mod) || !this.exists(mod))
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
      if (!mod || typeof mod !== "string" || typeof cb !== "function" || /\//.test(mod) || !this.exists(mod))
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
      if (/\//.test(mod) || !this.exists(mod))
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
      var mod = mixList[i];
      var modName = mod.replace(/-/g, "") + "mod";
      modsToggleObj[modName] = {
        enabled: sett.Setting("Mod Enable", "boolean", nameMap[mod].initEnabled)
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
    "RUN_AT": MOD_META_STR,
    "USERSCRIPT_CLAUSE": [[MOD_META_ARR, MOD_META_STR], [MOD_META_STR]],
    "DEFAULT_DISABLED": MOD_META_BOOL
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
    var settings    = lces.user && lces.user.settings;
    var isDeepFile  = /\//.test(modName);
    var isDeepMain  = false;
    var modBaseName = null;
    var modObj;
    
    if (isDeepFile) {
      var deepSplit = modName.split("/");
      
      modBaseName = deepSplit[0];
      isDeepMain  = deepSplit.length === 2 && deepSplit[1] === "main.js";
      modSettName = modBaseName.replace(/-/g, "") + "mod";
    }
    
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
        validMeta[metaName] = metaTypeValidate(modMetaTypes[meta], details[metaName]);
      } else {
        validMeta[metaRegName] = null;
      }
    }
    
    validMeta["modCodename"] = modBaseName || modName;
    
    if (AURUserModSett[modSettName])
      var enabled = AURUserModSett[modSettName].enabled;
    else
      var enabled = validMeta["AUR_DEFAULT_DISABLED"] === true ? false : true;
    
    if (isDeepFile) {
      var modRoot = locateModuleComponent(null, [modBaseName]);
      
      if (!modRoot.modObj) {
        modObj = makeModObj();
        modRoot.modObj = modObj;
        modObj.subFileMeta = {};
      } else {
        modObj = modRoot.modObj;
      }
      
      // Add subfile to modObj
      nameMap[modName] = modObj;
      modObj.code.push({
        code: code,
        modName: isDeepMain ? modBaseName : modName
      });
      
      // Save subfile meta
      modObj.subFileMeta[modName] = validMeta;
      
      // Add AUR_RUN_AT
      code.run_at = deepStructure[modBaseName].__runAt;
      
      if (isDeepMain)
        jSh.extendObj(modObj, validMeta);
    } else {
      // Not a deep module
      modObj = makeModObj();
    }
    
    function makeModObj() {
      // Create module object
      var modObj = lces.new();
      modObj.initEnabled = enabled;
      modObj.setState("enabled", enabled);
      
      if (isDeepFile) {
        modObj.code = [];
        modObj.subRegisters = {};
      }
      
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
            
            // Check if doesn't have deepmod code
            if (!modObj.code) {
              AUR.sandbox(
                code,
                settings ? !settings.get("aurSett.modErrorsVerbose") : true,
                function() {
                  AUR.__triggerLoaded(modName);
                },
                function(err) {
                  AUR.__triggerFailed(modName, err);
                }
              );
            } else {
              var lastModName;
              
              for (var i=0; i<modObj.code.length; i++) {
                var curCode = modObj.code[i];
                lastModName = curCode.modName;
                
                AUR.sandbox(
                  curCode.code,
                  settings ? !settings.get("aurSett.modErrorsVerbose") : true,
                  function() {
                    AUR.__triggerLoaded(curCode.modName);
                  },
                  function(err) {
                    AUR.__triggerFailed(curCode.modName, err);
                  }
                );
              }
              
              if (lastModName !== modBaseName)
                AUR.__triggerLoaded(modBaseName);
            }
            
            // Update any settings
            if (lces.user)
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
      
      if (!isDeepFile)
        jSh.extendObj(modObj, validMeta);
      nameMap[modBaseName || modName] = modObj;
      
      return modObj;
    }
    
    // Check if module's disabled
    if (enabled) {
      readyMods.push(code);
      
      if (isDeepFile) {
        code.modName  = isDeepMain ? modBaseName : modName;
        code.deepRoot = deepStructure[modBaseName];
        code.deepName = modBaseName;
      } else {
        code.modName = modName;
        code.run_at  = validMeta["modRun_at"] || "doc-end";
      }
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
    AUR.error(`Module "${ modName }" failed to load - ${ err }\n\n${ err.stack }`);
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
    
    for (var i=readyMods.length-1; i>=0; i--) {
      let modFunc = readyMods[i];
      
      if (loadedModulesStart || modFunc.run_at === "doc-start") {
        // Run module
        AUR.sandbox(
          modFunc,
          !verbose,
          function() {
            AUR.__triggerLoaded(modFunc.modName);
            
            // Check if deepmod subfile without a main.js
            var modDeepRoot = modFunc.deepRoot;
            if (modDeepRoot && !modDeepRoot.__hasMain) {
              modDeepRoot.__loadedSubfiles += 1;
              
              if (modDeepRoot.__loadedSubfiles === modDeepRoot.__subFileCount)
                AUR.__triggerLoaded(modFunc.deepName);
            }
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
