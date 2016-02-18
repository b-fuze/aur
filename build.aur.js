#! /usr/local/bin/node

// Require deps
var fs       = require("fs");
var path     = require("path");
var uglifyjs = require("uglify-js");
var babel    = require("babel-core");

// CD to the current dir
process.chdir(path.dirname(process.argv[1]));

// Current time
var time = (new Date()).toGMTString().replace(/ GMT|,/ig,"").replace(/:/g,".").replace(/\s/g,"-").toLowerCase();

// Arguments
var out = null;
var cat = null;

process.argv.slice(2).forEach(function(arg) {
  if (arg[0] === "-" && arg.toLowerCase() === "-cat")
    cat = true;
  else
    out = arg;
});

// Get paths
var AURPATH = path.dirname(process.argv[1]) + "/";
var AUROUT  = out || `${AURPATH}build/bleeding/aur.build.${time}.js`;

// AUR uncompliled source cram
var AURSRC = "";

// Source fetching functions
function getFile(fpath, ret) {
  var src = fs.readFileSync(fpath, {encoding: "utf8"});
  
  if (ret)
    return src;
  
  AURSRC += "\n\n" + src;
}

function getFolder(fpath) {
  var files = fs.readdirSync(fpath);
  
  files[0] = getFile(`${fpath}/${files[0]}`, true);
  AURSRC += files.reduce((src, file) => `${src} \n ${getFile(`${fpath}/${file}`, true)}`);
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
var lces    = `function lces(l){return LCES.components[l]};lces.rc = [];lces.loadedDeps = false;${ cat ? lcesSrc : uglify(lcesSrc) }lces.rc.forEach(f => f());lces.init();`;

// Get core files
getFile(AURPATH + "src/aur.core.js");
getFile(AURPATH + "src/aur.mod.js");

// Get core modules
getFolder(AURPATH + "src/mods/core");

// Get misc modules
getFolder(AURPATH + "src/mods/misc");

// Transform to ES5.1
var result = cat ? AURSRC : babel.transform(AURSRC, {presets: ["es2015"]}).code;
// Uglify this shit
result = cat ? result : uglify(result);

// Concat it to lces
result = getFile(AURPATH + "src/userscript.head.js", true) + lces + result + "AUR.triggerEvent(\"load\",{});";

// Write it out
fs.writeFileSync(AUROUT, result);
