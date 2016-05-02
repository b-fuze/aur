// aur-ui preferences window builder
AUR_NAME = "AUR UI Preferences Window";
AUR_DESC = "AUR UI Preferences Window + API";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;

AUR.onLoaded("aur-ui", "aur-settings", "aur-styles", function() {
  var ui    = AUR.import("aur-ui");
  var sett  = AUR.import("aur-settings");
  var style = AUR.import("aur-styles");
  
  var prefs = ui.registerWin("aur-prefs", "AUR", {
    tabsVisible: true,
    draggable: true,
    width: 650,
    height: 400
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
  var modTab  = pModules.registerTab(null, "Modules");
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
  
  var mTableContainer = lces.new("widget", modTab.emptyProp(null, 12).main);
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
  
  // modrow model
  var ModRow = function() {
    var that = this;
    lces.type("component").call(this);
    
    this.rowExtra = null;
    
    this.setState("visible", false);
    this.addStateListener("visible", function(visible) {
      if (visible)
        that.rowExtra.classList.add("visible");
      else
        that.rowExtra.classList.remove("visible");
    });
    
    this.setState("trayVisible", false);
    this.addStateListener("trayVisible", function(opVisible) {
      if (opVisible)
        that.rowExtra.classList.add("tray-visible");
      else
        that.rowExtra.classList.remove("tray-visible");
    });
    
    this.setState("optionsVisible", false);
    this.addStateListener("optionsVisible", function(opVisible) {
      if (opVisible)
        that.rowExtra.classList.add("options-visible");
      else
        that.rowExtra.classList.remove("options-visible");
    });
  }
  
  // Enabled settings
  var enabledMods = {};
  var enabledModsArr = [];
  
  var modsGroup = lces.new("group");
  
  modsGroup.setState("visible", false);
  modsGroup.setExclusiveState("visible", true, 1);
  
  var mods = AUR.modules.misc;
  var modNames = Object.getOwnPropertyNames(mods);
  
  var metaNames = ["modName", "modAuthors", "modDesc", "modVersion", "modRestart"];
  
  var metaProper = {
    modName: "Name",
    modAuthors: "Author(s)",
    modDesc: "Description",
    modVersion: "Version",
    modRestart: "Require restart"
  };
  
  var metaRender = {
    modName: n => n,
    modAuthors: a => a.join(", "),
    modDesc: d => d,
    modVersion: v => (jSh.type(v) === "array" ? v.join(".") : v),
    modRestart: r => (r ? "Yes" : "No")
  };
  
  modNames.forEach(function(mod) {
    var modDetails = mods[mod];
    var detailCount = 0;
    
    var modRow = new ModRow();
    modsGroup.addMember(modRow);
    
    // Create elements
    var toggle = jSh.extendObj(lces.new("togglefield"), {
      checked: true
    });
    
    var details = jSh.d(".aur-ui-prefs-mod-details", undf, [
      jSh.d(".aur-ui-prefs-mod-details-inner", undf, [
        jSh.c("span", ".aur-ui-prefs-mod-name", undf, [
          jSh.c("span", ".aur-ui-prefs-mod-name-title", (modDetails.modName || mod) + (modDetails.modDesc ? " - " : "")),
          jSh.c("span", ".aur-ui-prefs-mod-desc", (modDetails.modDesc ? modDetails.modDesc : ""))
        ])
      ]),
      
      jSh.d(".aur-ui-prefs-mod-extras", undf, [
        jSh.d(".aur-ui-prefs-mod-extras-info", undf, metaNames.filter(n => (modDetails[n] !== null)).map(function(meta) {
            detailCount++;
            
            return jSh.d(".aur-ui-prefs-mod-extras-info-prop", undf, [
              jSh.c("span", undf, metaProper[meta]),
              jSh.c("span", undf, metaRender[meta](modDetails[meta]))
            ]);
          }
        )),
        jSh.d(".aur-ui-prefs-mod-extras-options")
      ]),
      
      jSh.d(".aur-ui-prefs-mod-click", undf, [
        // Option/Info Tray
        jSh.d(".aur-ui-prefs-mod-click-tray", undf, [
          // Info icon
          jSh.svg(".aur-ui-prefs-mod-click-tray-icon.aur-mod-list-info-icon", 46, 56, [
            jSh.path(undf, "M28 9.875c-1.114 0-2.06.387-2.844 1.187-.783.784-1.187 1.73-1.187 2.844 0 1.114.403 2.092 1.186 2.875.783.785 1.73 1.158 2.844 1.157 1.114 0 2.06-.373 2.844-1.156.8-.782 1"
                         + ".187-1.76 1.187-2.874s-.372-2.06-1.155-2.844c-.783-.8-1.744-1.187-2.875-1.187zm-6.594 11.812V24c1.15.07 1.912.356 2.313.844.4.47.624 1.558.624 3.28v11.75c0 1.724-.183 2.75"
                         + "7-.532 3.157-.522.593-1.327.935-2.406.97v2.125h13.188V44c-1.166-.07-1.944-.342-2.344-.812-.4-.488-.594-1.59-.594-3.313V21.687z")
          ]),
          
          // Options icon
          jSh.svg(".aur-ui-prefs-mod-click-tray-icon.aur-mod-list-options-icon", 46, 56, [
            jSh.path(undf, "M25.53 10.5l-1.53 2v3.125c-.67.216-1.29.496-1.906.813l-2.22-2.22-2.5-.343-3.5 3.5.345 2.5 2.217 2.22c-.316.616-.596 1.236-.812 1.905H12.5l-2 1.53v4.94l2 1.53h3.125c.216.67"
                         + ".496 1.29.813 1.906l-2.22 2.22-.343 2.5 3.5 3.5 2.5-.345 2.22-2.218c.616.317 1.236.597 1.905.813V43.5l1.53 2h4.94l1.53-2v-3.125c.67-.216 1.29-.496 1.906-.813l2.22 2.22 2.5"
                         + ".343 3.5-3.5-.345-2.5-2.218-2.22c.317-.616.597-1.236.813-1.905H43.5l2-1.53v-4.94l-2-1.53h-3.125c-.216-.67-.496-1.29-.813-1.906l2.22-2.22.343-2.5-3.5-3.5-2.5.345-2.22 2.217"
                         + "c-.616-.316-1.236-.596-1.905-.812V12.5l-1.53-2h-4.94zM28 20.875c3.935 0 7.125 3.19 7.125 7.125s-3.19 7.125-7.125 7.125-7.125-3.19-7.125-7.125 3.19-7.125 7.125-7.125z")
          ])
        ])
      ])
    ]);
    
    var toggleCont = jSh.d(".aur-ui-prefs-mod-toggle", undf, [
      jSh.d(".aur-ui-inner", undf, [
        toggle.element
      ])
    ]);
    
    // Append elemtns to new table row
    var row     = mTable.addRow([details, toggleCont]);
    var optCont = ui.prop.groupProp(null, 12);
    
    modDetails.setOpt(optCont);
    modRow.rowExtra = row.element;
    var click   = details.jSh(".aur-ui-prefs-mod-click")[0];
    var info    = details.jSh(".aur-mod-list-info-icon")[0];
    var options = details.jSh(".aur-mod-list-options-icon")[0];
    var optWrap = details.jSh(".aur-ui-prefs-mod-extras-options")[0];
    
    optWrap.appendChild(optCont.main);
    
    click.addEventListener("mousedown", e => e.preventDefault());
    click.addEventListener("click", function(e) {
      var target = e.target;
      
      if (detailCount === 0 && !modRow.optionsVisible)
        return false;
      
      if (target.tagName !== "DIV")
        modRow.visible = true;
      else {
        modRow.visible = !modRow.visible;
        modTab.scrollbar.update();
      }
    });
    
    info.addEventListener("click", function() {
      modRow.optionsVisible = false;
    });
    
    options.addEventListener("click", function() {
      modRow.optionsVisible = true;
    });
    
    // Enable the tray on adding something
    optCont._add = optCont.add;
    optCont.add = function() {
      modRow.trayVisible = true;
      optCont.add = optCont._add;
      
      optCont.add.apply(optCont, jSh.toArr(arguments));
      
      if (detailCount === 0) {
        modRow.optionsVisible = true;
        modRow.trayVisible = false;
      }
    }
    
    // Add to dis/enabled settings
    var modName = mod.replace(/-/g, "") + "mod";
    
    enabledMods[modName] = {
      enabled: sett.Setting("Mod Enable", "boolean", true)
    };
    
    enabledModsArr.push([modName, toggle, mod]);
  });
  
  sett.setDefault("AURModsEnabled", enabledMods);
  
  // Add toggling events
  enabledModsArr.forEach(function(arr) {
    var modName = arr[0];
    var toggle = arr[1];
    var modRealName = arr[2];
  
    sett.on("AURModsEnabled." + modName + ".enabled", function(e) {
      mods[modRealName].enabled = e.value;
      toggle.checked = e.value;
    });
  
    toggle.addStateListener("checked", function(checked) {
      sett.set("AURModsEnabled." + modName + ".enabled", checked);
    });
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
      color: #9CA1A6 !important;
      background: #181A1C;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr[checker] {
      background: #1F2224;
    }
    
    /* .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr:hover, */ .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr.visible {
      background: #2A2C2E;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-toggle {
      display: inline-block;
      min-height: 34px;
      min-width: 40px;
      width: 100%;
      height: 100%;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-toggle .aur-ui-inner {
      position: absolute;
      left: 0px;
      top: 0px;
      margin: 10px;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr td:last-child {
      position: relative;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr td:first-child {
      position: relative;
      font-size: 17px;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr.visible td:first-child {
      padding-top: 20px;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr td {
      line-height: 17px;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-details-inner {
      min-height: 17px;
      position: relative;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-name {
      position: absolute;
      display: block;
      max-width: 100%;
      height: 17px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: rgba(156, 161, 166, 0.5);
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-name-title {
      color: #9CA1A6;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-desc {
      display: inline;
      font-style: italic;
    }
    
    // Row content area
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras {
      display: none;
      position: relative;
      margin-top: 25px;
      margin-left: -10px;
      margin-right: -10px;
      min-height: 75px;
      
      // padding-top: 0px;
      font-size: 13px;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-info {
      display: block;
      padding-right: 15px !important;
      padding-left: 10px !important;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-options,
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-info {
      position: relative;
      width: auto !important;
      margin-right: -25%;
      min-height: 75px;
      padding: 10px 0px;
      background: #1F1F21;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-options {
      display: none;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-options > .aur-ui-prop-group {
      position: relative;
      padding-right: 5px;
      padding-left: 5px;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-options > .aur-ui-prop-group .aur-ui-prop-text {
      padding-top: 5px;
      font-size: 15px;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-options .aur-ui-prop-group {
      margin-top: 5px;
      margin-bottom: 5px;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr.options-visible .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-info {
      display: none;
    }
    
    // Module Details
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-info-prop {
      position: relative;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-info-prop span {
      display: inline-block;
      margin-bottom: 7px;
      vertical-align: top;
      width: 65%;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-info-prop span:first-child {
      width: 35%;
      font-weight: bold;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr.options-visible .aur-ui-prefs-mod-extras .aur-ui-prefs-mod-extras-options {
      display: block;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr.visible .aur-ui-prefs-mod-extras {
      display: block;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-click {
      position: absolute;
      left: 0px;
      right: 0px;
      top: 0px;
      height: 56px;
      cursor: pointer;
    }
    
    // Row info/options tray
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray {
      position: absolute;
      right: 0px;
      top: 0px;
      height: 54px;
      padding: 0px 0px 0px 30px;
      background: linear-gradient(to right, rgba(24, 26, 28, 0), #181A1C 30px);
      opacity: 0;
      display: none;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr.tray-visible .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray {
      display: block;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray svg {
      transform: scale(0.65);
      opacity: 0.5;
      cursor: pointer;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray svg:hover {
      opacity: 1 !important;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray svg.aur-mod-list-info-icon {
      opacity: 1;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray svg.aur-mod-list-options-icon {
      opacity: 0.5;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr.options-visible .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray svg.aur-mod-list-info-icon {
      opacity: 0.5;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr.options-visible .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray svg.aur-mod-list-options-icon {
      opacity: 1;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray svg path {
      fill: #9CA1A6;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr:hover .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray {
      opacity: 1;
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr[checker] .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray {
      background: linear-gradient( to right, rgba(31, 34, 36, 0), #1F2224 30px);
    }
    
    .aur-ui-tabpage .aur-ui-prefs-mod-list.lces tr.visible .aur-ui-prefs-mod-click .aur-ui-prefs-mod-click-tray {
      background: linear-gradient( to right, rgba(42, 44, 46, 0), #2A2C2E 30px) !important;
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
