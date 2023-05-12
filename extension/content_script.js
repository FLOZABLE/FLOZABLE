// This script runs in the context of each tab
// Send a message to the background script with this tab's URL
chrome.runtime.sendMessage({ url: window.location.href });
