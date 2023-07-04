const activeSidebar = document.querySelector('.navbar .main');
activeSidebar.classList.add('active');

const todayTotalContainer = document.getElementById("today-total");
const thisWeekTotalContainer = document.getElementById("thisweek-total");
const thisMonthTotalContainer = document.getElementById("thismonth-total");
const dailyAvgContainer = document.getElementById("avg-daily");
`<img src=data:image/jpeg;base64,<%= account.image %> alt="Admin" class="rounded-circle" width="150"/>`;
(async() => {
  let response = await fetch('/account/bring-my-info', {
    method: 'post',
  });

  response = await response.json();
  const userInfo = response.userInfo;
  let subjects;
  let todayTotal = 0;
  let thisWeekTotal = 0;
  let thisMonthTotal = 0;
  let dailyAvg = 0;

  const now = new Date();
  const currentDay = now.getDay();
  if(response.success) {
    subjects = JSON.parse(userInfo.subjects);
    if(!subjects){
      return 0
    }
    subjects.forEach((subject) => {
      const { name, total, datum_point, timeline, color } = subject;
      let today = filterTimeline(timeline, now.setHours(0, 0, 0, 0), now.setHours(23, 59, 59, 999), datum_point);
      let thisWeek = filterTimeline(timeline, new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDay + 1, 0, 0, 0), new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - currentDay), 23, 59, 59), datum_point);
      let thisMonth = filterTimeline(timeline, new Date(now.getFullYear(), now.getMonth(), 1).getTime(), new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime(), datum_point);
      
      subject.daily = {};
      subject.daily.grouped = timelinesplit(timeline, 1000 * 60 * 60 * 24 , datum_point);
      subject.daily.total = totalRangeTime(subject.daily.grouped);
      //subject.daily.total.max = subject.daily.total.max < subject.daily.total.length ? subject.daily.total.length : subject.daily.total.max;
      //subject.daily.total.max = subject.daily.total.max < subject.daily.total.length || subject.daily.total.max == undefined ? subject.daily.total.length : subject.daily.total.max;
      const dailyAvg = getAvg(timeline);
      subject.today = today[1];
      subject.todayTimeline = today[0];
      subject.thisWeek = thisWeek[1];
      subject.thisWeekTimeline = thisWeek[0];
      subject.thisMonth = thisMonth[1];
      subject.thisMonthTimeline = thisMonth[0];

      todayTotal += today[1];
      thisWeekTotal += thisWeek[1];
      thisMonthTotal += thisMonth[1];
      console.log(subject)
    });
    console.log(subjects)
    subjects.daily = {maxlength: 0};
    subjects.map(subject => {subjects.daily.maxlength = subject.daily.total.length > subjects.daily.maxlength ? subject.daily.total.length : subjects.daily.maxlength})
    console.log(subjects.daily.maxlength)
    todayTotalContainer.innerText = `${Math.floor(todayTotal / 60 / 60 * 10)/ 10}hr`;
    thisWeekTotalContainer.innerText = `${Math.floor(thisWeekTotal / 60 / 60 * 10)/ 10}hr`;
    thisMonthTotalContainer.innerText = `${Math.floor(thisMonthTotal / 60 / 60 * 10)/ 10}hr`;
    dailyAvgContainer.innerText = `${Math.floor(todayTotal / 60 / 60 * 10)/ 10}hr`;

    var ctx1 = document.querySelector("#barchart").getContext("2d");
    var myChart1 = new Chart(ctx1, {
      type: "bar",
      data: {
        labels: subjects[0].daily.grouped.map((period) => { const date  = new Date(period[0][0] * 1000); console.log(date);return `${date.getMonth() + 1}/${date.getDate().toString()}`}),
        datasets: subjects.map(subject => {
          let date = subject.daily.total;
          date = Array(subjects.daily.maxlength - date.length).fill(0).concat(date);
          console.log(date, subject.name, subject.daily.total.max);
          return { label: subject.name, data: date, backgroundColor: subject.color };
        })      
      },
      options: {
        responsive: true
      }
    });


    var ctx2 = document.getElementById("line-chart").getContext("2d");
    var myChart2 = new Chart(ctx2, {
        type: "line",
        data: {
            labels: subjects[0].daily.grouped.map((period) => { const date  = new Date(period[0][0] * 1000); console.log(date);return `${date.getMonth() + 1}/${date.getDate().toString()}`}),
            datasets: subjects.map(subject => {
              let date = subject.daily.total;
              date = Array(subjects.daily.maxlength - date.length).fill(0).concat(date);
              console.log(date, subject.name, subject.daily.total.max);
              return { label: subject.name, data: date, backgroundColor: subject.color + '80', fill: true };
            })   
        },
        options: {
            responsive: true
        }
    });
    var ctx6 = document.getElementById("doughnut-chart").getContext("2d");
    var myChart6 = new Chart(ctx6, {
      type: "doughnut",
      data: {
        labels: subjects.map(subject => subject.name),
        datasets: [{backgroundColor:subjects.map(subject => {
          return subject.color + '80';
        }), data: subjects.map(subject => {
          let data = subject.today;
          return data;
        })}]
      },
      options: {
        responsive: true
      }
    });
    
  }
})();

function filterTimeline(timeline, startTime, endTime, datum_point) {
  const filteredTimeline = timeline.filter(period => {
    const [start, end] = period.map(time => 1000 * (time + datum_point));
    return start >= startTime && end <= endTime;
  });
  let time = 0;
  filteredTimeline.map(period => time += period[1] - period[0]);
  return [filteredTimeline, time]
}

function timelinesplit(timeline, length, datum_point) {
  const splitTime = [];
  
  let currentGroup = [];
  let groupStart = null;
  let groupEnd = null;
  
  timeline.forEach(([start, stop]) => {
    const durationStart = new Date((datum_point + start) * 1000);
    const durationEnd = new Date((datum_point + stop) * 1000);

    if (groupStart === null) {
      groupStart = new Date(datum_point * 1000).setHours(0, 0, 0, 0);
      groupEnd = new Date(groupStart + length);
    }
    
    if (durationStart >= groupStart && durationEnd <= groupEnd) {
      currentGroup.push([durationStart.getTime() / 1000, durationEnd.getTime() / 1000]);
    } else {
      splitTime.push(currentGroup);
      currentGroup = [[durationStart.getTime() / 1000, durationEnd.getTime() / 1000]];
      groupStart = new Date(Math.floor(durationStart.getTime() / length) * length);
      groupEnd = new Date(groupStart.getTime() + length);
    }
  });

  if (currentGroup.length > 0) {
    splitTime.push(currentGroup);
  }

  return splitTime;
}

function totalRangeTime(timeline) {
  let times = [];
  timeline.map((date) => {
    let time = 0;
    date.map(([start, stop]) => {
      time += stop - start;
    })
    times.push(time);
  })
  return times
}


function getAvg(timeline, length) {
  let durration
  timeline.map(period => {
    const [start, end] = period;
  })
}


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
  
  
  // Back to top button
  $(window).scroll(function () {
      if ($(this).scrollTop() > 300) {
          $('.back-to-top').fadeIn('slow');
      } else {
          $('.back-to-top').fadeOut('slow');
      }
  });
  $('.back-to-top').click(function () {
      $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
      return false;
  });


  // Sidebar Toggler
  $('.sidebar-toggler').click(function () {
      $('.sidebar, .content').toggleClass("open");
      return false;
  });


  // Progress Bar
  $('.pg-bar').waypoint(function () {
      $('.progress .progress-bar').each(function () {
          $(this).css("width", $(this).attr("aria-valuenow") + '%');
      });
  }, {offset: '80%'});


  // Calender
  $('#calender').datetimepicker({
      inline: true,
      format: 'L',
      viewMode: 'days'
  });


  // Testimonials carousel
  $(".testimonial-carousel").owlCarousel({
      autoplay: true,
      smartSpeed: 1000,
      items: 1,
      dots: true,
      loop: true,
      nav : false
  });


  // Worldwide Sales Chart
/*   var ctx1 = $("#worldwide-sales").get(0).getContext("2d");
  var myChart1 = new Chart(ctx1, {
      type: "bar",
      data: {
          labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
          datasets: [{
                  label: "USA",
                  data: [15, 30, 55, 65, 60, 80, 95],
                  backgroundColor: "rgba(0, 156, 255, .7)"
              },
              {
                  label: "UK",
                  data: [8, 35, 40, 60, 70, 55, 75],
                  backgroundColor: "rgba(0, 156, 255, .5)"
              },
              {
                  label: "AU",
                  data: [12, 25, 45, 55, 65, 70, 60],
                  backgroundColor: "rgba(0, 156, 255, .3)"
              }
          ]
          },
      options: {
          responsive: true
      }
  }); */


  // Salse & Revenue Chart
/*   var ctx2 = $("#salse-revenue").get(0).getContext("2d");
  var myChart2 = new Chart(ctx2, {
      type: "line",
      data: {
          labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
          datasets: [{
                  label: "Salse",
                  data: [15, 30, 55, 45, 70, 65, 85],
                  backgroundColor: "rgba(0, 156, 255, .5)",
                  fill: true
              },
              {
                  label: "Revenue",
                  data: [99, 135, 170, 130, 190, 180, 270],
                  backgroundColor: "rgba(0, 156, 255, .3)",
                  fill: true
              }
          ]
          },
      options: {
          responsive: true
      }
  }); */
  


  // Single Line Chart
  /* var ctx3 = $("#line-chart").get(0).getContext("2d");
  var myChart3 = new Chart(ctx3, {
      type: "line",
      data: {
          labels: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
          datasets: [{
              label: "Salse",
              fill: false,
              backgroundColor: "rgba(0, 156, 255, .3)",
              data: [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15]
          }]
      },
      options: {
          responsive: true
      }
  }); */

/* 
  // Single Bar Chart
  var ctx4 = $("#bar-chart").get(0).getContext("2d");
  var myChart4 = new Chart(ctx4, {
      type: "bar",
      data: {
          labels: ["Italy", "France", "Spain", "USA", "Argentina"],
          datasets: [{
              backgroundColor: [
                  "rgba(0, 156, 255, .7)",
                  "rgba(0, 156, 255, .6)",
                  "rgba(0, 156, 255, .5)",
                  "rgba(0, 156, 255, .4)",
                  "rgba(0, 156, 255, .3)"
              ],
              data: [55, 49, 44, 24, 15]
          }]
      },
      options: {
          responsive: true
      }
  });


  // Pie Chart
  var ctx5 = $("#pie-chart").get(0).getContext("2d");
  var myChart5 = new Chart(ctx5, {
      type: "pie",
      data: {
          labels: ["Italy", "France", "Spain", "USA", "Argentina"],
          datasets: [{
              backgroundColor: [
                  "rgba(0, 156, 255, .7)",
                  "rgba(0, 156, 255, .6)",
                  "rgba(0, 156, 255, .5)",
                  "rgba(0, 156, 255, .4)",
                  "rgba(0, 156, 255, .3)"
              ],
              data: [55, 49, 44, 24, 15]
          }]
      },
      options: {
          responsive: true
      }
  });


  // Doughnut Chart
  var ctx6 = $("#doughnut-chart").get(0).getContext("2d");
  var myChart6 = new Chart(ctx6, {
      type: "doughnut",
      data: {
          labels: ["Italy", "France", "Spain", "USA", "Argentina"],
          datasets: [{
              backgroundColor: [
                  "rgba(0, 156, 255, .7)",
                  "rgba(0, 156, 255, .6)",
                  "rgba(0, 156, 255, .5)",
                  "rgba(0, 156, 255, .4)",
                  "rgba(0, 156, 255, .3)"
              ],
              data: [55, 49, 44, 24, 15]
          }]
      },
      options: {
          responsive: true
      }
  });
 */
  
})(jQuery);