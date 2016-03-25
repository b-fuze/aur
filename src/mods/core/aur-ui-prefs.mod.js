// aur-ui preferences window builder


AUR.onLoaded("aur-ui", function() {
  var ui = AUR.import("aur-ui");
  
  var prefs = ui.registerWin("aur-prefs", "AUR - Preferences", {
    tabsVisible: true,
    draggable: true,
    width: 600,
    height: 350
  });
  
  var pActions = prefs.registerGroup("aur-prefs-actions");
  var pMisc    = prefs.registerGroup("aur-prefs-misc", null, {
    defaultGroup: true
  });
  var pModules = prefs.registerGroup("aur-prefs-modules");
  
  // Add actions tab
  pActions.registerTab(null, null, {
    element: jSh.d({
      child: [
        jSh.c("span", undf, "Work | "),
        jSh.c("span", undf, "Go | "),
        jSh.c("span", undf, "Play")
      ]
    })
  });
  
  // Add general tab
  var gen = prefs.registerTab(null, "General");
  
  var prop1 = gen.textProp(null, 4, {
    data: "General hehe [b][#c22]{#clickCount}[/color][/b]",
    dynText: true
  });
  gen.textProp(null, 8, {
    data: "Or..."
  });
  
  var clicked = 0;
  gen.addStateListener("selected", function(selected) {
    clicked++;
    
    prop1.clickCount = ((clicked - (clicked % 2)) / 2);
  });
  
  ui.__setPrefs(prefs);
  
  // Add to nav
  if (jSh("#left-nav")) {
    var AUREntry = jSh.c("li", {
      child: jSh.c("span", ".ddtitle", "AUR"),
      attr: {
        style: "cursor: pointer;"
      }
    });
    
    AUREntry.addEventListener("click", function() {
      prefs.visible = !prefs.visible;
    });
    
    jSh("#left-nav").insertBefore(AUREntry, jSh("#left-nav").getChild(0));
  }
});
