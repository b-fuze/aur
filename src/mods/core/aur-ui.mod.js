// AUR UI bindings, LCES abstraction
//
// Initial Author: b-fuze
//
// TODO:
//    -
//
// Changelog:
//    - Initial Build
//
AUR_NAME = "AUR UI";
AUR_DESC = "AUR UI API";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;

var regs = reg;
var sett;

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
  aurwin.centered  = boolOp(options.centered, false);
  
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
      that.selectedTab = tab;
    }
  });
  
  tabPages.addEventListener("wheel", function(e) {
    e.preventDefault();
  });
  
  this.setState("tabsVisible", false);
  this.addStateListener("tabsVisible", function(visible) {
    aurwin.classList[visible ? "add" : "remove"]("aur-tabsvisible");
  });
  
  this.setState("visible", false);
  this.addStateListener("visible", function(visible) {
    aurwin.visible = visible;
  });
  
  // Make title container for close button
  var titlesp   = jSh.c("span");
  var mainTitle = aurwin._title;
  
  titlesp.innerHTML = mainTitle.innerHTML;
  mainTitle.innerHTML = "";
  
  mainTitle.appendChild(titlesp);
  aurwin._title = titlesp;
    
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
  
  this.setState("selectedTab", null);
  
  // Add closing button
  var closeBtn = jSh.svg(".aur-ui-win-close", 30, 30, [
    jSh.path(undf, "M8.625 7.22L7.22 8.624 13.593 15 7.22 21.375l1.405 1.406L15 16.407l6.375 6.375 1.406-1.405L16.407 15l6.375-6.375-1.405-1.406L15 13.593 8.625 7.22z")
  ]);
  
  mainTitle.appendChild(closeBtn);
  closeBtn.addEventListener("click", function() {
    aurwin.visible = false;
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
    if ((tab instanceof RegisterTab || tab instanceof RegisterGroup) && tabs.indexOf(old) !== -1 && tab !== old) {
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
  
  var mainTab   = options.element instanceof Element ? options.element : jSh.d(".aur-ui-tab");
  var mainPage  = jSh.d(".aur-ui-tabpage", undf, jSh.d({
    sel: ".aur-ui-tabpage-focus",
    attr: {tabindex: 0}
  }));
  var mainFocus = mainPage.getChild(0);
  
  this.mainTab  = mainTab;
  this.mainPage = mainPage;
  jSh.constProp(this, "type", "AURUITAB");
  jSh.constProp(this, "uid", "tab" + tabCount);
  
  // Check if option element provided valid DOM element
  if (options.element instanceof Element) { // Add tab class to custom tab element
    this.tabTitle = null;
    mainTab.classList.add("aur-ui-tab");
  } else { // Set formal tab title
    this.tabTitle = title !== undefined && title !== null ? title + "" : "Tab - " + this.uid;
    
    mainTab.textContent = this.tabTitle;
  }
  // Click delegation
  mainTab.setAttribute("aur-tab-click", this.uid);
  tabMap[this.uid] = this;
  
  this.setState("selected", false);
  this.addStateListener("selected", function(selected) {
    mainTab.classList[selected ? "add" : "remove"]("aur-tab-selected");
    mainPage.style.display = selected ? "block" : "none";
    
    if (selected) {
      mainFocus.focus();
      
      scrollbar.visible = true;
      setTimeout(() => {
        scrollbar.update();
        
        // Quick hack for sliders TODO: Check for more elegant approach
        mainPage.jSh(".lces-slider").forEach(s => s.component.updateSliderWidth());
      }, 10);
    } else
      scrollbar.visible = false;
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
        
        scrollbar.parent = win.tabPages;
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
        
        // `Prop` could fail because of the LCES setting involved
        if (newProp) {
          if (propName === "prop") {
            that.add(newProp.label);
            that.add(newProp);
          } else
            that.add(newProp);
        }
        
        return newProp;
      }
    })(propNames[i]);
  }
  
  // Add custom LCES scrollbars
  var pageWidget = jSh.extendObj(new lcComponent(), {
    element: mainPage,
    scrollbarContent: mainPage
  });
  lcScrollBars.call(pageWidget, undf, undf, false);
  
  var scrollbar  = pageWidget.lcesScrollbar;
  this.scrollbar = scrollbar;
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
        tabs[i].scrollbar.parent = win.tabPages;
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
        
        tab.scrollbar.parent = this.window.tabPages;
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
  var options = jSh.type(options) === "object" ? options : {};
  
  lcComponent.call(this);
  propCount++;
  
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
  
  this.setState("linebreak", false);
  this.addStateListener("linebreak", function(linebr) {
    if (linebr) {
      that.main.classList.add("aur-ui-prop-linebr");
    } else {
      that.main.classList.remove("aur-ui-prop-linebr");
    }
    
    this.stateStatus = !!linebr;
  });
  
  this.linebreak = options.linebreak;
}

jSh.inherit(EmptyProp, lcComponent);

// Group Property
function GroupProp(name, width, options) {
  if (!(this instanceof GroupProp))
    return new GroupProp(name, width, options);
  
  var that = this;
  var options = jSh.type(options) === "object" ? options : {};
  
  EmptyProp.call(this, name, 12, options);
  this.main.classList.add("aur-ui-prop-group");
  
  this.add = function(prop) {
    if (!(prop instanceof EmptyProp))
      return false;
    
    this.main.appendChild(prop.main);
  }
  
  this.setState("title", null);
  this.addStateListener("title", function(title) {
    if (title) {
      that.main.setAttribute("data-aurui-group-title", title);
      that.main.classList.add("group-title-visible");
    } else {
      that.main.setAttribute("data-aurui-group-title", "");
      that.main.classList.remove("group-title-visible");
    }
  });
  
  if (options.title && typeof options.type === "string")
    this.title = options.title;
  
  var propNames = Object.getOwnPropertyNames(propMap);
  
  for (var i=0,l=propNames.length; i<l; i++) {
    (function(propName) {
      var propConstruct = propMap[propName];
      
      that[propName] = function(name, width, options) {
        var newProp = propConstruct(name, width, options);
        
        // `Prop` could fail because of the LCES setting involved
        if (newProp) {
          if (propName === "prop") {
            that.add(newProp.label);
            that.add(newProp);
          } else
            that.add(newProp);
        }
        
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
  
  EmptyProp.call(this, name, width, options);
  this.main.classList.add("aur-ui-prop-padd");
  this.main.classList.add("aur-ui-prop-text");
  
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

// Button Property
function ButtonProp(name, width, options) {
  if (!(this instanceof ButtonProp))
    return new ButtonProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
  this.main.classList.add("aur-ui-prop-padd");
  
  var that     = this;
  var options  = jSh.type(options) === "object" ? options : {};
  this.buttons = [];
  
  // this.setState("data", "");
  // this.addStateListener("data", function(data) {
  //   // Something for buttons here...
  // });
  
  // LCES Window Button manipulation functions
  this.addButton = function(text, onClick) {
    var button = new lcWidget(jSh.c("button", undf, text));
    
    if (typeof onClick === "function") {
      button.addEventListener("click", onClick);
    }
    
    this.buttons.push(button);
    that.main.appendChild(button.element);
    
    return button;
  }
  
  this.removeButton = function(button) {
    if (this.buttons.indexOf(button) === -1)
      return false;
    
    this.buttons.splice(this.buttons.indexOf(button), 1);
    that.main.removeChild(button.element);
  }
  
  // Apply options
  if (jSh.type(options.data) === "array") {
    var buttons = options.data;
    
    for (var i=0,l=buttons.length; i<l; i++) {
      this.addButton(buttons[i][0], buttons[i][1]);
    }
  }
}

jSh.inherit(ButtonProp, EmptyProp);

// AUR Setting Linker
function settLinkProp(prop, linkPath, multiple) {
  var link = sett.getDetails(linkPath);
  
  if (link && (multiple ? link.multipleValues : true)) {
    var linkVal = sett.get(link.path);
    prop.data = linkVal;
    
    sett.on(link.path, function(e) {
      prop.data = e.value;
    });
    
    prop.addStateListener("data", function(value) {
      sett.set(link.path, value);
    });
    
    return true;
  }
  
  return false;
}

// Text Input Property
function InputTextProp(name, width, options) {
  if (!(this instanceof InputTextProp))
    return new InputTextProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
  this.main.classList.add("aur-ui-prop-padd");
  
  options    = jSh.type(options) === "object" ? options : {};
  var input  = !options.area ? new lcTextField() : new lcTextArea();
  var linked;
  
  this.input = input;
  
  // Set textarea lines/rows if any
  if (options.area && numOp(options.rows, null) !== null)
    input.element.rows = options.rows;
  
  if (options.fill)
    this.main.classList.add("aur-ui-prop-input-text-fill");
  
  if (options.placeholder)
    input.element.placeholder = options.placeholder;
  
  // UI Property Data Link
  this.setState("data", options.data ? (options.data + "") : "");
  this.addStateListener("data", function(data) {
    input.value = data;
  });
  
  input.addEventListener("change", function() {
    that.data = this.value;
  });
  
  // LCES Settings link
  if (typeof options.link === "string" && options.link) {
    linked = settLinkProp(this, options.link);
  }
  
  this.main.appendChild(input.element);
}

jSh.inherit(InputTextProp, EmptyProp);

// Number Input Property
function InputNumProp(name, width, options) {
  if (!(this instanceof InputNumProp))
    return new InputNumProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
  this.main.classList.add("aur-ui-prop-padd");
  
  options    = jSh.type(options) === "object" ? options : {};
  var input  = new lcNumberField();
  var linked;
  
  this.input = input;
  
  if (options.fill)
    this.main.classList.add("aur-ui-prop-input-text-fill");
  
  // UI Property Data Link
  this.setState("data", options.data ? (options.data + "") : "");
  this.addStateListener("data", function(data) {
    input.value = data;
  });
  
  input.addStateListener("value", function(value) {
    that.data = value;
  });
  
  // LCES Settings link
  if (typeof options.link === "string" && options.link) {
    linked = settLinkProp(this, options.link);
  }
  
  input.parent = this.main;
}

jSh.inherit(InputNumProp, EmptyProp);

// Color Input Property
function InputColorProp(name, width, options) {
  if (!(this instanceof InputColorProp))
    return new InputColorProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
  this.main.classList.add("aur-ui-prop-padd");
  
  options   = jSh.type(options) === "object" ? options : {};
  var input = lces.new("colorchooser");
  
  input.valueType = "hex";
  var linked;
  
  this.input = input;
  
  // UI Property Data Link
  this.setState("data", options.data ? (options.data + "") : "");
  this.addStateListener("data", function(data) {
    input.value = data;
  });
  
  input.addStateListener("value", function(value) {
    that.data = value;
  });
  
  // Change the screen when it's visible
  input.addStateListener("modalVisible", function(visible) {
    if (visible)
      lces.ui.colorchooser.screen.classList.add("aur-ui-cchooser");
    else {
      setTimeout(function() {
        lces.ui.colorchooser.screen.classList.remove("aur-ui-cchooser");
      }, 160);
    }
  });
  
  // LCES Settings link
  if (typeof options.link === "string" && options.link) {
    linked = settLinkProp(this, options.link);
  }
  
  input.parent = this.main;
}

jSh.inherit(InputColorProp, EmptyProp);

// Toggle Property
function ToggleProp(name, width, options) {
  if (!(this instanceof ToggleProp))
    return new ToggleProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
  this.main.classList.add("aur-ui-prop-padd");
  
  options    = jSh.type(options) === "object" ? options : {};
  var input  = new lcToggleField();
  var linked;
  
  this.input = input;
  
  if (options.fill)
    this.main.classList.add("aur-ui-prop-input-text-fill");
  
  // UI Property Data Link
  this.setState("data", typeof options.data === "boolean" ? options.data : false);
  this.addStateListener("data", function(data) {
    input.checked = data;
  });
  
  input.addStateListener("checked", function(checked) {
    that.data = checked;
  });
  
  // LCES Settings link
  if (typeof options.link === "string" && options.link) {
    linked = settLinkProp(this, options.link);
  }
  
  input.parent = this.main;
}

jSh.inherit(ToggleProp, EmptyProp);

// Slider Property
function SliderProp(name, width, options) {
  if (!(this instanceof SliderProp))
    return new SliderProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
  this.main.classList.add("aur-ui-prop-padd");
  this.main.classList.add("aur-ui-prop-slider");
  
  options    = jSh.type(options) === "object" ? options : {};
  var input  = new lcSlider();
  var linked;
  
  this.input = input;
  
  if (options.fill)
    this.main.classList.add("aur-ui-prop-input-text-fill");
  
  // UI Property Data Link
  this.setState("data", options.data ? (options.data + "") : "");
  this.addStateListener("data", function(data) {
    input.value = data;
  });
  
  input.addStateListener("value", function(value) {
    that.data = value;
  });
  
  this.addStateListener("min", function(min) {
    input.min = min;
  });
  
  this.addStateListener("max", function(max) {
    input.max = max;
  });
  
  this.addStateListener("integer", function(intg) {
    input.decimals = !intg;
  });
  
  this.addStateListener("suffix", function(suff) {
    input.suffix = suff + "";
  });
  
  this.addStateListener("prefix", function(pre) {
    input.prefix = pre + "";
  });
  
  if (typeof numOp(options.min, null) === "number")
    this.min = options.min;
  
  if (typeof numOp(options.max, null) === "number")
    this.max = options.max;
  
  if (typeof boolOp(options.integer, null) === "boolean")
    this.integer = options.integer;
  
  if (strOp(options.suffix, null))
    this.suffix = options.suffix;
  
  if (strOp(options.prefix, null))
    this.prefix = options.prefix;
  
  // LCES Settings link
  if (typeof options.link === "string" && options.link) {
    linked = settLinkProp(this, options.link);
  }
  
  input.parent = this.main;
}

jSh.inherit(SliderProp, EmptyProp);

lces.ui.dropdown.addStateListener("screenVisible", function(visible) {
  if (visible) {
    lces.ui.dropdown.screen.classList.add("aur-ui-win-dropdown-options");
    lces.ui.dropdown.display.checkFlipped();
  } else {
    setTimeout(function() {
      lces.ui.dropdown.screen.classList.remove("aur-ui-win-dropdown-options");
    }, 261);
  }
});

// Dropdown Property
function DropDownProp(name, width, options) {
  if (!(this instanceof DropDownProp))
    return new DropDownProp(name, width, options);
  
  var that = this;
  EmptyProp.call(this, name, width, options);
  this.main.classList.add("aur-ui-prop-padd");
  
  options    = jSh.type(options) === "object" ? options : {};
  var input  = new lcDropDown();
  var linked;
  
  this.input = input;
  
  // UI Property Data Link
  this.setState("data", options.data ? (options.data + "") : "");
  this.addStateListener("data", function(data) {
    input.value = data;
  });
  
  input.addStateListener("value", function(value) {
    that.data = value;
  });
  
  // LCES Settings link
  if (typeof options.link === "string" && options.link) {
    linked = settLinkProp(this, options.link, true);
    
    if (linked) {
      var settDet = sett.getDetails(options.link);
      var values  = settDet.multipleValues;
      var names   = settDet.formalMultiple;
      
      for (var i=0,l=values.length; i<l; i++) {
        var newOp = input.addOption(values[i], names[i] || values[i]);
        
        if (settDet.currentIndex === i)
          input.selectedOption = newOp;
      }
    }
  }
  
  this.main.appendChild(input.element);
}

jSh.inherit(DropDownProp, EmptyProp);

function Prop(options) {
  if (!options || options.constructor !== Object || jSh.type(options.link) !== "string" || !options.link)
    return null;
  
  var setting  = sett.getDetails(options.link);
  
  if (!setting)
    return null;
  
  var lblWidth = Math.min(Math.max(numOp(options.width, 5), 1), 12);
  var inpWidth = 12 - lblWidth;
  
  var input;
  var label = TextProp(null, lblWidth, {
    data: setting.name,
    dynText: options.dynText
  });
  
  if (!setting.multipleValues) {
    if (setting.type === "string") {
      if (options.color) {
        input = InputColorProp(null, inpWidth, {
          link: "uiTest.lol",
          align: "left"
        });
      } else {
        input = InputTextProp(null, inpWidth, jSh.extendObj(options, {
          align: "left"
        }));
      }
    } else if (setting.type === "number") {
      if (options.slider) {
        input = SliderProp(null, inpWidth, jSh.extendObj(options, {
          align: "left"
        }));
      } else {
        input = InputNumProp(null, inpWidth, jSh.extendObj(options, {
          align: "left"
        }));
      }
    } else if (setting.type === "boolean") {
      input = ToggleProp(null, inpWidth, jSh.extendObj(options, {
        align: "left"
      }));
    }
  } else {
    input = DropDownProp(null, inpWidth, {
      link: options.link,
      align: "left"
    });
  }
  
  input.label = label;
  return input;
}

var propMap = {
  emptyProp:      EmptyProp,
  groupProp:      GroupProp,
  textProp:       TextProp,
  buttonProp:     ButtonProp,
  inputTextProp:  InputTextProp,
  inputNumProp:   InputNumProp,
  inputColorProp: InputColorProp,
  toggleProp:     ToggleProp,
  sliderProp:     SliderProp,
  dropDownProp:   DropDownProp,
  prop:           Prop
};

// Construct interface
regs.interface = {
  prefs: null, // When aur-prefs module loads, update this entry
  
  __setPrefs: function() { // Set the prefs when aur-ui-prefs
    
    delete regs.interface.__setPrefs;
  },
  
  registerWin: RegisterWin,
  prop: jSh.extendObj({}, propMap),
  
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

AUR.onLoaded("aur-styles", "aur-settings", function() {
  styles = AUR.import("aur-styles");
  sett   = AUR.import("aur-settings");
  
  var tabPanelWidth = "140px";
  var propHorzMargin = "5px";
  var propVertMargin = "10px";
  var smooth = "cubic-bezier(.31,.26,.1,.92)";
  
  var winStyles = styles.styleBlock(`
    /* AUR Window Styles */
    
    .aur-ui-win.lces-window > div > div {
      background: transparent;
      box-shadow: 0px 10px 23px rgba(0,0,0,0.6);
      border: 1px solid #3F454A;
      border-radius: 6px;
    }
    
    .aur-ui-win .lces-window-title {
      position: relative;
      color: #B0B6BF;
      background: #292C30;
    }
    
    // Close button
    .aur-ui-win .lces-window-title .aur-ui-win-close {
      position: absolute;
      right: 20px;
      top: 0px;
      bottom: 0px;
      margin: auto 0px;
      
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 250ms ${smooth};
    }
    
    .aur-ui-win .lces-window-title .aur-ui-win-close path {
      fill: #B0B6BF;
      transform-origin: 50% 50%;
      transform: scale(0.8, 0.8);
      transition: transform 250ms ${smooth};
    }
    
    .aur-ui-win .lces-window-title .aur-ui-win-close:hover {
      opacity: 1;
    }
    
    .aur-ui-win .lces-window-title .aur-ui-win-close:hover path {
      transform: scale(0.85, 0.85);
    }
    
    .aur-ui-win .lces-window-contents {
      position: relative;
      padding: 0px;
      min-width: 100px;
      min-height: 100px;
      
      font-size: 15px;
      color: #D9D9D9;
      background: #16181A;
    }
    
    .aur-ui-win .aur-tabsvisible .aur-ui-tabpanel {
      width: ${tabPanelWidth};
      height: 100%;
      box-sizing: border-box;
      // padding-top: 20px;
      overflow: auto;
      
      background: #111314;
      font-size: 14px;
      text-align: left;
    }
    
    .aur-ui-win .aur-tabsvisible .aur-ui-tabpanel .aur-ui-tab-group {
      margin-bottom: 10px;
    }
    
    .aur-ui-win .aur-tabsvisible .aur-ui-tabpanel .aur-ui-tab {
      cursor: default !important;
      background: #131517;
      color: #6F7680;
      padding: 5px 0px 5px 5px;
      margin-bottom: 2px;
      border-left: 2px solid #111314;
      
      user-select: none;
      -webkit-user-select: none; /* Chrome/Safari */
      -moz-user-select: none; /* Firefox */
    }
    
    .aur-ui-win .aur-tabsvisible .aur-ui-tabpanel .aur-ui-tab.aur-tab-selected {
      border-left: 2px solid #B0B6BF;
      color: #858E99;
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
      padding: 20px 5px;
      height: 100%;
      box-sizing: border-box;
      overflow: auto;
    }
    
    .aur-ui-tabpage-focus {
      display: block;
      height: 0px;
      width: 0px;
      margin: 0px;
      padding: 0px;
      outline: 0px !important;
    }
    
    .aur-ui-tabpages {
      height: 100%;
      width: 100%;
    }
    
    /* Properties */
    .aur-ui-prop {
      display: inline-block;
      box-sizing: border-box;
      vertical-align: top;
    }
    
    .aur-ui-prop-padd {
      padding: 0px ${propHorzMargin} ${propVertMargin} ${propHorzMargin};
    }
    
    .aur-ui-prop-group {
      display: block;
      margin: 30px 0px;
    }
    
    .aur-ui-prop-group::before {
      content: attr(data-aurui-group-title);
      display: none;
      margin-left: 5px;
      margin-bottom: 13px;
      text-transform: uppercase;
      font-weight: 500;
      font-size: 13px;
      font-family: Arial;
      letter-spacing: 0.05em;
      opacity: 0.75;
    }
    
    .aur-ui-prop-group.group-title-visible::before {
      display: block;
    }
    
    .aur-ui-prop-text {
      line-height: 1.4;
      cursor: default;
    }
    
    .aur-ui-prop > button {
      box-sizing: border-box;
      height: 34px;
      font-weight: normal;
      color: #B0B6BF;
      margin-left: 5px;
      margin-right: 5px;
    }
    
    .aur-ui-prop > button:hover::before {
      background: rgba(255, 255, 255, 0.05)
    }
    
    // This isn't working... TODO: Check this later
    .aur-ui-prop-linebr::before {
      content: "";
      display: block;
      margin: 0px;
      padding: 0px;
      width: 0px;
      height: 0px;
      border: 0px;
    }
    
    .aur-ui-prop-input-text-fill input[type="text"],
    .aur-ui-prop-input-text-fill input[type="password"],
    .aur-ui-prop-input-text-fill textarea {
      box-sizing: border-box;
      min-width: 100%;
    }
    
    // Numberfield Props
    .aur-ui-win input.lces.lces-numberfield {
      text-align: left;
      min-width: 68px !important;
    }
    
    // Slider props
    .aur-ui-prop-slider {
      position: relative;
      padding-right: 10px;
    }
    
    .aur-ui-win .lces-slider {
      box-sizing: border-box;
      width: 80%;
      height: 34px;
      margin-left: 20%;
      overflow: visible;
      
      border-color: transparent;
      background: transparent;
    }
    
    .aur-ui-win .lces-slider::before {
      content: "";
      position: absolute;
      top: 0px;
      bottom: 0px;
      left: 8px;
      right: 8px;
      height: 4px;
      border-radius: 2px;
      margin: auto 0px;
      background: #0B0C0D;
    }
    
    .aur-ui-win .lces-slider-scrubber {
      height: 15px;
      top: 0px;
      bottom: 0px;
      margin-top: auto;
      margin-bottom: auto;
      border-radius: 100%;
      background: #292C30;
    }
    
    .aur-ui-win .lces-slider-value {
      right: auto;
      top: 50%;
      left: -25%;
      width: 25%;
      transform: translateY(-50%);
      
      opacity: 1;
      color: #7A7B7B;
      text-align: left;
    }
    
    .aur-ui-win .lces-slider-min, .aur-ui-win .lces-slider-max, .aur-ui-win .lces-slider-value {
      font-family: inherit !important;
      font-size: inherit;
    }
    
    .aur-ui-win .lces-slider-min, .aur-ui-win .lces-slider-max {
      z-index: 20;
      padding: 3px 4px;
      border-radius: 2px;
      
      // background: rgba(0, 0, 0, 0.5);
      background: #292C30;
      // color: rgba(255, 255, 255, 0.65);
      color: #B0B6BF;
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
      
      opacity: 0;
      font-size: 13px;
      
      transition: opacity 250ms ${smooth}, transform 250ms ${smooth};
      cursor: default;
      pointer-events: none;
    }
    
    .aur-ui-win .lces-slider-min {
      left: 7px;
      transform: translate3d(-50%, 0px, 0px) translateX(-9px);
    }
    
    .aur-ui-win .lces-slider-max {
      right: 7px;
      transform: translate3d(50%, 0px, 0px) translateX(9px);
    }
    
    .aur-ui-win .lces-slider:hover .lces-slider-min, .aur-ui-win .lces-slider.scrubbing .lces-slider-min {
      opacity: 1;
      // transform: translate3d(-50%, 0px, 0px) translateX(-10px);
    }
    
    .aur-ui-win .lces-slider:hover .lces-slider-max, .aur-ui-win .lces-slider.scrubbing .lces-slider-max {
      opacity: 1;
      // transform: translate3d(50%, 0px, 0px) translateX(10px);
    }
    
    /* Fix prop colors */
    .aur-ui-tabpages {
      color: #9CA1A6;
    }
    
    .aur-ui-win input.lces, .aur-ui-win textarea.lces {
      border-color: #0B0C0D;
      background: #0B0C0D;
      color: #7A7B7B;
      box-sizing: border-box;
      font-weight: normal;
    }
    
    .aur-ui-win input.lces {
      height: 34px;
    }
    
    .aur-ui-win .lces-togglebox {
      background: #0B0C0D;
    }
    
    .aur-ui-win .lces-togglebox .lces-togglebox-handle .lces-togglebox-inner::before {
      background: #232529;
    }
    
    .aur-ui-win .lces-togglebox .lces-togglebox-handle .lces-togglebox-inner .lces-togglebox-text {
      color: #B0B6BF;
    }
    
    .aur-ui-win .numberfield-container .arrow.active {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .aur-ui-win input.lces[type="text"]:focus, .aur-ui-win input.lces[type="password"]:focus, .aur-ui-win textarea.lces:focus, .aur-ui-win .lces-togglebox:focus,
    .aur-ui-win .lces-slider:focus, .aur-ui-win .lcesdropdown:focus, .aur-ui-win .lces-colorchooser .lces-cc-display:focus {
      box-shadow: 0px 0px 2px rgba(191, 219, 255, 0.75);
      outline: none !important;
    }
    
    // Colorchooser
    .aur-ui-win .lces-colorchooser .lces-cc-display {
      width: auto !important;
      height: auto !important;
    }
    
    .aur-ui-win .lces-colorchooser .lces-cc-color {
      width: 44px;
      height: 20px;
      margin: 5px;
    }
    
    .aur-ui-cchooser .lces-colorchooser-modal {
      background: #202326;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.65);
      color: #9CA1A6;
      border: 1px solid #2B2F33;
      margin-top: 8px;
    }
    
    .aur-ui-cchooser .lces-colorchooser-modal.flipped {
      margin-top: -5px;
    }
    
    .aur-ui-cchooser .lces-colorchooser-modal .lces-cc-section.lces-cc-controls {
      background: #141617;
    }
    
    .aur-ui-cchooser .lces-colorchooser-modal .lces-cc-label {
      background: #1A1C1F;
      color: #5e6166;
    }
    
    .aur-ui-cchooser .lces-colorchooser-modal .lces-cc-wheel {
      background-color: #25282B;
    }
    
    .aur-ui-cchooser .lces-colorchooser-modal .lces-cc-cursor {
      background: #202326;
      background-clip: content-box;
      border-color: #98B8D9;
    }
    
    .aur-ui-cchooser .lces-colorchooser-modal .lces-slider {
      margin-top: 10px;
      background: #0B0C0D;
      border-color: #0F1012;
    }
    
    .aur-ui-cchooser .lces-colorchooser-modal .lces-slider .lces-slider-min,
    .aur-ui-cchooser .lces-colorchooser-modal .lces-slider .lces-slider-max {
      color: #54565a;
    }
    
    .aur-ui-cchooser .lces-colorchooser-modal .lces-slider .lces-slider-scrubber {
      background: #6c6e73;
    }
    
    // Dropdown
    .aur-ui-win .lcesdropdown, .aur-ui-win-dropdown-options .lcesdropdown {
      background: #232529;
      border-color: #232529;
      box-sizing: border-box;
      height: 34px;
    }
    
    .aur-ui-win .lcesdropdown .lcesselected {
      line-height: 24px;
      background: #232529;
      font-weight: normal;
      color: #B0B6BF;
    }
    
    .aur-ui-win .lcesdropdown .lcesdropdown-arrow svg path {
      fill: #B0B6BF !important;
    }
    
    .aur-ui-win-dropdown-options .lcesdropdown .lcesoptions {
      background: #1C1D21;
      border-color: #1C1D21;
      border-top: 0px;
      border-bottom: 0px;
    }
    
    .aur-ui-win-dropdown-options .lcesdropdown .lcesoptions .lcesoption {
      box-sizing: border-box;
      line-height: 30px;
      height: auto !important;
      color: #B0B6BF;
      font-weight: normal;
      margin: 0px -2px;
    }
    
    .aur-ui-win-dropdown-options .lcesdropdown .lcesoptions .lcesoption:last-child {
      border-bottom-right-radius: 2.8px;
      border-bottom-left-radius: 2.8px;
    }
    
    .aur-ui-win-dropdown-options .lcesdropdown.flipped .lcesoptions .lcesoption:last-child {
      border-bottom-right-radius: 0px;
      border-bottom-left-radius: 0px;
    }
    
    .aur-ui-win-dropdown-options .lcesdropdown.flipped .lcesoptions .lcesoption:first-child {
      border-top-right-radius: 2.8px;
      border-top-left-radius: 2.8px;
    }
    
    .aur-ui-win-dropdown-options .lcesdropdown .lcesoptions .lcesoption[lces-selected],
    .aur-ui-win-dropdown-options .lcesdropdown .lcesoptions .lcesoption:hover {
      background: #383C42;
    }
    
    .aur-ui-win-dropdown-options .lcesdropdown .lcesoptions .lcesoption::after {
      content: unset !important;
    }
    
    /* Focusing Events */
    .aur-ui-win input.lces::-webkit-input-placeholder, .aur-ui-win textarea.lces::-webkit-input-placeholder {
      color: #2B2F33;
    }
    .aur-ui-win input.lces:-moz-placeholder, .aur-ui-win textarea.lces:-moz-placeholder { /* Firefox 18- */
      color: #2B2F33;
    }
    .aur-ui-win input.lces::-moz-placeholder, .aur-ui-win textarea.lces::-moz-placeholder {  /* Firefox 19+ */
      color: #2B2F33;
    }
    
    /* Scrollbar */
    .aur-ui-win .lces-scrollbar-trough {
      width: 10px;
      background: #1C1E21;
    }
    
    .aur-ui-win .lces-scrollbar-trough:hover, .aur-ui-win .lces-scrollbar-trough.active {
      width: 10px;
      opacity: 1;
    }
    
    .aur-ui-win .lces-scrollbar {
      background: #292C30;
    }
  `);
  
  lces.ui.scrollBarsEnabled = true;
  lces.themify.colorize(41, 44, 48);
});
