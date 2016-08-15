var jSh = require("./jShorts2");
var console;

// Builder meta parsing utlities
exports.processMeta = function(src, modName, cons) {
  console = cons;
  var meta = getMeta(src);
  var regsBody = "";
  
  meta.identifiers.forEach(function(iden, i) {
    var metaVal = meta[iden];
    var metaRep = "";
    
    regsBody += (i !== 0 ? ",\n  " : "  ") + iden + ": ";
    
    // Check if array meta
    if (metaVal[1] === "array") {
      regsBody += "[";
      
      metaVal[0].forEach(function(item, i) {
        regsBody += (i !== 0 ? ", " : "") + getLiteralRepresentation(item[0], item[1]);
      });
      
      regsBody += "]";
    } else {
      regsBody += getLiteralRepresentation(metaVal[0], metaVal[1]);
    }
  });
  
  var metaRegs = `AUR.__registerModule("${modName}", {\n${regsBody}\n}, __aurModCode);`;
  return {
    meta: metaRegs,
    metaEnd: meta.metaBlockEnd,
    newLineCount: meta.newLineCount,
    identifiers: meta
  };
}

function getLiteralRepresentation(val, type) {
  var rep = "";
  
  switch (type) {
    case "number":
      rep = val;
    break;
    case "string":
      rep = "\"" + val +  "\"";
    break;
    case "boolean":
      rep = val;
    break;
  }
  
  return rep;
}

function getMeta(src, modName) {
  var metaMap     = {};
  var identifiers = [];
  
  var strQuot = "\"";
  var reQuot  = /["'`]/;
  var reWhite = /\s/;
  var reject  = /[^A-Z=\s_\[\],;\d\n\.]/i;
  var reIden  = /[A-Z_]/;
  var reNum   = /\d/;
  var reBool  = /[tf]/;
  var reBoolC = /[truefals]/;
  
  // Control states
  var inString = false;
  var inArray  = false;
  var endStatement = true;
  var assignment   = false;
  var pushedToArr  = false;
  
  var curIdentifier = null;
  var curPrimValue  = null;
  var curPrimType   = null;
  var curValue      = null;
  
  var lastNewline   = 0;
  var lastEndSMLine = 0;
  var newLineCount  = 0;
  
  for (var i=0,l=src.length; i<l; i++) {
    var char = src[i];
    var next = src[i + 1];
    var prev = src[i - 1];
    
    // Check for completed values not in array
    if (endStatement && !inArray && curIdentifier && curValue) {
      metaMap[curIdentifier] = [curValue, curPrimType];
      lastEndSMLine = lastNewline;
      
      identifiers.push(curIdentifier);
      curIdentifier = null;
    }
    // Check for completed values in an array
    else if (assignment && inArray && endStatement && !pushedToArr) {
      curValue.push([curPrimValue, curPrimType]);
      
      pushedToArr = true;
    }
    
    if (!inString) {
      // Newline
      if (endStatement && !inArray && char === "\n") {
        lastNewline = i;
        newLineCount++;
        // console.log(i, newLineCount, next, prev);
      }
      // Single line comment
      else if (char === "/" && next === "/") {
        while (next && next !== "\n") {
          i++;
          
          prev = char;
          char = src[i];
          next = src[i + 1];
        }
      }
      // Multi line comment
      else if (char === "/" && next === "*") {
        i++;
        
        while (!(prev === "*" && char === "/") && next) {
          prev = char;
          char = src[i];
          next = src[i + 1];
          
          if (char === "\n") {
            lastNewline = i;
            newLineCount++;
          }
          
          i++;
        }
      }
      // Start of string
      else if (reQuot.test(char)) {
        curPrimValue = "";
        
        inString = true;
        strQuot = char;
      }
      // Unacceptable char, terminates
      else if (reject.test(char)) {
        break;
      }
      // Whitespace
      else if (reWhite.test(char)) {
        if (char === "\n")
          newLineCount++;
        
        // Do nothing, move on
      }
      // Meta variable name
      else if (endStatement && reIden.test(char)) {
        curIdentifier = char;
        var startChar = i;
        
        while (next && reIden.test(next)) {
          i++;
          
          prev = char;
          char = src[i];
          next = src[i + 1];
          
          curIdentifier += char;
        }
        
        // Check if a valid identifier name
        if (curIdentifier.substr(0, 4) !== "AUR_")
          break;
        
        endStatement = false;
        assignment = false;
      }
      // Check for assignment operator
      else if (!endStatement && !assignment && char === "=") {
        assignment = true;
      }
      // Check for numbers
      else if (!endStatement && assignment && reNum.test(char)) {
        curPrimValue = char;
        var decimalPoint = false;
        var breakAll;
        
        while ((reNum.test(next) || next === ".") && !breakAll) {
          i++;
          
          prev = char;
          char = src[i];
          next = src[i + 1];
          
          if (char === ".")
            if (!decimalPoint) {
              curPrimValue += char;
              decimalPoint = true;
            } else
              breakAll = true;
          else
            curPrimValue += char;
        }
        
        if (breakAll)
          break;
        
        if (!inArray) {
          curValue = curPrimValue;
          assignment = false;
        } else {
          pushedToArr = false;
        }
        
        endStatement = true;
        curPrimType  = "number";
      }
      // Check for boolean
      else if (!endStatement && assignment && !inArray && reBool.test(char)) {
        var trueBool = char === "t";
        var boolBody = char;
        
        // Check for true
        if (trueBool) {
          while (boolBody.length < 4 && next) {
            i++;
            
            prev = char;
            char = src[i];
            next = src[i + 1];
            
            boolBody += char;
          }
          
          if (boolBody !== "true")
            boolBody = null;
        }
        // Check for false
        else {
          while (boolBody.length < 5 && next) {
            i++;
            
            prev = char;
            char = src[i];
            next = src[i + 1];
            
            boolBody += char;
          }
          
          if (boolBody !== "false")
            boolBody = null;
        }
        
        if (boolBody) {
          curValue = boolBody;
          assignment = false;
          
          endStatement = true;
          curPrimType  = "boolean";
        } else {
          break;
        }
      }
      // Check for array delimiter
      else if (inArray && char === ",") {
        curPrimValue = null;
        endStatement = false;
      }
      // Check for array start
      else if (assignment && char === "[") {
        curValue = [];
        inArray = true;
      }
      // Check for array end
      else if (assignment && inArray && char === "]") {
        inArray = false;
        endStatement = true;
        assignment = false;
        curPrimType = "array";
        pushedToArr = false;
      }
      // Check for semicolon to signify completion of assignment
      else if (!assignment && char === ";") {
        endStatement = true;
      }
      // Parsing error / stop
      else {
        break;
      }
    } else {
      // Check for faulty newline - parsing error
      if (char === "\n") {
        break;
      }
      // Check for escaped char
      else if (char === "\\") {
        curPrimValue += "\\" + next;
        i++;
      } else if (char === strQuot) {
        inString = false;
        
        // If in an array, will detect this
        endStatement = true;
        curPrimType = "string";
        
        if (!inArray) {
          curValue = curPrimValue;
          assignment = false;
        } else {
          pushedToArr = false;
        }
      } else
        curPrimValue += char;
    }
  }
  
  // Assure last char is *after* the metadata
  if (lastEndSMLine === lastNewline) {
    // Check if no identifiers found anyway
    if (identifiers.length === 0) {
      lastNewline = 0;
    } else {
      i = lastNewline + 1;
      
      for (; i<l; i++) {
        var char = src[i];
        var next = src[i + 1];
        
        if (char === "\n") {
          lastNewline = i;
          
          break;
        } else if (!next) {
          src += "\n";
          lastNewline = i + 1;
          
          break;
        }
      }
    }
  }
  
  return jSh.extendObj(metaMap, {
    metaBlockEnd: lastNewline,
    identifiers: identifiers,
    newLineCount: newLineCount
  });
}
