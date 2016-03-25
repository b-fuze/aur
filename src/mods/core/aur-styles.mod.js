// AUR Styles Module

// AUR Register
var regs = AUR.register("aur-styles");

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
function AURStyleBlock(style) {
  lcComponent.call(this);
  var that = this;
  
  styleBlocks.push(this);
  
  this.setState("enabled", true);
  this.setState("src", style);
  
  this.addStateListener("enabled", onChange);
  this.addStateListener("src", onChange);
  
  // Render the styles
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

regs.interface.prototype.styleBlock = function(style) {
  return new AURStyleBlock(style);
}
