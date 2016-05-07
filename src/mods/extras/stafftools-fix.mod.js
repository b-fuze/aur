// Test staff tools
AUR_NAME = "StaffTools Fixes";
AUR_DESC = "Various stafftool fixes";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;

var page = AUR.import("aur-page");

if (page.isEpisode && jSh(".staff-tools")[0]) {
  var report = jSh(".report-video")[0].jSh(".report-button")[0];
  var staffTools = jSh(".staff-tools")[0];
  var staffToolsBtn = jSh.c("span", {
    sel: ".staff-tools-toggle",
    text: " Staff Tools"
  });
  
  // Append to page
  report.parentNode.classList.add("staff-tools-available");
  report.parentNode.insertBefore(
    staffToolsBtn,
    report.nextElementSibling
  );
  
  // Create LCES focused events and handlers
  var staffFocus = lces.new("widget", staffToolsBtn);
  staffFocus.setState("focused", false);
  lces.focus.addMember(staffFocus);
  
  staffTools.component = staffFocus;
  staffFocus.addStateListener("focused", function(focused) {
    if (focused)
      staffTools.classList.add("st-visible");
    else
      staffTools.classList.remove("st-visible");
  });
  
  // Clean up some punctuation and ugly : colons
  staffTools.jSh("b")[0].textContent = "Staff Tools";
  staffTools.jSh("a")[0].textContent = "Delete Mirror";
}
