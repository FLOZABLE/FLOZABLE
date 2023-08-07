document.addEventListener("visibilitychange", () => {
  chrome.runtime.sendMessage({command: 'start-monitor'}, (response) => {
    console.log(response);
    if(response.success) {
      console.log(response.data);
    }
  }); 
  if(document.hidden) {

  } else {
    /* chrome.runtime.sendMessage({command: 'save-data'}, (response) => {
      if(response.success) {
        console.log('success');
      }
    });  */
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === 'response') {
    console.log('Received response from the background script:', message.data);
  }
});