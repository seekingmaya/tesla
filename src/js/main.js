import "@babel/polyfill";
import "../scss/main.scss";
import "./vh-fix";
import "./tesla";

//fix for scroll bounce
document.body.addEventListener(
  "touchmove",
  function(e) {
    e.preventDefault();
  },
  { passive: false }
);
