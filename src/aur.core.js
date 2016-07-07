// AUR Core - First file included in the build script AFTER jShorts and LCES (lces.current.js)
//
// Build script: /aur/build.aur.js

// Detect multiple instances
var activeAURInst = jSh("#aur-instance-marker");

if (activeAURInst) {
  throw new Error("An AUR instance \"" + jSh.strOp(activeAURInst.getAttribute("data-aur-name"), "Default") + "\" is already running.");
}

// Get reference to global
var AURGlobal  = (()=>{return this})();
var AURAppName = "AUR_BUILDNAME";

// Create AUR instance hook element
jSh("head")[0].appendChild(jSh.c("meta", {
  attr: {
    "data-aur-name": AURAppName,
    "content": AURAppName,
    "type": "aur-instance-marker",
    "id": "aur-instance-marker"
  }
}));

// Add constant AUR to window
jSh.constProp(this, "AUR", new lcComponent());
var AUR = this.AUR;

AUR.addEvent("load");

AUR._on = AUR.on;
AUR.on = function(ev, func) {
  if (ev === "load" && AUR.loadedAllModules)
    setTimeout(func, 0);
  else
    AUR._on.apply(AUR, jSh.toArr(arguments));
}

AUR.jSh  = jSh;
AUR.lces = lces;

// Initial check for AUR settings
var AURUserSett = lces.global.GM_getValue ? jSh.parseJSON(GM_getValue("aur-db-global")) : null;
var AURUserModSett;

if (AURUserSett && AURUserSett["aur-sett-db"]) {
  AURUserSett = jSh.parseJSON(AURUserSett["aur-sett-db"]["user"]);
  AURUserModSett = AURUserSett["AURModsEnabled"];
} else {
  AURUserSett = {error: true};
}

if (!AURUserModSett) {
  AURUserModSett = {};
}

// Unconstrained by CORS policy XHR request
AUR.request = function(args) {
  // Confirm input
  if (!(jSh.type(args) === "object" ? args : null) || jSh.type(args.uri || args.url) !== "string" || !(args.uri || args.url))
    return false;
  
  var validMethods = ["GET", "POST", "HEAD"];
  var headers = {};
  jSh.extendObj(headers, jSh.type(args.headers) === "object" ? args.headers : {});
  
  var uri    = args.uri || args.url;
  var method = typeof args.method === "string" && validMethods.indexOf(args.method.toUpperCase()) !== -1 ? args.method.toUpperCase() : "GET";
  
  // Check for form
  if (args.form)
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  
  // Get queryString
  var queryString = "";
  
  if (args.query) {
    function recursion(obj) {
      if (jSh.type(obj) === "array")
        return encodeURIComponent(obj.join(","));
      if (jSh.type(obj) !== "object")
        return encodeURIComponent(obj.toString());

      var qs = "";

      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {

          switch (jSh.type(obj[prop])) {
            case "string":
              qs += "&" + prop + "=" + encodeURIComponent(obj[prop]);
            break;
            case "number":
              qs += "&" + prop + "=" + obj[prop];
            break;
            case "array":
              qs += "&" + prop + "=" + encodeURIComponent(obj[prop].join(";"));
            break;
            case "object":
              qs += "";
            break;
            case "null":
              qs += "&" + prop + "=null";
            break;
            case "undefined":
              qs += "";
            break;
            default:
              qs += "";

          }
        }
      }

      return qs;
    }

    queryString = recursion(args.query).substr(1);
  } else {
    queryString = args.formData || "";
  }
  
  // Callbacks
  var onreadystatechange = typeof args.callback === "function" ? function(obj) {
    args.callback.call(obj)
  } : undf;
  
  var onload = typeof args.success === "function" ? function(obj) {
    args.success.call(obj);
  } : undf;
  
  var onerror = typeof args.fail === "function" ? function(obj) {
    args.fail.call(obj);
  } : undf;
  
  var xhr = GM_xmlhttpRequest({
    method: method,
    url: uri,
    data: queryString || undf,
    headers: headers,
    onreadystatechange: onreadystatechange,
    onload: onload,
    onerror: onerror,
    synchronous: false
  });
  
  return xhr;
}

// AUR Utils
AUR.error = function(e) {
  var errorString = "AUR ERROR: " + e;
  
  console.error(new Error(errorString));
  alert(errorString);
};

// Options determining utils
// TODO: Fix this
var boolOp = jSh.boolOp;
var numOp  = jSh.numOp;
var strOp  = jSh.strOp;

AUR.sandbox = function(func, silent, success, fail) {
  if (typeof func !== "function")
    return;
  
  try {
    func();
    
    if (typeof success === "function")
      success();
  } catch(e) {
    var err = "AUR Sandbox ERROR: " + e + "\n\n" + e.stack;
    
    console.error(err);
    if (!silent)
      alert(err);
    
    if (typeof fail === "function")
      fail();
  }
};

var __aurModCode = null;
// aur.mod.js here
