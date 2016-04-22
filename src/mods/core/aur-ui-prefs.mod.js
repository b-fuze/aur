// aur-ui preferences window builder

AUR.onLoaded("aur-ui", "aur-settings", "aur-styles", function() {
  var ui    = AUR.import("aur-ui");
  var sett  = AUR.import("aur-settings");
  var style = AUR.import("aur-styles");
  
  var prefs = ui.registerWin("aur-prefs", "AUR", {
    tabsVisible: true,
    draggable: true,
    width: 650,
    height: 500
  });
  
  prefs.addStateListener("selectedTab", function(tab) {
    if (tab.tabTitle)
      prefs.title = "AUR - " + tab.tabTitle;
    else
      prefs.title = "AUR";
  });
  
  var pActions = prefs.registerGroup("aur-prefs-actions");
  var pMisc    = prefs.registerGroup("aur-prefs-misc", null, {
    defaultGroup: true
  });
  var pModules = prefs.registerGroup("aur-prefs-modules");
  
  // Add actions tab
  var actTab = pActions.registerTab(null, null, {
    element: jSh.d({
      child: [
        jSh.c("span", undf, "Work | "),
        jSh.c("span", undf, "Go | "),
        jSh.c("span", undf, "Play")
      ]
    })
  });
  
  actTab.disabled = true;
  
  // Add general tab
  var gen = prefs.registerTab(null, "General");
  var ajaxify = prefs.registerTab(null, "Ajax'ify");
  
  // Add Modules and Settings Tab
  var mod     = pModules.registerTab(null, "Modules");
  var aurSett = pModules.registerTab(null, "Settings");
  
  // TODO: Remove when finished testing aur-ui
  sett.setDefault("uiTest", {
    lol: sett.Setting("THE LAUGHTER", "string", "The NERVE OF HIM!"),
    num: sett.Setting("Numero!", "number", 5),
    maybe: sett.Setting("IS IT? IS IT TRUE?!?", "boolean", false),
    count: sett.Setting("Count, plz", "number", 0.5),
    party: sett.Setting("The Gathering", "string,multiple", 0, [
      ["HEY", "Name"],
      ["Calvary...", "Sorcery? :O"],
      ["Option", "Optionsz"],
      ["4", "The Word or Phrase"],
      ["System", "monitor"]
    ]),
    many: sett.Setting("Culprits", "string,multiple", 0, [
      ["awesome", "Value?"],
      ["phones", "Plz, no more"],
      ["AUR", "AUR!!!"],
      ["tongue", "Twister"],
      ["formal", "Term"]
    ])
  });
  
  gen.textProp(null, 5, {
    data: "The Rite of Passage"
  });
  
  gen.inputTextProp(null, 7, {
    link: "uiTest.lol",
    align: "left"
    // fill: true
  });
  
  gen.textProp(null, 5, {
    data: "Courtesy of... ME!"
  });
  
  gen.inputNumProp(null, 7, {
    link: "uiTest.count",
    align: "left"
  });
  
  gen.textProp(null, 5, {
    data: "Nice n' beautiful. "
  });
  
  gen.toggleProp(null, 7, {
    link: "uiTest.maybe",
    align: "left"
  });
  
  gen.textProp(null, 5, {
    data: "The Sky's the Limit"
  });
  
  gen.sliderProp(null, 7, {
    link: "uiTest.count",
    align: "left",
    min: 30,
    max: 75,
    integer: true,
    suffix: "/s"
  });
  
  var grp1 = gen.groupProp();
  
  grp1.textProp(null, 5, {
    data: "Darkness Level"
  });
  
  grp1.sliderProp(null, 7, {
    link: "uiTest.count",
    align: "left",
    min: 30,
    max: 75,
    integer: true,
    suffix: "/s"
  });
  
  grp1.textProp(null, 5, {
    data: "Take your pick"
  });
  
  grp1.dropDownProp(null, 7, {
    link: "uiTest.party",
    align: "left"
  });
  
  grp1.textProp(null, 5, {
    data: "To choose is to loose"
  });
  
  grp1.dropDownProp(null, 7, {
    link: "uiTest.many",
    align: "left"
  });
  
  var btns = gen.buttonProp(null, 12, {
    align: "center"
  });
  
  btns.addButton("Toggle state", () => (grp1.disabled = !grp1.disabled));
  btns.addButton("Call me", () => alert("Thanks!"));
  
  grp1.textProp(null, 5, {
    data: "The Sky's blue"
  });
  
  grp1.inputColorProp(null, 7, {
    link: "uiTest.lol",
    align: "left"
  });
  
  gen.textProp(null, 5, {
    data: "Another testy conclusion"
  });
  
  gen.inputColorProp(null, 7, {
    link: "uiTest.lol",
    align: "left"
  });
  
  gen.textProp(null, 12, {
    data: "My will:"
  });
  
  gen.inputTextProp(null, 12, {
    link: "uiTest.lol",
    align: "left",
    area: true,
    rows: 6,
    placeholder: "Your will...",
    fill: true,
    linebreak: true
  });
  // END TODO;
  
  // -----------------------
  // Add AUR UI module table
  // -----------------------
  
  mod.textProp(null, 12, {
    data: "This doesn't work, but is being worked on."
  });
  
  var mTableContainer = lces.new("widget", mod.emptyProp(null, 12).main);
  var mTable = new lces.new("table");
  
  // Append table to container
  mTable.parent = mTableContainer;
  mTable.style.width = "100%";
  mTable.classList.add("aur-ui-prefs-mod-list");
  
  // Add table headers
  mTable.addHeading("Module");
  
  var modToggle = mTable.addHeading("Enabled");
  modToggle.style.width = "20%";
  
  mTableContainer.style = {
    display: "block",
    width: "auto",
    margin: "0px -5px"
  }
  
  var mods = AUR.modules.misc;
  mods.forEach(function(mod) {
    mTable.addRow([mod, jSh.extendObj(lces.new("togglefield"), {checked: true})]);
  });
  
  // Table styles
  style.styleBlock(`
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces th {
      border: 0px;
      font-size: 0px;
      line-height: 0px;
      padding: 0px;
      margin: 0px;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces th:before {
      display: none !important;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr {
      color: inherit !important;
      background: rgba(156, 161, 166, 0.015);
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr[checker] {
      background: rgba(156, 161, 166, 0.075);
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr td:first-child {
      font-size: 17px;
    }
  `);
  
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
  
  // TODO: Remove when done testing aur-ui
  // prefs.visible = true;
});
