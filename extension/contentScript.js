const domain = window.location.hostname;
const serverEndPoint = 'http://localhost:3000';

// Define the floating modal HTML and CSS
const timerModalHTML = `
<div id="ExtensionContainer" draggable=true>
<div id="TextsWrapper">
  <div id="DomainContainer">
    google.com
  </div>
  <div id="TimeDisplay">
    <div id="hrDisp">
      00:
    </div>
    <div id="minDsip">
      00:
    </div>
    <div id="secDisp">
      00
    </div>
  </div>
</div>
<div id="clikedDisp">
  <div id="toExtensionSetting">
    <a href=${serverEndPoint}/dashboard/account?website=${domain}>Settings</a>
  </div>
  <div id="toStudySession">
    <a href="">Go to study session</a>
  </div>
</div>
</div>
`;

const timerModalCSS = `
#ExtensionContainer {
  z-index: 99999999999999 !important;
  background-color: #fff!important;
  padding: 5px 40px!important;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px!important;
  width: fit-content!important;
  border-radius: 100px!important;
  transition: .3s box-shadow ease-in-out, .6s transform ease-in-out, visibility .3s ease-in-out, opacity .3s ease-in-out !important;
  cursor: pointer!important;
  position: fixed!important;
  opacity: 0;
  visibility: hidden;
}

#ExtensionContainer.extensionOn {
  opacity: 1;
  visibility: visible;
}

#ExtensionContainer:hover {
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px!important;
}

#ExtensionContainer.clicked {
  transform: rotate3d(1, 1, 1, 360deg)!important;
}

#ExtensionContainer #clikedDisp {
  position: absolute!important;
  top: 0px!important;
  left: 0px!important;
  width: 100%!important;
  height: 100%!important;
  border-radius: 100px!important;
  background-color: #fff!important;
  display: flex!important;
  flex-direction: column!important;
  justify-content: center!important;
  align-items: center!important;
  visibility: hidden!important;
  opacity: 0!important;
  transition: visibility .3s ease-in-out .3s, opacity .3s ease-in-out!important;
}

#ExtensionContainer.clicked #clikedDisp {
  visibility: visible!important;
  opacity: 1!important;
}

#ExtensionContainer #clikedDisp #toExtensionSetting a {
  color: orange!important;
  font-family: Arial, Helvetica, sans-serif!important;
  white-space: nowrap!important;
  font-size: 15px!important;
  font-weight: 800!important;
  text-decoration: none!important;
}

#ExtensionContainer #clikedDisp #toStudySession a {
  white-space: nowrap!important;
  color: orange!important;
  font-family: Arial, Helvetica, sans-serif!important;
  font-size: 15px!important;
  font-weight: 800!important;
  text-decoration: none!important;
}

#ExtensionContainer #clikedDisp #toExtensionSetting a:hover {
  border-bottom: 3px solid orange!important;
}

#ExtensionContainer #clikedDisp #toStudySession a:hover {
  border-bottom: 3px solid orange!important;
}

#ExtensionContainer #TextsWrapper #DomainContainer {
  color: orange!important;
  font-family: Arial, Helvetica, sans-serif!important;
  white-space: nowrap!important;
  font-size: 20px!important;
  font-weight: 900!important;
}

#ExtensionContainer #TextsWrapper #TimeDisplay {
  display: flex!important;
  flex-direction: row!important;
  justify-content: center!important;
  align-items: center!important;
  font-size: 20px!important;
  font-family: Arial, Helvetica, sans-serif!important;
  white-space: nowrap!important;
  color: orange!important;
  font-weight: 900!important;
}
`;

const websiteBlockerHTML = `
<div id="websiteBlocker">
<div id="websiteBlockerWrapper">
  <div>
    <div id="websiteBlockerText">
      <span>Blocked</span>
      <span>Blocked</span>
      <span>Blocked</span>
    </div>
  </div>
  <div id="BottomText">
    <a href=${serverEndPoint}/dashboard/study>Go back to study session</a>
    <a href=${serverEndPoint}/dashboard/account?website=${domain}>
      <svg width="30px" height="30px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#000000">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <g id="Layer_2" data-name="Layer 2">
            <g id="invisible_box" data-name="invisible box">
              <rect width="48" height="48" fill="none"></rect>
              <rect width="48" height="48" fill="none"></rect>
              <rect width="48" height="48" fill="none"></rect>
            </g>
            <g id="icons_Q2" data-name="icons Q2">
              <path
                d="M40.2,29.2l5.5-1.5a23,23,0,0,0,0-7.4l-5.5-1.5a1.8,1.8,0,0,1-1.1-2.6l2.8-5a20.6,20.6,0,0,0-5.1-5.1l-5,2.8-.8.2a1.8,1.8,0,0,1-1.8-1.3L27.7,2.3a23,23,0,0,0-7.4,0L18.8,7.8A1.8,1.8,0,0,1,17,9.1l-.8-.2-5-2.8a20.6,20.6,0,0,0-5.1,5.1l2.8,5a1.8,1.8,0,0,1-1.1,2.6L2.3,20.3a23,23,0,0,0,0,7.4l5.5,1.5a1.8,1.8,0,0,1,1.1,2.6l-2.8,5a20.6,20.6,0,0,0,5.1,5.1l5-2.8.8-.2a1.8,1.8,0,0,1,1.8,1.3l1.5,5.5a23,23,0,0,0,7.4,0l1.5-5.5A1.8,1.8,0,0,1,31,38.9l.8.2,5,2.8a20.6,20.6,0,0,0,5.1-5.1l-2.8-5A1.8,1.8,0,0,1,40.2,29.2ZM24,33a9,9,0,1,1,9-9A9,9,0,0,1,24,33Z">
              </path>
            </g>
          </g>
        </g>
      </svg>
    </a>
  </div>
</div>
</div>
`;

const websiteBlockerCSS = `
#websiteBlocker {
  position: fixed !important;
  top: 0px !important;
  left: 0px !important;
  width: 100vw !important;
  height: 100vh !important;
  background: linear-gradient(to right, #8C52FF, #5C97E6) !important;
  padding: 0px !important;
  margin: 0px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  z-index: 9999999999999999 !important;
  transition: visibility .3s ease-in-out, opacity .3s ease-in-out !important;
  opacity: 0;
  visibility: hidden;
}

#websiteBlocker.websiteBlockerOn {
  opacity: 1;
  visibility: visible;
}

#websiteBlocker #websiteBlockerWrapper {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  font-family: 'Source Sans 3', sans-serif !important;
}

#websiteBlocker #websiteBlockerWrapper #websiteBlockerText {
  position: relative !important;
  transform: prespective(1000px) translate(-50%, -50%) !important;
  transform: skewY(15deg) !important;
  transition: 0.5s !important;
  font-size: 15px !important;
}

#websiteBlocker #websiteBlockerWrapper #websiteBlockerText:hover {
  transform: prespective(1000px) translate(-50%, -50%) !important;
  transform: skewY(0deg) !important;
}

#websiteBlocker #websiteBlockerWrapper #websiteBlockerText span {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  padding: 0 !important;
  text-transform: uppercase !important;
  font-size: 12em !important;
  color: #fff !important;
  transform-style: preserve-3d !important;
  transition: 0.8s !important;
}

#websiteBlocker #websiteBlockerWrapper #websiteBlockerText span:nth-child(1) {
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%) !important;
}



#websiteBlocker #websiteBlockerWrapper #websiteBlockerText span:nth-child(2) {
  color: #5E17EB !important;
  transform: translate(-50%, -50%) skewX(-60deg) !important;
  left: -0.1em !important;
  clip-path: polygon(0 45%, 100% 45%, 100% 55%, 0 55%) !important;
}

#websiteBlocker #websiteBlockerWrapper #websiteBlockerText span:nth-child(3) {
  transform: translate(-50%, -50%) skewY(0deg) !important;
  left: -0.2em !important;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%) !important;
}

#websiteBlocker #websiteBlockerWrapper #websiteBlockerText:hover span:nth-child(2),
#websiteBlocker #websiteBlockerWrapper #websiteBlockerText:hover span:nth-child(3) {
  transform: translate(-50%, -50%) skewX(0deg) !important;
  left: 0 !important;
  color: #fff !important;
}

#websiteBlocker #websiteBlockerWrapper #BottomText {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  position: absolute !important;
  left: 50% !important;
  bottom: 100px !important;
  transform: translateX(-50%) !important;
  color: #fff !important;
  font-weight: 600 !important;
}

#websiteBlocker #websiteBlockerWrapper #BottomText a {
  font-size: 25px !important;
  text-decoration: none !important;
}

#websiteBlocker #websiteBlockerWrapper #BottomText a:nth-child(1) {
  margin-right: 5px !important;
}

#websiteBlocker #websiteBlockerWrapper #BottomText a:visited {
  color: #fff !important;
}
`

let isStudying = false;

//timer modal css/html
const timerModalCSSEl = document.createElement('style');
timerModalCSSEl.textContent = timerModalCSS;

const timerModalContainerEl = document.createElement('div');
timerModalContainerEl.innerHTML = timerModalHTML;

document.body.appendChild(timerModalContainerEl);
document.body.appendChild(timerModalCSSEl);

//website blocker modal css/html
const websiteBLockerModalCSSEl = document.createElement('style');
websiteBLockerModalCSSEl.textContent = websiteBlockerCSS;

const websiteBLockerModalContainerEl = document.createElement('div');
websiteBLockerModalContainerEl.innerHTML = websiteBlockerHTML;

document.body.appendChild(websiteBLockerModalContainerEl);
document.body.appendChild(websiteBLockerModalCSSEl);


const timerModalEl = timerModalContainerEl.querySelector("#ExtensionContainer");
const websiteBlockerModalEl = websiteBLockerModalContainerEl.querySelector("#websiteBlocker");

const domainContainer = timerModalEl.querySelector('#DomainContainer');
domainContainer.innerText = domain;

let isDragging = false;
let clicked = true;

function mouseDown(e) {
  e.preventDefault();
  isDragging = true;
  //extensionWrapper.style.opacity = "0.8";
};

function syncCordinate() {
  /* chrome.storage.sync.set({"FLOZABLE_TIMER_X": 0});
  chrome.storage.sync.set({"FLOZABLE_TIMER_Y": 0}); */
  chrome.storage.sync.get(["FLOZABLE_TIMER_X", "FLOZABLE_TIMER_Y"], ({ FLOZABLE_TIMER_X, FLOZABLE_TIMER_Y }) => {
    timerModalEl.style.top = parseInt(FLOZABLE_TIMER_Y) + 'px';
    timerModalEl.style.left = parseInt(FLOZABLE_TIMER_X) + 'px'
  });
  /* const y = chrome.storage.sync.get({FLOZABLE_TIMER_Y});

  extensionWrapper.style.top = parseInt(x) + 'px';
  extensionWrapper.style.left = parseInt(y) + 'px'; */
};

syncCordinate();

function mouseUp(e) {
  console.log("up")
  e.preventDefault();
  if (clicked) {
    timerModalEl.classList.toggle('clicked');
  } else {
    chrome.storage.sync.set({ "FLOZABLE_TIMER_X": e.clientX });
    chrome.storage.sync.set({ "FLOZABLE_TIMER_Y": e.clientY });
    console.log(e.pageX, e.pageY);
    console.log(e.clientX + window.scrollX, e)
  };

  clicked = true;
  isDragging = false;
}

function divMoveXY(e) {
  if (isDragging) {
    clicked = false;
    timerModalEl.style.top = e.clientY + 'px';
    timerModalEl.style.left = e.clientX + 'px';
  }
}


let timer;
let intervalId;

function syncTimer() {
  chrome.runtime.sendMessage({ command: 'tab-timer', domain: domain }, (response) => {
    if (response.success) {
      const seconds = Math.floor(response.tabUsageData.totalTime / 1000);
      timer = {
        sec: Math.floor(seconds % 60),
        min: Math.floor((seconds / (60)) % 60),
        hr: Math.floor((seconds / (60 * 60))),
        run: false,
        secDisp: timerModalEl.querySelector('#secDisp'),
        minDisp: timerModalEl.querySelector('#minDsip'),
        hrDisp: timerModalEl.querySelector('#hrDisp'),
      }
    } else {
      timer = {
        sec: 0,
        min: 0,
        hr: 0,
        run: false,
        secDisp: timerModalEl.querySelector('#secDisp'),
        minDisp: timerModalEl.querySelector('#minDsip'),
        hrDisp: timerModalEl.querySelector('#hrDisp'),
      }
    }
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      count(timer);
    }, 1000);
  });
}

//syncTimer();

function count(timer) {
  timer.sec += 1;

  if (timer.sec == 60) {
    timer.sec = 0;
    timer.min += 1;
  }

  if (timer.min == 60) {
    timer.min = 0;
    timer.hr += 1;
  }
  disp(timer);
}

function disp(timer) {
  timer.secDisp.innerHTML = timer.sec.toLocaleString(undefined, { minimumIntegerDigits: 2 });
  timer.minDisp.innerHTML = timer.min.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
  timer.hrDisp.innerHTML = timer.hr.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
}

function createTimerFlozable() {
  timerModalEl.classList.add("extensionOn");
  syncTimer();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(intervalId)
    } else {
      syncTimer();
      syncCordinate();
    }
  })

  document.addEventListener('mousemove', divMoveXY);
  document.addEventListener('mouseup', mouseUp);
  timerModalEl.addEventListener('mousedown', mouseDown);
};

function websiteBlocker() {
  websiteBlockerModalEl.classList.add("websiteBlockerOn");
};


function checkTabSetting() {
  chrome.runtime.sendMessage({ command: 'tab-setting', domain: domain }, async (response) => {
    if (response.success) {
      const { tabSetting, isStudying } = response;
      createTimerFlozable();
      if (!tabSetting) return;

      if (tabSetting.t) {
        createTimerFlozable();
      };

      if (tabSetting.b) {
        websiteBlocker();
      };

      if (!isStudying) return;

      if (tabSetting.ts) {
        createTimerFlozable();
      };

      if (tabSetting.bs) {
        websiteBlocker();
      };
    }
  });
}

checkTabSetting();

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    checkTabSetting();
  }
});