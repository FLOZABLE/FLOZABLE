document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage('getTabUsageData', (response) => {
    const tabUsageDataElement = document.getElementById('tabUsageData');
    tabUsageDataElement.textContent = response;
  });
});