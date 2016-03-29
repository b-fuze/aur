// AUR UI bindings, LCES abstraction


var regs = AUR.register("aur-ui");

// Options determining utils
function boolOp(src, def) {
  return src !== undefined ? !!src : def;
}

function numOp(src, def) {
  return !isNaN(src) && jSh.type(src) === "number" && src > -Infinity && src < Infinity ? parseFloat(src) : def;
}

function removeNode(e) {
  if (e.parentNode)
    e.parentNode.removeChild(e);
  
  return e;
}

// AUR LCES Window Abstraction
function RegisterWin(name, title, options) {
  if (!(this instanceof RegisterWin))
    return new RegisterWin(name, title, options);
  
  lcGroup.call(this);
  var that = this;
  
  var tabs = [];
  var defaultGroup;
  
  var aurwin   = new lcWindow();
  var tabPanel = new lcWidget(jSh.d(".aur-ui-tabpanel"));
  var tabPages = new lcWidget(jSh.d(".aur-ui-tabpages"));
  
  this.tabPanel = tabPanel;
  this.tabPages = tabPages;
  aurwin.append(tabPanel);
  aurwin.append(tabPages);
  
  aurwin.container.classList.add("aur-ui-win");
  aurwin.buttonPanelVisible = false;
  
  if (title !== undefined && title !== null)
    aurwin.title = title;
  
  aurwin.width  = numOp(options.width, aurwin.width);
  aurwin.height = numOp(options.height, aurwin.height);
  aurwin.draggable = boolOp(options.draggable, false);
  
  this.setState("selected", true);
  this.setExclusiveState("selected", true, 1);
  
  tabPanel.addEventListener("click", function(e) {
    var target = e.target, tab;
    
    while (target !== this) {
      if (target.getAttribute("aur-tab-click")) {
        tab = tabs[target.getAttribute("aur-tab-click")];
        
        break;
      }
      
      target = target.parentNode;
    }
    
    if (tab) {
      tab.selected = true;
    }
  });
  
  this.setState("tabsVisible", false);
  this.addStateListener("tabsVisible", function(visible) {
    aurwin.classList[visible ? "add" : "remove"]("aur-tabsvisible");
  });
  
  this.setState("visible", false);
  this.addStateListener("visible", function(visible) {
    aurwin.visible = visible;
  });
  
  this.setState("title", aurwin.title);
  this.addStateListener("title", function(title) {
    aurwin.title = title;
  });
  
  this.setState("width", aurwin.width);
  this.addStateListener("width", function(width) {
    aurwin.width = width;
  });
  
  this.setState("height", aurwin.height);
  this.addStateListener("height", function(height) {
    aurwin.height = height;
  });
  
  this.setState("draggable", aurwin.draggable);
  this.addStateListener("draggable", function(draggable) {
    aurwin.draggable = draggable;
  });
  
  this.setState("centered", aurwin.centered);
  this.addStateListener("centered", function(centered) {
    aurwin.centered = centered;
  });
  
  this.tabsVisible = boolOp(options.tabsVisible, false);
  
  this.getTab = function(name) {
    return tabs[name] instanceof RegisterTab || tabs[name] instanceof RegisterGroup ? tabs[name] : null;
  }
  
  this.add = function(tab) {
    if (tab instanceof RegisterTab || tab instanceof RegisterGroup) {
      tabs[tab.uid] = tab;
      tabs.push(tab);
      
      if (tab.window !== this)
        this.addMember(tab);
      
      tab.window = this;
    }
  }
  
  this._addTab = function(uid, tab) {
    tabs[uid] = tab;
  }
  
  this.remove = function(tab) {
    if (tabs.indexOf(tab) !== -1) {
      tabs[tab.uid] = undefined;
      tabs.splice(tabs.indexOf(tab), 1);
      
      this.removeMember(tab);
      tab.window = null;
    }
  }
  
  this._removeTab = function(uid) {
    tabs[uid] = undefined;
  }
  
  this.insertBefore = function(old, tab) {
    if ((tab instanceof RegisterTab || tab instanceof RegisterGroup)  && tabs.indexOf(old) !== -1 && tab !== old) {
      if (tabs.indexOf(tab) !== -1)
        tabs.splice(tabs.indexOf(tab), 1);
      tabs.splice(tabs.indexOf(old), 0, tab);
      
      tabs[tab.uid] = tab;
      tab.window = this;
    }
  }
  
  this.renderTabs = function() {
    tabPanel.remove(tabPanel.children);
    
    for (var i=0,l=tabs.length; i<l; i++) {
      tabPanel.append(tabs[i].mainTab);
    }
  }
  
  this.registerTab = function(name, title, options) {
    var tab = RegisterTab(name, title, options);
    
    if (!defaultGroup) {
      tabs.push(tab);
      tabs[tab.uid] = tab;
      tab.window = this;
    } else {
      defaultGroup.add(tab);
    }
    
    return tab;
  }
  
  this.registerGroup = function(name, title, options) {
    var group   = RegisterGroup(name, title, options);
    var options = jSh.type(options) === "object" ? options : {};
    
    if (options.defaultGroup)
      defaultGroup = group;
    
    tabs.push(group);
    group.window = this;
    
    return group;
  }
}

jSh.inherit(RegisterWin, lcGroup);

var tabCount = 0, tabMap = {};

// AUR Window Tabs Interface
function RegisterTab(name, title, options) {
  if (!(this instanceof RegisterTab))
    return new RegisterTab(name, title, options);
  
  lcComponent.call(this);
  var that = this;
  
  options = jSh.type(options) === "object" ? options : {};
  
  tabCount += 1;
  
  // Check the options
  var disabled = boolOp(options.disabled, false);
  var visible  = boolOp(options.visible, true);
  
  var mainTab  = options.element instanceof Element ? options.element : jSh.d(".aur-ui-tab");
  var mainPage = jSh.d(".aur-ui-tabpage");
  
  this.mainTab  = mainTab;
  this.mainPage = mainPage;
  jSh.constProp(this, "type", "AURUITAB");
  jSh.constProp(this, "uid", "tab" + tabCount);
  
  // Check if option element provided valid DOM element
  if (options.element instanceof Element) // Add tab class to custom tab element
    mainTab.classList.add("aur-ui-tab");
  else // Set formal tab title
    mainTab.textContent = title !== undefined || title !== null ? title + "" : "Tab - " + this.uid;
  
  // Click delegation
  mainTab.setAttribute("aur-tab-click", this.uid);
  tabMap[this.uid] = this;
  
  this.setState("selected", false);
  this.addStateListener("selected", function(selected) {
    mainTab.classList[selected ? "add" : "remove"]("aur-tab-selected");
    mainPage.style.display = selected ? "block" : "none";
  });
  
  this.setState("disabled", disabled);
  this.addStateListener("disabled", function(disabled) {
    mainTab[disabled ? "removeAttribute" : "setAttribute"]("aur-tab-click", that.uid);
  });
  
  this.setState("window", null);
  this.addStateListener("window", function(win) {
    if (win instanceof RegisterWin || win instanceof RegisterGroup) {
      win.renderTabs();
      
      if (win instanceof RegisterWin) {
        win.tabPanel.appendChild(mainTab);
        win.tabPages.appendChild(mainPage);
      }
    } else {
      if (this.oldStateStatus instanceof RegisterWin || this.oldStateStatus instanceof RegisterGroup) {
        this.oldStateStatus.renderTabs();
        
        if (win instanceof RegisterWin) {
          win.tabPanel.removeChild(mainTab);
          win.tabPages.removeChild(mainPage);
        }
      }
      
      this.stateStatus = null;
    }
  });
  
  this.setState("height", null);
  this.addStateListener("height", function(height) {
    if (jSh.type(height) === "number" && height > 0 && height < Infinity)
      mainTab.style.height = height + "px";
    else if (mainTab.getAttr("style"))
      mainTab.setAttr("style", mainTab.getAttr("style").replace(/height\s*:[\s\w()\-!\d]+;?/i, ""));
  });
  
  // Property logic
  this.add = function(prop) {
    if (!(prop instanceof EmptyProp))
      return false;
    
    this.mainPage.appendChild(prop.main);
  }
  
  var propNames = Object.getOwnPropertyNames(propMap);
  
  for (var i=0,l=propNames.length; i<l; i++) {
    (function(propName) {
      var propConstruct = propMap[propName];
      
      that[propName] = function(name, width, options) {
        var newProp = propConstruct(name, width, options);
        that.add(newProp);
        
        return newProp;
      }
    })(propNames[i]);
  }
}

jSh.inherit(RegisterTab, lcComponent);

var groupCount = 0, groupMap = {};

// AUR Tab Property Group Interface
function RegisterGroup(name, title, options) {
  if (!(this instanceof RegisterGroup))
    return new RegisterGroup(name, title, options);
  
  lcComponent.call(this);
  
  groupCount += 1;
  
  var tabs = [];
  var main = jSh.d(".aur-ui-tab-group");
  this.mainTab = main;
  
  jSh.constProp(this, "type", "AURUITABGROUP");
  jSh.constProp(this, "uid", "group" + groupCount);
  
  this.setState("window", null);
  this.addStateListener("window", function(win) {
    if (win instanceof RegisterWin) {
      win.renderTabs();
      
      for (var i=0,l=tabs.length; i<l; i++) {
        win._addTab(tabs[i].uid);
        win.tabPages.appendChild(tabs[i].mainPage);
      }
    } else {
      if (this.oldStateStatus instanceof RegisterWin) {
        this.oldStateStatus.renderTabs();
        
        for (var i=0,l=tabs.length; i<l; i++) {
          win._removeTab(tabs[i].uid);
          this.oldStateStatus.tabPages.removeChild(tabs[i].mainPage);
        }
      }
      
      this.stateStatus = null;
    }
  });
  
  this.getTab = function(name) {
    return tabs[name] instanceof RegisterTab ? tabs[name] : null;
  }
  
  this.add = function(tab) {
    if (tab instanceof RegisterTab) {
      tabs[tab.uid] = tab;
      tabs.push(tab);
      main.appendChild(tab.mainTab);
      
      if (this.window && tab.window !== this.window) {
        this.window._addTab(tab.uid, tab);
        this.window.addMember(tab);
        this.window.tabPages.appendChild(tab.mainPage);
      }
      
      tab.window = this;
    }
  }
  
  this.remove = function(tab) {
    if (tabs.indexOf(tab) !== -1) {
      tabs[tab.uid] = undefined;
      tabs.splice(tabs.indexOf(tab), 1);
      main.removeChild(tab.mainTab);
      
      if (this.window) {
        this.window._removeTab(tab.uid);
        this.window.removeMember(tab);
        this.window.tabPages.removeChild(tab.mainPage);
      }
      
      tab.window = null;
    }
  }
  
  this.renderTabs = function() {
    if (this.window)
      this.window.renderTabs();
  }
  
  this.registerTab = function(name, title, options) {
    var tab = RegisterTab(name, title, options);
    this.add(tab);
    
    return tab;
  }
}

jSh.inherit(RegisterGroup, lcComponent);

// Private propcount
var propCount = 0;

// Raw AUR Tab Property
function EmptyProp(name, width, options) {
  if (!(this instanceof EmptyProp))
    return new EmptyProp(name, width, options);
  
  var that = this;
  lcComponent.call(this);
  propCount += 1;
  
  // Options
  width = numOp(width, 50);
  name  = jSh.type(name) === "string" && name ? name : "prop-" + propCount;
  
  var main  = new lcControl(jSh.d(".aur-ui-prop"));
  this.main = main.element;
  jSh.constProp(this, "name", name);
  
  main.style.width = (100 * (width / 12)) + "%";
  
  this.setState("disabled", false);
  this.addStateListener("disabled", function(disabled) {
    main.disabled = disabled;
  });
  
  var alignments = ["left", "center", "right"];
  this.setState("align", "left");
  this.addStateListener("align", function(align) {
    align = align + "";
    
    if (alignments.indexOf(align.toLowerCase()) !== -1) {
      that.main.style.textAlign = align.toLowerCase();
    } else {
      that.main.style.textAlign = "left";
      this.stateStatus = "left";
    }
  });
  
  this.align = options.align;
}

jSh.inherit(EmptyProp, lcComponent);

// Group Property
function GroupProp(name, width, options) {
  if (!(this instanceof GroupProp))
    return new GroupProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, 100, options);
  
  this.add = function(prop) {
    if (!(prop instanceof EmptyProp))
      return false;
    
    this.main.appendChild(prop.main);
  }
  
  var propNames = Object.getOwnPropertyNames(propMap);
  
  for (var i=0,l=propNames.length; i<l; i++) {
    (function(propName) {
      var propConstruct = propNames[propName];
      
      that[propName] = function(name, width, options) {
        var newProp = propConstruct(name, width, options);
        that.add(newProp);
        
        return newProp;
      }
    })(propNames[i]);
  }
}

jSh.inherit(GroupProp, EmptyProp);

// Text Property
function TextProp(name, width, options) {
  if (!(this instanceof TextProp))
    return new TextProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
  this.main.classList.add("aur-ui-prop-padd");
  
  var that    = this;
  var options = jSh.type(options) === "object" ? options : {};
  var mainDis = jSh.c("span");
  
  this.main.insertBefore(mainDis, this.main.childNodes[0]);
  this.htmlData = options.htmlData !== undefined ? options.htmlData : false;
  
  this.setState("data", "");
  this.addStateListener("data", function(data) {
    mainDis[that.htmlData ? "innerHTML" : "textContent"] = data;
  });
  
  // Apply options
  if (options.data !== undefined) {
    if (!options.dynText)
      this.data = options.data;
    else {
      lcDynamicText.call(this);
      this.dynText.element = this.main;
      
      this.removeAllStateListeners("data");
      this.addStateListener("data", function(data) {
        that.dynText.compile(data + "");
      });
      
      if (options.data)
        this.data = options.data;
    }
  }
}

jSh.inherit(TextProp, EmptyProp);

// Text Input Property
function InputTextProp(name, width, options) {
  if (!(this instanceof InputTextProp))
    return new InputTextProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
  this.main.classList.add("aur-ui-prop-padd");
  
  options    = jSh.type(options) === "object" ? options : {};
  var input  = new lcTextField();
  this.input = input;
  
  // LCES Settings link
  if (typeof options.link === "string") {
    
  }
  
  this.main.appendChild(input);
}

jSh.inherit(InputTextProp, EmptyProp);

// Number Input Property
function InputNumProp(name, width, options) {
  if (!(this instanceof InputNumProp))
    return new InputNumProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
}

jSh.inherit(InputNumProp, EmptyProp);

// Toggle Property
function ToggleProp(name, width, options) {
  if (!(this instanceof ToggleProp))
    return new ToggleProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
}

jSh.inherit(ToggleProp, EmptyProp);

// Slider Property
function SliderProp(name, width, options) {
  if (!(this instanceof SliderProp))
    return new SliderProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
}

jSh.inherit(SliderProp, EmptyProp);

// Slider Property
function DropDownProp(name, width, options) {
  if (!(this instanceof DropDownProp))
    return new DropDownProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
}

jSh.inherit(DropDownProp, EmptyProp);

var propMap = {
  emptyProp:     EmptyProp,
  groupProp:     GroupProp,
  textProp:      TextProp,
  inputTextProp: InputTextProp,
  inputNumProp:  InputNumProp,
  toggleProp:    ToggleProp,
  sliderProp:    SliderProp,
  dropDownProp:  DropDownProp
};

// Construct interface
regs.interface = {
  prefs: null, // When aur-prefs module loads, update this entry
  
  __setPrefs: function() { // Set the prefs when aur-ui-prefs
    
    delete regs.interface.__setPrefs;
  },
  
  registerWin: RegisterWin,
  
  window: {
    
  },
  
  notifi: {
    notifi: function(type, msg, delay, placement, visible) {
      var notifi = new lcNotification(msg, delay, placement);
      
      notifi.container.className += " aur-notifi aur-notifi-" + type;
      notifi.visible = visible;
      
      return notifi;
    },
    
    info: function(msg, delay, placement, visible) {
      return this.notifi.apply(this, ["info"].concat(jSh.toArr(arguments)));
    },
    
    success: function(msg, delay, placement, visible) {
      return this.notifi.apply(this, ["success"].concat(jSh.toArr(arguments)));
    },
    
    error: function(msg, delay, placement, visible) {
      return this.notifi.apply(this, ["error"].concat(jSh.toArr(arguments)));
    },
    
    neutral: function(msg, delay, placement, visible) {
      return this.notifi.apply(this, ["neutral"].concat(jSh.toArr(arguments)));
    }
  }
};

AUR.onLoaded("aur-styles", function() {
  var styles = AUR.import("aur-styles");
  
  var tabPanelWidth = "120px";
  var propMargin = "5px";
  
  var winStyles = styles.styleBlock(`
    /* AUR Window Styles */
    .aur-ui-win .lces-window-contents {
      position: relative;
      padding: 0px;
      min-width: 100px;
      min-height: 100px;
    }
    
    .aur-ui-win .aur-tabsvisible .aur-ui-tabpanel {
      width: ${tabPanelWidth};
      height: 100%;
    }
    
    .aur-ui-win .aur-tabsvisible .aur-ui-tabpage {
      margin-left: ${tabPanelWidth};
    }
    
    .aur-ui-tabpanel {
      position: absolute;
      width: 0px;
    }
    
    .aur-ui-tabpage {
      display: none;
      position: relative;
      padding: 20px 0px;
      height: 100%;
      box-sizing: border-box;
    }
    
    .aur-ui-tabpages {
      height: 100%;
      width: 100%;
    }
    
    /* Properties */
    .aur-ui-prop {
      display: inline-block;
      box-sizing: border-box;
    }
    
    .aur-ui-prop-padd {
      padding: 0px ${propMargin};
    }
  `);
});
