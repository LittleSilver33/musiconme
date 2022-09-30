const btn = document.getElementById("main-btn"); // Get the button from the page
if (btn) {
  var div = document.querySelector(".fade");
  btn.onclick = function() {
    div.classList.add("elementToFadeInAndOut");
    div.style.zIndex = "7";
    window.location.href = "https://musiconme.glitch.me/login";
  };
}