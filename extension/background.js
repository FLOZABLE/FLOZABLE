chrome.runtime.onInstalled.addListener(() => {
  console.log("Installed Tab Domain Viewer.");
});

chrome.tabs.query({}, function (tabs) {
  var tabList = "";
  for (var i = 0; i < tabs.length; i++) {
    tabList += tabs[i].url + "\n";
  }
  console.log(tabList);
});
