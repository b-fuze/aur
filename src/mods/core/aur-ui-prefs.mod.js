// aur-ui preferences window builder

(function() {
  AUR.onLoaded("aur-ui", function() {
    var ui = AUR.import("aur-ui");
    
    var prefs = ui.registerWin("aur-prefs", "AUR - Preferences", {
      tabsVisible: true
    });
    
    var pActions = prefs.registerGroup("aur-prefs-actions");
    var pMisc    = prefs.registerGroup("aur-prefs-misc", null, {
      defaultGroup: true
    });
    var pModules = prefs.registerGroup("aur-prefs-modules");
    
    ui.__setPrefs(prefs);
  });
})();
