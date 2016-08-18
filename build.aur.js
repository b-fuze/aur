#! /usr/bin/env node

// Require deps
var fs          = require("fs");
var path        = require("path");
var uglifyjs    = require("uglify-js");
var babel       = require("babel-core");
var chalk       = require("chalk");
var metaUtil    = require("./build_libs/parse-meta.aur");
var absPathUtil = require("./build_libs/resolve-path.aur");
var jSh         = require("./build_libs/jShorts2");

// Buildtime vars
var coreModules = [];
var miscModules = [];

coreModules.removalList = [];
miscModules.removalList = [];

// CD to the current dir
// process.chdir(path.dirname(process.argv[1]));
// Get paths
var AURPATH = path.dirname(process.argv[1]) + "/";
absPathUtil.setRoot(process.cwd());

// Current time
var time = (new Date()).toGMTString().replace(/ GMT|,/ig,"").replace(/:/g,".").replace(/\s/g,"-").toLowerCase();

// Arguments
var argValues = {
  "profile": ["default"],
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
  p: "profile",
  o: "out"
};

var curArg = null;

// Loop arguments
var args = process.argv.slice(2);

// Checks each argument and compares against (if exists) it's counterpart in
// argValues then either sets or appends values accordingly
for (var i=0,l=args.length; i<l; i++) {
  var arg = args[i].trim();
  
  if (arg.substr(0, 2) === "--" || arg[0] === "-" && arg.length === 2) {
    if (arg.length === 2) {
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

// Container that merges all JSON options
var AUROptions = {
  name: "AUR",
  userscript: false,
  userscript_file: "userscript.head.js",
  userscriptClauses: [],
  profile: "default",
  run_at: "doc-end",
};

// AUR unminified source cram
var AURHEAD = ""; // Inserted before *all* of the code
var AURSRC  = ""; // The actual code compiled
var AUROUT  = absPathUtil(argValues.out); // Output dest

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
  
  var srcParse = metaUtil.processMeta(src, name, console);
  var litSrc   = jSh.nChars("\n", Math.max(0, srcParse.newLineCount - 1)) + src.substr(srcParse.metaEnd);
  
  // Test src
  try {
    if (!argValues.ignoreSyntax)
      uglifyjs.minify(litSrc, {
        fromString: true
      });
    
    // Log status
    logStatus(" " + chalk.bold(name) + (includedMods ? "" : ""), "[" + chalk.green("SUCCESS") + "] ");
    
    // Check for userscript clauses
    var validUSClause = /[ \t]*@[^\s]+[ \t]+[^\s][^\n]*/;
    var USClause = srcParse.identifiers.AUR_USERSCRIPT_CLAUSE;
    
    if (USClause !== undefined) {
      if (USClause[1] === "array") {
        USClause[0].forEach(clause => (clause[1] === "string" &&
                                       validUSClause.test(clause[0]) &&
                                       AUROptions.userscriptClauses.indexOf(clause[0]) === -1 &&
                                       AUROptions.userscriptClauses.push(clause[0])));
      } else if (USClause[1] === "string" && validUSClause.test(USClause[0]))
        AUROptions.userscriptClauses.push(USClause[0]);
    }
    
    // Make full body
    var modBody = "";
    modBody += "\n\ntry {\n  __aurModCode = (function() {";
    modBody += argValues.eval ? "eval(\`" : "";
    modBody += `var reg = AUR.register("${name}");`;
    modBody += srcEscape(litSrc);
    modBody += argValues.eval ? "\`);" : "";
    modBody += `\n  /* AUR.__triggerLoaded("${name}"); */ });\n} catch `;
    modBody += `(e) {\n  /* AUR.__triggerFailed("${name}", e); */\n  __aurModeCode = null; \n};\n\n${srcParse.meta}\n__aurModCode = null;\n`;
    
    return modBody;
  } catch (e) {
    logStatus(" " + chalk.bold(name) + (includedMods ? "" : ""), e.toString().split("\n")[0] + " [" + chalk.red(" ERROR ") + "] ");
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
      logStatus(chalk.bold.red(name) + " - " + fpath, "[" + chalk.red("ERROR: MOD CONFLICT") + "] ");
      process.exit();
    }
  });
}

function loadAUROptions(fpath) {
  var src     = getFile(fpath, true);
  var dir     = path.dirname(fpath);
  var srcName = path.basename(fpath);
  var profile = argValues.profile.length !== 1 ? argValues.profile.slice(1) : null;
  
  try {
    var options    = JSON.parse(src);
    var defOptions = jSh.extendObj(AUROptions, options);
    
    if (profile && jSh.type(defOptions.profiles) === "object")
      profile.forEach(function(prof) {
        if (defOptions.profiles[prof]) {
          jSh.mergeObj(defOptions, defOptions.profiles[prof], false, false, true);
        }
      });
    
    // Check if runtime args should be changed
    if (jSh.type(defOptions.excl) === "array")
      argValues.excl = argValues.excl.concat(defOptions.excl.map(f => {
        return absPathUtil(f, dir);
      }));
    
    if (jSh.type(defOptions.incl) === "array")
      argValues.incl = argValues.incl.concat(defOptions.incl.map(f => {
        return absPathUtil(f, dir);
      }));
    
    argValues.eval = jSh.boolOp(defOptions.eval, argValues.eval);
    argValues.cat = jSh.boolOp(defOptions.cat, argValues.cat);
    argValues.debug = jSh.boolOp(defOptions.debug, argValues.debug);
    
    return defOptions;
  } catch (e) {
    // Just warn that parsing failed
    logStatus("Parsing AUR option file " + chalk.bold(srcName) + " FAILED", "[ " + chalk.red("ERROR") + " ] ");
  }
  
  return null;
}

// Check extra module folders for modules
function checkDirectory(fpath) {
  var validModName = /[a-z\-\d]+\.mod\.js/;
  
  if (fs.existsSync(fpath) && fs.statSync(fpath).isDirectory()) {
    var contents = fs.readdirSync(fpath);
    
    // Scan for main module folders and AUR options JSON
    var coreFolder  = fpath + "/core";
    var miscFolder  = fpath + "/misc";
    var JSONOptions = fpath + "/aur-options.json";
    var options     = null;
    
    if (fs.existsSync(coreFolder) && fs.statSync(coreFolder).isDirectory())
      getFolder(coreFolder, coreModules);
    
    if (fs.existsSync(miscFolder) && fs.statSync(miscFolder).isDirectory())
      getFolder(miscFolder, miscModules);
    
    if (fs.existsSync(JSONOptions) && fs.statSync(JSONOptions).isFile())
      options = loadAUROptions(JSONOptions);
    
    // Check if userscript file provided and enabled
    if (options && options.userscript) {
      var usFilePath = absPathUtil(options.userscript_file, fpath);
      
      if (fs.existsSync(usFilePath) && fs.statSync(usFilePath).isFile()) {
        AURHEAD += getFile(usFilePath, true);
      }
    }
    
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

// Get core files
getFile(AURPATH + "src/aur.core.js");
getFile(AURPATH + "src/aur.mod.js");

// Get core modules
getFolder(AURPATH + "src/mods/core", coreModules);

// Get misc modules
getFolder(AURPATH + "src/mods/misc", miscModules);

// Get other core/misc mod directories
argValues.mods.forEach(function(modDir) {
  checkDirectory(absPathUtil(modDir));
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
  file = absPathUtil(file);
  
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
AURSRC = AURSRC.replace(/AUR_EMPTYCORE/, '"' + coreModules.join('", "') + '"');
AURSRC = AURSRC.replace(/AUR_EMPTYMISC/, '"' + miscModules.join('", "') + '"');
AURSRC = AURSRC.replace(/AUR_BUILDNAME/, AUROptions.name);
AURSRC = AURSRC.replace(/AUR_RUN_AT/, AUROptions.run_at);

AURHEAD = AURHEAD.replace(
  /AUR_USERSCRIPT_CLAUSES\s+/,
  [""].concat(AUROptions.userscriptClauses).reduce(function(clauseA, clauseB) {
    return clauseA + "// " + clauseB + "\n";
  })
);

// Get LCES/jSh
var lcesSrc = getFile(AURPATH + "src/lces.current.js", true);
var lcesSrc = argValues.cat ? lcesSrc : uglify(lcesSrc);
var lces    = `function lces(l){return LCES.components[l]};lces.rc = [];lces.loadedDeps = false;${ lcesSrc }lces.rc.forEach(f => f());lces.noReference = true;${AUROptions.run_at === "doc-end" ? "lces.init();" : ""}\n`;

// Uglify this stuff if necessary
var result = argValues.cat ? AURSRC : uglify(AURSRC);

// Concat it to lces
result = `${AURHEAD}
${argValues.debug ? `try { // DEBUG FLAG -TRY` : ""}

  ${lces + result}
  AUR.triggerEvent("__load",{});
  
${argValues.debug ? `} catch (e) { // DEBUG FLAG -CATCH
  alert(e + "\\n\\n\\n" + e.stack);
}` : ""}`;

// Write it out
fs.writeFileSync(AUROUT, result);

// Old but probably helpful:
// Transform to ES5.1: babel.transform(AURSRC, {presets: ["es2015"]}).code;
