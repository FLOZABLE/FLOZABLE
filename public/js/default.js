// Spinner
var spinner = function () {
  setTimeout(function () {
    var spinnerElement = document.getElementById('spinner');
    if (spinnerElement) {
      spinnerElement.classList.remove('show');
    }
  }, 1);
};
spinner();

// Initiate the WOW.js library


// Sticky Navbar
window.addEventListener('scroll', function () {
  var navbar = document.querySelector('.navbar');
  if (window.pageYOffset > 45) {
    navbar.classList.add('sticky-top', 'shadow-sm');
  } else {
    navbar.classList.remove('sticky-top', 'shadow-sm');
  }
});