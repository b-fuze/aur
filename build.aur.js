#! /usr/local/bin/node

// Require deps
var fs       = require("fs");
var path     = require("path");
var uglifyjs = require("uglify-js");
var babel    = require("babel-core");
var chalk    = require("chalk");
var metaUtil = require("./build_libs/parse-meta.aur");
var jSh      = require("./build_libs/jShorts2");

// Buildtime vars
var coreModules = [];
var miscModules = [];

coreModules.removalList = [];
miscModules.removalList = [];

// CD to the current dir
process.chdir(path.dirname(process.argv[1]));

// Current time
var time = (new Date()).toGMTString().replace(/ GMT|,/ig,"").replace(/:/g,".").replace(/\s/g,"-").toLowerCase();

// Get paths
var AURPATH = path.dirname(process.argv[1]) + "/";

// Arguments
var argValues = {
  "out": `${AURPATH}build/bleeding/aur.build.${time}.js`,
  "cat": false,
  "debug": false,
  "eval": false,
  "ignore-syntax": false,
  "excl": [],
  "incl": [],
  "mods": []
};

var argShort = {
  o: "out"
}

var curArg = null;

// Loop arguments
var args = process.argv.slice(2);

// Checks each argument and compares against (if exists) it's counterpart in
// argValues then either sets or appends values accordingly
for (var i=0,l=args.length; i<l; i++) {
  var arg = args[i];
  
  if (arg.substr(0, 2) === "--" || arg[0] === "-" && arg.length === 2) {
    if (arg.length === "2") {
      var longName = argShort[arg[1]];
      var curVal   = argValues[longName];
    } else {
      var longName = arg.substr(2);
      var curVal   = argValues[longName];
    }
    
    if (curVal !== undefined) {
      if (jSh.type(curVal) === "boolean")
        argValues[longName] = true;
      else if (jSh.type(curVal) === "string" || jSh.type(curVal) === "array")
        curArg = longName;
    }
  } else if (curArg) {
    var curVal = argValues[curArg];
    
    if (jSh.type(curVal) === "string") {
      argValues[curArg] = arg;
    } else if (jSh.type(curVal) === "array") {
      argValues[curArg].push(arg);
    }
  }
}

Object.getOwnPropertyNames(argValues).forEach(function(n) {
  var jsName = n.replace(/-[a-z\d]/g, function(a, b, c) {
    return a[1].toUpperCase();
  });
  
  argValues[jsName] = argValues[n];
});

// AUR uncompliled source cram
// var EMPTYCORE, EMPTYMISC;
var AURSRC = "";
var AUROUT = argValues.out;

// Logging
function logStatus(msg, status) {
  var cols = process.stdout.columns;
  var msgLength = cols - chalk.stripColor(status).length;
  var spaceLength = msgLength - chalk.stripColor(msg).length;
  
  console.log(msg + jSh.nChars(" ", spaceLength) + status);
}

// Source fetching functions
function srcEscape(src) {
  if (!argValues.eval)
    return src;
  
  src = src.replace(/\\/g, "\\\\");
  src = src.replace(/\$/g, "\\$");
  src = src.replace(/`/g, "\\`");
  
  return src;
}

function mn(str) { // Module name
  return str.split(".")[0];
}

function excld(name) {
  return argValues.excl.indexOf(mn(name).toLowerCase()) !== -1;
}

function getFile(fpath, ret) {
  var src = fs.readFileSync(fpath, {encoding: "utf8"});
  
  if (ret)
    return src;
  
  AURSRC += "\n\n" + src;
}

var includedMods = false;
function encapsulate(fpath, name) {
  var npath = fpath;
  var src   = getFile(npath, true);
  
  var srcParse = metaUtil.processMeta(src, name);
  var litSrc   = src.substr(srcParse.metaEnd);
  
  // Test src
  try {
    if (!argValues.ignoreSyntax)
      babel.transform(litSrc);
    
    // Log status
    logStatus(" " + chalk.bold(name) + (includedMods ? "" : ""), "[" + chalk.green("SUCCESS") + "] ");
    
    var modBody = "";
    modBody += "\n\ntry {\n  __aurModCode = (function() {";
    modBody += argValues.eval ? "eval(\`" : "";
    modBody += `var reg = AUR.register("${name}");`;
    modBody += srcEscape(litSrc);
    modBody += argValues.eval ? "\`);" : "";
    modBody += `\n  AUR.__triggerLoaded("${name}");});\n} catch `;
    modBody += `(e) {\n  AUR.__triggerFailed("${name}", e);\n  __aurModeCode = null; \n};\n\n${srcParse.meta}\n__aurModCode = null;\n`;
    
    return modBody;
  } catch (e) {
    logStatus(" " + chalk.bold(name) + (includedMods ? "" : ""), e + " [" + chalk.red(" ERROR ") + "] ");
    return null;
  }
  
}

function addModList(list) {
  list.forEach(function(mod) {
    var modSrc = encapsulate(list[mod], mod) || "";
    AURSRC += modSrc;
    
    // Check if module failed (syntax error) and add to removal list
    if (!modSrc)
      list.removalList.push(mod);
  });
}

// Scan a folder
function getFolder(fpath, dumpModName) {
  var validModName = /[a-z\-\d]+\.mod\.js/;
  var files = fs.readdirSync(fpath).filter(f => !excld(f) && validModName.test(f));
  
  dumpModName.push.apply(dumpModName, files.map(f => mn(f)));
  files.every(function(f) {
    var name = mn(f);
    
    if (!miscModules[name] && !coreModules[name]) {
      dumpModName[name] = fpath + "/" + f;
      return true;
    } else {
      logStatus("" + chalk.bold.red(name) + " - " + fpath, "[" + chalk.red("ERROR: MOD CONFLICT") + "] ");
      process.exit();
    }
  });
}

// Check extra module folders for modules
function checkDirectory(fpath) {
  var validModName = /[a-z\-\d]+\.mod\.js/;
  
  if (fs.existsSync(fpath) && fs.statSync(fpath).isDirectory()) {
    var contents = fs.readdirSync(fpath);
    
    // Scan for main module folders
    var coreFolder = fpath + "/core";
    var miscFolder = fpath + "/misc";
    
    if (fs.existsSync(coreFolder) && fs.statSync(coreFolder).isDirectory())
      getFolder(coreFolder, coreModules);
    
    if (fs.existsSync(miscFolder) && fs.statSync(miscFolder).isDirectory())
      getFolder(miscFolder, miscModules);
    
    // Check root folder files for extra misc mods
    contents.forEach(function(file) {
      var itemPath = fpath + "/" + file;
      
      if (validModName.test(file) && fs.statSync(itemPath).isFile()) {
        var name = mn(file);
        miscModules.push(name);
        
        if (!miscModules[name] && !coreModules[name]) {
          miscModules[name] = itemPath;
          return true;
        } else {
          logStatus("" + chalk.bold.red(name) + " - " + fpath, "[" + chalk.red("ERROR: MOD CONFLICT") + "] ");
          process.exit();
        }
      }
    });
  } else {
    console.log(" " + chalk.bold(fpath) + chalk.red(" doesn't exist or is a file"));
  }
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
var lcesSrc = argValues.cat ? lcesSrc : uglify(babel.transform(lcesSrc, {presets: ["es2015"]}).code);
var lces    = `function lces(l){return LCES.components[l]};lces.rc = [];lces.loadedDeps = false;${ lcesSrc }lces.rc.forEach(f => f());lces.init();\n`;

// Get core files
getFile(AURPATH + "src/aur.core.js");
getFile(AURPATH + "src/aur.mod.js");

// Get core modules
getFolder(AURPATH + "src/mods/core", coreModules);

// Get misc modules
getFolder(AURPATH + "src/mods/misc", miscModules);

// Get other core/misc mod directories
argValues.mods.forEach(function(modDir) {
  checkDirectory(modDir);
});

console.log("\nAdding core modules...");
addModList(coreModules);
console.log("\nAdding misc modules...");
addModList(miscModules);

if (argValues.incl.length !== 0)
  console.log("\nAdding extra modules...");

// Get extra modules if any
includedMods = true;
var curIncl;

argValues.incl.forEach(file => {
  var name = mn(path.basename(file));
  curIncl = encapsulate(file, name);
  
  if (curIncl) {
    AURSRC += curIncl;
    miscModules.push(name);
  }
});

// Remove any modules that failed the test
coreModules.removalList.forEach((m, i, arr) => coreModules.splice(coreModules.indexOf(m), 1));
miscModules.removalList.forEach((m, i, arr) => miscModules.splice(miscModules.indexOf(m), 1));

// Add module names
AURSRC = AURSRC.replace(/EMPTYCORE/, '"' + coreModules.join('", "') + '"');
AURSRC = AURSRC.replace(/EMPTYMISC/, '"' + miscModules.join('", "') + '"');

// Transform to ES5.1
var result = argValues.cat ? AURSRC : babel.transform(AURSRC, {presets: ["es2015"]}).code;
// Uglify this shit
result = argValues.cat ? result : uglify(result);

// Concat it to lces
result = `${getFile(AURPATH + "src/userscript.head.js", true)}
${argValues.debug ? `try { // DEBUG FLAG -TRY` : ""}

  ${lces + result}
  AUR.triggerEvent("load",{});
  
${argValues.debug ? `} catch (e) { // DEBUG FLAG -CATCH
  alert(e + "\\n\\n\\n" + e.stack);
}` : ""}`;

// Write it out
fs.writeFileSync(AUROUT, result);
