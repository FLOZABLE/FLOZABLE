// Get the list of tabs when the popup is opened
chrome.tabs.query({}, function(tabs) {
  // Find the ul element in the popup
  const tabList = document.getElementById('tab-list');

  // Iterate through each tab and add its domain to the list
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const domain = new URL(tab.url).hostname;

    const li = document.createElement('li');
    li.appendChild(document.createTextNode(domain));
    tabList.appendChild(li);
  }
});
