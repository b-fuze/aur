// AUR AJAX'ify module
AUR_NAME = "AUR AJAX'ify";
AUR_DESC = "AUR AJAX'ify API";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;
AUR_INTERFACE = "auto";
AUR_RUN_AT = "doc-start";

// AJAX'ify main model
var model = lces.new("group");
model.setState("enabled", false);
model.setState("scriptsEnabled", false);
model.curRequest = null;

// Ignoring attribute
var ignoreAnchorAttr = "data-aur-ajaxify-ignore";

// Constructor
reg.interface = function AJAXifyConstructor() {
  lces.type().call(this);
  
  // Add enabled state
  this.setState("enabled", false);
  model.addMember(this);
};

// Instance methods
jSh.inherit(reg.interface, lces.type());
jSh.extendObj(reg.interface.prototype, {
  load(route) {
    
  },
  
  cancel() {
    
  },
  
  // Event adding function
  onEvent(event, route, arg2, arg3) {
    event = jSh.strCapitalize((event + "").toLowerCase()); // Coerce to string
    
    // Check if event exists
    if (genEvents["on" + event]) {
      var genEvts = genEvents["on" + event];
      var regEvts = regEvents["on" + event];
      var negEvts = negEvents["on" + event];
      
      var hasNeg  = typeof arg2 === "boolean";
      var neg     = hasNeg ? arg2 : false;
      var fn      = hasNeg ? arg3 : arg2;
      var general = route && (typeof route === "string" || route instanceof RegExp);
      var list    = general ? genEvts : (neg ? negEvts : regEvts);
      
      // Confirm that fn is a valid function and hasn't been added already
      if (typeof fn === "function" && list.indexOf(fn) === -1)
        list.push([
          general ? route : null,
          fn
        ]);
    }
  },
  
  excl(route) {
    if (route && (typeof route === "string" || route instanceof RegExp)) {
      var routeIndex = routeExcl.indexOf(route);
      
      if (routeIndex === -1) {
        routeExcl.push(route);
      }
    }
  },
  
  incl(route) {
    if (route && (typeof route === "string" || route instanceof RegExp)) {
      var routeIndex = routeExcl.indexOf(route);
      
      if (routeIndex !== 1) {
        routeExcl.splice(routeIndex, 1);
      }
    }
  },
  
  limit() {
    var routes = jSh.toArr(arguments);
  },
  
  remove(evt, route, arg3, arg4) {
    
  },
  
  enable() {
    model.enabled = true;
  },
  
  disable() {
    model.enabled = false;
  }
});

// Event handler containers
var engineEvents = [
  "Load",
  "Trigger",
  "Filter",
  "Clear",
  "Merge"
];

// Make general, regular, and negative event containers
var genEvents = {};
var regEvents = {};
var negEvents = {};

// Create event arrays
for (var i,l=engineEvents.length; i<l; i++) {
  var evName = engineEvents[i];
  
  genEvents["on" + evName] = [];
  regEvents["on" + evName] = [];
  negEvents["on" + evName] = [];
}

// Excl/Incl lists
var routeExcl  = [];
var routeLimit = [];

// AJAX'ify core engine
function engine(url) {
  var urlPath = url.match(/https?:\/\/(?:[a-z\d](?:[a-z\d\-]*[a-z\d])*\.)+(?:[a-z\d](?:[a-z\d\-]*[a-z\d])*)(\/[^]*)/i)[1];
  
  // Get all associated handlers
  var onLoad    = [];
  var onTrigger = [];
  var onFilter  = [];
  var onClear   = [];
  var onMerge   = [];
  
  var evNameMap = {
    Load: onLoad,
    Trigger: onTrigger,
    Filter: onFilter,
    Clear: onClear,
    Merge: onMerge
  };
  
  for (var ie=0,le=engineEvents.length; ie<le; ie++) {
    var evName   = engineEvents[ie];
    var clearGen = false;
    
    var gen = genEvents[evName];
    var reg = regEvents[evName];
    var neg = negEvents[evName];
    
    var cur = evNameMap[evName];
    var tmp = gen.slice();
    
    // Breaking DRY principle here too...
    for (var i=0,l=reg.length; i<l; i++) {
      var routeHandler = reg[i];
      var route        = routeHandler[0];
      var valid        = false;
      
      if (typeof route === "string") {
        if (route === urlPath)
          valid = true;
      } else {
        if (route.test(urlPath))
          valid = true;
      }
      
      if (valid) {
        if (!clearGen) {
          tmp = [];
          
          clearGen = true;
        }
        
        tmp.push(routeHandler);
      }
    }
    
    for (var i=0,l=neg.length; i<l; i++) {
      var routeHandler = neg[i];
      var route        = routeHandler[0];
      var valid        = false;
      
      if (typeof route === "string") {
        if (route !== urlPath)
          valid = true;
      } else {
        if (!route.test(urlPath))
          valid = true;
      }
      
      if (valid) {
        if (!clearGen) {
          tmp = [];
          
          clearGen = true;
        }
        
        tmp.push(routeHandler);
      }
    }
  }
  
  // Call trigger event handlers
  for (var i=0,l=onTrigger.length; i<l; i++) {
    try {
      onTrigger[i](urlPath);
    } catch (e) {
      // YOUR function crashed and burned, NOT mine...
      // ...nothing to do here, moving on...
    }
  }
  
  // Start loading page
  var req = new lcRequest({
    method: "GET",
    uri: urlPath,
    success() {
      // TODO: Finish this engine...
    },
    fail() {
      // Do some... Kinda... Magic... Here...
    }
  });
  
  model.curRequest = req;
  req.send();
}

// Capturing events
var localLink = new RegExp(
  "^https?://" +
  location.host.replace(/\./g, "\\.") +
  "/[^]*", "i"
);

function onWinMDown(e) {
  // Only start if main mouse button
  if (e.button === 0) {
    var target = e.target;
    var body   = document.body;
    var anchor = null;
    
    // Inversely traverse to find any encapsulating anchor elements
    while (target !== body) {
      if (target.tagName === "A") {
        // Check if the anchor isn't flagged with the ignore flag and isn't
        // a link to a foreign host
        if (target.getAttribute(ignoreAnchorAttr) !== null &&
            localLink.test(target.href))
          anchor = target;
        
        break;
      }
      
      target = target.parentNode;
    }
    
    // We found a valid link
    if (anchor) {
      e.preventDefault();
      engine(anchor.href);
    }
  }
}

function onWinKDown(e) {
  // Only start if Enter key
  if (e.keyCode === 13) {
    var target = e.target;
    var anchor = null;
    
    // Check if the anchor isn't flagged with the ignore flag and isn't
    // a link to a foreign host
    if (target.tagName === "A" &&
        target.getAttribute(ignoreAnchorAttr) !== null &&
        localLink.test(target.href))
      anchor = target;
    
    // Anchor is valid
    if (anchor) {
      e.preventDefault();
      engine(anchor.href);
    }
  }
}

model.addStateListener("enabled", function(enabled) {
  if (enabled) {
    window.addEventListener("mousedown", onWinMDown);
    window.addEventListener("keydown", onWinKDown);
  } else {
    window.removeEventListener("mousedown", onWinMDown);
    window.removeEventListener("keydown", onWinKDown);
  }
});
