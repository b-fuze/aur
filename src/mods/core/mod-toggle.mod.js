AUR_NAME = "Mod Toggle";
AUR_DESC = "A module enable/disable toggle helper";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;

var settQueue  = [];
var groupQueue = [];
var sett;

AUR.onLoaded("aur-settings", function() {
  sett = AUR.import("aur-settings");
});

reg.interface = function(register) {
  lces.type("component").call(this);
  var that = this;
  
  jSh.extendObj(this, {
    // Queues for when a module isn't loaded yet
    settQueue: [],
    groupQueue: [],
    
    // Arrays for the sett/group watchers
    settings: [],
    groups: []
  });
  
  this.setState("enabled", true);
  this.addStateListener("enabled", function(enabled) {
    // Loop settings and pass on news
    var settings = that.settings;
    var toggle   = enabled ? 0 : 1;
    
    for (var i=0,l=settings.length; i<l; i++) {
      settings[i][toggle]();
    }
  });
  
  if (register && typeof register.on === "function") {
    register.on("moddisable", function() {
      that.enabled = false;
    });
    
    register.on("modenable", function() {
      that.enabled = true;
    });
  }
};

// Append necessary properties
jSh.extendObj(reg.interface.prototype, {
  setting: setting,
  wrap: wrap
});

// Keep settings up-to-date with appropriate module toggle state
function setting(link, disabled) {
  // Check if sett has been imported
  if (!sett) {
    this.settQueue.push(link);
    settQueue.push(this);
    
    return false;
  }
  
  var settObj = sett.getDetails(link);
  var curValue;
  var settingVal;
  
  // Check the setting exists
  if (!settObj)
    return false;
  
  // Value change listener
  curValue = settObj.value;
  sett.on(link, function(e) {
    if (settingVal) {
      settingVal = false;
      return false;
    }
    
    curValue = e.value;
  });
  
  function enable() {
    settingVal = true;
    sett.set(link, curValue);
    settingVal = false;
  }
  
  function disable() {
    settingVal = true;
    sett.set(link, disabled);
    settingVal = false;
  }
  
  // Add to list
  this.settings.push([enable, disable]);
}

function wrap(group) {
  
}
