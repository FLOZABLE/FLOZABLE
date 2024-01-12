const serverEndPoint = 'http://localhost:3000'

import { io } from "https://cdn.jsdelivr.net/npm/socket.io-client@4.7.1/+esm";

const socket = io(serverEndPoint);

console.log(socket, io);

socket.emit('tab-start');
//no timeline ver

// background.js
chrome.tabs.query({}, function (tabs) {
  tabs.forEach(function (tab) {
    console.log('Tab URL:', tab.url);
  });
});

chrome.cookies.getAll({ url: `${serverEndPoint}` }, function (cookies) {
  cookies.forEach(function (cookie) {
    console.log('Cookie:', cookie.name, cookie.value);
  });
});


let tabUsageData = {};
let lastTime = Date.now();
let prevTabId = false;
let prevTabDomain;
let undefinedTabs = [];
let tabSettings = [];

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
    console.log(response.data)
    if (response.data) {
      tabUsageData = response.tabs;
      console.log(tabUsageData)
    }
  } else {
    console.log(response.reason)
  }
})();


//bring tab's setting
(async () => {
  let response = await fetch(`${serverEndPoint}/extension/bring-activity-setting`, {
    method: 'POST',
    headers: {
      'Authorization': 'sdfwpep9p345oD563$SDFksdfkdswt9e9',
      'Content-Type': 'application/json'
    },
  })
  response = await response.json();
  if (response.success) {
    tabSettings = JSON.parse(response.activitySetting);
    console.log(tabSettings)
  }
})();

function checkDomainSetting(domain) {
  const tabSetting = tabSettings.find(tabSetting => { return tabSetting.domain === domain })
  console.log(tabSetting)
  return tabSetting
}

async function updateTabs (domain, duration) {
  let response = await fetch(`${serverEndPoint}/extension/update-tabs`, {
    method: 'POST',
    headers: {
      'Authorization': 'sdfwpep9p345oD563$SDFksdfkdswt9e9',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ domain, duration })
  })
  response = await response.json();
  console.log(response)
  return response;
}

async function updateTabSettings(domain, block, timer) {
  const tabSetting = tabSettings.find(tabSetting => { return tabSetting.domain === domain });
  if (!tabSetting) {
    tabSettings.push({domain: domain, block: block, timer: timer});
  } else {
    tabSetting.block = block;
    tabSetting.timer = timer;
  }

  let response = await fetch(`${serverEndPoint}/account/update/extension-setting-update`, {
    method: 'POST',
    headers: {
      'Authorization': 'sdfwpep9p345oD563$SDFksdfkdswt9e9',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ activitySettings: tabSettings })
  })
  response = await response.json();
  return response;
}

function timerCheck(url, now) {
  if (url == 'chrome://newtab/' || url == '') {
    console.log(prevTabDomain)
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
  if (domainSetting && !domainSetting.timer) {
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
      console.log('filtered')
      return 0;
    }
    undefinedTabs = undefinedTabs.filter(item => item !== tabId);
    let tabDomain = new URL(tab.url).hostname;

    /* if (new URL(tab.url).origin == serverEndPoint) {
      let response = updateTabs();
      if (response.success) {
        console.log('updated')
      }
    } */

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

function getTabUsageData() {
  let usageDataList = Object.values(tabUsageData);
  usageDataList.sort((a, b) => b.usageCount - a.usageCount);
  return JSON.stringify(usageDataList, null, 2);
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const now = Date.now();
  if (message.command === 'start-monitor') {
    sendResponse({ success: true, data: getTabUsageData() });
  }

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
  } else if (message.commad === 'no-track-data') {
    const tabDomain = message.domain;

  }

  if (message.command === 'tab-setting') {
    const tabSetting = checkDomainSetting(message.domain);
    console.log('tab setting', tabSetting)
    sendResponse({ success: true, tabSetting: tabSetting });
  }

  if (message.command === 'update-setting') {
    //const response = await updateTabSettings(message.domain, message.block, message.timer);
    (async() => {
      const response = await updateTabSettings(message.domain, message.block, message.timer);
      sendResponse(response);
    })();

    return true;
  }
});

  chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
    if (message.command == 'setting_changed') {
      tabSettings = message.activitySettings;
    }
  });