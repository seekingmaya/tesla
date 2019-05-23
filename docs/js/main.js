import "@babel/polyfill";
import "../scss/main.scss";
import calculateVH from "./vh-fix";
import loadModel from "./tesla";

//fix for scroll bounce
document.body.addEventListener(
  "touchmove",
  function(e) {
    e.preventDefault();
  },
  { passive: false }
);

window.addEventListener("DOMContentLoaded", function() {
  calculateVH();
  loadModel();
});
