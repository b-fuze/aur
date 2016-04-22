#! /usr/local/bin/node

// Require deps
var fs       = require("fs");
var path     = require("path");
var uglifyjs = require("uglify-js");
var babel    = require("babel-core");

// Buildtime vars
var coreModules = [];
var miscModules = [];

// CD to the current dir
process.chdir(path.dirname(process.argv[1]));

// Current time
var time = (new Date()).toGMTString().replace(/ GMT|,/ig,"").replace(/:/g,".").replace(/\s/g,"-").toLowerCase();

function multipleArg(i, arr, dump, comma) {
  i++;
  var arg     = arr[i];
  var nextArg = arr[i + 1];
  
  var following = true;
  var follow    = /^(?!\-)(?:[a-z\d\-]+,)+$/i;
  var followcap = /^(?:[a-z\d\-]+,)*[a-z\d\-]+$/i;
  var stoploop;
  
  while (!stoploop && (!comma || (nextArg && (follow.test(arg) || following && followcap.test(arg))))) {
    if (comma)
      dump.push.apply(dump, arg.trim().toLowerCase().split(/\s*,\s*/).filter(s => !!s.trim()));
    else
      dump.push(arg);
    
    // Set follow flag to continue to next argument
    following = follow.test(arg);
    
    i++;
    arg       = nextArg;
    nextArg   = arr[i];
    
    if (!comma && (!nextArg || nextArg.trim()[0] === "-"))
      stoploop = true;
  }
  
  return i;
}

// Arguments
var out   = null;
var cat   = null;
var debug = null;
var excl  = [];
var incl  = [];

// Loop arguments
var args = process.argv.slice(2);

for (var i=0,l=args.length; i<l; i++) {
  var arg = args[i];
  
  if (arg[0] === "-") {
    switch (arg.toLowerCase()) {
      case "-cat":
        cat = true;
      break;
      
      case "-debug":
        debug = true;
      break;
      
      case "-excl":
        i = multipleArg(i, args, excl);
      break;
      
      case "-add":
        i = multipleArg(i, args, incl);
      break;
    }
  } else {
    out = arg;
  }
}

// Get paths
var AURPATH = path.dirname(process.argv[1]) + "/";
var AUROUT  = out || `${AURPATH}build/bleeding/aur.build.${time}.js`;

// AUR uncompliled source cram
// var EMPTYCORE, EMPTYMISC;
var AURSRC = "";

// Source fetching functions
function srcEscape(src) {
  src = src.replace(/\\/g, "\\\\");
  src = src.replace(/\$/g, "\\$");
  src = src.replace(/`/g, "\\`");
  
  return src;
}

function mn(str) { // Module name
  return str.split(".")[0];
}

function excld(name) {
  return excl.indexOf(mn(name).toLowerCase()) !== -1;
}

function getFile(fpath, ret) {
  var src = fs.readFileSync(fpath, {encoding: "utf8"});
  
  if (ret)
    return src;
  
  AURSRC += "\n\n" + src;
}

function encapsulate(fpath, file) {
  var npath = !file ? fpath : `${fpath}/${file}`;
  var name = mn(file || path.basename(fpath));
  
  return `\n\ntry {\n  (function() {eval(\`${srcEscape(getFile(npath, true))}\`)})();` + (
    `\n  AUR.__triggerLoaded("${name}");\n} catch (e) {\n  AUR.error("Module ${name} failed to load - " + e + "\\n\\n" + e.stack);\n};`
  );
}

function getFolder(fpath, dumpModName) {
  var files = fs.readdirSync(fpath).filter(f => !excld(f));
  
  if (dumpModName)
    dumpModName.push.apply(dumpModName, files.map(f => mn(f)));
  
  files[0] = encapsulate(fpath, files[0]);
  
  AURSRC += files.reduce((src, file) => src + encapsulate(fpath, file));
}

function uglify(src) {
  return uglifyjs.minify(src, {
    fromString: true,
    compress: {
      sequences     : true,  // join consecutive statemets with the “comma operator”
      properties    : true,  // optimize property access: a["foo"] → a.foo
      dead_code     : true,  // discard unreachable code
      drop_debugger : true,  // discard “debugger” statements
      unsafe        : false, // some unsafe optimizations (see below)
      conditionals  : true,  // optimize if-s and conditional expressions
      comparisons   : true,  // optimize comparisons
      evaluate      : true,  // evaluate constant expressions
      booleans      : true,  // optimize boolean expressions
      loops         : true,  // optimize loops
      unused        : true,  // drop unused variables/functions
      hoist_funs    : true,  // hoist function declarations
      hoist_vars    : false, // hoist variable declarations
      if_return     : true,  // optimize if-s followed by return/continue
      join_vars     : true,  // join var declarations
      cascade       : true,  // try to cascade `right` into `left` in sequences
      side_effects  : true,  // drop side-effect-free statements
      warnings      : true   // warn about potentially dangerous optimizations/code
    },
    mangle: true
  }).code;
}

// Get LCES/jSh
var lcesSrc = getFile(AURPATH + "src/lces.current.js", true);
var lcesSrc = cat ? lcesSrc : uglify(babel.transform(lcesSrc, {presets: ["es2015"]}).code);
var lces    = `function lces(l){return LCES.components[l]};lces.rc = [];lces.loadedDeps = false;${ lcesSrc }lces.rc.forEach(f => f());lces.init();\n`;

// Get core files
getFile(AURPATH + "src/aur.core.js");
getFile(AURPATH + "src/aur.mod.js");

// Get core modules
getFolder(AURPATH + "src/mods/core", coreModules);

// Get misc modules
getFolder(AURPATH + "src/mods/misc", miscModules);

// Get extra modules if any
incl.forEach(file => (AURSRC += encapsulate(file), miscModules.push(mn(path.basename(file)))));

// Add module names
AURSRC = AURSRC.replace(/EMPTYCORE/, '"' + coreModules.join('", "') + '"');
AURSRC = AURSRC.replace(/EMPTYMISC/, '"' + miscModules.join('", "') + '"');

// Transform to ES5.1
var result = cat ? AURSRC : babel.transform(AURSRC, {presets: ["es2015"]}).code;
// Uglify this shit
result = cat ? result : uglify(result);

// Concat it to lces
result = `${getFile(AURPATH + "src/userscript.head.js", true)}
${debug ? `try { // DEBUG FLAG -TRY` : ""}

  ${lces + result}
  AUR.triggerEvent("load",{});
  
${debug ? `} catch (e) { // DEBUG FLAG -CATCH
  alert(e + "\\n\\n\\n" + e.stack);
}` : ""}`;

// Write it out
fs.writeFileSync(AUROUT, result);
