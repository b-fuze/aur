// AUR Themify Module
AUR_NAME = "Themify";
AUR_DESC = "Provides a dark color scheme and a more modern look to AU";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = false;

var regs  = reg;
var sett  = AUR.import("aur-settings");
var mtog  = AUR.import("mod-toggle", reg);
var style = AUR.import("aur-styles");

// User Preferences
sett.setDefault("themify", {
  
});

// Set up toggle tracker
// mtog.setting("themify.hideChatango", false);

AUR.on("load", function() {
  var darkThemeBlk = style.styleBlock(style.important(styling));
  
  regs.on("moddisable", function() {
    darkThemeBlk.enabled = false;
  });
  
  regs.on("modenable", function() {
    darkThemeBlk.enabled = true;
  });
});

regs.interface = function() {
  // Do something here...
}

var styling = `
  body {
    background: #0B0C0D;
  }
  
  a {
    color: #006FA6;
  }
  
  a:hover {
    color: #0089CC;
  }
  
  a img:hover {
    opacity: 1;
  }
  
  /* ---------- Header ---------- */
  
  #header-left {
    position: absolute;
    left: 0px;
    top: 10px;
  }
  
  #header-left > a {
    position: relative;
  }
  
  #header-left > .tagline {
    text-align: right;
    color: #525963;
  }
  
  #left-nav > li > a {
    color: #0080BF;
  }
  
  #left-nav li > .ddtitle {
    position: relative;
  }
  
  #left-nav li > .ddtitle > a {
    position: absolute;
    right: 5px;
    top: 6px;
    padding: 0px;
    margin: 0px;
    width: 0px;
    height: 0px;
  }
  
  #left-nav li > .ddtitle > a::before {
    content: "";
    position: relative;
    background: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2218%22%20height%3D%2212%22%3E%3Cpath%20d%3D%22M0%200v.987l9%204.79%209-4.79V0zm0%203.025V12h18V3.025L9.197%207.727%209%207.843l-.197-.116z%22%20fill%3D%22%23ac001c%22%2F%3E%3C%2Fsvg%3E') no-repeat;
    display: inline-block;
    width: 18px;
    height: 12px;
    padding: 2px;
    transform-origin: 50% 50%;
    transform:  translate(-50%, -50%) scale(0.75, 0.75);
    transition: transform 200ms cubic-bezier(.31,.26,.1,.92);
  }
  
  #left-nav li > .ddtitle:hover > a::before {
    transform:  translate(-50%, -50%) scale(1.15, 1.15);
  }
  
  #left-nav li > .ddtitle > a img {
    display: none;
  }
  
  ul#left-nav li ul {
    background: #1E2024;
    border-radius: 2.5px;
    border: 0px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  #top-menu ul#left-nav {
    position: relative;
    left: -13px;
  }
  
  #top-menu span.ddtitle {
    padding: 5px;
    background: transparent;
  }
  
  #top-menu ul li {
    border: 0px;
  }
  
  #top-menu {
    color: #0080BF;
  }
  
  #search > input, #search > button {
    display: inline-block;
    vertical-align: top;
  }
  
  #search > input {
    height: 30px;
    width: 210px;
    border: 0px;
    border-radius: 2.5px;
    padding: 1px 5px;
    background: #1E2124;
    color: #D9D9D9;
  }
  
  #search > button {
    height: 32px;
    background: #206080;
    border-color: #206080;
    margin: 0px;
    margin-left: 10px;
  }
  
  #search {
    margin-top: 9px;
    position: relative;
    right: -20px;
  }
  
  #header-span {
    min-height: 78px;
  }
  
  #header-span, #header-container {
    background: #33373D;
    border: 0px;
  }
  
  #header-container {
    position: relative;
  }
  
  #mini-announcement {
    background: #1E2024;
    padding: 15px;
    width: 975px;
    color: #484E57;
    margin: 20px auto;
    line-height: 1.5em;
    border-left: 10px solid rgb(107, 40, 37) !important;
    box-sizing: border-box;
    width: 1005px !important;
  }
  
  #mini-announcement a {
    color: #5A6373;
  }
  
  ul#coming-soon a, ul#hot-shows a {
    color: #808080;
  }
  
  ul#hot-shows li:nth-child(2) {
    margin-left: 4px;
  }
  
  ul#hot-shows li.li-label {
    background: #484E57;
    color: #C2C5CC
  }
  
  ul#hot-shows {
    color: #737373;
    background: #282B30;
  }
  
  #parent-container {
    background: #1E2024;
    color: #D9D9D9;
    -webkit-border-radius: unset;
    margin-top: 0px;
  }
  
  #parent-container, #mini-announcement {
    border-radius: 5px;
  }
  
  #main-content-hp > div.notice.centered {
    border: 0px;
    border-radius: 2.5px;
    background: #33373D;
    color: #0080BF;
    margin-bottom: 16px;
  }
  
  #main-content-hp > div.notice.centered * {
    color: #0080BF;
  }
  
  h3, h2 {
    color: #808899;
  }
  
  h3 {
    border-color: #3E424A !important;
    padding-left: 0px;
  }
  
  .nr-top, .inline-top {
    border-color: #3E424A;
    padding: 6px;
    padding-left: 0px;
    padding-right: 0px;
  }
  
  #main-content-hp > h3:nth-child(1), #main-content-hp > div.nr-top {
    padding-left: 0px;
  }
  
  .nr-toggle-view.nr-toggle-view-active, .nr-toggle-view.nr-toggle-view-active:hover {
    background: #3E424A;
    color: #D9D9D9;
  }
  
  .nr-toggle-view {
    vertical-align: super;
    position: relative;
    top: 1px;
    color: #797B80;
  }
  
  .nr-toggle-view:hover {
    color: #9D9FA6;
  }
  
  #new-episodes {
    margin-top: 10px;
  }
  
  .generic-video-item div.thumb {
    margin: 5px 0px;
    border-radius: 2px;
    border-color: #3E424A;
    overflow: hidden;
  }
  
  .generic-video-item div.thumb .au-load-error {
    opacity: 0;
  }
  
  .generic-video-item > div.title:nth-child(3)::after {
    content: " - ";
  }
  
  .generic-video-item > div.title:nth-child(3) {
    display: inline;
    font-weight: normal;
    font-size: 10px;
    color: #D9D9D9;
  }
  
  .generic-video-item {
    margin-bottom: 10px;
    color: #F2F2F2;
  }
  
  #new-anime > li::before {
    content: none;
  }
  
  /* ---------- Calendar ---------- */
  
  #fp_calendarview {
    border-spacing: 0px;
  }
  
  #fp_calendarview td.monthname {
    background: #17425a;
    color: inherit;
  }
  
  #fp_calendarview td.day {
    background: #282B30;
    color: #515357;
  }
  
  #fp_calendarview td {
    border-color: #1E2024;
    background: rgba(255, 255, 255, 0.02);
  }
  
  #fp_calendarview td.item {
    padding: 0px;
    background: rgba(255, 255, 255, 0.05);
    transition: border-color 250ms ease-out, background 250ms ease-out;
  }
  
  #fp_calendarview td.item:hover {
    border-color: #7D8796;
    background: rgba(255, 255, 255, 0.065);
  }
  
  #fp_calendarview td.item > em {
    display: inline-block;
  }
  
  #fp_calendarview td.itemtoday {
    border: 1px solid #86ba2c;
  }
  
  #fp_calendarview td div.dnum {
    background: #384626;
    color: #A6A6A6;
    transition: background 250ms ease-out;
  }
  
  #fp_calendarview td:hover div.dnum {
    background: #526d28;
  }
  
  .calt1 {
    border: 1px solid #3e4d59;
    background: #3e4d59;
  }
  
  .calt2 {
    background: #554b42;
    border: 1px solid #554b42;
  }
  
  .calt1:hover {
    border: 1px solid #475866;
    background: #475866;
  }
  
  .calt2:hover {
    background: #61564B;
    border: 1px solid #61564B;
  }
  
  .calt1, .calt2 {
    color: #C3CED9 !important;
  }
  
  .calt1:hover, .calt2:hover {
    color: #E6ECF2 !important;
  }
  
  /* ---------- Newly Added Series ---------- */
  
  #new-anime-div {
    float: none;
    width: auto !important;
  }
  
  #new-anime {
    padding: 0px;
  }
  
  #new-anime li {
    position: relative;
    padding: 7px 5px;
    margin: 0px 0px 10px;
    border: 0px;
    border-left: 5px solid #08090A;
    background: #131417;
    overflow: hidden;
  }
  
  #new-anime h2 {
    margin-bottom: 5px;
  }
  
  #new-anime-div br {
    display: none;
  }
  
  #new-anime .release-date {
    position: absolute;
    right: 0px;
    bottom: 0px;
    padding: 3px 5px;
    border-right: 2px solid #5a2818;
    color: #808080;
  }
  
  /* ---------- New Anime Shows This Season ---------- */
  
  #new-anime-season .pane2, #new-anime-season .pane1 {
    border: 0px;
    background: #33373D;
    border-radius: 2.5px;
  }
  
  /* ---------- Sidebar ---------- */
  
  .text-subbed {
    color: #456B80;
  }
  
  .text-dubbed {
    color: #724080;
  }
  
  ol.standardlist .title a {
    color: #D9D9D9;
  }
  
  ol.standardlist li {
    border-bottom: 1px solid #33373D;
    background: none;
    position: relative;
  }
  
  #ongoing-anime li::before {
    content: "";
    position: absolute;
    left: 8px;
    top: 10px;
    width: 5px;
    height: 5px;
    background: #484E57;
    border-radius: 2px;
  }
  
  div#footer-copy {
    color: lighter;
  }
  
  #footer dd a, div#footer-copy a {
    color:
  }
  
  #footer {
    background: none;
  }
  
  #footer-container {
    border: 0px;
    background: #1E2024;
  }
  
  /* ---------- Episode/Video Page ---------- */
  
  .nextepisode .aur-refactor {
    display: none;
  }
  
  .nextepisode > a {
    font-size: 13px;
    margin: 0px;
  }
  
  .nextepisode > a:not(:first-child) {
    position: absolute;
    right: 0px;
    top: 0px;
    display: inline-block;
  }
  
  .nextepisode > a:nth-child(2) {
    margin: 0px auto;
    left: 0px;
    width: fit-content;
    width: -moz-fit-content;
    width: -webkit-fit-content;
  }
  
  .nextepisode {
    padding: 0px;
    margin-bottom: 10px;
    margin-top: 15px;
    height: 20px;
    position: relative;
    float: none;
  }
  
  #watchlist img {
    display: none;
  }
  
  #watchlist::before {
    content: "Add to Watched List";
  }
  
  #watchlist {
    border-radius: 2px;
    padding: 4px 5px;
    font-size: 11px;
    font-family: Arial;
    font-weight: bold;
    color: #C2C5CC;
    background: #33373D;
  }
  
  #watchlist:hover {
    background: #3E434A;
  }
  
  #lightsoff {
    display: none;
  }
  
  h1 {
    color: #C2C5CC;
  }
  
  .episode-title {
    color: #AAACB3;
  }
  
  .theintro-dubbed, .theintro {
    margin: 15px 0px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    background: #131417;
  }
  
  .theintro-dubbed {
    border-left: 5px solid #84359e;
  }
  
  .theintro {
    border-left: 5px solid #3096ac;
  }
  
  #fb-like {
    width: 360px;
    height: 20px;
    margin-bottom: 10px;
  }
  
  .uploader-info > strong {
    display: inline-block;
    font-size: 1.04166666666666666666em;
    height: 20px;
    width: 125px;
    margin-right: 5px;
    text-align: left;
  }
  
  .uploader-info {
    position: relative;
    height: 75px;
    font-size: 12px;
  }
  
  .uploader-info, #anime-table-info {
    width: 100%;
    box-sizing: border-box;
    margin: 15px 0px;
    border: 0px;
    background: #131417;
    border-radius: 2.5px;
  }
  
  .uploader-info .report-button {
    position: absolute;
    right: 0px;
    bottom: 0px;
    border-bottom-right-radius: 2.5px;
    line-height: 25px;
    padding: 0px 10px;
    // background: rgba(231, 82, 25, 0);
    color: #e75219;
    border: 0px;
    // border-right: 1px solid rgba(231, 82, 25, 0);
    transition: border-color 150ms ease-out, color 150ms ease-out;
  }
  
  #report-form {
    position: absolute;
    left: 0px;
    right: 0px;
    margin: 0px auto;
    z-index: 1000000;
    top: 100%;
    margin-top: 15px;
    background: #1D1F24;
    box-shadow: 0px 7px 12px rgba(0, 0, 0, 0.5) !important;
    border-top: 5px solid #e75219;
  }
  
  #report-form .notice {
    border: 0px;
    text-align: left;
  }
  
  .uploader-info .report-button:hover {
    // background: #e75219;
    // border-color: #e75219;
    color: inherit;
  }
  
  #related-videos .generic-video-item {
    margin-top: 0px;
    margin-bottom: 15px;
  }
  
  /* ---------- Channel Page ---------- */
  
  .nr-content .section {
    position: relative;
  }
  
  #the-latest-episode {
    background: #ff9900;
    color: #fff;
    border-bottom-right-radius: 2.5px;
    border-bottom-left-radius: 2.5px;
  }
  
  #latest-episode-ongoing {
    position: absolute;
    top: 0px;
    right: 0px;
    margin: 0px;
  }
  
  .anime-desc p {
    min-height: 100px;
    max-width: 480px;
  }
  
  #animetable {
    border-spacing: 2px;
  }
  
  #animetable tr:not(.head) {
    line-height: 25px;
  }
  
  #animetable tr.head {
    background: none;
  }
  
  #animetable tr.head td {
    border-bottom: 5px solid #131417;
    background: #131417;
    border-top: 5px solid #131417;
  }
  
  #animetable .epnum, #animetable .airdate, #animetable .not-available {
    color: #484D57;
  }
  
  #animetable td[colspan="2"] {
    color: #3E414A;
  }
  
  table#animetable td.title a {
    color: #F2F2F2;
  }
  
  table#animetable td.td-lang-subbed a {
    color: #c3c5c7;
    background: #303a44;
  }
  
  table#animetable td.td-lang-dubbed a {
    color: #c3c5c7;
    background: #3d3944;
  }
  
  table#animetable td.td-lang-subbed a:hover {
    background: #3A4652;
  }
  
  table#animetable td.td-lang-dubbed a:hover {
    background: #494452;
  }
  
  table#animetable tr:hover td.title, table#animetable tr:hover td.epnum, table#animetable tr:hover td.airdate {
    background: #282b30;
  }
  
  #latest-episode-header {
    background: #131417;
    color: #B6B8BF;
  }
  
  #anime-table-info {
    color: #B6B8BF;
    border-spacing: 0px;
    overflow: hidden;
    padding: 0px;
  }
  
  #anime-table-info .tdhead {
    background: #282930;
    width: 22.5%;
  }
  
  #anime-table-info tr {
    line-height: 25px;
  }
  
  #anime-table-info tr td {
    padding-left: 10px;
    border-bottom: 1px solid #0F0F12;
  }
  
  #anime-table-info tr:first-child td {
    padding-top: 3px;
  }
  
  #anime-table-info tr:last-child td {
    padding-bottom: 3px;
    border: 0px;
  }
  
  #anime-table-info .aur-rss-fix a::before {
    content: "RSS";
    
    display: inline-block;
    padding: 2px 3px;
    margin: 0px 5px 0px 0px;
    font-size: 10px;
    font-weight: bold;
    line-height: 11px;
    
    color: #D9D9D9;
    background: #FF5013;
    border-radius: 1.5px;
  }
  
  #anime-table-info .aur-rss-fix a:hover::before {
    color: #fff;
  }
  
  .anime-desc > p {
    opacity: 0.75;
  }
  
  /* ---------- Comment Textbox ---------- */
  
  .success {
    border: 0px;
    border-left: 5px solid #6ABF19;
    color: #6ABF19;
  }
  
  .error {
    border: 0px;
    border-left: 5px solid #BF1919;
    color: #BF1919;
  }
  
  .notice {
    border: 0px;
    border-left: 5px solid #FFD324;
    color: #FFD324;
  }
  
  .success, .error, .notice {
    margin: 15px 0px;
    background: #131417;
    padding-left: 10px;
  }
  
  #comment-field, #report-form textarea {
    width: 100%;
    box-sizing: border-box;
    margin: 10px 0px 0px;
    min-height: 100px;
    background: #131417;
    border: 0px none;
    border-radius: 0px;
    display: block;
    box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.05) inset !important;
    color: #CFD2D9;
    padding: 10px;
    resize: vertical;
  }
  
  #submit-field {
    margin: 0px 0px 10px;
    border: 0px none;
    width: 100%;
    height: 35px;
    border-bottom-right-radius: 2.5px;
    border-bottom-left-radius: 2.5px;
    cursor: pointer;
    background: #34383D;
    color: #B6B9BF;
  }
  
  .comment-item {
    box-sizing: border-box;
    min-height: 120px;
    border: 0px;
    border-left: 5px solid #131417;
    margin: 10px 0px;
    background: #1A1B1F;
    position: relative;
    color: #B6B9BF;
  }
  
  .comment-item .comment-user {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    left: 0px;
    top: 0px;
    height: 100%;
    width: 134px;
    padding: 0px;
  }
  
  .comment-item .comment-user br {
    display: none;
  }
  
  .comment-item .comment-user a {
    display: inline-block;
    // position: absolute;
    // top: 0px;
    // right: 0px;
    // left: 0px;
    // bottom: 0px;
    // margin: auto auto;
    // width: -moz-fit-content;
    // width: -webkit-fit-content;
    // height: -moz-fit-content;
    // height: -webkit-fit-content;
    // max-height: 80px;
  }
  
  .comment-item .comment-user a img {
    display: block;
    max-height: 80px;
    border: 0px;
    padding: 0px;
  }
  
  .comment-item .comment-content p {
    word-wrap: break-word;
  }
  
  .comment-item > .clear {
    position: absolute;
    z-index: 1000;
    bottom: 0px;
    left: -5px;
    height: 19px;
    width: 100px;
    overflow: hidden;
  }
  
  .comment-item > .clear .mod-delete-comment {
    padding: 0px !important;
    display: inline-block;
    transform: translate(0px, 100%);
    opacity: 0;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
    transition: transform 250ms cubic-bezier(.31,.26,.1,.92), opacity 250ms cubic-bezier(.31,.26,.1,.92);
  }
  
  .comment-item:hover > .clear .mod-delete-comment {
    opacity: 1;
    transform: translate(0px, 0%);
  }
  
  .comment-item > .clear .mod-delete-comment a {
    color: #ffffff !important;
    display: inline-block;
    text-align: center;
    background: rgb(19, 20, 23) none repeat scroll 0% 0%;
    border-left: 5px solid #ff0000;
    padding: 3px 5px !important;
  }
  
  .comment-icons {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 35px;
    margin: 0px;
    height: 100%;
  }
  
  .comment-icons a img {
    opacity: 0;
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
  }
  
  .comment-icons a.like-comment:hover span {
    transform: translateY(-20px);
    opacity: 0;
  }
  
  .comment-icons a.dislike-comment:hover span {
    transform: translateY(20px);
    opacity: 0;
  }
  
  .comment-icons a span {
    position: absolute;
    left: 0px;
    top: 50%;
    margin-top: -5px;
    width: 100%;
    height 50%;
    text-align: center;
    opacity: 0.65;
    transform: translateY(0px);
    transition: opacity 350ms cubic-bezier(.31,.26,.1,.92), transform 350ms cubic-bezier(.31,.26,.1,.92);
  }
  
  .comment-icons a.like-comment:hover::after {
    transform: translateY(0px);
    opacity: 0.65;
  }
  
  .comment-icons a.dislike-comment:hover::after {
    transform: translateY(0px);
    opacity: 0.65;
  }
  
  .comment-icons a.like-comment::after {
    transform: translateY(20px);
    background: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2210%22%3E%3Cpath%20d%3D%22M1.994%208.63l2.5-3%202.5-3%202.5%203%202.5%203%22%20style%3D%22fill%3Anone%3Bstroke%3A%237aa13d%3Bstroke-width%3A2%3Bstroke-miterlimit%3A4%3B%22%2F%3E%3C%2Fsvg%3E') no-repeat;
  }
  
  .comment-icons a.dislike-comment::after {
    transform: translateY(-20px);
    background: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2210%22%3E%3Cpath%20d%3D%22M1.994%201.37l2.5%203%202.5%203%202.5-3%202.5-3%22%20style%3D%22fill%3Anone%3Bstroke%3A%23a12a2a%3Bstroke-width%3A2%3Bstroke-miterlimit%3A4%3B%22%2F%3E%3C%2Fsvg%3E') no-repeat;
  }
  
  .comment-icons a::after {
    content: "";
    width: 14px;
    height: 10px;
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    opacity: 0;
    margin: auto;
    transition: opacity 350ms cubic-bezier(.31,.26,.1,.92), transform 350ms cubic-bezier(.31,.26,.1,.92);
  }
  
  .comment-icons a.like-comment {
    top: 0px;
  }
  
  .comment-icons a.dislike-comment {
    bottom: 0px;
  }
  
  .comment-icons a {
    position: absolute;
    right: 0px;
    width: 100%;
    height: 50%;
    margin: 0px;
    padding: 0px;
    background: rgba(0, 0, 0, 0.1);
  }
  
  .comment-icons a:hover {
    background: rgba(0, 0, 0, 0.2);
  }
  
  .comment-content {
    float: none;
    width: 430px;
    margin-left: 134px;
  }
  
  .comment-item .comment-content > p:last-child strong, .comment-item .comment-content > p:last-child span.time {
    opacity: 0.75;
    transition: opacity 250ms ease-out;
  }
  
  .comment-item:hover .comment-content > p:last-child strong, .comment-item:hover .comment-content > p:last-child span.time {
    opacity: 1;
  }
  
  .comment-content > p:last-child a {
    color: #0a4868;
  }
  
  .comment-content > p:last-child strong::after {
    content: "  \\2014  ";
    color: #454562;
  }
  
  .comment-content > p:last-child br {
    display: none;
  }
  
  .comment-content > p:last-child span.time {
    color: #454562;
  }
  
  /* ---------- Top Comments ---------- */
  
  .comment-content > p > .like-icon-inline {
    display: none;
  }
  
  .comment-content > p > .likes-count {
    position: absolute;
    top: 50%;
    right: 20px;
    width: 35px;
    height: 35px;
    text-align: center;
    margin: 0px;
    padding-top: 9px;
    box-sizing: border-box;
    font-size: 16px;
    border-radius: 100%;
    transform: translateY(-50%);
    color: rgba(121, 161, 61, 0.75);
    opacity: 0.9;
    background: rgba(0, 0, 0, 0.2);
    cursor: default;
  }
`;
