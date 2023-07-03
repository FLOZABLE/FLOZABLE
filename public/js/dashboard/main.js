$(window).scroll(function () {
  if ($(this).scrollTop() > 300) {
      $('.back-to-top').fadeIn('slow');
  } else {
      $('.back-to-top').fadeOut('slow');
  }
});


$('.sidebar-toggler').click(function () {
  $('.sidebar, .content').toggleClass("open");
  return false;
});
