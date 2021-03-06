

// jShorts 2 Code
//
// Supposed to shorten my writing of vanilla JS, some quick shortcuts.

function getGlobal() {
  return this;
}

if (!getGlobal().lces)
  lces = {rc: [], onlyjSh: true, global: getGlobal()};
else
  lces.global = getGlobal();

lces.rc[0] = function() {
  lces.global = !lces.global ? window : lces.global;
  lces.global.undf = undefined;
  
  // Quick console prone errors mitigation
  if (!lces.global.console)
    Object.defineProperty(lces.global, "console", {
      value: {
        log: function() {},
        error: function() {},
        table: {}
      },
      writable: false,
      configurable: false,
      enumerable: true
    });

  // Main DOM Manipulation function
  lces.global.jSh = function jSh(src, first, test) {
    var parent, doc, result;
    
    if (typeof src === "string") {
      // "Locate" mode
      
      if (this === jShGlobal) {
        doc = true;
        parent = document;
      } else
        parent = this instanceof Node || jSh.MockupElement && this instanceof jSh.MockupElement || this instanceof HTMLDocument ? this : (lces.global.lcWidget && this instanceof lcWidget ? this.element : document);
      
      // Determine selector and return elements
      if (isID.test(src)) {
        if (doc) {
          result = document.getElementById(src.substr(1));
        } else {
          doc = jSh.MockupElement && parent instanceof jSh.MockupElement ? parent : (parent ? (parent.ownerDocument || parent) : document);
          result = doc.getElementById(src.substr(1));
        }
      } else if (isClass.test(src)) {
        result = jSh.toArr(parent.getElementsByClassName(src.substr(1)));
      } else if (isPH.test(src)) {
        src = src.substr(1).toLowerCase();
        
        result = jSh.oneOrArr(jSh.toArr(parent.getElementsByTagName("lces-placeholder")).filter(function(i) {return i.phName && i.phName.toLowerCase() === src;}));
      } else if (isTag.test(src)) {
        result = jSh.toArr(parent.getElementsByTagName(src));
      } else { // Must be rocket science queries, back to queryselectAll...
        if (first) {
          result = parent.querySelector(src);
        } else {
          result = jSh.toArr(parent.querySelectorAll(src));
        }
      }
      
      // Shorten them
      if (result) {
        var shortenedResult;
        
        if (result instanceof Array)
          shortenedResult = result;
        else
          shortenedResult = [result];
        
        for (var i=shortenedResult.length-1; i>=0; i--) {
          var elm = shortenedResult[i];
          
          if (!elm.jSh) {
            elm.getParent = getParent;
            elm.getChild  = getChild;
            elm.css       = setCSS;
            elm.on        = onEvent;
            elm.jSh       = jSh;
            
            // Improve append and removechild methods
            elm.__apch = elm.appendChild;
            elm.__rmch = elm.removeChild;
            
            elm.appendChild = jSh.elementExt.appendChild;
            elm.removeChild = jSh.elementExt.removeChild;
          }
        }
      }
      
      return result;
    } else if (typeof src === "number") {
      result = getChild.call(this, src);
      
      if (result && !result.jSh) {
        result.getParent = getParent;
        result.getChild  = getChild;
        result.css       = setCSS;
        result.on        = onEvent;
        result.jSh       = jSh;
    
        // Improve append and removechild methods
        result.__apch = result.appendChild;
        result.__rmch = result.removeChild;
    
        result.appendChild = elementExt.appendChild;
        result.removeChild = elementExt.removeChild;
      }
      
      return result;
    } else {
      // "Shorten" mode
      // In this mode «first» is referring to whether to enclose it in an lcWidget
      
      var e = jSh.determineType(src, true);
      
      if (!e)
        return src;
      
      if (first)
        new lcWidget(e);
      
      if (!e.jSh)
        jSh.shorten(e);
      
      return e;
    }
  }
  
  // Global
  var jShGlobal = jSh.global = lces.global;
  
  // JS functions
  
  // Check something's type when typeof isn't reliable
  jSh.type = function(obj) {
    return Object.prototype.toString.call(obj).match(/\[object\s([\w\d]+)\]/)[1].toLowerCase();
  }
  
  jSh.pushItems = function(array) {
    var items = jSh.toArr(arguments).slice(1);
    
    for (var i=0,l=items.length; i<l; i++) {
      array.push(items[i]);
    }
  }
  
  // Remove multiple items from an array
  jSh.spliceItem = function(array) {
    var items = jSh.toArr(arguments).slice(1);
    
    for (var i=0,l=items.length; i<l; i++) {
      var index = array.indexOf(items[i]);
      
      if (index !== -1)
        array.splice(index, 1);
    }
  }

  // Convert array-like object to an array
  jSh.toArr = function(arr) {
    return Array.prototype.slice.call(arr);
  }

  // Returns first item if array length is 1, otherwise the whole array
  jSh.oneOrArr = function(arr) {
    return arr.length === 1 ? arr[0] : arr;
  }

  // Check for multiple arguments or an array as the first argument for functions of single arity
  jSh.hasMultipleArgs = function(args, that) {
    var iterate = false;
    that = that || this;
    
    if (args.length > 1)
      iterate = jSh.toArr(args);
    if (jSh.type(args[0]) === "array")
      iterate = args[0];
    
    return iterate ? (iterate.forEach(function(i) {
      args.callee.call(that, i);
    }) ? true : true) : false;
  }

  // Extend the first object with the own properties of another, exclude is an array that contains properties to be excluded
  jSh.extendObj = function(obj, extension, exclude) {
    var objNames = Object.getOwnPropertyNames(extension);
    
    for (var i=objNames.length-1; i>-1; i--) {
      var name = objNames[i];
      
      if (!exclude || exclude.indexOf(name) === -1)
        obj[name] = extension[name];
    }
    
    return obj;
  }
  
  // Similar to extendObj, but will go into deeper objects if they exist and merging the differences
  jSh.mergeObj = function(obj, extension, dontReplaceObjects, dontReplaceValues, dontReplaceArrays) {
    function merge(curObj, curExt) {
      Object.getOwnPropertyNames(curExt).forEach(function(i) {
        var curProp    = curObj[i];
        var curExtProp = curExt[i];
        
        if (jSh.type(curProp) === "object" && jSh.type(curExtProp) === "object")
          merge(curProp, curExtProp);
        else if (dontReplaceArrays && jSh.type(curProp) === "array" && jSh.type(curExtProp) === "array")
          curProp.push.apply(curExtProp);
        else if (dontReplaceValues && curProp === undefined)
          curObj[i] = curExtProp;
        else if (!dontReplaceObjects || jSh.type(curProp) !== "object" && (!dontReplaceValues || curProp === undefined))
          curObj[i] = curExtProp;
      });
    }
    
    merge(obj, extension);
    return obj;
  }
  
  jSh.constProp = function(obj, propName, propValue) {
    Object.defineProperty(obj, propName, {
      configurable: false,
      writable: false,
      enumerable: true,
      value: propValue
    });
  }
  
  // Make a function inherit another in the prototype chain
  jSh.inherit = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
  }

  // Return string s multiplied 'n' integer times
  jSh.nChars = function(s, n) {
    s = s + "";
    n = isNaN(n) ? 1 : parseInt(n);
    
    var str = "";
    
    for (var i=0; i<n; i++) {
      str += s;
    }
    
    return str;
  }
  
  jSh.strCapitalize = function(str) {
    str = str + "";
    
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  }
  
  // Options determining utils
  jSh.boolOp = function(src, def) {
    return src !== undefined ? !!src : def;
  }

  jSh.numOp = function(src, def) {
    return !isNaN(src) && typeof src === "number" && src > -Infinity && src < Infinity ? parseFloat(src) : def;
  }

  jSh.strOp = function(src, def) {
    return typeof src === "string" && src ? src : def;
  }
  
  // To silently mitigate any JSON parse error exceptions to prevent the whole from self destructing
  jSh.parseJSON = function(jsonstr) {
    var result;
    
    try {
      result = JSON.parse(jsonstr);
    } catch (e) {
      console.warn(e);
      
      result = {error: "JSON parse failed", data: null};
    }
    
    return result;
  }
  
  jSh.filterHTML = function(s) {
    s = s.replace(/&/g, "&amp;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    return s;
  }
  
  // DOM Creation Functions

  // Create HTML DOM Div elements with a flexible nesting system
  jSh.d = function node(className, text, child, attributes, properties, events) { // For creating an element
    var nsElm, elmClassName, isMockup, dynClass; // For things like SVG... Ugggh. :|
    
    if (!this.lcesElement) {
      // Check if we need to make an element with a custom namespace URI
      if (this.lcesType) {
        var nsCheck = /^ns:[\w\d_]+:[^]+$/i.test(this.lcesType);
        
        if (!nsCheck)
          var n = jSh.e(this.lcesType);       // Create main element, if this isn't window, set to specified element.
        else {
          // var nsURI = this.lcesType.replace(/^ns:[\w\d_]+:([^]+)$/i, "$1"); TODO: Check this
          var nsElm = this.lcesType.replace(/^ns:([\w\d_]+):[^]+$/i, "$1");
          
          var n = jSh.e(this.lcesType);
        }
      } else {
        var n = jSh.e("div");
      }
    } else {
      // Element is already provided
      var n = this.lcesElement;
      
      if (n.isjShMockup)
        isMockup = true;
    }
    
    // Check if the args provided are all enclosed in an object
    if (className instanceof Object) {
      var args = className;

      elmClassName = args.className || args.class || args.sel;
      text         = args.text;
      child        = args.child || args.children;
      attributes   = args.attributes || args.attr;
      properties   = args.properties || args.prop || args.props;
      events       = args.events;
      
      if (isMockup)
        dynClass = args.dynClass;
    } else {
      elmClassName = className;
      
      if (isMockup && attributes)
        dynClass = attributes.dynClass;
    }
    
    // Check for an arguments availability and apply it if detected
    
    // Check for special assignments in classname argument
    var id       = "";
    var newClass = "";
    
    if (elmClassName) {
      var validFormat = /^(?:#[a-zA-Z\d\-_]+)?(?:\.[a-zA-Z\d\-_]+)+$|^#[a-zA-Z\d\-_]+(?:\.[a-zA-Z\d\-_]+)*$/;
      var hasClass    = /\.[a-zA-Z\d\-_]+/g;
      var hasId       = /#([a-zA-Z\d\-_]+)/;
      
      if (validFormat.test(elmClassName)) {
        newClass = jSh.toArr(elmClassName.match(hasClass) || []);
        id       = elmClassName.match(hasId);
        
        if (newClass.length > 0) {
          for (var i=newClass.length-1; i>-1; i--) {
            newClass[i] = newClass[i].substr(1);
          }
          
          // Workaround for things like SVG that don't have a simple .className property
          if (!nsElm)
            n.className = newClass.join(" ");
          else
            attributes["class"] = newClass.join(" ");
        }
      } else {
        if (!nsElm)
          n.className = elmClassName;
        else
          attributes["class"] = elmClassName;
      }
    }
    
    if (id)
      n.id = id[1];
    
    if (text) {
      n[text.t ? "innerHTML" : "textContent"] = (text.s ? text.s : text);
      n[text.t ? "_innerHTML" : "_textContent"] = (text.s ? text.s : text);
    }
    
    if (child) {
      if (child instanceof Array) {
        var frag = this.lcesElement || jSh.docFrag();
        
        for (var i=0,l=child.length; i<l; i++) {
          frag.appendChild(child[i]);
        }
        
        // Append if not LCES template element
        if (!this.lcesElement)
          n.appendChild(frag);
      } else
        n.appendChild(child);
    }
    
    var checkNSAttr = /^ns:[^:]+:[^]*$/i;
    
    if (attributes) {
      var attrs = Object.getOwnPropertyNames(attributes);
      
      for (var i=attrs.length-1; i>-1; i--) {
        var attr = attrs[i];
        
        if (!checkNSAttr.test(attr) || jSh.MockupElement && n instanceof jSh.MockupElement)
          n.setAttribute(attr, attributes[attr]);
        else {
          var nsURI = attr.replace(/^ns:[^:]+:([^]*)$/i, "$1");
          var nsAttr = attr.replace(/^ns:([^:]+):[^]*$/i, "$1");
          
          n.setAttributeNS(nsURI ? nsURI : null, nsAttr, attributes[attr]);
        }
      }
    }

    if (properties) {
      var props = Object.getOwnPropertyNames(properties);
      
      for (var i=props.length-1; i>-1; i--) {
        var prop = props[i];
        n[prop] = properties[prop];
      }
    }
    
    if (events) {
      var evts = Object.getOwnPropertyNames(events);
      
      for (var i=evts.length-1; i>-1; i--) {
        var evName = evts[i];
        var evObj  = events[evName];
        
        if (evObj instanceof Array) {
          for (var j=evObj.length-1; j>-1; j--) {
            n.addEventListener(evName, evObj[j]);
          }
        } else {
          n.addEventListener(evName, evObj);
        }
      }
    }
    
    if (isMockup && dynClass instanceof Object)
      n.dynClass = dynClass;
    
    return jSh.shorten(n);
  };

  // Create a 'type' DOM element with flexible nesting system
  jSh.c = function nodeC(type, className, text, child, attributes, properties) { // Custom node
    return jSh.d.call({lcesType: type}, className, text, child, attributes, properties);
  }

  // Create raw DOM element with no special features
  jSh.e = function(tag) {
    var nsCheck = tag.match(/^ns:([\w\d_]+):([^]+)$/i);
    if (!nsCheck) {
      return document.createElement(tag);
    } else {
      var nsElm = nsCheck[1];
      var nsURI = nsCheck[2];
      
      var n = document.createElementNS(nsURI, nsElm);
      n.nsElm = true;
      
      return n;
    }
  }

  // Create an HTML DOM text node
  jSh.t = function(t) {
    return document.createTextNode(t);
  }

  // Create SVG with path nesting feature
  jSh.svg = function(classname, width, height, paths) {
    return jSh.c("ns:svg:http://www.w3.org/2000/svg", classname, undefined, paths, { // Attributes
      "version": "1.1",
      "width": width,
      "height": height
    });
  }

  // Create SVG path
  jSh.path = function(classname, points, style) {
    return jSh.c("ns:path:http://www.w3.org/2000/svg", classname, undefined, undefined, {
      "ns:d:": points,
      "ns:style:": style || ""
    });
  }
  
  // Check if in browser environment
  if (lces.global.document)
    jSh.docFrag = document.createDocumentFragment.bind(document);
  
  // DOM Manipulation Functions

  var getChild = jSh.getChild = function(off, length) {
    var parent = length instanceof Object ? length : this;
    var children = jSh.toArr(parent.childNodes);
    var check = [];
    var ELM_NODE = Node.ELEMENT_NODE;
    
    for (var i=children.length-1; i>-1; i--) {
      var child = children[i];
      
      if (child.nodeType === ELM_NODE) {
        check.push(child);
        
        if (!child.jSh)
          jSh.shorten(child);
      }
    }
    
    check = check.reverse();
    if (off < 0)
      off = check.length + off;
    
    if (!check[off])
      return null;
    
    if (typeof length === "number" && length > 1)
      return check.slice(off, off + length);
    else
      return check[off];
  }
  
  var getParent = jSh.getParent = function(jump) {
    if (jSh.type(jump) !== "number" || jump < 0)
      return null;
    
    var par = this;
    while (jump > 0 && par !== document.body) {
      par = par.parentNode;
      
      jump--;
    }
    
    return par;
  }
  
  // Assert whether node 'e' is a child of node 'p'
  jSh.isDescendant = function(e, p) {
    var parent = e.parentNode;
    var assert = false;
    
    while (parent != document.body) {
      if (parent == p) {
        assert = true;
        break;
      }
      
      parent = parent.parentNode;
    }
    
    return assert;
  }

  var onEvent = jSh.onEvent = function(e, func, bubble) {
    this.addEventListener(e, func, bubble);
  }

  // Selector functions

  jSh.shorten = function(e) {
    var hasMultipleArgs = jSh.hasMultipleArgs(arguments);
    if (hasMultipleArgs)
      return arguments.length === 1 ? e : jSh.toArr(arguments);
    
    // Check if should shorten
    if (e && !e.getChild) {
      e.getParent = jSh.getParent;
      e.getChild  = jSh.getChild;
      e.on        = jSh.onEvent;
      e.css       = jSh.setCSS;
      e.jSh       = jSh;
      
      // Improve append and removechild methods
      e.__apch = e.appendChild;
      e.__rmch = e.removeChild;
      
      e.appendChild = jSh.elementExt.appendChild;
      e.removeChild = jSh.elementExt.removeChild;
    }
    
    return e;
  }
  
  var setCSS = jSh.setCSS = function(css) {
    if (!css || jSh.type(css) !== "object")
      return this;
    
    var props = Object.getOwnPropertyNames(css);
    var style = this.style;
    
    for (var i=props.length-1; i>-1; i--) {
      var propName = props[i];
      style[propName] = css[propName];
    }
    
    return this;
  }
  
  var elementExt = jSh.elementExt = {
    appendChild: function() {
      var children = jSh.toArr(arguments);
      
      if (children[0] instanceof Array)
        children = children[0];
      
      for (var i=0,l=children.length; i<l; i++) {
        this.__apch(children[i]);
      }
      
      if (children.length === 1)
        return children[0];
      else
        return children;
    },
    
    removeChild: function() {
      var children = jSh.toArr(arguments);
      
      if (children[0] instanceof Array)
        children = children[0];
      
      if (typeof this.__rmch !== "function")
        console.log({x: this}, this.__rmch, this.__apch);
      
      for (var i=children.length-1; i>-1; i--) {
        this.__rmch(children[i]);
      }
      
      if (children.length === 1)
        return children[0];
      else
        return children;
    }
  }
  
  // Determine selector in the string
  jSh.isID    = /^#[\w\-]+$/;
  jSh.isClass = /^\.[a-zA-Z\d\-_]+$/;
  jSh.isTag   = /^[a-zA-Z\d\-]+$/;
  jSh.isPH    = /^~[a-zA-Z\d\-_]+$/; // LCES Templating, placeholder element
  
  var isID    = jSh.isID;
  var isClass = jSh.isClass;
  var isTag   = jSh.isTag;
  var isPH    = jSh.isPH;

  // For distinguishing between lcWidget and a Node instance
  jSh.determineType = function(obj, jShDetermine) {
    if (!obj)
      return false;
    
    if (obj instanceof Node || obj instanceof HTMLDocument && jShDetermine)
      return obj;
    
    // MockupElement
    if (jSh.MockupElement && obj instanceof jSh.MockupElement)
      return obj;
    
    if (lces.global.lcWidget && obj instanceof lcWidget && obj.element instanceof Node)
      return obj.element;
    
    return null
  }


  // A quick typo-fill :D
  var jSH = jSh;
};

if (lces.onlyjSh)
  lces.rc[0]();

// Check if NPM module
if (lces.global.global && !lces.global.window)
  module.exports = jSh;


lces.rc[9] = function() {
  // lces colorize global variable
  lces.css = {};

  // lces.css.colorize(css, r, g, b)
  //
  // css: String with CSS style rules
  // r, g, b: Red/Green/Blue Channel values with 0-255 range
  //
  // Takes the css rule string passed as the first argument
  // and scans and replaces the color values of properties,
  // be them a Hex, or rgba/rgba function value.
  //
  // Currently has no effect on HSV functions.
  // Later version: Supports lc-rgbhsv and lc-rgbahsv functions.
  lces.css.colorize = function(css, r, g, b) {
    var cssColorizeSrc = false;
    
    // Check for colorized CSS source
    if (typeof css !== "string") {
      cssColorizeSrc = css;
      
      css = css.lcesColorizeSrc || css.textContent;
    }
    
    var hexNum  = function(n) {return (parseInt(n, 16) < 17 ? "00".substr(n.length) : "") + n + (parseInt(n, 16) > 16 ? "00".substr(n.length) : "");};
    hexNum.full = function(r, g, b) {return "#" + hexNum(r.toString(16)) + hexNum(g.toString(16)) + hexNum(b.toString(16));}
    
    // For direct conversion
    var hex = hexNum.full(r, g, b);
    
    // Filter and dump CSS
    css = css.replace(/rgb(a?)\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*((?:,\s*\d{1}(?:\.\d+)?\s*)?)\)/gi, "rgb$1(" + r + ", " + g + ", " + b + "$2)");
    css = css.replace(/:\s*#(?:[\d\w]{3}|[\d\w]{6})\s*;/gi, ": " + hex + ";");
    
    // Check for lcesColorizeSource syntax
    if (cssColorizeSrc) {
      var rgbhsv  = /lc-rgbhsv\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\)/;
      var rgbahsv = /lc-rgbahsv\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(\d+(?:\.\d+)?)\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\)/;
      var bothhsv = /lc-rgba?hsv\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*\d+(?:\.\d+)?\s*)?,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/;
      
      // Get first lc-rgb(a)hsv(...) match
      var hsvOffset = css.match(bothhsv);
      var colorHSV  = lces.ui.RGB2HSV(r / 255, g / 255, b / 255);
      
      // Iterate rgbhsv functions
      while (hsvOffset) {
        var alpha   = hsvOffset[0].match(rgbahsv);
            alpha   = alpha ? alpha[1] : alpha;
        
        var isAlpha = isNaN(alpha) || !alpha && alpha !== 0 ? false : true;
        
        // Get HSV values
        var h = parseFloat(hsvOffset[1]);
        var s = parseFloat(hsvOffset[2]) / 100;
        var v = parseFloat(hsvOffset[3]) / 100;
        
        // Normalize Hue offset
        var hueOff = colorHSV.h + h;
            hueOff = Math.round(hueOff > 360 ? hueOff - 360 : hueOff < 0 ? hueOff + 360 : hueOff);
        
        var satOff = Math.max(Math.min(colorHSV.s + s, 1), 0);
        var valOff = Math.max(Math.min(colorHSV.v + v, 1), 0);
          
        // Make compiled rgb(a) function
        var rgb = lces.ui.HSV2RGB(hueOff, satOff, valOff).map(function(i) {return parseInt(i * 255);})
        var newProp = "rgb" + (isAlpha ? "a" : "") + "(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + (isAlpha ? "," + alpha : "") + ")";
        
        // Replace with compiled function
        css = css.slice(0, hsvOffset.index) + newProp + css.slice(hsvOffset.index + hsvOffset[0].length);
        
        // Next function
        hsvOffset = css.match(bothhsv);
      }
      
      // Add new CSS
      cssColorizeSrc.removeChild(cssColorizeSrc.childNodes[0]);
      cssColorizeSrc.appendChild(jSh.t(css));
    }
    
    return css;
  }

  // Appends css animation transition properties for color properties
  // in the provided CSS string
  lces.css.appendTransition = function(css, duration, timingFunction) {
    duration       = duration ? duration : "250ms";
    timingFunction = timingFunction ? timingFunction : "ease-out";
    
    return css.replace(/\n(\s*)([a-z\-]+):\s*(rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\.\d+)?\s*\)|#[a-z0-9]{3,6})\s*;/gi, "\n$1$2: $3;\n$1transition: $2 " + duration + " " + timingFunction + ";");
  }
}


// LCES Core code, depends on jShorts2.js

lces.rc[2] = function() {
  // LCES JS code (Acronym Galore! :D)
  // On another note, these *LV* things might be useless...
  
  // lces stats
  lces.LCES = {
    objectCount: 0
  };
  
  lces.global.LCESVar = function(n) {
    this.LCESVAR = true; // Might be needed in the future.
    this.id = n;
  }
  lces.global.LV = function(n) {
    return new LCESVar(n);
  }
  lces.global.isLV = function(v) {
    return v instanceof LCESVar;
  }

  lces.global.LCES = {
    // Core things go here
    EXTENDED_COMPONENT: LV(5), // I'll start from 5 because 0 or 1 can mean anything...
    BASE_COMPONENT: LV(6),

    components: [],

    // Now the functions
    isExtended: function(args) {
      return isLV(args[args.length - 1]) && args[args.length - 1] === LCES.EXTENDED_COMPONENT;
    }

  }

  // ESSENTIAL COMPONENT METHODS
  
  // For faster reference
  var Object = lces.global.Object || window.Object;
  
  // AUCP LCES Constructors
  lces.global.lcComponent = lcComponent;
  
  function lcComponent() {
    // This should be the fundamental building block
    // of the AUCP component linked event system. I can't
    // come up with something better to call it so just
    // AUCP Linked Component Event System I guess.
    // I like thinking up weird names, LCES is pronounced "Elsis" btw...

    if (this.__LCESCOMPONENT__)
      return true;

    // Use this to distinguish between instanced LCES components
    this.LCESID = ++lces.LCES.objectCount;
    var that = this;
    
    // If noReference is on then it just appends null
    if (!lces.noReference)
      LCES.components.push(this);
      
    this.states = {};
    this.extensionData = []; // Data for extensions
    this._noAutoState = {}; // To prevent auto state converting LCES utility from converting normal properties to states
    
    // Check if needs to add methods manually
    if (!(this instanceof lcComponent)) {
      jSh.extendObj(this, lcComponent.prototype);
      console.log("LCES ISN'T INSTACED WTF", this);
    }

    // Add our LCESName for easy access via global lces() function
    this.setState("LCESName", "");
    this.addStateListener("LCESName", function(LCESName) {
      if (LCESName)
        LCES.components[LCESName] = that;
    });
    this.addStateCondition("LCESName", function(LCESName) {
      var curValue = this.get();
      
      if (curValue) {
        if (curValue === LCESName)
          return false;
        
        LCES.components[curValue] = undefined;
      }

      return true;
    });

    // Now setup some important things beforehand...

    this.setState("statechange", "statechange");
    this.setState("newstate", "newstate");
    
    // Statechange state specifics
    this.states["statechange"].states = {};

    this._setState = this.setState;
    this.setState  = lcComponentSetState;
    
    this.groups = [];
    
    // Add the event array
    this.events = [];
    
    jSh.constProp(this, "__LCESCOMPONENT__", 1);
    return false; // Not being extended or anything, a new component.
  }
  
  jSh.extendObj(lcComponent.prototype, {
    __lcComponent__: 1,
    type: "LCES Component",
    isLCESComponent: true
  });
  
  lcComponent.prototype.constructor = lcComponent;
  
  // lcComponent custom setState method
  function lcComponentSetState(state, stateStatus, recurring) {
    var states    = this.states;
    var _setState = this._setState.bind(this);
    var stateObj  = states[state];
    
    var statechange = states.statechange;
    
    if (!recurring && stateObj && stateObj.stateStatus === stateStatus) {
      _setState(state, stateStatus, recurring, true);
      return false;
    }
      
    var newstate = false;
    if (!stateObj)
      newstate = true;

    if (!stateObj || !stateObj.flippedStateCall) {
      _setState(state, stateStatus, recurring);
      
      stateObj = states[state];
      
      if (stateObj.oldStateStatus !== stateObj.stateStatus) {
        if (!statechange.states[state])
          statechange.states[state] = {};
        
        statechange.states[state].recurring = recurring;
        
        _setState("statechange", state, true);
      }
    } else {
      if (stateObj.oldStateStatus !== stateObj.stateStatus) {
        if (!statechange.states[state])
          statechange.states[state] = {};
        
        statechange.states[state].recurring = recurring;
        
        _setState("statechange", state, true);
      }
      
      _setState(state, stateStatus, recurring);
    }

    if (newstate)
      _setState("newstate", state, true);
  }
  
  jSh.extendObj(lcComponent.prototype, {
    setState: function(state, stateStatus, recurring, recurred) {
      var stateObject = this.states[state];
      
      if (!stateObject) {
        // Since we don't have it, we'll make it.
        
        stateObject = {
          component: this,
          name: state,
          set: function(stateStatus) {this.component.setState(state, stateStatus);},
          get: function() {return this.stateStatus;},
          stateStatus: stateStatus,
          oldStateStatus: {nullStuff: null}, // Just to ensure that it doesn't match.
          functions: [],
          conditions: [],
          getter: null,
          data: {},
          private: false, // If true then data links (lcGroup) can't change it.
          flippedStateCall: false,
          profile: null,
          linkedStates: {} // {state: "state", func: func}
        };
        
        this.states[state] = stateObject;
        var that = this;

        Object.defineProperty(this, state, {configurable: true, set: function(stateStatus) { that.setState(state, stateStatus); }, get: function() { return that.getState(state); }});
      }
      
      // Check for profiling flag
      var canProfile = stateObject.profile;
      if (canProfile) {
        console.time(canProfile);
      }
      
      var stateCond   = stateObject.conditions;
      var canContinue = true;
      
      // Propose value during condition check
      stateObject.proposedValue = stateStatus;
      
      for (var i=0,l=stateCond.length; i<l; i++) {
        var condFunc = stateCond[i];
        
        if (condFunc)
          canContinue = condFunc.call(stateObject, stateStatus, recurred);
        
        if (!canContinue)
          return false;
      }
      
      // Set from proposedValue
      stateStatus = stateObject.proposedValue;
      
      if (stateObject.stateStatus === stateStatus && !recurring) {
        if (canProfile) {
          console.timeEnd(canProfile);
        }
        
        return false;
      }
      
      // If we're here then everything seems to be okay and we can move on.
      // Set the state.
      stateObject.oldStateStatus = stateObject.stateStatus;
      stateObject.stateStatus = stateStatus;
      
      var stateObjectFuncs = stateObject.functions;
      
      // Now call listeners...
      for (var j=0,l2=stateObjectFuncs.length; j<l2; j++) {
        var func = stateObjectFuncs[j];
        
        if (func)
          func.call(stateObject, stateStatus, recurring);
      }
      
      // Check for profiling flag
      if (canProfile) {
        console.timeEnd(canProfile);
      }
      
      return true;
    },

    getState: function(state) {
      if (!this.states[state])
        return false;

      return typeof this.states[state].get === "function" ? this.states[state].get.call(this.states[state]) : this.states[state].stateStatus;
    },

    hasState: function(state, throwError) {
      if (!this.states[state] && throwError)
        throw ReferenceError("No such state");

      return !!this.states[state];
    },

    addStateListener: function(state, stateFunc) {
      var stateObject = this.states[state];
      
      if (!stateObject) {
        this.setState(state, undefined);
        // console.warn(state + " doesn't exist"); // NOTICE: Removed for redundancy
        
        stateObject = this.states[state];
      }
      
      stateObject.functions.push(stateFunc);
    },

    addStateCondition: function(state, conditionFunc) {
      if (this.states[state]) {
        this.states[state].conditions.push(conditionFunc);
      } else
        throw ReferenceError("No such state");
    },

    addGroupLink: function(group) {
      group.addMember(this);
    },

    removeGroupLink: function(group) {
      if (group)
        group.removeMember(this);
    },
    
    removeAllGroupLinks: function() {
      var groups = this.groups;
      
      for (var i=0,l=groups.length; i<l; i++) {
        var group = groups[i];
        
        if (group)
          group.removeMember(this);
      }
    },

    removeStateListener: function(state, listener) {
      if (!this.states[state])
        throw ReferenceError("No such state");

      var stateObject = this.states[state];
      var index = stateObject.functions.indexOf(listener);
      
      if (index !== -1) {
        stateObject.functions.splice(index, 1);
        
        return true;
      }

      return false; // We failed it seems :/
    },

    removeAllStateListeners: function(state) {
      if (!this.states[state])
        throw ReferenceError("No such state");
      
      var functions = this.states[state].functions;
      var listenersLength = functions.length;
      
      for (var i=0; i<listenersLength; i++) {
        functions.splice(i, 1);
      }
      
      return true;
    },

    removeAllStateConditions: function(state) {
      if (!this.states[state])
        throw ReferenceError("No such state");

      this.states[state].conditions = [];
      return true;
    },

    removeState: function(state) {
      if (jSh.hasMultipleArgs(arguments, this))
        return;
      
      var stateObj = this.states[state];
      
      if (!stateObj)
        throw ReferenceError("No such state");
      
      var linkedStates = Object.getOwnPropertyNames(stateObj.linkedStates);
      var unlinkStates = this.unlinkStates.bind(this);
      
      for (var i=0,l=linkedStates.length; i<l; i++) {
        if (this.states[linkedStates[i]])
          unlinkStates(state, linkedStates[i]);
      }
      
      stateObj.component = undefined;
      
      this.states[state] = undefined; // NOTICE: Used delete keyword FIX
      delete this[state];        // TODO: FIX THIS
    },
    
    removeAllStates: function() {
      var states = Object.getOwnPropertyNames(this.states);
      
      for (var i=0,l=states.length; i<l; i++) {
        this.removeState(states[i]);
      }
      
      return true;
    },
    
    linkStates: function(state1, state2, callback) {
      var that = this;
      if (!this.states[state1])
        this.setState(state1, "");
      
      if (!this.states[state2])
        this.setState(state2, "");
      
      // First check if they're already linked.
      if (this.states[state1].linkedStates[state2] || this.states[state2].linkedStates[state1])
        this.unlinkStates(state1, state2);
      
      function listener(state) {
        var callback = listener.callback;
        var state1   = listener.state1;
        var state2   = listener.state2;
        
        var state1Value = that.getState(state1);
        var state2Value = that.getState(state2);
        
        if (!callback && state1Value === state2Value)
          return true;
        
        // Now to set the state in question
        if (state === state2)
          that.setState(state1, callback ? callback(state2Value) : state2Value);
        else if (state === state1 && !callback)
          that.setState(state2, state1Value);
      };
      
      listener.callback = callback;
      listener.state1   = state1;
      listener.state2   = state2;

      this.states[state1].linkedStates[state2] = listener;
      this.states[state2].linkedStates[state1] = listener;

      this.setState(state2, this.getState(state1));
      this.addStateListener("statechange", listener);
    },

    unlinkStates: function(state1, state2) {
      var stateObj1 = this.states[state1];
      var stateObj2 = this.states[state2];
      
      if (!stateObj1 || !stateObj2)
        throw ReferenceError("No such state");

      if (!stateObj1.linkedStates[state2])
        throw TypeError("[" + state1 + "] isn't linked to [" + state2 + "]");


      this.removeStateListener("statechange", stateObj1.linkedStates[state2]);
      
      stateObj1.linkedStates[state2] = undefined;
      stateObj2.linkedStates[state1] = undefined;

      return true;
    },

    hardLinkStates: function(state1, state2) { // State1 will be considered nonexistant.. And if it exists it'll be deleted.
      if (!this.states[state2])
        throw ReferenceError("No such state");
      
      if (this.states[state1])
        removeState(state1);
      
      var that = this;
      
      this.states[state1] = this.states[state2];
      Object.defineProperty(this, state1, {configurable: true, set: function(stateStatus) { that.setState(state1, stateStatus); }, get: function() { return that.getState(state1); } });
    },
    
    copyState: function(state1, state2) {
      if (!this.states[state1])
        throw ReferenceError("No such state");
      if (this.states[state2])
        this.removeState(state2);
      
      this.setState(state2, null);
      
      // NOTICE: Object.create(o) isn't supported in IE8!!! But ofc, Idc.
      
      var newStateObj = Object.create(this.states[state1]);
      this.states[state2] = newStateObj;
    },
    
    extend: function(component) { // TODO: Check this, it might be useless
      var args = [];
      for (var i=1,l=arguments.length; i<l; i++) {
        args.push(arguments[i]);
      }
      
      var data = {
        component: this
      };
      this.extensionData.push(data);
      
      component.apply(this, args.concat([data, LCES.EXTENDED_COMPONENT]));
    },
    
    dataSetState: function(state, stateStatus, recurring) {
      this._setState(state, stateStatus, recurring);
    },
    
    profileState: function(state, profileName) {
      var stateObj = this.states[state];
      
      if (!stateObj) {
        throw new ReferenceError("LCESComponent.protoype.profileState: state `" + state + "` doesn't exist");
      }
      
      if (typeof profileName !== "string" || !profileName) {
        throw new TypeError("LCESComponent.protoype.profileState: profileName needs to be a populated string");
      }
      
      stateObj.profile = profileName;
    },
    
    // Event system
    addEvent: function(event) {
      if (!event || jSh.type(event) !== "string" || this.events[event])
        return false; // TODO: Fix this, it repeats too much... DRY!!!!!!!!!
      
      this.events[event] = {
        name: event,
        listeners: []
      };
    },
    
    removeEvent: function(event) {
      if (!event || jSh.type(event) !== "string" || !this.events[event])
        return false;
      
      this.events[event] = undefined;
    },
    
    removeAllEvents: function() {
      var events = this.events;
      
      for (var i=0,l=events.length; i<l; i++) {
        events[i] = undefined;
      }
    },
    
    triggerEvent: function(event, evtObj) {
      if (!event || jSh.type(event) !== "string" || !this.events[event])
        return false;
      
      if (!evtObj || jSh.type(evtObj) !== "object")
        throw Error(event + " cannot be triggered without an EventObject");
      
      this.events[event].listeners.forEach(function(func) {
        try {
          func(evtObj);
        } catch (e) {
          console.error(e);
        }
      });
    },
    
    on: function(event, listener) {
      // Check the listener
      if (typeof listener !== "function")
        return false;
      
      // Check for the event
      if (!this.events[event])
        this.addEvent(event);
      
      var evtObj = this.events[event];
      
      evtObj.listeners.push(listener);
    },
    
    removeListener: function(event, listener) {
      var evtObj = this.events[event];
      
      if (!event || jSh.type(event) !== "string" || !evtObj)
        return false;
      
      var index = evtObj.listeners.indexOf(listener);
      
      if (index !== -1)
        evtObj.listeners.splice(index, 1);
    }
  });
  
  function lcGroup() {
    var extended = lcComponent.call(this);
    if (!extended)
      this.type = "LCES Group";
    
    var that = this;
    var members  = [];
    this.members = members;
    this.lastTrigger = {}; // lastTrigger[state] = LastTriggeringMember
    
    var thatStates = that.states;
    
    // Check if not instaced
    if (!(this instanceof lcGroup)) {
      jSh.extendObj(this, lcGroup.prototype);
      console.log("LCES LCGROUP PHONY BASTARD - ", this);
    }
    // Update members after a trigger
    var updatingGroupState = false;
    
    function updateMembers(state, value, recurring) {
      var that = updateMembers.that;
      var members = updateMembers.members;
      
      for (var i=0,l=members.length; i<l; i++) {
        var member = members[i];
        
        if (member.states[state] && !member.states[state].private && member.states[state].stateStatus !== value || recurring) {
          if (!that.exclusiveMembers[state]) {
            member._setState(state, value, recurring);
            member._setState("statechange", state, true);
          } else if (that.exclusiveMembers[state]) {
            member._setState(state, that.isExclusiveMember(state, member) ? !that.getState(state) : that.getState(state));
            member._setState("statechange", state, true);
          }
        }
      }
    }
    
    updateMembers.that    = that;
    updateMembers.members = members;
    
    this.recurring = true;
    this.recurringMemberTrigger = true;
    this.memberMethod = function mmethod(state) {
      var that = mmethod.that;
      var component = this.component;
      
      if (that.states[state] && state !== "LCESName" && !that.states[state].private) {
        // Now to tell everyone else the news...

        that.lastTrigger[state] = component;
        
        if (that.states[state].isExclusive) {
          that.setState(state, that.getState(state), that.recurringMemberTrigger);
        } else {
          updateMembers(state, component.states[state].stateStatus);
          
          updatingGroupState = true;
          that.setState(state, component.states[state].stateStatus);
          updatingGroupState = false;
        }
      }
    }
    
    this.memberMethod.that = that;
    
    this.setState("newmember", null);

    this.addStateListener("statechange", function(state) {
      if (updatingGroupState) {
        updatingGroupState = false;
        
        return;
      }
      
      if (state !== "LCESName")
        updateMembers(state, that.states[state].stateStatus, this.states[state].recurring);
    });
    
    this.addStateListener("newstate", function(state) {
      that.states[state].isExclusive = false;
      that.states[state].exclusiveFunctions = [];
    });

    this.onExclusiveStateChange = function() {
      var that2 = this;
      
      var exclusiveMembers = that.exclusiveMembers[this.name];
      
      if (exclusiveMembers.indexOf(that.lastTrigger[this.name]) === -1) {
        if (exclusiveMembers.length === exclusiveMembers.memberLimit) {
          exclusiveMembers[exclusiveMembers.length - 1]._setState(this.name, this.get());
          exclusiveMembers.splice(exclusiveMembers.length - 1, 1);
        }

        exclusiveMembers.splice(0, 0, that.lastTrigger[this.name]);
      }
      
      // Call the functions if any.
      this.exclusiveFunctions.forEach(function(i) {
        i.call(that2, that.lastTrigger[that2.name]);
      });
    }

    this.setExclusiveState = function(state, exclusiveState, memberLimit) {
      this.states[state].isExclusive = true;

      this.exclusiveMembers[state] = [];
      this.exclusiveMembers[state].memberLimit = memberLimit;

      this.setState(state, !exclusiveState);
      this.addStateListener(state, this.onExclusiveStateChange);
    }

    this.exclusiveMembers = {};

    this.isExclusiveMember = function(state, member) {
      if (!this.hasState(state, true) || !this.exclusiveMembers[state])
        return false;

      return this.exclusiveMembers[state].indexOf(member) !== -1;
    }
  }
  
  jSh.inherit(lcGroup, lcComponent);
  
  jSh.extendObj(lcGroup.prototype, {
    addMember: function(component) {
      var that = this;
      var args = arguments;
      
      if (jSh.type(component) == "array")
        return component.forEach(function(i) {args.callee.call(that, i);});

      if (jSh.toArr(arguments).length > 1)
        return jSh.toArr(arguments).forEach(function(i) {args.callee.call(that, i);});


      this.members.push(component);
      component.groups.push(this);
      component.addStateListener("statechange", this.memberMethod);
      
      this.setState("newmember", component, true); // I might not need that dangerous recurring, we'll see.
    },

    removeMember: function(component) {
      component.groups.splice(component.groups.indexOf(this), 1);
      this.members.splice(this.members.indexOf(component), 1);
      
      component.removeStateListener("statechange", this.memberMethod);
    },
    
    
    addExclusiveListener: function(state, listener) {
      if (!this.states[state])
        throw ReferenceError("No such state");
      if (jSh.type(listener) !== "function")
        throw TypeError("Listener " + listener + " is not of type 'function'");
      
      this.states[state].exclusiveFunctions.push(listener);
    },
    
    removeExclusiveListener: function(state, listener) {
      if (!this.states[state])
        throw ReferenceError("No such state");
      
      if (this.states[state].exclusiveFunctions.indexOf(listener) !== -1)
        this.states[state].splice(this.states[state].exclusiveFunctions.indexOf(listener), 1);
    }
  });
  
  lces.global.lcGroup = lcGroup;
  
  // LCES Server Related Components
  
  lces.global.lcData = function() { // This should be for stuff that is shared with the server's DB
    var extended = lcComponent.call(this);
    if (!extended)
      this.type = "LCES Data Link";

    var that = this;


    this.onchange = function(state) {
      var query = {};
      query[state] = this.get();

      var req = new lcRequest({
        method: "post",
        uri: "/action",
        query: query,
        form: true
      });
      req.send();
    }

    this.addStateListener("newstate", function(state) {
      that.addStateListener(state, function() {
        that.onchange.call(this, state);
      });
    });
  }

  lces.global.lcRequest = function(args) { // args: {method, uri | url, callback, query, formData, async}
    // Check for args
    args = jSh.type(args) === "object" ? args : null;
    if (args === null)
      return null;
    
    var extended = lcComponent.call(this);
    if (!extended)
      this.type = "LCES Request";
    
    var that   = this;
    this.xhr   = typeof args.__XMLHttpRequest === "function" ? new args.__XMLHttpRequest() : new XMLHttpRequest();
    var  xhr   = this.xhr;
    this.abort = xhr.abort.bind(xhr);
    
    if (typeof (args.callback || args.success || args.fail) === "function") {
      xhr.onreadystatechange = function() {
        if (typeof args.callback === "function")
          args.callback.call(this);
        
        if (this.readyState === 4) {
          if (this.status === 200) {
            if (typeof args.success === "function")
              args.success.call(this);
          } else {
            if (typeof args.fail === "function")
              args.fail.call(this);
          }
        }
      }
    }

    if (args.setup && typeof args.setup === "function")
      args.setup.call(xhr);

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

    var method = !args.method || args.method.toLowerCase().indexOf("get") != -1 ? "GET" : "POST";

    xhr.open(method, (args.uri || args.url) + (method == "GET" ? (queryString ? "?" + queryString : "") : ""), args.async !== undefined ? args.async : true);

    if (args.form)
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    
    this.send = function() {
      var oldCookies = document.cookie.split(/\s*;\s*/).map(function(c) {return [c.split("=")[0], c.split("=")[1]]});
      
      if (args.cookies === false) { // Remove all cookies
        var time = (new Date());
        time.setTime(0);
        
        oldCookies.forEach(function(c) {document.cookie = c[0] + "=; expires=" + time + "; path=/"});
      }
      
      xhr.send(method == "POST" ? queryString : undefined);
      
      if (args.cookies === false) { // Readd the cookies
        setTimeout(function(){ oldCookies.forEach(function(c) {document.cookie = c[0] + "=" + c[1] + "; expires=; path=/"}) }, 50);
      }
    }
  }

  jSh.inherit(lcRequest, lcComponent);


  // LCES Main functions

  if (!window.lces) // TODO: Likely redundant code, FIXME
    window.lces = function(lcesname) {
      return LCES.components[lcesname];
    }

  // Global container of all lces.types
  lces.types = {
    "component": lcComponent,
    "group": lcGroup
  }
  
  // lces.noReference = Bool
  //
  // If true LCES won't save any reference to any components created
  // it's set. But if set back to false LCES will store a refernce for every component.
  lces.noReference = false;
  
  // lces.new(type, [, arg1[, arg2[, ...]]])
  //
  // type: String. LCES Constructor type as registered in lces.types
  //
  // Returns a new instance of an LCES constructor of
  lces.new = function(type) {
    var args = jSh.toArr(arguments).slice(1);
    var func = lces.types[type || "component"];
    
    return typeof func === "function" ? new (Function.prototype.bind.apply(func, [null].concat(args))) : null;
  }
  
  lces.type = function(type) {
    return lces.types[type || "component"];
  }
  
  // lces.deleteComponent
  //
  lces.deleteComponent = function(component) {
    if (!component || !(component instanceof lcComponent)) {
      console.error("LCES ERROR: Deleting component failed, invalid LCES component");
      
      return false;
    }
    
    var LCESComponents = LCES.components;
    
    var LCESName = component.LCESName;
    
    LCESComponents[component.LCESID] = undefined;
    component.removeAllGroupLinks();
    component.removeAllStates();
    component.removeAllEvents();
    
    if (LCESName && LCESComponents[LCESName] === component)
      LCESComponents[LCESName] = undefined;
  }
  
  // Initiation functions system
  lces.initSystem = function() {
    var that = this;
    
    // Arrays that contain all the init functions. DO NOT MUTATE THESE ARRAYS DIRECTLY, use the LCES methods provided instead
    //
    // PRIORITY SYSTEM:
    //  0: Pre-initiation:  Functions that have things to do before Initiation starts.
    //  1: Initiation:      Functions that get everything into a running state.
    //  2: Post-initiation: Functions that tidy up everything after Initiation is complete.
    this.preInitFunctions = [];
    this.initFunctions = [];
    this.postInitFunctions = [];
    
    // Priority array mapping
    this.initPriority = {
      "0": this.preInitFunctions,
      "1": this.initFunctions,
      "2": this.postInitFunctions
    };
    
    // Add initSystem methods
    jSh.extendObj(this, lces.initSystem.methods);
    
    // After initiation completes will be set to true
    this.initiated = null;
    
    // Main LCES init function
    this.init = function() {
      if (this.initiated)
        return false;
      
      // Prevent any conflicts from a possible secondary call to lces.init()
      this.initiated = true;
      
      var priorityArrays = Object.getOwnPropertyNames(this.initPriority);
      
      // Loop all priority arrays and their functions cautiously
      for (var i=0,l=priorityArrays.length; i<l; i++) {
        var pArray = that.initPriority[priorityArrays[i]];
        
        for (var j=0,l2=pArray.length; j<l2; j++) {
          try {
            pArray[j](); // Covers ears and hopes nothing blows up
          } catch (e) {
            // Ehhh, so, what happened????
            console.error(e);
          }
        }
      }
    };
  }

  // Contain all the
  lces.initSystem.methods = {
    // LCES Initiation sequence manipulation methods internal mechanism for validating/determining the priority
    getInitPriority: function(priority) {
      return !isNaN(priority) && this.initPriority[priority] ?
                this.initPriority[priority] :
                this.initPriority[1];
    },
    
    // The init priority system manipulation functions
    
    // lces.addInit(initFunc, priority)
    //
    // func: Function. Function to be added to the initiation sequence
    // priority: Integer. Possible value: 0-2 Default: 1 It determines which priority stack the function gets allocated to
    //
    // Description: Adds func to the LCES initiation sequence of priority <priority>. The function will be called
    //              when it's priority is running after lces.init() is invoked.
    addInit: function(func, priority) {
      priority = this.getInitPriority(priority);
      
      if (typeof func !== "function")
        throw TypeError("LCES Init: Init Function isn't a function");
      
        priority.push(func);
    },
    
    removeInit: function(func, priority) {
      priority = this.getInitPriority(priority);
      
      var index = priority.indexOf(func);
      
      if (index >= 0)
        priority.splice(index, 1);
    },
    
    insertInit: function(newFunc, oldFunc, priority) {
      priority = this.getInitPriority(priority);
      
      if (typeof newFunc !== "function")
        throw TypeError("LCES Init: Init function provided isn't a function");
      
      var index = priority.indexOf(oldFunc);
      
      if (index >= 0)
        priority.splice(index, 0, newFunc);
    },
    
    replaceInit: function(newFunc, oldFunc, priority) {
      priority = this.getInitPriority(priority);
      
      if (typeof newFunc !== "function")
        throw TypeError("LCES Init: Init function provided isn't a function");
      
      var index = priority.indexOf(func);
      
      if (index >= 0)
        priority.splice(index, 1, newFunc);
    }
  };

  // Add initSystem to lces
  lces.initSystem.call(lces);
}

// If only jSh run LCES
if (lces.onlyjSh)
  lces.rc[2]();


function lcesAppendCSS(className, css, before) {
  var head  = document.getElementsByTagName("head")[0];
  var style = document.createElement("style");
  
  style.className = className;
  style.appendChild(document.createTextNode(css));
  
  if (!before || !(before instanceof Node))
    head.appendChild(style);
  else
    head.insertBefore(style, before);
  
  return style;
}

// Will be amended by LCES builder
lcesAppendCSS("lces-core-styles", ".abs-fill,.lces-togglebox::before,.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner,.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner::before,.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner .lces-togglebox-text{position:absolute;top:0px;left:0px;bottom:0px;right:0px}.lces-themify{font-family:Arial}br2{position:relative;display:block;padding:0px;margin:0px;height:10px}.lces-themify hr{border-top:0px;border-style:solid;opacity:0.75}.lces-themify a{font-weight:normal;text-decoration:none}.lces-themify label{font-weight:bold}@font-face{font-family:\"CODE\";src:url(https://b-fuze.github.io/lces/main-css/codebold.otf)}@font-face{font-family:\"Lato\";src:url(https://b-fuze.github.io/lces/main-css/lato-reg.ttf)}@font-face{font-family:\"Righteous\";src:url(https://b-fuze.github.io/lces/main-css/righteous.ttf)}@font-face{font-family:\"Couture\";src:url(https://b-fuze.github.io/lces/main-css/couture-bld.otf)}.lces-themify h1,.lces-themify h2,.lces-themify h3,.lces-themify h4,.lces-themify h5,.lces-themify h6{margin:0px;margin-bottom:10px;font-family:Lato;font-weight:normal}.lces-themify h1{font-size:2.25em}.lces-themify h2{font-size:2em}.lces-themify h3{font-size:1.75em}.lces-themify h4{font-size:1.5em}.lces-themify h5{font-size:1.25em}.lces-themify h6{font-size:1.125em}.lces-themify .lc-i{font-style:italic}.lces-themify .lc-b{font-weight:bold}.lces-themify .lc-centertext{text-align:center}.lces-themify .lc-indent{margin-left:15px;margin-right:15px}.lces-themify .lc-inlineblock{display:inline-block}.lces-text-quote{display:block;background:rgba(0,0,0,0.25);padding:7px 10px;margin:5px 0px}.lces-scrollbar-screen{position:fixed;z-index:99999999999;top:0px;left:0px;width:100%;height:100%;display:none}.lces-scrollbar-screen.lces-sb-screen-visible{display:block}.lces-scrollbars-visible *:hover>.lces-scrollbar-trough,.lces-scrollbars-visible .lces-scrollbar-trough.active{opacity:0.75}.lces-scrollbars-visible .lces-scrollbar-trough{opacity:0.5}.lces-scrollbar{position:absolute;width:100%}.lces-scrollbar-trough{position:absolute;top:0px;bottom:0px;width:6px;background:rgba(0,0,0,0.075);opacity:0;transition:opacity 200ms ease-out, width 200ms ease-out}.lces-scrollbar-trough:hover,.lces-scrollbar-trough.active{width:9px}.lces-scrollbar-trough.lc-sbright{right:0px}.lces-scrollbar-trough.lc-sbleft{left:0px}lces-placeholder{display:none}.lcescontrol{position:relative;opacity:1;transition:opacity 200ms ease-out}.lcescontrol[disabled]{opacity:0.5;cursor:default !important}.lcescontrol[disabled] *{pointer-events:none;cursor:default !important}.lcescontrol .lcescontrolclick{position:absolute;left:0px;top:0px;right:0px;bottom:0px;z-index:1000;display:none}.lces-themify *::-webkit-input-placeholder,.lces-themify *:-moz-placeholder,.lces-themify *::-moz-placeholder,.lces-themify *:-ms-input-placeholder{color:#BFBFBF;font-style:italic;font-weight:normal}.lces-numberfield::-webkit-input-placeholder{font-style:normal}.lces-numberfield:-moz-placeholder{font-style:normal}.lces-numberfield::-moz-placeholder{font-style:normal}.lces-numberfield:-ms-input-placeholder{font-style:normal}input.lces[type=\"text\"],input.lces[type=\"password\"]{vertical-align:middle}input.lces[type=\"text\"],input.lces[type=\"password\"],textarea.lces{padding:3px;min-width:150px;height:auto;outline:0px;border:2px solid #000;border-radius:3px;color:#262626;background-color:#fff;font-size:14px;font-family:\"Trebuchet MS\";resize:none}input.lces[type=\"text\"]:disabled,input.lces[type=\"password\"]:disabled{background-color:#F2F2F2}.numberfield-container{position:relative;display:inline-block}input.lces.lces-numberfield{font-size:14px;font-weight:bold;text-align:center;border-right-width:16px;border-top-right-radius:4px;border-bottom-right-radius:4px}.numberfield-container .arrow{width:16px;height:50%;position:absolute;right:0px;cursor:pointer;background:transparent}.numberfield-container .arrow.active{background:rgba(0,0,0,0.1)}.numberfield-container .arrow svg{position:absolute;top:0px;right:0px;bottom:0px;left:0px;margin:auto auto;opacity:0.85;transition:opacity 200ms ease-out}.numberfield-container .arrow:hover svg{opacity:1}.numberfield-container .arrow.top{top:0px;border-top-right-radius:4px}.numberfield-container .arrow.bottom{bottom:0px;border-bottom-right-radius:4px}.lces-slider{position:relative;top:-3px;vertical-align:middle;display:inline-block;border:2px solid #000;border-radius:5px;height:28px;width:138px;overflow:hidden;background:#fff;line-height:normal}.lces-slider-min,.lces-slider-max,.lces-slider-value{position:absolute;top:4px;font-family:Righteous;font-size:16px;color:#D9D9D9}.lces-slider-min{left:5px}.lces-slider-max{right:5px}.lces-slider-value{right:0px;left:0px;text-align:center;color:#f00;opacity:0.25}.lces-slider-scrubbar{position:absolute;top:0px;right:0px;bottom:0px;left:0px}.lces-slider-scrubber{position:absolute;top:1px;left:0px;margin:0px 0px 0px 1px;width:15px;height:26px;border-radius:3.5px;background:#000;opacity:0.75;transition:opacity 250ms ease-out}.lces-slider.animated .lces-slider-scrubber{transition:opacity 250ms ease-out,left 150ms cubic-bezier(0.1, 0.41, 0, 0.99)}.lces-slider-scrubbar:hover .lces-slider-scrubber,.lces-slider.scrubbing .lces-slider-scrubber{opacity:1}#lces-colorchoosermodalcontainer{position:fixed;z-index:999999999;top:0px;left:0px;right:0px;bottom:0px;transform:translateX(-100%);-webkit-transform:translateX(-100%);transition:transform 0ms linear 250ms}#lces-colorchoosermodalcontainer.visible{transition:transform 0ms linear 0ms;transform:translateX(0px);-webkit-transform:translateX(0px)}.lces-colorchooser{position:relative;z-index:5;top:-3px;vertical-align:middle;display:inline-block}.lces-colorchooser .lces-cc-display{display:inline-block;height:26px;width:46px;border-radius:4px;border:2px solid #000}.lces-colorchooser .lces-cc-color{margin:4px;width:38px;height:18px;border-radius:1px;background:#000;cursor:pointer}.lces-colorchooser-modal{position:absolute;z-index:20000000;top:0px;left:0px;margin:5px 0px 0px 0px;border-radius:5px;background:rgba(255,255,255,0.95);overflow:hidden;box-shadow:0px 2px 5px rgba(0,0,0,0.25);opacity:0;transform-origin:0% 0%;transform:scale(0.85);transition:transform 150ms cubic-bezier(0.31, 0.26, 0.1, 0.92),opacity 150ms cubic-bezier(0.31, 0.26, 0.1, 0.92)}.lces-colorchooser-modal.flipped{margin:0px;transform-origin:0% 100%}.lces-colorchooser-modal.visible{opacity:1;transform:scale(1)}.lces-colorchooser-modal .lces-cc-section{padding:15px}.lces-colorchooser-modal .lces-cc-section.lces-cc-controls{padding-top:0px;padding-bottom:0px;background:#F2F2F2}.lces-colorchooser-modal .lces-cc-wheel{position:relative;width:180px;height:180px;border-radius:100%;background-color:#F2F2F2;background-size:100%}.lces-colorchooser-modal .lces-cc-wheel-value{position:absolute;left:0px;top:0px;width:100%;height:100%;border-radius:100%;background:#000;opacity:0}.lces-colorchooser-modal .lces-cc-cursor{position:absolute;width:10px;height:10px;border-radius:100%;background:#fff;border:1px solid #000}.lces-colorchooser-modal .lces-cc-row{overflow:auto}.lces-colorchooser-modal .lces-cc-label{float:left;display:block;width:16px;font-family:Couture;font-size:25px;color:#808080;background:#e5e5e5;padding:10px 7px 5px 7px;cursor:default;margin-right:10px}.lces-colorchooser-modal .lces-slider{margin-top:7px;border-width:1px;outline:0px !important}.lces-file *{cursor:pointer !important}.lces-file input[type=\"file\"]{position:absolute;margin:0px;width:100%;height:100%;opacity:0;z-index:5;cursor:pointer !important}.lces-file{position:relative;display:block;padding:0px 33px 0px 0px;height:36px;width:123px;border-radius:3px;background-color:#000;font-family:Arial;font-weight:bold;font-size:14px;cursor:pointer !important}.lces-file>div{position:absolute;top:0px;left:0px;right:33px;bottom:0px}.lces-file>div>div{display:table;width:100%;height:100%}.lces-file>div>div>div{display:table-cell;vertical-align:middle}.lces-file>div>div>div>div{text-align:center;color:#fff}.lces-file>aside{position:absolute;right:0px;top:0px;bottom:0px;padding:8px;border-top-right-radius:3px;border-bottom-right-radius:3px;background:rgba(0,0,0,0.25);transition:background 200ms ease-out}.lces-file:hover>aside{background:rgba(0,0,0,0.15)}.lces-file:active>aside{background:rgba(0,0,0,0.5)}.lces-themify button{position:relative;font-family:Arial;font-size:14px;font-weight:bold;outline:0px;border-radius:3px;margin:0px 10px 10px 0px;padding:5px 10px;border:0px;color:#fff;background:#000;cursor:pointer}.lces-themify button:before,.lces-file:after{content:\"\";position:absolute;top:0px;left:0px;width:100%;height:100%;border-radius:3px;background:rgba(255,255,255,0);transition:background 100ms ease-out}.lces-themify button:hover:before,.lces-file:hover:after{background:rgba(255,255,255,0.2)}.lces-themify button:active:before,.lces-file:active:after{background:rgba(0,0,0,0.075);transition:background 0ms ease-out !important}.lcesradio{position:relative;top:1px;width:12px;height:11px;margin:2px;display:inline-block}.lcesradio .radiobuttoncolor{fill:#000}.lcesradio svg path:last-child{opacity:0;transition:opacity 150ms ease-out}.lcesradio[checked] svg path:last-child{opacity:1}.lcescheckbox{position:relative;vertical-align:middle;width:14px;height:14px;margin:2px;display:inline-block}.lcescheckbox .checkboxcolor{fill:#000}.lcescheckbox svg path:last-child{opacity:0;transition:opacity 150ms ease-out}.lcescheckbox[checked] svg path:last-child{opacity:1}.lces-togglebox{display:inline-block;position:relative;width:68px;height:34px;border-radius:5px;overflow:hidden;vertical-align:middle;user-select:none;-webkit-user-select:none;-moz-user-select:none}.lces-togglebox::before{content:\"\";z-index:6;border-radius:5px;opacity:1;background:rgba(0,0,0,0.15);transition:opacity 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92)}.lces-togglebox.checked::before{opacity:0}.lces-togglebox.checked .lces-togglebox-handle{-webkit-transform:translateX(34px);-moz-transform:translateX(34px);-ms-transform:translateX(34px);-o-transform:translateX(34px);transform:translateX(34px)}.lces-togglebox,.lces-togglebox *{cursor:default !important}.lces-togglebox .lces-togglebox-handle{position:absolute;z-index:10;left:0px;top:0px;-webkit-transform:translateX(0px);-moz-transform:translateX(0px);-ms-transform:translateX(0px);-o-transform:translateX(0px);transform:translateX(0px);height:100%;width:34px;transition:-webkit-transform 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92) , -moz-transform 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92) , -ms-transform 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92) , -o-transform 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92) , transform 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92)}.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner{margin:2px;z-index:10;border-radius:4px;overflow:hidden}.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner::before{content:\"\";z-index:5;border-radius:4px;background:#fff;opacity:1}.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner .lces-togglebox-text{z-index:10;bottom:auto;line-height:30px;text-align:center;font-size:10px}.lces-dropdown-screen{position:fixed;z-index:9999999999;top:0px;right:0px;bottom:0px;left:0px;transform:translate3d(-100%, 0px, 0px)}.lces-dropdown-screen.visible{transform:translate3d(0px, 0px, 0px)}.lces-dropdown-screen .lcesdropdown{position:absolute;top:0px;left:0px;right:auto;bottom:auto;margin:0px;border-color:transparent !important;background:transparent !important}.lces-dropdown-screen .lcesdropdown .lcesselected,.lces-dropdown-screen .lcesdropdown .lcesdropdown-arrow{opacity:0 !important}.lcesdropdown{position:relative;vertical-align:middle;top:-3px;margin:0px;display:inline-block;min-width:98px;padding:3px;border:2px solid #000;border-width:2px 27px 2px 2px;border-radius:3px;text-align:left;font-size:14px;font-weight:bold;line-height:1.2;background:#fff;cursor:default}.lcesdropdown .lcesdropdown-arrow{position:absolute;top:0px;bottom:0px;margin:auto 0px;right:-18px;height:6px;width:10px}.lcesdropdown .lcesdropdown-arrow svg{position:absolute;transform:scaleY(1.2)}.lcesdropdown .lcesoptions{position:absolute;z-index:600000;top:100%;left:-2px;right:-27px;border:0px solid #000;border-width:2px;border-bottom-right-radius:3px;border-bottom-left-radius:3px;font-weight:bold;background:#fff;box-shadow:0px 2px 3px rgba(0,0,0,0.2);transform-origin:50% 0%;transform:scale(0.9);opacity:0;transition:transform 200ms cubic-bezier(0.31, 0.26, 0.1, 0.92),opacity 200ms cubic-bezier(0.31, 0.26, 0.1, 0.92)}.lcesdropdown.visible .lcesoptions{opacity:1;transform:scale(1)}.lcesdropdown.flipped .lcesoptions{transform-origin:50% 100%;top:auto;bottom:100%;border-radius:0px;border-top-right-radius:3px;border-top-left-radius:3px}.lcesoption{position:relative;padding:3px;margin-bottom:1px;background:transparent;color:#484848;transition:background-color 200ms ease-out}.lcesoption:after{position:absolute;content:\"\";top:100%;left:2px;right:2px;height:1px;background:#000;opacity:0.5}.lcesoption:hover,.lcesoption[lces-selected]{background:rgba(0,0,0,0.05)}.lcesoption:last-child{margin-bottom:0px}.lcesoption:last-child:after{height:0px}.lces-themify table{border-spacing:0px;font-family:Arial}table.lces thead th{position:relative;border:0px;border-top:3px solid #000;border-bottom:3px solid #000;padding:7px 10px;font-size:13px}table.lces thead th:before{position:absolute;content:\"\";left:0px;top:10%;bottom:10%;width:1px;background:#000}table.lces thead th:first-child:before{width:0px}table.lces tr{padding:0px;margin:0px;border:0px;background:#fff}table.lces tr td{border:0px;padding:10px}.lces-window{position:fixed;z-index:1000000;top:0px;left:0px;opacity:0;color:#484848;line-height:1.6;transition:opacity 250ms ease-out}.lces-window[visible]{opacity:1}.lces-window[window-invisible]{margin-left:-9999999%}.lces-window>div{padding:0px}.lces-window>div>div{background:#fff;overflow:hidden;border-radius:4px;box-shadow:0px 2px 5px rgba(0,0,0,0.25)}.lces-window .lces-window-title{padding:15px 10px;font-family:Arial;font-size:14px;font-weight:bold;color:#000;background:rgba(0,0,0,0.1);cursor:default}.lces-window .lces-window-contents{padding:25px 20px 30px 20px}.lces-window .lces-window-buttonpanel{padding:10px;text-align:right;background:rgba(0,0,0,0.1)}.lces-window .lces-window-buttonpanel button{margin-bottom:0px}.lces-window .lces-window-buttonpanel button:last-child,.lces-window .lces-window-buttonpanel div:last-child button{margin:0px}.lces-notification{border-radius:3px;position:static;width:300px;box-shadow:0px 2px 3px rgba(0,0,0,0.2);cursor:default}.lces-notification[visible]{opacity:0.95}.lces-notification>div{padding:0px;margin:4px 0px;border:1px solid #000;border-radius:3px;background:#fff;overflow:hidden;transition:height 400ms cubic-bezier(0.31, 0.26, 0.1, 0.92)}.lces-window.lces-notification>div>div{background:rgba(0,0,0,0.025);box-shadow:none}.notification-alignment.notifi-relative .lces-notification>div{margin:0px !important}.notification-alignment{position:fixed;z-index:1000000}.notification-alignment.notifi-relative{position:static !important}.notifi-top{top:5px}.notifi-bottom{bottom:5px}.notifi-middle{top:45%}.notifi-right{right:5px;text-align:right}.notifi-left{left:5px}.notifi-center{margin-right:auto;margin-left:auto;left:0px;right:0px;text-align:center;width:0px}.notifi-center .lces-window.lces-notification{transform:translate(-50%)}.notifi-center .lces-notification{margin-right:auto;margin-left:auto}.lces-accordion{display:block;margin:0px 0px 10px 0px}.lces-accordion .lces-acc-section{display:block;border:1px solid rgba(0,0,0,0.25);border-radius:3px;overflow:hidden;margin:0px 0px 5px 0px}.lces-accordion .lces-acc-section .lces-acc-title{display:block;padding:5px;font-weight:bold;font-size:13px;background:rgba(0,0,0,0.25);border:0px;border-bottom:0px solid rgba(0,0,0,0.05);cursor:pointer}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-title{border-bottom-width:1px}.lces-accordion .lces-acc-section .lces-acc-title .lces-acc-arrow{position:relative;top:3px;display:inline-block;width:15px;height:15px;transform:rotate(0deg);padding:0px;margin:0px;margin-right:5px;transition:transform 500ms cubic-bezier(0.1, 0.41, 0, 0.99)}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-title .lces-acc-arrow{transform:rotate(90deg)}.lces-accordion .lces-acc-section .lces-acc-title .lces-acc-arrow svg{margin:0px}.lces-accordion .lces-acc-section .lces-acc-contents>div{padding:10px}.lces-accordion .lces-acc-section .lces-acc-contents{overflow:hidden;height:0px;transition:height 500ms cubic-bezier(0.1, 0.41, 0, 0.99)}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-contents{overflow:auto}\n", document.getElementsByClassName("lces-themify-styles")[0]);
lcesAppendCSS("lces-responsive-styles", ".abs-fill,.lces-togglebox::before,.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner,.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner::before,.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner .lces-togglebox-text{position:absolute;top:0px;left:0px;bottom:0px;right:0px}.lces-themify{font-family:Arial}br2{position:relative;display:block;padding:0px;margin:0px;height:10px}.lces-themify hr{border-top:0px;border-style:solid;opacity:0.75}.lces-themify a{font-weight:normal;text-decoration:none}.lces-themify label{font-weight:bold}@font-face{font-family:\"CODE\";src:url(https://b-fuze.github.io/lces/main-css/codebold.otf)}@font-face{font-family:\"Lato\";src:url(https://b-fuze.github.io/lces/main-css/lato-reg.ttf)}@font-face{font-family:\"Righteous\";src:url(https://b-fuze.github.io/lces/main-css/righteous.ttf)}@font-face{font-family:\"Couture\";src:url(https://b-fuze.github.io/lces/main-css/couture-bld.otf)}.lces-themify h1,.lces-themify h2,.lces-themify h3,.lces-themify h4,.lces-themify h5,.lces-themify h6{margin:0px;margin-bottom:10px;font-family:Lato;font-weight:normal}.lces-themify h1{font-size:2.25em}.lces-themify h2{font-size:2em}.lces-themify h3{font-size:1.75em}.lces-themify h4{font-size:1.5em}.lces-themify h5{font-size:1.25em}.lces-themify h6{font-size:1.125em}.lces-themify .lc-i{font-style:italic}.lces-themify .lc-b{font-weight:bold}.lces-themify .lc-centertext{text-align:center}.lces-themify .lc-indent{margin-left:15px;margin-right:15px}.lces-themify .lc-inlineblock{display:inline-block}.lces-text-quote{display:block;background:rgba(0,0,0,0.25);padding:7px 10px;margin:5px 0px}.lces-scrollbar-screen{position:fixed;z-index:99999999999;top:0px;left:0px;width:100%;height:100%;display:none}.lces-scrollbar-screen.lces-sb-screen-visible{display:block}.lces-scrollbars-visible *:hover>.lces-scrollbar-trough,.lces-scrollbars-visible .lces-scrollbar-trough.active{opacity:0.75}.lces-scrollbars-visible .lces-scrollbar-trough{opacity:0.5}.lces-scrollbar{position:absolute;width:100%}.lces-scrollbar-trough{position:absolute;top:0px;bottom:0px;width:6px;background:rgba(0,0,0,0.075);opacity:0;transition:opacity 200ms ease-out, width 200ms ease-out}.lces-scrollbar-trough:hover,.lces-scrollbar-trough.active{width:9px}.lces-scrollbar-trough.lc-sbright{right:0px}.lces-scrollbar-trough.lc-sbleft{left:0px}lces-placeholder{display:none}.lcescontrol{position:relative;opacity:1;transition:opacity 200ms ease-out}.lcescontrol[disabled]{opacity:0.5;cursor:default !important}.lcescontrol[disabled] *{pointer-events:none;cursor:default !important}.lcescontrol .lcescontrolclick{position:absolute;left:0px;top:0px;right:0px;bottom:0px;z-index:1000;display:none}.lces-themify *::-webkit-input-placeholder,.lces-themify *:-moz-placeholder,.lces-themify *::-moz-placeholder,.lces-themify *:-ms-input-placeholder{color:#BFBFBF;font-style:italic;font-weight:normal}.lces-numberfield::-webkit-input-placeholder{font-style:normal}.lces-numberfield:-moz-placeholder{font-style:normal}.lces-numberfield::-moz-placeholder{font-style:normal}.lces-numberfield:-ms-input-placeholder{font-style:normal}input.lces[type=\"text\"],input.lces[type=\"password\"]{vertical-align:middle}input.lces[type=\"text\"],input.lces[type=\"password\"],textarea.lces{padding:3px;min-width:150px;height:auto;outline:0px;border:2px solid #000;border-radius:3px;color:#262626;background-color:#fff;font-size:14px;font-family:\"Trebuchet MS\";resize:none}input.lces[type=\"text\"]:disabled,input.lces[type=\"password\"]:disabled{background-color:#F2F2F2}.numberfield-container{position:relative;display:inline-block}input.lces.lces-numberfield{font-size:14px;font-weight:bold;text-align:center;border-right-width:16px;border-top-right-radius:4px;border-bottom-right-radius:4px}.numberfield-container .arrow{width:16px;height:50%;position:absolute;right:0px;cursor:pointer;background:transparent}.numberfield-container .arrow.active{background:rgba(0,0,0,0.1)}.numberfield-container .arrow svg{position:absolute;top:0px;right:0px;bottom:0px;left:0px;margin:auto auto;opacity:0.85;transition:opacity 200ms ease-out}.numberfield-container .arrow:hover svg{opacity:1}.numberfield-container .arrow.top{top:0px;border-top-right-radius:4px}.numberfield-container .arrow.bottom{bottom:0px;border-bottom-right-radius:4px}.lces-slider{position:relative;top:-3px;vertical-align:middle;display:inline-block;border:2px solid #000;border-radius:5px;height:28px;width:138px;overflow:hidden;background:#fff;line-height:normal}.lces-slider-min,.lces-slider-max,.lces-slider-value{position:absolute;top:4px;font-family:Righteous;font-size:16px;color:#D9D9D9}.lces-slider-min{left:5px}.lces-slider-max{right:5px}.lces-slider-value{right:0px;left:0px;text-align:center;color:#f00;opacity:0.25}.lces-slider-scrubbar{position:absolute;top:0px;right:0px;bottom:0px;left:0px}.lces-slider-scrubber{position:absolute;top:1px;left:0px;margin:0px 0px 0px 1px;width:15px;height:26px;border-radius:3.5px;background:#000;opacity:0.75;transition:opacity 250ms ease-out}.lces-slider.animated .lces-slider-scrubber{transition:opacity 250ms ease-out,left 150ms cubic-bezier(0.1, 0.41, 0, 0.99)}.lces-slider-scrubbar:hover .lces-slider-scrubber,.lces-slider.scrubbing .lces-slider-scrubber{opacity:1}#lces-colorchoosermodalcontainer{position:fixed;z-index:999999999;top:0px;left:0px;right:0px;bottom:0px;transform:translateX(-100%);-webkit-transform:translateX(-100%);transition:transform 0ms linear 250ms}#lces-colorchoosermodalcontainer.visible{transition:transform 0ms linear 0ms;transform:translateX(0px);-webkit-transform:translateX(0px)}.lces-colorchooser{position:relative;z-index:5;top:-3px;vertical-align:middle;display:inline-block}.lces-colorchooser .lces-cc-display{display:inline-block;height:26px;width:46px;border-radius:4px;border:2px solid #000}.lces-colorchooser .lces-cc-color{margin:4px;width:38px;height:18px;border-radius:1px;background:#000;cursor:pointer}.lces-colorchooser-modal{position:absolute;z-index:20000000;top:0px;left:0px;margin:5px 0px 0px 0px;border-radius:5px;background:rgba(255,255,255,0.95);overflow:hidden;box-shadow:0px 2px 5px rgba(0,0,0,0.25);opacity:0;transform-origin:0% 0%;transform:scale(0.85);transition:transform 150ms cubic-bezier(0.31, 0.26, 0.1, 0.92),opacity 150ms cubic-bezier(0.31, 0.26, 0.1, 0.92)}.lces-colorchooser-modal.flipped{margin:0px;transform-origin:0% 100%}.lces-colorchooser-modal.visible{opacity:1;transform:scale(1)}.lces-colorchooser-modal .lces-cc-section{padding:15px}.lces-colorchooser-modal .lces-cc-section.lces-cc-controls{padding-top:0px;padding-bottom:0px;background:#F2F2F2}.lces-colorchooser-modal .lces-cc-wheel{position:relative;width:180px;height:180px;border-radius:100%;background-color:#F2F2F2;background-size:100%}.lces-colorchooser-modal .lces-cc-wheel-value{position:absolute;left:0px;top:0px;width:100%;height:100%;border-radius:100%;background:#000;opacity:0}.lces-colorchooser-modal .lces-cc-cursor{position:absolute;width:10px;height:10px;border-radius:100%;background:#fff;border:1px solid #000}.lces-colorchooser-modal .lces-cc-row{overflow:auto}.lces-colorchooser-modal .lces-cc-label{float:left;display:block;width:16px;font-family:Couture;font-size:25px;color:#808080;background:#e5e5e5;padding:10px 7px 5px 7px;cursor:default;margin-right:10px}.lces-colorchooser-modal .lces-slider{margin-top:7px;border-width:1px;outline:0px !important}.lces-file *{cursor:pointer !important}.lces-file input[type=\"file\"]{position:absolute;margin:0px;width:100%;height:100%;opacity:0;z-index:5;cursor:pointer !important}.lces-file{position:relative;display:block;padding:0px 33px 0px 0px;height:36px;width:123px;border-radius:3px;background-color:#000;font-family:Arial;font-weight:bold;font-size:14px;cursor:pointer !important}.lces-file>div{position:absolute;top:0px;left:0px;right:33px;bottom:0px}.lces-file>div>div{display:table;width:100%;height:100%}.lces-file>div>div>div{display:table-cell;vertical-align:middle}.lces-file>div>div>div>div{text-align:center;color:#fff}.lces-file>aside{position:absolute;right:0px;top:0px;bottom:0px;padding:8px;border-top-right-radius:3px;border-bottom-right-radius:3px;background:rgba(0,0,0,0.25);transition:background 200ms ease-out}.lces-file:hover>aside{background:rgba(0,0,0,0.15)}.lces-file:active>aside{background:rgba(0,0,0,0.5)}.lces-themify button{position:relative;font-family:Arial;font-size:14px;font-weight:bold;outline:0px;border-radius:3px;margin:0px 10px 10px 0px;padding:5px 10px;border:0px;color:#fff;background:#000;cursor:pointer}.lces-themify button:before,.lces-file:after{content:\"\";position:absolute;top:0px;left:0px;width:100%;height:100%;border-radius:3px;background:rgba(255,255,255,0);transition:background 100ms ease-out}.lces-themify button:hover:before,.lces-file:hover:after{background:rgba(255,255,255,0.2)}.lces-themify button:active:before,.lces-file:active:after{background:rgba(0,0,0,0.075);transition:background 0ms ease-out !important}.lcesradio{position:relative;top:1px;width:12px;height:11px;margin:2px;display:inline-block}.lcesradio .radiobuttoncolor{fill:#000}.lcesradio svg path:last-child{opacity:0;transition:opacity 150ms ease-out}.lcesradio[checked] svg path:last-child{opacity:1}.lcescheckbox{position:relative;vertical-align:middle;width:14px;height:14px;margin:2px;display:inline-block}.lcescheckbox .checkboxcolor{fill:#000}.lcescheckbox svg path:last-child{opacity:0;transition:opacity 150ms ease-out}.lcescheckbox[checked] svg path:last-child{opacity:1}.lces-togglebox{display:inline-block;position:relative;width:68px;height:34px;border-radius:5px;overflow:hidden;vertical-align:middle;user-select:none;-webkit-user-select:none;-moz-user-select:none}.lces-togglebox::before{content:\"\";z-index:6;border-radius:5px;opacity:1;background:rgba(0,0,0,0.15);transition:opacity 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92)}.lces-togglebox.checked::before{opacity:0}.lces-togglebox.checked .lces-togglebox-handle{-webkit-transform:translateX(34px);-moz-transform:translateX(34px);-ms-transform:translateX(34px);-o-transform:translateX(34px);transform:translateX(34px)}.lces-togglebox,.lces-togglebox *{cursor:default !important}.lces-togglebox .lces-togglebox-handle{position:absolute;z-index:10;left:0px;top:0px;-webkit-transform:translateX(0px);-moz-transform:translateX(0px);-ms-transform:translateX(0px);-o-transform:translateX(0px);transform:translateX(0px);height:100%;width:34px;transition:-webkit-transform 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92) , -moz-transform 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92) , -ms-transform 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92) , -o-transform 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92) , transform 250ms cubic-bezier(0.31, 0.26, 0.1, 0.92)}.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner{margin:2px;z-index:10;border-radius:4px;overflow:hidden}.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner::before{content:\"\";z-index:5;border-radius:4px;background:#fff;opacity:1}.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner .lces-togglebox-text{z-index:10;bottom:auto;line-height:30px;text-align:center;font-size:10px}.lces-dropdown-screen{position:fixed;z-index:9999999999;top:0px;right:0px;bottom:0px;left:0px;transform:translate3d(-100%, 0px, 0px)}.lces-dropdown-screen.visible{transform:translate3d(0px, 0px, 0px)}.lces-dropdown-screen .lcesdropdown{position:absolute;top:0px;left:0px;right:auto;bottom:auto;margin:0px;border-color:transparent !important;background:transparent !important}.lces-dropdown-screen .lcesdropdown .lcesselected,.lces-dropdown-screen .lcesdropdown .lcesdropdown-arrow{opacity:0 !important}.lcesdropdown{position:relative;vertical-align:middle;top:-3px;margin:0px;display:inline-block;min-width:98px;padding:3px;border:2px solid #000;border-width:2px 27px 2px 2px;border-radius:3px;text-align:left;font-size:14px;font-weight:bold;line-height:1.2;background:#fff;cursor:default}.lcesdropdown .lcesdropdown-arrow{position:absolute;top:0px;bottom:0px;margin:auto 0px;right:-18px;height:6px;width:10px}.lcesdropdown .lcesdropdown-arrow svg{position:absolute;transform:scaleY(1.2)}.lcesdropdown .lcesoptions{position:absolute;z-index:600000;top:100%;left:-2px;right:-27px;border:0px solid #000;border-width:2px;border-bottom-right-radius:3px;border-bottom-left-radius:3px;font-weight:bold;background:#fff;box-shadow:0px 2px 3px rgba(0,0,0,0.2);transform-origin:50% 0%;transform:scale(0.9);opacity:0;transition:transform 200ms cubic-bezier(0.31, 0.26, 0.1, 0.92),opacity 200ms cubic-bezier(0.31, 0.26, 0.1, 0.92)}.lcesdropdown.visible .lcesoptions{opacity:1;transform:scale(1)}.lcesdropdown.flipped .lcesoptions{transform-origin:50% 100%;top:auto;bottom:100%;border-radius:0px;border-top-right-radius:3px;border-top-left-radius:3px}.lcesoption{position:relative;padding:3px;margin-bottom:1px;background:transparent;color:#484848;transition:background-color 200ms ease-out}.lcesoption:after{position:absolute;content:\"\";top:100%;left:2px;right:2px;height:1px;background:#000;opacity:0.5}.lcesoption:hover,.lcesoption[lces-selected]{background:rgba(0,0,0,0.05)}.lcesoption:last-child{margin-bottom:0px}.lcesoption:last-child:after{height:0px}.lces-themify table{border-spacing:0px;font-family:Arial}table.lces thead th{position:relative;border:0px;border-top:3px solid #000;border-bottom:3px solid #000;padding:7px 10px;font-size:13px}table.lces thead th:before{position:absolute;content:\"\";left:0px;top:10%;bottom:10%;width:1px;background:#000}table.lces thead th:first-child:before{width:0px}table.lces tr{padding:0px;margin:0px;border:0px;background:#fff}table.lces tr td{border:0px;padding:10px}.lces-window{position:fixed;z-index:1000000;top:0px;left:0px;opacity:0;color:#484848;line-height:1.6;transition:opacity 250ms ease-out}.lces-window[visible]{opacity:1}.lces-window[window-invisible]{margin-left:-9999999%}.lces-window>div{padding:0px}.lces-window>div>div{background:#fff;overflow:hidden;border-radius:4px;box-shadow:0px 2px 5px rgba(0,0,0,0.25)}.lces-window .lces-window-title{padding:15px 10px;font-family:Arial;font-size:14px;font-weight:bold;color:#000;background:rgba(0,0,0,0.1);cursor:default}.lces-window .lces-window-contents{padding:25px 20px 30px 20px}.lces-window .lces-window-buttonpanel{padding:10px;text-align:right;background:rgba(0,0,0,0.1)}.lces-window .lces-window-buttonpanel button{margin-bottom:0px}.lces-window .lces-window-buttonpanel button:last-child,.lces-window .lces-window-buttonpanel div:last-child button{margin:0px}.lces-notification{border-radius:3px;position:static;width:300px;box-shadow:0px 2px 3px rgba(0,0,0,0.2);cursor:default}.lces-notification[visible]{opacity:0.95}.lces-notification>div{padding:0px;margin:4px 0px;border:1px solid #000;border-radius:3px;background:#fff;overflow:hidden;transition:height 400ms cubic-bezier(0.31, 0.26, 0.1, 0.92)}.lces-window.lces-notification>div>div{background:rgba(0,0,0,0.025);box-shadow:none}.notification-alignment.notifi-relative .lces-notification>div{margin:0px !important}.notification-alignment{position:fixed;z-index:1000000}.notification-alignment.notifi-relative{position:static !important}.notifi-top{top:5px}.notifi-bottom{bottom:5px}.notifi-middle{top:45%}.notifi-right{right:5px;text-align:right}.notifi-left{left:5px}.notifi-center{margin-right:auto;margin-left:auto;left:0px;right:0px;text-align:center;width:0px}.notifi-center .lces-window.lces-notification{transform:translate(-50%)}.notifi-center .lces-notification{margin-right:auto;margin-left:auto}.lces-accordion{display:block;margin:0px 0px 10px 0px}.lces-accordion .lces-acc-section{display:block;border:1px solid rgba(0,0,0,0.25);border-radius:3px;overflow:hidden;margin:0px 0px 5px 0px}.lces-accordion .lces-acc-section .lces-acc-title{display:block;padding:5px;font-weight:bold;font-size:13px;background:rgba(0,0,0,0.25);border:0px;border-bottom:0px solid rgba(0,0,0,0.05);cursor:pointer}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-title{border-bottom-width:1px}.lces-accordion .lces-acc-section .lces-acc-title .lces-acc-arrow{position:relative;top:3px;display:inline-block;width:15px;height:15px;transform:rotate(0deg);padding:0px;margin:0px;margin-right:5px;transition:transform 500ms cubic-bezier(0.1, 0.41, 0, 0.99)}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-title .lces-acc-arrow{transform:rotate(90deg)}.lces-accordion .lces-acc-section .lces-acc-title .lces-acc-arrow svg{margin:0px}.lces-accordion .lces-acc-section .lces-acc-contents>div{padding:10px}.lces-accordion .lces-acc-section .lces-acc-contents{overflow:hidden;height:0px;transition:height 500ms cubic-bezier(0.1, 0.41, 0, 0.99)}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-contents{overflow:auto}\n", document.getElementsByClassName("lces-themify-styles")[0]);

if (lces.appendColorize !== false)
  lcesAppendCSS("lces-themify-styles lces-ui-colorize-src", ".lcesoption:after, .lces-file, .lces-themify button, table.lces thead th:before, .lces-slider-scrubber,\n.lces-togglebox, .lces-togglebox .lces-togglebox-handle .lces-togglebox-inner, .lces-scrollbar {\n  background-color: #800070;\n}\n.lces-acc-arrow svg, .checkboxsvg .checkboxcolor, .radiobuttonsvg .radionbuttoncolor, .genreremovesvg .genreremovecolor {\n  fill: #800070;\n}\n.lcesoption:hover, .lcesoption[lces-selected], table.lces tr {\n  background-color: rgba(128, 0, 112, 0.125);\n}\nhr.lces, input.lces[type=\"text\"], input.lces[type=\"password\"], textarea.lces, .lcesdropdown, .lcesdropdown .lcesoptions, table.lces thead th, .lces-slider, .lces-colorchooser .lces-cc-display, .lces-notification>div {\n  border-color: #800070;\n}\n.lces-accordion .lces-acc-section .lces-acc-title, .lces-window .lces-window-title, .lces-window .lces-window-buttonpanel {\n  background-color: rgba(128, 0, 112, 0.1);\n}\n.lces-themify a, .lces-themify h1, .lces-themify h2, .lces-themify h3, .lces-themify h4, .lces-themify h5, .lces-themify h6, .lcesdropdown, table.lces tr, .lces-user-text-color, .lces-window .lces-window-title,\n.lces-togglebox .lces-togglebox-handle .lces-togglebox-inner .lces-togglebox-text {\n  color: #800070;\n}\n.lces-accordion .lces-acc-section {\n  border-color: rgba(128, 0, 112, 0.5);\n}\ntable.lces tr[checker] {\n  background-color: rgba(128, 0, 112, 0.02);\n}\ninput.lces[type=\"text\"]:focus, input.lces[type=\"password\"]:focus, .lces-togglebox:focus {\n  box-shadow: 0px 0px 3px rgba(128, 0, 112, 0.5);\n  outline: none !important;\n}\n");

lces.themify = {
  colorize: function(r, g, b) {
    var quit;
    
    // Validate color values
    var values = [r, g, b].map(function(value) {
      if (typeof value !== "number" || isNaN(value) || value < 0 || value > 255)
        quit = true;
      
      return Math.round(value);
    });
    
    // Check for invalid color value flag
    if (quit)
      return false;
    
    var css = jSh(".lces-themify-styles")[0];
    
    // Check for lces themify
    if (!css)
      return false;
    
    // Colorize CSS
    cssStr = lces.css.colorize(css, values[0], values[1], values[2]);
    
    // Add new color
    css.removeChild(css.childNodes[0]);
    css.appendChild(jSh.t(cssStr));
  }
};

lces.themify.colorize.compile = function compile() {
  var styles = jSh.toArr(document.getElementsByClassName("lces-ui-colorize-src"));
  
  styles.forEach(function(st) {
    st.lcesColorizeSrc = st.childNodes[0].nodeValue;
    st.removeChild(st.childNodes[0]);
    
    var compiled = compile.compileSrc(st.lcesColorizeSrc);
    
    var compiledStyles = document.createTextNode(compiled);
    st.appendChild(compiledStyles);
  });
}

lces.themify.colorize.compile.compileSrc = function(src) {
  src = src.replace(/lc-rgbhsv\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\)/g, "rgb($1,$2,$3)");
  src = src.replace(/lc-rgbahsv\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+(\.\d+)?)\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\)/g, "rgba($1,$2,$3,$4)");
  
  return src;
}

// Hide all ugly things till lces comes to.
var lcesHiddenStuff = lcesAppendCSS("lces-hidden-stuff", lces.preHideThemify !== false ? ".lces-themify{opacity:0;}" : "");
  
lces.rc[50] = function() {
  lces.addInit(function() {
    lcesHiddenStuff.disabled = "disabled";
    
    // Compile lcesColorizeSources
    lces.themify.colorize.compile();
  });
}
  
// LCES User module core
lces.rc[10] = function() {
  var jSh     = lces.global.jSh;
  // var lces    = window.lces;
  var Object  = lces.global.Object;
  var Boolean = lces.global.Boolean;
  
  var lcComponent = lces.global.lcComponent;
  
  // Check if valid number.
  function numOp(src, def) {
    return !isNaN(src) && jSh.type(src) === "number" && src > -Infinity && src < Infinity ? parseFloat(src) : def;
  }
  
  function multipleIndex(multiple, setting) {
    if (jSh.type(multiple) === "array") {
      var newDump = [];
      
      for (var i=0,l=multiple.length; i<l; i++) {
        var item   = multiple[i];
        var type   = jSh.type(item);
        var formal = "item" + (i + 1);
        var key;
        var index;
        
        if (type === "array" && item.length === 2) {
          type   = jSh.type(item[0]);
          formal = item[1] || formal;
          
          item = item[0];
        }
        
        switch (type) {
          case "date":
            key = item.toJSON();
          break;
          default:
            key = item + "";
          break;
        }
        
        key  = "key" + key;
        index = newDump.length;
        newDump.push([item, formal]);
        
        if (typeof newDump[key] !== "number")
          newDump[key] = index;
      }
      
      return newDump;
    } else {
      return null;
    }
  }
  
  // Create user module
  lces.user = new lcComponent();
  
  // LCES User module settings feature
  lces.user.settings = new lcComponent();
  var settings = lces.user.settings;
  
  // True when setting a temporary value
  var tempSetting    = false;
  var tempSettingVal = null;
  
  // Setting entry constructor
  //
  // multiple: Array. Optional.
  settings.Setting = function Setting(name, types, defValue, multiple, options) {
    // Check if not initialized
    if (!(this instanceof Setting))
      return new Setting(name, types, defValue, multiple, options);
    
    var that  = this;
    this.type = "LCES User Setting Entry";
    
    this.name       = null; // Will be set during the manifest scan
    this.settName   = name;
    
    this.settMultiple   = jSh.type(multiple) === "array" && multiple.length > 1;
    this.multipleValues = this.settMultiple ? multipleIndex(multiple) : null;
    this.currentIndex   = this.settMultiple ? numOp(defValue, 0) : null;
    this.formalMultiple = this.settMultiple ? multiple.map(a => a[1]) : null;
    
    this.defValue   = this.settMultiple ? this.multipleValues[numOp(defValue, 0)] : defValue;
    this.settType   = null;
    
    // If multiple check the default value
    if (this.settMultiple && jSh.type(this.defValue) === "array")
      this.defValue = this.defValue[0];
    
    // Check the types for the setting type
    types   = typeof types === "string" ? types.toLowerCase() : "";
    options = jSh.type(options) === "object" ? options : {};
    
    var numType  = types.indexOf("number") !== -1;
    var integer  = types.indexOf("integer") !== -1;
    var min      = numOp(options.min, null);
    var max      = numOp(options.max, null);
    
    var boolType = types.indexOf("boolean") !== -1;
    var dateType = types.indexOf("date") !== -1;
    var strType  = (!numType && !boolType && !dateType) || types.indexOf("string") !== -1;
    
    var multiple = this.settMultiple;
    var mixed    = types.indexOf("mixed") !== -1;
    
    // Setting object properties
    this.min = min;
    this.max = max;
    
    if (!types) {
      this.settType = "string";
    } else {
      if (numType)
        this.settType = "number";
      else if (boolType)
        this.settType = "boolean";
      else if (dateType)
        this.settType = "date";
      else {
        if (multiple)
          mixed = true;
        
        this.settType = "string";
      }
    }
    
    // Decided to repeat to relieve engine of redundant if condition checking and smaller functions
    if (multiple) {
      if (mixed || strType) {
        this.condition = function(value) {
          var index = jSh.type(value) === "number" ? value : that.multipleValues["key" + value];
          
          if (typeof index !== "number")
            return false;
          
          that.currentIndex  = index;
          this.proposedValue = that.multipleValues[index][0];
          return true;
        }
      } else if (dateType) {
        this.condition = function(value) {
          value = jSh.type(value) === "date" ? value.toJSON() : (typeof value === "number" ? new Date(value) : value);
          var index = that.multipleValues["key" + value];
          
          if (typeof index !== "number")
            return false;
          
          that.currentIndex  = index;
          this.proposedValue = that.multipleValues[index][0];
          return true;
        }
      } else if (numType) {
        this.condition = function(value) {
          var index = that.multipleValues["key" + value];
          
          if (typeof index !== "number")
            return false;
          
          that.currentIndex  = index;
          this.proposedValue = that.multipleValues[index][0];
          return true;
        }
      }
    } else if (numType) {
      this.condition = function(value) {
        if (jSh.type(value) !== "number") {
          var pi = parseFloat(value);
          
          if (integer)
            pi = Math.round(pi);
          
          if ((min !== null && pi < min) || (max !== null && pi > max))
            value = Math.max(Math.min(min, value), max);
          
          if (!isNaN(pi))
            this.component.setState(this.name, pi);
          
          return false;
        }
        
        return true;
      }
    } else if (boolType) {
      this.condition = function(value) {
        if (jSh.type(value) !== "boolean") {
          var bool = Boolean(value);
          
          this.component.setState(this.name, bool);
          return false;
        }
        
        return true;
      }
    } else if (dateType) {
      this.condition = function(value) {
        var date;
        
        if (jSh.type(value) !== "date") {
          date = new Date(value);
        } else {
          date = value;
        }
        
        if (isNaN(date.getTime()))
          return false;
        
        this.component.setState(this.name, date);
        return true;
      }
    } else { // Default string type
      this.condition = function(value) {
        if (jSh.type(value) !== "string") {
          this.component.setState(this.name, value + "");
          
          return false;
        }
        
        return true;
      }
    }
  }
  
  jSh.inherit(settings.Setting, lcComponent);
  
  function onSettChange() {
    var generalEvtObj  = {setting: this.name, value: tempSetting ? tempSettingVal : this.stateStatus};
    var specificEvtObj = {value: tempSetting ? tempSettingVal : this.stateStatus};
    
    if (tempSetting) {
      tempSetting = false;
      
      generalEvtObj.temporary = true;
      specificEvtObj.temporary = true;
    }
    
    settings.triggerEvent("settingChange", generalEvtObj);
    this.component.triggerEvent(this.name, specificEvtObj);
  }
  
  settings.addEvent("settingChange");
  
  settings.manifest = function(defSettings) {
    function scan(group, userGroup, path) {
      Object.getOwnPropertyNames(group).forEach(function(name) {
        var sett = group[name];
        var userValue;
        var thisPath = (path ? path.concat([name]) : null) || [name];
        
        if (typeof sett === "object") {
          if (sett instanceof settings.Setting && !sett.name) {
            sett.name = name;
            
            sett.userGroup = userGroup;
            sett.functions = [];
            
            userGroup.addEvent(name);
            userGroup.events[name].listeners = sett.functions;
            
            // Check if the value was set here before
            if (userGroup[name] !== undf)
              userValue = userGroup[name];
            
            userGroup.setState(name, sett.defValue);
            var settObj = userGroup.states[name];
            
            userGroup.addStateListener(name, onSettChange.bind(settObj));
            userGroup.addStateCondition(name, sett.condition);
            
            userGroup._settings.push(name);
            userGroup.states[name].settObj = sett;
            
            // Attempt to set it's initial value
            if (userValue !== undf)
              lateSettings.push([thisPath.join("."), userValue]);
          } else if (!(sett instanceof settings.Setting)) {
            var subGroup = userGroup[name];
            
            if (!(subGroup instanceof lces.type())) {
              subGroup = subGroup ? jSh.extendObj(new lces.new(), subGroup) : lces.new();
              
              userGroup[name] = subGroup;
              userGroup._groups.push(name);
              
              subGroup._settings = [];
              subGroup._groups   = [];
            }
            
            scan(sett, subGroup, thisPath);
          }
        }
      });
    }
    
    // Remove current settings
    // TODO: Removing the settings shouldn't be necessary
    if (defSettings && !settings.default)
      settings.user = new lcComponent();
    
    // Scan and check all settings
    scan(defSettings || settings.default || {}, userSettings);
  }
  
  settings.resetGroup = function LCESUserGroupReset(group) {
    var group = group ? (group._groups && group._settings ? group : settings.groupObtain(group, 2)) : userSettings;
    
    if (group) {
      // Loop and reset all props
      var settingsArr = group._settings;
      
      for (var i=0,l=settingsArr.length; i<l; i++) {
        var settName = settingsArr[i];
        
        group[settName] = group.states[settName].settObj.defValue;
      }
      
      // Traverse into groups
      var groups = group._groups;
      
      for (var i=0,l=groups.length; i<l; i++) {
        LCESUserGroupReset(group[groups[i]]);
      }
    } else {
      throw new ReferenceError("LCES User Module ERROR: lces.user.settings.resetGroup - \"" + group + "\" group doesn't exist");
    }
  }
  
  settings.settObtain = function(path, user) {
    var groupPath = path.split(".");
    var settName  = groupPath.pop();
    
    var group = settings.groupObtain(groupPath.join("."), !user);
    var setting;
    
    if (!group)
      return undf;
    
    setting = group[settName];
    
    // Verify the setting object
    if (!(setting instanceof settings.Setting) && !user)
      setting = "lces.user.settings.get - " + path + " failed";
    
    // Check for errors during obtaining phase
    if (typeof setting === "string" && !user) {
      console.error("LCES User Module ERROR: " + setting);
      
      return false;
    }
    
    return setting;
  }
  
  settings.groupObtain = function(path, getDefault) {
    if (jSh.type(settings.default) !== "object" || typeof path !== "string")
      return false;
    
    path = path.split(".");
    
    var temporary = false;
    switch (Number(getDefault)) {
      case 0:
        var curGroup  = settings.user;
        break;
      case 1:
        var curGroup  = settings.default;
        break;
      case 2:
        var curGroup  = userSettings;
        break;
    }
    var group;
    
    if (path[0] === "tmp") {
      temporary = true;
      path.splice(0, 1);
    }
    
    for (var i=0,l=path.length; i<l; i++) {
      var obj = curGroup[path[i]];
      
      if (!obj) {
        group = path.join(".") + " failed, no such group '" + path[i] + "'";
        
        break;
      } else {
        if (obj instanceof settings.Setting) {
          group = path.join(".") + " failed, '" + path[i] + "' " + (i + 1) + " is a setting and not a group";
          
          break;
        } else if (jSh.type(obj) !== "object") {
          group = path.join(".") + " failed, '" + path[i] + "' is " + jSh.type(obj);
          
          break;
        }
        
        curGroup = obj;
      }
    }
    
    // Check for errors during obtaining phase
    if (typeof group === "string") {
      console.error("LCES User Module ERROR: " + group);
      
      return false;
    } else {
      group = curGroup;
    }
    
    return group;
  }
  
  settings.set = function(path, value, recurring) {
    var groupPath  = path.split(".");
    var settName   = groupPath.pop();
    tempSetting    = groupPath[0] === "tmp";
    tempSettingVal = value;
    
    var setting = settings.settObtain(path);
    
    // Check if setting exists
    if (!setting) {
      return false;
    } else {
      setting.userGroup.setState(settName, tempSetting ? tempSettingVal : value, recurring);
    }
    
    return true;
  }
  
  settings.get = function(path) {
    return settings.settObtain(path, true);
  }
  
  settings.getDetails = function(path) {
    var setting = settings.settObtain(path);
    
    return setting ? {
      path: path,
      type: setting.settType,
      name: setting.settName,
      value: settings.settObtain(path, true),
      formalName: setting.settName,
      formalMultiple: setting.formalMultiple,
      multipleValues: setting.multipleValues ? setting.multipleValues.map(a => a[0]) : null,
      currentIndex: setting.currentIndex,
      defValue: setting.defValue,
      min: setting.min,
      max: setting.max
    } : null;
  }
  
  // LCES on event method
  settings._on = settings.on;
  var preloadEvents = [];
  
  settings.on = function() {
    var path;
    var callback;
    var first;
    
    jSh.toArr(arguments).forEach(function(arg) {
      if (typeof arg === "string" && !path)
        path = arg;
      else if (typeof arg === "function" && !callback)
        callback = arg;
      else if (first === undf && typeof arg === "boolean")
        first = arg;
    });
    
    if (!callback)
      return false;
    
    if (!path) {
      settings._on("settingChange", callback);
      
      return true;
    }
    
    var setting = settings.settObtain(path);
    
    if (!setting)
      return false;
    
    if (first && path)
      callback({value: settings.settObtain(path, true)});
    
    setting.functions.push(callback);
    return true;
  }
  
  settings.clearLate = function() {
    var late = lateSettings.slice();
    lateSettings = [];
    
    for (var i=0,l=late.length; i<l; i++) {
      settings.set(late[i][0], late[i][1]);
    }
  }
  
  // Default settings, the template/base for any user settings
  settings.setState("default", null);
  
  // Settings from user as based off of default.
  var userSettings = {
    _settings: [],
    _groups: []
  };
  
  // Setting values that are initialized late
  var lateSettings = [];
  
  settings.setState("user", null);
  settings.states["user"].get = function() {
    var plainSettings = {};
    
    function scan(obj, newObj) {
      var objSettings = obj._settings;
      var objGroups   = obj._groups;
      
      // Loop settings
      for (var i=0,l=objSettings.length; i<l; i++) {
        var settName = objSettings[i];
        
        newObj[settName] = obj[settName];
      }
      
      // Loop groups
      for (var i=0,l=objGroups.length; i<l; i++) {
        var groupName = objGroups[i];
        
        newObj[groupName] = {};
        
        scan(obj[groupName], newObj[groupName]);
      }
      
      return newObj;
    }
    
    return scan(userSettings, plainSettings);
  };
  
  // Add new settings
  settings.addStateListener("default", settings.manifest);
  
  settings.addStateCondition("default", function(newDef) {
    if (jSh.type(newDef) !== "object" || newDef.constructor !== Object)
      return false;
    else
      return true;
  });
  
  settings.addStateListener("user", function(sett) {
    if (jSh.type(sett) !== "object" || sett.constructor !== Object) // Only pure object allowed for user settings
      return;
    
    jSh.mergeObj(userSettings, sett, true);
  });
  
  window.sett = settings;
}
lces.rc[6] = function() {
  // Conversion functions
  
  // RGB Range: 0 - 1
  lces.ui.RGB2HSV = function(r, g, b) {
    // Check if a greyscale color
    if (r === g && g === b)
      return {h: 0, s: 0, v: r};
    
    var names = [r + "r", g + "g", b + "b"];
    
    // Sort for biggest channel
    var sortn = [names[0], names[1], names[2]].sort(function(a, b) {return parseFloat(a) < parseFloat(b) ? 1 : -1;});
    var sort  = sortn.map(function(i){return parseFloat(i);});
    sortn = sortn.map(function(i){return i.substr(-1);});
    
    var saturation = (sort[0] - sort[2]) / sort[0];
    var value = sort[0] / 1;
    
    var chroma = sort[0] - sort[2];
    var hue = 60;
    
    switch (sortn[0]) {
      case "r":
        hue *= ((g - b) / chroma) % 6;
      break;
      case "g":
        hue *= (b - r) / chroma + 2;
      break;
      case "b":
        hue *= (r - g) / chroma + 4;
      break;
    }
    
    return {h: hue, s: saturation, v: value};
  }

  lces.ui.HSV2RGB = function(h, s, v) {
    var c = v * s;
    var rgb;
    
    var H = h / 60;
    var x = c * (1 - Math.abs((H % 2) - 1));
    
    if (s === 0)
      rgb = [0, 0, 0];
    else
      switch (Math.floor(H)) {
        case 0: rgb = [c, x, 0]; break;
        case 1: rgb = [x, c, 0]; break;
        case 2: rgb = [0, c, x]; break;
        case 3: rgb = [0, x, c]; break;
        case 4: rgb = [x, 0, c]; break;
        case 5: rgb = [c, 0, x]; break;
      };
    
    var m = v - c;
    
    return [rgb[0] + m, rgb[1] + m, rgb[2] + m];
  }
  
  var validHex = /[\da-f]+/i;
  function sanitizeHex(hex, fail) {
    hex = (hex + "").match(validHex)[0];
    
    // Return white if invalid
    if (!hex || hex.length < 3)
      return !fail ? [255, 255, 255] : null;
    
    if (hex.length < 6)
      hex = hex.split("")
               .slice(0, 3)
               .reduce((a, b, i) => a + (i === 1 ? a : "") + b + b);
    
    return [0, 0, 0].map((z, i) => parseInt(hex.substr(i * 2, 2), 16));
  }
  
  lces.ui.sanitizeHex = sanitizeHex;
  
  function toHex(arr) {
    return arr.map(n => n.toString(16)).map(s => s.length === 1 ? "0" + s : s).join("");
  }
  
  lces.ui.colorchooser = {
    // Color chooser template
    template: lces.template({render: jSh.dm(".lces-colorchooser.visible", undf, [
      jSh.dm(".lces-cc-display", undf, [
        jSh.dm(".lces-cc-color")
      ], {tabindex: 0}),
      jSh.dm(".lces-colorchooser-modal", undf, [
        // Colorwheel and cursor
        jSh.dm(".lces-cc-section", undf, [
          jSh.dm(".lces-cc-wheel", undf, [
            jSh.dm(".lces-cc-wheel-value"),
            jSh.dm(".lces-cc-cursor")
          ])
        ]),
        // Sat and value Controls
        jSh.dm(".lces-cc-section.lces-cc-controls", undf, [
          jSh.dm(".lces-cc-row.lces-cc-saturation", undf, [
            jSh.dm(".lces-cc-label", "S"),
            lcSlider({min: 0, max: 100, hideValue: true})
          ]),
          jSh.dm(".lces-cc-row.lces-cc-value", undf, [
            jSh.dm(".lces-cc-label", "V"),
            lcSlider({min: 0, max: 100, hideValue: true})
          ])
        ])
      ])
    ])}),
    
    // Main color chooser modal container
    screen: jSh.d({
      sel: "#lces-colorchoosermodalcontainer.lces-themify",
      events: {
        // mousedown: function(e) {
        //   var target = e.target;
        //
        //   if (target === this)
        //     e.preventDefault();
        // },
        
        wheel: function(e) {
          e.preventDefault();
        }
      }
    })
  };
  
  lces.addInit(function() {
    document.body.appendChild(lces.ui.colorchooser.screen);
  }, 2);
  
  window.lcColorChooser = function(refElm) {
    // Check if called as a template child
    var isTemplChild = lces.template.isChild(arguments, this);
    if (isTemplChild)
      return isTemplChild;
    
    // Inherit textfield traits
    lcTextField.call(this);
    
    var ccmContainer = lces.ui.colorchooser.screen;
    
    this.type = "LCES Color Chooser Widget";
    var that = this;
    this.element = new lces.ui.colorchooser.template(this);
    
    var ccColor  = this.jSh(".lces-cc-color")[0];
    var cursor   = this.jSh(".lces-cc-cursor")[0];
    var modal    = this.jSh(".lces-colorchooser-modal")[0];
    var wheel    = this.jSh(".lces-cc-wheel")[0];
    var wheelVal = this.jSh(".lces-cc-wheel-value")[0];
    var satSlide = this.jSh(".lces-slider")[0];
    var valSlide = this.jSh(".lces-slider")[1];
    var satRow   = this.jSh(".lces-cc-saturation")[0];
    var valRow   = this.jSh(".lces-cc-value")[0];
    
    // Add focusing functionality
    ccColor.parentNode.addEventListener("keydown", function(e) {
      if (e.keyCode === 32 || e.keyCode === 13)
        e.preventDefault();
      
      if (that.modalVisible && e.keyCode === 27)
        e.preventDefault();
    });
    
    ccColor.parentNode.addEventListener("keyup", function(e) {
      if (e.keyCode === 32 || e.keyCode === 13) {
        that.modalVisible = true;
        that.focused = true;
      }
      
      if (e.keyCode === 27)
        that.modalVisible = false;
    });
    
    // Get stuff working
    ccmContainer.appendChild(modal);
    modal.style.display = "block";
    
    // Set the wheel bg
    wheel.style.backgroundImage = "url(https://b-fuze.github.io/lces/main-img/colorchooser.png)";
    
    // Prep sliders
    satSlide.oldComponent = satSlide.component;
    valSlide.oldComponent = valSlide.component;
    
    // Set all components to this
    ccColor.parentNode.component = this;
    ccColor.component = this;
    modal.component = this;
    wheel.component = this;
    satSlide.component = this;
    valSlide.component = this;
    
    satSlide = satSlide.oldComponent;
    valSlide = valSlide.oldComponent;
    
    satSlide.value = 100;
    valSlide.value = 100;
    
    var modalHeight = modal.offsetHeight;
    var wheelWidth  = wheel.offsetWidth;
    var cursorWidth = cursor.offsetWidth;
    
    // Fade animation
    var displayTimeout = null;
    this.setState("modalVisible", false);
    this.addStateListener("modalVisible", function(visible) {
      if (visible) {
        ccmContainer.classList.add("visible");
        var ccRect = ccColor.parentNode.getBoundingClientRect();
        
        if (innerHeight - ccRect.bottom - 15 < modalHeight) {
          modal.classList.add("flipped");
          modal.style.top = (ccRect.top - modalHeight - 5) + "px";
          modal.style.left = (ccRect.left) + "px";
        } else {
          modal.classList.remove("flipped");
          modal.style.top = (ccRect.top + (ccRect.bottom - ccRect.top)) + "px";
          modal.style.left = (ccRect.left) + "px";
        }
        
        modal.style.display = "block";
        
        displayTimeout = setTimeout(function() {
          modal.classList.add("visible");
        }, 10);
      } else {
        clearTimeout(displayTimeout);
        modal.classList.remove("visible");
        ccmContainer.classList.remove("visible");
      }
    });
    
    onTransitionEnd(modal, function(e) {
      if (e.propertyName == "opacity") {
        var opacity = getComputedStyle(this)["opacity"];
        
        if (opacity == 0)
          modal.style.display = "none";
      }
    });
    
    // Opening/Closing event triggers/handlers
    var openingTimeout = null;
    
    // TODO: Deduce whether this hover effect is really needed
    //
    // ccColor.addEventListener("mouseover", function() {
    //   openingTimeout = setTimeout(function() {
    //     that.modalVisible = true;
    //     that.focused = true;
    //
    //     openingTimeout = null;
    //   }, 500);
    //
    //   this.addEventListener("mouseout", function mouseout() {
    //     this.removeEventListener("mouseout", mouseout);
    //
    //     if (openingTimeout)
    //       clearTimeout(openingTimeout);
    //   });
    // });
    
    ccColor.addEventListener("click", function() {
      clearTimeout(openingTimeout);
      openingTimeout = null;
      
      that.modalVisible = true;
      that.focused = true;
    });
    
    this.addStateListener("focused", function(focus) {
      if (!focus) {
        that.modalVisible = false;
      }
    });
    
    // Clear default TextField value state
    this.removeState("value");
    
    // Start color logic
    this.updatingValue = false;
    var curHue = null;
    
    this.setState("value", [255, 255, 255]);
    this.addStateListener("value", function(colors) {
      // Check if being updated from user
      if (that.updatingValue) {
        that.updatingValue = false;
        return;
      }
      
      // Change to array
      colors = that.valueType === "array" ? colors : (jSh.type(colors) !== "array" ? sanitizeHex(colors) : colors);
      
      // Validate colors
      if (!colors || jSh.type(colors) !== "array" || colors.length < 3)
        colors = [255, 255, 255];
      
      colors.forEach(function(color, i) {
        if (i < 3 && (jSh.type(color) !== "number" || isNaN(color)))
          colors[i] = 255;
      });
      
      this.stateStatus = that.valueType === "array" ? colors : "#" + toHex(colors);
      that.displayColor([colors[0] / 255, colors[1] / 255, colors[2] / 255]);
    });
    
    // Value types for interfacing with an lcColorChooser instance's value
    var valueTypes = ["array", "hex"];
    
    this.setState("valueType", "array");
    this.addStateCondition("valueType", function(vType) {
      if (typeof vType !== "string" || valueTypes.indexOf(vType.toLowerCase()) === -1)
        return false;
      
      this.proposedValue = vType.toLowerCase();
      return true;
    });
    
    this.getValueArray = function() {
      return this.valueType === "array" ? this.value : sanitizeHex(this.value);
    }
    
    // Displays color
    this.displayColor = function(color) {
      var colorHSV = lces.ui.RGB2HSV(color[0], color[1], color[2]);
      
      satSlide.updatingSat = true;
      satSlide.value = colorHSV.s * 100;
      valSlide.updatingVal = true;
      valSlide.value = colorHSV.v * 100;
      
      this.setCursor(colorHSV.h, colorHSV.s);
      ccColor.style.background = "rgb(" + this.getValueArray().map(i => Math.round(i)).join(", ") + ")";
      wheelVal.style.opacity = (1 - colorHSV.v);
    }
    
    this.updateColorValue = function() {
      var color = {};
      
      // color.s = satSlide.value / 100;
      color.v = valSlide.value / 100;
      wheelVal.style.opacity = 1 - color.v;
      
      var wheelCenter = (wheelWidth / 2);
      var curx = cursor.offsetLeft - wheelCenter + (cursorWidth / 2);
      var cury = wheelCenter - cursor.offsetTop  - (cursorWidth / 2);
      var off  = Math.sqrt(Math.pow(cursor.offsetLeft - wheelCenter + (cursorWidth / 2), 2) + Math.pow(wheelCenter - cursor.offsetTop  - (cursor.offsetHeight / 2), 2));
      
      
      var rotation = (Math.atan2(cury, curx) / Math.PI) * 180;
      rotation = rotation < 0 ? 360 + rotation : rotation;
      
      if (off > wheelCenter) {
        this.setCursor(rotation, 1);
        off = wheelCenter;
      } else if (this.limitSaturation) {
        this.setCursor(rotation, this.limitSaturation);
        off = this.limitSaturation * wheelCenter;
      }
      
      color.s = off / wheelCenter;
      
      satSlide.updatingSat = true;
      satSlide.value = color.s * 100;
      
      color.h = rotation;
      
      that.updatingValue = true;
      var newValue = lces.ui.HSV2RGB(color.h, color.s, color.v);
      newValue = [parseInt(newValue[0] * 255), parseInt(newValue[1] * 255), parseInt(newValue[2] * 255)];
      
      this.value = this.valueType === "array" ? newValue : "#" + toHex(newValue);
      ccColor.style.background = "rgb(" + this.getValueArray().map(function(i){return Math.round(i);}).join(", ") + ")";
    }
    
    this.setCursor = function(rot, dist) {
      var wheelCenter = (wheelWidth / 2);
      rot = ((rot + 90) / 360) * Math.PI * 2;
      
      var x = Math.sin(rot) * dist * wheelCenter + wheelCenter - (cursorWidth / 2);
      var y = Math.cos(rot) * dist * wheelCenter + wheelCenter - (cursorWidth / 2);
      
      cursor.style.left = x + "px";
      cursor.style.top  = y + "px";
    }
    
    // Slider events
    satSlide.addStateListener("value", function(value) {
      if (satSlide.updatingSat) {
        satSlide.updatingSat = false;
        return;
      }
      
      var color = lces.ui.RGB2HSV(that.getValueArray()[0] / 255, that.getValueArray()[1] / 255, that.getValueArray()[2] / 255);
      
      that.setCursor(color.h, value / 100);
      that.updateColorValue();
    });
    
    valSlide.addStateListener("value", function(value) {
      if (valSlide.updatingVal || valSlide.updatingValue) {
        valSlide.updatingVal = false;
        return;
      }
      
      that.updateColorValue();
    });
    
    // Mouse events
    wheel.addEventListener("mousedown", function(e) {
      e.preventDefault();
      function moveCursor(e) {
        var wheelRect = wheel.getBoundingClientRect();
        
        e.preventDefault();
        
        cursor.style.left = Math.round(e.clientX - (wheelRect.left) - cursorWidth / 2) + "px";
        cursor.style.top  = Math.round(e.clientY - wheelRect.top - cursorWidth / 2) + "px";
        
        that.updateColorValue();
      }
      
      moveCursor(e);
      
      window.addEventListener("mousemove", moveCursor);
      window.addEventListener("mouseup", function mup() {
        window.removeEventListener("mousemove", moveCursor);
        window.removeEventListener("mouseup", mup);
      });
    });
    
    this.addStateListener("disableValue", function(disable) {
      if (disable)
        valRow.style.display = "none";
      else
        valRow.style.display = "block";
    });
    
    this.limitSaturation = null;
    this.addStateListener("disableSaturation", function(disable) {
      if (disable) {
        that.limitSaturation = satSlide.s;
        satRow.style.display = "none";
      } else
        that.limitSaturation = null;
        satRow.style.display = "block";
    });
    
    // Finish measuring
    this.value = this.valueType === "array" ? [255, 255, 255] : "#" + toHex(sanitizeHex("#"));
    modal.style.display = "none";
    this.classList.remove("visible");
    
    // Check for predefined options
    if (refElm) {
      var initialColor = refElm.getAttribute("color");
      
      if (initialColor && /^\s*rgb\(\s*\d+,\s*\d+\s*,\s*\d+\s*\)\s*$/.test(initialColor)) {
        var firstColor = initialColor.match(/\d+/g);
        
        this.value = firstColor.map(function(i){return parseInt(i);});
      }
      
      if (refElm.parentNode) {
        refElm.parentNode.insertBefore(this.element, refElm);
        refElm.parentNode.removeChild(refElm);
      }
    }
  }

  jSh.inherit(lcColorChooser, lcTextField);

  jSh.extendObj(lces.types, {
    "colorchooser": lcColorChooser
  });
}
// LCES Widget Extra Components
lces.rc[5] = function() {
  window.lcForm = function(e) {
    lcWidget.call(this, e || jSh.c("form"));
    
    // Something here, possibly, maybe?
  }

  jSh.inherit(lcForm, lcWidget);


  // Some extensions


  // TODO: Consider the best method of implementing user-driven events
  // function lcWidget

  // Hmm, lcGroup.exclusiveState and lcFocus have solved my problem for now.

  // Some form elements

  window.lcTextField = function(e, type) {
    lcWidget.call(this, e ? e : jSh.c("input", {properties: {type: type ? type : "text"}}));
    var that = this;
    
    this.type = "LCES TextField Widget";
    
    if (this.element.type && (this.element.type === "text" || this.element.type === "password" || this.element.type === "hidden") || this.element.tagName.toLowerCase() == "textarea") {
      this.classList.add("lces");
      
      this.element.addEventListener("input", function() {
        that.text = this.value;
      });
      this.linkStates("text", "value");
    }
    
    this.setState("focused", false);
    lces.focus.addMember(this);
    
    this.focus = function() {
      if (typeof that.element.focus === "function")
        that.element.focus();
      
      that.focused = true;
    }
    
    this.blur = function() {
      if (typeof that.element.blur === "function")
        that.element.blur();
      
      that.focused = false;
    }
    
    this.wrap = undf;
  }

  jSh.inherit(lcTextField, lcWidget);

  lces.ui.sliderTemplate = lces.template({render: jSh.dm(".lces-slider", undf, [
    jSh.dm("lces-slider-min", "{#min}"),
    jSh.dm("lces-slider-max", "{#max}"),
    jSh.dm("lces-slider-value", "{#prefix}{#displayValue}{#suffix}"),
    jSh.dm("lces-slider-scrubbar", undf, [
      jSh.dm("lces-slider-scrubber")
    ])
  ], {tabindex: 0})});

  lces.global.lcSlider = function(refElm) {
    // Check if called as a template child
    var isTemplChild = lces.template.isChild(arguments, this);
    if (isTemplChild)
      return isTemplChild;
    
    // Continue on as normal
    lcTextField.call(this);
    this.type = "LCES Slider Widget";
    
    var that = this;
    
    this.element = new lces.ui.sliderTemplate(this);
    this.element.component = this;
    
    // Temporary for dimensions
    document.body.appendChild(this.element);
    
    var scrubbar = this.jSh(".lces-slider-scrubbar")[0];
    var scrubber = this.jSh(".lces-slider-scrubber")[0];
    var valueDisplay = this.jSh(".lces-slider-value")[0];
    
    var scrubbarWidth = scrubbar.offsetWidth;
    var scrubberWidth = scrubber.offsetWidth;
    var widthCheck    = false;
    
    scrubbar.addEventListener("mousedown", function(e) {
      e.preventDefault();
      var target = e.target || e.srcElement;
      
      // Focus scrubbar
      that.element.focus();
      
      // Update height in case of unforeseen changes
      scrubbarWidth = scrubbar.offsetWidth;
      scrubberWidth = scrubber.offsetWidth;
      
      var onScrub = function(e, scrubberTrig) {
        e.preventDefault();
        var sbRect = scrubbar.getBoundingClientRect();
        
        that.triggerEvent("scrubberX", {
          scrubberTriggered: !scrubberTrig,
          x: e.clientX - sbRect.left - scrubberWidth * 0.5
        });
      }
      
      onScrub(e, !(target === scrubber));
      that.classList.add("scrubbing");
      
      window.addEventListener("mousemove", onScrub);
      window.addEventListener("mouseup", function(e) {
        e.preventDefault();
        window.removeEventListener("mousemove", onScrub);
        
        that.classList.remove("scrubbing");
      });
    });
    
    this.on("scrubberX", function(e) {
      var maxOff = scrubbarWidth - scrubberWidth - 2;
      var newOff = e.x < 0 ? 0 : e.x;
      newOff = (newOff > maxOff ? maxOff : newOff);
      
      if (!widthCheck) {
        // Update value
        if (!e.valueTriggered) {
          that.updatingValue = true;
          
          var newValue = that.min + (that.max - that.min) * (newOff / (scrubbarWidth - scrubberWidth - 2));
          that.value = !that.decimals ? Math.round(newValue) : newValue;
        } else {
          that.states["value"].oldStateStatus = that.value;
          that.states["value"].stateStatus = that.min + (that.max - that.min) * (newOff / (scrubbarWidth - scrubberWidth - 2));
        }
        
        that.displayValue = Math.round(that.value * 100) / 100;
        
        if (!that.decimals)
          that.displayValue = Math.round(that.displayValue);
      }
      
      // Check if scrubber is the trigger
      if (!e.scrubberTriggered && !widthCheck)
        that.classList.add("animated");
      else
        that.classList.remove("animated");
      
      // Update scrubber position
      newOff = newOff < 0 ? 0 : newOff;
      scrubber.style.left = newOff + "px";
    });
    
    this.removeState("text", "value");
    this.addStateListener("value", function(value) {
      if (that.updatingValue) {
        that.updatingValue = false;
        return;
      }
      
      if (typeof value === "number") {
        that.triggerEvent("scrubberX", {valueTriggered: true, x: (scrubbarWidth - scrubberWidth) * ((value - that.min) / (that.max - that.min))});
      }
    });
    
    this.addStateListener("hideValue", function(hide) {
      if (hide)
        valueDisplay.style.display = "none";
      else
        valueDisplay.style.display = "block";
    });
    
    this.updateSliderWidth = function() {
      scrubbarWidth = scrubbar.offsetWidth;
      scrubberWidth = scrubber.offsetWidth;
    
      // Force scrubber update
      widthCheck = true;
      that.triggerEvent("scrubberX", {valueTriggered: true, x: (scrubbarWidth - scrubberWidth) * ((this.value - that.min) / (that.max - that.min))});
      widthCheck = false;
    }
    
    this.min = 0;
    this.max = 100;
    this.displayValue = 0;
    this.decimals = true;
    
    // For when focused
    var keyIncr = {"37": -1, "39": 1, "38": 5, "40": -5};
    
    this.element.addEventListener("keydown", function(e) {
      if (keyIncr[e.keyCode])
        e.preventDefault();
    });
    this.element.addEventListener("keyup", function(e) {
      if (e.keyCode === 37 || e.keyCode === 39) {
        var newValue = that.value + keyIncr[e.keyCode];
        
        if (newValue >= that.min && newValue <= that.max)
          that.value = !that.decimals ? Math.round(newValue) : newValue;
      } else if (e.keyCode === 38 || e.keyCode === 40) {
        var newValue = Math.max(Math.min(that.value + keyIncr[e.keyCode], that.max), that.min);
        
        that.value = !that.decimals ? Math.round(newValue) : newValue;
      } else {
        return false;
      }
      
      e.preventDefault();
    });
    
    document.body.removeChild(this.element);
    
    if (refElm) {
      var attrMin   = refElm.getAttribute("min");
      var attrMax   = refElm.getAttribute("max");
      var prefix    = refElm.getAttribute("prefix");
      var suffix    = refElm.getAttribute("suffix");
      var hideValue = refElm.getAttribute("hide-value");
      var decimals  = refElm.getAttribute("decimals");
      var steps     = refElm.getAttribute("steps");
      
      if (!isNaN(parseFloat(attrMin))) {
        this.min = parseFloat(attrMin);
        
        // Set to lowest displayable value
        this.displayValue = this.min;
      }
      
      if (!isNaN(parseFloat(attrMax)))
        this.max = parseFloat(attrMax);
      
      if (prefix)
        this.prefix = prefix;
      
      if (suffix)
        this.suffix = suffix;
      
      if (decimals && decimals.toLowerCase() === "false")
        this.decimals = false;
      
      if (hideValue && hideValue === "true")
        this.hideValue = true;
      
      if (refElm.parentNode) {
        refElm.parentNode.insertBefore(this.element, refElm);
        refElm.parentNode.removeChild(refElm);
      }
      
    }
  }

  // Inherit lcTextField traits
  jSh.inherit(lcSlider, lcTextField);


  window.lcFileInput = function(e) {
    lcTextField.call(this, jSh.d("lces-file", undf, [
      jSh.d(undf, undf, jSh.d(undf, undf, jSh.d(undf, undf, jSh.d("lces-filetext")))), // So annoying
      jSh.c("aside")
    ]));
    var that = this;
    
    // File icon
    var fileIconSVG = jSh.svg("cp-svg", 17, 20, [
      jSh.path(undf, "M0 0 0 20 17 20 17 5 12.5 5 12 5 12 4.5 12 0 0 0zm13 0 0 4 4 0-4-4zm-4.5 4 4.5 4.5-2.2 0 0 4.5-2.2 0-2.2 0 0-4.5L4 8.5 8.5 4zM4 15l9 0 0 1-9 0 0-1z", "fill: #fff;")
    ]);
    
    
    // Append input
    var input = e || jSh.c("input", {properties: {type: "file"}});
    if (input.parentNode)
      input.parentNode.insertBefore(this.element, input);
    
    this.element.appendChild(input);
    this.input = input;
    
    if (!input.name)
      input.name = "file";
    
    var aside = this.element.getChild(-2);
    aside.appendChild(fileIconSVG);
    
    var textDisplay = this.element.getElementsByClassName("lces-filetext")[0];
    textDisplay.textContent = "No file chosen";
    
    
    // Events
    
    this.onchange =  function() {
      if (input.files.length !== 0)
        var display = input.files.length === 1 ? input.files[0].name : "[" + input.files.length + "] Files Selected";
      else
        var display = "No file chosen";
      
      display = display.length > 14 ? display.substr(0,12) + "..." : display;
      
      textDisplay.textContent = display;
    }
    
    // Input events
    var inputEvents = ["change", "input", "focus", "blur", "click"];
    
    // Add event listener wrapper
    var _addListener = this.addEventListener;
    this.addEventListener = function(event, cb) {
      event = (event + "").toLowerCase();
      
      if (inputEvents.indexOf(event) !== -1)
        that.input.addEventListener(event, cb);
      else
        that.addEventListener(event, cb);
    }
    
    // Upload
    this.upload = function(url, keys, progressCb, readystatechangeCb) {
      var form = new lcForm();
      form.append(that.input);
      
      // Get keys from input elements
      if (jSh.type(keys) === "array")
        keys.forEach(function(i) {form.append(i);});
      
      // Create FormData
      var fd = new FormData(form.element);
      
      // Get keys from object properties
      if (jSh.type(keys) === "object")
        Object.getOwnPropertyNames(keys).forEach(function(i) {
          fd.set(i, keys[i]);
        });
      
      var req = new lcRequest({
        method: "POST",
        uri: url,
        formData: fd,
        callback: function() {
          if (typeof readystatechangeCb === "function")
            readystatechangeCb.call(this);
        }
      });
      
      if (req.xhr.upload && typeof callback === "function") {
        req.xhr.upload.addEventListener("progress", function(e) {
          callback.call(this, e);
        });
      }
      
      // Commence upload
      req.send();
      
      // Put input back in component
      that.append(that.input);
      
      return req;
    }
    
    var lcesph    = jSh.ph ? jSh.ph() : null;
    var resetForm = jSh.c("form");
    
    this.reset = function() {
      if (lcesph)
        lcesph.substitute(input);
      
      resetForm.appendChild(input);
      resetForm.reset();
      
      if (lcesph)
        lcesph.replace(input);
      else
        that.element.appendChild(input);
      
      textDisplay.textContent = "No file chosen";
    }
    
    input.addEventListener("change", this.onchange);
  }
  
  jSh.inherit(lcFileInput, lcTextField);
  
  
  window.lcTextArea = function(e) {
    lcTextField.call(this, e ? e : jSh.c("textarea", "lces"));
    var that = this;

    this.type = "LCES TextArea Widget";
    
    this.removeState("text", "value");
    this.setState("value");
    
    this.hardLinkStates("text", "value");
    
    // Add state listeners
    this.addStateListener("text", function(text) {
      that.element.value = text;
    });
    
    this.states["text"].get = function() {
      return that.element.value;
    }
    
    this.select = function() {
      this.element.select();
    }
    
    // this.states["value"].get = this.states["text"].get;
  }

  jSh.inherit(lcTextArea, lcTextField);


  window.acceptableKeyCodes = {"9": "tab", "48": "0", "49": "1", "50": "2", "51": "3", "52": "4", "53": "5", "54": "6", "55": "7", "56": "8", "57": "9", "37": "left_arrow", "38": "up_arrow", "39": "right_arrow", "40": "down_arrow", "46": "delete", "8": "backspace", "13": "enter", "16": "shift", "17": "ctrl", "18": "alt", "35": "end", "36": "home", "96": "numpad_0", "97": "numpad_1", "98": "numpad_2", "99": "numpad_3", "100": "numpad_4", "101": "numpad_5", "102": "numpad_6", "103": "numpad_7", "104": "numpad_8", "105": "numpad_9", "109": "subtract", "110": "decimal_point", "190": "period", "189": "dash" };

  window.lcNumberField = function(e) {
    lcTextField.call(this, e ? e : jSh.c("input", {properties: {type: "text"}}));
    var that = this;
    
    this.type = "LCES NumberField Widget";
    this.oldValue = this.text;
    this.style.minWidth = "0px";
    this.classList.add("lces-numberfield");
    
    
    // Setup span container
    this.container = jSh.c("span", "numberfield-container");
    if (this.parent)
      this.parent.insertBefore(this.container, this.element);
    this.container.appendChild(this.element);
    
    
    // The NumberField specific properties
    this.setState("min", null);
    this.setState("max", null);
    this.setState("integer", false);
    this.setState("digits", 5);
    this.setState("decimalPoints", 5);
    
    // Get a char's width
    var _charWidth = jSh.c("span", undf, "X", undf, {style: "font-size: 15px; font-weight: bold;"});
    document.body.appendChild(_charWidth);
    this._charWidth = _charWidth.offsetWidth;
    document.body.removeChild(_charWidth);
    
    // Now set the state listeners
    this.addStateListener("digits", function(n) {
      var digitLength = that.digits === 0 ? 15 : that.digits;
      var decimalPoints = that.decimalPoints === 0 ? 15 : that.decimalPoints;
      
      that.style.width = (((!that.integer ? decimalPoints + 1 : 0) + digitLength) * that._charWidth ) + "px";
      
      that.testInt = new RegExp("^\\-?\\d{0," + that.digits + "}$");
      that.testFloat = new RegExp("^\\-?\\d{0," + that.digits + "}(?:\\.\\d{0," + that.decimalPoints + "})?$");
    });
    
    this.addStateListener("decimalPoints", this.states['digits'].functions[0]);
    this.addStateListener("integer", this.states['digits'].functions[0]);
    
    // Add event listeners to the element
    this.testInt = new RegExp("^\\d{0," + this.digits + "}$");
    this.testFloat = new RegExp("^\\d{0," + this.digits + "}(?:\\.\\d{0," + this.decimalPoints + "})?$");
    this.testInput = function() {
      var curValueFloat = parseFloat(this.value);
      var curValueInt   = parseInt(this.value);
      
      if (isNaN(curValueFloat) || that.integer && curValueFloat !== curValueInt) {
        this.value = that.oldValue;
      } else if (typeof that.min == "number" && curValueFloat < that.min) {
        this.value = that.min;
      } else if (typeof that.max == "number" && curValueFloat > that.max) {
        this.value = that.max;
      } else {
        that.oldValue = this.value;
        
        // New input has passed all tests
        return true;
      }
      
      return false;
    }
    
    this.addEventListener("change", this.testInput);
    
    this.increment = function() {
      var value = {value: parseFloat(that.element.value) + 1};
      
      var pass = that.testInput.call(value);
      if (pass) this.value = value.value;
      
      if (!lces.ui.mobileDevice)
        that.element.focus();
    }
    
    this.decrement = function() {
      var value = {value: parseFloat(that.element.value) - 1};
      
      var pass = that.testInput.call(value);
      if (pass) this.value = value.value;
      
      if (!lces.ui.mobileDevice)
        that.element.focus();
    }
    
    this.addEventListener("keydown", function(e) {
      if (e.ctrlKey)
        return;
      
      if (acceptableKeyCodes[e.keyCode.toString()] === undf)
        return e.preventDefault();
      
      switch (e.keyCode) {
        case 38:
          that.increment();
          break;
        case 40:
          that.decrement();
          break;
      }
      
      return;
    });
    
    // Check for properties in the attributes
    if (!isNaN(parseInt(this.element.getAttribute("lces-digits"))))
      this.digits = parseInt(this.element.getAttribute("lces-digits"));
    else
      this.digits = 5;
    
    if (!isNaN(parseInt(this.element.getAttribute("lces-decimal-points"))))
      this.decimalPoints = parseInt(this.element.getAttribute("lces-decimal-points"));
    else
      this.decimalPoints = 5;
    
    if (this.element.getAttribute("lces-integers") && (this.element.getAttribute("lces-integers").toLowerCase() === "true" || this.element.getAttribute("lces-integers").toLowerCase() === "false"))
      this.integer = this.element.getAttribute("lces-integers").toLowerCase() === "true";
    else
      this.integer = true;
    
    if (!isNaN(parseFloat(this.element.getAttribute("lces-max"))))
      this.max = parseFloat(this.element.getAttribute("lces-max"));
    else
      this.max = null;
    
    if (!isNaN(parseFloat(this.element.getAttribute("lces-min"))))
      this.min = parseFloat(this.element.getAttribute("lces-min"));
    else
      this.min = null;
      
    
    // Make arrow containers
    var upArrow = jSh.d("arrow");
    upArrow.classList.add("top");
    
    var bottomArrow = jSh.d("arrow");
    bottomArrow.classList.add("bottom");
    
    this.container.appendChild(upArrow, bottomArrow);
    
    // Make SVG arrows
    upArrow.appendChild(jSh.svg("numberfielduparrow", 6.8, 3.4, [
      jSh.path(undf, "m0 3.4 6.8 0L3.4 0z", "fill: #fff;")
    ]));
    bottomArrow.appendChild(jSh.svg("numberfieldbottomarrow", 6.8, 3.4, [
      jSh.path(undf, "M0 0 6.8 0 3.4 3.4z", "fill: #fff;")
    ]));
    
    // Add arrow click events
    upArrow.addEventListener("mousedown", function(e) {
      this.classList.add("active");
      
      e.preventDefault();
      that.increment();
    });
    bottomArrow.addEventListener("mousedown", function(e) {
      this.classList.add("active");
      
      e.preventDefault();
      that.decrement();
    });
    
    function clearBak() {
      this.classList.remove("active");
    }
    
    upArrow.addEventListener("mouseup", clearBak);
    bottomArrow.addEventListener("mouseup", clearBak);
    
    // Reset parent state function from lcWidget
    this.states["parent"].functions[0] = function(parent) {
      if (parent) {
        if (parent.isLCESComponent)
          parent = parent.element;

        parent.appendChild(that.container);
      } else if (that.parent)
        that.parent.removeChild(that.container);
    }
  }

  jSh.inherit(lcNumberField, lcTextField);


  window.lcRadioButton = function(radio) {
    lcWidget.call(this, jSh.d("lcesradio"));
    var that = this;

    this.type = "LCES RadioButton Widget";

    var svg = jSh(".radiobuttonsvg")[0].cloneNode(true);
    this.appendChild(svg);
    radio.parentNode.insertBefore(this.element, radio);
    radio.style.display = "none";

    this.setState("focused", false);
    lces.focus.addMember(this);

    this.setState("checked", false);
    this.value = radio.value;
    this.addStateListener("checked", function(checked) {
      that.element[checked ? "setAttribute" : "removeAttribute"]("checked", "");
    });

    this.addStateListener("focused", function(focused) {
      if (focused) {
        that.checked = true;
        that.group.value = that.value;
      }
    });

    this.addEventListener("mousedown", function(e) {
      e.preventDefault();
    });
  }

  jSh.inherit(lcRadioButton, lcWidget);


  window.lcRadioButtons = function(radios) {
    lcGroup.call(this);
    var that = this;

    this.type = "LCES RadioGroup Widget";
    this.setState("value", "");

    this.radioButtons = {};
    this.addStateListener("value", function(value) {
      if (that.radioButtons[value])
        that.radioButtons[value].checked = true;
    });

    if (jSh.type(radios) != "array")
      radios = jSh.toArr(radios);

    this.setState("checked", false);
    this.setExclusiveState("checked", true, 1);

    var labels = LCESLoopLabels();

    function onClickLabel(e) {
      this.radio.checked = true;

      e.preventDefault();
    }

    for (var i=0,l=radios.length; i<l; i++) {
      var radio = new lcRadioButton(radios[i]);
      radio.group = this;
      this.radioButtons[radios[i].value] = radio;

      this.addMember(radio);
      if (radios[i].checked)
        radio.checked = true;

      radios[i].component = radio;
      if (radios[i].id && labels[radios[i].id]) {
        labels[radios[i].id].radio = radio;
        labels[radios[i].id].addEventListener("mousedown", onClickLabel);
        labels[radios[i].id].component = radio;
      }
    }
  }
  
  jSh.inherit(lcRadioButtons, lcGroup);
  
  
  lces.ui.CheckBoxSVG = jSh.svgm(".checkboxsvg", 14, 13, [
    jSh.pathm(".checkboxcolor", "M2.6 1 10.4 1C11.3 1 12 1.7 12 2.6l0 7.9C12 11.3 11.3 12 10.4 12L2.6 12C1.7 12 1 11.3 1 10.4L1 2.6C1 1.7 1.7 1 2.6 1z"),
    jSh.pathm(undf, "m2.6 2.3 7.7 0C10.6 2.3 10.8 2.4 10.8 2.6l0 7.7C10.8 10.6 10.6 10.8 10.4 10.8l-7.7 0C2.4 10.8 2.3 10.6 2.3 10.4l0-7.7C2.3 2.4 2.4 2.3 2.6 2.3z", "fill: #fff;"),
    jSh.pathm(".checkboxcolor", "M11.5 2.5 11 3.1 5.9 8.2 4.3 6.6 3.8 6.1 2.7 7.1 3.2 7.7 5.3 9.8 5.9 10.3 6.4 9.8 12.1 4.1 12.6 3.6 11.5 2.5z")
  ]);
  
  window.lcCheckBox = function(e) {
    // Check if called as a template child
    var isTemplChild = lces.template.isChild(arguments, this);
    if (isTemplChild)
      return isTemplChild;
    
    lcTextField.call(this, jSh.d("lcescheckbox"));
    var that = this;
    
    this.type = "LCES CheckBox Widget";
    
    // Check for reference InputElement
    if (e) {
      e.style.display = "none";
      e.parentNode.insertBefore(this.element, e);
    } else
      e = {checked: false};
    
    var svg = lces.ui.CheckBoxSVG.conceive(true);
    
    this.appendChild(svg);
    
    this.setState("checked", false);
    this.addStateListener("checked", function(checked) {
      if (checked)
        that.element.setAttribute("checked", "");
      else
        that.element.removeAttribute("checked");
    });
    this.setState("checked", e.checked);


    this.addEventListener("mousedown", function(e) {
      that.checked = !that.checked;

      e.preventDefault();
    });

    this.removeAllStateListeners("focused");
    
    this.setState("label", null);
    this.addStateListener("label", function(label) {
      if (label && (label.tagName + "").toLowerCase() === "label") {
        function onClickLabel(e) {
          that.checked = !that.checked;
          that.focused = true;

          e.preventDefault();
        }
        
        // Add listener and component reference
        label.addEventListener("mousedown", onClickLabel);
        label.component = that;
      }
    });
    
    if (e && e.id) {
      // Add component reference to reference element
      e.component = this;
      
      // Check for associated labels
      var labels = LCESLoopLabels();
      
      if (labels[e.id]){
        this.label = labels[e.id];
      }
    }
  }

  jSh.inherit(lcCheckBox, lcTextField);
  
  window.lcToggleField = function(e) {
    lcWidget.call(this, jSh.d(".lces-togglebox", undf, [
      jSh.d(".lces-togglebox-handle", undf, jSh.d(".lces-togglebox-inner", undf, [
        jSh.d(".lces-togglebox-text", "OFF")
      ]))
    ]));
    
    this.type = "LCES Toggle Field";
    var that = this;
    var text = this.jSh(".lces-togglebox-text")[0];
    var main = this.element;
    
    main.tabIndex = 0;
    main.addEventListener("keyup", function(e) {
      if (e.keyCode === 32) {
        that.checked = !that.checked;
        e.preventDefault();
      }
    });
    
    main.addEventListener("keydown", function(e) {
      if (e.keyCode === 32)
        e.preventDefault();
    });
    
    this.setState("checked", null);
    this.addStateListener("checked", function(checked) {
      if (checked) {
        that.element.classList.add("checked");
        text.innerHTML = "ON";
        
      } else {
        that.element.classList.remove("checked");
        text.innerHTML = "OFF";
      }
    });
    
    this.addEventListener("click", function() {
      that.checked = !that.checked;
      
      main.focus();
    });
    
    this.addEventListener("mousedown", function(e) {
      e.preventDefault();
    });
    
    // Check for reference element
    if (e) {
      var checked = e.getAttribute("checked");
      var refID   = e.getAttribute("id");
      
      if (checked !== null && checked.toLowerCase() !== "false")
        this.checked = true;
      else
        this.checked = false;
      
      if (typeof refID === "string" && refID.trim()) {
        var labels = LCESLoopLabels();
        
        if (labels[refID])
          labels[refID].addEventListener("click", function() {
            that.checked != that.checked;
          });
      }
      
      e.parentNode.insertBefore(this.element, e);
      this.parent.removeChild(e);
    } else {
      this.checked = false;
    }
  }
  
  jSh.inherit(lcToggleField, lcCheckBox);
  
  // -------------
  // LCES Dropdown
  // -------------
  
  var uiddown = new lcComponent();
  lces.ui.dropdown = jSh.extendObj(uiddown, {
    // options: {}, TODO: Check if required
    optionCount: 0,
    
    display: null,
    screen: new lcWidget(jSh.d(".lces-dropdown-screen.lces-themify")),
    screenSet: false,
    
    cancelHide: function(e) {
      e.preventDefault();
      uiddown.screenVisible = false;
    },
    show: function(ddown) {
      this.active = ddown;
      
      this.screenVisible = true;
    },
    hide: function() {
      this.screenVisible = false;
      
      if (this.active.highlightedOption !== this.active.selectedOption)
        this.active.selectedOption = this.active.highlightedOption;
    }
  });
  
  uiddown.addStateListener("active", function(ddown) {
    var screen = uiddown.screen;
    
    // Remove current options and append new ones
    uiddown.display.removeAllOptions();
    uiddown.display.options = ddown.options;
    uiddown.display.optionsContainer.append(ddown.options.map(o => o[2]));
    
    uiddown.display.selectedDisplay.html = ddown.selectedDisplay.html;
    uiddown.display.updateDropdownSize();
    
    uiddown.display.style.width = getComputedStyle(ddown.element)["width"];
  });
  
  uiddown.addStateListener("screenVisible", function(visible) {
    var ddown   = uiddown.active;
    var display = uiddown.display;
    var screen  = uiddown.screen;
    
    if (visible) {
      screen.classList.add("visible");
      
      var cRect = ddown.element.getBoundingClientRect();
      display.style = {
        top: cRect.top + "px",
        left: cRect.left + "px"
      }
      display.classList.add("visible");
      display.checkFlipped();
    } else {
      display.classList.remove("visible");
      
      setTimeout(function() {
        screen.classList.remove("visible");
      }, 260);
    }
  });
  
  uiddown.screen.addEventListener("mouseover", function(e) {e.preventDefault()});
  uiddown.screen.addEventListener("wheel", uiddown.cancelHide);
  uiddown.screen.addEventListener("click", function(e) {
    var target = e.target || e.srcElement;
    
    while (target !== this) {
      var targetId = target.getAttribute("lces-dropdown-option-id");
      
      if (targetId) {
        uiddown.active.selectOption(targetId);
        uiddown.active.element.focus();
        break;
      }
      
      target = target.parentNode;
    }
    
    uiddown.hide();
  });
  
  // Create screen dummy dropdown
  lces.addInit(function() {
    uiddown.screen.parent = document.body;
    uiddown.screenSet = true;
    
    uiddown.display = new lcDropDown(null, true);
    uiddown.display.parent = uiddown.screen;
  }, 2);
  
  window.lcDropDownOption = function(value, content, dropdown) {
    lcWidget.call(this, jSh.d(".lcesoption"));
    
    var that   = this;
    this.type  = "LCES Option Widget";
    this.value = value;
    this.opId  = uiddown.optionCount++;
    
    this.setAttr("lces-dropdown-option-id", this.opId);
    
    // Check content type
    if (jSh.type(content) === "array")
      this.append(content);
    else
      this.append(this._determineType(content));
    
    this.setState("selected", false);
    this.addStateListener("selected", function(state) {
      if (state) {
        that.highlighted = true;
        
        // Unselect the previous option
        var oldOption = dropdown.states["selectedOption"].oldStateStatus;
        if (oldOption)
          oldOption.selected = false;
      } else {
        that.highlighted = false;
      }
    });
    
    this.setState("highlighted", false);
    this.addStateListener("highlighted", function(state) {
      if (state)
        that.element.setAttribute("lces-selected", "");
      else
        that.element.removeAttribute("lces-selected");
    });
  }
  
  jSh.inherit(lcDropDownOption, lcWidget);
  
  window.lcDropDown = function(e, screenDummy) {
    lcTextField.call(this, jSh.d(".lcesdropdown", undf, [
      jSh.d(".lcesdropdown-arrow", undf, [
        jSh.svg(undf, 10, 5, [
          jSh.path(undf, "m0 0 10 0-5 5z", "fill: #fff;")
        ])
      ])
    ], screenDummy ? undf : {tabindex: 0}));

    var that = this;
    this.type = "LCES DropDown Widget";
    
    this.options = [];
    this.setState("selectedOption", false);
    
    // Check for refElement
    if (e)
      this.selectElement = e;
    
    // Create necessary elements
    this.selectedDisplay = new lcWidget(jSh.d("lcesselected"));
    this.appendChild(this.selectedDisplay);
    
    // Check if the designated screen dropdown
    if (screenDummy) {
      this.optionsContainer = new lcWidget(jSh.d("lcesoptions"));
      this.appendChild(this.optionsContainer);
      
      // Events for displaying options
      function onWindowScroll() {
        checkFlipped();
      }
      
      // Event for knowing if menu goes below the viewport
      this.setState("flipped", false);
      this.addStateListener("flipped", function(flipped) {
        that.classList[flipped ? "add" : "remove"]("flipped");
      });
      
      this.checkFlipped = function() {
        var displayState = that.optionsContainer.style.display;
        that.optionsContainer.style.display = "inline-block";
        var height = that.optionsContainer.element.offsetHeight;
        var bottom = innerHeight - that.element.getBoundingClientRect().bottom;
        
        that.optionsContainer.style.display = displayState;
        if (height > bottom)
          that.flipped = true;
        else
          that.flipped = false;
      }
      
      this.setState("menuvisible", false);
      this.addStateListener("menuvisible", function(state) {
        if (state) {
          checkFlipped();
          window.addEventListener("scroll", onWindowScroll);
          
          that.optionsContainer.style.display = "inline-block";
          that.classList.add("visible");
        } else {
          window.removeEventListener("scroll", onWindowScroll);
          that.classList.remove("visible");
        }
      });
    }
    
    // State listeners
    this.setState("value", null);
    this.addStateListener("value", function(value) {
      value = value + "";
      
      var option = null;
      that.options.forEach(function(i) {
        if (i[0].substr(0, i[0].length - 2) === value)
          option = i[2];
      });
      
      that.selectedOption = option;
      
      if (e)
        e.value = value;
    });
    
    // Disable annoying default browser functionality
    this.addEventListener("mousedown", function(e) {
      e.preventDefault();
      
      if (!screenDummy) {
        that.element.focus();
        uiddown.show(that);
      }
    });
    
    // Normal dropdown
    if (!screenDummy) {
      that.addEventListener("keydown", function(e) {
        var cancel = false;
        
        // Space/Enter Key - Open dropdown
        if (e.keyCode === 32 || e.keyCode === 13) {
          if (!uiddown.screenVisible)
            uiddown.show(that);
          else
            uiddown.hide();
          
          cancel = true;
          
        // Tab Key - Close dropdown
        } else if (e.keyCode === 9) {
          uiddown.hide();
          
        // Up/Down Arrow Key - Highlight different options
        } else if (e.keyCode === 38 || e.keyCode === 40) {
          var hOption = that.highlightedOption;
          var nextOption;
          
          if (e.keyCode === 38)
            nextOption = that.options[hOption.opIndex - 1];
          else
            nextOption = that.options[hOption.opIndex + 1];
          
          if (nextOption)
            that.highlightedOption = nextOption[2];
          
          cancel = true;
          
        // Esc key - Cancel arrowkey selection and close dropdown
        } else if (e.keyCode === 27) {
          that.highlightedOption = that.selectedOption;
          uiddown.hide();
          
          cancel = true;
        }
        
        if (cancel)
          e.preventDefault();
      });
      
      this.addStateListener("highlightedOption", function(option) {
        if (this.oldStateStatus)
          this.oldStateStatus.highlighted = false;
        
        option.highlighted = true;
      });
      
      this.addStateListener("selectedOption", function(option) {
        if (!option) {
          that.selectedDisplay.html = "&nbsp;";
          return false;
        }
        
        that.selectedDisplay.html = option.html;
        that.value = option.value;
        option.selected = true;
        
        // Update highlightedOption if not already
        that.highlightedOption = option;
      });
      
      // When focused by lces.focus
      this.removeAllStateListeners("focused");
      this.addStateListener("focused", function(state) {
        this.component.menuvisible = state;
      });
      
      this.setState("menuvisible", false);
      this.addStateListener("menuvisible", function(mvisible) {
        if (mvisible) {
          uiddown.show(this);
        } else {
          uiddown.hide();
        }
      });
      
      this.selectOption = function(id) {
        this.selectedOption = this.options[id + "id"];
      }
    }
    
    // Update size when new options added/removed
    var longestOptionSize = 0;
    var ph = jSh.ph();
    
    this.updateDropdownSize = function() {
      longestOptionSize = 0;
      
      // Put in body element to ensure the browser renders it
      ph.substitute(this);
      document.body.appendChild(this.element);
      
      this.selectedDisplay.style = {width: "auto"};
      var displayValue = this.selectedDisplay.html;
      
      this.options.forEach(function(option) {
        that.selectedDisplay.html = option[1];
        
        var newWidth = parseInt(getComputedStyle(that.selectedDisplay.element)["width"]) + 5;
        if (newWidth > longestOptionSize)
          longestOptionSize = newWidth;
      });
      
      // Set new width
      this.selectedDisplay.style = {width: (longestOptionSize + 3) + "px"};
      this.selectedDisplay.html = displayValue;
      
      // Put dropdown back in it's place
      ph.replace(this);
    }
    
    // LCES DROPDOWN METHODS
    // ---------------------
    
    // Add option
    this.addOption = function(value, content) {
      var newOption = new lcDropDownOption(value, content, this);
      
      this.options.push([value + "op", newOption.html, newOption]);
      this.options[value + "op"] = newOption;
      this.options[newOption.opId + "id"] = newOption;
      
      // Add option index
      newOption.opIndex = this.options.length - 1;
      
      if (this.options.length === 0)
        this.selectedOption = newOption;
      that.updateDropdownSize();
      
      return newOption;
    }
    
    // Remove option
    this.removeOption = function(option) {
      var index   = typeof option === "number" ? option : null;
      var value   = typeof option === "string" ? option : null;
      var element = index === null && value === null ? this._determineType(option) : null;
      
      var removeOptions = [];
      
      if (index !== null) {
        removeOptions.push([this.options[index], index]);
      } else {
        this.options.forEach(function(opt, i) {
          if (value !== null) {
            if (value.toLowerCase() == opt[0])
              removeOptions.push([opt, i]);
          } else {
            if (element && element.component === opt[2])
              removeOptions.push([opt, i]);
          }
        });
      }
      
      removeOptions.forEach(function(i) {
        if (i[0]) {
          that.options.splice(i[1], 1);
          that.options[i[0].value + "op"] = undf;
          that.options[i[0].opId + "id"] = undf;
          
          if (that.selectedOption === i[0][2])
            that.selectedOption = that.options[0][2];
        }
      });
      
      // Update option option indexes
      for (var i=0,l=this.options.length; i<l; i++) {
        this.options[i][2].opIndex = i;
      }
      
      that.updateDropdownSize();
    }
    
    this.removeAllOptions = function() {
      that.options = [];
      that.value   = null;
      
      if (screenDummy)
        that.optionsContainer.remove(that.optionsContainer.children);
      else
        that.updateDropdownSize();
    }
    
    // Check for refElement and options
    if (e) {
      if (e.parentNode)
        e.parentNode.insertBefore(this.element, this.selectElement);
      
      // Add options
      var endValue = null;
      
      // Loop option elements
      if (e.tagName.toLowerCase() === "select") {
        var refOptions = jSh(e).jSh("option");
        
        refOptions.forEach(function(i, index) {
          var newOption = that.addOption(i.value, jSh.toArr(i.childNodes));
          
          if (i.value == e.value || index === 0)
            endValue = newOption;
        });
      } else if (e.tagName.toLowerCase() === "lces-widget") {
        var refOptions = jSh(e).jSh("lces-option");
        
        refOptions.forEach(function(option, index) {
          var valueAttr    = option.getAttribute("value");
          var selectedAttr = option.getAttribute("selected") !== null && option.getAttribute("selected") !== "false";
          
          var value = valueAttr || "value" + that.options.length;
          var newOption = that.addOption(value, jSh.toArr(option.childNodes));
          
          if (selectedAttr || index === 0)
            endValue = newOption;
        });
      }
      
      this.selectedOption = endValue;
      
      // End refElement
      e.style.display = "none";
    }
    
    // End
    var selectedOption = this.selectedOption;
    this.value = undefined;
    this.value = selectedOption ? selectedOption.value : "";
  }
  
  jSh.inherit(lcDropDown, lcTextField);
  
  // -----------------
  // LCES Table Widget
  // -----------------
  
  window.lcTHead = function() {
    lcWidget.call(this, jSh.c("thead"));
  }

  window.lcTBody = function() {
    lcWidget.call(this, jSh.c("tbody"));
  }

  window.lcTHeading = function(e) {
    lcWidget.call(this, e || jSh.c("th"));
  }

  window.lcTRow = function(e) {
    lcWidget.call(this, e || jSh.c("tr"));
  }

  window.lcTCol = function(e) {
    lcWidget.call(this, e || jSh.c("td"));
  }
  
  jSh.inherit(lcTHead, lcWidget);
  jSh.inherit(lcTBody, lcWidget);
  jSh.inherit(lcTHeading, lcWidget);
  jSh.inherit(lcTRow, lcWidget);
  jSh.inherit(lcTCol, lcWidget);
  
  window.lcTable = function(e) {
    lcWidget.call(this, e || jSh.c("table", "lces"));
    var that = this;
    
    this.thead = new lcTHead();
    this.tbody = new lcTBody();
    
    this.thead.parent = this;
    this.tbody.parent = this;
    
    this.rows = [];
    this.headings = [];
    
    this._addItem = function(src, dst, dstArray) {
      var child = this._determineType(src);
      
      dst.appendChild(child);
      dstArray.push(src);
    }
    
    this.addRow = function(content, dontAdd) {
      var newRow = new lcTRow();
      content.forEach(function(i) {
        newRow.appendChild(new lcTCol(jSh.c("td", undf, undf, that._determineType(i))));
      });
      
      newRow.cols = newRow.children;
      
      if (!dontAdd)
        this._addItem(newRow, this.tbody, this.rows);
      
      this._checker();
      return newRow;
    }
    
    this.insertBefore = undefined;
    this.insertBeforeRow = function(content, row) {
      var newRow = this.addRow(content, true);
      
      if (typeof row === "number")
        var oldRow = this.rows[row];
      else
        var oldRow = this._determineType(row).component;
      
      if (!oldRow)
        throw TypeError("Row " + row + " is invalid");
      if (this.rows.indexOf(oldRow) === -1)
        throw ReferenceError("Row " + row + " isn't a descendant");
      
      
      this.tbody.element.insertBefore(newRow.element, oldRow.element);
      this.rows.splice(this.rows.indexOf(row), 0, newRow);
      
      this._checker();
      return newRow;
    }
    
    this.removeRow = function(targetRow) {
      // Retrieve row and check for it's integrity
      if (typeof targetRow === "number") {
        var row = this.rows[targetRow];
        
        if (!row)
          throw ReferenceError("Out of bounds index for row");
      } else {
        var row = this._determineType(targetRow).component;
        
        if (!row)
          throw TypeError("Row " + row + " is invalid");
        if (this.rows.indexOf(row) === -1)
          throw ReferenceError("Row " + row + " isn't a descendant");
      }
      
      // FIXME: Add some pretty collapse effect here or sumthin'
      this.rows.splice(this.rows.indexOf(row), 1);
      this.tbody.removeChild(row.element);
      
      this._checker();
    }
    
    this.setHeadings = function(headings) {
      this.headings.forEach(function(i) {
        that.removeHeading(i);
      });
      
      var newHeadings = [];
      
      headings.forEach(function(i) {
        newHeadings.push(that.addHeading(i));
      });
      
      return newHeadings;
    }
    
    this.addHeading = function(content) {
      var newHead = new lcTHeading();
      newHead.appendChild(this._determineType(content));
      
      this._addItem(newHead, this.thead, this.headings);
      return newHead;
    }
    
    this.removeHeading = function(head) {
      if (typeof head === "number") {
        head = this.headings[head];
      } else {
        head = this._determineType(head).component;
      }
      
      if (!head)
        return;
      
      var index = this.headings.indexOf(head);
      
      if (index !== -1)
        this.headings.splice(index, 1);
      
      this.thead.removeChild(head.element);
    }
    
    this.removeAllHeadings = function() {
      this.headings = [];
      
      while(this.thead.getChild(0)) {
        this.thead.removeChild(this.thead.getChild(0));
      }
    }
    
    this.removeAllRows = function() {
      this.rows = [];
      
      if (this.tbody)
        while(this.tbody.getChild(0)) {
          this.tbody.removeChild(this.tbody.getChild(0));
        }
    }
    
    
    this.addStateListener("width", function(width) {
      that.element.width = width;
    });
    this.states["width"].get = function() {return that.element.width;};
    
    this.addStateListener("height", function(height) {
      that.element.height = height;
    });
    this.states["height"].get = function() {return that.element.height;};
    
    
    this._checker = function() {
      var skip = 0;
      
      this.tbody.children.forEach(function(i, index) {
        if (i.skipChecker) {
          skip += 1;
          return;
        }
          
        if ((index - skip) % 2 === 0)
          i.removeAttribute("checker");
        else
          i.setAttribute("checker", "");
      });
    }
  }

  jSh.inherit(lcTable, lcWidget);

  // Extra UI abstraction components

  // Accordion
  window.lcAccordionSection = function(title, contents, onClick, refElm) {
    lcWidget.call(this, jSh.d("lces-acc-section", undf, [
      jSh.d("lces-acc-title"),
      jSh.d("lces-acc-contents")
    ]));
    
    var that = this;
    
    var titleElement   = this.element.getChild(0);
    var contentElement = this.element.getChild(1);
    
    this.contents = contentElement;
    this.contents.appendChild(jSh.d());
    
    // Add arrow
    titleElement.appendChild(jSh.d("lces-acc-arrow", undf, jSh.svg(undf, 15, 15, [
      jSh.path(undf, "M3.8 1.9L3.8 7.5 3.8 13.1 7.5 10.3 11.3 7.5 7.5 4.7 3.8 1.9z")
    ])));
    
    // Add content
    if (title) {
      title = typeof title === "string" ? jSh.t(title) : title;
      
      titleElement.appendChild(title);
    } else {
      titleElement.appendChild(jSh.c("span", undf, ih("&nbsp;")));
    }
    
    if (contents) {
      contents = typeof contents === "string" ? jSh.t(contents) : contents;
      
      contentElement.getChild(0).appendChild(contents);
    }
    
    // Add event handlers
    this.setState("open", false);
    this.addStateListener("open", function(open) {
      if (open) {
        that.classList.add("lces-acc-open");
        
        that.contents.style.height = (that.accordion.sectionHeight || that.height) + "px";
      } else {
        that.classList.remove("lces-acc-open");
        
        that.contents.style.height = "0px";
      }
    });
    
    titleElement.addEventListener("click", function() {
      if (that.open && that.accordion.sectionsCloseable)
        that.open = false;
      else
        that.open = true;
      
      if (typeof onClick === "function")
        onClick();
    });
    
    if (refElm) {
      var attrOpen = (refElm.getAttribute("open") + "").toLowerCase();
      
      this._initCallback = function() {
        if (attrOpen)
          this.open = true;
      }
    }
  }

  window.lcAccordion = function(e) {
    lcWidget.call(this, jSh.d("lces-accordion"));
    
    var that = this;
    
    // this.sections = [];
    this.sectionHeight = 250;
    this.sectionsCloseable = false;
    
    this.sectionsGroup = new lcGroup();
    this.sectionsGroup.setState("open", true);
    this.sectionsGroup.setExclusiveState("open", true, 1);
    
    var sectionCallbacks = [];
    
    this.addSection = function(title, contents, onClick, refElm) {
      var newSection = new lcAccordionSection(title, contents, onClick, refElm);
      
      if (typeof newSection._initCallback === "function")
        sectionCallbacks.push(newSection._initCallback.bind(newSection));
      
      this.sectionsGroup.addMember(newSection);
      this.appendChild(newSection);
      
      newSection.accordion = this;
    }
    
    this.removeSection = function(section) {
      section = this.determineSection(section);
      
      if (!section)
        return null;
      
      this.sectionsGroup.removeMember(section);
      this.removeChild(section);
    }
    
    this.removeAllSections = function() {
      while (this.getSection(0))
        this.removeSection(0);
    }
    
    this.getSection = function(i) {
      return this.sectionsGroup.members[i];
    }
    
    this.determineSection = function(section) {
      if (section instanceof lcAccordionSection)
        return section;
      
      if (typeof section === "number")
        return that.sectionsGroup.members[section];
      
      if (section instanceof Node && section.component instanceof lcAccordion)
        return section.component;
      
      // Undetermined
      return null;
    }
    
    that.setState("maxOpen", 1);
    that.addStateListener("maxOpen", function(maxOpen) {
      that.sectionsGroup.exclusiveMembers["open"].memberLimit = !isNaN(maxOpen) && parseInt(maxOpen) >= 1 ? parseInt(maxOpen) : 1;
    });
    
    // Check for reference
    if (e) {
      if (e.parentNode)
        e.parentNode.insertBefore(this.element, e);
      
      // Check for predefined section height
      if (!isNaN(e.getAttribute("section-height")) && parseInt(e.getAttribute("section-height")) > 50)
        this.sectionHeight = parseInt(e.getAttribute("section-height"));
      
      // Check for predefined maxOpen
      if (!isNaN(e.getAttribute("max-open")) && parseInt(e.getAttribute("max-open")) >= 1)
        this.maxOpen = parseInt(e.getAttribute("max-open"));
      
      if (e.getAttribute("closeable") !== null)
        this.sectionsCloseable = true;
      
      // Add sections
      var refSections = e.jSh("lces-section");
      
      refSections.forEach(function(i) {
        var title = i.jSh("lces-title")[0];
        
        if (title)
          i.removeChild(title);
        
        that.addSection(title && title.childNodes[0] ? jSh.toArr(title.childNodes) : null, jSh.toArr(i.childNodes), null, i);
      });
      
      // Cleanup
      e.parentNode.removeChild(e);
    }
    
    sectionCallbacks.forEach(function(i) {
      i();
    });
  }

  jSh.inherit(lcAccordion, lcWidget);
  jSh.inherit(lcAccordionSection, lcWidget);

  // Append the widgets to the lces.types
  jSh.extendObj(lces.types, {
    "dropdown": lcDropDown,
    "checkbox": lcCheckBox,
    "togglefield": lcToggleField,
    // "radio":
    "textfield": lcTextField,
    "textarea": lcTextArea,
    "slider": lcSlider,
    "numberfield": lcNumberField,
    "fileinput": lcFileInput,
    "table": lcTable,
    
    "accordion": lcAccordion
  });
}
// LCES Widget Effects

function lcOnEffectFade(e) {
  
}

function lcEffectFade() {
  var that = this;
  
  if (!this.element) {
    console.warn("Component has no element.");
    
    return false;
  }
  
  
}
lces.rc[7] = function() {
  // LCES Windows

  lces.ui.Windows = [];
  window.lcWindow = function(e, name) {
    lcWidget.call(this, e ? e.getElementsByClassName(".lces-window-contents")[0] : jSh.d(".lces-window-contents"));
    var that = this;
    
    this.windowID = lces.ui.Windows.length;
    lces.ui.Windows.push(this);
    
    // Array to contain the buttons
    this.buttons = [];
    
    // For "draggable" and "centered" LCES states, relative from the viewport
    this.borderOffset = 20;
    
    // Get or create the window element
    if (!e) {
      // Create the window with no reference provided
      this.container = jSh.d("lces-window", undf, jSh.d(undf, undf, jSh.d(undf, undf, [
        jSh.d("lces-window-title", name || "Window " + this.windowID),
        this.element,
        jSh.d("lces-window-buttonpanel")
      ])));
      
      jSh("#lces-windowcontainer").appendChild(this.container);
      
    } else {
      // Create the window from a reference
      e = jSh(e);
      
      var className    = e.getAttribute("class");
      var windowHTMLId = e.getAttribute("id");
      
      var lcesTitle   = e.jSh("lces-title")[0];
      var lcesContent = e.jSh("lces-contents")[0];
      var lcesButtons = e.jSh("lces-buttons")[0];
      
      if (lcesContent) {
        jSh.toArr(lcesContent.childNodes).forEach(function(i) {
          that.element.appendChild(i);
        });
      }
      
      if (lcesButtons) {
        this.buttons = lcesButtons.jSh("button");
      }
      
      this.container = jSh.d("lces-window", undf, jSh.d(undf, undf, jSh.d(undf, undf, [
        jSh.d("lces-window-title", (lcesTitle ? " " : null) || name || "Window " + this.windowID, lcesTitle ? jSh.toArr(lcesTitle.childNodes) : undf),
        this.element,
        jSh.d("lces-window-buttonpanel", undf, lcesButtons ? jSh.toArr(lcesButtons.childNodes) : undf)
      ])));
      
      jSh("#lces-windowcontainer").appendChild(this.container);
      
      // Cleanup
      e.parentNode.removeChild(e);
      
      // Set classnames and id if any
      if (className) {
        className = className.split(" ");
        className.forEach(function(i) {
          that.container.classList.add(i);
        });
      }
      
      if (windowHTMLId)
        this.container.id = windowHTMLId;
    }
    
    // Add window contents class
    this.classList.add("lces-window-contents");
    
    this._title = this.container.getElementsByClassName("lces-window-title")[0];
    this._buttonpanel = this.container.getElementsByClassName("lces-window-buttonpanel")[0];
    
    // Wrapping divs
    var wrap1 = this.container.getChild(0);
    var wrap2 = wrap1.getChild(0);
    
    // LCES Window Component Properties
    this.setState("title", name || "Window " + this.windowID);
    this.addStateListener("title", function(title) {
      that._title.innerHTML = title;
    });
    
    this.setState("titleVisible", true);
    this.addStateListener("titleVisible", function(visible) {
      that._title.style.display = visible ? "block" : "none";
      
      if (visible)
        that.container.classList.add("lces-window-titlevisible");
      else
        that.container.classList.remove("lces-window-titlevisible");
    });
    
    this.setState("buttonPanelVisible", true);
    this.addStateListener("buttonPanelVisible", function(visible) {
      that._buttonpanel.style.display = visible ? "block" : "none";
      
      if (visible)
        that.container.classList.add("lces-window-buttonsvisible");
      else
        that.container.classList.remove("lces-window-buttonsvisible");
    });
    
    this.container.classList.add("lces-window-titlevisible");
    this.container.classList.add("lces-window-buttonsvisible");
    
    // LCES Window Button manipulation functions
    this.addButton = function(text, onClick) {
      var button = new lcWidget(jSh.c("button", undf, text));
      
      if (typeof onClick === "function") {
        button.addEventListener("click", onClick);
      }
      
      this.buttons.push(button);
      this._buttonpanel.appendChild(button.element);
      
      return button;
    }
    
    this.removeButton = function(button) {
      if (this.buttons.indexOf(button) === -1)
        return false;
      
      this.buttons.splice(this.buttons.indexOf(button), 1);
      this._buttonpanel.removeChild(button.element);
    }
    
    // Add draggable functionality with the title as the anchor and the container as the target
    lcDraggable.call(
      this,
      this.container.getChild(0).getChild(0).getChild(0),
      this.container,
      true // True to enable optimizations for lcWindow
    );
    
    // Window fade in effect
    // onTransitionEnd(this.container, function(e) {
    //   if (e.propertyName == "opacity" && getComputedStyle(this)["opacity"] == 0)
    //     that.container.setAttribute("window-invisible", "");
    // });
    
    this._closingTimeout = null;
    var container = this.container;
    
    this.setState("visible", false);
    this.addStateListener("visible", function(visible) {
      var container = that.container;
      
      if (visible) {
        if (that._closingTimeout !== undf)
          clearTimeout(that._closingTimeout);
        
        container.removeAttribute("window-invisible");
        
        container.setAttribute("visible", "");
      } else {
        container.removeAttribute("visible");
        
        if (that._closingTimeout !== undf) {
          that._closingTimeout = setTimeout(function() {
            container.setAttribute("window-invisible", "");
          }, 420);
        }
      }
    });
    
    this.container.component = this;
    this.visible = true;
    
    this.onWinResize = function() {
      that.update();
    }
    
    this.update = function() {
      if (this.centered)
        this._center();
    }
    
    this._center = function() {
      var top = ((innerHeight - this.container.offsetHeight) / 2);
      top = top < this.borderOffset ? this.borderOffset : top;
      var left = ((innerWidth - this.container.offsetWidth) / 2);
      
      // Center with GPU
      this.container.style.transform = `translate3d(${left}px, ${top}px, 0px)`;
      
      // The old way of centering:
      // this.container.style.left = ((innerWidth - this.container.offsetWidth) / 2) + "px";
      // this.container.style.top = top + "px";
    }
    
    this.setState("centered", false);
    this.addStateListener("centered", function(centered) {
      if (centered) {
        that.update();
        window.addEventListener("resize", that.onWinResize);
      } else
        window.removeEventListener("resize", that.onWinResize);
    });
    
    this.setState("width", 1);
    this.addStateListener("width", function(width) {
      var suffix = typeof width === "string" ? width.substr(-1) : null;
      width = !width ? width : parseInt(width);
      
      if (suffix !== "%")
        suffix = null;
      
      if (!width || isNaN(width) || width < 0) {
        that.style.width = "auto";
        this.stateStatus = "auto";
      } else {
        that.style.width = suffix ? "100%" : width + "px";
        
        var contWidth = suffix ? width + suffix : "auto";
        that.container.style.width = contWidth;
        wrap1.style.width = contWidth;
        wrap2.style.width = contWidth;
        
        this.stateStatus = width;
      }
    });
    
    this.setState("height", 1);
    this.addStateListener("height", function(height) {
      var suffix = typeof height === "string" ? height.substr(-1) : null;
      height = !height ? height : parseInt(height);
      
      if (suffix !== "%")
        suffix = null;
      
      if (!height || isNaN(height) || height < 0) {
        that.style = {
          height: "auto",
          overflow: "initial"
        };
        
        this.stateStatus = "auto";
      } else {
        that.style.height = suffix ? "100%" : height + "px";
        that.style.overflow = "auto";
        
        var contHeight = suffix ? height + suffix : "auto";
        that.container.style.height = contHeight;
        wrap1.style.height = contHeight;
        wrap2.style.height = contHeight;
        
        this.stateStatus = height;
      }
    });
    
    // Normalize the dimensions
    this.width  = null;
    this.height = null;
    
    // Check for properties in the attributes
    if (e) {
      // Get attributes
      var attrVisible   = ((e.getAttribute("lces-visible") || e.getAttribute("visible")) + "").toLowerCase();
      var attrTitleV    = (e.getAttribute("title-visible") + "").toLowerCase();
      var attrButtonsV  = (e.getAttribute("buttonpanel-visible") + "").toLowerCase();
      
      var attrCentered  = e.getAttribute("centered");
      var attrDraggable = e.getAttribute("draggable");
      var attrWidth     = e.getAttribute("width");
      var attrHeight    = e.getAttribute("height");
      
      
      // Check for visible property
      if (attrVisible && (attrVisible == "false" || attrVisible == "true")) {
        this.visible = attrVisible == "true";
        // this.container.style.display = this.visible ? "fixed" : "none"; // It just DON'T work man.
        
        if (this.visible)
          that.container.setAttribute("visible", "");
        else
          this.container.setAttribute("window-invisible", "");
      } else {
        this.visible = false;
        this.container.setAttribute("window-invisible", "");
      }
      
      // Check for draggable property
      if (attrDraggable !== null) {
        this.draggable = true;
      }
      
      // Check for width property
      if (attrWidth !== null) {
        this.width = e.getAttribute("width");
      }
      
      // Check for height property
      if (attrHeight !== null) {
        this.height = e.getAttribute("height");
      }
      
      // Check for title option
      if (attrTitleV === "false") {
        this.titleVisible = false;
      }
      
      // Check for button panel option
      if (attrButtonsV === "false") {
        this.buttonPanelVisible = false;
      }
      
      // Check for centered property
      if (attrCentered !== null) {
        this.centered = true;
      }
      
    } else {
      this.visible = false;
      this.container.setAttribute("window-invisible", "");
    }
  }

  jSh.inherit(lcWindow, lcWidget);


  // LCES Notifications

  window.lcNotification = function(msgText, delay, align, arg4, arg5) {
    lcWindow.call(this);
    var that = this;
    
    // Add dynText
    this.dynTextTrigger = "text"; // When the text state changes DynText will recompile
    lcDynamicText.call(this);
    
    // Update on dynText property change
    var updateHeightOnVisible = false;
    this.on("dynpropchange", function() {
      if (that._updateNotifiHeight)
        that._updateNotifiHeight();
    });
    
    // Remove/replace some LCES window features
    this.container.classList.add("lces-notification");
    this.buttonPanelVisible = false;
    this.titleVisible = false;
    
    // Set the notifi styling
    this.style = {
      padding: "10px 15px",
      color: "#545454",
      textAlign: "left",
      fontSize: "14px"
    }
    
    function checkMsg(msgText) {
      if (jSh.type(msgText) === "string") {
        this.setState("message", jSh.d(undf, msgText));
        
      } else if (msgText instanceof Node) {
        this.setState("message", msgText);
        
      } else if (jSh.type(msgText) === "array") {
        var cont = jSh.d();
        
        msgText.forEach(function(i) {cont.appendChild(i);});
        this.setState("message", cont);
        
      } else {
        this.setState("message", jSh.d(undf, msgText ? msgText.toString() : msgText));
      }
    }
    var checkMsg = checkMsg.bind(this);
    
    checkMsg(msgText);
    this.appendChild(this.message);
    
    // Check for dynText involvement
    if (jSh.type(msgText) === "string") {
      this.text = msgText;
    }
    
    
    if (jSh.type(delay) === "object") { // Delay is an args Object
      align   = (typeof delay.align === "string" ? delay.align : "BL").toUpperCase();
      onClick = typeof delay.onClick === "function" ? delay.onClick : null;
      delay   = typeof delay.delay === "number" || delay.delay === null ? delay.delay : 1000;
    }
    
    this.delay = delay;
    
    // Validate alignment argument
    var yTest = /(?:^|[^])+([TBM])(?:[^]|$)+/i;
    this.ypos = !yTest.test(align) ? "B" : align.replace(yTest, "$1");
    
    var xTest = /(?:^|[^])+([LRC])(?:[^]|$)+/i;
    this.xpos = !xTest.test(align) ? "L" : align.replace(xTest, "$1");
    
    // Test for relative alignment
    this.relAnchor         = arg4;
    this.relativeAlignment = null;
    this.relOffsetFactor   = null;
    this.relAlignFixed     = null;
    
    var rTest  = /^R[TRBL](\d+(?:\.\d+)?)?$/i;
    var rAlign = /^R([TRBL])(?:\d+(?:\.\d+)?)?$/i;
    var onClick;
    
    if (rTest.test(align)) {
      if (this.relAnchor instanceof Node) {
        this.relativeAlignment = align.replace(rAlign, "$1") ? align.replace(rAlign, "$1") : "B";
        this.relOffsetFactor   = !align.replace(rTest, "$1") || isNaN(align.replace(rTest, "$1")) ? 0.5 : parseFloat(align.replace(rTest, "$1"));
        
        this.xpos = "R";
        this.ypos = "R";
        
        // Check if the anchor's fixed
        this.relAlignFixed = this.checkRelFixed(this.relAnchor);
        
        // Set the notifi container's CSS position
        this.container.style.position = this.relAlignFixed ? "fixed" : "absolute";
        
        // Get Notifi width and height
        this.notifiWidth = this.container.offsetWidth;
        this.notifiHeight = this.container.offsetHeight;
      }
      
      onClick = arg5;
    } else {
      onClick = arg4;
    }
    
    // End relative alignment block
    
    // Add click event handler if any
    if (onClick) {
      this.addEventListener("click", function() {
        if (onClick && typeof onClick === "function")
          onClick();
      });
      
      // Show users it's clickable
      this.container.style.cursor = "pointer";
    }
    
    
    // Hide notifi when opacity transition completes
    onTransitionEnd(this.container, function(e) {
      if (e.propertyName === "opacity" && getComputedStyle(this)["opacity"] == 0)
        this.parentNode.removeChild(this);
    });
    
    // Remove window visible state
    clearTimeout(this._closingTimeout);
    this._closingTimeout = undf;
    
    this.removeState("visible");
    this.setState("visible");
    
    var container = this.container;
    
    this._visibleTimeout = null;
    this._visibleAnim    = null;
    
    this.addStateListener("visible", function(visible) {
      clearTimeout(that._closingTimeout);
      
      var container = that.container;
      var lcesUI = lces.ui;
      
      // Set visible
      if (visible) {
        container.removeAttribute("window-invisible");
        
        // that.container.style.height = "auto";
        clearTimeout(that._visibleTimeout);
        
        // Add to notifi position container
        lcesUI.notifications.alignments[that.ypos][that.xpos].add(that);
        
        if (that.relativeAlignment) {
          // Set the relative offset
          that.updateRelPosition();
        }
        
        // Notifi fade in animation
        that._visibleAnim = setTimeout(function() {
          container.setAttribute("visible", "");
          container.getChild(0).style.height = that.renderedHeight;
          
          if (updateHeightOnVisible) {
            that._updateNotifiHeight();
            
            updateHeightOnVisible = false;
          }
        }, 0);
        
        // Closing countdown
        if (that.delay) {
          that._visibleTimeout = setTimeout(function() {
            that.visible = false;
          }, that.delay);
        }
        
      }
      // set invisible/remove notification
      else {
        // Fade out animation
        container.removeAttribute("visible");
        
        // Clear closing and anime countdown
        clearTimeout(that._visibleTimeout);
        clearTimeout(that._visibleAnim);
        
        if (getComputedStyle(that.container)["opacity"] == 0 && container.parentNode)
          container.parentNode.removeChild(container);
        
        var firstChild = container.getChild(0);
        
        firstChild.style.height = that.renderedHeight;
        firstChild.style.height = "1px";
      }
    });
    
    // // Close when transition completes
    // onTransitionEnd(this.container, function(e) {
    //   if (e.propertyName == "opacity" && getComputedStyle(this)["opacity"] == 0)
    //     that.container.parentNode.removeChild(that.container);
    // });
    
    this.toggle = function() { // Probably useless... Or not...
      this.visible = !this.visible;
    }
    
    // Addbutton method wrapper
    this.__addButton = this.addButton;
    this.addButton = function() {
      this.buttonPanelVisible = true;
      
      this.__addButton.apply(this, arguments);
    }
    
    // Add to notifi group manager
    lces.ui.notifications.addMember(this);
    
    // Placeholder for height measuring
    this._ph = jSh.ph().component;
    
    // Get height for expanding/collapsing animations
    this._updateNotifiHeight = function() {
      if (!that.visible) {
        updateHeightOnVisible = true;
        
        return;
      }
      
      if (this.container.parentNode)
        this._ph.substitute(this.container);
      
      // Append to body for guaranteed measurements
      document.body.appendChild(this.container);
      
      // Set temporary styling
      var oldStyle = getComputedStyle(this.container);
      this.container.style.display = "block";
      this.container.getChild(0).style.height = "auto";
      
      this.renderedHeight = getComputedStyle(this.container.getChild(0))["height"];
      
      // Put the notifi back where it was
      document.body.removeChild(this.container);
      
      if (this._ph.substituting)
        this._ph.replace(this.container);
    }
    
    this._updateNotifiHeight();
    
    // Remove from DOMTree
    if (this.container.parentNode)
      this.container.parentNode.removeChild(this.container);
    
    
    this.visible = false;
  }

  jSh.inherit(lcNotification, lcWindow);

  jSh.extendObj(lcNotification.prototype, {
    // The offset from the anchor element in relative alignment in pixels
    relativeOffset: 20,
    relAlignments: {
      "T": function(factor, notifiw, notifih, anchorw, anchorh) {
        return [factor * (anchorw - notifiw), -(notifih + this.relativeOffset)];
      },
      "B": function(factor, notifiw, notifih, anchorw, anchorh) {
        return [factor * (anchorw - notifiw), anchorh + this.relativeOffset];
      },
      "R": function(factor, notifiw, notifih, anchorw, anchorh) {
        return [anchorw + this.relativeOffset, factor * (anchorh - notifih)];
      },
      "L": function(factor, notifiw, notifih, anchorw, anchorh) {
        return [-(notifiw + this.relativeOffset), factor * (anchorh - notifih)];
      }
    },
    checkRelFixed: function(anchor) {
      var fixed  = false;
      var parent = anchor;
      
      while (parent !== document.body) {
        if (getComputedStyle(parent)["position"].toLowerCase() === "fixed")
          fixed = true;
        
        parent = parent.parentNode;
      }
      
      return fixed;
    },
    updateRelPosition: function() {
      var anchorBound = this.relAnchor.getBoundingClientRect();
      var anchorw = anchorBound.right - anchorBound.left;
      var anchorh = anchorBound.bottom - anchorBound.top;
      
      var notifiw = this.notifiWidth;
      var notifih = this.notifiHeight;
      
      var xpos = anchorBound.left + (!this.relAlignFixed ? scrollX : 0);
      var ypos = anchorBound.top + (!this.relAlignFixed ? scrollY : 0);
      
      var offset = this.relAlignments[this.relativeAlignment].call(this, this.relOffsetFactor, notifiw, notifih, anchorw, anchorh);
      
      this.container.style.left = (xpos + offset[0]) + "px";
      this.container.style.top = (ypos + offset[1]) + "px";
    }
  });

  // LCES Notifications manager
  window.lcNotifications = function() {
    lcGroup.call(this);
    var that = this;
    
    
    // Notifi appending functions for notifi position containers. Top left addAppend, etc.
    var addAppend = function(notifi) {
      this.appendChild(notifi.container);
    }
    
    var addPrepend = function(notifi) {
      var firstChild = this.getChild(0);
      
      if (firstChild && firstChild !== notifi.container)
        this.insertBefore(notifi.container, firstChild);
      else
        this.appendChild(notifi.container);
    }
    
    this.alignments = {
      "T": { // Top
        "L": jSh.d({class: "notification-alignment notifi-left notifi-top lces-themify", properties: {add: addAppend}}),
        "C": jSh.d({class: "notification-alignment notifi-center notifi-top lces-themify", properties: {add: addAppend}}),
        "R": jSh.d({class: "notification-alignment notifi-right notifi-top lces-themify", properties: {add: addAppend}})
      },
      "M": { // Middle
        "L": jSh.d({class: "notification-alignment notifi-left notifi-middle lces-themify", properties: {add: addPrepend}}),
        "C": jSh.d({class: "notification-alignment notifi-center notifi-middle lces-themify", properties: {add: addPrepend}}),
        "R": jSh.d({class: "notification-alignment notifi-right notifi-middle lces-themify", properties: {add: addPrepend}})
      },
      "B": { // Bottom
        "L": jSh.d({class: "notification-alignment notifi-left notifi-bottom lces-themify", properties: {add: addPrepend}}),
        "C": jSh.d({class: "notification-alignment notifi-center notifi-bottom lces-themify", properties: {add: addPrepend}}),
        "R": jSh.d({class: "notification-alignment notifi-right notifi-bottom lces-themify", properties: {add: addPrepend}})
      }, // Relative
      "R": jSh.d({class: "notification-alignment notifi-relative lces-themify", properties: {add: addAppend}})
    };
    
    // Reference document body
    var dBody = document.body;
    
    // Add notifi containers to DOMTree
    [this.alignments["T"], this.alignments["B"], this.alignments["M"]].forEach(function(obj) {
      Object.getOwnPropertyNames(obj).forEach(function(i) {
        if (obj[i])
          dBody.appendChild(obj[i]);
      });
    });
    
    // Add relative notifi container to DOMTree
    dBody.appendChild(this.alignments["R"]);
    this.alignments["R"]["R"] = this.alignments["R"];
    
    // Newmember statechange event fired for every new notifi
    this.addStateListener("newmember", function(member) {
      if (!(member instanceof lcNotification))
        throw TypeError("Notification provided does not implement interface lcNotification");
      // Do something here if required
    });
  }

  jSh.inherit(lcNotifications, lcGroup);

  // Add the new types
  jSh.extendObj(lces.types, {
    "window": lcWindow,
    "notification": lcNotification
  });

  // LCES Notifications Manager Initiation
  lces.ui.initNotifications = function() {
    lces.ui.notifications = new lcNotifications();
  }
  
  lces.addInit(function() {
    document.body.appendChild(jSh.d({
      sel: "#lces-windowcontainer.lces-themify",
      attr: {
        style: "text-align: left;"
      }
    }));
  });
  lces.addInit(lces.ui.initNotifications);
}
lces.rc[8] = function() {
  // =======================================================
  //             MAIN GENRE INTERFACE CONSTRUCTOR
  // =======================================================

  lces.ui.tagEditor = {};

  window.lcGenreGroup = function(mainElement) {
    lcGroup.call(this);
    var that = this;
    
    
    // Necessities for DOM relationships
    this.element = mainElement;
    
    this.addStateListener("parent", function(parent) {
      if (parent instanceof Node && parent.nodeType === Node.ELEMENT_NODE)
        parent.appendChild(mainElement);
    });
    
    
    // Some important things
    this.genreEdit  = null;
    this.genreList  = null;
    this.genreArray = null;
    
    // Interfacing Properties
    this.setState("string", "");
    this.states["string"].get = function() {
      var parent   = that.genreEdit.element.getChild(0);
      var genreArr = jSh.toArr(parent.childNodes).map(function(i) {if (i.nodeType !== Node.ELEMENT_NODE || !i.component) return ""; return i.component.value;}).filter(function(i) {return i != "";});
      var string   = genreArr.join(", ");
      
      return genreArr.length ? string : "";
    }
    
    this.addStateListener("string", function(s) {
      var parent = that.genreList.element.getChild(-1);
      var parent2 = that.genreEdit.element.getChild(0);
      that.genreArray.forEach(function(i) {parent.appendChild(i); i.component.genreToggled = false;});
      
      if (!s || s.trim() === "") {
        // throw Error("WHY. THE. HELL?!!: " + s); // Fixed I believe, but may still be prone to errors, will leave as is.
        
        that.genreEdit.noGenres = true;
        return;
      }
      
      var genres = s.toLowerCase().split(/\s*,\s*/g);
      
      if (genres.length >= 1 && that.genreEdit.noGenres) {
        parent2.innerHTML = "";
        that.genreEdit.noGenres = false;
      }
      
      // We might not get any genres
      var appendedGenres = 0;
      
      genres.forEach(function(i) {
        if (that.genreArray[i  + "genre"]) {
          parent2.appendChild(that.genreArray[i  + "genre"]);
          that.genreArray[i  + "genre"].component.genreToggled = true;
          
          appendedGenres += 1;
        }
      });
      
      if (!appendedGenres)
        that.genreEdit.noGenres = true;
    });
    
    // External interface function for value updates
    // Can be changed externally
    this.onchange = function() {
      // Replace function with anything
    }
    
    this._onchange = function(newValue) {
      if (newValue)
        return false;
      
      if (typeof this.onchange === "function")
        this.onchange();
    }
  }

  jSh.inherit(lcGenreGroup, lcGroup);



  // =======================================================
  //              lcGenreField() FUNCTION START
  // =======================================================


  window.lcGenreField = function(mainElement) {
    // Now the Genres, might get a little messy in here.
    if (!lces.ui.tagEditor.closeSVG) {
      lces.ui.tagEditor.closeSVG = jSh.svg(".genreremovesvg", 8, 8, [
        jSh.path(".genreremovecolor", "M1.7 0 0 1.7 2.3 4 0 6.3 1.7 8 4 5.7 6.3 8 8 6.3 5.7 4 8 1.7 6.3 0 4 2.3 1.7 0z")
      ]);
      // lces.ui.tagEditor.closeSVG = jSh.c("ns:svg:http://www.w3.org/2000/svg", undf, undf,
      //   jSh.c("ns:path:http://www.w3.org/2000/svg", "cp-color", undf, undf, {
      //     "ns:d:": "M1.7 0 0 1.7 2.3 4 0 6.3 1.7 8 4 5.7 6.3 8 8 6.3 5.7 4 8 1.7 6.3 0 4 2.3 1.7 0z",
      //     "class": "genreremovecolor"
      //   }), { // Attributes
      //   "version": "1.1",
      //   "width": 8,
      //   "height": 8,
      //   "class": "genreremovesvg"
      // });
    }
    
    // Make or retrieve the main element
    mainElement = mainElement || jSh.d("genres-edit", undf, [
      jSh.c("span", {class: "black", attr: {"no-select": ""}}),
      
      // Add Genre dummy genre
      jSh.d({class: "genre-item", attr: {"new-genre": ""}, child: [
        jSh.c("span", undf, ih("&nbsp;+ Add Genre&nbsp;")),
        jSh.c("span", undf, ih("&nbsp;+ Add Genre&nbsp;")),
        
        jSh.d("", undf, lces.ui.tagEditor.closeSVG.cloneNode(true)),
        jSh.c("section")
      ]}),
      
      // Genre popup selection box
      jSh.d("genre-list", undf, [
        jSh.c("input", {class: "genre-search", prop: {type: "text", placeholder: "Search Genres"}}),
        
        jSh.d("genre-dropcatcher", undf, [
          jSh.c("span", undf, "REMOVE GENRE"),
          jSh.d()
        ]),
        jSh.d({class: "genre-select", attr: {"no-select": ""}})
      ])
    ]);
    
    
    
    // =======================================================
    //             INITIALIZING GENRE INSTANCE
    // =======================================================
    
    
    // Array that contains all physical genres
    var genreArray = [];
    // Main genre interface for foreign exchange
    var genreGroup = new lcGenreGroup(mainElement);
    genreGroup.genreArray = genreArray;
    // window.genreGroup = genreGroup; // FIXME: FOR DEBUGGING PURPOSES ONLY
    
    var genreEdit = new lcWidget(mainElement);
    genreGroup.genreEdit = genreEdit;
    // genreEdit.LCESName = "ui-genre-edit";
    
    var genreList = new lcWidget(genreEdit.element.getChild(-1));
    genreGroup.genreList = genreList;
    var genreSearch = new lcTextField(mainElement.jSh(".genre-search")[0]);
    
    
    genreEdit.setState("editing", false);
    genreEdit.addStateListener("editing", function(editing) {
      if (editing) {
        genreList.visible = true;
      } else {
        genreList.visible = false;
      }
    });
    
    // Init cleanup
    genreGroup.hardLinkStates("value", "string");
    
    
    // Add pretty fade effect for genreList
    
    onTransitionEnd(genreList.element, function(e) {
      if (e.propertyName == "opacity" && getComputedStyle(this)["opacity"] == 0)
        this.style.display = "none";
    });
    genreList.addStateListener("visible", function(visible) {
      if (visible) {
        genreList.style.display = "block";
    
        setTimeout(function() {
          genreList.style.opacity = 1;
        }, 0);
      } else
        genreList.style.opacity = 0;
    });
    
    
    
    
    // =======================================================
    //               GENRE DnD EVENT HANDLERS
    // =======================================================
    
    
    var dragGenreSrc = null;
    
    function genreDragStart(e) {
      this.style.opacity = '0.5';  // this / e.target is the source node.
      
      dragGenreSrc = this;
      
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", "<span>genredroppinglikeaboss</span>");
      
      setTimeout(function() {
        genreEdit.element.setAttribute("dragging", "");
      }, 100);
    }
    
    function genreDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }

      e.dataTransfer.dropEffect = 'move';

      return false;
    }
    
    function genreDragEnter(e) {
      // this / e.target is the current hover target.
      if (dragGenreSrc !== this.genre && !this.genre.component && this !== genreDropCatcher ) {
        this.genre.setAttribute("dragover", "");
        
      } else if (dragGenreSrc !== this.genre) {
        if (this === genreDropCatcher && dragGenreSrc.component.genreToggled)
          return this.genre.setAttribute("dragover", "") ? true : true;
        
        if (this !== genreDropCatcher) {
          if (this.genre.component.genreToggled)
            return this.genre.setAttribute("dragover", "") ? true : true;
        }
      }
    }
    
    function genreDragLeave(e) {
      this.genre.removeAttribute("dragover");  // this / e.target is previous target element.
    }
    
    function genreDrop(e) {
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      
      if (dragGenreSrc !== this.genre && e.dataTransfer.getData("text/html") == "<span>genredroppinglikeaboss</span>") {
        function dropGenre() {
          if (this !== genreDropCatcher) {
            if (this === newGenre)
              genreSelectedContainer.appendChild(dragGenreSrc);
            else
              genreSelectedContainer.insertBefore(dragGenreSrc, this.genre);
            dragGenreSrc.component.genreToggled = true;
          } else {
            genreList.element.getChild(-1).appendChild(dragGenreSrc);
            dragGenreSrc.component.genreToggled = false;
          }
        }
        
        
        if (dragGenreSrc !== this.genre) {
          if (this === genreDropCatcher && dragGenreSrc.component.genreToggled)
            return dropGenre.call(this) + genreList.sort() + genreSearch.element.focus() ? true : true; // I'm really lazy, I know.
          
          if (this !== genreDropCatcher) {
            if (this === newGenre || this.genre.component.genreToggled) {
              dropGenre.call(this);
              if (!lces.ui.mobile)
                genreSearch.element.focus();
              return true;
            }
          }
        }
      }
      
      
      
      return false;
    }
    
    function genreDragEnd(e) {
      genreArray.forEach(function(i) {
        i.removeAttribute("dragover", "");
      });
      newGenre.genre.removeAttribute("dragover", "");
      
      
      this.removeAttribute("style");
      setTimeout(function() {
        genreEdit.element.removeAttribute("dragging");
      }, 100);
    }
    
    
    // Reference Selected Genres container
    var genreSelectedContainer = genreEdit.element.getChild(0);
    
    
    // Reference NewGenre Dummy item
    var newGenre = genreEdit.element.getChild(1).getChild(-1);
    newGenre.genre = newGenre.parentNode;
    
    // Reference Genre Garbage Collector
    var genreDropCatcher = genreList.element.getChild(1);
    genreDropCatcher.genre = genreDropCatcher;
    
    // Add DnD events
    [genreDropCatcher, newGenre].forEach(function(i) {
      i.addEventListener('dragenter', genreDragEnter, false);
      i.addEventListener('dragover', genreDragOver, false);
      i.addEventListener('dragleave', genreDragLeave, false);
      i.addEventListener('dragdrop', genreDrop, false);
      i.addEventListener('drop', genreDrop, false);
    });
    
    
    
    
    // =======================================================
    //             GENRE CREATION/REMOVAL METHODS
    // =======================================================
    
    
    var genres = AUCE.data.genres;
    var removeSVG = lces.ui.tagEditor.closeSVG;
    
    genreGroup.addGenre = function(genreName, value) {
      // Make our genre element with all it's children
      var genre = new lcWidget(jSh.d("genre-item", undf, [
        jSh.c("span", undf, genreName), // Genre name container
        jSh.d(undf, undf, removeSVG.cloneNode(true)), // SVG Close Button
        jSh.c("aside", undf, ","),      // Comma separator
        jSh.c("section")                // Dropcatcher to handle all drops
      ], undf, {draggable: true}));
      
      var genreValue = ((value !== undf ? value : genreName) + "").toLowerCase();
      
      // Append new genre
      genreArray.push(genre.element);
      genreArray[genreValue + "genre"] = genre.element;
      
      genre.string = genreName;
      genre.value  = genreValue;
      genre.element.string = genre.string;
      genre.element.value  = genreValue;
      
      genre.setState("genreToggled", false);
      
      
      genre.parent = genreList.element.getChild(-1);
      
      
      
      // Add genre DnD events
      genre.addEventListener('dragstart', genreDragStart, false);
      genre.addEventListener('dragend', genreDragEnd, false);
      
      
      // Add click event
      genre.element.addEventListener("click", function(e) {
        var target = e.target || e.srcElement;
        
        
        if (target === genre.element.getChild(1) || jSh.isDescendant(target, genre.element.getChild(1))) {
          genreList.element.getChild(-1).appendChild(this);
          this.component.genreToggled = false;
          genreList.sort();
          
        } else if (!genre.genreToggled) {
          genreEdit.element.getChild(0).appendChild(this);
          genre.genreToggled = true;
        }
        
        if (!lces.ui.mobile)
          genreSearch.element.focus();
      });
      
      
      // Drop catcher to prevent bad/unreliable DnD behaviour
      var dropCatcher = genre.element.getChild(-1);
      dropCatcher.genre = genre.element;
      dropCatcher.addEventListener('dragenter', genreDragEnter, false);
      dropCatcher.addEventListener('dragover', genreDragOver, false);
      dropCatcher.addEventListener('dragleave', genreDragLeave, false);
      dropCatcher.addEventListener('dragdrop', genreDrop, false);
      dropCatcher.addEventListener('drop', genreDrop, false);
      
      // Make it disabled by default
      genre.genreToggled = false;
    }
    
    genreGroup.removeGenre = function(source) {
      var genre = determineType(source);
      
      if (!genre)
        return false;
      
      genreArray.splice(genreArray.indexOf(genre), 1);
      genreArray[genre.string.toLowerCase() + "genre"] = undf;
      
      genre.component.parent.removeChild(genre);
    }
    
    function determineType(source) {
      if (!source)
        return null;
      
      if (jSh.type(source) === "string") {
        return genreArray[source.toLowerCase() + "genre"];
        
      } else if (source.states && source.states["genreToggled"]) {
        return source.element;
        
      } else if (source.component && source.component.states["genreToggled"]) {
        return source;
        
      } else {
        return null;
      }
    }
    
    // =======================================================
    //            GENRE LIST SORTING, ETC. METHODS
    // =======================================================
    
    
    // Setup GenreList Methods
    genreList.sort = function() {
      var sortedGenres = [];
      var parent = this.element.getChild(-1);
      
      jSh.toArr(parent.childNodes).forEach(function(i) {
        if (i.nodeType === Node.ELEMENT_NODE) {
          sortedGenres[i.component.string] = i;
          sortedGenres.push(i.component.string);
          parent.removeChild(i);
        }
      });
      
      sortedGenres.sort(function(a, b) {
        return a < b ? -1 : 1;
      });
      
      sortedGenres.forEach(function(genre) {
        parent.appendChild(sortedGenres[genre]);
      });
    }
    
    // Tidy up everything beforehand
    genreList.sort();
    
    
    
    // =======================================================
    //                  GENRE SEARCH FUNCTION
    // =======================================================
    
    
    // Now for search Function
    var destArray = [];
    var secondArray = [];
    var arrayMap = [];
    
    function regExSanitize(s) {
      return s.replace(/(\\|\[|\]|\||\{|\}|\(|\)|\^|\$|\:|\.|\?|\+|\*|\-|\!|\=)/g, "\\$1");
    }
    
    function onGenreSearch(s) {
      var parent   = genreList.element.getChild(-1);
      var children = jSh.toArr(parent.childNodes).filter(function(i) {return i.nodeType === Node.ELEMENT_NODE;});
      
      arrayMap = children.map(function(i) {i.passedSearch = false; i.style.display = "none"; parent.removeChild(i); return i;});
      arrayMap.forEach(function(i) {arrayMap[i.string] = i;});
      
      
      destArray   = [];
      secondArray = [];
      
      var firstRegex  = new RegExp("^" + regExSanitize(s), "i");
      var secondRegex = new RegExp(regExSanitize(s), "ig");
      
      
      children.forEach(function(i) {
        if (s.trim() === "")
          return i.removeAttribute("style");
        
        if (firstRegex.test(i.string)) {
          i.passedSearch = true;
          return destArray.push(i.string);
        }
        
        if (secondRegex.test(i.string)) {
          i.passedSearch = true;
          return secondArray.push(i.string);
        }
      });
      
      if (s.trim() === "") {
        children.forEach(function(i) {
          if (!i.passedSearch)
            parent.appendChild(i);
        });
        
        return genreList.sort();
      }
      
      destArray.sort(function(a, b) {
        return a < b ? -1 : 1;
      });
      
      secondArray.sort(function(a, b) {
        return a < b ? -1 : 1;
      });
      
      destArray.forEach(function(i) {
        i = arrayMap[i];
        
        
        parent.appendChild(i);
        i.removeAttribute("style");
      });
      
      secondArray.forEach(function(i) {
        i = arrayMap[i];
        
        parent.appendChild(i);
        i.removeAttribute("style");
      })
      
      children.forEach(function(i) {
        if (!i.passedSearch)
          parent.appendChild(i);
      });
    }
    
    // Remove default LCES styling
    genreSearch.classList.remove("lces");
    
    
    genreSearch.addEventListener("keyup", function(e) {
      var target = destArray[0] || secondArray[0];
      if (this.value.trim() !== "" && e.keyCode === 13 && target) {
        genreSelectedContainer.appendChild(arrayMap[target]);
        arrayMap[target].component.genreToggled = true;
        this.value = "";
        
        onGenreSearch(this.value);
      } else
        onGenreSearch(this.value);
    });
    
    // Add Genre dummy item fade in/out animation
    var addGenreDisplay = newGenre.parentNode.getChild(0);
    var curAddGenreInnerHTML = addGenreDisplay.innerHTML;
    addGenreDisplay.innerHTML = "";
    
    onTransitionEnd(newGenre.parentNode, function(e) {
      if (e.propertyName === "opacity" && getComputedStyle(this)["opacity"] == 0) {
        addGenreDisplay.innerHTML = "";
      }
    });
    
    
    
    
    // =======================================================
    //            MAIN GENREEDIT EVENT HANDLERS
    // =======================================================
    
    
    // Add genreEdit focus event handlers, etc.
    
    genreEdit.addStateListener("noGenres", function(state) {
      if (state) {
        genreEdit.element.setAttribute("no-genres", "");
        
        genreSelectedContainer.innerHTML = "<div class=\"genre-item dummy\" ><span><i>(No Genres)</i></span></div>&nbsp;&nbsp;&nbsp;";
        
        if (getComputedStyle(newGenre.parentNode)["opacity"] == 0)
          genreSelectedContainer.getChild(0).removeAttribute("style");
        
      } else {
        genreEdit.element.removeAttribute("no-genres");
      }
    });
    
    
    genreEdit.addStateListener("editing", function(editing) {
      if (editing) {
        if (genreEdit.noGenres)
          genreSelectedContainer.innerHTML = "";
        genreEdit.noGenres = false;
        
        genreEditIcon.element.removeAttribute("visible");
        
        addGenreDisplay.innerHTML = curAddGenreInnerHTML;
        
        genreList.style.display = "block";
        
        setTimeout(function() {
          genreEdit.classList.add("editing");
        }, 0);
        
        if (!lces.ui.mobile)
          genreSearch.element.focus();
        
      } else {
        genreEdit.classList.remove("editing");
        
        genreSearch.element.blur();
        
        
        if (!genreSelectedContainer.getChild(0)) {
          var newValue = genreGroup.string === genreGroup.states["string"].stateStatus;
          
          genreEdit.noGenres = true;
          genreGroup.string = "";
          genreGroup._onchange(newValue);
          
        } else {
          var newValue = genreGroup.string === genreGroup.states["string"].stateStatus;
          
          genreEdit.noGenres = false;
          genreGroup.string = genreGroup.string;
          genreGroup._onchange(newValue);
        }
      }
    });
    
    genreSearch.element.component = genreEdit;
    lces.focus.addMember(genreEdit);
    genreEdit.addStateListener("focused", function(focused) {
      genreEdit.editing = focused;
    });
    
    onTransitionEnd(genreList.element, function(e) {
      if (e.propertyName == "opacity" && getComputedStyle(this)["opacity"] == 0) {
        this.style.display = "none";
      }
    });
    
    
    // 'Edit This' icon
    var genreEditIcon = jSh(".editpropertysvg")[0] ? new lcWidget(jSh.d("editpropertyicon", undf, jSh(".editpropertysvg")[0].cloneNode(true))) : new lcWidget();
    
    genreEdit.element.insertBefore(genreEditIcon.element, genreList.element);
    genreEditIcon.style = {
      position: "relative",
      left: "-5px"
    }
    
    // Events
    
    genreEdit.addEventListener("mouseover", function(e) {
      if (!genreEdit.editing)
        genreEditIcon.element.setAttribute("visible", "");
    });
    genreEdit.addEventListener("mouseout", function(e) {
      genreEditIcon.element.removeAttribute("visible");
    });
    
    if (!genreSelectedContainer.getChild(0))
      genreEdit.noGenres = true;
    
    
    // End
    return genreGroup;
  };
}
// LCES DOM Components
lces._WidgetInit = function() {
  
  // TODO: Wrap these for possible conflicts
  lces.global.ih = function(s) {
    return {s: s, t: 1}  // Returns 1 for innerHTML
  };

  lces.global.prefixEvent = function(event, element, callback) {
    if (jSh.type(event) != "array")
      event = [event];
    
    var prefixes = ["o", "webkit", ""];
    for (var i=0; i<event.length; i++) {
      for (var j=0; j<prefixes.length; j++) {
        element.addEventListener(prefixes[j] + event[i], callback);
      }
    }
    
  }

  lces.global.onTransitionEnd = function(element, callback) {
    if (!(element instanceof Node))
      element = element.element;
    
    prefixEvent(["TransitionEnd", "transitionend"], element, callback);
  }
  
  // lcFocus: A quick library for managing the focused native DOM and custom LCES elements
  lces.global.lcFocus = function() {
    var that  = this;
    this.type = "LCES Focus Manager";
    
    this.recurring = false;
    
    this.setState("focused", false);
    this.setExclusiveState("focused", true, 1);
    
    
    this._addMember = this.addMember;
    this.addMember = function(member) {
      member.setState("focused", false);
      this._addMember(member);
      member.states["focused"].flippedStateCall = true;
    }
    
    this.focusedComponent = null;
    
    var body = new lcWidget(document.body);
    body.setState("focused", false);
    this.addMember(body);

    function onClick(e) {
      var target = e.target || e.srcElement;

      var parent = target;
      
      if (parent) {
        while (parent !== body.element) {
          if (parent) {
            if (parent.component && parent.component.isLCESComponent && parent.component.focused !== undefined) {
              parent.component.focused = true;
              
              that.focusedComponent = parent.component;
              break;
            }
          } else {
            parent = body.element;
            break;
          }
            
          parent = parent.parentNode;
        }
      } else {
        parent = body.element;
      }
      
      if (parent === body.element) {
        body.focused = true;
        that.focusedComponent = body;
      }
    }

    this.setState("enabled", false);
    this.addStateListener("enabled", function(state) {
      if (state)
        window.addEventListener("click", onClick);
      else
        window.removeEventListener("click", onClick);
    });
  }

  jSh.inherit(lcFocus, lcGroup);


  // LCES Physical DOM Elements

  // Helpful functions

  lces.global.LCESLoopLabels = function() {
    var labels = jSh("label");
    var activeLabels = jSh.toArr(labels).filter(function(i) {return !!i.htmlFor;});
    activeLabels.forEach(function(i, un, arr) {arr[i.htmlFor] = i;});

    return activeLabels;
  }

  // lcWidget([HTML DOM Element) I have no idea what I'm doing...
  lces.global.lcWidget = function(e) {
    var extended = lcComponent.call(this);
    if (!extended)
      this.type = "LCES Widget";
    
    var that = this;
    
    // Get jSh
    this.jSh = jSh;
    this.getChild = jSh.getChild;
    
    // Get some things from prototype
    this._determineType = this._determineType;
    
    // Get or create main DOM/Markup Element
    if (!this.element)
      this.element = (e ? e : jSh.d());
      
    this.element.component = this;
    
    this.addEventListener = this.element.addEventListener.bind(this.element);
    
    
    // Now a few essential states...
    
    this.setState("style", {});
    this.addStateListener("style", function(styles) {
      for (style in styles) {
        if (styles.hasOwnProperty(style)) {
          that.element.style[style] = styles[style];
        }
      }
    });
    this.states["style"].get = function() {return that.element.style;};

    this.setState("id", undf);
    this.addStateListener("id", function(id) {
      that.element.id = id;
    });
    this.states["id"].get = function() {return that.element.id};


    this.setState("text", "");
    this.addStateListener("text", function(text) {
      var element = that.element;
      
      switch (element.tagName.toLowerCase()) {
        case "input":
        case "textarea":
          if (element.value !== text)
            element.value = text;
          break;
        default:
          that.element.textContent = text;
      }
    });
    this.states["text"].get = function() {return that.element.value || that.element.textContent};


    this.setState("html", "");
    this.addStateListener("html", function(html) {
      if (that.element.innerHTML !== undf)
        that.element.innerHTML = html;
    });
    this.states["html"].get = function() {return that.element.innerHTML};


    this.setState("parent", null);
    this.addStateListener("parent", function(parent) {

      if (parent) {
        if (parent.isLCESComponent)
          parent = parent.element;

        parent.appendChild(that.element);
      } else if (that.parent)
        that.parent.removeChild(that.element);
    });
    this.states["parent"].get = function() {return that.element.parentNode || this.stateStatus;};
    
    
    this.setState("children", jSh.toArr(this.element.childNodes));
    this.addStateListener("children", function(child) {
      that.appendChild(child);
    });
    this.states["children"].get = function() {return jSh.toArr(that.element.childNodes)};
    this.hardLinkStates("childNodes", "children");
    
    // Methods
    this.appendChild = function(child) {
      if (!this.element.jSh)
        jSh.shorten(this.element);
      
      var children = jSh.toArr(arguments);
      
      if (jSh.type(children[0]) === "array")
        children = children[0];
      
      for (var i=0,l=children.length; i<l; i++) {
        var child = this._determineType(children[i]);
        this.element.__apch(child);
      }
    }
    
    this.append = this.appendChild;
    
    this.removeChild = function(child) {
      if (!this.element.jSh)
        jSh.shorten(this.element);
      
      var children = jSh.toArr(arguments);
      
      if (jSh.type(children[0]) === "array")
        children = children[0];
      
      for (var i=0,l=children.length; i<l; i++) {
        var child = this._determineType(children[i]);
        this.element.__rmch(child);
      }
      
      if (children.length === 1)
        return children[0];
      else
        return children;
    }
    
    this.remove = this.removeChild;
    
    this.insertBefore = function(newElm, oldElm) {
      var newDOMElement = this._determineType(newElm);
      var oldDOMElement = this._determineType(oldElm);
      
      this.element.insertBefore(newDOMElement, oldDOMElement);
    }
    
    this.setAttr = function(attr, value) {
      this.element.setAttribute(attr, value === undf ? "null" : value);
    }
    
    this.getAttr = function(attr) {
      return this.element.getAttribute(attr);
    }
    
    this.removeAttr = function(attr) {
      if (jSh.hasMultipleArgs(arguments, this))
        return;
      
      this.element.removeAttribute(attr);
    }
    
    // FIXME: This breaks compatibility with older browsers. I'm not focusing on a polyfill for now.
    var classList = {
      add: function(c) {that.element.classList.add(c)},
      remove: function(c) {that.element.classList.remove(c)},
      contains: function(c) {that.element.classList.contains(c)},
      removeAll: function(filter) {that.classList.forEach(function(i) {return filter === undf ? that.classList.remove(i) : (i.indexOf(filter) != -1 ? that.classList.remove(i) : false); })},
      toggle: function(c) {that.element.classList.toggle(c)}
    }

    Object.defineProperty(this, "classList", {configurable: true, get: function() {
      var list = jSh.toArr(that.element.classList);
      
      list.add = classList.add;
      list.remove = classList.remove;
      list.contains = classList.contains;
      list.removeAll = classList.removeAll;
      list.toggle = classList.toggle;
      
      return list;
    }});
    
    
    // lcWidget.wrap(Element01[, Element02, Element03, Etc...])
    //
    // ElementN: DOM Node | lcWidget Instance
    //
    // Wraps the current widget around the elements passed
    // as the arguments. If the first element is a child then it'll
    // replace it whilst appending it a child of itself.
    this.wrap = function(arg01) {
      if (!arg01)
        return;
      
      var children = jSh.toArr(arguments);
      var child0   = this._determineType(children[0]);
      
      if (child0.parentNode)
        child0.parentNode.insertBefore(this.element, child0);
      
      children.forEach(function(i) {
        var child = that._determineType(i);
        
        that.appendChild(i);
      });
    }
    
    // Check attributes for flags
    if (e) {
      var isDyntext = this.getAttr("lces-dyntext") !== null;
      
      if (isDyntext) {
        // Initialize textual dynamics
        lcDynamicText.call(this);
        
        this.dynText.allowTags = false;
        this.dynText.element   = null;
        
        // Loop attributes
        function loopAttrs(node) {
          var attrs = jSh.toArr(node.attributes);
          attrs.forEach(function(attr) {
            that.dynText.compile(attr.value + "", function(s) {
              node.setAttribute(attr.name, s);
            });
          });
        }
        
        loopAttrs(this.element);
        
        // Iterate children
        function loopChildren(children, parent) {
          children.forEach(function(child) {
            if (child.nodeType === Node.ELEMENT_NODE) {
              loopAttrs(child);
              loopChildren(jSh.toArr(child.childNodes), child);
            } else if (child.nodeType === Node.TEXT_NODE) {
              // No need for dynamic whitespace...
              if (child.nodeValue.trim() === "")
                return;
              
              var span = parent.childNodes.length === 1 ? parent : jSh.c("span");
              span.innerHTML = jSh.filterHTML(child.nodeValue);
              
              that.dynText.compile(child.nodeValue + "", function(s) {
                span.innerHTML = jSh.filterHTML(s);
              });
              
              if (span !== parent) {
                child.parentNode.insertBefore(span, child);
                child.parentNode.removeChild(child);
              }
            }
          });
          
        }
        
        loopChildren(this.children, this.element);
      }
    }
  };
  
  // Inherit from lcComponent
  jSh.inherit(lcWidget, lcComponent);

  // lcWidget._determineType(Node | lcWidget | string)
  //
  // Description: Returns an HTML DOM Node from the first passed
  // argument. And if it's of a falsy value, then it still returns
  // a DOM Text Node with it's nodeValue the stringified input.
  jSh.extendObj(lcWidget.prototype, {
    _determineType: function(src) {
      if (!src)
        src = jSh.t(src);
      else if (src.isLCESComponent && src.element)
        src = src.element;
      else if (src instanceof Node)
        src = src;
      else
        src = jSh.t(src);
      
      return src;
    }
  })

  lces.initTagExamine = function(e) {
    var lcType = "";
    
    if (e.getAttribute("lces-widget") !== null)
      lcType = e.getAttribute("lces-widget");
    else if (e.tagName.toLowerCase === "lces-widget")
      doSomething();
  }

  // lces.initTagLoad is for loading lcWidgets from the DOM produced from the main HTML response from the server.
  // EDIT: Should be moved to lces.widget.js as it has nothing to do with the core LCES functions.
  lces.initTagLoad = function() {
    var widgets  = jSh("[lces-name]"); // Elements with lces-widget attribute
    var widgets2 = jSh("lces-widget"); // lces-widget elements
    
    // Combine the results
    widgets = widgets.concat(widgets2);
    
    // Loop through attribute declared widgets
    for (var i=0,l=widgets.length; i<l; i++) {
      var widget = widgets[i];
      var type   = "";
      
      if (widget.tagName !== "LCES-WIDGET") {
        var probableType = widget.getAttribute("lces-widget");
        var widgetName   = widget.getAttribute("lces-name");
        var widgetClass  = widget.getAttribute("lces-class");
        var widgetGroup  = widget.getAttribute("lces-group");
      } else {
        var probableType = widget.getAttribute("type");
        var widgetName   = widget.getAttribute("name");
        var widgetClass;
        var widgetGroup  = widget.getAttribute("lces-group");
      }
      
      // Get the tagname
      var tagName = widget.tagName.toLowerCase();
      
      // Determine the appropriate widget type
      // TODO: Find a way to include radios in this check
      if (probableType) {
        type = lces.types[probableType] ? probableType : "widget";

      } else if (tagName === "input" || tagName === "textarea") {
        var inputType = widget.type;
        
        if (tagName === "textarea")
          type = "textarea";
        else if (inputType === "text" || inputType === "password")
          type = "textfield";
        else if (inputType === "checkbox")
          type = "checkbox";
        else if (inputType === "file")
          type = "fileinput";

      } else if (tagName === "select") {
        type = "dropdown";

      } else {
        type = "widget";
      }
      
      // Check if constructor exists and inherits from lcWidget
      if (typeof lces.types[type] !== "function" || !(lces.types[type].prototype instanceof lces.type("widget")))
        type = "widget";

      // Make our new widget
      var newWidget = new lces.types[type](jSh(widget));
      
      if (widgetName)
        newWidget.LCESName = widgetName;
        
      if (jSh.type(widgetClass) === "string" && widgetClass.trim()) {
        var widgetClasses = widgetClass.trim().split(/\s+/g);
        
        widgetClasses.forEach(function(i) {
          if (!newWidget.container)
            newWidget.classList.add(i);
          else
            newWidget.container.classList.add(i);
        });
      }
      
      if (jSh.type(widgetGroup) === "string" && widgetGroup.trim()) {
        var wGroup = lces(widgetGroup);
        
        if (!wGroup) {
          wGroup = new lcGroup();
          wGroup.LCESName = widgetGroup;
        } else if (!(wGroup instanceof lcGroup)) {
          wGroup = null;
        }
        
        if (wGroup)
          wGroup.addMember(newWidget);
      }
    }
  }

  // LCES Focusing System
  lces.focus = new lcGroup();

  jSh.extendObj(lces.focus, {
    init: function() {
      lcFocus.call(lces.focus);
      
      lces.focus.enabled = true;
    }
  });

  // Add the Initiation
  lces.addInit(lces.initTagLoad);
  lces.addInit(lces.focus.init);

  // LCES global UI related functions and data
  lces.ui = new lcComponent();

  // Append to lces.types
  jSh.extendObj(lces.types, {
    "widget": lcWidget
  });
}

// Solo
lces.rc[3] = lces._WidgetInit;
lces.rc[3] = function() {
  lces._WidgetInit();
  
  // lcDraggable for draggable functionality Z
  window.lcDraggable = function(anchor, target, lcWindow) {
    var that = this;
    this._drag = {};
    
    var targetWidth  = null;
    var targetHeight = null;
    var rightBound   = null;
    
    this.onDrag = function(e) {
      if (e.button !== 0)
        return false;
      
      var that = this;
      e.preventDefault();
      
      if (this.centered)
        return false;
      
      if (lcWindow) {
        var bRect = target.getBoundingClientRect();
        
        var tLeft = bRect.left;
        var tTop  = bRect.top;
      } else {
        var tLeft = target.offsetLeft;
        var tTop  = target.offsetTop;
      }
      
      this._drag.mouseX = e.clientX;
      this._drag.mouseY = e.clientY;
      this._drag.winX = tLeft;
      this._drag.winY = tTop;
      
      targetWidth  = target.offsetWidth;
      targetHeight = target.offsetHeight;
      rightBound   = innerWidth - targetWidth - this.borderOffset;
      bottomBound  = innerHeight - targetHeight - this.borderOffset;
      
      window.addEventListener("mousemove", this.onDragging);
      window.addEventListener("mouseup", function handler() {
        window.removeEventListener("mousemove", that.onDragging);
        window.removeEventListener("mouseup", handler);
      });
    }
    
    this.onDragging = function(e) {
      var borderOffset = that.borderOffset;
      e.preventDefault();
      
      var newX = that._drag.winX + (e.clientX - that._drag.mouseX);
      if (newX > rightBound)
        newX = rightBound;
      else if (newX < borderOffset)
        newX = borderOffset;
      
      var newY = that._drag.winY + (e.clientY - that._drag.mouseY);
      if (newY < borderOffset)
        newY = borderOffset;
      else if (innerHeight > targetHeight + borderOffset * 4 && newY > bottomBound)
        newY = bottomBound;
      
      if (lcWindow) {
        target.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`;
      } else {
        target.style.left = newX + "px";
        target.style.top = newY + "px";
      }
    }
    
    var onDragBound = this.onDrag.bind(this);
    this.setState("draggable", false);
    this.addStateListener("draggable", function(draggable) {
      if (draggable)
        anchor.addEventListener("mousedown", onDragBound);
      else
        anchor.removeEventListener("mousedown", onDragBound);
    });
    
    this.borderOffset = 20;
  }

  // new lcControl(DOM Node)
  //
  // An LCES widget designed to collectively control
  // the enabled state of (Mainly input) elements.
  //
  // newControl.disable: Bool
  //  - When true, the underlying children are not accessible
  //  - by the end user, when set to false access is restored.
  window.lcControl = function(e) {
    lcWidget.call(this, e || jSh.d("lcescontrol"));
    var that = this;
    this.element.component = this;
    
    this.classList.add("lcescontrol");
    
    this.setState("inputs", null);
    this.states["inputs"].get = function() {
      return [].concat(
        jSh.toArr(that.element.getElementsByTagName("input")),
        jSh.toArr(that.element.getElementsByTagName("textarea")),
        jSh.toArr(that.element.getElementsByTagName("button")),
        that.element.jSh("div[tabindex=\"0\"]")
      );
    }
    
    this.onMousedown = function(e) {
      e.preventDefault();
    }
    
    this.onFocus = function(e) {
      e.preventDefault();
      
      if (this.blur)
        this.blur();
    }
    
    this.clickCatcher = jSh.c("lces-control-click", ".lcescontrolclick");
    this.clickCatcher.addEventListener("mousedown", this.onMousedown);
    this.appendChild(this.clickCatcher);
    
    this._appendChild = this.appendChild;
    this.appendChild = function() {
      this._appendChild.apply(this, jSh.toArr(arguments));
      this._appendChild(this.clickCatcher);
    }
    
    this.setState("disabled", false);
    this.addStateListener("disabled", function(disabled) {
      if (disabled) {
        that.element.setAttribute("disabled", "");
        that.element.addEventListener("mousedown", that.onMousedown);
        
        that.clickCatcher.style.display = "block";
        
        // Prevent focusing on child input elements
        var inputs = that.inputs;
        for (var i=0,l=inputs.length; i<l; i++) {
          inputs[i].addEventListener("focus", that.onFocus);
          inputs[i].blur();
        }
      } else {
        that.element.removeAttribute("disabled");
        that.element.removeEventListener("mousedown", that.onMousedown);
        
        that.clickCatcher.style.display = "none";
        
        var inputs = that.inputs;
        for (var i=0,l=inputs.length; i<l; i++) {
          inputs[i].removeEventListener("focus", that.onFocus);
        }
      }
    });
    
    this.setState("focused", false);
    lces.focus.addMember(this);
    
    var attr = this.element.getAttribute("disabled");
    if (attr !== null)
      this.disabled = true;
  }

  jSh.inherit(lcControl, lcWidget);

  jSh.extendObj(lces.types, {
    "control": lcControl
  });
  
  // LCES Custom Scrollbars
  lces.ui.scrollBarScroll = 45;
  
  lces.ui.scrollBars = [];
  lces.ui.sbScroll   = function onwheel(e) {
    if (this.lcesScrollbar.visible)
      this.lcesScrollbar.scroll(e.deltaY, e);
  }
  
  lces.ui.sbScreen = jSh.d("lces-scrollbar-screen");
  lces.ui.sbScreen.addEventListener("mouseover", function(e) {e.preventDefault();});
  
  // If LCES scrollbars enabled globally
  var lcesSBSet = false;
  
  // Scrolling screen to prevent mouse from hovering over annoying things.
  lces.ui.setState("sbScrolling", false);
  lces.ui.addStateListener("sbScrolling", function(scrolling) {
    if (scrolling)
      lces.ui.sbScreen.classList.add("lces-sb-screen-visible");
    else
      lces.ui.sbScreen.classList.remove("lces-sb-screen-visible");
  });
  
  lces.ui.setState("scrollBarsEnabled", false);
  lces.ui.addStateListener("scrollBarsEnabled", function(sbe) {
    if (sbe && !lcesSBSet) {
      lcesSBSet = true;
      
      // Make all scrollbars visible
      jSh("body")[0].classList.add("lces-scrollbars-visible");
      
      var arr       = lces.ui.scrollBars;
      var sbHandler = lces.ui.sbScroll;
      
      for (var i=0,l=arr.length; i<l; i++) {
        var sb = arr[i];
        
        sb.parent.addEventListener("wheel", sbHandler);
        sb.scrollContent.style.overflow = "hidden";
      }
      
      document.body.appendChild(lces.ui.sbScreen);
    } else {
      // Nothing to do here, prolly.
    }
  });
  
  window.lcScrollBars = function(e, scrollContent, autoupdate) {
    if (!this.element && !e)
      return false; // No scrolling box
    
    // Check for lcComponent
    if (!(this instanceof lcComponent))
      return new lcScrollBars(e);
    
    var that   = this;
    var trough = jSh.d(".lces-scrollbar-trough");
    var elem   = jSh.d(".lces-scrollbar");
    
    // Add scroller to trough
    trough.appendChild(elem);
    
    var scrollbar      = new lcComponent();
    this.lcesScrollbar = scrollbar;
    
    // Add lcesscroll event to component
    scrollbar.addEvent("lcesscroll");
    scrollbar.addEvent("scrollbarvisible");
    
    scrollbar.scrollContent = this.scrollbarContent || scrollContent || e; // I dunno how it'll work with e, but whatever.
    scrollbar.scrollDist    = lces.ui.scrollBarScroll;
    scrollbar.setState("visible", false);
    
    // For dynamic elements
    scrollbar.addStateListener("parent", function(parent) {
      if (parent instanceof lcWidget)
        parent = parent.element;
      
      if (this.oldStateStatus && this.oldStateStatus !== (e || that.element)) {
        this.oldStateStatus.lcesScrollbar = undf;
        
        this.oldStateStatus.removeEventListener("wheel", lces.ui.sbScroll);
      }
      
      parent.appendChild(trough);
      parent.lcesScrollbar = scrollbar;
      parent.addEventListener("wheel", lces.ui.sbScroll);
      
      this.stateStatus = parent;
    });
    
    scrollbar.addStateListener("visible", function(visible) {
      trough.style.display = visible ? "block" : "none";
    });
    
    scrollbar.setState("parent", e || this.element);
    
    // Styling properties
    scrollbar.marginTop    = 0;
    scrollbar.marginBottom = 0;
    scrollbar.marginSide   = 0;
    scrollbar.side = this.scrollbarSide !== "left" ? "lc-sbright" : "lc-sbleft";
    
    // Scrolling properties
    var contentScrolled   = 0;
    var sbScrolled        = 0;
    
    var scrollTopMax      = 0;
    var physicalScrollMax = 0;
    
    // Add to LCES scrollbar collection
    lces.ui.scrollBars.push(scrollbar);
    
    function updateContentScroll(contentTrigger) {
      if (!contentTrigger) {
        contentScrolled = physicalScrollMax * (sbScrolled / scrollTopMax);
        scrollbar.scrollContent.scrollTop = contentScrolled;
      } else {
        sbScrolled = ((contentScrolled / physicalScrollMax) * scrollTopMax);
        elem.style.top = sbScrolled  + "px";
      }
      
      scrollbar.triggerEvent("lcesscroll", {scroll: contentScrolled});
    }
    
    scrollbar.scroll = function(dir, e) {
      dir = dir > 0 ? 1 : -1;
      var oldScroll = contentScrolled;
      
      contentScrolled = Math.min(Math.max(contentScrolled + lces.ui.scrollBarScroll * dir, 0), physicalScrollMax);
      scrollbar.scrollContent.scrollTop = contentScrolled;
      
      if (oldScroll !== contentScrolled) {
        updateContentScroll(true);
        
        e.preventDefault();
      }
    }
    
    scrollbar.scrollTo = function(dest, position) {
      var oldScroll = contentScrolled;
      
      if (typeof dest === "number" && !isNaN(dest)) {
        contentScrolled = Math.min(Math.max(dest, 0), physicalScrollMax);
        scrollbar.scrollContent.scrollTop = contentScrolled;
        
        if (oldScroll !== contentScrolled) {
          updateContentScroll(true);
        }
      } else if (dest instanceof Node) {
        var cRect = scrollbar.scrollContent.getBoundingClientRect();
        var tRect = dest.getBoundingClientRect();
        
        var cMid = ((cRect.top + cRect.bottom) / 2);
        var tMid = ((tRect.top + tRect.bottom) / 2);
        
        contentScrolled = Math.min(Math.max(contentScrolled + (tMid - cMid), 0), physicalScrollMax);
        scrollbar.scrollContent.scrollTop = contentScrolled;
        
        if (oldScroll !== contentScrolled) {
          updateContentScroll(true);
        }
      }
    };
    
    function windowMove(e) {
      sbScrolled = Math.min(Math.max(windowMove.scroll + (e.clientY - windowMove.y), 0), scrollTopMax);
      elem.style.top = sbScrolled + "px";
      
      updateContentScroll();
    }
    
    trough.addEventListener("mousedown", function(e) {
      var target = e.target || e.srcElement;
      e.preventDefault();
      
      if (target === elem) {
        windowMove.scroll = sbScrolled;
        windowMove.y = e.clientY;
        trough.classList.add("active");
        
        lces.ui.sbScrolling = true;
        
        window.addEventListener("mousemove", windowMove);
        window.addEventListener("mouseup", function mup() {
          window.removeEventListener("mousemove", windowMove);
          window.removeEventListener("mouseup", mup);
          
          trough.classList.remove("active");
          lces.ui.sbScrolling = false;
        });
      } else {
        var elemBCR = elem.getBoundingClientRect();
        var top = (elemBCR.top + (e.clientY - elemBCR.top) - (elem.offsetHeight / 2)) - trough.getBoundingClientRect().top;
        
        sbScrolled = Math.min(Math.max(top, 0), scrollTopMax);
        elem.style.top = sbScrolled + "px";
        
        // Keep scrolling after clicking on the trough
        windowMove.scroll = sbScrolled;
        windowMove.y = e.clientY;
        
        lces.ui.sbScrolling = true;
        
        window.addEventListener("mousemove", windowMove);
        window.addEventListener("mouseup", function mup() {
          window.removeEventListener("mousemove", windowMove);
          window.removeEventListener("mouseup", mup);
          
          trough.classList.remove("active");
          lces.ui.sbScrolling = false;
        });
        
        updateContentScroll();
      }
    });
    
    // Update the height of the scrollbar for content changes
    scrollbar.update = function(hard) {
      var scrollContent = scrollbar.scrollContent;
      
      // Get scrollcontent real height
      var scrollCCS = getComputedStyle(scrollContent);
      var scrollCHeight = scrollContent.offsetHeight;
      scrollCHeight = scrollCHeight - jSh.numOp(parseInt(scrollCCS["borderTopWidth"]), 0) - jSh.numOp(parseInt(scrollCCS["borderBottomWidth"]), 0);
      
      // Get scrollparent real height
      var parentCS = getComputedStyle(scrollbar.parent);
      var scrollParentHeight = scrollbar.parent.offsetHeight;
      scrollParentHeight = scrollParentHeight - parseInt(parentCS["borderTopWidth"]) - parseInt(parentCS["borderBottomWidth"]);
      
      var height = Math.max(30, (scrollCHeight / scrollContent.scrollHeight) * (scrollParentHeight - (scrollbar.marginTop + scrollbar.marginBottom)));
      scrollTopMax = scrollParentHeight - height - (scrollbar.marginTop + scrollbar.marginBottom);
      physicalScrollMax = Math.max(0, scrollContent.scrollHeight - scrollContent.offsetHeight);
      
      trough.classList.remove(scrollbar.side === "left" || scrollbar.side === "lc-sbleft" ? "lc-sbright" : "lc-sbleft");
      trough.classList.add(scrollbar.side);
      
      elem.style.margin = "0px " + scrollbar.marginSide + "px";
      elem.style.height = height + "px";
      trough.style.top = scrollbar.marginTop + "px";
      trough.style.bottom = scrollbar.marginBottom + "px";
      
      if (physicalScrollMax)
        trough.style.display = "block";
      else
        trough.style.display = "none";
      
      // Reset scrollbar and content TODO: Check and remove this, it's unhelpful
      var oldRatio = jSh.numOp(sbScrolled, 0) === 0 ? 1 : Math.min(sbScrolled, scrollTopMax) / sbScrolled;
      
      elem.style.top = Math.min(sbScrolled, scrollTopMax) + "px";
      sbScrolled = Math.min(jSh.numOp(sbScrolled, 0), scrollTopMax);
      scrollContent.scrollTop = Math.min(physicalScrollMax, scrollContent.scrollTop);
      
      scrollbar.triggerEvent("scrollbarvisible", {visible: !!physicalScrollMax});
    }
    
    if (lces.ui.scrollBarsEnabled) {
      scrollbar.parent.addEventListener("wheel", lces.ui.sbScroll);
      scrollbar.scrollContent.style.overflow = "hidden";
    }
    
    scrollbar.update();
  }
  
  jSh.inherit(lcScrollBars, lcComponent);
  
  function initLcScrollBars() {
    window.addEventListener("wheel", function showScrollBars() {
      lces.ui.scrollBarsEnabled = true;
      
      window.removeEventListener("wheel", showScrollBars);
    });
  }
  
  lces.addInit(initLcScrollBars);
  
  // LCES Dynamic Text Feature
  //

  lces.dynText = {
    allowTags: true, // If false any [tag]x[/tag]'s will be ignored.
    forgiving: true  // If false, will throw errors on every "syntax error"
  };


  // Tag specifics
  // Add new tags here.

  lces.dynText.tags = {
    "default": { // For when undefined types are requested
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "font-weight: bold;"}}));
      },
      update: function() {
        
      }
    },
    "text": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {}));
      }
    },
    "url": {
      node: function(params, context) {
        var widget = new lcWidget(jSh.c("a", {properties: {href: params}}));
        
        widget.addStateListener("href", function(href) {
          this.component.element.href = href.substr(0, 4).toLowerCase() === "url:" ? href.substr(4) : href;
        });
        
        return widget;
      },
      update: function(s) {
        this.component.href = s;
      }
    },
    "button": {
      node: function(params, context) {
        return new lcWidget(jSh.c("button", {}));
      },
      update: function() {
        
      }
    },
    "color": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "color: " + params + ";"}}));
      },
      update: function(s) {
        if (s !== "lces-color") {
          this.component.style = {
            color: s
          };
          
          this.component.classList.remove("lces-user-text-color");
        } else {
          this.component.setAttr("style", "");
          this.component.classList.add("lces-user-text-color");
        }
      }
    },
    "anchor": {
      node: function(params, context) {
        return new lcWidget(jSh.c("a", {prop: {href: params}}));
      },
      update: function(s) {
        this.component.element.href = s;
      }
    },
    "anchor-blank": {
      node: function(params, context) {
        return new lcWidget(jSh.c("a", {prop: {href: params, target: "_blank"}}));
      },
      update: function(s) {
        this.component.element.href = s;
      }
    },
    "font": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "font-family: \"" + params + "\";"}}));
      },
      update: function(s) {
        s = (s + "").trim();
        
        this.component.style = {
          fontFamily: (s[0] !== "\"" ? "\"" : "") + s + (s[s.length - 1] !== "\"" ? "\"" : "")
        };
      }
    },
    "size": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "font-size: " + params + ";"}}));
      },
      update: function(s) {
        this.component.style = {
          fontSize: s
        };
      }
    },
    "b": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "font-weight: bold;"}}));
      },
      update: function() {
        
      }
    },
    "i": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "font-style: italic;"}}));
      },
      update: function() {
        
      }
    },
    "u": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "text-decoration: underline;"}}));
      },
      update: function() {
        
      }
    },
    "center": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "display: block;text-align: center;"}}));
      },
      update: function() {
        
      }
    },
    "break": {
      node() {
        return lces.new("widget", jSh.c("p"));
      },
      update() {
        
      }
    },
    "opacity": {
      node(params, context) {
        return lces.new("widget", jSh.c("span", {attributes: {style: "opacity: " + params + ";"}}));
      },
      update(s) {
        this.component.style = {
          opacity: s
        };
      }
    },
    "quote": {
      node(params, context) {
        return lces.new("widget", jSh.d(".lces-text-quote"));
      },
      update(s) {
        this.component.style = {
          opacity: s
        };
      }
    },
    "h1": {
      node: function(params, context) {
        return new lcWidget(jSh.c("h1"));
      },
      update: function() {
        
      }
    },
    "h2": {
      node: function(params, context) {
        return new lcWidget(jSh.c("h2"));
      },
      update: function() {
        
      }
    },
    "h3": {
      node: function(params, context) {
        return new lcWidget(jSh.c("h3"));
      },
      update: function() {
        
      }
    },
    "h4": {
      node: function(params, context) {
        return new lcWidget(jSh.c("h4"));
      },
      update: function() {
        
      }
    },
    "h5": {
      node: function(params, context) {
        return new lcWidget(jSh.c("h5"));
      },
      update: function() {
        
      }
    },
    "h6": {
      node: function(params, context) {
        return new lcWidget(jSh.c("h6"));
      },
      update: function() {
        
      }
    }
  };


  // LCES DynText property statechange event handlers

  // For DynText tag parameters change.
  lces.dynText.onParamChange = function(propBase, param) {
    var newParam = "";
    
    param.forEach(function(i) {
      if (i.type === "text") {
        newParam += i.content;
      } else {
        var tempParam = propBase[i.name];
        
        if (i.handler && propBase.dynText.handlers[i.handler] && jSh.type(propBase.dynText.handlers[i.handler]) === "function")
          tempParam = propBase.dynText.handlers[i.handler](tempParam);
        
        newParam += tempParam;
      }
    });
    
    return newParam;
  }

  // For DynText tag content change
  lces.dynText.onContentChange = function(propBase, content) {
    var newContent = propBase[content.mainName];
    
    if (content.handler && propBase.dynText.handlers[content.handler] && jSh.type(propBase.dynText.handlers[content.handler]) === "function")
      newContent = propBase.dynText.handlers[content.handler](newContent);
    
    return newContent;
  }

  // For custom callback changes
  lces.dynText.onDynamicChange = function(propBase, prop) {
    if (jSh.type(prop.callback) !== "function")
      return false;
    
    var newProp  = "";
    
    // If it's one prop, it won't be treated like a concatenated string for non string values
    var singularProp = prop.parent.children.length === 1, singularValue;
    
    prop.parent.children.forEach(function(i) {
      var child = i.children[0];
      
      if (child.type === "text") {
        newProp += child.content;
      } else if (!child.context) {
        newProp += ""
      } else {
        var propCtx   = child.context;
        var tempProp  = propCtx[child.name];
        
        tempProp = tempProp === undf ? "" : tempProp;
        
        if (child.handler && jSh.type(propBase.dynText.handlers[child.handler]) === "function")
          tempProp = propBase.dynText.handlers[child.handler](tempProp);
        
        newProp += tempProp;
        
        if (singularProp)
          singularValue = tempProp;
      }
    });
    
    prop.callback(singularProp ? singularValue : newProp);
  }


  // Dynamic Text Lexer, returns list of tokens
  //
  // LCES DynText TOKEN TYPES: "text", "open", "close", "closed", "property"
  lces.dynText.lexerTypes = {
    "text": function(character) {
      return /[a-zA-Z\d_]/.test(character);
    },
    "number": function(character) {
      return /[\d]/.test(character);
    },
    "space": function(character) {
      return /[\t ]/.test(character);
    },
    "invalidPropChar": function(character) {
      return !(this.text(character) || this.number(character) || character === "#" || character === ".");
    }
  };

  lces.dynText.pushToken = function() {
    this.tokens.push({
      type: this.tokenType,
      content: this.tempToken
    });
  }

  lces.dynText.lexer = function(source /* c, index, string, lexTypes */) {
    var lexTypes = this.lexerTypes;
    
    for (var cIndex=0,cMaxL=source.length; cIndex<cMaxL; cIndex++) {
      var c = source[cIndex];
      
      if (this.tempToken !== null) {
        // Check if it's a property
        if (this.tokenType === "property") {
          if (c === "}") {
            if (this.tempToken)
              this.pushToken();
            
            this.tokenType = "text";
            this.tempToken = null;
            
          } else if (lexTypes.invalidPropChar(c)) {
            if (!this.forgiving) {
              var stringOff = cIndex > 10 ? cIndex - 5 : 0;
              var stringEnd = cIndex + 5;
              var cursorOff = cIndex - stringOff;
              var string = source.substr(stringOff, stringEnd).replace("\n", " ");
            
              this.tokens  = "Invalid property character \"" + c + "\" at character index " + cIndex +  " \n\n";
              this.tokens += "\"" + source + "\" \n";
              this.tokens += " " + jSh.nChars(" ", cursorOff < 0 ? 0 : cursorOff) + " ^";
              
              return false;
            } else {
              // Just make it a text token and move on
              this.tokenType = "text";
            }
          } else {
            this.tempToken += c;
          }
          
          
        // It's just text
        } else {
          // Escaping a character?
          if (c === "\\") {
            cIndex += 1;
            this.tempToken += source[cIndex + 1];
            
          // Start of a property? Opening/Closing Bracket?
        } else if (c === "{" || (c === "[" || c === "]") && this.allowTags) {
            if (this.tempToken)
              this.pushToken();
            
            this.tempToken = null;
            
            cIndex -= 1;
          } else {
            this.tempToken += c;
          }
        }
        
        // There's no active token
      } else {
        if (c === "{") {
          this.tokenType = "property";
          this.tempToken = "";
        } else if (c === "[" || c === "]") {
          this.tokenType = c === "[" ? "open" : "close";
          this.tempToken = null;
          
          if (this.tokenType === "open" && source[cIndex + 1] === "/") {
            cIndex += 1;
            this.tokenType = "closed";
          }
          
          this.pushToken();
        } else {
          this.tokenType = "text";
          this.tempToken = c;
        }
      }
    }
    
    // Is there a last token?
    if (this.tempToken)
      this.pushToken();
    
    return false;
  }

  // lces.dynText.processTokens(token, index, tokens)
  //
  // Description: lces.dynText.formatSyntax internal mechanism.
  lces.dynText.processTokens = function(token, index, tokens) {
    if (!token) {
      if (this.tempEntity !== this.entities) {
        if (!this.forgiving) {
          this.entities = "Error: Unexpected end of input";
          
          return false;
        } else {
          // Simply force things to work, no one cares.
          this.tempEntity = this.entities;
        }
      }
      
      return false;
    }
    
    // Are we dealing with params?
    if (this.entityContext === "tag") {
      if (token.type === "open") {
        if (!this.forgiving) {
          // Dynamic Text syntax error
          this.entities = "Syntax Error: Unexpected token type \"open\"";
          
          return false;
        } else {
          // Ignore it, just coerce it to be part of the params...
          this.tempEntity.params.push({
            type: this.tokenType,
            content: this.tempToken
          });
          
          return true;
        }
      } else if (token.type === "text") {
        this.tempEntity.params.push(token);
        
        return true;
      } else if (token.type === "property") {
        var propValues = token.content.split("#");
        
        if (propValues.length !== 2) {
          this.entities = "Syntax Error: Invalid property \"" + propValues[0] + "\"";
          
          return false;
        }
        
        this.tempEntity.params.push({
          type: "property",
          name: propValues[1],
          handler: propValues[0]
        });
        
        this.tempEntity.noParamRef = false;
        
        return true;
      } else if (token.type === "close") {
        if (this.tempEntity.params.length === 0) {
          this.entities = "Syntax Error: Empty opening tag";
          
          return false;
        }
        
        this.entityContext = "content";
        
        return true;
      }
    
    // We're dealing with entity content
    } else {
      if (token.type === "closed") {
        if (!tokens[index + 1] || !tokens[index + 2] || tokens[index + 1].type !== "text" || tokens[index + 2].type !== "close") {
          this.entities = "Syntax Error: Invalid closing tag";
          
          return false;
        }
        
        if (this.tempEntity === this.entities && !this.forgiving) {
          this.entities = "Syntax Error: Misplaced closing tag";
          
          return false;
        }
        
        this.tempEntity.type = tokens[index + 1].content;
        this.tokenIndex += 2;
        this.tempEntity = this.tempEntity.parent;
        
        return true;
      } else if (token.type === "open") {
        var tempEntity = {
          type: "text",
          params: [],
          children: [],
          noParamRef: true,
          noChildRef: true,
          parent: this.tempEntity
        };
        
        this.tempEntity.children.push(tempEntity);
        this.tempEntity = tempEntity;
        
        this.entityContext = "tag";
        return true;
      } else if (token.type === "text") {
        var tempEntity = {
          type: "text",
          params: [],
          children: [token],
          noParamRef: true,
          noChildRef: true,
          parent: this.tempEntity
        };
        
        this.tempEntity.children.push(tempEntity);
        
        return true;
      } else if (token.type === "property") {
        var propValues = token.content.split("#");
        
        if (propValues.length !== 2) {
          this.entities = "Syntax Error: Invalid property \"" + propValues[0] + "\"";
          
          return false;
        }
        
        var tempEntity = {
          type: "text",
          params: [],
          children: [{
            type: "property",
            name: propValues[1],
            handler: propValues[0]
          }],
          noParamRef: true,
          noChildRef: false,
          parent: this.tempEntity
        };
        
        this.tempEntity.children.push(tempEntity);
        
        this.tempEntity.noChildRef = false;
        
        var currEntity = this.tempEntity.parent;
        while (currEntity && currEntity.parent) {
          currEntity.parent.noChildRef = false;
          currEntity = currEntity.parent;
        }
        
        return true;
      }
    }
  }

  // lces.dynText.formatSyntax(tokens)
  //
  // tokens: Array of token objects
  //
  // Returns a formatted hieararchical representation of the inputted tokens
  // ready to be processed into their corresponding compenents, elements, listeners,
  // and states.
  lces.dynText.formatSyntax = function() {
    // Make our transparent container
    var main = {
      type: "main",
      params: [],
      children: [],
      noParamRef: true,
      noChildRef: true,
      parent: null
    };
    
    this.entities   = main;
    this.tempEntity = main;
    
    while (this.processTokens(this.tokens[this.tokenIndex], this.tokenIndex, this.tokens)) {
      this.tokenIndex += 1;
    }
    
    return this.entities;
  }

  // lces.dynText.getContext(property)
  //
  // Description: lces.dynText.createRenderedEntities internal mechanism.
  lces.dynText.getContext = function(property) {
    var objects  = property.split(".");
    var curObj   = this.context;
    
    objects.pop(); // The last one should be the statename
    
    if (objects.length === 0)
      return curObj;
    
    for (var i=0; i<objects.length; i++) {
      var ctx = curObj[objects[i]];
      
      if (!ctx || !(ctx instanceof Object)) {
        curObj[objects[i]] = new lcComponent();
        
        if (ctx && jSh.type(ctx) === "object")
          jSh.extendObj(curObj[objects[i]], ctx, ["LCESName"]);
      }
      
      curObj = curObj[objects[i]];
    }
    
    return curObj;
  }

  // lces.dynText.createRenderedEntities(entity)
  //
  // Description: lces.dynText.renderEntities internal mechanism.
  lces.dynText.createRenderedEntities = function CRE(entity, cb) {
    var component    = this.component;
    var propBase     = this.context;
    var parentEntity = entity.parent;
    
    // Is it just text or a property?
    if (entity.type === "text") {
      if (entity.noChildRef) {
        if (this.allowTags) {
          entity.element = jSh.d(undf, ih(entity.children[0].content)).firstChild; // To make sure it's innerHTML
          entity.parent.element.appendChild(entity.element);
        }
      } else {
        var prop     = entity.children[0];
        var mainProp = prop.name.split(".").pop();
        
        // Set property name for referencing in updates
        prop.mainName = mainProp;
        
        if (this.allowTags) {
          entity.element = jSh.c("span");
          prop.element   = entity.element;
          
          // Set property span's className from property name
          entity.element.className = prop.name.replace(/\./g, "-");
          
          entity.parent.element.appendChild(entity.element);
        }
        
        var curCtx    = this.getContext(prop.name);
        var isNotAuto = this.context._noAutoState[mainProp];
        
        if (isNotAuto) {
          prop.context = this.context;
        }
        
        // Does the property/state exist?
        var existed = false, oldValue;
        
        if (curCtx[mainProp] || (curCtx[mainProp] === false || curCtx[mainProp] === null || curCtx[mainProp] === 0 || curCtx[mainProp] === "")) {
          existed  = true;
          oldValue = curCtx[mainProp];
        }
          
        if (!curCtx.states[mainProp])
          curCtx.setState(mainProp);
        
        // Is it dynText'ivated?
        if (!curCtx.states[mainProp].dynTextContent) {
          curCtx.addStateListener(mainProp, function(value) {
            var contentProps = curCtx.states[mainProp].contentProps;
            
            if (!contentProps)
              return;
            
            for (var i=0,l=contentProps.length; i<l; i++) {
              var prop = contentProps[i];
              
              prop.element.innerHTML = lces.dynText.onContentChange(curCtx, prop);
            }
            
            // Trigger dynProp change event
            component.triggerEvent("dynpropchange", {property: this.name});
          });
          
          // For 'special' instances
          curCtx.addStateListener(mainProp, function(value) {
            var dynamicProps = curCtx.states[mainProp].dynamicProps;
            
            if (!dynamicProps || typeof cb !== "function")
              return;
            
            for (var i=0,l=dynamicProps.length; i<l; i++) {
              lces.dynText.onDynamicChange(propBase, dynamicProps[i]);
            }
            
            // Trigger dynProp change event
            component.triggerEvent("dynpropchange", {property: this.name});
          });
        }
        
        curCtx.states[mainProp].dynTextContent = true;
        
        // Check if tags e.g. [tagparam][/closingtag] are parsed or ignored
        if (this.allowTags) {
          // Normal innerHTML instances, nothing special.
          if (!curCtx.states[mainProp].contentProps)
            curCtx.states[mainProp].contentProps = [];
          
          curCtx.states[mainProp].contentProps.push(prop);
        } else {
          // Special instances, specific instances like single attributes etc.
          // Append our special CB function and properties
          jSh.extendObj(prop, {
            callback: cb,
            context: curCtx,
            parent: entity.parent,
            name: mainProp
          });
          
          if (!curCtx.states[mainProp].dynamicProps)
            curCtx.states[mainProp].dynamicProps = [];
          
          curCtx.states[mainProp].dynamicProps.push(prop);
        }
        
        // Set old value if it existed
        curCtx.setState(mainProp, oldValue, true);
      }
      
    // It's a tag
    } else if (entity.type !== "text") { // We shouldn't get here with this.allowTags on
      var entityType = lces.dynText.tags[entity.type] ? entity.type : "default";
      
      entity.element = lces.dynText.tags[entityType].node().element;
      entity.element.update = lces.dynText.tags[entityType].update;
      
      entity.parent.element.appendChild(entity.element);
      
      // Check for and setup params
      if (entity.params.length) {
        if (entity.noParamRef) {
          entity.element.update(entity.params[0].content);
          
        } else {
          entity.params.forEach(function(i) {
            
            if (i.name) {
              if (!propBase.states[i.name])
                propBase.setState(i.name);
              
              if (!propBase.states[i.name].dynTextParam)
                propBase.addStateListener(i.name, function(value) {
                  var paramProps = propBase.dynText.paramProps;
                  
                  for (var k=0,l=paramProps.length; k<l; k++) {
                    paramProps[k].element.update(lces.dynText.onParamChange(propBase, paramProps[k]));
                  }
                });
              
              propBase.states[i.name].dynTextParam = true;
            }
          });
          
          entity.params.element = entity.element;
          this.paramProps.push(entity.params);
        }
      }
      
      if (entity.children.length) {
        var CREBinded = CRE.bind(this);
        var children  = entity.children;
        
        for (var i=0,l=children.length; i<l; i++) {
          CREBinded(children[i]);
        }
      }
    }
    
    return entity.element;
  }

  // lces.dynText.renderEntities()
  //
  // Description: Converts all entity output from the token syntax
  // formatter that are stored in the this.dynText context to HTML
  // DOM elements.
  lces.dynText.renderEntities = function(cb) {
    var main     = document.createDocumentFragment();
    var dynText  = this;
    
    // this.currEntity = this.entities;
    
    // Set main container
    var that = this;
    this.entities.element = main;
    
    // Loop entities
    var children = this.entities.children;
    
    for (var i=0,l=children.length; i<l; i++) {
      dynText.createRenderedEntities(children[i], cb);
    }
    
    return main;
  }

  // lces.dynText.compile(dynText, callback)
  //
  // dynText:  String. To be compiled text with correct dynText syntax
  // callback: Function. Called if dynText.allowTags is false when a statechange occurs
  //
  // Description: Compiles the first argument string provided into dynText's so-called "entities"
  //   that are then made into DOM elements (If .allowTags isn't falsy). Otherwise they are just
  //   preserved for their order and calls the callback provided instead.
  lces.dynText.compile = function(s, cb, context) {
    if (!s || typeof s !== "string")
      return false;
    
    var that = this;
    
    // Some lexing variables
    this.tokens = [];
    this.tempToken = null;
    this.tokenType = "text";
    this.charIndex = 0;
    
    // For formatting
    this.tokenIndex = 0;
    this.tempEntity = null;
    
    // For rendering and setting up entities and their properties
    this.handlers     = jSh.extendObj({}, this.handlers);
    this.contentProps = [];
    this.paramProps   = [];
    
    if (context) {
      this.context = context;
    }
    
    // Lexical analysis
    this.lexer(s);
    
    if (typeof this.tokens === "string")
      throw Error(this.tokens);
    
    // Generate entities
    var entities = this.formatSyntax();
    
    if (typeof entities === "string")
      throw Error(entities);
    
    // Render output
    var mainFrag = this.renderEntities(cb);
    
    // Check for DynText links, if none found do nothing. TODO: Check this procedure
    if (entities.noChildRef) {
      if (this.element && this.allowTags) {
        if (this.element.childNodes[0])
          this.element.removeChild(jSh.toArr(this.element.childNodes));
        
        this.element.appendChild(mainFrag);
      }
      return false;
    }
    
    // TODO: DRY PRINCIPLE! ENFORCE!!!
    if (this.element) {
      var mainElement = this.element;
      
      if (mainElement.childNodes[0])
        mainElement.removeChild(jSh.toArr(mainElement.childNodes));
      
      mainElement.appendChild(mainFrag);
    }
    
    if (context) {
      this.context = this.component;
    }
    
    // If checking for dyn links, then they exist
    return true;
  }

  // Dynamic Text Handlers
  //

  // Handlers that'll be included by default
  lces.dynText.handlers = {
    trim: function(s) {
      return (s + "").trim();
    }
  };

  // lces.dynText.dynSanitize(raw)
  //
  // Description: Sanitizes strings of possible dynText error prone triggers
  lces.dynText.dynSanitize = function(str) {
    return str.replace(/\{|\[/g, "\\$1");
  }


  // lcDynamicText(fresh)
  //
  // fresh: Boolean. Optional. If set to non-falsy value, will ignore
  //        any older dynText configurations... WARNING/TODO: May cause
  //        nasty conflicts and side effects.
  //
  // Description: Called in the context of an lcWidget component
  // and adds a textual linking functionality that links portions
  // of it's innerText/innerHTML to specified lces states/properties
  // for said lcWidget component.
  //
  // Example:
  //   x.text = "Just so you know, {#soda} isn't as healthy as {#fruit} juice. [url:{#moreInfoURL}]Learn More[/url]"
  //
  // Which links the portions of the text enclosed in the curly braces format to
  // the following states:
  //   x.soda  = "Coca Cola";
  //   x.fruit = "apple";
  //   x.moreInfoURL = "http://some.health-site.com/soda-delicious-but-harmful/";
  //
  // And the innerText/innerHTML will update accordingly
  window.lcDynamicText = function(fresh) {
    if (this.dynText && !fresh)
      return;
    
    var that = this;
    
    this.dynText = {
      // For lexing
      charIndex: 0,
      tokenType: "text", // Current token type by Lexer
      tempToken: null,   // String to contain current token value
      tokens: [],
      
      // For syntax reformatting
      tokenIndex: 0,
      tempEntity: null,
      entityContext: "content", // "tag", "content"
      entities: {},
      
      // POST Reformatting Data containers
      states: {},
      handlers: {},
      contentProps: [],
      paramProps: [],
      
      context: this,
      component: this,
      element: this.element
    };
    
    // Prop change event
    this.addEvent("dynpropchange");
    
    // EXTENDS POSSIBLY EXISTING PROPERTIES/STATES WITH
    // state["dynTextParam"] or state["dynTextContent"]
    
    jSh.extendObj(this.dynText, lces.dynText);
    
    // To compile to dynText you have set Component.dynTextTrigger = "STATE_NAME"
    if (this.dynTextTrigger) {
      var dynTextTrigger = this.dynTextTrigger;
      
      this.addStateListener(dynTextTrigger, function(text) {
        that.dynText.compile(text);
      });
    }
  }


  // Misellaneous 'small' lces functions

  // LCES UI ScrollTo Function

  lces.ui.setState("scrollY", scrollY);
  lces.ui.addStateListener("scrollY", function(height) {
    if (jSh.type(height) === "object" && height.element || height instanceof Node) {
      var element = height.element || height;
      var bcr     = element.getBoundingClientRect();
      var offH    = element.offsetHeight;
      
      height = bcr.top + scrollY - ((innerHeight) / 2) + (offH / 2);
    }
    
    if (isNaN(height))
      return false;
    
    var diff = height - scrollY;
    var cur  = scrollY;
    
    scrollTo(scrollX, height);
    lces.ui.scrollY = undefined;
    
    // clearQS(lces.ui._scrollProcess);
    //
    // function func01(n) {
    //   scrollTo(scrollX, cur + (n * diff));
    // }
    //
    // function end01() {
    //   lces.ui.scrollY = undefined;
    // }
    //
    // lces.ui._scrollProcess = new qsFadein(func01, 0, 1, 0.35, end01, undf, true, 0.002);
  });

  lces.ui.states["scrollY"].get = function() {
    return scrollY;
  }


  // LCES Resizing Event
  lces.ui.addEvent("resize");
  
  var resizeTimeout = null;
  var oldWidth  = 0;
  var oldHeight = 0;
  
  lces.ui.assertResized = function(e, init) {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    } else if (!init) {
      oldWidth  = innerWidth;
      oldHeight = innerHeight;
    }
    
    resizeTimeout = setTimeout(function() {
      lces.ui.triggerEvent("resize", {oldWidth: oldWidth, oldHeight: oldHeight, width: innerWidth, height: innerHeight});
      
      resizeTimeout = null;
    }, init ? 0 : 500);
  }
  
  window.addEventListener("resize", lces.ui.assertResized);
  
  
  // LCES Mobile
  //
  // Anchor all state listeners for mobile to
  // lces.ui.mobile
  lces.ui.setState("mobile", null);
  lces.ui.mobileWidth = 560;

  // Can be used to manually for mobile sized viewport
  lces.ui.assertMobile = function() {
    if (innerWidth <= lces.ui.mobileWidth)
      lces.ui.mobile = true;
    else
      lces.ui.mobile = false;
  }

  window.addEventListener("resize", lces.ui.assertMobile);
  
  // To know if using a mobile device
  var mobileVendors = /Android|webOS|iPhone|iPod|BlackBerry|Windows Phone/i;
  
  lces.ui.mobileDevice = Math.max(screen.width || screen.availWidth, screen.height || screen.availHeight, 800) === 800 && mobileVendors.test(navigator.userAgent);
  
  // LCES URL API
  
  
    lces.url = new lcComponent();

    // Store the triggers in the order of their appearance
    // e.g. .com/cp/go/furnitures/chairs
    //
    // Format:
    // url.triggers = {
    //   cp: {
    //     go: function(category, type) {
    //       // Do stuff
    //     }
    //   }
    // }
    // Or just:
    // url.triggers = {go: function(category, type) {...}}
    //
    // Which is called like this, if like the latter example then no cp.:
    //  lces.url.cp.go("furnitures", "chairs")
    lces.url.setState("triggers", {});
    
    lces.url.addStateCondition("triggers", function() {
      var triggers = this.stateStatus;
      
      if (jSh.type(triggers) === "object") {
        function removeParentLink(cur) {
          cur.__ = null;
          
          var triggerNames = Object.getOwnPropertyNames(cur);
          
          for (var i=0,l=triggerNames.length; i<l; i++) {
            if (triggerNames[i] !== "__" && jSh.type(cur[triggerNames[i]]) === "object")
              removeParentLink(cur[triggerNames[i]]);
          }
        }
        
        removeParentLink(triggers);
      }
      
      return true;
    });
    
    lces.url.addStateListener("triggers", function(triggers) {
      if (jSh.type(triggers) === "object") {
        function addParentLink(prev, cur) {
          if (prev)
            cur.__ = prev;
          
          var triggerNames = Object.getOwnPropertyNames(cur);
          
          for (var i=0,l=triggerNames.length; i<l; i++) {
            if (triggerNames[i] !== "__" && jSh.type(cur[triggerNames[i]]) === "object")
              addParentLink(cur, cur[triggerNames[i]]);
          }
        }
        
        addParentLink(null, triggers);
      }
    });

    // A count of the triggers in url.triggers
    lces.url.setState("triggerCount", 0);

    // If true LCESURL will react to popstate events
    lces.url.setState("acceptChange", false);


    // TriggerCount Getter
    lces.url.states["triggerCount"].get = function() {
      return Object.getOwnPropertyNames(lces.url.triggers).length;
    }

    // Events
    lces.url._onURLChange = function() {
      var func = lces.url.process();
      
      if (!func) {
        if (jSh.type(lces.url.triggers._default) === "function")
          lces.url.triggers._default();
        
        return false;
      }
      
      func.func.apply(this, func.args);
    }

    lces.url.addStateListener("acceptChange", function(accept) {
      if (accept) {
        window.addEventListener("popstate", lces.url._onURLChange);
      } else {
        window.removeEventListener("popstate", lces.url._onURLChange);
      }
    });

    // Methods
    lces.url.process = function() {
      var loc        = location.pathname.substr(1);
      
      // Remove trailing slash if any
      if (/^([^\/]+\/)+$/i.test(loc))
        loc = loc.substr(0, loc.length - 1);
      
      var url        = loc.split("/");
      var startIndex = null;
      
      url.every(function(i, index) {
        if (lces.url.triggers[i]) {
          startIndex = index;
          return false;
        }
        
        return true;
      });
      
      // Check if failed to locate starter object/function
      if (startIndex === null)
        return false;
      
      
      var func      = null;
      var args      = null;
      var curObject = null;
      
      function isFunction(o) {
        return typeof o === "function";
      }
      
      url.every(function(i, index, arr) {
        if (index >= startIndex) {
          var curr = curObject ? curObject[url[index]] : lces.url.triggers[url[index]];
          
          if (!curr) {
            return false;
          }
          
          if (index === arr.length - 1 && jSh.type(curr) === "object" && isFunction(curr["."])) {
            func = curr["."];
            args = url.slice(index + 1);
            
            return false;
          } else if (isFunction(curr)) {
            func = curr;
            args = url.slice(index + 1);
            
            return false;
          }
          
          curObject = curr;
        }
        
        return true;
      });
      
      
      if (!func)
        return false;
      
      return {func: func.bind(curObject), args: args};
    }
    
    var history = window.history;
    lces.url.set = function(url) {
      history.pushState(null, null, url);
    }
}
// LCES Templating System
lces.rc[4] = function() {
  lces.template = function template(options) {
    if (!options)
      throw Error("lces.template() requires one options object as the first argument");
    
    if (!options.render)
      throw Error("lces.template(options) options object must contain a MockupElement as a render property");
    
    if (!(options.render instanceof jSh.MockupElement))
      throw Error("Element provided does not implement the jSh.MockupElement interface");
    
    return template.build(options);
  }
  
  // Template add initiation function method
  lces.template.addInit = function(func) {
    if (typeof func === "function")
      this.__initFuncs.push(func);
  }
  
  // Template remove initiation function method
  lces.template.removeInit = function(func) {
    var index = this.__initFuncs.indexOf(func);
    
    if (index !== -1)
      this.__initFuncs.splice(index, 1);
  }
  
  lces.template.tokenTypes = {
    GROUP: 0, // Parens
    REFERENCE: 1, // Variable reference
    PRIMITIVE: 2, // String or number
    MODIFIER: 3, // Addition, subtraction, etc
    COMPARISON: 4, // Equality or greater/less than
    BOOLEAN: 5 // Logical operators: && or ||
  };
  
  lces.template.expressionLexer = function(source, options) {
    var tokenTypes = lces.template.tokenTypes;
    
    var mainTokens = [];
    var tokens     = mainTokens;
    
    mainTokens.map   = {};
    mainTokens.depth = [];
    mainTokens.refs  = [];
    
    var isIdentifierStart = /[a-zA-Z_$]/;
    var isIdentifier      = /[a-zA-Z_\d\.\s$]/;
    var isNumberStart     = /\d/;
    var isNumber          = /[\d\.]/;
    var isCondOperator    = /[=<>!]/;
    var isGLTOperator     = /[><]/; // Greater/Less Than
    var isBoolOperator    = /[&|]/;
    var isMutOperator     = /[*\-+\/%]/;
    var isUnaryOperator   = /[!-]/;
    var isStringStart     = /["']/;
    
    var char = "";
    var curGroup = null;
    var curToken = null;
    var curTokenContent = null;
    var inString = false;
    var strQuote = '"';
    var inIdentifier = false;
    var finishIdentifierName = false;
    var negated = false;
    var negatedLogical = false;
    
    function getLastTokenType() {
      var lastToken = tokens[tokens.length - 1];
      
      return (lastToken || {}).type;
    }
    
    function checkValidValueToken(type, i) {
      var lastToken = tokens[tokens.length - 1];
      
      if (lastToken instanceof Object) {
        var lastTokenType = lastToken.type;
        
        // Confirm valid token order
        switch (lastTokenType) {
          case tokenTypes.PRIMITIVE:
          case tokenTypes.GROUP:
          case tokenTypes.REFERENCE:
            throw new SyntaxError("LCES Template Expression: Unexpected " + type + " at col " + i);
            break;
        }
      }
    }
    
    function checkValidOperatorToken(type, i) {
      var lastToken = tokens[tokens.length - 1];
      
      if (lastToken instanceof Object) {
        var lastTokenType = lastToken.type;
        
        // Confirm valid token order
        switch (lastTokenType) {
          case tokenTypes.MODIFIER:
          case tokenTypes.COMPARISON:
          case tokenTypes.BOOLEAN:
            throw new SyntaxError("LCES Template Expression: Unexpected " + type + " at col " + i);
            break;
        }
      } else {
        throw new SyntaxError("LCES Template Expression: Unexpected " + type + " at col " + i);
      }
    }
    
    // Token ID for reference purposes
    var curTokenID = 0;
    var curDepth   = -1;
    
    for (var i=0,l=source.length; i<l; i++) {
      char = source[i];
      
      if (!inString) {
        if (char === " ") {
          // Do nothing in whitespace
        } else if (isIdentifierStart.test(char)) {
          if (options.noReference)
            throw new SyntaxError("LCES Template Expression: Reference variables disabled in expression. At col " + i);
          
          checkValidValueToken("identifier", i);
          
          // Add identifier
          curToken = [];
          curTokenContent = "";
          finishIdentifierName = false;
          
          while (isIdentifier.test(char) && char) {
            if (char !== "." && char !== " ") {
              if (finishIdentifierName)
                throw new SyntaxError("LCES Template Expression: Unexpected token \"" + char + "\" at col " + i + " expected \".\"");
              
              inIdentifier = false;
              curTokenContent += char;
            } else if (char === " ") {
              finishIdentifierName = true;
              
              curToken.push(curTokenContent);
              curTokenContent = "";
            } else {
              if (!finishIdentifierName) {
                curToken.push(curTokenContent);
                curTokenContent = "";
              }
              
              inIdentifier = true;
              finishIdentifierName = false;
            }
            
            i++;
            char = source[i];
          }
          
          if (inIdentifier)
            throw new SyntaxError("LCES Template Expression: Unexpected token \"" + char + "\" at col " + i + " expected identifier");
          
          if (curTokenContent)
            curToken.push(curTokenContent);
          
          // `a.b` in `a.b.c`
          var lastIndex = curToken.length - 1;
          var ctxPath   = curToken.slice(0, lastIndex);
          var varName   = curToken[lastIndex];
          
          var newReference = {
            id: curTokenID,
            type: tokenTypes.REFERENCE,
            name: curToken,
            nameStr: curToken.join("."),
            varName: varName,
            context: ctxPath,
            contextStr: ctxPath.join("."),
            value: null,
            negated: negated,
            negatedLogical: negatedLogical
          };
          
          tokens.push(newReference);
          mainTokens.refs.push(newReference);
          curToken = null;
          curTokenContent = null;
          mainTokens.map[curTokenID] = newReference;
          
          curTokenID++;
          
          // Go back to previous char, since we're now on a char that's not
          // part of the identifier
          if (char)
            i--;
          
          negated = false;
        } else if (isNumberStart.test(char)) {
          if (options.noNumbers)
            throw new SyntaxError("LCES Template Expression: Number primitives disabled in expression. At col " + i);
          
          checkValidValueToken("number", i);
          
          curTokenContent = "";
          var passedDecimalPoint = false;
          var numbersAfterDecimal = false;
          
          while (isNumber.test(char)) {
            if (char === ".") {
              if (passedDecimalPoint) {
                throw new SyntaxError("LCES Template Expression: Unexpected token \"" + char + "\" at col " + i);
              } else {
                passedDecimalPoint = true;
              }
            } else if (passedDecimalPoint) {
              // Make sure no erronous trailing periods
              numbersAfterDecimal = true;
            }
            
            curTokenContent += char;
            
            i++;
            char = source[i];
          }
          
          if (passedDecimalPoint && !numbersAfterDecimal)
            throw new SyntaxError("LCES Template Expression: Unexpected token \"" + char + "\" at col " + i + " expected decimal numbers");
          
          var tokenValue = parseFloat(curTokenContent);
          
          if (negated) {
            tokenValue *= -1;
          }
          
          tokens.push({
            id: curTokenID,
            type: tokenTypes.PRIMITIVE,
            value: tokenValue
          });
          curToken = null;
          curTokenContent = null;
          
          curTokenID++;
          
          // Go back to previous char, since we're now on a char that's not
          // part of the number
          if (char)
            i--;
          
          negated = false;
        } else if (isStringStart.test(char)) {
          if (options.noStrings)
            throw new SyntaxError("LCES Template Expression: String primitives disabled in expression. At col " + i);
          
          checkValidValueToken("string", i);
          
          inString = true;
          strQuote = char;
          
          curToken = [];
          curTokenContent = "";
          negated = false;
        } else if (char === "(") {
          checkValidValueToken("open paren", i);
          
          curGroup = {
            id: curTokenID,
            type: tokenTypes.GROUP,
            value: [], // Tokens stored here
            negated: negated
          };
          
          mainTokens.map[curTokenID] = curGroup;
          curTokenID++;
          curDepth++;
          
          tokens.push(curGroup);
          curGroup.value.parent = tokens;
          
          // Add to depth array
          var curDepthArray = mainTokens.depth[curDepth];
          
          if (!curDepthArray) {
            curDepthArray = [];
            mainTokens.depth[curDepth] = curDepthArray;
          }
          
          curDepthArray.push(curGroup);
          
          tokens = curGroup.value;
          negated = false;
        } else if (char === ")") {
          checkValidOperatorToken("close paren", i); // Make sure no weird tokens ending it
          
          if (!tokens.parent || tokens.length === 1) {
            throw new SyntaxError("LCES Template Expression: Unexpected closing paren \"" + char + "\" at col " + i);
          } else {
            tokens = tokens.parent;
          }
          
          curDepth--;
        } else if (isUnaryOperator.test(char) &&
                  (getLastTokenType() === tokenTypes.MODIFIER ||
                   getLastTokenType() === tokenTypes.COMPARISON ||
                   getLastTokenType() === tokenTypes.BOOLEAN ||
                   curTokenID === 0)) {
          negated = true;
          negatedLogical = char === "!";
        } else if (isMutOperator.test(char)) {
          if (options.noArithmetic)
            throw new SyntaxError("LCES Template Expression: Arithmetic operators disabled in expression. At col " + i);
          
          checkValidOperatorToken(char, i);
          
          tokens.push({
            id: curTokenID,
            type: tokenTypes.MODIFIER,
            value: char
          });
          
          curTokenID++;
          
          curToken = null;
          curTokenContent = null;
        } else if (isCondOperator.test(char)) {
          if (options.noCompare)
            throw new SyntaxError("LCES Template Expression: Comparison operators disabled in expression. At col " + i);
          
          checkValidOperatorToken(char, i);
          
          var next   = source[i + 1];
          var curCol = i;
          
          if (isGLTOperator.test(char) && next === "=") {
            tokens.push({
              id: curTokenID,
              type: tokenTypes.COMPARISON,
              value: char + "=",
              col: curCol
            });
            
            i++;
          } else {
            var extraChars = "";
            
            if (char === "=" || char === "!") {
              var next  = source[i + 1];
              var next2 = source[i + 2];
              
              if (next !== "=")
                throw new SyntaxError("LCES Template Expression: Unexpected token \"" + next + "\" at col " + i + " expected \"=\"");
              
              if (next2 === "=") {
                extraChars += "=";
                i++;
              }
              
              extraChars += "=";
              i++;
            }
            
            tokens.push({
              id: curTokenID,
              type: tokenTypes.COMPARISON,
              value: char + extraChars,
              col: curCol
            });
          }
          
          curToken = null;
          curTokenContent = null;
          
          curTokenID++;
        } else if (isBoolOperator.test(char)) {
          checkValidOperatorToken(char, i);
          
          var next = source[i + 1];
          
          if (next !== char)
            throw new SyntaxError("LCES Template Expression: Unexpected token \"" + next + "\" at col " + i + " expected \"" + char + "\"");
          
          tokens.push({
            id: curTokenID,
            type: tokenTypes.BOOLEAN,
            value: char + char,
            col: curCol
          });
          
          curToken = null;
          curTokenContent = null;
          
          i += 1;
          curTokenID++;
        } else {
          throw new SyntaxError("LCES Template Expression: Illegal character \"" + char + "\" at col " + i);
        }
      } else {
        if (char === "\\") {
          // Skip over next char
          i += 1;
          
          curTokenContent += source[i];
        } else if (char === strQuote) {
          tokens.push({
            id: curTokenID,
            type: tokenTypes.PRIMITIVE,
            value: curTokenContent
          });
          
          curToken = null;
          curTokenContent = null;
          
          curTokenID++;
          inString = false;
        } else {
          curTokenContent += char;
        }
      }
    }
    
    if (tokens !== mainTokens) {
      throw new SyntaxError("LCES Template Expression: Unterminated parens in: `" + source + "`");
    } else if (inString) {
      throw new SyntaxError("LCES Template Expression: Unterminated string literal in: `" + source + "`");
    }
    
    checkValidOperatorToken("termination of input", i); // Make sure no weird tokens ending it
    
    return mainTokens;
  }
  
  lces.template.processTokens = function(tokens) {
    var tree  = [];
    var depth = tokens.depth;
    var tokenTypes = lces.template.tokenTypes;
    
    var currentTokens = null;
    var compareTree   = [];
    var compareMap    = {};
    
    compareTree.tokenMap   = tokens.map;
    compareTree.groupMap   = {};
    compareTree.references = []; // Variable references
    compareTree.rawValue   = false;
    
    var overallTokenCount = 0;
    
    // Check for comparisons
    for (var i=depth.length-1; i>=-1; i--) {
      var groupDepth = depth[i];
      var newDepth   = [];
      
      compareTree.push(newDepth);
      
      if (!groupDepth) {
        // i must be -1, Reached the first group, ground zero i.e. not in a parens anymore
        groupDepth = [{
          value: tokens
        }];
      }
      
      for (var j=groupDepth.length-1; j>=0; j--) {
        var group    = groupDepth[j];
        var gTokens  = group.value;
        var newGroup = {
          sides: [[[], []]],
          operator: [null],
          bool: [null], // && or ||
          value: 0, // During evaluation phases
          negated: group.negated
        };
        
        if ("id" in group) {
          newGroup.id = group.id;
          compareMap[group.id] = newGroup;
        } else {
          newGroup.id = "zero";
        }
        
        newDepth.push(newGroup);
        
        var curSides      = newGroup.sides[0];
        var curSidesIndex = 0;
        
        var lhs = curSides[0];
        var rhs = curSides[1];
        
        var onRightSide     = false;
        var compareOperator = null;
        
        for (var k=0,l=gTokens.length; k<l; k++) {
          var token         = gTokens[k];
          var tokenIsString = false;
          var tokenType     = token.type;
          var valueType     = typeof token.value;
          
          overallTokenCount++;
          
          if (tokenType === tokenTypes.BOOLEAN) {
            onRightSide = false;
            compareOperator = null;
            
            curSides = [[], []];
            newGroup.sides.push(curSides);
            newGroup.operator.push(null);
            newGroup.bool.push(null);
            newGroup.bool[curSidesIndex] = token.value;
            
            lhs = curSides[0];
            rhs = curSides[1];
            
            curSidesIndex++;
          } else if (tokenType === tokenTypes.COMPARISON) {
            if (onRightSide)
              throw new SyntaxError("LCES Template Expression: Unexpected token \"" + token.value + "\" at col " + token.col + ", multiple adjacent comparison operators aren't allowed");
            
            onRightSide     = true;
            compareOperator = token.value;
            newGroup.operator[curSidesIndex] = compareOperator;
          } else {
            switch (tokenType) {
              case tokenTypes.PRIMITIVE:
                if (valueType === "string")
                  tokenIsString = true;
                break;
              case tokenTypes.REFERENCE:
                compareTree.references.push(token);
                break;
            }
            
            if (onRightSide) {
              rhs.push(token);
              
              if (tokenIsString)
                rhs.string = true;
            } else {
              lhs.push(token);
              
              if (tokenIsString)
                lhs.string = true;
            }
          }
        }
      }
      
      newDepth.reverse();
    }
    
    var opRankArr = ["-", "+", "*", "%", "/"];
    function opRank(char) {
      return opRankArr.indexOf(char);
    }
    
    // Order and convert tokens to operations
    for (var i=0,l=compareTree.length; i<l; i++) {
      var curDepth = compareTree[i];
      
      for (var j=0,l2=curDepth.length; j<l2; j++) {
        var curGroup = curDepth[j];
        var sidesArr = curGroup.sides;
        
        for (var jj=0,ll=sidesArr.length; jj<ll; jj++) {
          var sides = sidesArr[jj];
          
          var lhs = [];
          var rhs = [];
          
          for (var k=0; k<sides.length; k++) {
            var side = sides[k];
            
            var add = [];
            var subtract = [];
            var special = []; // Multiplication, division, modulo...
            var lastOperation = "+";
            var oldLastOperation = lastOperation;
            var olderLastOperation = lastOperation;
            var oldLastMajorOperation = null;
            var oldLastMajorAdditive = true;
            var lastSign = 1;
            var lastSpecial = null;
            // var curSpecial = null; // FIXME: This might be useless
            var lastToken = null;
            var lastValueToken = null;
            var lastMergedSpecial = null;
            var swapNextToken = false; // Since the previous had a low value
            
            function determineGroup(op) {
              switch (op) {
                case "+":
                  return add;
                  break;
                case "-":
                  return subtract;
                  break;
                default:
                  return lastSpecial;
                  break;
              }
            }
            
            for (var ii=0,l3=side.length; ii<l3; ii++) {
              var token     = side[ii];
              var nextToken = side[ii + 1];
              
              switch (token.type) {
                case tokenTypes.GROUP:
                case tokenTypes.REFERENCE:
                case tokenTypes.PRIMITIVE:
                  switch (lastOperation) {
                    case "*":
                    case "/":
                    case "%": {
                      var higherOpValue = !nextToken || opRank(lastOperation) >= opRank(nextToken.value);
                      
                      if (!nextToken || higherOpValue) {
                        if (token.type === tokenTypes.PRIMITIVE)
                          lastSpecial.push(token.value);
                        else
                          lastSpecial.push({id: token.id, type: token.type, LCESValueType: true}); // Group or reference
                        
                        lastValueToken = null;
                      } else {
                        lastValueToken = token;
                        
                        if (!higherOpValue)
                          swapNextToken = true;
                      }
                      
                      break;
                    }
                    
                    case "+":
                    case "-": {
                      var array = lastOperation === "+" ? add : subtract;
                      
                      if (!nextToken || opRank(lastOperation) >= opRank(nextToken.value) || nextToken.value === "+") {
                        if (token.type === tokenTypes.PRIMITIVE)
                          array.push(token.value);
                        else
                          array.push({id: token.id, type: token.type, LCESValueType: true}); // Group or reference
                        
                        lastValueToken = null;
                      } else {
                        lastValueToken = token;
                      }
                      
                      break;
                    }
                    
                    default: {
                      lastValueToken = token;
                    }
                  }
                  
                  break;
                case tokenTypes.MODIFIER:
                  olderLastOperation = oldLastOperation;
                  oldLastOperation = lastOperation;
                  oldLastMajorOperation = special[special.length - 1];
                  lastOperation = token.value;
                  
                  switch (lastOperation) {
                    case "-": {
                      lastSign = -1;
                      oldLastMajorAdditive = true;
                      break;
                    }
                    
                    case "+": {
                      lastSign = 1;
                      oldLastMajorAdditive = true;
                      break;
                    }
                    
                    case "*":
                    case "/":
                    case "%": {
                      var prevOpHigher = opRank(oldLastOperation) > opRank(lastOperation);
                      var secondMergedWithLastSpecial = false;
                      
                      if ((lastOperation === oldLastOperation ||
                          prevOpHigher)) {
                        if (lastValueToken) {
                          var opGroup = determineGroup(oldLastOperation);
                          
                          if (lastValueToken.type === tokenTypes.PRIMITIVE)
                            opGroup.push(lastValueToken.value);
                          else
                            opGroup.push({id: lastValueToken.id, type: lastValueToken.type}); // Group or reference
                          
                          lastValueToken = null;
                        }
                        
                        if (prevOpHigher && lastOperation !== "+" && lastOperation !== "-") {
                          if (!oldLastMajorAdditive && oldLastOperation !== "+" && oldLastOperation !== "-" && oldLastMajorOperation && oldLastMajorOperation[0] === lastOperation) {
                            secondMergedWithLastSpecial = true;
                          } else {
                            var lastSpecial = [lastOperation, lastSign, lastSpecial];
                            var mergedWithLastSpecial = true;
                          }
                        } else {
                          var mergedWithLastSpecial = false;
                        }
                      } else {
                        var lastSpecial    = [lastOperation, lastSign];
                        var oldLastSpecial = special[special.length - 1];
                        
                        if (lastValueToken) {
                          if (lastValueToken.type === tokenTypes.PRIMITIVE)
                            lastSpecial.push(lastValueToken.value);
                          else
                            lastSpecial.push({id: lastValueToken.id, type: lastValueToken.type}); // Group or reference
                          lastValueToken = null;
                        }
                        
                        if (!oldLastMajorAdditive && oldLastSpecial) {
                          var oldLastSpecialOp = oldLastSpecial[0];
                          
                          if (opRank(oldLastSpecialOp) < opRank(lastOperation)) {
                            secondMergedWithLastSpecial = true;
                            oldLastSpecial.push(lastSpecial);
                          }
                        }
                        
                        var mergedWithLastSpecial = false;
                      }
                      
                      if (!secondMergedWithLastSpecial) {
                        if (mergedWithLastSpecial) {
                          special[special.length - 1] = lastSpecial;
                        } else if (lastOperation !== oldLastOperation) {
                          special.push(lastSpecial);
                        }
                      }
                      
                      oldLastMajorAdditive = false;
                      lastSign = 1; // Since any following operations will likely be merged with this one
                      break;
                    }
                  }
                  
                  break;
              }
              
              lastToken = token;
            }
            
            sides[k] = {
              add: add,
              subtract: subtract,
              special: special
            };
          }
        }
      }
    }
    
    if (overallTokenCount === 1 && compareTree.references.length)
      compareTree.rawValue = true;
    
    // compareTree.reverse(); // No need to reverse
    return compareTree;
  }
  
  // parseExpression(String expr[, Object options])
  //
  // expr: String: Non-empty string of expression
  // options: Optional. Object: Options to observe over the parsing phase
  //
  // Example `options`: (default values)
  //  {
  //    noStrings: false,
  //    noNumbers: false,
  //    noCompare: false, // Comparison operators: ===, !==, >, <, <=, etc
  //    noArithmetic: false,
  //    noReference: false
  //  }
  //
  // Description: Parses expressions whilst observing options provided (if any)
  //              and a structured tree that is fit evaluation in the Expression
  //              Evaluator. @see `lces.template.evaluateExpression()`
  lces.template.parseExpression = function(expr, options) {
    if (typeof expr !== "string" || !expr.trim())
      throw new Error("LCES Expression must be a valid non-empty string");
    
    // Parse and tokenize expression
    var tokens = lces.template.expressionLexer(expr, options || {});
    
    // Group and organize tokens in tree/operation order
    var compiledTokens = lces.template.processTokens(tokens);
    
    return compiledTokens;
  }
  
  // Return variable reference values from {context}, e.g. `a.b` in: a.b * 5
  function expressionLoadReferenceValue(reference, context, cache) {
    var ctxStr  = reference.contextStr;
    var varName = reference.varName;
    var negated = reference.negated;
    
    if (!ctxStr) {
      var value = context[varName];
      
      if (negated) {
        if (reference.negatedLogical) {
          return !value;
        } else {
          switch (typeof value) {
            case "number":
              return value * -1;
              break;
            default:
              return !value;
          }
        }
      } else {
        return value;
      }
    }
    
    var ctx      = reference.context;
    var path     = reference.name;
    var pathStr  = reference.nameStr;
    var cacheCtx = cache[ctxStr];
    
    if (cacheCtx) {
      return cacheCtx[varName];
    }
    
    var lastObject = context;
    
    for (var i=0,l=ctx.length; i<l; i++) {
      try {
        lastObject = lastObject[ctx];
      } catch (e) {
        throw new ReferenceError("LCES Expression Eval: Context object lacks sufficient depth");
      }
    }
    
    cache[ctxStr] = lastObject;
    var value = lastObject[varName];
    
    if (negated) {
      if (reference.negatedLogical) {
        return !value;
      } else {
        switch (typeof value) {
          case "number":
            return value * -1;
            break;
          default:
            return !value;
        }
      }
    } else {
      return value;
    }
  }
  
  // Evaluate * % / multiplication, modulo, division
  function expressionEvalSpecial(special, context, cache) {
    var out  = null;
    var op   = special[0];
    var sign = special[1];
    
    for (var i=2,l=special.length; i<l; i++) {
      var value     = special[i];
      var realValue = 0;
      
      if (isNaN(value)) {
        if (value instanceof Array) {
          realValue = expressionEvalSpecial(value, context, cache);
        } else if (value.type === tokenTypes.GROUP) {
          realValue = groupValueMap[value.id];
        } else {
          // It's a reference...
          realValue = expressionLoadReferenceValue(tokenMap[value.id], context, cache);
        }
      } else {
        realValue = value;
      }
      
      if (out !== null) {
        switch (op) {
          case "*":
            out *= realValue;
            break;
          case "%":
            out %= realValue;
            break;
          case "/":
            out /= realValue;
            break;
        }
      } else {
        out = realValue;
      }
    }
    
    return out * sign;
  }
  
  lces.template.evaluateExpression = function(compiledExpr, context, cache) {
    var tokenTypes    = lces.template.tokenTypes;
    var tokenMap      = compiledExpr.tokenMap;
    var groupValueMap = {};
    var rawValue      = compiledExpr.rawValue;
    
    if (!context) {
      context = {};
    }
    
    if (!cache) {
      cache = {};
    }
    
    for (var i=0,l=compiledExpr.length; i<l; i++) {
      var depth = compiledExpr[i];
      
      depthLoop:
      for (var j=0,l2=depth.length; j<l2; j++) {
        var group = depth[j];
        
        var curSidesValues = [];
        
        sidesLoop:
        for (var jj=0,ll=group.sides.length; jj<ll; jj++) {
          var outValue  = []; // Store value for each side
          var operator  = group.operator[jj];
          var sides     = group.sides[jj];
          var sideCount = operator ? 2 : 1;
          
          perSideLoop:
          for (var k=0; k<sideCount; k++) {
            var curSide = sides[k];
            
            if (curSide.string)
              var curValue = "";
            else
              var curValue = 0;
            
            var add      = curSide.add;
            var subtract = curSide.subtract;
            var special  = curSide.special;
            
            for (var ii=0,l3=add.length; ii<l3; ii++) {
              var curTokenValue = add[ii];
              
              if (curTokenValue.LCESValueType) {
                if (curTokenValue.type === tokenTypes.GROUP) {
                  curTokenValue = groupValueMap[curTokenValue.id];
                } else {
                  // It's a reference...
                  curTokenValue = expressionLoadReferenceValue(tokenMap[curTokenValue.id], context, cache);
                }
              }
              
              if (!rawValue)
                curValue += curTokenValue;
              else
                outValue = curTokenValue;
            }
            
            for (var ii=0,l3=subtract.length; ii<l3; ii++) {
              var curTokenValue = subtract[ii];
              
              if (curTokenValue.LCESValueType) {
                if (curTokenValue.type === tokenTypes.GROUP) {
                  curTokenValue = groupValueMap[curTokenValue.id];
                } else {
                  // It's a reference...
                  curTokenValue = expressionLoadReferenceValue(tokenMap[curTokenValue.id], context, cache);
                }
              }
              
              curValue -= curTokenValue;
            }
            
            for (var ii=0,l3=special.length; ii<l3; ii++) {
              curValue += expressionEvalSpecial(special[ii], context, cache);
            }
            
            if (!rawValue)
              outValue.push(curValue);
          }
          
          if (operator) {
            switch (operator) {
              case "==":
                curSidesValues.push(outValue[0] == outValue[1]);
                break;
              case "===":
                curSidesValues.push(outValue[0] === outValue[1]);
                break;
              case "!=":
                curSidesValues.push(outValue[0] != outValue[1]);
                break;
              case "!==":
                curSidesValues.push(outValue[0] !== outValue[1]);
                break;
              case ">=":
                curSidesValues.push(outValue[0] >= outValue[1]);
                break;
              case "<=":
                curSidesValues.push(outValue[0] <= outValue[1]);
                break;
              case ">":
                curSidesValues.push(outValue[0] > outValue[1]);
                break;
              case "<":
                curSidesValues.push(outValue[0] < outValue[1]);
                break;
            }
          } else {
            curSidesValues.push(curValue);
          }
        }
        
        if (curSidesValues.length === 1) {
          // No boolean && or || operators in this group (yay)
          group.value = curSidesValues[0];
        } else {
          // Ugh, got work to do
          
          var booleanResultSummary = true;
          var boolOps = group.bool;
          var continueBool = false;
          var lastValue = curSidesValues[0];
          // var lastResultSummary = 0;
          
          curSideValueLoop:
          for (var i=0,l=curSidesValues.length - 1; i<l; i++) {
            var curBool = boolOps[i];
            
            if (curBool === "&&") {
              if (continueBool) {
                // A chain of &&
                var curBoolVal = curSidesValues[i];
                
                if (!curBoolVal) {
                  booleanResultSummary = false;
                  lastValue = curBoolVal;
                } else if (i + 1 === l && !curSidesValues[i + 1]) {
                  // The last value after this last && is false, result isn't truthy anymore
                  booleanResultSummary = false;
                  lastValue = curSidesValues[i + 1];
                }
                
                if (booleanResultSummary)
                  lastValue = curBoolVal;
              } else {
                booleanResultSummary = !!curSidesValues[i];
                
                if (booleanResultSummary)
                  lastValue = curSidesValues[i + 1];
                
                continueBool = true;
              }
            } else {
              continueBool = false;
              
              if (!lastValue)
                lastValue = curSidesValues[i + 1];
              else
                break curSideValueLoop; // This value is positive, stop
            }
          }
          
          group.value = lastValue;
        }
        
        groupValueMap[group.id] = group.value;
      }
    }
    
    if (!rawValue)
      return groupValueMap["zero"];
    else {
      groupValueMap["zero"] = outValue;
      return outValue;
    }
  }
  
  // LCES Template Building method. Builds every LCES template constructor
  lces.template.build = function build(options) {
    
    // Build new function
    var newFunc = function LCESTemplate(args, appendNodes) {
      if (this instanceof lces.template) {
        var newContext;
        
        // Check if dynContext object was provided as args — Élégānce
        if (!args || !(args instanceof lcComponent)) {
          newContext = LCESTemplate.context && LCESTemplate instanceof lcComponent ? LCESTemplate.context : new lcWidget();
          
          if (jSh.type(args) === "object") {
            // Check if LCESTemplate.context was provided as an object that isn't constructed with lcComponent
            if (jSh.type(LCESTemplate.context) === "object" && newContext !== LCESTemplate)
              jSh.extendObj(args, LCESTemplate.context);
            
            jSh.extendObj(newContext, args, "LCESName");
          }
          
          args = newContext;
        } else {
          // dynContext was provided, but the true context might be within
          if (jSh.type(LCESTemplate.context) === "string" && jSh.type(args[LCESTemplate.context]) === "object") {
            if (!(args[LCESTemplate.context] instanceof lcComponent)) {
              var newArgsContext = new lcWidget();
              
              jSh.extendObj(newArgsContext, args[LCESTemplate.context], "LCESName");
              
              args = newArgsContext;
            } else {
              args = args[LCESTemplate.context];
            }
          }
        }
        
        // Add dynText to context
        lcDynamicText.call(args);
        
        // Add context loopback
        args.context = args;
        
        // Conceive new native DOMNode
        var newElement = LCESTemplate.render.conceive(true, args);
        
        // Run init functions on the new DOMNode
        LCESTemplate.__initFuncs.forEach(function(i) {
          i(newElement, (args || LCESTemplate.context));
        });
        
        // If no dynContext was provided, link the alternative newContext
        if (newContext) {
          newElement.component = newContext;
          newContext.element = newElement;
        }
        
        // Main context reference for encapsulating contexts
        newElement.mainComponent = newContext || args;
        
        // If there's an appending function and appendNodes, run function
        if (appendNodes && LCESTemplate.append)
          LCESTemplate.append(appendNodes, newElement);
        
        return newElement;
        
      } else {
        var newOptions = {
          render: LCESTemplate.render.cloneNode(true),
          __initFuncs: LCESTemplate.__initFuncs.slice(),
          context: (args ? args.context : null) || LCESTemplate.context
        };
        
        // Check for appending function
        if (args && args.append && typeof args.append === "function" && args.length >= 2)
          newOptions.append = args.append;
        
        // Check for initiation function
        if (args && args.init) {
          var argType = jSh.type(args.init);
          
          if (argType === "array")
            newOptions.__initFuncs = newOptions.__initFuncs.concat(args.init);
          else if (argType === "function")
            newOptions.__initFuncs.push(args.init);
        }
        
        return lces.template.build(newOptions);
      }
    }
    
    newFunc.render = options.render;
    
    // Initiation functions array
    Object.defineProperty(newFunc, "__initFuncs", {
      value: options.__initFuncs ? options.__initFuncs.slice() : [],
      enumerable: false,
      configurable: false,
      writable: false
    });
    
    newFunc.addInit    = lces.template.addInit;
    newFunc.removeInit = lces.template.removeInit;
    
    // Add init function if any
    newFunc.addInit(options.init);
    
    newFunc.context = options.context;
    
    // Make the new function instance of lces.template
    jSh.inherit(newFunc, lces.template);
    
    return newFunc;
  }
  
  /**
   * Checks whether the constructor is invoked as a child of a template's
   * MockupElement.
   *
   * @param {object} args The arguments passed to the constructor
   * @param {object} that The this context of the constructor
   * @returns {boolean} Returns false for a negative assertion, otherwise the newFunction to be appended to the MockupElement
   */
  lces.template.isChild = function(args, that) {
    if (that === lces.global) {
      var newFunction = function templChild() {
        if (this !== lces.global) {
          var newElm = new templChild.templChildFunc();
          
          newElm.Component = newElm.component;
          
          if (templChild.templChildOptions)
            jSh.extendObj(newElm, templChild.templChildOptions);
          
          return newElm.element;
        } else {
          return templChild;
        }
      }
      
      newFunction.templChildFunc = args.callee;
      newFunction.templChildOptions = args[0];
      
      return newFunction;
    } else {
      return false;
    }
  }
  
  // jSh MockupElement Methods
  jSh.MockupElementMethods = {
    // Conversion/Copying functions
    construct: function(deep, clone, dynContext) {
      var that     = this;
      var notLogic = !(!clone && this.__lclogic);
      var newElm   = clone ? jSh.MockupElement(this.tagName) : jSh.e(this.tagName.toLowerCase());
      var nsElm    = newElm.nsElm;
      
      // Disallow tags in the dynText compiling
      if (dynContext)
        dynContext.dynText.allowTags = false;
      
      // Make sure if we're conceiving it's not an lclogic element
      if (notLogic) {
        // Set the attributes
        var checkNSAttr   = /^ns:[^:]+:[^]*$/i;
        var attributeList = Object.getOwnPropertyNames(this.attributes);
        
        for (var i=0,l=attributeList.length; i<l; i++) {
          var curAttr = attributeList[i];
          
          if (curAttr === "dynClass")
            continue;
          
          var isNS    = checkNSAttr.test(curAttr);
          
          var nsURI, nsAttr, oldAttrForm = curAttr;
          
          if (isNS) {
            nsURI  = curAttr.replace(/^ns:[^:]+:([^]*)$/i, "$1");
            nsAttr = curAttr.replace(/^ns:([^:]+):[^]*$/i, "$1");
            
            curAttr = nsAttr;
          }
          
          if (dynContext) {
            var dynAttr = dynContext.dynText.compile(this.attributes[oldAttrForm], function(s) {
              if (!isNS)
                newElm.setAttribute(curAttr, s);
              else
                newElm.setAttributeNS(nsURI ? nsURI : null, nsAttr, s);
            }, dynContext);
            
            if (!dynAttr) {
              if (!isNS)
                newElm.setAttribute(curAttr, this.attributes[curAttr]);
              else
                newElm.setAttributeNS(nsURI ? nsURI : null, nsAttr, this.attributes[oldAttrForm]);
            }
          } else {
            if (!isNS)
              newElm.setAttribute(curAttr, this.attributes[curAttr]);
            else
              newElm.setAttributeNS(nsURI ? nsURI : null, nsAttr, this.attributes[oldAttrForm]);
          }
        }
        
        // Add event listeners
        var eventList = Object.getOwnPropertyNames(this.__events);
        
        for (var i=eventList.length-1; i>=0; i--) {
          var evtName = eventList[i];
          var evt     = that.__events[evtName];
          var cb, bubble;
          
          for (var j=0; j<evt.length; j+=2) {
            cb     = evt[j];
            bubble = evt[j + 1];
            
            newElm.addEventListener(evtName, cb, bubble);
          }
        }
        
        if (dynContext) {
          newElm.lces = {
            ctx: dynContext
          }
        }
      }
      
      // TODO: This is probably overly redundant
      if (this.getAttribute("style"))
        newElm.setAttribute("style", this.getAttribute("style"));
        
      // Check innerHTML and textContent
      if (dynContext && notLogic) {
        dynContext.dynText.element = newElm;
        
        // Remove the innerHTML/textContent from the exclusion array
        jSh.extendObj(jSh.MockupElementOnlyPropsMap, { // FIXME: This is applied globally, which is stupid
          "innerHTML": 0,
          "_innerHTML": 0,
          "textContent": 0,
          "_textContent": 0
        });
        
        if (this._textContent) {
          var textNode = jSh.c("span", undf, this._textContent);
          
          var resC = dynContext.dynText.compile(this._textContent, function(s) {
            textNode.textContent = s;
          }, dynContext);
          
          newElm.appendChild(textNode);
          
          jSh.extendObj(jSh.MockupElementOnlyPropsMap, {
            "textContent": 1,
            "_textContent": 1
          });
        } else if (this._innerHTML) {
          dynContext.dynText.allowTags = true;
          
          var c = dynContext.dynText.compile(this._innerHTML, null, dynContext);
          
          jSh.extendObj(jSh.MockupElementOnlyPropsMap, {
            "innerHTML": 1,
            "_innerHTML": 1
          });
        }
        
        dynContext.dynText.allowTags = false;
        dynContext.dynText.element   = null;
      }
      
      if (notLogic) {
        // Add own properties from initial MockupElement
        var jShMUpOnlyProps = jSh.MockupElementOnlyPropsMap;
        var newPropNames    = Object.getOwnPropertyNames(this);
        
        for (var i=0,l=newPropNames.length; i<l; i++) {
          let newPropName = newPropNames[i];
          
          if (!jShMUpOnlyProps[newPropName]) {
            let propValue = that[newPropName];
            
            if (dynContext && typeof propValue === "string") {
              let dyn = dynContext.dynText.compile(propValue + "", function(s) {
                newElm[newPropName] = s;
              }, dynContext);
              
              if (!dyn)
                newElm[newPropName] = propValue;
            } else if (propValue)
              newElm[newPropName] = propValue;
          }
        }
        
        // Finally add the classNames if any
        if (this.className) {
          if (!nsElm)
            newElm.className = this.className;
          else
            newElm.setAttribute("class", this.className);
        }
        
        // Check for dynClass
        if (!clone && dynContext) {
          if (this.dynClass instanceof Object) {
            var classExpressions = Object.getOwnPropertyNames(this.dynClass);
            var classExprRefs = [];
            var refCache = {};
            var classStates = {};
            
            for (var i=0,l=classExpressions.length; i<l; i++) {
              var curRawClassExpr = classExpressions[i];
              
              var classes = this.dynClass[curRawClassExpr].replace(/\s+/g, "").split(".").filter(function(c) {
                return c;
              });
              
              var curCompiledExpr = lces.template.parseExpression(curRawClassExpr);
              var curClassExpr = {
                rawExpr: curRawClassExpr,
                expr: curCompiledExpr,
                classes: classes
              };
              
              for (var j=0,l2=classes.length; j<l2; j++) {
                var className = classes[j];
                var classObj  = classStates[className];
                
                if (!classObj) {
                  classObj = classStates[className] = {};
                  classObj.actualState = false;
                  classObj.stateExpr = {};
                  classObj.states = [];
                }
                
                classObj.stateExpr[curRawClassExpr] = classObj.states.length;
                classObj.states.push(false);
              }
              
              for (var j=0,l2=curCompiledExpr.references.length; j<l2; j++) {
                var ref = curCompiledExpr.references[j];
                var refName = ref.nameStr;
                var refObj = classExprRefs["ref" + refName];
                
                if (!refObj) {
                  refObj = classExprRefs["ref" + refName] = {};
                  refObj.expr = [];
                  refObj.ref = ref;
                  
                  classExprRefs.push(refObj);
                }
                
                refObj.expr.push(curClassExpr);
              }
            }
            
            function classDynTrigger(classExprRef, dynContext) {
              var refObj = classExprRef;
              
              for (var j=0,l2=refObj.expr.length; j<l2; j++) {
                var curExpr = refObj.expr[j];
                var curExprRaw = curExpr.rawExpr;
                var classes = curExpr.classes;
                
                var result = !!lces.template.evaluateExpression(curExpr.expr, dynContext);
                for (var k=0,l3=classes.length; k<l3; k++) {
                  var className = classes[k];
                  var classObj = classStates[className];
                  var classInd = classObj[curExprRaw];
                  var curClassStates = classObj.states;
                  
                  curClassStates[classInd] = result;
                  var setClass = result;
                  
                  if (!setClass) {
                    for (var i=0,l=curClassStates.length; i<l; i++) {
                      if (curClassStates[i]) {
                        setClass = true;
                        break;
                      }
                    }
                  }
                  
                  if (classObj.actualState !== setClass) {
                    classObj.actualState = setClass;
                    
                    if (setClass) {
                      newElm.classList.add(className);
                    } else {
                      newElm.classList.remove(className);
                    }
                  }
                }
              }
            }
            
            function dynClassCallback(name) {
              return function LCESDynClassCallback(value) {
                var refObj = classExprRefs["ref" + name];
                
                classDynTrigger(refObj, this.component);
              }
            }
            
            // Add listeners to states
            for (var i=0,l=classExprRefs.length; i<l; i++) {
              var ref     = classExprRefs[i].ref;
              var ctxStr  = ref.ctxStr;
              var pathStr = ref.nameStr;
              
              if (!refCache[pathStr]) {
                if (!ctxStr) {
                    dynContext.addStateListener(pathStr, dynClassCallback(pathStr));
                    refCache[pathStr] = dynContext;
                } else {
                  var varName = ref.varName;
                  
                  if (refCache[ctxStr]) {
                    refCache[ctxStr].addStateListener(varName, dynClassCallback(pathStr));
                  } else {
                    var ctxPath = ref.context;
                    var curObj  = dynContext;
                    
                    for (var j=0,l2=ctxPath.length; j<l2; j++) {
                      curObj = curObj[ctxPath[j]];
                      refCache[ctxPath.slice(0, j + 1).join(".")] = curObj;
                    }
                    
                    curObj.addStateListener(varName, trigger);
                    refCache[pathStr] = curObj;
                  }
                }
              }
              
              // Try to initially update states
              try {
                classDynTrigger(classExprRefs[i], dynContext);
              } catch(e) {
                // Welp...
              }
            }
          }
        }
      }
      
      // If deep is true, then traverse all the children
      if (deep) {
        var childNodes = this.childNodes;
        
        if (clone) {
          for (var i=0,l=childNodes.length; i<l; i++) {
            newElm.appendChild(childNodes[i].cloneNode(true, dynContext));
          }
        } else {
          if (notLogic) {
            for (var i=0,l=childNodes.length; i<l; i++) {
              newElm.appendChild(childNodes[i].conceive(true, dynContext));
            }
          } else {
            var logicMarker = document.createComment("  LCES LOGIC - " + this.__lclogic + (this.__lcexprStr ? ": " + this.__lcexprStr : "") + "  ");
            this.__lcinit(logicMarker, newElm, childNodes, dynContext);
          }
        }
      }
      
      if (!clone && this.tagName.toLowerCase() === "lces-placeholder") {
        var phName = this.phName;
        
        var ph = new lcPlaceholder(newElm);
        ph.phName = phName;
      }
      
      // End
      if (notLogic)
        return jSh(newElm, null, true);
      else
        return logicMarker;
    },
    
    // Return a full fledged DOM Node
    conceive: function(deep, dynContext) {
      return this.construct(deep, false, dynContext);
    },
    
    // Return a MockupElement copy
    cloneNode: function(deep) {
      return this.construct(deep, true);
    },
    
    // Child manipulation methods
    __childCheck: function(args, e, error) {
        if (args && jSh.hasMultipleArgs(args, this))
          return false;
        
        if (!(e instanceof jSh.MockupElement)) {
          if (jSh.type(e) === "function" && e.prototype)
          if (e.prototype instanceof lces.template)
            return true;
          else; // TODO: Lacking? Maybe?
          else
            throw TypeError(error || "Element provided doesn't implement the jSh.MockupElement interface");
        }
        
        return true;
    },
    
    __childDetermineType: function(e, create) {
      if (typeof e === "function") {
        if (create || !e.lcesTemplateMockupWrapper)
          return jSh.cm("lces-template-constructor", e);
        else
          return e.lcesTemplateMockupWrapper;
      }
      
      return e;
    },
    
    appendChild: function(e) {
      if (!this.__childCheck(arguments, e))
        return undf;
      
      e = this.__childDetermineType(e);
      
      this.childNodes.push(e);
      e.__privParentNode = this;
    },
    removeChild: function(e) {
      if (!this.__childCheck(arguments, e))
        return false;
      
      e = this.__childDetermineType(e);
      
      var index = this.childNodes.indexOf(e);
      
      if (index !== -1) {
        this.childNodes.splice(index, 1);
        e.__privParentNode = null;
      }
    },
    insertBefore: function(e, e2) {
      if (!this.__childCheck(undf, e, "Element provided doesn't implement the jSh.MockupElement interface"))
        return false;
      
      e  = this.__childDetermineType(e);
      e2 = this.__childDetermineType(e2);
      
      var index = this.childNodes.indexOf(e2);
      
      if (index !== -1) {
        this.childNodes.splice(index, 0, e);
        e.__privParentNode = this;
      }
    },
    
    // A function for traversing all children of the element
    traverse: function(e, cb) {
      var that = this;
      
      var children = e.childNodes;
      
      for (var i=0,l=children.length; i<l; i++) {
        var child = children[i];
        
        if (child.childNodes[0])
          this.traverse(child, cb);
      }
    },
    
    // Query selectors
    getElementsByTagName: function(tagname) {
      var elements = [];
      
      this.traverse(this, function(e) {
        if (e.tagName.toLowerCase() === tagname.toLowerCase())
          elements.push(e);
      });
      
      return elements;
    },
    getElementsByClassName: function(classname) {
      var elements = [];
      
      this.traverse(this, function(e) {
        if (e.classList.contains(classname))
          elements.push(e);
      });
      
      return elements;
    },
    getElementById: function(id) {
      var element = null;
      
      this.traverse(this, function(e) {
        if (e.id === id)
          element = e;
      });
      
      return element;
    },
    
    // Event handling
    addEventListener: function(evt, callback, bubble) {
      var evtArray = this.__events[evt];
      
      // Check for event array
      if (!evtArray) {
        evtArray = [];
        this.__events[evt] = evtArray;
      }
      
      evtArray.push(callback, bubble);
    },
    removeEventListener: function(evt, callback) {
      var evtArray = this.__events[event];
      
      if (!evtArray)
        return null;
      
      var index = evtArray.indexOf(e);
      
      if (index !== -1)
        evtArray.splice(index, 1);
    },
    
    // Set the styles from an attribute assignment
    __setStyleFromAttr: function(styles) {
      var that = this;
      
      this.style   = {};
      var styleObj = this.style;
      
      var properties = styles.split(/\s*;\s*/g);
      
      properties.forEach(function(i) {
        if (!i.trim(""))
          return;
        
        var nameVal = i.split(/\s*:\s*/);
        
        var nameSplit = nameVal[0].split("-");
        nameSplit = nameSplit.map(function(n, i) {if (i!==0) var c = n[0].toUpperCase(); else var c = n[0].toLowerCase(); return c + n.substr(1);}).join("");
        
        styleObj[nameSplit] = nameVal[1];
      });
    },
    __JSProp2CSS: function(prop) {
      var upper = /[A-Z]/;
      prop = prop.split("");
      
      return prop.map(function(i) {return upper.test(i) ? "-" + i.toLowerCase() : i;}).join("");
    },
    __getStyleFromAttr: function() {
      var that  = this;
      var style = this.style;
      
      return Object.getOwnPropertyNames(style).map(function(i) {return that.__JSProp2CSS(i) + ": " + style[i] + ";";}).join("");
    },
    
    // Attribute handling
    setAttribute: function(attr, value) {
      attr  = attr + ""; // Quick n' dirty to string conversion
      value = value + "";
      
      this.attributes[attr] = value;
      
      if (attr === "style")
        this.__setStyleFromAttr(value);
    },
    getAttribute: function(attr) {
      return attr !== "style" ? this.attributes[attr] : this.__getStyleFromAttr();
    },
    removeAttribute: function(attr) {
      attr = attr + "";
      
      this.attributes[attr] = undf;
    },
    setAttributeNS: function(nsURI, nsAttr, value) {
      this.setAttribute("ns:" + nsAttr + ":" + (nsURI ? nsURI : ""), value);
    }
  };

  jSh.MockupElementClassList = {
    manipulateClass: function(classn, add) {
      if (!add && classn === undefined) { // Remove all classnames
        this.classes     = [];
        this.classlookup = {};
      } else if (typeof classn === "string" && classn.trim()) {
        var classes    = classn.split(/\s+/);
        var classArray = this.classes;
        var classObj   = this.classlookup;
        
        for (var i=classes.length-1; i>=0; i--) {
          var curClass = classes[i];
          var exists   = !!classObj[curClass];
          
          if (add && !exists || !add && exists) {
            if (add) {
              classArray.push(curClass);
              classObj[curClass] = true;
            } else {
              var curIndex = classArray.indexOf(curClass);
              
              classArray.splice(curIndex, 1);
              classObj[curClass] = false;
            }
          }
        }
      }
    },
    add: function(classn) {
      this.manipulateClass(classn, true);
    },
    remove: function(classn) {
      this.manipulateClass(classn, false);
    },
    contains: function(classn) {
      return !!this.classlookup[classn];
    },
    toggle: function(classn) {
      if (this.contains(classn))
        this.remove(classn);
      else
        this.add(classn);
    }
  };
  
  // Array of properties to NOT copy to the real element
  jSh.MockupElementOnlyProps = [];
  jSh.MockupElementOnlyProps = jSh.MockupElementOnlyProps.concat(Object.getOwnPropertyNames(jSh.MockupElementMethods));
  jSh.MockupElementOnlyProps = jSh.MockupElementOnlyProps.concat([
    "classList", "style", "childNodes", "tagName",
    "__events", "attributes", "jSh", "parentNode",
    "previousSibling", "nextSibling", "getChild",
    "on", "__privParentNode", "__apch", "__rmch",
    "nodeType", "className",
    
    // For LCES logic mockup elements
    "__lclogic"
  ]);
  
  // Assign to object for faster hash lookup
  jSh.MockupElementOnlyPropsMap = {};
  jSh.MockupElementOnlyProps.forEach(p => (jSh.MockupElementOnlyPropsMap[p] = 1));
  
  // Elements that CANNOT contain children
  jSh.MockupElementsBarren = ["img", "input", "link", "meta"];

  // jSh Mockup Element
  jSh.MockupElement = function MockupElement(tagname) {
    if (!(this instanceof MockupElement))
      return new MockupElement(tagname);
    
    // We're in our protective bubble, nice.
    var that = this;
    tagname  = jSh.type(tagname) === "string" ? tagname : "div";
    
    // Set our fake nodeType
    this.nodeType = Node.ELEMENT_NODE;
    this.isjShMockup = true;
    
    // Add the tagname
    Object.defineProperty(this, "tagName", {
      value: tagname.toUpperCase(),
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add the styles object
    var privStyle = {};
    
    Object.defineProperty(this, "style", {
      enumerable: true,
      configurable: false,
      get: function() {return privStyle}
    });
    
    // Add the parentNode property
    Object.defineProperty(this, "__privParentNode", {
      value: null,
      enumerable: false,
      configurable: false,
      writable: true
    });
    
    Object.defineProperty(this, "parentNode", {
      enumerable: true,
      configurable: false,
      get: function() {return that.__privParentNode}
    });
    
    // Previous and Next Sibling
    Object.defineProperty(this, "previousSibling", {
      enumerable: true,
      configurable: false,
      get: function() {
        if (!that.parentNode)
          return null;
        
        var index  = that.parentNode.childNodes.indexOf(that);
        // var length = that.parentNode.childNodes.length;
        
        if (index === 0)
          return null;
        
        return that.parentNode.childNodes[index - 1];
      }
    });
    
    Object.defineProperty(this, "nextSibling", {
      enumerable: true,
      configurable: false,
      get: function() {
        if (!that.parentNode)
          return null;
        
        var index  = that.parentNode.childNodes.indexOf(that);
        var length = that.parentNode.childNodes.length;
        
        if (index === length - 1)
          return null;
        
        return that.parentNode.childNodes[index + 1];
      }
    });
    
    // Add the childNodes array
    Object.defineProperty(this, "childNodes", {
      value: [],
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add the children array, lists functions are they were originally appended
    Object.defineProperty(this, "children", {
      enumerable: true,
      configurable: false,
      get: function() {
        return that.childNodes.map(function(i) {
          if (i.tagName && i.tagName.toLowerCase() === "lces-template-constructor")
            return i.__lcesTemplateConstructor;
          
          return i;
        });
      }
    });
    
    // An object that contains all the event callbacks
    Object.defineProperty(this, "__events", {
      value: {
        // Will contain all the event callbacks here
      },
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add attributes
    Object.defineProperty(this, "attributes", {
      value: {},
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add classList functionality
    Object.defineProperty(this, "classList", {
      value: jSh.extendObj({classes: [], classlookup: {}, element: this}, jSh.MockupElementClassList),
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add classList length property
    Object.defineProperty(this.classList, "length", {
      enumerable: true,
      configurable: false,
      get: function() {return that.classList.length;}
    });
    
    // Add dynamic className property
    Object.defineProperty(this, "className", {
      enumerable: true,
      configurable: false,
      get: function() {return that.classList.classes.join(" ");},
      set: function(classes) {
        if (jSh.type(classes) && classes.trim()) {
          that.classList.remove();
          that.classList.add(classes);
        } else {
          that.classList.remove();
        }
      }
    });
  }
  
  jSh.MockupElement.prototype.constructor = jSh.MockupElement;
  
  // Add all the methods
  jSh.extendObj(jSh.MockupElement.prototype, jSh.MockupElementMethods);
  
  // MockupText, similar to document.createTextNode
  jSh.__MockupTextConceive = function(d, dynContext) {
    if (dynContext) {
      dynContext.dynText.allowTags = true;
      dynContext.dynText.element   = document.createDocumentFragment();
      
      var compiled = dynContext.dynText.compile(this.nodeValue);
      
      if (compiled)
        return dynContext.dynText.element;
      else
        return jSh.t(this.nodeValue);
      
    } else {
      // No context provided
      return jSh.t(this.nodeValue);
    }
  }

  jSh.MockupText = function MockupText(text) {
    if (!(this instanceof jSh.MockupText))
      return new jSh.MockupText(text);
    
    this.nodeValue = text;
    this.nodeType  = Node.TEXT_NODE;
    
    // Conceive Method
    this.conceive = jSh.__MockupTextConceive;
  }

  jSh.inherit(jSh.MockupText, jSh.MockupElement);

  // MockupElement Creation Functions
  jSh.dm = function nodeM(className, text, child, attributes, properties, events) { // Div MockupElement
    return jSh.d.call({lcesElement: jSh.MockupElement("div")}, className, text, child, attributes, properties, events);
  }

  jSh.cm = function nodeCM(type, className, text, child, attributes, properties, events) { // Custom MockupElement
    if (type !== "lces-template-constructor")
      return jSh.d.call({lcesElement: jSh.MockupElement(type)}, className, text, child, attributes, properties, events);
    else
      return jSh.d.call({lcesElement: jSh.MockupElement(type)}, {prop: {
        __lcesTemplateConstructor: className,
        conceive: function(d, dynContext) {
          // console.log(dynContext);
          return new this.__lcesTemplateConstructor(dynContext);
        }
      }});
  }
  
  jSh.svgm = function(className, width, height, paths) {
    return jSh.cm("ns:svg:http://www.w3.org/2000/svg", className, undf, paths, {
      "version": "1.1",
      "width": width,
      "height": height
    });
  }
  
  jSh.pathm = function(className, points, style) {
    return jSh.cm("ns:path:http://www.w3.org/2000/svg", className, undf, undf, {
      "ns:d:": points,
      "ns:style:": style || ""
    });
  }
  
  jSh.tm = function textM(text) {
    return jSh.MockupText(text);
  }
  
  // LCES Templating Logic Elements
  jSh.m = {};
  
  lces.template.initIf = function(marker, newElm, childNodes, dynContext) {
    // var anchor    = document.createComment();
    var children   = [];
    var logicNodes = [];
    var refCache   = {};
    var exprCache  = {};
    var expr       = this.__lcexpr;
    var refs       = expr.references;
    var visible    = false;
    
    for (var i=0,l=childNodes.length; i<l; i++) {
      var newChild = childNodes[i].conceive(true, dynContext);
      children.push(newChild);
      
      if (newChild.LCESTrigger)
        logicNodes.push(newChild);
    }
    
    function trigger(change) {
      if (!marker.parentNode)
        return false;
      
      var result = !!lces.template.evaluateExpression(expr, dynContext, exprCache);
      
      if (result !== visible || change) {
        if (result) {
          var frag = jSh.docFrag();
          
          for (var i=0,l=children.length; i<l; i++) {
            frag.appendChild(children[i]);
          }
          
          if (marker.nextSibling) {
            marker.parentNode.insertBefore(frag, marker.nextSibling);
          } else {
            marker.parentNode.appendChild(frag);
          }
          
          // Trigger logic nodes
          for (var i=0,l=logicNodes.length; i<l; i++) {
            logicNodes[i].LCESInvisible(false);
          }
        } else {
          var parent = marker.parentNode;
          
          if (children[0].parentNode) {
            for (var i=0,l=children.length; i<l; i++) {
              var child = children[i];
              
              // Check if logic is to be removed
              if (child.LCESInvisible) {
                child.LCESInvisible(true);
              }
              
              parent.removeChild(child);
            }
          }
        }
        
        visible = result;
      }
    }
    
    function invisible(notvisible) {
      if (!notvisible) {
        trigger(true);
      } else {
        if (visible) {
          var parent = marker.parentNode;
          
          for (var i=0,l=children.length; i<l; i++) {
            var child = children[i];
            
            if (child.LCESInvisible) {
              child.LCESInvisible(false);
            }
            
            parent.removeChild(child);
          }
        }
      }
    }
    
    marker.LCESTrigger = trigger;
    marker.LCESInvisible = invisible;
    
    for (var i=0,l=refs.length; i<l; i++) {
      var ref     = refs[i];
      var ctxStr  = ref.ctxStr;
      var pathStr = ref.nameStr;
      
      if (!refCache[pathStr]) {
        if (!ctxStr) {
            dynContext.addStateListener(pathStr, trigger);
            refCache[pathStr] = dynContext;
        } else {
          var varName = ref.varName;
          
          if (refCache[ctxStr]) {
            refCache[ctxStr].addStateListener(varName, trigger);
          } else {
            var ctxPath = ref.context;
            var curObj  = dynContext;
            
            for (var j=0,l2=ctxPath.length; j<l2; j++) {
              curObj = curObj[ctxPath[j]];
              refCache[ctxPath.slice(0, j + 1).join(".")] = curObj;
            }
            
            curObj.addStateListener(varName, trigger);
            refCache[pathStr] = curObj;
          }
        }
      }
    }
    
    setTimeout(function() {
      trigger(); // It's showtime baby!
    }, 0);
  }
  
  // jSh.m.if
  //
  // Will show elements if `condition` is true, will remove otherwise
  jSh.m.if = function(condition, onChange, child) {
    var element = jSh.cm("lces-template-if", null, null, child);
    
    element.__lclogic   = "if";
    element.__lcinit    = lces.template.initIf;
    element.__lcexpr    = lces.template.parseExpression(condition);
    element.__lcexprStr = condition;
    
    return element;
  }
  
  lces.template.initArray = function() {
    
  }
  
  // jSh.m.array
  //
  // Loops an array
  jSh.m.array = function(iterate, itemIdentifier, indexIdentifier, onAdd, onRemove) {
    var element = jSh.cm("lces-template-array");
    
    element.__lclogic     = "array";
    element.__lcitemName  = jSh.strOp(itemIdentifier, null) || "_item";
    element.__lcindexName = jSh.strOp(indexIdentifier, null) || "_i";
    element.__lcinit      = lces.template.initArray;
    element.__lcexpr      = lces.template.parseExpression(iterate, {
      noStrings: true,
      noNumbers: true,
      noCompare: true,
      noArithmetic: true
    });
    element.__lcexprStr = iterate;
    
    return element;
  }
  
  lces.template.initTimes = function(marker, newElm, childNodes, dynContext) {
    // var anchor    = document.createComment();
    var children  = [];
    var refCache  = {};
    var exprCache = {};
    var expr      = this.__lcexpr;
    var refs      = expr.references;
    var count     = 0;
    var rendering = false;
    var countName = this.__lccountName;
    var initTimes = false;
    
    var noAutoStateObj = jSh.extendObj(Object.create(dynContext._noAutoState), {[countName]: 1});
    
    function trigger(change) {
      if (!marker.parentNode || rendering)
        return;
      
      rendering = true;
      var result = parseInt(lces.template.evaluateExpression(expr, dynContext, exprCache));
      
      if (result !== count) {
        if (result > count) {
          var frag = jSh.docFrag();
          var diff = result - count;
          var last = children[children.length - 1];
          
          for (var i=0; i<diff; i++) {
            for (var j=0,l=childNodes.length; j<l; j++) {
              var newContext = Object.create(dynContext); // Create new inhereting context
              newContext._noAutoState = noAutoStateObj;
              newContext[countName] = count + i + 1;
              
              var child = childNodes[j].conceive(true, newContext);
              
              frag.appendChild(child);
              children.push(child);
            }
          }
          
          var lastNode = count !== 0 ? last : marker;
          
          if (lastNode.nextSibling) {
            marker.parentNode.insertBefore(frag, lastNode.nextSibling);
          } else {
            marker.parentNode.appendChild(frag);
          }
        } else {
          var parent     = marker.parentNode;
          var start      = (childNodes.length * result);
          var childCount = children.length;
          
          if (start >= 0 && childCount) {
            for (var i=start; i<childCount; i++) {
              parent.removeChild(children[i]);
            }
          }
          
          children = children.slice(0, start);
        }
        
        count = result;
      }
      
      rendering = false;
      initTimes = true;
    }
    
    function invisible(notvisible) {
      if (!notvisible) { // Visible
        if (!initTimes)  {
          trigger();
        } else {
          var parent = marker.parentNode;
          var frag   = jSh.docFrag();
          
          for (var i=0,l=children.length; i<l; i++) {
            var child = children[i];
            
            frag.appendChild(child);
            
            if (child.LCESInvisible) {
              child.LCESInvisible(false);
            }
          }
          
          if (marker.nextSibling) {
            parent.insertBefore(frag, marker.nextSibling);
          } else {
            parent.appendChild(frag);
          }
        }
      } else {
        var parent = marker.parentNode;
        
        for (var i=0,l=children.length; i<l; i++) {
          var child = children[i];
          
          if (child.LCESInvisible) {
            child.LCESInvisible(true);
          }
          
          parent.removeChild(child);
        }
      }
    }
    
    marker.LCESTrigger   = trigger;
    marker.LCESInvisible = invisible;
    
    for (var i=0,l=refs.length; i<l; i++) {
      var ref     = refs[i];
      var ctxStr  = ref.ctxStr;
      var pathStr = ref.nameStr;
      
      if (!refCache[pathStr]) {
        if (!ctxStr) {
            dynContext.addStateListener(pathStr, trigger);
            refCache[pathStr] = dynContext;
        } else {
          var varName = ref.varName;
          
          if (refCache[ctxStr]) {
            refCache[ctxStr].addStateListener(varName, trigger);
          } else {
            var ctxPath = ref.context;
            var curObj  = dynContext;
            
            for (var j=0,l2=ctxPath.length; j<l2; j++) {
              curObj = curObj[ctxPath[j]];
              refCache[ctxPath.slice(0, j + 1).join(".")] = curObj;
            }
            
            curObj.addStateListener(varName, trigger);
            refCache[pathStr] = curObj;
          }
        }
      }
    }
    
    setTimeout(function() {
      trigger(); // It's showtime baby!
    }, 0);
  }
  
  // jSh.m.times
  //
  // Renders the elements any number of times
  jSh.m.times = function(count, countIdentifier, child, onAdd, onRemove) {
    var element = jSh.cm("lces-template-times", null, null, child);
    
    element.__lclogic     = "times";
    element.__lccountName = jSh.strOp(countIdentifier, null) || "_c";
    element.__lccurCount  = 0;
    element.__lcinit      = lces.template.initTimes;
    element.__lcexpr      = lces.template.parseExpression(count, {
      noStrings: true,
      noCompare: true
    });
    element.__lcexprStr = count;
    
    return element;
  }
  
  // LCES Templating Placeholder element
  
  // Placeholder method for replacing it with a real node or MockupElement
  lces.template.__placeHolderReplace = function(e) {
    var that   = this;
    var parent = this.parent;
    var e      = this._determineType(e);
    
    if (!parent)
      return null;
    
    parent.insertBefore(e, this.element);
    
    // Check for multiple elements
    if (arguments.length > 1) {
      var elements = jSh.toArr(arguments).slice(1);
      
      elements.forEach(function(i) {
        parent.insertBefore(i, that.element);
      });
    }
    
    // Remove placeholder and update substituting property
    parent.removeChild(this.element);
    this.substituting = null;
  };
  
  lces.template.__placeHolderSubstitute = function(e) {
    var e = this._determineType(e);
    
    if (!e.parentNode)
      return null;
    
    e.parentNode.insertBefore(this.element, e);
    e.parentNode.removeChild(e);
    
    this.substituting = e;
  };

  // LCES Placeholder Constructor
  function lcPlaceholder(e) {
    var that = this;
    
    lcWidget.call(this, e);
    
    this.type = "LCES Placeholder Widget";
    
    this.element.replace = this.replace.bind(this);
    this.element.substitute = this.substitute.bind(this);
    
    this.addStateListener("phName", function(phName) {
      that.element.setAttribute("ph-name", phName);
    });
  }
  
  jSh.inherit(lcPlaceholder, lcWidget);
  
  jSh.extendObj(lcPlaceholder.prototype, {
    replace: lces.template.__placeHolderReplace,
    substitute: lces.template.__placeHolderSubstitute
  });
  
  // Create DOM placeholder element
  jSh.ph = function(phName) {
    var widget = new lcPlaceholder(jSh.c("lces-placeholder"));
    
    widget.phName = phName;
    
    return widget.element;
  };

  // Create MockupElement placeholder element
  jSh.phm = function(phName) {
    var widget = new lcPlaceholder(jSh.cm("lces-placeholder"));
    
    widget.phName = phName;
    widget.element.phName = phName;
    
    return widget.element;
  };

  // Scan for Placeholders on lces init
  lces.template.initLoadPH = function() {
    var placeholders = jSh("lces-placeholder");
    
    // Setup placeholders
    placeholders.forEach(function(i) {
      var attrVal = i.getAttribute("ph-name");
      var attrVis = i.getAttribute("ph-visible");
      
      var widget  = new lcPlaceholder(i);
      
      if (attrVal) {
        i.phName = attrVal;
        widget.phName = attrVal;
      }
      
      if (attrVis !== null) {
        i.style.display = "block";
      }
    });
  }

  // Initiation function that scans the DOM after it loads for <lces-template> elements
  lces.template.initLoadTemplates = function() {
    var templates = jSh("lces-template");
    
    templates.forEach(function(templ) {
      var templConstructor = lces.template.list[templ.getAttribute("template")];
      var contextName      = templ.getAttribute("context");
      
      if (templConstructor && templ.getAttribute("context")) {
        var context = (contextName ? lces(contextName) : null) || new lcComponent();
        
        if (contextName)
          context.LCESName = contextName;
        
        var templId = templ.id;
        var classes = templ.className.split(" ");
        
        // Create new element
        var newElm = new templConstructor(context, jSh.toArr(templ.childNodes));
        
        // Add classnames
        classes.forEach(function(c) {
          if (c)
            newElm.classList.add(c);
        });
        
        // Add id
        if (templId)
          newElm.id = templId;
        
        // Prevent conflicts
        templ.id = "";
        
        // End
        templ.parentNode.insertBefore(newElm, templ);
        templ.parentNode.removeChild(templ);
      }
    });
  }

  lces.addInit(lces.template.initLoadTemplates);
  lces.addInit(lces.template.initLoadPH);


  // Template list
  lces.template.list = {};
}
 