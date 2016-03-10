// AUR UI bindings, LCES abstraction

(function() {
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
    
    this.tabPages = tabPages;
    
    aurwin.classList.add("aur-ui-win");
    aurwin.buttonPanelVisible = false;
    
    tabPanel.addEventListener("click", function(e) {
      var target = e.target, tab;
      
      while (target !== this) {
        if (target.getAttribute("aur-tab-click")) {
          tab = tabMap[target.getAttribute("aur-tab-click")];
          
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
    
    this.getTab = function(name) {
      return tabs[name] instanceof RegisterTab || tabs[name] instanceof RegisterGroup ? tabs[name] : null;
    }
    
    this.add = function(tab) {
      if (tab instanceof RegisterTab || tab instanceof RegisterGroup) {
        tabs[tab.uid] = tab;
        tabs.push(tab);
        tab.window = this;
      }
    }
    
    this.remove = function(tab) {
      if (tabs.indexOf(tab) !== -1) {
        tabs[tab.uid] = undefined;
        tabs.splice(tabs.indexOf(tab), 1);
        
        tab.window = null;
      }
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
      if (jSh.type(name) !== "string" || !name)
        return false;
      
      var tab = RegisterTab(name, title, options);
      
      if (!defaultGroup)
        tabs.push(tab);
      
      tabs[tab.uid] = tab;
      tab.window = defaultGroup || this;
      
      return tab;
    }
    
    this.registerGroup = function(name, title, options) {
      var group   = RegisterGroup(name, title, options);
      var options = jSh.type(options) === "object" ? options : {};
      
      if (options.defaultGroup)
        defaultGroup = group;
      
      tabs.push(group);
      group.window = this;
    }
  }
  
  jSh.inherit(RegisterWin, lcComponent);
  
  var tabCount = 0, tabMap = {};
  
  // AUR Window Tabs Interface
  function RegisterTab(name, title, options) {
    lcComponent.call(this);
    var that = this;
    
    options = jSh.type(options) === "object" ? object : {};
    
    tabCount += 1;
    
    // Check the options
    var disabled = boolOp(options.disabled, false);
    var visible  = boolOp(options.visible, true);
    
    if (options.element instanceof Element)
      options.element.classList.add("aur-ui-tab");
    
    var mainTab  = options.element instanceof Element ? options.element : jSh.d(".aur-ui-tab");
    var mainPage = jSh.d(".aur-ui-tabpage");
    
    this.mainTab  = mainTab;
    this.mainPage = mainPage;
    jSh.constProp(this, "type", "AURUITAB");
    jSh.constProp(this, "uid", "tab" + tabCount);
    
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
        
        if (win instanceof RegisterWin)
          win.tabPages.appendChild(mainPage);
      } else {
        if (this.oldStateStatus instanceof RegisterWin || this.oldStateStatus instanceof RegisterGroup) {
          this.oldStateStatus.renderTabs();
          
          if (win instanceof RegisterWin)
            win.tabPages.removeChild(mainPage);
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
        var propConstruct = propNames[propName];
        
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
          win.tabPages.appendChild(tabs[i].mainPage);
        }
      } else {
        if (this.oldStateStatus instanceof RegisterWin) {
          this.oldStateStatus.renderTabs();
          
          for (var i=0,l=tabs.length; i<l; i++) {
            this.oldStateStatus.tabPages.removeChild(tabs[i].mainPage);
          }
        }
        
        this.stateStatus = null;
      }
    });
    
    this.renderTabs = function() {
      if (this.window)
        this.window.renderTabs();
    }
    
    this.registerTab = function(name, title, options) {
      if (jSh.type(name) !== "string" || !name)
        return false;
      
      var tab = RegisterTab(name, title, options);
      
      tabs[tab.uid] = tab;
      tabs.push(tab);
      tab.window = this;
      
      return tab;
    }
  }
  
  jSh.inherit(RegisterGroup, lcComponent);
  
  // Private propcount
  var propCount = 0;
  
  // Raw AUR Tab Property
  function EmptyProp(name, width, options) {
    if (!(this instanceof EmptyProp))
      return new EmptyProp(name, title, options);
    
    lcComponent.call(this);
    propCount += 1;
    
    // Options
    width = numOp(width, 50);
    name  = jSh.type(name) === "string" && name ? name : "prop-" + propCount;
    
    var main  = jSh.d(".aur-ui-prop");
    this.main = element;
    jSh.constProp(this, "name", name);
    
    main.style.width = (100 * (width / 12)) + "%";
  }
  
  jSh.inherit(EmptyProp, lcComponent);
  
  // Group Property
  function GroupProp(name, width, options) {
    if (!(this instanceof GroupProp))
      return new GroupProp(name, title, options);
    
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
      return new TextProp(name, title, options);
    
    EmptyProp.call(this, name, width, options);
  }
  
  jSh.inherit(TextProp, EmptyProp);
  
  // Text Input Property
  function InputTextProp(name, width, options) {
    if (!(this instanceof InputTextProp))
      return new InputTextProp(name, title, options);
    
    EmptyProp.call(this, name, width, options);
  }
  
  jSh.inherit(InputTextProp, EmptyProp);
  
  // Number Input Property
  function InputNumProp(name, width, options) {
    if (!(this instanceof InputNumProp))
      return new InputNumProp(name, title, options);
    
    EmptyProp.call(this, name, width, options);
  }
  
  jSh.inherit(InputNumProp, EmptyProp);
  
  // Toggle Property
  function ToggleProp(name, width, options) {
    if (!(this instanceof ToggleProp))
      return new ToggleProp(name, title, options);
    
    EmptyProp.call(this, name, width, options);
  }
  
  jSh.inherit(ToggleProp, EmptyProp);
  
  // Slider Property
  function SliderProp(name, width, options) {
    if (!(this instanceof SliderProp))
      return new SliderProp(name, title, options);
    
    EmptyProp.call(this, name, width, options);
  }
  
  jSh.inherit(SliderProp, EmptyProp);
  
  var propMap = {
    emptyProp:     EmptyProp,
    GroupProp:     GroupProp,
    textProp:      TextProp,
    inputTextProp: InputTextProp,
    inputNumProp:  InputNumProp,
    toggleProp:    ToggleProp,
    sliderProp:    SliderProp
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
    
    var winStyles = styles.styleBlock(`
      /* AUR Window Styles */
      .aur-ui-win.lces-window-contents {
        padding: 0px;
        min-width: 100px;
        min-height: 100px;
      }
      
      .aur-ui-win.aur-tabsvisible .aur-ui-tabpanel {
        width: 80px;
      }
      
      .aur-ui-tabpanel {
        width: 0px;
      }
      
      .aur-ui-tabpage {
        padding: 20px 0px;
      }
      
      /* Properties */
      .aur-ui-prop {
        display: inline-block;
      }
    `);
  });
})();
