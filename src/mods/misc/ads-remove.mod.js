// AUR Basic Ad Remover


var regs  = AUR.register("ads-remove");
var style = AUR.import("aur-styles");

style.styleBlock(`
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
