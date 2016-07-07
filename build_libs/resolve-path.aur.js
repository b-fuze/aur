var path = require("path");

// Early declaration of exports and current dir var
module.exports = pathUtil;
var curDir = "";

function pathUtil(resolvePath, tmpDir) {
  resolvePath = resolvePath.trim();
  
  // Check if already absolute
  if (resolvePath[0] === "/")
    return resolvePath;
  else {
    return path.resolve(tmpDir || curDir, resolvePath);
  }
}

pathUtil.setRoot = function(dir) {
  curDir = dir;
}
