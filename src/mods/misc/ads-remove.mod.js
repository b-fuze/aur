// AUR Basic Ad Remover
AUR_NAME = "Ads Remover";
AUR_DESC = "Basic Ad Remover/Replacer";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;

var regs  = AUR.register("ads-remove");
var style = AUR.import("aur-styles");

regs.on("moddisable", function() {
  block.enabled = false;
});

regs.on("modenable", function() {
  block.enabled = true;
});

var block = style.styleBlock(`
  #ad-top {
    display: none;
  }
  
  #right-content-hp iframe[src="/medium-rect.php"], #right-content-hp iframe[src="/medium-rect2.php"] {
    pointer-events: none;
    opacity: 0.05;
    border-radius: 2.5px;
    mix-blend-mode: darken;
    filter: brightness(0);
  }
  
  #main-content > .centered {
    display: none;
  }
  
`.replace(/([a-z\-\d]+\s*:\s*)([#\d\.\s,a-z()\-]+);/ig, function(m, p1, p2) {
  return p1 + p2 + " !important;";
}));
