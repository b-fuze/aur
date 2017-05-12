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

// Newline for readability
console.log("\n");

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
  "incl-core": [],
  "lces-src": "",
  "mods": [],
  "single-mods": false
};

var argShort = {
  p: "profile",
  o: "out"
};

var curArg = null;

// Loop arguments
var args = process.argv.slice(2);

// Checks each argument and compares against (if exists) its counterpart in
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
  lces_init: true,
  lces_src: argValues["lces-core"] ? absPathUtil(argValues["lces-core"]) : "",
  profile: "default",
  run_at: "doc-end",
  aur_functions: true
};

var AURFunctions = {
  AUR_INCLUDE(file, arg) {
    return fs.readFileSync(absPathUtil(arg, path.dirname(file)), {encoding: "utf8"});
  }
};

var AURFunctionArr = Object.getOwnPropertyNames(AURFunctions);

// AUR unminified source cram
var AURHEAD = ""; // Inserted before *all* of the code
var AURSRC  = ""; // The actual code compiled
var AUROUT  = absPathUtil(argValues.out); // Output dest
var AURDEEP = {}; // AUR deep module structure

// Logging
function logStatus(msg, status) {
  var cols = process.stdout.columns;
  var msgLength = cols - chalk.stripColor(status).length;
  var spaceLength = msgLength - chalk.stripColor(msg).length;
  
  console.log(msg + jSh.nChars(" ", spaceLength) + status);
}

// Source fetching functions
function srcEscape(src, fpath) {
  if (AUROptions.aur_functions) {
    for (var i=0,l=AURFunctionArr.length; i<l; i++) {
      var funcName  = AURFunctionArr[i];
      var funcRegex = new RegExp(funcName + "/(([^)]+)/)".replace(/\//g, "\\"), "g");
      var AURFunc   = AURFunctions[funcName];
      
      src = src.replace(funcRegex, function(match, p1) {
        return AURFunc(fpath, p1);
      });
    }
  }
  
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
function encapsulate(fpath, name, path, isMain) {
  var src     = getFile(fpath, true);
  var relPath = path && path.length ? '"' + path.join('", "') + '"' : "";
  
  var srcParse = metaUtil.processMeta(src, name, console, path, isMain);
  var litSrc   = jSh.nChars("\n", Math.max(0, srcParse.newLineCount - 1)) + src.substr(srcParse.metaEnd);
  
  // Test src
  try {
    if (!argValues.ignoreSyntax)
      uglifyjs.minify(litSrc, {
        fromString: true
      });
    
    // Log status
    logStatus(" " + (path ? " - " : "") + (isMain ? chalk.bold.green("main.js") : chalk.bold(name)) + (includedMods ? "" : ""), "[" + chalk.green("SUCCESS") + "] ");
    
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
    modBody += "\n\ntry {\n  __aurModCode = (function AURModFunc() {";
    modBody += argValues.eval ? "eval(\`" : "";
    modBody += `var AUR = AURModFunc.shell; var reg = AUR.__initializeModule("${ name }");`;
    modBody += srcEscape(litSrc, fpath);
    modBody += argValues.eval ? "\`);" : "";
    modBody += `\n  });\n__aurModCode.shell = AUR.__relative([${ path ? relPath : '"' + name + '"' }]);\n} catch `;
    modBody += `(e) {\n  AUR.__triggerFailed("${ name }", e);\n  __aurModeCode = null; \n};\n\n${ srcParse.meta }\n__aurModCode = null;\n`;
    
    return {
      body: modBody,
      meta: srcParse.identifiers
    };
  } catch (e) {
    logStatus(" " + (path ? chalk.red(" × ") : "") + (isMain ? chalk.bold.green("main.js") : chalk.bold(name)) + (includedMods ? "" : ""), e.toString().split("\n")[0] + " [" + chalk.red(" ERROR ") + "] ");
    return null;
  }
  
}

function getDeepModFolder(fpath, root, modName, curDepth, rootDepth, nonEmptyCB, list) {
  var validSubfile = /^[a-zA-Z\-\d]+\.js$/;
  var validSubDir  = /^[a-z\-\d]+$/i;
  var files        = fs.readdirSync(fpath);
  var filesMap     = {};
  var isRootDir    = root === fpath;
  var curPath      = [modName];
  
  if (!isRootDir) {
    var fpathArr = fpath.split("/");
    var rootArr  = root.split("/");
    
    // Add depth after module root dir
    curPath.push.apply(curPath, fpathArr.slice(rootArr.length));
  } else {
    AURDEEP[modName] = {
      __runAt: "doc-end",
      __hasMain: false,
      __parent: null,
      __subFileCount: 0
    };
    
    curDepth  = AURDEEP[modName];
    rootDepth = curDepth;
  }
  
  // Add file names to map
  files.forEach(function(file) {
    filesMap[file] = 1;
    
    if (file !== "main.js" || !isRootDir) {
      var filePath = fpath + "/" + file;
      var isDir    = fs.statSync(filePath).isDirectory();
      
      if (isDir) {
        if (validSubDir.test(file)) {
          curDepth[file] = {};
          
          getDeepModFolder(filePath, root, modName, curDepth[file], rootDepth, nonEmptyCB, list);
        }
      } else if (validSubfile.test(file)) {
        // It's a populated deep module
        nonEmptyCB();
        rootDepth.__subFileCount++;
        
        var subFileName = curPath.join("/") + "/" + file;
        
        var modSrc = encapsulate(filePath, subFileName, curPath, false);
        AURSRC += modSrc ? modSrc.body : "";
        
        // Add subfile if no syntax errors
        if (modSrc) {
          // Add to depth
          curDepth[file] = {
            register: null,
            name: subFileName,
            __subFile: true
          };
          
          // Add to list
          list.push(subFileName);
        }
      }
    }
  });
  
  // Add main.js if present
  if (isRootDir && filesMap["main.js"]) {
    var modSrc = encapsulate(fpath + "/main.js", modName + "/main.js", curPath, true);
    AURSRC += modSrc ? modSrc.body : "";
    
    if (modSrc) {
      curDepth.__hasMain = true;
      
      // Add overall module AUR_RUN_AT
      var runAt = modSrc.meta.AUR_RUN_AT && modSrc.meta.AUR_RUN_AT[0];
      if (runAt === "doc-start" || runAt === "doc-end")
        curDepth.__runAt = runAt;
    }
  }
}

function addModList(list, single) {
  function addMod(mod) {
    var modObj = list["mod" + mod];
    
    if (modObj.deepMod) {
      var emptyDeepMod = true;
      
      function nonEmpty() {
        if (emptyDeepMod) {
          emptyDeepMod = false;
          logStatus(" " + chalk.bold(mod), "[" + chalk.yellow("DEEPMOD") + "] ");
        }
      }
      
      getDeepModFolder(modObj.fullPath, modObj.fullPath, mod, null, null, nonEmpty, list);
      
      if (emptyDeepMod)
        list.removalList.push(mod);
    } else {
      var modSrc = encapsulate(modObj.fullPath, mod) || "";
      AURSRC += modSrc ? modSrc.body : "";
      
      // Add to deeplist (as non-deep module)
      if (modSrc)
        AURDEEP[mod] = {
          register: null,
          name: mod,
          __subFile: true
        };
      
      // Check if module failed (syntax error) and add to removal list
      if (!modSrc)
        list.removalList.push(mod);
    }
  }
  
  if (!single) {
    list.forEach(addMod);
  } else {
    addMod(single);
  }
}

function checkModAndPrep(fpath, fname, dumpModName, extra) {
  var validModName     = /^[a-z\-\d]+\.mod(\.js)?$/;
  var validDeepModName = /^[a-z\-\d]+\.mod$/;
  
  if (!validModName.test(fname) || excld(fname))
    return false;
  
  var name = mn(fname);
  
  if (!miscModules[name] && !coreModules[name]) {
    var fullPath      = fpath + "/" + fname;
    var deepMod       = fs.statSync(fullPath).isDirectory();
    var validDeepName = validDeepModName.test(fname);
    
    // Check valid module filename
    if (deepMod) {
      if (!validDeepName) {
        logStatus(chalk.bold.red(name) + " - " + fpath, "[" + chalk.red("ERROR: INVALID DEEPMOD NAME") + "] ");
        return;
      }
    } else if (validDeepName) {
      logStatus(chalk.bold.red(name) + " - " + fpath, "[" + chalk.red("ERROR: INVALID MOD NAME") + "] ");
      return;
    }
    
    dumpModName.push(name);
    dumpModName["mod" + name] = {
      deepMod: deepMod,
      fullPath: fullPath
    };
    
    // Check if it's an extra included module
    if (extra)
      addModList(miscModules, name);
    
    return true;
  } else {
    logStatus(chalk.bold.red(name) + " - " + fpath, "[" + chalk.red("ERROR: MOD CONFLICT") + "] ");
    process.exit();
  }
}

// Scan a folder
function getFolder(fpath, dumpModName) {
  var files = fs.readdirSync(fpath);
  
  files.forEach(function(f) {
    checkModAndPrep(fpath, f, dumpModName);
  });
}

function loadAUROptions(fpath) {
  var src     = getFile(fpath, true);
  var dir     = path.dirname(fpath);
  var srcName = path.basename(fpath);
  var profile = argValues.profile.length !== 1 ? argValues.profile.slice(1) : null;
  
  try {
    var options    = JSON.parse(src);
    var defOptions = jSh.extendObj(AUROptions, options, ["lces_src"]);
    
    if (profile && jSh.type(defOptions.profiles) === "object")
      profile.forEach(function(prof) {
        if (defOptions.profiles[prof]) {
          jSh.mergeObj(defOptions, defOptions.profiles[prof], false, false, true);
        }
      });
    
    // Check if runtime args should be changed
    if (jSh.type(defOptions.excl) === "array")
      argValues.excl = argValues.excl.concat(defOptions.excl);
    
    if (jSh.type(defOptions.incl) === "array")
      argValues.incl = argValues.incl.concat(defOptions.incl.map(f => {
        return absPathUtil(f, dir);
      }));
    
    // Check for lces-src
    var lcesSrc = options.lces_src;
    
    if (typeof lcesSrc === "string" && lcesSrc.trim()) {
      defOptions.lces_src = absPathUtil(lcesSrc.trim(), dir);
    }
    
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
function checkDirectory(fpath, loadOptions) {
  if (fs.existsSync(fpath) && fs.statSync(fpath).isDirectory()) {
    var contents = fs.readdirSync(fpath);
    
    // Scan for main module folders and AUR options JSON
    var coreFolder  = fpath + "/core";
    var miscFolder  = fpath + "/misc";
    var JSONOptions = fpath + "/aur-options.json";
    var options     = null;
    
    if (loadOptions) {
      if (fs.existsSync(JSONOptions) && fs.statSync(JSONOptions).isFile())
        options = loadAUROptions(JSONOptions);
      
      // Check if userscript file provided and enabled
      if (options && options.userscript) {
        var usFilePath = absPathUtil(options.userscript_file, fpath);
        
        if (fs.existsSync(usFilePath) && fs.statSync(usFilePath).isFile()) {
          AURHEAD += getFile(usFilePath, true);
        }
      }
    } else {
      if (fs.existsSync(coreFolder) && fs.statSync(coreFolder).isDirectory())
        getFolder(coreFolder, coreModules);
      
      if (fs.existsSync(miscFolder) && fs.statSync(miscFolder).isDirectory())
        getFolder(miscFolder, miscModules);
      
      // Check root folder files for extra misc mods
      contents.forEach(function(file) {
        var itemPath = fpath + "/" + file;
        
        if (file !== "core" && file !== "misc") {
          checkModAndPrep(fpath, file, miscModules);
        }
      });
    }
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

// Load any settings early
argValues.mods.forEach(function(modDir) {
  checkDirectory(absPathUtil(modDir), true);
});

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
  
  var fpath = path.dirname(file);
  var fname = path.basename(file);
  
  checkModAndPrep(fpath, fname, miscModules, true);
});

// Check for core extra modules
if (argValues["incl-core"].length !== 0)
  console.log("\nAdding extra core modules...");

// Get extra modules if any
includedMods = true;
var curIncl;

argValues["incl-core"].forEach(file => {
  file = absPathUtil(file);
  
  var fpath = path.dirname(file);
  var fname = path.basename(file);
  
  checkModAndPrep(fpath, fname, coreModules, true);
});

// Remove any modules that failed the test
coreModules.removalList.forEach((m, i, arr) => coreModules.splice(coreModules.indexOf(m), 1));
miscModules.removalList.forEach((m, i, arr) => miscModules.splice(miscModules.indexOf(m), 1));

// Add module names
AURSRC = AURSRC.replace(/AUR_EMPTYCORE/, coreModules.length ? '"' + coreModules.join('", "') + '"' : "");
AURSRC = AURSRC.replace(/AUR_EMPTYMISC/, miscModules.length ? '"' + miscModules.join('", "') + '"' : "");
AURSRC = AURSRC.replace(/AUR_DEEPMODS/, '"' + Object.getOwnPropertyNames(AURDEEP).join('", "') + '"');
AURSRC = AURSRC.replace(/AUR_DEEPMODS_STRUCTURE/, JSON.stringify(AURDEEP));
AURSRC = AURSRC.replace(/AUR_BUILDNAME/, AUROptions.name);
AURSRC = AURSRC.replace(/AUR_RUN_AT/, AUROptions.run_at);

AURHEAD = AURHEAD.replace(
  /AUR_USERSCRIPT_CLAUSES\s+/,
  [""].concat(AUROptions.userscriptClauses).reduce(function(clauseA, clauseB) {
    return clauseA + "// " + clauseB + "\n";
  })
);

// Get LCES/jSh
var lcesSrc = getFile(AUROptions.lces_src ? AUROptions.lces_src : AURPATH + "src/lces.current.js", true);
var lcesSrc = argValues.cat ? lcesSrc : uglify(lcesSrc);
var lces    = `function lces(l){return LCES.components[l]};lces.rc = [];lces.loadedDeps = false;${ lcesSrc }lces.rc.forEach(f => f());lces.noReference = true;${ AUROptions.run_at === "doc-end" ? (AUROptions.lces_init ? "lces.init();" : "") : "" }\n`;

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
