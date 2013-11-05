/*
Code from Crossfire-Chrome
https://github.com/mallowlabs/crossfire-chrome

Authors:
  mallowlabs <mallowlabs@gmail.com>
  Volker Eichhorn <volker.eichhorn@gmail.com>
*/
(function(document) {

var defaultBindings = { DOWN: 40, UP: 38, LEFT: 37, RIGHT: 39 }
var viBindings = { DOWN: 74, UP: 75, LEFT: 72, RIGHT: 76 }
var KEY = {};


    KEY = defaultBindings;
    KEY.MODIFIER = 16;

    var xlinks = [];
    var ylinks = [];
    var modifierPressed = false;
    var CROSSFIRE_CHROME_FOCUS = "crossfire-chrome-focus";

    function collectRects() {
      xlinks = []
      ylinks = []
      var ns = document.getElementsByTagName("a") // TODO use XPath
      for (var i = 0,l = ns.length; i < l; i++) {
        if (!(ns[i].hasAttribute("href") && isVisible(ns[i]))) {
          continue; // link which has no href or is not visible should be ignore
        }
        var rect = ns[i].getBoundingClientRect();
        xlinks.push({dom: ns[i], rect: rect});
        ylinks.push({dom: ns[i], rect: rect});
      }
      xlinks.sort(function(a,b) { return getCenter(a.rect).x - getCenter(b.rect).x })
      ylinks.sort(function(a,b) { return getCenter(a.rect).y - getCenter(b.rect).y })
    }

    function getCenter(rect) {
      return {x: rect.left + (rect.width) / 2, y: rect.top + (rect.height) / 2};
    }
    function isVisible(node) {
      var tmp = node;
      while (tmp.tagName != "HTML") {
        var style = document.defaultView.getComputedStyle(tmp, "");
        if (style.display == "none" || style.visibility == "hidden") {
          return false;
        }
        tmp = tmp.parentNode;
      }
      return true;
    }

    /* FIXME too complex ... */
    function isTarget(activeRect, targetRect, axis, direction) {
      if (axis == "x") {
        if (direction == 1 && activeRect.right < targetRect.right) {  // right
          if (targetRect.bottom >= activeRect.top && targetRect.top <= activeRect.bottom) {
        return (targetRect.left - activeRect.right);
          } else if ( (targetRect.bottom < activeRect.top) &&  // up
        (targetRect.left - activeRect.right)  > (activeRect.top - targetRect.bottom)) {
        return (targetRect.left - activeRect.right) + (activeRect.top - targetRect.bottom);
          } else if ( (targetRect.top > activeRect.bottom) && // down
        (targetRect.left - activeRect.right) >  (targetRect.top - activeRect.bottom)) {
        return (targetRect.left - activeRect.right) + (targetRect.top - activeRect.bottom);
          }
        } else if (direction == -1 &&  targetRect.left < activeRect.left) { // left
          if (targetRect.bottom >= activeRect.top && targetRect.top <= activeRect.bottom) {
        return (activeRect.left - targetRect.right);
          } else if ( (targetRect.bottom < activeRect.top) && // up
        (activeRect.left - targetRect.right) > (activeRect.top - targetRect.bottom)) {
        return (activeRect.left - targetRect.right) +  (activeRect.top - targetRect.bottom);
          } else if ( (targetRect.top > activeRect.bottom ) && // down
        (activeRect.left - targetRect.right) > (targetRect.top - activeRect.bottom)) {
        return (activeRect.left - targetRect.right) +(targetRect.top - activeRect.bottom);
          }
        }
      } else if (axis == "y") {
        if (direction == 1 && activeRect.bottom < targetRect.bottom) {  // down
          if (activeRect.left <= targetRect.right && targetRect.left <= activeRect.right) {
        return (targetRect.top - activeRect.bottom);
          } else if ( (targetRect.right < activeRect.left) && // left
        (activeRect.left - targetRect.right) < (targetRect.top - activeRect.bottom)) {
        return (targetRect.top - activeRect.bottom) + (activeRect.left - targetRect.right);
          } else if ( (targetRect.left > activeRect.right) && // right
        (targetRect.left - activeRect.right) < (targetRect.top - activeRect.bottom)) {
        return (targetRect.top - activeRect.bottom) + (targetRect.left - activeRect.right);
          }
        }else if (direction == -1 &&  targetRect.top < activeRect.top) {  // up
          if (targetRect.right >= activeRect.left && targetRect.left <= activeRect.right) {
        return (activeRect.top - targetRect.bottom);
          } else if ( (targetRect.right < activeRect.left) && // left
        (activeRect.left - targetRect.right) < (activeRect.top - targetRect.bottom)) {
        return (activeRect.top - targetRect.bottom) + (activeRect.left - targetRect.right);
          } else if ( (targetRect.left > activeRect.right) && // right
        (targetRect.left - activeRect.right) < (activeRect.top - targetRect.bottom)) {
        return (activeRect.top - targetRect.bottom) + (targetRect.left - activeRect.right) ;
          }
        }
      }
      return -1;
    }

    function navigateNext(links, axis, direction) {
      var active = document.activeElement;
      var ignore = false;
      var activeRect = {left:-100, right:-100, top:-200, bottom:-100};
      if (active.tagName == "A") {
        ignore = true;
        activeRect = active.getBoundingClientRect();
      }
      var start = (direction == 1) ? 0 : links.length - 1;
      var minDistance = -1;
      var nearestNode = null;
      for (var i = start,l = links.length; 0 <= i  && i < l; i += direction) {
        if (!ignore) {
          var distance = isTarget(activeRect, links[i].rect, axis, direction);
          if (distance < 0) continue;
          if (minDistance < 0 || distance < minDistance) {
        minDistance = distance;
        nearestNode = links[i].dom;
          }
        }
        if (links[i].dom == document.activeElement) { //XXX want to use 'active' but not works ...
          ignore = false;
        }
      }
      if (nearestNode) {
        focus(nearestNode);
      }
    }

    function focus(node) {
      node.classList.add(CROSSFIRE_CHROME_FOCUS);
      var listener = node.addEventListener('blur', function(e) {
        node.classList.remove(CROSSFIRE_CHROME_FOCUS);
        node.removeEventListener(listener);
      }, false);
      node.focus();
    }

    function navigateRight() {
      navigateNext(xlinks, "x", 1);
    }
    function navigateLeft() {
      navigateNext(xlinks, "x", -1);
    }
    function navigateDown() {
      navigateNext(ylinks, "y", 1);
    }
    function navigateUp() {
      navigateNext(ylinks, "y", -1);
    }
    document.addEventListener('keyup', function(e) {
      if (document.activeElement.tagName == "INPUT"
       || document.activeElement.tagName == "TEXTAREA") {
         return; // ignore
       }
       switch(e.keyCode) {
        case KEY.MODIFIER:
          modifierPressed = false;
          break;
       }
    }, false);
    document.addEventListener('keydown', function(e) {
      if (document.activeElement.tagName == "INPUT"
       || document.activeElement.tagName == "TEXTAREA") {
         return; // ignore
       }
        console.log("keydown"+e.keyCode);

      switch(e.keyCode) {
        case KEY.MODIFIER:
          modifierPressed = true;
          collectRects();
          break;
        case KEY.DOWN:
        collectRects();
            navigateDown();
            e.preventDefault();
          break;
        case KEY.UP:
        collectRects();
            navigateUp();
            e.preventDefault();
          break;
        case KEY.RIGHT:
        collectRects();
            navigateRight();
            e.preventDefault();
          break;
        case KEY.LEFT:
			collectRects();
            navigateLeft();
            e.preventDefault();
          break;
        default:
          break;
      }
    }, false);
    document.addEventListener('scroll', function(e) {
      if(modifierPressed) {
        collectRects();
      }
    }, false);
  //});
})(document);