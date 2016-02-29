// AUR Core Module Management Logic

(function() {
  var modArray = []; // Array containing all the registered modules
  var nameMap  = {}; // Module name map
  
  var coreList = [EMPTYCORE]; // Replaced by build.aur.js
  var miscList = [EMPTYMISC]; // Ditto
  var mixList  = coreList.concat(miscList);
  
  // Prematurely imported modules
  var preimports = {};
  
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
    
    // Module name and version
    jSh.constProp(this, "modName", modName);
    this.modVersion = 1;
    
    // Events
    this.addEvent("modKill");
    this.addEvent("loaded");
    
    // Check the dummy interfaces
    if (preimports[modName]) {
      // DO MAGIC HERE
    }
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
    
    // Add to collection
    modArray.push(modRegs);
    nameMap[modName] = modRegs;
    
    return modRegs;
  }
  
  AUR.import = function(modName, ...args) {
    var aurMod = nameMap[modName];
    var aurInstance = {};
    
    // Check for loaded module
    if (!aurMod || modArray.indexOf(aurMod) === -1) {
      // Check if module will load at all
      if (mixList.indexOf(modName) !== -1) {
        if (!preimports[modName])
          preimports[modName] = [];
        
        var dummyInterface = {__events: {}};
        preimports[modName].push(dummyInterface);
        
        dummyInterface.on = function(evt, callback) {
          if (!this.__events[evt])
            this.__events[evt] = [];
          
          this.__events[evt].push(callback);
        }
        
        return dummyInterface;
      }
      
      return null;
    }
    
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
    aurInstance.on = instMethods.on.bind(aurMod);
    aurInstance.removeListener = instMethods.removeListener.bind(aurMod);
    
    // Module-specific properties
    aurInstance.modName = aurMod.modName;
    
    return aurInstance;
  }
})();
