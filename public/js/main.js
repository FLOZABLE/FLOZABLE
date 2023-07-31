(function ($) {
  "use strict";

  // Spinner
  var spinner = function () {
      setTimeout(function () {
          if ($('#spinner').length > 0) {
              $('#spinner').removeClass('show');
          }
      }, 1);
  };
  spinner();
  
  
  // Initiate the wowjs
  new WOW().init();


  // Sticky Navbar
  $(window).scroll(function () {
      if ($(this).scrollTop() > 45) {
          $('.navbar').addClass('sticky-top shadow-sm');
      } else {
          $('.navbar').removeClass('sticky-top shadow-sm');
      }
  });


  // Smooth scrolling on the navbar links
  $(".navbar-nav a").on('click', function (event) {
      if (this.hash !== "") {
          event.preventDefault();
          
          $('html, body').animate({
              scrollTop: $(this.hash).offset().top - 45
          }, 300, 'easeInOutExpo');
          
          if ($(this).parents('.navbar-nav').length) {
              $('.navbar-nav .active').removeClass('active');
              $(this).closest('a').addClass('active');
          }
      }
  });
  
  
  // Back to top button
  $(window).scroll(function () {
      if ($(this).scrollTop() > 100) {
          $('.back-to-top').fadeIn('slow');
      } else {
          $('.back-to-top').fadeOut('slow');
      }
  });
  $('.back-to-top').click(function () {
      $('html, body').animate({scrollTop: 0}, 300, 'easeInOutExpo');
      return false;
  });


  // Facts counter
  $('[data-toggle="counter-up"]').counterUp({
      delay: 10,
      time: 2000
  });


  // Screenshot carousel
  $(".screenshot-carousel").owlCarousel({
      autoplay: true,
      smartSpeed: 1000,
      loop: true,
      dots: true,
      items: 1
  });


  // Testimonials carousel
  $(".testimonial-carousel").owlCarousel({
      autoplay: true,
      smartSpeed: 1000,
      loop: true,
      center: true,
      dots: false,
      nav: true,
      navText : [
          '<i class="bi bi-chevron-left"></i>',
          '<i class="bi bi-chevron-right"></i>'
      ],
      responsive: {
          0:{
              items:1
          },
          768:{
              items:2
          },
          992:{
              items:3
          }
      }
  });
  
})(jQuery);

const stepPcBtn = document.querySelector('.steps .btn-1');
const stepMobileBtn = document.querySelector('.steps .btn-2');
const stepPc = document.querySelector('.steps .tab-content #tab-1');
const stepMobile = document.querySelector('.steps .tab-content #tab-2');

stepPcBtn.addEventListener('click', () => {
  stepPcBtn.classList.toggle('active');
  stepMobileBtn.classList.toggle('active');
  stepPc.classList.toggle('active');
  stepMobile.classList.toggle('active');
})

stepMobileBtn.addEventListener('click', () => {
  stepPcBtn.classList.toggle('active');
  stepMobileBtn.classList.toggle('active');
  stepPc.classList.toggle('active');
  stepMobile.classList.toggle('active');
})

const planMonthBtn = document.querySelector('#pricing .btn-1');
const planYearBtn = document.querySelector('#pricing .btn-2');
const planMonth = document.querySelector('#pricing .tab-content #tab-1');
const planYear = document.querySelector('#pricing .tab-content #tab-2');

planMonthBtn.addEventListener('click', () => {
  planMonthBtn.classList.toggle('active');
  planYearBtn.classList.toggle('active');
  planMonth.classList.toggle('active');
  planYear.classList.toggle('active');
})

planYearBtn.addEventListener('click', () => {
  planMonthBtn.classList.toggle('active');
  planYearBtn.classList.toggle('active');
  planMonth.classList.toggle('active');
  planYear.classList.toggle('active');
})

if ('serviceWorker' in navigator) {
  const serviceWorkerRegistered = localStorage.getItem('serviceWorkerRegistered');

  if (!serviceWorkerRegistered) {
    // Register the service worker if it hasn't been registered before
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('./service-worker.js');
        console.log('Service worker registered:', registration);

        // Set the flag to indicate that the service worker has been registered
        localStorage.setItem('serviceWorkerRegistered', 'true');
      } catch (error) {
        console.error('Error registering service worker:', error);
      }
    });
  } else {
    console.log('Service worker has already been registered.');
  }
} else {
  console.log('Service workers are not supported in this browser.');
}

if ('Notification' in window) {
  Notification.requestPermission().then(async(permission) => {
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscribeUserToPush();
      }
    } else if (permission === 'denied') {
      // User has blocked notifications
      // Handle this case accordingly
      console.log('Push notifications are blocked by the user.');
    }
  });
} else {
  console.log('Notifications are not supported in this browser.');
}

async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported in this browser.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BLA00cufFwkKvcgi4-4TEGnZfoKqdQofWox2I4QJk5QCM-7MkTCSjGQE7AhbHAQcx6LbJbuFKe0LDhI4J-krUAY',
    });
    console.log('Subscription:', subscription);
    let response = await fetch('/notification/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({subscription: subscription}),
    });
    response = await response.json();
    console.log(response)
    if (response.success) {
      console.log('success')
    } else {
      console.log('fail')
    }
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
  }
}