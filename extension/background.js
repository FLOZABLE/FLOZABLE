// background.js
chrome.tabs.query({}, function(tabs) {
  tabs.forEach(function(tab) {
    console.log('Tab URL:', tab.url);
  });
});

chrome.cookies.getAll({ url: 'http://localhost' }, function(cookies) {
  cookies.forEach(function(cookie) {
    console.log('Cookie:', cookie.name, cookie.value);
  });
});

// background.js


let tabUsageData = {};
let lastTime = Date.now();
let prevTabId = false;
let prevTabDomain;
let undefinedTabs = {}

chrome.tabs.onActivated.addListener((activeInfo) => {
  const now = Date.now();
  const tabId = activeInfo.tabId;

  chrome.tabs.get(tabId, async(tab) => {

    let tabDomain;

    if(tab.url == 'chrome://newtab/' || tab.url == ''){
      undefinedTabs[tabId] = {domainState: false};
      tabDomain = tabId;
    } else {
      console.log(tab.url)
      tabDomain = new URL(tab.url).hostname;
      if(undefinedTabs[tabId]) {
        tabUsageData[tabDomain] = tabUsageData[tabId];
        delete tabUsageData[tabId];
        delete undefinedTabs[tabId];
      }
    }

    if (!tabUsageData[tabDomain]) {
      chrome.tabs.get(tabId, (tab) => {
        tabUsageData[tabDomain] = { usageCount: 1, totalTime: 0, lastActiveTime: now, timeline: [[Math.floor(now / 1000)]] };
      });
    } else {
      //update
      tabUsageData[tabDomain].usageCount++;
      tabUsageData[tabDomain].lastActiveTime = now;
      tabUsageData[tabDomain].timeline.push([Math.floor(now / 1000)]);
    }

    if(tabDomain == 'localhost') {
      let response = await fetch('http://localhost/api/update-tabs', {
        method: 'POST',
        headers: {
          'Authorization': 'sdfwpep9p345oD563$SDFksdfkdswt9e9',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({tabUsageData: tabUsageData})
      })
      response = await response.json();
      if(response.success) {
        tabUsageData = {};
        prevTabDomain = false;
        tabDomain = false;
      }

    }

    if(prevTabDomain) {
      tabUsageData[prevTabDomain].totalTime += now - lastTime;
      tabUsageData[prevTabDomain].lastActiveTime = now;
      tabUsageData[prevTabDomain].timeline[tabUsageData[prevTabDomain].timeline.length - 1].push(Math.floor(now / 1000));
    }
    
    lastTime = now;
    prevTabDomain = tabDomain;
  });
});

function getTabUsageData() {
  let usageDataList = Object.values(tabUsageData);
  usageDataList.sort((a, b) => b.usageCount - a.usageCount);
  return JSON.stringify(usageDataList, null, 2);
}


chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
  if (message.command === 'start-monitor') {
    sendResponse({success: true, data: getTabUsageData()});
  } else if(message.command === 'save-data') {
    const response = await fetch('http://localhost/extension', {
      method: 'post',
      data: {}
    })
  }
});