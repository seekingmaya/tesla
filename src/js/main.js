import "../scss/main.scss";
import "./tesla";

//fix for scroll bounce
document.body.addEventListener('touchmove', function(e) { e.preventDefault()}, { passive: false });