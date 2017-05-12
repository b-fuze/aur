// AU Style Modue
AUR_NAME = "AU Style Helper Module";
AUR_DESC = "Provides various common helper components for aur-au";
AUR_VERSION = [0, 1];
AUR_AUTHORS = ["Mike32 (b-fuze)"];
AUR_RESTART = true;
AUR_INTERFACE = "auto";

AUR.onLoaded("aur-styles", function() {
  var style = AUR.import("aur-styles");

  style.styleBlock(`
    .aur-busy-spinner::after {
      content: "";
      position: absolute;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      margin: auto auto;
      width: 24px;
      height: 24px;
      
      background: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpath%20d%3D%22M3.67%2016.54C5.286%2019.49%208.415%2021.5%2012%2021.5c5.23%200%209.5-4.27%209.5-9.5S17.23%202.5%2012%202.5c-3.535%200-6.626%201.957-8.262%204.838.27-.433.743-.7%201.254-.705%201.075-.012%201.813%201.076%201.404%202.07C7.522%206.783%209.6%205.5%2012%205.5c3.608%200%206.5%202.892%206.5%206.5s-2.892%206.5-6.5%206.5c-2.392%200-4.463-1.277-5.592-3.186.672%201.753-1.835%202.9-2.722%201.247z%22%20opacity%3D%22.2%22%20fill%3D%22%23000%22%2F%3E%3Cpath%20d%3D%22M4.992%206.633a1.5%201.5%200%200%200-1.306.797C2.928%208.807%202.5%2010.373%202.5%2012v.002c.002%201.624.43%203.185%201.186%204.56a1.5%201.5%200%201%200%202.628-1.447C5.79%2014.162%205.502%2013.098%205.5%2012v-.002c0-1.1.29-2.168.814-3.123a1.5%201.5%200%200%200-1.322-2.242z%22%20fill%3D%22%23fff%22%2F%3E%3C%2Fsvg%3E') no-repeat;
      
      animation-duration: 1s;
      animation-name: aur-ss-spinner;
      animation-iteration-count: infinite;
      animation-timing-function: cubic-bezier(.31,.26,.26,.8);
    }
    
    @keyframes aur-ss-spinner {
      0% {
        transform: rotate(90deg);
      }
      
      100% {
        transform: rotate(450deg);
      }
    }
  `);
});
