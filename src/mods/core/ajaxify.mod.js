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
model.curURLPath = (document.location + "").match(/https?:\/\/(?:[a-z\d](?:[a-z\d\-]*[a-z\d])*\.)+(?:[a-z\d](?:[a-z\d\-]*[a-z\d])*)(\/[^]*)/i)[1];
model.curRequest = null;
model.cachedPages = [];
model.inPopstate = false;

// Ignoring attribute
var ignoreAnchorAttr = "data-aur-ajaxify-ignore";

// Max page cache for history, only set to an even number
var maxPageCache = 50;

// Constructor
reg.interface = function AJAXifyConstructor() {
  lces.type().call(this);
  
  // Add enabled state
  this.ignoreAttr = ignoreAnchorAttr;
  this.setState("enabled", false);
  model.addMember(this);
};

// Instance methods
jSh.inherit(reg.interface, lces.type());
jSh.extendObj(reg.interface.prototype, {
  go(route) {
    if (!jSh.strOp(route, null) || !route)
      return null;
    
    if (/^https?:\/\//.test(route)) {
      if (localLink.test(route)) {
        this.cancel();
        engine(route);
      }
    } else {
      this.cancel();
      engine();
    }
  },
  
  cancel() {
    if (model.curRequest) {
      model.curRequest.abort();
    }
    
    model.curRequest = null;
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
      var general = !route || !(typeof route === "string" || route instanceof RegExp);
      var list    = general ? genEvts : (neg ? negEvts : regEvts);
      
      // Confirm that fn is a valid function and hasn't been added already
      if (typeof fn === "function" && list.indexOf(fn) === -1)
        list.push([
          !general ? route : null,
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
  
  clearExcl(route) {
    if (route && (typeof route === "string" || route instanceof RegExp)) {
      var routeIndex = routeExcl.indexOf(route);
      
      if (routeIndex !== 1) {
        routeExcl.splice(routeIndex, 1);
      }
    }
  },
  
  limit() {
    var routes = jSh.toArr(arguments).filter(r => typeof r === "string" || r instanceof RegExp);
    
    if (routes.length) {
      limitRoutes = true;
      routeLimit = routes;
    } else {
      this.clearLimit();
    }
  },
  
  clearLimit() {
    limitRoutes = false;
    routeLimit = [];
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
for (var i=0,l=engineEvents.length; i<l; i++) {
  var evName = engineEvents[i];
  
  genEvents["on" + evName] = [];
  regEvents["on" + evName] = [];
  negEvents["on" + evName] = [];
}

// Excl/Incl lists
var routeExcl  = [];
var routeLimit = [];
var limitRoutes = false;

// AJAX'ify core engine
function engine(url, cache) {
  var urlPath = url.match(/https?:\/\/(?:[a-z\d](?:[a-z\d\-]*[a-z\d])*\.)+(?:[a-z\d](?:[a-z\d\-]*[a-z\d])*)(\/[^]*)/i)[1];
  model.curURLPath = urlPath;
  
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
    
    var gen = genEvents["on" + evName];
    var reg = regEvents["on" + evName];
    var neg = negEvents["on" + evName];
    
    var cur = evNameMap[evName];
    var tmp = [];
    
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
        
        tmp.push(routeHandler[1]);
      }
    }
      
    cur.push.apply(cur, tmp);
    tmp = [];
    
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
        
        tmp.push(routeHandler[1]);
      }
    }
      
    cur.push.apply(cur, tmp);
    
    // Add general functions
    cur.push.apply(cur, gen.map(h => h[1]));
  }
  
  var abortReq = false;
  var endReq   = false;
  
  // Show the loader
  loadingIndicator.visible = true;
  
  // Call trigger event handlers
  for (var i=0,l=onTrigger.length; i<l; i++) {
    try {
      let breakIter = false;
      
      onTrigger[i]({
        route: urlPath,
        break() {
          breakIter = true;
        },
        abort() {
          abortReq = true;
        }
      });
      
      if (breakIter || abortReq)
        break;
    } catch (e) {
      // YOUR function crashed and burned, NOT mine...
      // ...nothing to do here, moving on...
      console.error("AJAX'ify Callback Error [onTrigger]", e);
    }
  }
  
  // Start loading page
  if (!abortReq) {
    function processPageSrc(src) {
      var parser = new DOMParser();
      var newDOM = jSh(parser.parseFromString(src, "text/html"));
      var curDOM = jSh(document);
      
      // Filter stage
      for (var i=0,l=onFilter.length; i<l; i++) {
        try {
          let breakIter = false;
          
          onFilter[i]({
            route: urlPath,
            dom: newDOM,
            domOld: curDOM,
            cache: !!cache,
            break() {
              breakIter = true;
            },
            abort() {
              abortReq = true;
            },
            end() {
              endReq = true;
            }
          });
          
          if (breakIter || abortReq || endReq)
            break;
        } catch(e) {
          // An error at filtering stage...
          console.error("AJAX'ify Callback Error [onFilter]", e);
        }
      }
      
      if (abortReq)
        return false;
      
      // Clear stage
      if (!endReq)
        for (var i=0,l=onClear.length; i<l; i++) {
          try {
            let breakIter = false;
            
            onClear[i]({
              route: urlPath,
              dom: curDOM,
              domNew: newDOM,
              cache: !!cache,
              break() {
                breakIter = true;
              },
              abort() {
                abortReq = true;
              },
              end() {
                endReq = true;
              }
            });
            
            if (breakIter || abortReq || endReq)
              break;
          } catch(e) {
            // Error at clearing stage
            console.error("AJAX'ify Callback Error [onClear]", e);
          }
        }
      
      if (abortReq)
        return false;
      
      // Merge stage
      if (!endReq)
        for (var i=0,l=onMerge.length; i<l; i++) {
          try {
            let breakIter = false;
            
            onMerge[i]({
              route: urlPath,
              domNew: newDOM,
              domOld: curDOM,
              cache: !!cache,
              break() {
                breakIter = true;
              }
            });
            
            if (breakIter)
              break;
          } catch(e) {
            // Error at clearing stage
            console.error("AJAX'ify Callback Error [onMerge]", e);
          }
        }
      
      // Now that we've loaded, gonna pushstate
      if (!cache)
        window.history.pushState({
          aurAjaxify: true,
          route: urlPath
        }, "New AJAX'fy page", urlPath);
      
      // Scroll to top
      scrollTo(0, 0);
      
      // Loaded stage
      for (var i=0,l=onLoad.length; i<l; i++) {
        try {
          let breakIter = false;
          
          onLoad[i]({
            route: urlPath,
            cache: !!cache,
            break() {
              breakIter = true;
            }
          });
          
          if (breakIter)
            break;
        } catch(e) {
          // Error at loaded stage
        }
      }
      
      loadingIndicator.visible = false;
      // Finished this engine...
    }
    
    // Check if we don't have a cache saved already
    var cachedPage = model.cachedPages.indexOf(urlPath);
    
    if (cachedPage === -1 || !model.inPopstate)
      var req = new lcRequest({
        method: "GET",
        uri: urlPath,
        success() {
          var cachedPages = model.cachedPages;
          
          // Save to cache or replace older one
          if (cachedPage === -1) {
            cachedPages.push(urlPath, this.responseText);
            
            // Prevent cache from occupying too much memory
            if (cachedPages.length > maxPageCache)
              model.cachedPages = cachedPages.slice(-maxPageCache);
          } else {
            // Remove and readd to the front
            cachedPages.splice(cachedPage, 2);
            cachedPages.push(urlPath, this.responseText);
          }
          
          // Load the page
          processPageSrc(this.responseText);
        },
        fail() {
          if (this.status === 0) // Browser denied with influence from a 3rd party source
          document.location = "http://www.animeultima.io" + urlPath; // Force user to the location
          else {
            // Do some... Kinda... Magic... Here...
          }
        }
      });
    else {
      // Make dummy request object
      req = {
        abort() {}
      };
      
      // Pass cache instead
      processPageSrc(model.cachedPages[cachedPage + 1]);
      model.inPopstate = false;
    }
    
  }
  
  model.curRequest = req;
  req.send();
}

function stripHash(urlPath) {
  return urlPath.match(/^([^#]+)(?:#[^]*)?$/)[1];
}

function isValidRoute(route, newPath) {
  var urlPath = route.match(/https?:\/\/(?:[a-z\d](?:[a-z\d\-]*[a-z\d])*\.)+(?:[a-z\d](?:[a-z\d\-]*[a-z\d])*)(\/[^]*)/i)[1];
  var valid = true;
  
  if (!newPath) {
    // Make sure it isn't a hash link
    var rawPath    = stripHash(urlPath);
    var curRawPath = stripHash(model.curURLPath);
    
    if (rawPath === curRawPath && urlPath !== model.curURLPath) {
      return false;
    }
  }
  
  if (limitRoutes) {
    valid = false;
    
    for (var i=0,l=routeLimit.length; i<l; i++) {
      var limit = routeLimit[i];
      
      if (typeof limit === "string") {
        if (urlPath === limit) {
          valid = true;
          break;
        }
      } else {
        if (limit.test(urlPath)) {
          valid = true;
          break;
        }
      }
    }
  }
    
  for (var i=0,l=routeExcl.length; i<l; i++) {
    var excl = routeExcl[i];
    
    if (typeof excl === "string") {
      if (urlPath === excl) {
        valid = false;
        break;
      }
    } else {
      if (excl.test(urlPath)) {
        valid = false;
        break;
      }
    }
  }
  
  return valid;
}

// Capturing events
var localLink = new RegExp(
  "^https?://" +
  location.host.replace(/\./g, "\\.") +
  "/[^]*", "i"
);

var curAnchor = false;
var curHref   = null;

function onWinMDown(e) {
  if (!isValidRoute(document.location + "", true) || e.ctrlKey || e.altKey || e.shiftKey)
    return false;
  
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
        if (target.getAttribute(ignoreAnchorAttr) === null &&
            localLink.test(target.href))
          anchor = target;
        
        break;
      }
      
      target = target.parentNode;
    }
    
    // We found a valid link
    if (anchor && anchor.getAttribute("target") !== "_blank" && isValidRoute(anchor.href)) {
      e.preventDefault();
      curAnchor = anchor;
      curHref = anchor.href;
      
      reg.interface.prototype.cancel();
      anchor.href = "javascript: void(0);";
      engine(curHref);
    }
  }
}

function onWinMUp(e) {
  setTimeout(function() {
    curAnchor.href = curHref;
  }, 10);
}

function onWinKDown(e) {
  if (!isValidRoute(document.location + "", true))
    return false;
  
  // Only start if Enter key
  if (e.keyCode === 13) {
    var target = e.target;
    var anchor = null;
    
    // Check if the anchor isn't flagged with the ignore flag and isn't
    // a link to a foreign host
    if (target.tagName === "A" &&
        target.getAttribute(ignoreAnchorAttr) === null &&
        localLink.test(target.href))
      anchor = target;
    
    // Anchor is valid
    if (anchor && anchor.getAttribute("target") !== "_blank" && isValidRoute(anchor.href)) {
      e.preventDefault();
      curAnchor = anchor;
      curHref = anchor.href;
      
      reg.interface.prototype.cancel();
      engine(anchor.href);
      
      setTimeout(function() {
        curAnchor.href = curHref;
      }, 10);
    }
  }
}

function onPopstate(e) {
  if (model.enabled) {
    if (isValidRoute(document.location + "")) {
      model.inPopstate = true;
      engine(document.location.toString(), e);
    }
  } else {
    location.reload();
  }
}

window.addEventListener("popstate", onPopstate);
model.addStateListener("enabled", function(enabled) {
  if (enabled) {
    window.addEventListener("mousedown", onWinMDown);
    window.addEventListener("mouseup", onWinMUp);
    window.addEventListener("keydown", onWinKDown);
  } else {
    window.removeEventListener("mousedown", onWinMDown);
    window.removeEventListener("mouseup", onWinMUp);
    window.removeEventListener("keydown", onWinKDown);
  }
});

// Loading indicator
var loadingIndicator = lces.new("widget", jSh.d(".aur-ajaxify-loading-indicator", undf, [
  jSh.t("AJAX'ify loading"),
  jSh.d(".aur-busy-spinner")
]));

var liVisibleTimeout = null;
loadingIndicator.setState("visible", false);
loadingIndicator.addStateListener("visible", function(visible) {
  if (visible) {
    clearTimeout(liVisibleTimeout);
    loadingIndicator.classList.add("aur-ajaxify-spinner-visible")
    
    loadingIndicator.classList.add("visible");
  } else {
    loadingIndicator.classList.remove("visible");
    
    liVisibleTimeout = setTimeout(function() {
      loadingIndicator.classList.remove("aur-ajaxify-spinner-visible")
    }, 520);
  }
});

AUR.onLoaded("aur-ui", "aur-styles", function() {
  var style = AUR.import("aur-styles");
  
  style.styleBlock(`
    .aur-ajaxify-loading-indicator {
      position: fixed;
      z-index: 1000000;
      top: -45px;
      left: 0px;
      right: 0px;
      margin: 0px auto;
      height: 45px;
      width: 178px;
      
      line-height: 45px;
      text-align: center;
      font-size: 15px;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.65);
      background: rgba(199, 206, 217, 0.9);
      border-bottom-left-radius: 3px;
      border-bottom-right-radius: 3px;
      
      opacity: 0;
      box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.25);
      transition: top 500ms cubic-bezier(.31,.26,.1,.92), opacity 500ms cubic-bezier(.31,.26,.1,.92);
      pointer-events: none;
      user-select: none;
      -moz-user-select: none;
    }
    
    .aur-ajaxify-loading-indicator.visible {
      opacity: 0.85;
      top: 0px;
    }
    
    .aur-ajaxify-loading-indicator .aur-busy-spinner {
      position: relative;
      display: inline-block;
      vertical-align: middle;
      width: 24px;
      height: 24px;
      margin-left: 10px;
    }
    
    .aur-ajaxify-loading-indicator .aur-busy-spinner::after {
      content: unset !important;
    }
    
    .aur-ajaxify-loading-indicator.aur-ajaxify-spinner-visible .aur-busy-spinner::after {
      content: "" !important;
    }
  `);
  
  document.body.appendChild(loadingIndicator.element);
});
