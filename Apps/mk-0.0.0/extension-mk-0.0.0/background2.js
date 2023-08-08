//no timeline ver

// background.js
chrome.tabs.query({}, function(tabs) {
  tabs.forEach(function(tab) {
    console.log('Tab URL:', tab.url);
  });
});

chrome.cookies.getAll({ url: 'https://flozable.com' }, function(cookies) {
  cookies.forEach(function(cookie) {
    console.log('Cookie:', cookie.name, cookie.value);
  });
});


let tabUsageData = {};
let lastTime = Date.now();
let prevTabId = false;
let prevTabDomain;
let undefinedTabs = [];

//bring today's activity
(async() => {
  let response = await fetch('https://flozable.com/api/bring-tabs', {
    method: 'POST',
    headers: {
      'Authorization': 'sdfwpep9p345oD563$SDFksdfkdswt9e9',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({date: new Date().setHours(0, 0, 0, 0)})
  })
  response = await response.json();
  if(response.success) {
    console.log(response.data)
    if(response.data) {
      tabUsageData = response.data;
      console.log(tabUsageData)
    }
  } else {
    console.log(response.reason)
  }
})();

async function update(){
  let response = await fetch('https://flozable.com/api/update-tabs', {
    method: 'POST',
    headers: {
      'Authorization': 'sdfwpep9p345oD563$SDFksdfkdswt9e9',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({tabUsageData: tabUsageData})
  })
  response = await response.json();
  return response;
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  const now = Date.now();

  //date change detection
  if(new Date(lastTime).setHours(0, 0, 0, 0) != new Date(now).setHours(0, 0, 0, 0)) {
    console.log(new Date(lastTime).setHours(0, 0, 0, 0),new Date(now).setHours(0, 0, 0, 0))
    let response = update();
    if(response.success) {
      tabUsageData = {};
      prevTabDomain = false;
      tabDomain = false;
    }
  }
  const tabId = activeInfo.tabId;

  chrome.tabs.get(tabId, async(tab) => {

    let tabDomain;

    if(tab.url == 'chrome://newtab/' || tab.url == ''){
      /* undefinedTabs[tabId] = {domainState: false};
      tabDomain = tabId; */
      return 0;
    } else {
      tabDomain = new URL(tab.url).hostname;
      /* if(undefinedTabs[tabId]) {
        tabUsageData[tabDomain] = tabUsageData[tabId];
        delete tabUsageData[tabId];
        delete undefinedTabs[tabId];
      } */
    }
    console.log(tabDomain)
    if (!tabUsageData[tabDomain]) {
      chrome.tabs.get(tabId, (tab) => {
        tabUsageData[tabDomain] = { usageCount: 1, totalTime: 0, lastActiveTime: Math.floor(now / 1000)/* , timeline: [[Math.floor(now / 1000)]] */, favicon: tab.favIconUrl};
      });
    } else {
      //update
      tabUsageData[tabDomain].usageCount++;
      tabUsageData[tabDomain].lastActiveTime = Math.floor(now / 1000);
      //tabUsageData[tabDomain].timeline.push([Math.floor(now / 1000)]);
    }

    if(tabDomain == 'flozable.com') {
      let response = update();
      if(response.success) {
        /* tabUsageData = {};
        prevTabDomain = false;
        tabDomain = false; */
        console.log('updated')
      }

    }
    if(prevTabDomain) {
      tabUsageData[prevTabDomain].totalTime += now - lastTime;
      tabUsageData[prevTabDomain].lastActiveTime = Math.floor(now / 1000);
      //tabUsageData[prevTabDomain].timeline[tabUsageData[prevTabDomain].timeline.length - 1].push(Math.floor(now / 1000));
    }
    
    lastTime = now;
    prevTabDomain = tabDomain;
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.active) {
    return 0;
  }
  console.log(changeInfo, tab)
  const now  = Date.now();
  console.log(tabId)
  chrome.tabs.get(tabId, async(tab) => {
    if(tab.url == 'chrome://newtab/' || tab.url == '') {
      undefinedTabs.push(tabId);
      return 0;
    }
    undefinedTabs = undefinedTabs.filter(item => item !== tabId);
    let tabDomain = new URL(tab.url).hostname;
    if(!tabUsageData[tabDomain]) {
      tabUsageData[tabDomain] = { usageCount: 1, totalTime: 0, lastActiveTime: Math.floor(now / 1000)/* , timeline: [[Math.floor(now / 1000)]] */, favicon: tab.favIconUrl};
    } else {
      tabUsageData[tabDomain].usageCount++;
      tabUsageData[tabDomain].lastActiveTime = Math.floor(now / 1000);
      //tabUsageData[tabDomain].timeline.push([Math.floor(now / 1000)]);
    }

    if(prevTabDomain) {
      tabUsageData[prevTabDomain].totalTime += now - lastTime;
      tabUsageData[prevTabDomain].lastActiveTime = Math.floor(now / 1000);
      //abUsageData[prevTabDomain].timeline[tabUsageData[prevTabDomain].timeline.length - 1].push(Math.floor(now / 1000));
    }
    lastTime = now;
    prevTabDomain = tabDomain;
  })
});

function getTabUsageData() {
  let usageDataList = Object.values(tabUsageData);
  usageDataList.sort((a, b) => b.usageCount - a.usageCount);
  return JSON.stringify(usageDataList, null, 2);
}


chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
  const now = Date.now();
  if (message.command === 'start-monitor') {
    sendResponse({success: true, data: getTabUsageData()});
  } else if(message.command === 'tab-timer') {
    const tabDomain = message.domain;
    if(tabUsageData[tabDomain]) {
      if(prevTabDomain == tabDomain) {
        sendResponse({success: true, tabUsageData: {
          usageCount: tabUsageData[tabDomain].usageCount + 1,
          totalTime: tabUsageData[tabDomain].totalTime + now - lastTime,
          lastActiveTime: Math.floor(now / 1000),
          //timeline: tabDomain.timeline
        }})
      } else {
        sendResponse({success: true, tabUsageData: tabUsageData[tabDomain]});
      }
    } else {
      sendResponse({success: false, tabUsageData: {}});
    }
  }
});