const serverEndPoint = 'http://localhost:3000';

import { io } from "https://cdn.jsdelivr.net/npm/socket.io-client@4.7.1/+esm";

const socket = io(`${serverEndPoint}/extension`, {
  transports: ['websocket', 'polling']
});

socket.on("setting-updated", ({d, target, value}) => {
  const tabSettingIndex = tabSettings.findIndex(tab => tab.d === d);

  if (target === "block") {
    tabSettings[tabSettingIndex] = {...tabSettings[tabSettingIndex], b: value};
  } else {
    tabSettings[tabSettingIndex] = {...tabSettings[tabSettingIndex], t: value};
  }
});

socket.on("setting-created", ({d, block, timer}) => {
  tabSettings.push({d, b: block, t: timer});
  console.log(d, block, timer, tabSettings, 'updated')
});

let tabUsageData = {};
let lastTime = Date.now();
let prevTabId = false;
let prevTabDomain;
let undefinedTabs = [];
let tabSettings = [];

//auth
(async () => {
  fetch(`${serverEndPoint}/extension/auth`, { method: "post" })
  .then((response) => response.json())
  .then((res) => {
    if (res.success) {
      socket.emit('auth', {authId: res.authId});
    }
  })
  .catch((error) => console.error(error));
})();

//bring today's activity
(async () => {
  let response = await fetch(`${serverEndPoint}/extension/today-tabs`, {
    method: 'get',
    headers: {
      'Authorization': 'sdfwpep9p345oD563$SDFksdfkdswt9e9',
      'Content-Type': 'application/json'
    },
  })
  response = await response.json();
  if (response.success) {
    tabUsageData = response.tabs;
  } else {
    console.log(response.reason)
  }
})();


//bring tab's setting
(async () => {
  fetch(`${serverEndPoint}/extension/tabs-settings`, { method: "get" })
  .then((response) => response.json())
  .then((res) => {
    if (res.success) {
      tabSettings = res.tabSettings;
    }
  })
  .catch((error) => console.error(error));
})();

function checkDomainSetting(domain) {
  const tabSetting = tabSettings.find(tabSetting => tabSetting.d.replace(/^www\./, '') === domain.replace(/^www\./, ''));
  return tabSetting;
}

async function updateTabs (domain, duration) {
  socket.emit("update-tabs", {domain, duration});
}

function timerCheck(url, now) {
  if (url == 'chrome://newtab/' || url == '') {
    if (prevTabDomain) {
      tabUsageData[prevTabDomain].totalTime += now - lastTime;
      tabUsageData[prevTabDomain].lastActiveTime = Math.floor(now / 1000);
      //abUsageData[prevTabDomain].timeline[tabUsageData[prevTabDomain].timeline.length - 1].push(Math.floor(now / 1000));
      prevTabDomain = false;
      lastTime = now;
    }
    return 0;
  }
  let domain =  new URL(url).hostname;
  let domainSetting = checkDomainSetting(domain);
  if (domainSetting && !domainSetting.t) {
    if (prevTabDomain) {
      tabUsageData[prevTabDomain].totalTime += now - lastTime;
      tabUsageData[prevTabDomain].lastActiveTime = Math.floor(now / 1000);
      //abUsageData[prevTabDomain].timeline[tabUsageData[prevTabDomain].timeline.length - 1].push(Math.floor(now / 1000));
      prevTabDomain = false;
      lastTime = now;
    }
    return 0
  }
  return 1;
}

function updateTabsInfo(tabId) {
  const now = Date.now();

  //date change detection
  if (new Date(lastTime).setHours(0, 0, 0, 0) != new Date(now).setHours(0, 0, 0, 0)) {
    tabUsageData = {};
    prevTabDomain = false;
    tabDomain = false;
  };
  
  chrome.tabs.get(tabId, async (tab) => {
    if (!timerCheck(tab.url, now)) {
      console.log('filtered', tab.url)
      return 0;
    }
    undefinedTabs = undefinedTabs.filter(item => item !== tabId);
    let tabDomain = new URL(tab.url).hostname;

    if (!tabUsageData[tabDomain]) {
      tabUsageData[tabDomain] = { usageCount: 1, totalTime: 0, lastActiveTime: Math.floor(now / 1000)/* , timeline: [[Math.floor(now / 1000)]] */, favicon: tab.favIconUrl };
    } else {
      tabUsageData[tabDomain].usageCount++;
      tabUsageData[tabDomain].lastActiveTime = Math.floor(now / 1000);
      //tabUsageData[tabDomain].timeline.push([Math.floor(now / 1000)]);
    }
  
    if (prevTabDomain) {
      const duration = now - lastTime;
      tabUsageData[prevTabDomain].totalTime += duration;
      tabUsageData[prevTabDomain].lastActiveTime = Math.floor(now / 1000);
      updateTabs(prevTabDomain, duration);
      //abUsageData[prevTabDomain].timeline[tabUsageData[prevTabDomain].timeline.length - 1].push(Math.floor(now / 1000));
    }
    lastTime = now;
    prevTabDomain = tabDomain;
  })
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateTabsInfo(activeInfo.tabId)
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.active) {
    return 0;
  }
  updateTabsInfo(tabId)
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.command === 'tab-timer') {
    const tabDomain = message.domain;
    if (tabUsageData[tabDomain]) {
      if (prevTabDomain == tabDomain) {
        sendResponse({
          success: true, tabUsageData: {
            usageCount: tabUsageData[tabDomain].usageCount + 1,
            totalTime: tabUsageData[tabDomain].totalTime + now - lastTime,
            lastActiveTime: Math.floor(now / 1000),
            //timeline: tabDomain.timeline
          }
        })
      } else {
        sendResponse({ success: true, tabUsageData: tabUsageData[tabDomain] });
      }
    } else {
      sendResponse({ success: false, tabUsageData: {} });
    }
  } 

  if (message.commad === 'no-track-data') {
    const tabDomain = message.domain;
  }

  if (message.command === 'tab-setting') {
    const tabSetting = checkDomainSetting(message.domain);
    sendResponse({ success: true, tabSetting: tabSetting });
  };
});

  chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
    if (message.command == 'setting_changed') {
      tabSettings = message.activitySettings;
    }
  });