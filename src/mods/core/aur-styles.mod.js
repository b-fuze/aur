// AUR Styles Module
AUR_NAME = "AUR Styles";
AUR_DESC = "AUR Styles API";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;

// AUR Register
var regs = reg;

// Add main style element
var mainStyleElement = jSh.c("style", "#aur-global-styles");
jSh("head")[0].appendChild(mainStyleElement);

// Full style cram buffer
var stylesCat   = "";
var styleBlocks = [];

// Collects all enabled styles and puts into mainStyleElement
function renderStyles() {
  stylesCat = "";
  
  for (var i=0,l=styleBlocks.length; i<l; i++) {
    var sb = styleBlocks[i];
    
    if (sb.enabled)
      stylesCat += sb.src.replace(/\n\s*\/\/[^\n]+/gi, "");
  }
  
  // Add and replace styles
  if (mainStyleElement.childNodes[0])
    mainStyleElement.removeChild(mainStyleElement.childNodes[0]);
  mainStyleElement.appendChild(jSh.t(stylesCat));
}

// Style block constructor
function AURStyleBlock(style, enabled) {
  lcComponent.call(this);
  var that = this;
  
  styleBlocks.push(this);
  
  this.setState("enabled", jSh.boolOp(enabled, true));
  this.setState("src", "");
  
  this.addStateCondition("src", function(src) {
    if (typeof src !== "string")
      return false;
    
    return true;
  });
  
  this.addStateListener("enabled", onChange);
  this.addStateListener("src", onChange);
  
  // Render the styles
  this.src = style;
  renderStyles();
}

// Style block methods
AURStyleBlock.prototype.enable = function() {
  this.enabled = true;
}

AURStyleBlock.prototype.disable = function() {
  this.enabled = false;
}

function onChange() {
  renderStyles();
}

// aur-styles constructor interface
regs.interface = function() {
  
}

regs.interface.prototype.styleBlock = function(style, enabled) {
  return new AURStyleBlock(style, enabled);
}

// Add important clause
regs.interface.prototype.important = function(src) {
  return src.replace(/([a-z\-\d]+\s*:\s*)([#\d\.\s,a-z()\-]+);/ig, function(m, p1, p2) {
    return p1 + p2 + " !important;";
  });
};
