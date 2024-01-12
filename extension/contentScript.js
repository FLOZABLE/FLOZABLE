const domain = window.location.hostname;

// Define the floating modal HTML and CSS
const modalHTML = `
<div class="extension-container extension-wrapper" draggable="true">
<div class="extension-expand">
  <div class="from">
    <div class="from-contents">
      <div class="timers">
        <div class="timer" id="">
          <div class="disp">
            <p class="domain" id = "domain">test1</p>
            <div class="digits">
              <p class="hr">00:</p>
              <p class="min">00:</p>
              <p class="sec">00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="to">
    <div class="to-contents">
      <div class="top">
        <div class="domain-large" id = "domain-large"></div>
        <div class="x-touch">
          <div class="x">
            <div class="line1"></div>
            <div class="line2"></div>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="row">
          <div class="link">Track this website</div>
          <div class="checkbox-wrapper-5">
            <div class="check">
              <input id="check-5" type="checkbox" checked="true">
              <label for="check-5"></label>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="link"><a href="">Go to study session</a></div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>

`;

const modalCSS = `
.extension-wrapper {
  position: fixed !important;
  z-index: 1000000000 !important;
  width: fit-content !important;
  height: 50px !important;
  border-radius: 100px !important;
  font-family: Arial, Helvetica, sans-serif !important;
  background-color: #fff !important;
  display: flex !important;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px !important;
  top: 0px;
  left: 0px;
}

.extension-wrapper .timers {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0px 45px !important;
  color: orange !important;
}

.extension-wrapper .disp .subject {
  padding: 0px !important;
  margin: 0px !important;
}

.extension-wrapper .disp {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-direction: column !important;
  font-weight: 900 !important;
}

.extension-wrapper span,
.extension-wrapper p {
  padding: 0px !important;
  margin: 0px !important;
}

.extension-wrapper .digits {
  display: flex !important;
  flex-direction: row !important;
}

.extension-wrapper #domain {
  font-size: 20px;
}

.extension-wrapper .checkbox-wrapper-5 .check {
  --size: 40px;

  position: relative;
  background: linear-gradient(90deg, #f19af3, #f099b5);
  line-height: 0;
  perspective: 400px;
  font-size: var(--size);
}

.extension-wrapper .checkbox-wrapper-5 .check input[type="checkbox"],
.extension-wrapper .checkbox-wrapper-5 .check label,
.extension-wrapper .checkbox-wrapper-5 .check label::before,
.extension-wrapper .checkbox-wrapper-5 .check label::after,
.extension-wrapper .checkbox-wrapper-5 .check {
  appearance: none;
  display: inline-block;
  border-radius: var(--size);
  border: 0;
  transition: .35s ease-in-out;
  box-sizing: border-box;
  cursor: pointer;
}

.extension-wrapper .checkbox-wrapper-5 .check label {
  width: calc(2.2 * var(--size));
  height: var(--size);
  background: #d7d7d7;
  overflow: hidden;
}

.extension-wrapper .checkbox-wrapper-5 .check input[type="checkbox"] {
  position: absolute;
  z-index: 1;
  width: calc(.8 * var(--size));
  height: calc(.8 * var(--size));
  top: calc(.1 * var(--size));
  left: calc(.1 * var(--size));
  background: linear-gradient(45deg, #dedede, #ffffff);
  box-shadow: 0 6px 7px rgba(0,0,0,0.3);
  outline: none;
  margin: 0;
}

.extension-wrapper .checkbox-wrapper-5 .check input[type="checkbox"]:checked {
  left: calc(1.3 * var(--size));
}

.extension-wrapper .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label {
  background: transparent;
}

.extension-wrapper .checkbox-wrapper-5 .check label::before,
.extension-wrapper .checkbox-wrapper-5 .check label::after {
  content: "· ·";
  position: absolute;
  overflow: hidden;
  left: calc(.15 * var(--size));
  top: calc(.5 * var(--size));
  height: var(--size);
  letter-spacing: calc(-0.04 * var(--size));
  color: #9b9b9b;
  font-family: "Times New Roman", serif;
  z-index: 2;
  font-size: calc(.6 * var(--size));
  border-radius: 0;
  transform-origin: 0 0 calc(-0.5 * var(--size));
  backface-visibility: hidden;
}

.extension-wrapper .checkbox-wrapper-5 .check label::after {
  content: "●";
  top: calc(.65 * var(--size));
  left: calc(.2 * var(--size));
  height: calc(.1 * var(--size));
  width: calc(.35 * var(--size));
  font-size: calc(.2 * var(--size));
  transform-origin: 0 0 calc(-0.4 * var(--size));
}

.extension-wrapper .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label::before,
.extension-wrapper .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label::after {
  left: calc(1.55 * var(--size));
  top: calc(.4 * var(--size));
  line-height: calc(.1 * var(--size));
  transform: rotateY(360deg);
}

.extension-wrapper .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label::after {
  height: calc(.16 * var(--size));
  top: calc(.55 * var(--size));
  left: calc(1.6 * var(--size));
  font-size: calc(.6 * var(--size));
  line-height: 0;
}

.extension-wrapper .extension-container {
  align-items: center;
  /*       background: #F1EEF1;
  border: 1px solid #D2D1D4;
  */      display: flex;
  height: 360px;
  justify-content: center;
  width: 360px;
}
.extension-wrapper .extension-expand {
  background: #fff;
  border-radius: 16px;
  height: 50px;
  position: relative;
  width: fit-content !important;
  -webkit-tap-highlight-color: transparent;
  transition: width 300ms cubic-bezier(0.4, 0.0, 0.2, 1),
    height 300ms cubic-bezier(0.4, 0.0, 0.2, 1),
    box-shadow 300ms cubic-bezier(0.4, 0.0, 0.2, 1),
    border-radius 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
.extension-wrapper .extension-expand:not(.expand) {
  cursor: pointer;
}
.extension-wrapper .extension-expand:not(.expand):hover {
  background: #f7f5f7;
}
.extension-wrapper .from {
  position: absolute;
  transition: opacity 200ms 100ms cubic-bezier(0.0, 0.0, 0.2, 1);
  border-radius: 100px !important;
  background-color: #fff !important;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px !important;
}
.extension-wrapper .from-contents {
  display: flex;
  flex-direction: row;
  transform-origin: 0 0;
  transition: transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
.extension-wrapper .to {
  opacity: 0;
  height: 64px;
  position: absolute;
  transition: opacity 100ms cubic-bezier(0.4, 0.0, 1, 1);
}
.extension-wrapper .to-contents {
  transform: scale(.55);
  transform-origin: 0 0;
  display: none;
  transition: transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
.extension-wrapper .timers {
  font-size: 14px;
  line-height: 32px;
  margin-left: 10px;
  border: none !important;
}
.extension-wrapper .top {
  background: #6422EB;
  display: flex;
  flex-direction: row;
  height: 70px;
  transition: height 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
  width: 300px;
}
.extension-wrapper .avatar-large {
  border-radius: 21px;
  height: 42px;
  margin-left: 12px;
  position: relative;
  top: 14px;
  width: 42px;
}
.extension-wrapper .domain-large {
  color: #efd8ef;
  font-size: 16px;
  line-height: 70px;
  margin-left: 20px;
}
.extension-wrapper .x-touch {
  align-items: center;
  align-self: center;
  cursor: pointer;
  display: flex;
  height: 50px;
  justify-content: center;
  margin-left: auto;
  width: 50px;
  padding: 10px;
}
.extension-wrapper .x {
  background: #BA87F9;
  border-radius: 10px;
  height: 20px;
  position: relative;
  width: 20px;
}
.extension-wrapper .x-touch:hover .x {
  background: #CB9AFB;
}
.extension-wrapper .line1 {
  background: #6422EB;
  height: 12px;
  position: absolute;
  transform: translateX(9px) translateY(4px) rotate(45deg);
  width: 2px;
}
.extension-wrapper .line2 {
  background: #6422EB;
  height: 12px;
  position: absolute;
  transform: translateX(9px) translateY(4px) rotate(-45deg);
  width: 2px;
}
.extension-wrapper .bottom {
  background: #FFF;
  color:  #444247;
  font-size: 14px;
  height: 200px;
  padding-top: 5px;
  width: 300px;
}
.extension-wrapper .row {
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 60px;
}
.extension-wrapper .medium {
  height: 30px;
  margin-left: 16px;
  position: relative;
  width: 30px;
}
.extension-wrapper .link {
  margin: 0px 16px;
}
.extension-wrapper .link a {
  color:  #444247;
  text-decoration: none;
}
.extension-wrapper .link a:hover {
  color:  #777579;
}
.extension-wrapper .extension-expand.expand {
  border-radius: 6px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.10), 0 6px 6px rgba(0,0,0,0.16);
  height: 200px;
  width: 300px;
}
.extension-wrapper .expand .from {
  opacity: 0;
  transition: opacity 100ms cubic-bezier(0.4, 0.0, 1, 1);
}
.extension-wrapper .expand .from-contents {
  transform: scale(1.91);
}
.extension-wrapper .expand .to {
  opacity: 1;
  transition: opacity 200ms 100ms cubic-bezier(0.0, 0.0, 0.2, 1);
}
.extension-wrapper .expand .to-contents {
  transform: scale(1);
  display: block;
}

.no-track-tab {
  display: none !important;
  z-index: -100 !important;
  opacity: 0 !important;
}
`;

const styleElement = document.createElement('style');
styleElement.textContent = modalCSS;

const containerElement = document.createElement('div');
containerElement.innerHTML = modalHTML;
const domainContainer = containerElement.querySelector('#domain');
const domainLargeContainer = containerElement.querySelector('#domain-large');
domainContainer.innerText = domain;
domainLargeContainer.innerText = domain;


const extensionWrapper = containerElement.querySelector('.extension-wrapper');

const extensionExpandBtn = extensionWrapper.querySelector('.extension-expand');
const extensionCloseBtn = extensionWrapper.querySelector('.x-touch');
let isDragging = false;
let clicked = true;
function mouseDown(e) {
  e.preventDefault();
  isDragging = true;
  //extensionWrapper.style.opacity = "0.8";
}

function mouseUp(e) {
  e.preventDefault();
  if (clicked) {
    extensionExpandBtn.classList.add('expand');
  }
  clicked = true;
  isDragging = false;
  extensionWrapper.style.opacity = "1";
}

function divMoveXY(e) {
  if (isDragging) {
    clicked = false;
    extensionWrapper.style.top = e.clientY + 'px';
    extensionWrapper.style.left = e.clientX + 'px';
  }
}


let timer;
let intervalId;

function syncTimer() {
  chrome.runtime.sendMessage({ command: 'tab-timer', domain: domain }, (response) => {
    console.log(response)
    if (response.success) {
      const seconds = Math.floor(response.tabUsageData.totalTime / 1000);
      timer = {
        sec: Math.floor(seconds % 60),
        min: Math.floor((seconds / (60)) % 60),
        hr: Math.floor((seconds / (60 * 60))),
        run: false,
        secDisp: extensionWrapper.querySelector('.sec'),
        minDisp: extensionWrapper.querySelector('.min'),
        hrDisp: extensionWrapper.querySelector('.hr'),
      }
    } else {
      timer = {
        sec: 0,
        min: 0,
        hr: 0,
        run: false,
        secDisp: extensionWrapper.querySelector('.sec'),
        minDisp: extensionWrapper.querySelector('.min'),
        hrDisp: extensionWrapper.querySelector('.hr'),
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

function removeTracking() {
  clearInterval(intervalId);
  containerElement.classList.add('no-track-tab');
}

function websiteBlocker() {
  console.log('blocked')
}

function createTimerFlozable() {
  document.body.appendChild(styleElement);
  document.body.appendChild(containerElement);
  syncTimer();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(intervalId)
    } else {
      syncTimer();
    }
  })

  document.addEventListener('mousemove', divMoveXY);
  extensionWrapper.addEventListener('mouseup', mouseUp);
  extensionWrapper.addEventListener('mousedown', mouseDown);


  /* extensionExpandBtn.addEventListener('click', () => {
    extensionExpandBtn.classList.add('expand');
  }) */

  const trackBtn = document.getElementById('check-5');

  extensionCloseBtn.addEventListener('click', (event) => {
    extensionExpandBtn.classList.remove('expand');
    event.stopPropagation();
    if (!trackBtn.checked) {
      chrome.runtime.sendMessage({ command: 'update-setting', domain: domain, block : false, timer: false }, (response) => {
        console.log(response)
        if (response.success) {
          removeTracking();
        }
      });
    }
  });

  trackBtn.addEventListener('change', () => {
    console.log(trackBtn.checked)
  });
}

function checkTabSetting() {
  chrome.runtime.sendMessage({ command: 'tab-setting', domain: domain }, async (response) => {
    console.log(response);
    if (response.success) {
      console.log(response.tabSetting);
      const tabSetting = response.tabSetting;
  
      if (!tabSetting) {
        createTimerFlozable();
        containerElement.classList.remove('no-track-tab');
        return 0
      }
      if (tabSetting.timer) {
        createTimerFlozable();
        containerElement.classList.remove('no-track-tab');
      }
  
      if (tabSetting.block) {
        websiteBlocker();
      }
    }
  });
}

checkTabSetting();


document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    checkTabSetting();
  }
})