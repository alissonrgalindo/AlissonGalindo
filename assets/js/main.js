document.addEventListener("DOMContentLoaded", function(event) {

    let cursor = document.querySelector(".cursor");
    let links = document.querySelectorAll("a");
    let initCursor = false;
  
    for (let i = 0; i < links.length; i++) {
      let selfLink = links[i];
  
      selfLink.addEventListener("mouseover", function() {
        cursor.classList.add("cursor--link");
      });
      selfLink.addEventListener("mouseout", function() {
        cursor.classList.remove("cursor--link");
      });
    }
  
    window.onmousemove = function(e) {
      let mouseX = e.clientX;
      let mouseY = e.clientY;
  
      if (!initCursor) {
        TweenLite.to(cursor, 0.3, {
          opacity: 1
        });
        initCursor = true;
      }
  
      TweenLite.to(cursor, 0, {
        top: mouseY + "px",
        left: mouseX + "px"
      });
    };
  
    window.onmouseout = function(e) {
      TweenLite.to(cursor, 0.3, {
        opacity: 0
      });
      initCursor = false;
    };
  });
  