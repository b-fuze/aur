//
AUR_NAME = "AUR Live Data";
AUR_DESC = "AUR Live Data API";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_INTERFACE = "auto";
AUR_RUN_AT = "doc-start";

reg.interface = {
  dataBank(data) {
    var dbank = new DataBank();
    dbank.addData(data);
    
    return dbank;
  }
};

function empty() {
  // Empty function for reference
}

function DataBank() {
  this.__data = {};
  this.__dataNames = [];
  this.__exports = [];
}

jSh.extendObj(DataBank.prototype, {
  addData(data) {
    if (data instanceof Object && Object.getPrototypeOf(data).constructor === Object) {
      var names = Object.getOwnPropertyNames(data);
      
      for (var i=0,l=names.length; i<l; i++) {
        var name = names[i];
        var fn   = data[name];
        
        if (typeof fn === "function")
          this.addProp(name, fn);
      }
    }
  },
  
  addProp(prop, fn) {
    var dataObj = {
      value: undefined,
      update: fn
    };
    
    this.__data[prop] = dataObj;
    this.__dataNames.push(prop);
    
    // Try to update it
    try {
      dataObj.value = fn();
    } catch (e) {
      // Nothing to do here
    }
    
    // Add new prop to exports too
    var _exports = this.__exports;
    
    for (var i=0,l=_exports.length; i<l; i++) {
      Object.defineProperty(_exports[i], prop, {
        configurable: false,
        enumerable: true,
        set: empty,
        get: () => dataObj.value
      });
    }
  },
  
  exportBank() {
    var exBank = {};
    var names  = this.__dataNames;
    
    for (var i=0,l=names.length; i<l; i++) {
      let name    = names[i];
      let dataObj = this.__data[name];
      
      Object.defineProperty(exBank, name, {
        configurable: false,
        enumerable: true,
        set: empty,
        get: () => dataObj.value
      });
    }
    
    this.__exports.push(exBank);
    return exBank;
  },
  
  update() {
    var names       = this.__dataNames;
    var dataObjects = this.__data;
    
    for (var i=0,l=names.length; i<l; i++) {
      var dataObj = dataObjects[names[i]];
      
      try {
        dataObj.value = dataObj.update();
      } catch (e) {
        // Nothing to do here
      }
    }
  }
});
