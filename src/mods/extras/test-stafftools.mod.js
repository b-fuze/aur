// Test staff tools
AUR_NAME = "Test Stafftools";
AUR_DESC = "Testing for staff tools styling";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;

var page = AUR.import("aur-page");

if (page.isEpisode) {
  var report = jSh(".report-video")[0];
  
  // Create dummy stafftools
  var staffTools = jSh.d(".centered.staff-tools", undf, [
    jSh.c("b", undf, "Staff Tools:"),
    
    jSh.c("a", {
      text: "delete mirror",
      prop: {
        href: "#"
      }
    }),
    jSh.t(" | "),
    
    jSh.c("a", {
      text: "Fix Episode",
      prop: {
        href: "#"
      }
    }),
    jSh.t(" | "),
    
    jSh.c("a", {
      text: "Set as Dubbed",
      prop: {
        href: "#"
      }
    }),
    jSh.t(" | "),
    
    jSh.c("a", {
      text: "Set as Subbed",
      prop: {
        href: "#"
      }
    }),
    jSh.t(" | "),
    
    jSh.c("a", {
      text: "Set as Primary Video",
      prop: {
        href: "#"
      }
    }),
    jSh.t(" | "),
    
    jSh.c("a", {
      text: "Add to new front page (as sub)",
      prop: {
        href: "#"
      }
    }),
    jSh.t(" | "),
    
    jSh.c("a", {
      text: "Add to new front page (as dub)",
      prop: {
        href: "#"
      }
    }),
    jSh.t(" | "),
    
    jSh.c("a", {
      text: "Add to new front page (as RAW)",
      prop: {
        href: "#"
      }
    }),
    jSh.t(" | ")
  ]);
  
  report.parentNode.appendChild(staffTools);
}
