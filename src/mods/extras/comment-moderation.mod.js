// remove all inline styles and use classes/ids
// use appropriate varilable/function names 


var reg = AUR.register("comment-moderation");

var style = AUR.import("aur-styles");

reg.interface = function() {

  this.init = function(){

    var css = `

      .hideElem {
        display: none;
      }

      .hiddenDiv {
        width:100.5%;
        height:100%;
        position:absolute;
        z-index:1000;
        margin:-10px;
        background:green;
        opacity:0;
      }

      .halfOpacity {
        opacity: 0.5;
      }

      .noClicks {
        pointer-events: none;
      }

    `;

    var st = style.styleBlock(css);

    var DeleteMain = lces.template({
      render: jSh.dm({
        class: "aur-bulkdelete-main",
        child: [
          jSh.cm("span", {
            child: [
              jSh.cm("button", ".aur-init-bulkdel", "Bulk Delete"),
              jSh.cm("span", {
                class: ".aur-act-bulkdel.hideElem",
                child: [
                  jSh.cm("button", "aur-act-bulkdel-confirm", "Delete {#commentCount} comment(s)"),
                  jSh.cm("button", "aur-act-bulkdel-cancel", "Cancel Bulk Delete")
                ]
              }),
            ],
            prop: {
              deleting: "{#deleting}"
            }
          })
        ]
      }),
     
      init: function(newElement, ctx) {
        var selectedComments = [];
       
        function deleteSelected() {
          // Do magic with selectedComments...
          // console.log("Sakujo!", selectedComments);
          var finishedRequests = 0;

          for(var i = 0; i < selectedComments.length; i++){
            var comment = selectedComments[i];
            console.log("Deleting...", comment);
            var id = comment.jSh(".like-comment")[0].rel;
           
            var req = new lcRequest({
              method: "GET",
              uri: "/ajax.php",
              query: {
                method: "deletevideocomment",
                commentid: id
              },
              success: done
            })

            req.send();

            function done(){
              finishedRequests++;
              if( finishedRequests === selectedComments.length ){
                cleanUp();
              }
            }

            function cleanUp(){
              for(var i = 0; i < selectedComments.length; i++){
                var comment = selectedComments[i];
                var parent = comment.parentElement;
                
                parent.removeChild(comment);
              }

              selectedComments = [];
              updateCounter();

              jSh("#comment-container").classList.remove("halfOpacity", "noClicks");
              
            }


          }


          // www.animeultima.io/ajax.php?method=deletevideocomment&commentid=

        }

        

        
        var btn1 = newElement.jSh(".aur-init-bulkdel")[0];
        var group = newElement.jSh(".aur-act-bulkdel")[0];
        var cancel = newElement.jSh(".aur-act-bulkdel-cancel")[0];
        var confirm = newElement.jSh(".aur-act-bulkdel-confirm")[0];

        function updateCounter(){
          newElement.mainComponent.commentCount = selectedComments.length;
        }

        btn1.addEventListener("click", function(){
          updateCounter();
          // newElement.mainComponent.commentCount = 0;
          // newElement.mainComponent.commentCount = selectedComments.length;
          btn1.classList.add("hideElem");
          group.classList.remove("hideElem");
          addHiddenDiv();

        })

        cancel.addEventListener("click", function(){
          btn1.classList.remove("hideElem");
          group.classList.add("hideElem");
          removeHiddenDiv();

        })
          
        confirm.addEventListener("click", function() {
          if (!ctx.deleting && selectedComments.length > 0)
            ctx.deleting = true;
          else {
           
          }
        })
       
        ctx.addStateListener("deleting", function(deleting) {
          if (deleting) {
            // Activate
            deleteSelected()
            jSh("#comment-container").classList.add("halfOpacity", "noClicks");
            ctx.deleting = false;
          } else {
            // Deactivate, done deleting
            console.log("All Sakujo'd.");
          }
        })

        function addHiddenDiv(){

          var hiddenDiv = lces.template({
            render: jSh.dm({
              class: ".hiddenDiv"
            }),
            prop: {
              selected: false
            },
            init: function(newHiddenDiv, ctx){
              newHiddenDiv.addEventListener("click", function(){
                if(!newHiddenDiv.selected){

                  selectedComments.push(newHiddenDiv.parentElement);
                  newHiddenDiv.selected = true;
                  newHiddenDiv.classList.add("halfOpacity");
                  
                  updateCounter();
                  // newElement.mainComponent.commentCount++;
                  // newElement.mainComponent.commentCount = selectedComments.length;

                } else {

                  var i = selectedComments.indexOf(newHiddenDiv.parentElement);
                  selectedComments.splice(i, 1);
                  newHiddenDiv.selected = false;
                  newHiddenDiv.classList.remove("halfOpacity");
                  
                  updateCounter();
                  // newElement.mainComponent.commentCount--;
                  // newElement.mainComponent.commentCount = selectedComments.length;
                }
                
              })
            }
          })


          var commentItems = jSh(".comment-item");
          for( var i = 0; i < commentItems.length; i++){
            commentItems[i].insertBefore(new hiddenDiv(), commentItems[i].children[0]);
          }

        }



        function removeHiddenDiv(){
          selectedComments = [];
          // console.log( jSh(".hiddenDiv"));
          var z = jSh(".hiddenDiv");
          for( var i = 0; i < z.length; i++){
            z[i].parentElement.removeChild(z[i]);
          }
        }

      }
    });
     
    jSh("#comment-container").insertBefore(new DeleteMain(), jSh("#comment-container").children[0]);
  }


}